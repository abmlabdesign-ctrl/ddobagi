# 또박 (Ddobak)

외국인 학습자가 **실제 상황을 롤플레이하며 한국어로 말하고, AI 피드백으로 약점을 교정**하는 모바일 앱입니다.
디자인 핸드오프(`docs/design-handoff.md`)의 화면 전체를 Expo(React Native) + TypeScript로 구현했습니다.

앱 UI는 영어, 학습 콘텐츠는 한국어인 **이중 언어 구조**입니다. 이 구분이 제품의 핵심 규칙이며 아래 "정보 노출 원칙"에 정리했습니다.

## 기술 스택

| | |
|---|---|
| 런타임 | Expo SDK 57 · React Native 0.86 · React 19 |
| 언어 | TypeScript (strict) |
| 라우팅 | expo-router (파일 기반, typed routes) |
| 그래픽 | react-native-svg · expo-linear-gradient |
| 애니메이션 | react-native-reanimated 4 |
| 린트 | ESLint (eslint-config-expo) |

## 시작하기

```bash
npm install
npm start          # Expo 개발 서버 (iOS / Android / web 선택)
npm run ios        # iOS 시뮬레이터 (macOS 필요)
npm run android    # Android 에뮬레이터
npm run web        # 브라우저 (react-native-web)
```

검증:

```bash
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm run export:web # 웹 번들 — 모든 라우트가 컴파일되는지 확인
```

## 화면 구성

라우트는 `app/` 아래 파일 구조가 그대로 내비게이션이 됩니다.

| 화면 | ID | 라우트 |
|---|---|---|
| Sign up / Log in | ON-1 | `app/onboarding/sign-in.tsx` |
| Setup (About you) | ON-2 | `app/onboarding/setup.tsx` |
| 1-minute AI level check | ON-3 | `app/onboarding/level-check.tsx` |
| Your results | ON-4 | `app/onboarding/results.tsx` |
| Home | HM-1 | `app/(tabs)/index.tsx` |
| Browse situations | RP-1 | `app/(tabs)/roleplay.tsx` |
| Scenario detail | RP-2 | `app/roleplay/[situationId].tsx` |
| Live AI conversation + Live script | RP-3 / RP-3b | `app/roleplay/session.tsx` |
| Report | RP-4 | `app/roleplay/report.tsx` |
| Micro missions · Mistake log · Scrapbook | RV-1 / RV-3a / RV-5 | `app/(tabs)/review.tsx` |
| 미션 유형 6종 + 완료 | RV-2 ~ RV-2f | `app/review/mission.tsx` |
| Mistakes by situation | RV-3 | `app/review/mistakes/[situationId].tsx` |
| Saved phrase 상세 | RV-5b | `app/review/phrase/[phraseId].tsx` |
| Mistake script + 인라인 상세 | RV-6 / RV-7 | `app/review/script/[situationId].tsx` |
| My Page | MY-1 | `app/(tabs)/my.tsx` |
| Edit profile | MY-1b | `app/my/edit.tsx` |
| Stats (주간 / 월간) | MY-2 / MY-2b | `app/my/stats.tsx` |
| Settings | MY-3 | `app/my/settings.tsx` |

탭바는 Home / Roleplay / Review / My Page 4개 루트이며, 롤플레이는 RP-1 → RP-2 → RP-3 → RP-4 푸시 스택입니다.

## 정보 노출 원칙 (핸드오프 §6)

`src/components/KoreanText.tsx`가 이 규칙을 담당합니다. 학습 콘텐츠를 쓰는 화면은 이 컴포넌트를 거칩니다.

1. **한국어를 항상 먼저 읽게 한다.** 1차 텍스트는 한국어이고 가장 큰 타이포(18~22/600)를 씁니다.
2. **영어는 캡션이다.** `meaning` prop으로 노출 정책을 정합니다.
   - `always` — ON-3 레벨 체크 (질문을 못 알아들으면 진단이 불가)
   - `toggle` — RP-3 실전 대화, RV-2c/2e 선택형 미션 (`Show meaning` / `Hide meaning`)
   - `none` — RV-2a/2b 발화형 미션
3. **로마자는 기본 노출하지 않는다.** `romanization`이 있는 토큰만 점선 밑줄이 붙고, 탭하면 툴팁으로 보여줍니다.
4. **Replay는 모든 한국어 발화에 제공한다.** `onReplay`를 넘기면 스피커 버튼이 붙습니다.

