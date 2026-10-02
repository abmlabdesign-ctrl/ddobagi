# 대화 기록 History · Done 기준 오류 수 · 독립 스크랩 · 홈 글라스 카드

- 날짜: 2026-10-02
- 상태: 적용됨

## 결정

- **Transcript history** — 끝낸 롤플레이마다 기록 하나(`SessionRecord`)를 남깁니다. 시각은 완료 시점
  `completedAt`이며, `Save and leave`로 남긴 미완료 대화는 들어가지 않습니다. 기기 저장소에 최대 300개.
  `View transcript`(RP-2 · RP-4 · RV-5b)는 상황별 기록 목록을 먼저 열고, 고르면 그 기록의 RV-6을 엽니다.
  기록마다 그 회차에 표시된 오류를 그때 모습 그대로(`mistakes` 스냅숏) 들고 있어, 이전 회차의 "You said"가
  나중 회차로 덮이지 않습니다. 이전 빌드의 마지막 대화는 기록의 첫 항목으로 옮깁니다.
- **Mistake log 숫자** — `Mistakes to review`, 상황별 배지, 알림함·복습 리마인더 모두 "고치지 않았고 `Done`도
  누르지 않은 오류" 수입니다. 열어 보기만 해서는 줄지 않습니다(어제 정한 `read`는 폐기).
  `Done`은 한 번만 반영되고, 다음 롤플레이에서 같은 오류를 또 틀리면 다시 셉니다.
  Mistake log 줄은 그 상황의 열린 오류가 있는 가장 최근 기록으로 바로 갑니다.
- **Mistake log 빈 상태** — 오류가 하나도 없으면 `Pick a situation` 줄과 목록을 숨기고
  `Nothing to review yet` 안내를 보여줍니다. 요약 카드와 `Mistakes you fixed`는 남깁니다.
- **Scrapbook** — 스크랩할 때 문장·뜻·상황 제목·(교정문이면) 실제로 한 말·출처 기록 id를 함께 저장합니다.
  원본 기록이 없어지면 RV-5b의 `View transcript`만 숨깁니다.
- **홈 진행 중 카드** — 흰색 54% + 배경 블러 16px. 위치·크기·문구·그림자는 그대로입니다.
  블러는 웹에서 `backdrop-filter`로 적용되고, iOS·Android 네이티브에서는 반투명 채움만 보입니다.
