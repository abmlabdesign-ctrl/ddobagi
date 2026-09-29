# Handoff: 또박(Ddobak) — AI 한국어 스피킹 앱

## 1. 개요

또박은 외국인 학습자가 **실제 상황(롤플레이)에서 한국어로 말하고, AI 피드백으로 약점을 교정**하는 모바일 앱이다.
핵심 루프는 다음 4단계다.

1. **온보딩** — 가입 → 학습 배경 설정 → 1분 AI 레벨 체크 → 6개 스킬 결과
2. **홈** — 이어서 학습 / 오늘의 추천 / 상황 탐색
3. **롤플레이** — 상황 선택 → 시나리오 브리핑 → 실시간 AI 음성 대화 → 리포트(6개 스킬 + 문장 교정)
4. **복습·미션** — 약점 기반 3분 마이크로 미션, 오답노트, 저장한 표현

UI 언어는 **영어(앱 UI) + 한국어(학습 콘텐츠)** 이중 구조다. 이 구분이 이 제품의 가장 중요한 규칙이며 6장에 따로 정리했다.

---

## 2. 이 번들의 파일에 대해

번들에 들어 있는 `*.dc.html` 파일은 **HTML로 만든 디자인 레퍼런스(프로토타입)** 다. 최종 룩앤필과 동작 의도를 보여주기 위한 것이며, **그대로 복사해서 제품에 넣는 코드가 아니다.**

해야 할 일은 이 HTML 화면들을 **대상 코드베이스의 기존 환경(React Native / Flutter / SwiftUI / React 등)에서 그 환경의 기존 패턴·컴포넌트·라이브러리로 재현**하는 것이다. 아직 코드베이스가 없다면, 프로젝트에 가장 적합한 프레임워크를 선택해 구현한다(모바일 앱이므로 React Native 또는 Flutter 권장).

HTML 안의 절대 좌표(`position:absolute; left/top`)는 시안 재현용이다. 실제 구현에서는 **flex/stack 레이아웃으로 바꿔야 한다.** 좌표는 간격(spacing)을 읽는 근거로만 사용한다.

## 3. 충실도(Fidelity)

**High-fidelity.** 색상, 타이포그래피, 간격, 라운드, 섀도우, 문구가 모두 확정값이다. 개발자는 대상 코드베이스의 라이브러리로 **픽셀 단위까지 동일하게** 재현해야 한다.

- 기준 프레임: **390 × 844** (iPhone 13/14 논리 해상도)
- 가로 여백: 좌우 각 **24px** → 콘텐츠 폭 **342px**
- 일부 화면은 스크롤 전체를 보여주기 위해 844보다 긴 프레임(909 / 980 / 1008 / 1093 / 1241)으로 그려져 있다. 실제 앱에서는 844 뷰포트 + 스크롤이다.

---

## 4. 화면 목록 (IA 순서)

| ID | 화면 | 파일 |
|---|---|---|
| ON-1 | Sign up / Log in | `또박이 UI - 01 온보딩.dc.html` |
| ON-2 | Setup (About you) | 〃 |
| ON-3 | 1-minute AI level check | 〃 |
| ON-4 | Your results | 〃 |
| HM-1 | Home (메인 대시보드) | `또박이 홈.dc.html` |
| RP-1 | Browse situations | `또박이 UI - 03 롤플레이 v2.dc.html` |
| RP-2 | Scenario detail | 〃 |
| RP-3 | Live AI conversation | 〃 |
| RP-3b | Live script (스크립트 탭) | 〃 |
| RP-4 | Report (6 스킬 + 문장 교정) | 〃 |
| RP-1/2 ×11 | 11개 카테고리 데이터 세트 | 〃 |
| RV-1 | Micro missions | `또박이 UI - 04 복습·미션.dc.html` |
| RV-2 / 2a~2f | 미션 유형 6종 + 완료 | 〃 |
| RV-3a | Pick a situation (오답 상황 목록) | 〃 |
| RV-3 | Mistakes by situation | 〃 |
| RV-5 | Saved phrases by situation (Scrapbook) | 〃 |
| RV-6 | Mistake log script | 〃 |
| RV-7 | Mistake expanded (인라인 상세) | 〃 |
| MY-1 | My Page (프로필) | `또박이 UI - 05 마이페이지.dc.html` |
| MY-1b | Edit profile | 〃 |
| MY-2 / 2b | Stats (주간 / 월간) | 〃 |
| MY-3 | Settings | 〃 |
| — | 정보 노출 원칙 인터랙티브 레퍼런스 | `또박이 UI - 06 정보 노출 원칙.dc.html` |
| — | 전체 화면 통합 캔버스 | `또박이 UI - 전체 화면.dc.html` |

