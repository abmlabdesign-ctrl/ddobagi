# 뜻 캡션은 Native language로, 번역이 없으면 영어로

- 날짜: 26-10-07
- 상태: 적용됨 — 번역 데이터와 적용 범위는 [261007-native-language-catalogs](./261007-native-language-catalogs.md)에서 이어짐
- 정한 사람: 기획 요청 — "Native Language 실제 UI 반영"

## 배경

ON-2 · MY-1 · MY-1b에서 고르는 `Native language`가 프로필에 저장만 되고 어느 화면에도 쓰이지 않았습니다.

## 결정

- **바뀌는 것은 한국어 문장의 뜻 캡션뿐입니다.** 버튼·메뉴·안내·설명(`Why`, 미션 해설) 같은 앱 UI는 영어 그대로입니다(§6, `App language`는 English만).
- 뜻은 `useMeaning()`(`src/store/useMeaning.ts`) 하나를 거칩니다. 데이터의 `meanings[모국어]`가 있으면 그 값을, 없거나 모국어가 English면 `english`를 보여줍니다.
- 이번에는 **구조만** 넣었습니다. `src/data/`에 번역은 아직 없어서 지금 화면은 전과 똑같이 영어로 보입니다.
  번역은 AI 대화 생성을 붙일 때 응답의 `meaning`으로 받거나(`docs/ai-prompts/conversation.md`), 대본 데이터에 언어별로 채웁니다.
  한 줄, 한 언어씩 채워도 됩니다. 화면은 고치지 않아도 됩니다.

### 적용되는 곳

| 화면 | 캡션 |
|---|---|
| ON-3 Level check | 질문 뜻 (`levelCheckQuestion.meanings`) |
| RP-3 · RP-3b | `Show meaning`, 대화 기록 말풍선 뜻, `Hint` 낱말 뜻 (`Turn.meanings`, `hintWords[].meanings`) |
| RV-2a/2b | 말하기 문장 뜻 (`SpeakQuestion.meanings`) |
| RV-2c/2e | 선택형 질문의 `Meaning` (`ChoiceQuestion.promptMeanings`) |
| RV-6 | 대화 기록 뜻, 교정 문장 뜻 (`Mistake.said/suggested.meanings`) |
| RV-5 · 저장한 표현 상세 | 저장한 표현 뜻 (`SavedPhrase.meanings`) — 저장할 때 함께 복사되고, 검색도 이 뜻으로 됩니다 |

- 학습자가 대본과 다르게 말한 줄은 영어 뜻을 지우던 그대로 모국어 뜻도 지웁니다(말한 내용과 맞지 않으므로).

## 제외한 것

- **RV-2d 쓰기 미션의 `prompt`** — 뜻과 지시문("Write it in Korean", 상황 설명)이 섞여 있어 뜻 캡션으로 나누지 않았습니다.
- 앱 UI 전체 번역(i18n).

## 남은 것

- 10개 언어 번역 데이터. 사람이 번역한다면 원어민 검수를 거친 뒤 넣습니다.
