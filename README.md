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
| Continue with email | ON-1a | `app/onboarding/email.tsx` |
| Before we start (약관·음성 동의) | ON-1b | `app/onboarding/consent.tsx` |
| Feature intro (4장 스와이프, 최초 1회) | IN-1 ~ IN-4 | `app/onboarding/intro.tsx` |
| Setup (About you) | ON-2 | `app/onboarding/setup.tsx` |
| Microphone (권한 안내) | ON-2b | `app/onboarding/microphone.tsx` |
| 1-minute AI level check | ON-3 | `app/onboarding/level-check.tsx` |
| Your results | ON-4 | `app/onboarding/results.tsx` |
| Home | HM-1 | `app/(tabs)/index.tsx` |
| Browse situations | RP-1 | `app/(tabs)/roleplay.tsx` |
| Scenario detail | RP-2 | `app/roleplay/[situationId].tsx` |
| Live AI conversation + Live script | RP-3 / RP-3b | `app/roleplay/session.tsx` |
| Report | RP-4 | `app/roleplay/report.tsx` |
| Micro missions · Mistake log · Scrapbook | RV-1 / RV-3a / RV-5 | `app/(tabs)/review.tsx` |
| 미션 유형 6종 + 완료 | RV-2 ~ RV-2f | `app/review/mission.tsx` |
| Saved phrase 상세 | RV-5b | `app/review/phrase/[phraseId].tsx` |
| Transcript history (완료한 롤플레이 목록) | — | `app/review/history/[situationId].tsx` |
| Mistake script + 인라인 상세 (`?run=` 기록 하나) | RV-6 / RV-7 | `app/review/script/[situationId].tsx` |
| My Page | MY-1 | `app/(tabs)/my.tsx` |
| Edit profile | MY-1b | `app/my/edit.tsx` |
| Stats (주간 / 월간) | MY-2 / MY-2b | `app/my/stats.tsx` |
| Settings | MY-3 | `app/my/settings.tsx` |

디자인 시안에 없는 운영용 화면은 위 화면들의 컴포넌트와 토큰으로 만들었습니다.

| 화면 | 라우트 |
|---|---|
| Notifications (홈 알림 벨) | `app/notifications.tsx` |
| Notices | `app/my/notices.tsx` |
| Help center | `app/my/help.tsx` |
| About Ddobak | `app/my/about.tsx` |
| Open-source licenses | `app/my/licenses.tsx` |
| Delete account | `app/my/delete-account.tsx` |
| Ddobak Plus (결제·무료 한도 초과) | `app/plus/index.tsx` |
| Plus 가입 완료 | `app/plus/success.tsx` |
| Subscription (구독 관리·결제 내역) | `app/my/subscription.tsx` |
| Terms / Privacy / Voice recordings | `app/legal/[doc].tsx` |
| 없는 주소 | `app/+not-found.tsx` |

**수익화 — Ddobak Plus.** 무료는 하루 롤플레이 1회·미션 3회(`src/data/plans.ts`의 `freeLimits`), Plus는
무제한입니다. 요금제는 연간 $59.99(7일 무료 체험)·월간 $9.99이며 같은 파일에서 바꿉니다. 한도를 넘으면
세션·미션 화면이 Paywall로 넘어가고, RP-2와 My Page·Settings에서도 진입합니다. 결제는
`src/services/billing.ts`를 거치며, 지금은 `sandbox` 모드라 **실제로 청구되지 않고** 화면에 테스트 모드가
표시됩니다. 실제 판매는 스토어 SDK(RevenueCat 또는 StoreKit/Play Billing)를 이 파일에 연결하고
`billingMode`를 `store`로 바꾸면 되며, 구독 상태는 서버에서 검증해야 합니다.

오프라인이 되면 모든 화면 위에 안내 띠가 뜹니다(`src/components/OfflineBanner.tsx`).
약관·개인정보·음성 문서(`src/data/legal.ts`)는 **초안**이라 화면에 초안 표시가 붙습니다. 검토된 문안으로
바꾼 뒤 `legalDraft`를 `false`로 두세요. 문의 메일 주소(`src/data/support.ts`의 `supportEmail`)를 채우면
Help center에 `Contact us`가 나타납니다. 라이선스 목록은 의존성이 바뀌면
`node scripts/licenses.js > src/data/licenses.ts`로 다시 만듭니다.

탭바는 Home / Roleplay / Review / My Page 4개 루트이며, 롤플레이는 RP-1 → RP-2 → RP-3 → RP-4 푸시 스택입니다.

## 정보 노출 원칙 (핸드오프 §6)

`src/components/KoreanText.tsx`가 이 규칙을 담당합니다. 학습 콘텐츠를 쓰는 화면은 이 컴포넌트를 거칩니다.

