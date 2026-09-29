import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioRecorder,
} from 'expo-audio';

/**
 * 학습자 발화 녹음 + 재생.
 *
 * 기기 마이크로 녹음해 방금 말한 것을 바로 들어볼 수 있게 합니다.
 * 웹에서는 MediaRecorder로 가므로 HTTPS에서만 동작합니다 — 브라우저가
 * 안전하지 않은 출처에서는 마이크를 아예 열어주지 않습니다.
 *
 * 채점(STT)은 여기 없습니다. 음성을 글자로 바꾸려면 외부 인식 서비스가
 * 필요하고, 그건 키를 숨길 수 있는 서버가 있어야 합니다.
 */
export type MicPermission = 'unknown' | 'granted' | 'denied';

/** 브라우저가 녹음을 지원하는지. 네이티브는 항상 가능합니다. */
export const recordingSupported =
  Platform.OS !== 'web' ||
  (typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia));

/** The line a screen shows when the mic didn't open. */
export function micMessage(permission: MicPermission) {
  if (!recordingSupported) return 'This browser can’t record. Try Chrome or Safari over https.';
  return permission === 'denied'
    ? 'Microphone access is off. Allow it in your settings, then tap the mic.'
    : 'The mic didn’t start. Tap it again.';
}

export function useVoiceRecorder() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [recording, setRecording] = useState(false);
  const [permission, setPermission] = useState<MicPermission>('unknown');
  const [clipUri, setClipUri] = useState<string | null>(null);
  const player = useAudioPlayer(clipUri ?? undefined);
  const alive = useRef(true);
  const recordingNow = useRef(false);

  // Leaving a screen mid-recording (X, back, timer) must not leave the mic
  // open or iOS in record mode, which keeps playback quiet everywhere after.
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      if (recordingNow.current) {
        recordingNow.current = false;
        try {
          recorder.stop().catch(() => {});
        } catch {
          // The native recorder may already be released with the screen.
        }
      }
      setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(() => {});
    };
  }, [recorder]);

  const start = useCallback(async () => {
    if (!recordingSupported) {
      setPermission('denied');
      return false;
    }
    const granted = await requestRecordingPermissionsAsync()
      .then((response) => response.granted)
      .catch(() => false);

    if (!alive.current) return false;
    setPermission(granted ? 'granted' : 'denied');
    if (!granted) return false;

    // iOS는 무음 스위치가 켜져 있으면 녹음이 잡히지 않으므로 녹음 모드를 연다.
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true }).catch(() => {});
    await recorder.prepareToRecordAsync().catch(() => {});
    recorder.record();
    recordingNow.current = true;
    if (alive.current) setRecording(true);
    return true;
  }, [recorder]);

  const stop = useCallback(async () => {
    recordingNow.current = false;
    await recorder.stop().catch(() => {});
    // 녹음을 끝내면 재생 쪽으로 돌려놔야 iOS에서 소리가 작아지지 않는다.
    await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(() => {});
    if (!alive.current) return null;
    setRecording(false);
    setClipUri(recorder.uri ?? null);
    return recorder.uri ?? null;
  }, [recorder]);

  const toggle = useCallback(async () => {
    if (recording) return stop();
    await start();
    return null;
  }, [recording, start, stop]);

  const playBack = useCallback(() => {
    if (!clipUri) return;
    player.seekTo(0);
    player.play();
  }, [clipUri, player]);

  return { recording, permission, clipUri, hasClip: clipUri !== null, start, stop, toggle, playBack };
}
