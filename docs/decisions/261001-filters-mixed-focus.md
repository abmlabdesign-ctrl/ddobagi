# 상황 목록 필터 · Today's focus 혼합 출제 · 말하기 화면 정리

- 날짜: 26-10-01
- 상태: 적용됨
- 정한 사람: 기획 요청, 적용은 Claude (개발 세션)

## 결정

- **RP-1 카드 진행률**: 학습 중(0% 초과 100% 미만)일 때만 바·퍼센트 표시. 학습 전·학습 완료는 숨김.
- **RP-1 필터**: `All`(카테고리) · `Level` · `Status` 세 칩, 각각 바텀시트.
  - Level: All levels / Easy / Medium / Hard
  - Status: All / Not started / In progress / Completed (UI는 영어 문구 규칙에 따름)
  - 고른 값이 칩 이름이 됩니다(예: `Hard`, `In progress`).
- **Today's focus**: 여섯 스킬에서 섞은 10문제. 스킬마다 최소 1문제, 나머지는 무작위, 이웃 문제는 가능하면 다른 스킬.
  지금 데이터(문제 10개)로는 매번 10문제가 모두 나오고 순서만 바뀝니다. 문제가 늘면 무작위로 골라집니다.
  끝나면 스킬별로 기록해 MY-2 통계에 각각 들어갑니다. `Retry`는 새로 섞습니다.
- **ON-3 Level check**: 상단 `Finish` 제거, 녹음 버튼은 롤플레이와 같은 84px 기본 스타일(상태 알약은 유지).
- **RV-2 말하기 문제**: 녹음 버튼 위 세로 막대 띠 제거. 띠가 갖고 있던 위쪽 그림자는 녹음 버튼 영역으로 옮김.

## 영향

`app/(tabs)/roleplay.tsx`, `app/(tabs)/review.tsx`, `app/review/mission.tsx`, `app/onboarding/level-check.tsx`,
`src/services/mixedMission.ts`(신규), `src/data/missions.ts`, `src/store/AppStore.tsx`(`finishMission`이 스킬별 결과를 받음),
`src/components/MicButton.tsx`(`distinctStates` 옵션 제거 — 쓰는 곳이 없어짐).