## 디렉터리

```
app/                     expo-router 라우트 = 화면
src/
  theme/tokens.ts        색상·간격·라운드·섀도우 토큰
  theme/typography.ts    타입 스케일
  components/            Button, Chip, Card, Badge, SkillBar, KoreanText, MicButton …
  components/art/        핸드오프 SVG를 react-native-svg 컴포넌트로 변환한 것
  icons/                 stroke 1.8 / round cap 아이콘 세트
  data/                  카탈로그·대화·미션·오답·통계 목 데이터 + 타입
  store/AppStore.tsx     앱 상태 (프로필, 설정, 오답, 저장한 표현)
assets/                  일러스트·아바타·로고·음성 파형
docs/design-handoff.md   원본 디자인 핸드오프 문서
```

## 디자인 토큰

`src/theme/tokens.ts`가 단일 출처입니다. 화면에서 색상값이나 간격을 직접 쓰지 말고 토큰을 참조하세요.

- primary `#FF6A3D` · ink `#191F28` · surface `#FFFFFF` · surface-alt `#F7F8FD`
- 좌우 여백 24 (390 기준 콘텐츠 폭 342) · 간격 4·8·12·16·20·24·28·32·40
- 라운드 8 배지 · 12 입력 · 14 검색 · 16 카드 · 18 버튼 · 20 타일 · 24 시트 · 999 칩

서체는 Pretendard가 기준이지만 폰트 파일을 번들에 포함하지 않아 현재는 플랫폼 UI 폰트로 폴백합니다.
정확히 맞추려면 `assets/fonts/`에 Pretendard를 넣고 `app/_layout.tsx`에서 `expo-font`로 등록한 뒤
`src/theme/typography.ts`의 `fontFamily.sans`를 바꾸면 됩니다.

## 데이터와 연동 범위

현재는 **UI와 내비게이션이 목 데이터로 완전히 동작하는 상태**입니다. 다음은 아직 인터페이스만 있고 실제 연동이 없습니다.

- **STT** — RP-3의 마이크는 녹음 대신 다음 턴으로 넘어갑니다. ON-3의 라이브 트랜스크립트는 고정 문자열을 순차 노출합니다.
- **TTS** — `Replay` / `Listen again` / 스피커 버튼은 핸들러가 비어 있습니다.
- **AI 대화 생성** — `src/data/conversations.ts`의 스크립트를 재생합니다.
- **발화 채점** — 6개 스킬 점수와 문장 교정은 `src/data/conversations.ts`의 고정 리포트입니다.
- **로마자 변환** — `src/data/missions.ts`에 토큰별로 하드코딩되어 있습니다.

상황 카탈로그는 11개 카테고리 × 6개 = 66개 + 대표 상황 2개로, 제목·난이도·소요시간은 핸드오프 값 그대로입니다.
카테고리별로 핸드오프에 상세 화면이 명시된 상황은 문구를 그대로 옮겼고, 나머지 상세 문구는 같은 카피 규칙
(미국식 영어·축약형·2인칭·목표 3개)에 맞춰 채웠습니다.

## 핸드오프와 다르게 구현한 부분

- **Accommodation 첫 상황** — RP-1 목록에는 `Checking in for a flight`로 적혀 있으나 같은 카테고리의 RP-2 상세는 `Checking in`입니다. 숙소 카테고리이므로 `Checking in`을 따랐습니다.
- **`Ordering at a café` / `Ordering food at a restaurant`** — 11개 카테고리 어디에도 속하지 않아 `Shopping` 아래 두고 브레드크럼 장소를 `Café` / `Restaurant`로 두었습니다.
- **홈 인사 타이포** — README는 24/600, HTML 시안은 28/40/700입니다. 렌더된 시안을 따랐습니다.
- **진행 원형 그래프** — 고정 `percentage-circle.svg` 대신 진행률을 받는 `ProgressRing` 컴포넌트로 대체했습니다.
- **음성 파형** — 핸드오프의 GIF를 그대로 씁니다. 프로덕션에서는 Lottie나 네이티브 애니메이션 권장(§10).

## 기여

브랜치 규칙과 작업 규칙은 [`CLAUDE.md`](./CLAUDE.md)를 참고하세요.
