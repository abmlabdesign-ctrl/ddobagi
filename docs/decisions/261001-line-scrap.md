# 대화 문장 스크랩: 길게 누르기 → 액션 시트

- 날짜: 26-10-01
- 상태: 적용됨 (`261001-bookmarks-retry-missions.md`의 말풍선 북마크 아이콘을 대체)
- 정한 사람: 기획 요청, 적용은 Claude (개발 세션)

## 결정

- 말풍선 옆 북마크 아이콘을 없애고, **길게 누르기 → 액션 시트**로 통일합니다.
  적용 화면: RP-3(상대 대사), RP-3b(Script 말풍선), RV-6(대화 스크립트, 교정된 문장은 교정 후 문장으로 저장).
- 액션 시트: `Save to Scrapbook` / `Copy` / `Cancel`. 저장하면 `Saved to your Scrapbook` 토스트, 복사하면 `Copied`.
  (UI 문구는 영어 규칙에 따라 옮김: 스크랩하기 → Save to Scrapbook, 복사하기 → Copy, 취소 → Cancel,
  "스크랩북에 저장되었습니다." → Saved to your Scrapbook)
- 첫 진입 안내(RP-3): 제목 `Save phrases you like`, 본문 `Long-press any line or corrected sentence to save it to your Scrapbook.`,
  `Don't show again` 체크박스, `OK` 버튼.
  - 체크 없이 OK: 닫기만 함. 앱을 다시 열면 다시 보입니다(한 번 실행에 한 번).
  - 체크하고 OK: 기기 저장소(`ddobak/tip/line-scrap`, 웹은 localStorage)에 기록하고 다시 보이지 않습니다.
- 저장은 기존 Scrapbook(`savedPhrases`, AsyncStorage)을 그대로 씁니다. 같은 문장은 두 번 저장되지 않습니다.
- 복사는 `expo-clipboard`(웹·iOS·Android 공통)를 씁니다.
