import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

/**
 * 한국어 음성 인식(STT).
 *
 * 브라우저 내장 음성 인식을 씁니다 — API 키도, 서버도 필요 없습니다.
 * 그래서 정적 호스팅(GitHub Pages)에 그대로 올라갑니다.
 *
 * 한계를 알고 써야 합니다.
 *  - 웹 전용입니다. iOS·Android 네이티브 앱에는 이 API가 없어서
 *    `supported`가 false가 되고, 화면은 기존 목 동작으로 돌아갑니다.
 *  - Chrome·Edge·Safari에서 동작하고 Firefox에는 없습니다.
 *  - 인식은 브라우저 제공업체 서버에서 이뤄집니다. 인터넷이 필요하고,
 *    음성이 기기 밖으로 나갑니다.
 *  - HTTPS에서만 마이크가 열립니다.
 */

/** 표준 이름과 webkit 접두사 둘 다 본다. */
type RecognitionCtor = new () => RecognitionInstance;

type RecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
};

type RecognitionEvent = {
  resultIndex: number;
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
};

function getCtor(): RecognitionCtor | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  const scope = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition ?? null;
}

export const recognitionSupported = () => getCtor() !== null;

/** 비교용 정규화 — 공백과 문장부호는 발음 판정에 의미가 없다. */
export function normalizeSpeech(value: string) {
  return value.replace(/[\s.,!?~"'·…]/g, '');
}

/**
 * 인식된 문장이 목표 문장과 같은지, 그리고 목표의 몇 번째 낱말까지
 * 말했는지. 낱말 수는 RV-2b가 문장을 따라 불 켜는 데 씁니다.
 */
export function matchSentence(heard: string, targetWords: string[]) {
  const said = normalizeSpeech(heard);
  const target = normalizeSpeech(targetWords.join(''));

  let spoken = 0;
  let cursor = 0;
  for (const word of targetWords) {
    const needle = normalizeSpeech(word);
    if (!needle) {
      spoken += 1;
      continue;
    }
    const at = said.indexOf(needle, cursor);
    if (at === -1) break;
    cursor = at + needle.length;
    spoken += 1;
  }

  return { correct: said.length > 0 && said === target, spokenCount: spoken };
}

export type RecognitionError = 'none' | 'denied' | 'network' | 'nospeech' | 'failed';

/**
 * 인식 중에 불러줄 콜백.
 *
 * 판정을 이펙트가 아니라 여기서 하도록 만든 이유: 이펙트 안에서 상태를
 * 바꾸면 렌더 흐름과 얽히고, 실제로 무엇이 판정을 유발했는지 코드에서
 * 사라집니다. 인식 결과가 도착한 그 자리에서 처리합니다.
 */
export type RecognitionHandlers = {
  /** 말이 들어오는 동안 계속 불립니다. 확정 + 인식 중인 말을 합친 것. */
  onTranscript?: (text: string) => void;
  /** 엔진이 멈췄을 때 한 번. 침묵으로 끊겼거나 오류가 났을 때도 옵니다. */
  onEnd?: (text: string, error: RecognitionError) => void;
};

export function useSpeechRecognition() {
  const [supported] = useState(recognitionSupported);
  const [listening, setListening] = useState(false);
  /**
   * 확정된 말과 아직 다듬어지는 중인 말을 나눠서 들고 있습니다.
   * ON-3 시안이 인식 중인 문장만 오렌지로 칠하기 때문에 합치면 안 됩니다.
   */
  const [settled, setSettled] = useState('');
  const [interim, setInterim] = useState('');
  const [error, setError] = useState<RecognitionError>('none');

  const engine = useRef<RecognitionInstance | null>(null);
  const finalText = useRef('');
  const alive = useRef(true);
  const handlers = useRef<RecognitionHandlers>({});
  /** onEnd는 한 번만 — stop()이 onend를 또 부르기 때문. */
  const ended = useRef(false);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      engine.current?.abort();
      engine.current = null;
    };
  }, []);

  const start = useCallback((next: RecognitionHandlers = {}) => {
    const Ctor = getCtor();
    if (!Ctor) return false;

    engine.current?.abort();
    handlers.current = next;
    ended.current = false;
    finalText.current = '';
    setSettled('');
    setInterim('');
    setError('none');

    const engineInstance = new Ctor();
    engineInstance.lang = 'ko-KR';
    // 문장을 끝까지 말할 시간을 준다. interim은 말하는 중에도 화면에 흘린다.
    engineInstance.continuous = true;
    engineInstance.interimResults = true;
    engineInstance.maxAlternatives = 1;

    engineInstance.onresult = (event) => {
      let pending = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const said = result[0]?.transcript ?? '';
        if (result.isFinal) finalText.current += said;
        else pending += said;
      }
      if (!alive.current) return;
      setSettled(finalText.current);
      setInterim(pending);
      handlers.current.onTranscript?.((finalText.current + pending).trim());
    };

    engineInstance.onerror = (event) => {
      if (!alive.current) return;
      const code = event.error ?? '';
      const reason: RecognitionError =
        code === 'not-allowed' || code === 'service-not-allowed'
          ? 'denied'
          : code === 'network'
            ? 'network'
            : code === 'no-speech'
              ? 'nospeech'
              : 'failed';
      setError(reason);
      setListening(false);
      if (ended.current) return;
      ended.current = true;
      handlers.current.onEnd?.(finalText.current.trim(), reason);
    };

    engineInstance.onend = () => {
      if (!alive.current) return;
      setListening(false);
      if (ended.current) return;
      ended.current = true;
      handlers.current.onEnd?.(finalText.current.trim(), 'none');
    };

    try {
      engineInstance.start();
    } catch {
      setError('failed');
      return false;
    }

    engine.current = engineInstance;
    setListening(true);
    return true;
  }, []);

  const stop = useCallback(() => {
    // 이미 판정한 뒤에 stop()이 onend를 또 부르는 것을 막는다.
    ended.current = true;
    engine.current?.stop();
    setListening(false);
    return (finalText.current || '').trim();
  }, []);

  const reset = useCallback(() => {
    ended.current = true;
    engine.current?.abort();
    handlers.current = {};
    finalText.current = '';
    setSettled('');
    setInterim('');
    setError('none');
    setListening(false);
  }, []);

  return {
    supported,
    listening,
    /** 확정된 부분. 시안의 회색 글자. */
    settled,
    /** 인식 중인 부분. 시안의 오렌지 글자. */
    interim,
    /** 둘을 합친 전체 — 판정에 쓴다. */
    transcript: (settled + interim).trim(),
    error,
    start,
    stop,
    reset,
  };
}

/** 인식이 실패했을 때 화면에 띄울 한 줄. */
export const recognitionMessage: Record<Exclude<RecognitionError, 'none'>, string> = {
  denied: 'Microphone access is off. Allow it, then tap again.',
  network: 'Speech recognition needs an internet connection.',
  nospeech: "We didn't catch that. Tap the mic and try again.",
  failed: 'Speech recognition is unavailable in this browser. Try Chrome or Safari.',
};