---

## 5. 화면별 상세

공통: 상단 네비게이션 = 높이 56px, 좌측 back chevron(24×24, stroke `#95989C` 1.8px), 중앙 타이틀 16/600 `#191F28`, 우측 액션 텍스트 14/600 `#FF6A3D`.
하단 탭바 = 4탭(Home / Roleplay / Review / My Page), 아이콘 24×24 + 라벨 12/500, 활성 `#FF6A3D` / 비활성 `#B0B8C1`, 배경 흰색 + `0 -4px 24px rgba(50,68,88,0.08)`.

### ON-1 Sign up / Log in
- **목적**: 소셜/이메일 로그인.
- **레이아웃**: 세로 flex, 상단 로고 블록 중앙 정렬 → 하단 버튼 그룹(gap 12).
- **구성**:
  - 로고 이미지(정사각, `logo-mtiateg2-y4ac.png`)
  - 앱명 "Ddobak" 28/700/40
  - 설명 15/400/24 `#95989C`, 중앙 정렬: "Practice real Korean conversations with AI. / Built around how you actually speak."
  - 버튼 3종, 높이 56, radius 18: `Continue with Google`(흰 배경 + 1px `#D1D5D9` 보더, 텍스트 16/600 `#1A1A1C`), `Continue with Apple`(`#191F28` 배경, 흰 텍스트), `Continue with email`(텍스트 버튼 15/500 `#95989C`, 높이 48)
  - 약관 12/18 `#B0B8C1` 중앙: "By continuing, you agree to our Terms and Privacy Policy."

### ON-2 Setup (About you)
- **목적**: 학습 배경 수집(레벨 추정 + 추천 시드).
- **레이아웃**: 상단바(타이틀 "About you", 진행 인디케이터) → 섹션 4개 세로 스택(gap 28) → 하단 고정 CTA `Next`.
- **구성**:
  - `App language` — select row, 높이 48, radius 12, 흰 배경, 값 "English" 15/600 + chevron
  - `How long have you studied Korean?` — 단일 선택 리스트. 아이템 높이 56, radius 16, padding 0 18. 비선택: 흰 배경 + 1px `#D1D5D9`. 선택: `inset 0 0 0 1.5px #FF6A3D` + `#FFF0EC`. 옵션: `Just starting out` / `6–12 months, on my own` / `I'm taking classes`
  - `What do you need Korean for?` — 칩 그룹(wrap, gap 8). 칩 높이 36, radius 999, padding 0 14, 14/500. 비선택 `#F2F3F5` / 선택 `#FFF0EC` + `#FF6A3D` 600. 옵션: `School life`, `Part-time job`, `Clinics & offices`, `Daily life & transit`
  - `What's hardest right now?` + 보조문구 `Select all that apply`(12/400 `#95989C`) — 다중 선택 칩: `Pronunciation`, `Politeness`, `Context`, `Particles & endings`, `Fluency`
  - CTA: 높이 56, radius 18, `#FF6A3D`, 흰 텍스트 16/600, 라벨 `Next`