1. **한국어를 항상 먼저 읽게 한다.** 1차 텍스트는 한국어이고 가장 큰 타이포(18~22/600)를 씁니다.
2. **영어는 캡션이다.** `meaning` prop으로 노출 정책을 정합니다.
   캡션과 학습 해설은 학습자의 Native language로 나옵니다(`useMeaning` · `useHelpText`). 번역은 `src/i18n/catalogs/`의
   언어별 파일에 있고, 없는 항목은 영어로 보여줍니다. 누락 확인: `node --experimental-strip-types scripts/i18n-check.mjs`.
   언어 설정은 하나뿐입니다(`profile.nativeLanguage`). Settings에서는 `App language`, About you · Edit profile에서는 `Native language`로 같은 값을 바꿉니다.
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
  store/AppStore.tsx     앱 상태 (프로필, 설정, 오답, 저장한 표현, 연습 기록) — 기기에 저장됨
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

**음성 출력(TTS)·녹음·음성 인식(STT)은 실제로 동작합니다.** 스피커 버튼과 낱말 탭은 기기 음성
합성으로 한국어를 읽고(`src/services/speech.ts`), 마이크는 실제로 녹음해 되들을 수 있으며
(`src/services/recorder.ts`), 말한 것을 받아써서 RV-2b 발음 판정과 ON-3 라이브 트랜스크립트,
RP-3의 `You` 줄에 씁니다(`src/services/recognition.ts`).
인식은 웹 전용이고 Chrome·Edge·Safari에서 동작합니다. 그 밖에는 아직 연동이 없습니다.

- **AI 대화 생성** — RP-3은 인식된 말을 화면에 보여주지만, 상대의 다음 말은 여전히
  `src/data/conversations.ts`의 대본입니다.
- **발화 채점** — RV-2b는 인식된 문장을 목표 문장과 맞춰 실제로 판정합니다. 하지만 6개 스킬
  점수와 문장 교정은 `src/data/conversations.ts`의 고정 리포트입니다.
- **로마자 변환** — `src/data/missions.ts`에 토큰별로 하드코딩되어 있습니다.
- **대본이 있는 상황은 2개뿐** — 약국(`pharmacy-symptoms`)과 카페(`cafe-order`)만 대화할 수 있고,
  나머지 66개는 RP-2에서 `Coming soon`으로 막혀 있습니다. 다른 상황의 대본으로 대신하지 않습니다.
- **알림** — Settings의 알림 토글은 값만 저장합니다. 로컬 알림(`expo-notifications`)은 아직 없습니다.

**서버 없이 연결된 것.** 앱 상태는 `AsyncStorage`로 기기에 저장되어 새로고침·재시작 후에도 남습니다
(로그아웃해도 남고, 계정 삭제하면 지워짐). 롤플레이를 끝내면 실제로 말한 문장이 기록되고, 교정을 말하지 못한 줄은
Mistake log에 쌓이며, 교정대로 말하면 기존 오답이 고침 처리됩니다. 연습(롤플레이·미션)은 연속 학습일,
주간 목표, 누적 연습 시간, Situations done에 반영됩니다. AI 음성 속도 설정은 TTS 속도에 반영됩니다.

- **Stats(MY-2)** — 레벨 체크 결과에서 출발해, 미션 첫 시도 정답률과 대화에서 교정을 맞게 말했는지로
  스킬 점수가 움직입니다(`src/services/progress.ts`). 고정 통계 데이터는 없앴습니다.
- **진행률** — 저장하고 나간 대화는 답한 턴 비율, 끝낸 대화는 100%가 진행률입니다. 한 번도 시작하지 않은
  상황에는 진행률이 없고, 홈 이어하기 카드는 저장해 둔 미완료 대화가 있을 때만 뜹니다(`src/store/useSituations.ts`).
  카탈로그에는 진행 상태를 넣지 않습니다.
- **미션 출제** — 축마다 문제 은행(8문제씩, 총 48문제)에서 그때그때 뽑습니다. 최근에 나온 문제는 뒤로 밀리고,
  안 나온 문제부터 나옵니다(`src/services/questionPicker.ts`, 최근 기록은 `recentQuestions`로 기기에 저장).
- **추천** — Today's focus는 남은 오답 → ON-2 어려운 점 순으로 스킬을 고르고, Start speaking은 관심사에
  맞는 상황을 고릅니다(`src/services/recommend.ts`).
- **알림** — 연습(19:00)·복습(12:30, 남은 오답이 있을 때)·무료 체험 종료 2일 전 알림을 기기에서 예약합니다
  (`src/services/reminders.ts`). 웹은 예약 알림이 없어 Settings에 안내만 나옵니다.
- **한국어 음성 없음 안내** — 레벨 체크·대화·말하기 미션에서 알려줍니다.
- **내 목소리 다시 듣기** — 대화에서 녹음한 턴은 RV-6 스크립트에서 `Your voice`로 다시 들을 수 있습니다.
  녹음은 메모리에만 있어 앱을 닫으면 사라집니다.

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
