import { useCallback, useEffect, useRef, useState } from 'react';
import * as Speech from 'expo-speech';

/**
 * 한국어 음성 출력(TTS).
 *
 * 기기/브라우저에 내장된 음성 합성을 씁니다. 서버도 API 키도 필요 없고,
 * 웹에서는 `window.speechSynthesis`, iOS·Android에서는 OS 음성 엔진으로 갑니다.
 *
 * 학습용이라 원어민 속도보다 느리게 읽습니다. 한 번에 한 문장만 나오도록
 * 새 발화를 시작하기 전에 이전 발화를 멈춥니다 — 목록에서 스피커 버튼을
 * 연달아 누르면 소리가 겹치기 때문입니다.
 */
export const SPEECH_LANGUAGE = 'ko-KR';

/** 문장은 또박또박, 낱말은 조금 더 천천히 — 발음 확인이 목적이라서. */
export const RATE_SENTENCE = 0.85;
export const RATE_WORD = 0.7;

export type SpeakOptions = {
  /** 낱말 하나를 읽을 때는 `word`. 기본은 문장. */
  scale?: 'sentence' | 'word';
  onStart?: () => void;
  onDone?: () => void;
};

export function stopSpeaking() {
  Speech.stop();
}

export function speak(text: string, options: SpeakOptions = {}) {
  const { scale = 'sentence', onStart, onDone } = options;
  if (!text.trim()) return;

  // 겹쳐 읽지 않도록 항상 먼저 끊는다.
  Speech.stop();
  Speech.speak(text, {
    language: SPEECH_LANGUAGE,
    rate: scale === 'word' ? RATE_WORD : RATE_SENTENCE,
    onStart,
    onDone,
    onStopped: onDone,
    onError: onDone,
  });
}

/**
 * 여러 문장을 순서대로 읽습니다 — 대화 스크립트 재생용.
 *
 * 음성 합성은 발화를 큐에 쌓으므로, 맨 앞에서 한 번만 끊고 차례로 넣습니다.
 */
export function speakSequence(lines: string[], onDone?: () => void) {
  const queue = lines.map((line) => line.trim()).filter(Boolean);
  if (queue.length === 0) return;

  Speech.stop();
  queue.forEach((line, index) => {
    Speech.speak(line, {
      language: SPEECH_LANGUAGE,
      rate: RATE_SENTENCE,
      // 마지막 문장이 끝났을 때만 재생이 끝난 것으로 본다.
      onDone: index === queue.length - 1 ? onDone : undefined,
      onStopped: index === queue.length - 1 ? onDone : undefined,
      onError: index === queue.length - 1 ? onDone : undefined,
    });
  });
}

/**
 * 이 기기에 한국어 음성이 깔려 있는지.
 *
 * 웹은 음성 목록이 비동기로 채워져서 첫 호출이 빈 배열을 주는 일이 있습니다.
 * 그래서 짧은 간격으로 몇 번 다시 확인합니다.
 */
export async function hasKoreanVoice(): Promise<boolean> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      if (voices.some((voice) => voice.language?.toLowerCase().startsWith('ko'))) return true;
      if (voices.length > 0 && attempt >= 2) return false;
    } catch {
      return false;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return false;
}

/**
 * 화면에서 쓰는 훅.
 *
 * `speaking`은 스피커 버튼을 눌린 상태로 보여줄 때 씁니다.
 * `koreanVoice`가 false면 기기에 한국어 음성이 없어 소리가 나지 않습니다.
 */
export function useSpeaker() {
  const [speaking, setSpeaking] = useState(false);
  const [koreanVoice, setKoreanVoice] = useState<boolean | null>(null);
  // 화면을 떠난 뒤 콜백이 늦게 도착해도 setState 하지 않도록.
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    hasKoreanVoice().then((available) => {
      if (alive.current) setKoreanVoice(available);
    });
    return () => {
      alive.current = false;
      Speech.stop();
    };
  }, []);

  const say = useCallback((text: string, scale: SpeakOptions['scale'] = 'sentence') => {
    speak(text, {
      scale,
      onStart: () => alive.current && setSpeaking(true),
      onDone: () => alive.current && setSpeaking(false),
    });
  }, []);

  const stop = useCallback(() => {
    Speech.stop();
    setSpeaking(false);
  }, []);

  return { say, stop, speaking, koreanVoice };
}