### ON-3 1-minute AI level check
- **목적**: 1분 발화 샘플로 6개 스킬 초기 진단.
- **레이아웃**: 상단바(타이틀 `Level check`, 우측 `Finish`) → 질문 카드 → 라이브 트랜스크립트 카드(flex:1) → 타이머 → 마이크.
- **구성**:
  - 질문 카드: 스피커 아이콘 원형 24×24 `#FFF0EC` + 한국어 질문 22/600/32 + **영어 캡션** 14/400 `#95989C`("What do you usually do on weekends?")
  - 트랜스크립트 카드: radius 16, 흰 배경, `0 0 20px rgba(50,68,88,0.08)`, padding 20. 라벨 `Live transcript` 12/600 `#B0B8C1`, 본문 18/500/28 한국어
  - 타이머: 라벨 `Time left` 14/400 `#95989C` + 숫자 40/700 (Inter, tabular)
  - 마이크 버튼: 원형 88, `#FF6A3D`, glow `0 0 32px rgba(255,106,61,0.5)`

### ON-4 Your results
- **목적**: 진단 결과 + 첫 학습 유도.
- **구성**:
  - `Summary` 카드 — 2줄 요약: "Everyday conversation comes easily to you." / "Politeness and context could use more practice."
  - `Your skills` — 6개 스킬 바. 라벨 15/500, 등급 배지 12/600 (`Strong` `#27A376`/`#EAF8EE`, `Medium` `#0091FF`/`#EBF9FF`, `Needs work` `#FF6A3D`/`#FFF0EC`), 트랙 높이 8 radius 999 `#F2F3F5`
  - CTA `Start practicing` → HM-1

### HM-1 Home
- **목적**: 재진입 허브.
- **레이아웃**: 세로 스크롤, 좌우 24, 블록 간 gap 24~32.
  1. 인사 영역: "Hi there, / Ddobak!" 24/600 + 주간 목표 pill("This week's goal", "Finish 10 lessons") + 진행 원형 그래프(`uploads/percentage-circle.svg`)
  2. 퀵 액션 3카드: 큰 카드 1 (`Start speaking` 22/600 + `We'll pick a topic for you` 12/400, 일러스트 140×89) + 165×120 카드 2개(`Saved phrases` 흰 배경 / `Mistake log` 오렌지 radial 그라디언트 + 흰 텍스트), radius 20
  3. `Browse situations` + `See all` → 상황 카드 리스트(342폭, 높이 160, radius 20, 난이도 배지 `Easy`/`Medium`/`Hard`, 소요시간 "About 8 min", 진행중 배지 `In progress` 10/600 `#FF6A3D`/`#FFF0EC`)
  4. 하단 탭바

### RP-1 Browse situations
- **목적**: 상황 검색·탐색.
- **구성**: 타이틀 `Choose a situation` → 검색 필드(`Search situations`, 높이 48, radius 14, `#F2F3F5`) → 필터 칩(`All` / `Status` / 카테고리) → 상황 카드 그리드. 카드 = 캐릭터 일러스트 + 상황명 2줄 + 난이도 배지 + 소요시간.
- 11개 카테고리: Shopping / Clinic / School / Transit / Government / Part-time job / Airport / Accommodation / Directions / Friends / K-content. **디자인 동일, 데이터만 교체** (문구 전체는 `또박이 UI - 03 롤플레이 v2.dc.html` 참조).

### RP-2 Scenario detail
- **목적**: 대화 전 브리핑.
- **구성**: 히어로(캐릭터 일러스트 + `Est. 8 min` + `Clinic · Pharmacy` 브레드크럼) → `The situation` 카드(상황 설명 15/24) → `AI plays` 카드(역할명 16/600 + 역할 설명 13/400 `#95989C`) → `Your goals` 체크리스트 3항목 → 하단 고정 CTA `Start conversation`.

