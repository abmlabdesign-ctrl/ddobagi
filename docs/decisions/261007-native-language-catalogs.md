# 9개 언어 번역 카탈로그 · 언어 설정을 Native language 하나로

- 날짜: 26-10-07
- 상태: 적용됨 (번역은 원어민 검수 필요)
- 정한 사람: 기획 요청

## 배경

`Native language`를 바꿔도 화면이 영어 그대로였습니다(번역 데이터가 없었음). 또 Settings에 `App language`가
따로 있어 언어 설정이 두 개처럼 보였습니다.

## 결정

### 번역 리소스

- `src/i18n/catalogs/<code>.ts` — 언어별 파일 하나. **영어 원문이 키**이고 값이 번역입니다.
  vi · zh · ja · mn · uz · ne · id · th · es (English는 원문 그대로).
- `src/i18n/sources.ts` — 번역 대상 원문 목록(지금 140개). 데이터에서 자동으로 모읍니다.
- `scripts/i18n-check.mjs` — 언어별 누락·불필요 항목을 출력합니다. 문제나 대본을 추가하면 이걸로 빠진 번역을 찾습니다.
- 우선순위: 데이터의 `meanings[언어]` → 카탈로그 → 영어.
- LLM·API를 쓰지 않습니다. 번역은 앱에 들어 있습니다.

### 적용 범위 (앱 UI는 영어 유지)

| 대상 | 화면 |
|---|---|
| Show meaning, 대화 기록 뜻 | RP-3 · RP-3b · RV-6 |
| Hint 낱말 뜻 | RP-3 |
| Level check 질문 뜻 | ON-3 |
| 미션 문장 뜻 · `Meaning` · 쓰기 문제 지시문 | RV-2a ~ RV-2e |
| 미션 해설 · 빈칸 설명 · 정답 피드백 | RV-2 피드백 패널 |
| 오답 이유(`Why`) · 교정 문장 뜻 | RV-6 |
| 저장한 표현 뜻 | RV-5 · 상세 |

버튼, 제목, 라벨, `The answer is …`, `Heard: …` 같은 앱 문구는 영어 그대로입니다.

### 언어 설정 통합

- 언어 설정은 `profile.nativeLanguage` **하나**입니다. Settings의 `App language`는 `Native language` 행으로 바꿨고,
  About you(ON-2) · My Page(MY-1) · Edit profile(MY-1b) · Settings(MY-3)가 모두 같은 `NativeLanguageSheet`를 엽니다.
- 고르는 즉시 프로필에 저장되고(AsyncStorage) 모든 화면이 같은 값을 읽으므로, 한 곳에서 바꾸면 다른 화면에도 바로 반영되고
  새로고침·재진입 후에도 유지됩니다.
- `profile.appLanguage`는 없앴습니다. 이전 빌드의 저장 상태에 남은 값은 불러올 때 버립니다.
- 핸드오프의 MY-3 `App language` 행과는 다릅니다. 기획 요청으로 바꾼 것입니다.

## 남은 것

- 9개 언어 모두 원어민 검수 전입니다. 특히 문법 해설(한국어 조각이 섞인 문장)을 확인해 주세요.
- 대본·문제를 추가하면 `scripts/i18n-check.mjs`에 누락으로 잡힙니다. 번역을 채우기 전까지는 영어로 나옵니다.
