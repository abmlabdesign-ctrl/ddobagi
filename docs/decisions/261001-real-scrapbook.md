# 스크랩북은 실제로 저장한 문장만 보여준다

- 날짜: 2026-10-01
- 상태: 적용됨

## 배경

RV-5 Scrapbook은 처음 설치해도 예시 문장 3개(`sp-1`~`sp-3`)가 들어 있었습니다. 롤플레이에서
스크랩한 문장과 섞여 무엇을 내가 저장했는지 알 수 없었고, 개수도 실제와 달랐습니다.

## 결정

- 예시 데이터(`src/data/review.ts`의 `savedPhrases`)를 지우고 스토어의 `savedPhrases`는 빈 배열로 시작합니다.
- 예전 빌드가 기기에 남긴 예시 3개는 복원할 때 id로 걸러냅니다(오답 노트의 `mk-1`~`mk-4`와 같은 방식).
- 데이터 소스는 하나입니다. 롤플레이 길게 누르기 → `Save to Scrapbook`, RV-7 저장 버튼, RP-4 `Save`가 모두
  `AppStore.savePhrase`로 들어가고, 스크랩북은 같은 `savedPhrases`를 읽습니다. 기기 저장소
  (`ddobak/state/v1`, 웹은 localStorage)에 보관하며 서버는 없습니다.
- 스크랩북의 `Delete`는 `removePhrase`로 즉시 지우고, 목록과 개수가 바로 바뀝니다.
- 비어 있으면 `Nothing saved yet` + 저장 방법 한 줄을 보여줍니다. 저장된 게 있으면 `N saved phrases`
  (검색 중이면 `M of N saved phrases`)를 검색창 아래에 적습니다.