### RP-3 Live AI conversation
- **목적**: 실시간 음성 대화.
- **구성**: AI 발화 카드(한국어 22/600 + 리플레이 버튼) → 사용자 발화 버블 → 하단 컨트롤 3개(`Script` / 마이크 / `Hint`). 마이크 대기 시 파형 GIF(`voice-2-mtgxazrl-y2xg.gif`).
- **문구**: `Hint` 내용은 따옴표 포함 한국어 예시, 영어는 **기본 숨김**(6장 규칙).
- **RP-3b**: `Script`(또는 `Live script`) 탭 시 대화 전체 스크립트 시트. AI 버블 = 흰 배경 + 카드 섀도우, 사용자 버블 = `#E5EFFF`. 각 버블 아래 12/400 `#95989C` 영어 캡션.

### RP-4 Report
- **목적**: 대화 결과 피드백.
- **구성**:
  - 헤드라인 `You hit all 3 goals.` + 점수(대형 숫자 + `pts`) + 변화 `That's 6 points more than last time.`
  - `6-skill breakdown` — 6개 바(ON-4와 동일 컴포넌트)
  - `Sentence fix` — `What you said`(취소선/오류 표기) vs `Suggested`(정답, `#27A376` 포인트)
  - 하단 버튼 2개: `Try again`(보조, 흰 배경+보더) / `Save`(주, `#FF6A3D`)

### RV-1 Micro missions
- **목적**: 약점 기반 3분 미션 진입.
- **구성**: 탭 3개(`Review missions` / `Mistake log` / `Scrapbook`) → `Today's focus` 카드(`· Politeness · Endings`, `Three minutes on today's weak spots`, CTA `Start 3-minute mission`) → 미션 리스트(제목 + `8 questions · 3 min` 메타).
- 미션 목록: `Switch to polite endings`, `Pick the answer that fits`, `Hear the tense, pick the ending`, `Speak without pausing`, `Build sentences with particles`, `Repeat final consonant sounds`.

### RV-2 미션 유형 6종
| 변형 | 스킬 | 인터랙션 |
|---|---|---|
| RV-2 / 2a | Pronunciation | 듣고 따라 말하기. 단어 탭 → 로마자 툴팁(`meogeulgeyo`, `gapsi`, `pojang`, `juseyo`). 안내 `Tap a word to see how it sounds` |
| RV-2b | Fluency | 말하기 유창성. 실패 피드백 `You paused twice mid-sentence` + `Try again` |
| RV-2c | Particles | 보기 선택. 프롬프트 `The barista asks`, `Meaning` 토글 |
| RV-2d | Endings | 보기 선택. 해설 `Use -았/었어요 for things that already happened` |
| RV-2e | Context | 보기 선택 + `Show meaning`/`Hide meaning` 토글 |
| RV-2f | Result | `Mission complete!` + 요약(`Time`, `Politeness`) + `Retry` / `Done` |
- 정답 피드백: `Correct` 배지 `#27A376`/`#EAF8EE` + 해설 1줄 14/22 `#95989C`.
- 오답/교정 피드백: `#FF6A3D` 계열.

### RV-3a / RV-3 / RV-6 / RV-7 오답노트
- **RV-3a**: `Mistakes to review` + `12 left across 4 situations`, 정렬 `Most recent`, 상황별 행(`3 mistakes · endings · politeness · Aug 22`), 하단 `Mistakes you fixed` `7 · last 30 days`
- **RV-3**: 상황별 오답 카드. 오류 문장(`"It hurts since two days ago." (incorrect)`) → 교정 문장 → 액션 `Listen again` / `Say it again`, 교정 완료는 `Fixed` 배지
- **RV-6**: 대화 스크립트에서 오답 발화만 하이라이트(`#FFF0EC` 배경 + `#FF6A3D` 1.5px inset)
- **RV-7**: 하이라이트 탭 → 인라인 상세 확장. `Mistake detail` / `Suggested sentence` / `Why`(문법 설명, 한국어+영어 혼용)

