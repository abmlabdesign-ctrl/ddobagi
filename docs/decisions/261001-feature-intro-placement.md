# 기능 소개 5장은 약관 동의 뒤, About you 앞에 둔다

- 날짜: 26-10-01
- 상태: 적용됨
- 정한 사람: 기획 요청, 적용은 Claude (개발 세션)

## 배경

시안 `또박이 UI - 00 기능 소개.dc.html`은 기능 소개(IN-1 ~ IN-5)를 ON-1 로그인 **앞**에 두고,
`Skip`·`Get started` 모두 ON-1로 보내도록 적어 두었습니다.

## 결정

- 순서: 로그인 → 약관 동의 → **기능 소개 5장** → About you → 마이크 안내 → Level check → 결과 → 홈
- `Skip`과 마지막 장의 버튼 모두 About you로 이동합니다. 마지막 장 버튼 문구는 `Get started` → `Check my level`.
- 최초 1회만 노출합니다(`introSeen`). 로그아웃해도 이 값은 남겨 두어 다시 나오지 않습니다.
- 화면 디자인과 문구는 시안 그대로입니다. 시안에 없는 동작은 하나뿐입니다: 노트북처럼 스와이프가 없는 환경을 위해 점(dot)을 누르면 해당 장으로 넘어갑니다.

## 이유

기획 요청이 시안의 위치·이동 경로보다 나중이고 구체적이라 그쪽을 따릅니다. 마지막 장 본문이 레벨 체크를 안내하므로
버튼도 그 행동을 그대로 말하게 했습니다.

## 영향

`app/onboarding/intro.tsx`(신규), `app/onboarding/consent.tsx`, `src/data/intro.ts`, `assets/intro/`,
`src/store/AppStore.tsx`(`introSeen`, `finishIntro`), `src/theme/tokens.ts`(intro 색 3개·`shadows.device`).
