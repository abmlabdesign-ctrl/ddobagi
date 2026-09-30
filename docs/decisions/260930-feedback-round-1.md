# 1차 화면 피드백 반영: 언어 선택 · 대화 저장 · 진행률

- 날짜: 26-09-30
- 상태: 적용됨
- 정한 사람: Claude (개발 세션), 요청은 기획 피드백

## 배경

About you, Level check, 롤플레이, Mistake detail, My Page에 대한 수정 요청 중 시안에 없는 동작을
정해야 하는 항목이 있었습니다.

## 결정

1. **ON-2의 언어 행은 `Native language`로 바꾼다.** 앱 UI는 영어뿐이라 `App language`에는 고를 것이
   없습니다. ON-2 · MY-1 · MY-1b가 같은 `NativeLanguageSheet`(목록은 `nativeLanguageOptions`)를 열고,
   고르는 즉시 프로필에 저장합니다. `App language`는 MY-3 설정에 그대로 있습니다.
2. **ON-2b의 `Not now`는 온보딩을 끝내고 홈으로 간다.** 마이크 없이 레벨 체크를 할 수 없으므로 건너뜁니다.
3. **ON-3 마이크는 켜짐/꺼짐을 버튼 모양으로도 구분한다.** 꺼짐은 흰 버튼 + 주황 마이크, 켜짐은 주황 버튼 +
   정지 사각형, 아래에 `Recording` / `Mic off` 상태 알약. `MicButton`의 `distinctStates` 옵션이며
   다른 화면은 기존 모양 그대로입니다. 0초가 되면 자동 제출하고 ON-4로 갑니다. `Try again`은 답과 타이머를 처음으로 돌립니다.
4. **롤플레이 진행률 = 학습자가 답한 턴 수 / 전체 학습자 턴.** 시작은 0%(바는 얇게 보이는 3%), 끝나면 100%.
   상황 카드에는 저장한 대화는 그 퍼센트, 끝낸 대화는 100%를 보여줍니다. `Status` 필터와 홈의 이어하기 카드는
   100% 미만만 셉니다.
5. **대화 중 나가기는 시트로 묻는다** — `Save and leave` / `Leave without saving` / `Cancel`.
   저장은 `drafts`(AsyncStorage, 기존 상태 저장과 같은 곳)에 들어가고, RP-2에서 `Resume conversation`으로 이어갑니다.
   닫기 버튼, 안드로이드 뒤로가기, iOS 스와이프, 웹 브라우저 뒤로가기 모두 같은 시트를 엽니다.
6. **RV-7 북마크는 토글.** 빈 아이콘 → 채운 아이콘(스크랩북에 저장), 다시 누르면 빼냅니다.
   `Done`을 누르면 그 말풍선이 교정 문장으로 바뀌고 원래 문장은 취소선으로 남습니다(이 화면을 보는 동안만).

## 이유

- 1: 두 화면의 목록과 저장 방식이 갈라지지 않게 하려면 컴포넌트 하나를 같이 쓰는 것이 가장 확실합니다.
- 4: 목표 달성 수(goalsMet)는 "얼마나 잘했나"라서, "얼마나 진행했나"를 묻는 카드 바에는 맞지 않습니다.
- 5: 웹에서 브라우저 뒤로가기는 라우터를 곧장 되돌려 `beforeRemove`가 오지 않습니다. 그래서
  `src/services/backGuard.ts`가 라우터보다 먼저 `popstate`를 듣고, 한 칸 앞으로 되돌린 뒤 시트를 엽니다.

## 영향

- `app/onboarding/setup.tsx`, `microphone.tsx`, `level-check.tsx`
- `app/roleplay/session.tsx`, `[situationId].tsx`, `app/(tabs)/roleplay.tsx`
- `app/review/script/[situationId].tsx`, `app/(tabs)/my.tsx`, `app/my/edit.tsx`
- `src/components/NativeLanguageSheet.tsx`(신규), `MicButton.tsx`, `src/icons/index.tsx`(`BookmarkIcon filled`)
- `src/store/AppStore.tsx`(`drafts`, `saveDraft`, `clearDraft`), `src/store/useSituations.ts`, `src/services/backGuard.ts`(신규)