### RV-5 Scrapbook
- 상황별 저장 표현 리스트. 한국어 표현 17/600 + 영어 뜻 13/400 `#95989C`, 우측 스피커 버튼.

### MY-1 / MY-1b / MY-2 / MY-2b / MY-3
- **MY-1**: 아바타(원형 72) + 닉네임 + `School life · Intermediate · 12-day streak` → 통계 3열(`Situations done` / `Total practice` / `Weekly goal`) → 메뉴 리스트(`Stats`, `Scrapbook`, `Settings`)
- **MY-1b**: `Avatar`(`Pick 1 of 6`, 자음 캐릭터 6종) / `Nickname` 입력 / `Native language` select / `Korean level` 세그먼트(`Beginner`·`Intermediate`·`Advanced`) / `Interests` 칩 6종 / CTA `Save`
- **MY-2**: 탭 `Weekly`|`Monthly` → `This week's overall score` 대형 숫자 + `Aug, week 4` → 인사이트 2줄 → `6-skill scores` 바 → `Biggest gain` / `Practice this next` 카드
- **MY-2b**: 동일 구조, 월간 데이터
- **MY-3**: 그룹 3개 — `Learning`(`App language`, `AI speech speed`), `Notifications`(`Practice reminder`, `Review mission alerts` 토글), `Account`(`Account info`, `Connected to Google`, `Help center`, `Log out`), 푸터 `Ddobak v1.0.2`

---

## 6. 정보 노출 원칙 (한국어 / 영어 / 로마자) — 필수 구현 규칙

`또박이 UI - 06 정보 노출 원칙.dc.html`이 이 규칙의 인터랙티브 명세다.

1. **한국어를 항상 먼저 읽게 한다.** 학습 콘텐츠의 1차 텍스트는 한국어이며 가장 큰 타이포(18~22/600)를 쓴다.
2. **영어는 캡션이다.** 의미 파악이 학습 목표에 필수인 곳에만 노출한다.
   - ON-3 레벨 체크: 영어 캡션 **항상 표시**(질문을 못 알아들으면 진단이 불가)
   - RP-3 실전 대화: 영어 **기본 숨김**, `Show meaning` 토글로만 노출
   - RV-2c/2e 선택형 미션: 프롬프트 이해가 필요할 때만 `Show meaning` / `Hide meaning`
   - RV-2a/2b 발화형 미션: 영어 캡션 없음
3. **로마자는 기본 노출하지 않는다.** 단어를 탭했을 때 툴팁으로만 보여준다(`포장` → `pojang`). 밑줄(dotted underline)로 탭 가능함을 표시.
4. 오디오 리플레이(`Replay`)는 모든 한국어 발화에 제공한다.

---

## 6-1. UX 카피 규칙 (영어 UI)

앱 UI 문구는 **미국식 영어 · 구어체 · 모바일 앱 톤**으로 통일했다. HTML의 문구가 최종 카피이며, 구현 시 문자열을 그대로 사용한다.

- **미국식 표기**: color / favorite / practicing / apologizing (영국식 -our, -ising 금지)
- **축약형 사용**: You're, doesn't, can't, That's, We'll — 시나리오 설명·피드백 문장 모두 축약형
- **버튼은 동사 1~2단어**: `Start`, `Finish`, `Retry`, `Save`, `Try again`, `Next`. 문장형 라벨 금지
- **레이블은 문장 대문자(sentence case)**: `Choose a situation`, `Start 3-minute mission`. Title Case 금지(고유명 제외)
- **학습자에게 말 걸듯 2인칭**: `Ask them to check your documents` (× `Have your document list checked`)
- **도메인 용어 고정**: Mistake log(오답노트) / Scrapbook(저장한 표현) / Saved phrases(홈 카드 라벨) / Level check / Micro missions / 6-skill breakdown / Show meaning · Hide meaning / Replay
- **숫자·시간 표기**: `3-minute mission`(형용사형 하이픈), `About 8 min`, `8 questions · 3 min`, `Est. 8 min`
- **구분자**: 메타 정보는 가운뎃점 `·` (예: `School life · Intermediate · 12-day streak`)

