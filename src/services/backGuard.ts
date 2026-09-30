import { Platform } from 'react-native';

/**
 * 웹 브라우저의 뒤로가기를 한 화면이 가로챌 수 있게 합니다.
 *
 * 웹에서 브라우저 뒤로가기는 라우터 상태를 바로 되돌려서 `beforeRemove`가
 * 오지 않습니다. 그래서 `popstate`를 라우터보다 먼저 듣습니다 — window의
 * 리스너는 등록 순서대로 불리므로, 이 파일은 루트 레이아웃이 가장 먼저
 * import해서 라우터보다 앞서 등록되게 합니다.
 *
 * 가드는 한 번에 하나(RP-3 대화 화면)만 둡니다. true를 돌려주면 이 뒤로가기는
 * 삼키고, 라우터는 아무 일도 없었던 것처럼 남습니다.
 */
let guard: (() => boolean) | null = null;

if (Platform.OS === 'web' && typeof window !== 'undefined') {
  window.addEventListener(
    'popstate',
    (event) => {
      if (guard?.()) event.stopImmediatePropagation();
    },
    { capture: true },
  );
}

/** Returns the remover. Native has no browser Back, so this is a no-op there. */
export function setWebBackGuard(next: () => boolean) {
  guard = next;
  return () => {
    if (guard === next) guard = null;
  };
}