학습 콘텐츠(한국어 문장, 로마자, 문법 해설)는 카피 규칙과 별개로 6장의 노출 원칙을 따른다.

---

## 7. 인터랙션 & 동작

- **네비게이션**: 탭바 4개 루트(Home / Roleplay / Review / My Page). 롤플레이는 RP-1 → RP-2 → RP-3 → RP-4 push 스택. RP-4의 `Try again`은 RP-3 재시작, `Save`는 RP-1로 복귀 + 오답노트에 기록.
- **온보딩**: ON-1 → ON-2(필수 응답 전까지 `Next` 비활성, opacity 0.4) → ON-3 → ON-4 → HM-1. 재진입 없음.
- **ON-3 타이머**: 60초 카운트다운, 0초에 자동 종료 → ON-4. 진행 중 마이크 버튼 glow 펄스(1.6s ease-in-out, infinite).
- **음성 입력**: 녹음 중 파형 애니메이션, 인식 결과는 라이브 트랜스크립트에 점진 추가.
- **시트/토글**: `Script`, `Hint`, `Show meaning`, 단어 로마자 툴팁은 모두 즉시 토글(200ms ease-out fade + 8px slide-up).
- **미션 채점**: 선택 즉시 정답/오답 피드백 → 해설 표시 → `Next`로 다음 문항. 마지막 문항 후 RV-2f.
- **오답노트 하이라이트**: RV-6의 오답 발화 탭 → RV-7 인라인 확장(height auto, 200ms).
- **상태 배지 색 규칙**: `Strong`/`Correct`/`Fixed` = `#27A376`, `Medium`/`In progress` = `#0091FF` 또는 `#FF6A3D`, `Needs work`/오답 = `#FF6A3D`.
- **터치 타겟**: 최소 44×44. 칩(36px)은 여백 포함으로 44 확보.
- **반응형**: 390 기준 고정 여백 24, 카드/리스트는 가로 stretch. 폭 360 이하에서 카드 2열(165px)은 flex:1로 축소 허용.

## 8. 상태 관리

| 도메인 | 상태 | 트리거 / 비고 |
|---|---|---|
| auth | `user`, `authProvider` | ON-1 소셜/이메일 로그인 |
| profile | `appLanguage`, `nativeLanguage`, `koreanLevel`, `studyDuration`, `purposes[]`, `painPoints[]`, `interests[]`, `nickname`, `avatarId` | ON-2, MY-1b |
| levelCheck | `isRecording`, `secondsLeft`, `transcript`, `skillScores{6}` | ON-3 → ON-4 |
| catalog | `categories[]`, `situations[]`, `query`, `filters`, `progressBySituation` | RP-1 검색/필터 |
| session | `situationId`, `turns[]`, `isMicOn`, `showScript`, `showHint`, `showMeaning` | RP-3 |
| report | `goalsMet`, `score`, `scoreDelta`, `skillBreakdown{6}`, `sentenceFixes[]` | RP-4 |
| missions | `todayFocus[]`, `missionQueue[]`, `currentIndex`, `answers[]`, `elapsed` | RV-1 → RV-2* |
| mistakes | `mistakesBySituation[]`, `fixedCount`, `expandedMistakeId` | RV-3/6/7 |
| scrapbook | `savedPhrases[]` | RV-5 |
| stats | `period('weekly'\|'monthly')`, `overallScore`, `skillTrends{6}`, `insights` | MY-2 / MY-2b |
| settings | `aiSpeechSpeed`, `practiceReminder`, `reviewAlerts` | MY-3 |

**데이터 요구**: 상황 카탈로그(11 카테고리 × 4~11 상황), TTS(한국어 발화 재생), STT(실시간 전사), AI 대화 턴 생성, 발화 채점(6개 스킬 + 문장 교정), 로마자 변환.

## 9. 디자인 토큰

### 색상
| 토큰 | 값 | 용도 |
|---|---|---|
| `primary` | `#FF6A3D` | CTA, 활성 탭, 포인트 |
| `primary-pressed` | `#FF5624` | 프레스/호버 |
| `primary-100` | `#FFF0EC` | 선택 칩·배지 배경 |
| `primary-200` | `#FFD1C3` | 그라디언트 종점 |
| `primary-300` | `#FFBAA6` | 보조 아이콘 |
| `ink` | `#191F28` | 주요 텍스트·다크 버튼 |
| `ink-alt` | `#1A1A1C` | 본문 텍스트 |
| `text-secondary` | `#95989C` | 보조 텍스트·캡션 |
| `text-tertiary` | `#B0B8C1` | 라벨·비활성 |
| `surface` | `#FFFFFF` | 카드 |
| `surface-alt` | `#F7F8FD` | 서브 카드 |
| `canvas` | `#E6E8EE` | 시안 배경(앱 배경은 `#FFFFFF`) |
| `fill` | `#F2F3F5` / `#F0F2F7` | 비선택 칩, 트랙, 입력 필드 |
| `border` | `#D1D5D9` | 1px 보더 |
| `success` / `success-bg` | `#27A376` / `#EAF8EE` | Strong, Correct, Fixed |
| `info` / `info-bg` | `#0091FF` / `#EBF9FF` | Medium, 정보 |
| `bubble-user` | `#E5EFFF` (`#D8E7FF` 진한 변형) | 사용자 발화 버블 |

### 타이포그래피
- 서체: **Pretendard** (fallback `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`). 숫자 전용 표기(타이머·점수)는 **Inter**.
- 스케일: `40/48/700` 타이머 · `28/40/700` 타이틀 · `24/34/600` 인사 · `22/32/600` 학습 문장 · `18/26/600` 섹션 헤더 · `17/23/600` 리스트 제목 · `16/22/600` 네비·버튼 · `15/24/500` 본문 · `14/22/400` 보조 · `13/19/400` 설명 · `12/16/400~600` 캡션·배지 · `11/16/500` 메타 · `10/16/600` 마이크로 배지
- weight: 400 / 500 / 600 / 700 (600이 기본 강조)

### 간격
4 · 8 · 12 · 16 · 20 · 24 · 28 · 32 · 40 — 화면 좌우 여백 24, 카드 내부 padding 16~20, 카드 간 gap 12, 섹션 간 gap 24~32.

### 라운드
`8` 배지·트랙 · `12` 입력·셀렉트 · `14` 검색 필드 · `16` 카드·리스트 아이템 · `18` 버튼 · `20` 퀵액션·상황 카드 · `24` 시트 · `40` 디바이스 프레임 · `999` 칩·pill·원형

### 섀도우
- `card`: `0 0 20px rgba(50,68,88,0.08)`
- `float`: `0 12px 40px rgba(50,68,88,0.14)`
- `bottom-nav`: `0 -4px 24px rgba(50,68,88,0.08)`
- `modal`: `0 8px 24px rgba(25,31,40,0.18)`
- `mic-glow`: `0 0 32px rgba(255,106,61,0.5)`
- `selected-outline`: `inset 0 0 0 1.5px #FF6A3D`
- `hairline`: `inset 0 0 0 1px` + 보더 컬러

## 10. 에셋

모두 이 번들에 포함되어 있다. HTML은 `./파일명.png`(번들 루트)과 `uploads/파일명.svg`로 참조하므로 **폴더 구조를 유지해야** 브라우저에서 정상 표시된다.

- **로고**: `logo-mtiateg2-y4ac.png`
- **캐릭터 일러스트(AI 역할)**: `pharmacist-*.png`, `professor-illust.png`, `bank-illust.png`, `cafe-illust.png`, `shopping-store-staff-*.png`, `bus-driver-*.png`, `government-agency-staff-*.png`, `airport-staff-*.png`, `hotel-front-desk-staff-*.png`, `ordinary-passersby-*.png`, `friends-*.png`, `celebrities-*.png`
- **아바타(자음 캐릭터 6종)**: `centered_1_blue-*.png` ~ `centered_6_orange-*.png`
- **홈 일러스트/그래프(SVG)**: `uploads/home_quick_talk.svg`, `uploads/home_saved_expression.svg`, `uploads/percentage-circle.svg`
- **음성 파형 애니메이션**: `voice-2-mtgxazrl-y2xg.gif` → 구현 시 Lottie 또는 네이티브 애니메이션으로 대체 권장
- **아이콘**: 인라인 SVG(스피커, 마이크, chevron, 탭바 등). stroke 1.8px, round cap/join. HTML에서 그대로 추출해 아이콘 컴포넌트로 정리할 것.
- 일러스트는 모두 래스터 PNG다. 2x/3x 에셋이 필요하면 원본 소스에서 재추출이 필요하다.

## 11. 원본 기획 문서 (`source_docs/`)

- `design_system_v1.1_foundations.pdf` — 또박 디자인 시스템 파운데이션
- `plan.pdf` — 초기 플랜
- `ia.png` — 정보구조도(IA)

원본 서비스 기획서 PDF(`또박이 서비스 기획서_260820.pdf`)는 파일명 인코딩 문제로 이 번들에 포함되지 않았다. 필요하면 프로젝트의 `uploads/` 폴더에서 직접 내려받아 `source_docs/`에 함께 넣으면 된다.

토큰·문구가 충돌할 경우 **이 번들의 HTML 화면과 본 README가 최신 기준**이다.

## 12. 파일 목록

| 파일 | 내용 |
|---|---|
| `또박이 UI - 전체 화면.dc.html` | 전체 화면 통합 캔버스(모든 섹션 임포트) |
| `또박이 UI - 01 온보딩.dc.html` | ON-1~ON-4 |
| `또박이 홈.dc.html` | HM-1 |
| `또박이 UI - 03 롤플레이 v2.dc.html` | RP-1~RP-4 + 11개 카테고리 데이터 |
| `또박이 UI - 02 카테고리 확장.dc.html` | 카테고리 데이터 템플릿(한국어 라벨) |
| `또박이 UI - 04 복습·미션.dc.html` | RV-1~RV-7 |
| `또박이 UI - 05 마이페이지.dc.html` | MY-1~MY-3 |
| `또박이 UI - 06 정보 노출 원칙.dc.html` | 한/영/로마자 노출 규칙 인터랙티브 명세 |
| `support.js` | 프로토타입 런타임(제품 코드 아님, 로컬 열람용) |

브라우저에서 `또박이 UI - 전체 화면.dc.html`을 열면 모든 화면을 한 캔버스에서 볼 수 있다.

## 13. 구현 순서 제안

1. 디자인 토큰 + 공통 컴포넌트(Button, Chip, ListRow, Card, Badge, SkillBar, TabBar, NavBar, MicButton)
2. 정보 노출 원칙을 담은 `KoreanText` 컴포넌트(한국어 + 영어 캡션 토글 + 단어 탭 로마자 툴팁 + Replay)
3. 온보딩 4화면(ON-1~4) — 정적 데이터로 먼저 흐름 완성
4. 홈 + 상황 카탈로그(RP-1, RP-2)
5. 실전 대화(RP-3/3b) — STT/TTS 연동
6. 리포트(RP-4) + 6스킬 채점 스키마
7. 복습·미션(RV-1~2f) → 오답노트(RV-3/6/7) → 스크랩북(RV-5)
8. 마이페이지·통계·설정(MY-1~3)
