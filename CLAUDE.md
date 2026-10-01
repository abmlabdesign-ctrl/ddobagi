# CLAUDE.md

Claude Code가 이 저장소에서 작업할 때 참고하는 가이드입니다.

## 프로젝트

- 저장소: `abmlabdesign-ctrl/ddobagi`
- 또박(Ddobak) — 외국인 학습자를 위한 AI 한국어 스피킹 앱
- Expo SDK 57 · React Native 0.86 · React 19 · TypeScript(strict) · expo-router
- 제품 개요와 화면 목록은 [`README.md`](./README.md), 원본 디자인 명세는 [`docs/design-handoff.md`](./docs/design-handoff.md)

## 빌드 / 테스트

```
설치:   npm install
개발:   npm start        (npm run ios / android / web)
린트:   npm run lint     (eslint .)
타입:   npm run typecheck (tsc --noEmit)
번들:   npm run export:web
```

아직 테스트 러너는 없습니다. 변경 후에는 최소한 `npm run lint`와 `npm run typecheck`를 돌리고,
화면을 건드렸다면 `npm run export:web`으로 번들이 깨지지 않는지 확인합니다.
CI(`.github/workflows/ci.yml`)가 push·PR에서 이 셋을 그대로 실행합니다.

## 기획 문서

기획서·시안·결정 기록은 [`docs/`](./docs/README.md)에 있습니다. 작업 전에 관련 폴더를 먼저 확인합니다.

- `docs/design/` — `*.dc.html` 시안 (UI 기준). 비어 있으면 `docs/design-handoff.md`를 따릅니다.
- `docs/planning/` — 서비스 기획서·정책 (기능 기준)
- `docs/decisions/` — 기획서 이후에 정한 것. 개발 중에 기획에 없는 것을 정했다면 여기에 한 장 남깁니다.
- `docs/ai-prompts/` — AI 대화·채점 지시문. 출력 형식은 `src/data/types.ts`와 맞춰 둡니다.

## Source of Truth

**`docs/design-handoff.md`와 함께 전달된 `*.dc.html` 시안이 UI의 유일한 기준입니다.**
핸드오프 README의 서술과 시안 값이 어긋나면 **시안을 따릅니다**. 기존 구현을 근거로 디자인을 고치지 않습니다.
확정된 충돌 항목: ON-2 선택 상태는 링만(배경 없음), SkillBar는 `Strong = #0091FF` / `Medium = #27A376`,
RP-1 타이틀은 `Choose a situation`.

## 코드 규칙

- **디자인 토큰을 쓴다.** 색상·간격·라운드·섀도우는 `src/theme/tokens.ts`, 타이포는 `src/theme/typography.ts`.
  화면에서 `#FF6A3D`나 `padding: 24` 같은 값을 직접 쓰지 않습니다.
- **타이포는 `text()` / `numeral()` 헬퍼로.** React Native는 weight가 아니라 패밀리 이름으로 폰트를 고르므로
  `fontWeight`를 직접 쓰지 말고 `text(16, 22, '600')` 형태로 씁니다. 숫자는 전부 Inter(`numeral`)입니다.
- **카드 그림자는 기본이 없음.** 시안에서 `0 0 20px`가 선언된 카드에만 `elevation="card"`를 줍니다.
- **학습 콘텐츠는 `KoreanText`를 거친다.** 한국어/영어/로마자 노출 규칙(README "정보 노출 원칙")이 이 컴포넌트에 있습니다.
  한국어 문장을 `<Text>`로 직접 찍지 마세요.
- **UI 문구는 미국식 영어·구어체·문장 대문자.** 버튼은 동사 1~2단어(`Save`, `Try again`).
  도메인 용어는 고정입니다: Mistake log / Scrapbook / Saved phrases / Level check / Micro missions /
  6-skill breakdown / Show meaning · Hide meaning / Replay.
- **목 데이터는 `src/data/`에만.** 화면 파일에 데이터를 인라인하지 않습니다.
- **라우트는 `app/` 파일 구조.** 화면을 추가하면 README의 화면 표도 함께 갱신합니다.
- 주석은 "왜"를 적습니다. 핸드오프 수치를 그대로 옮긴 곳은 출처를 남겨두세요.

## 브랜치 & 커밋

- 기본 브랜치는 `main`이며, `main`에 직접 푸시하지 않습니다.
- 작업은 브랜치를 따서 진행합니다: `feat/...`, `fix/...`, `chore/...`, `docs/...`
- 커밋 메시지는 한 줄 요약 + 필요 시 본문. 무엇을 왜 바꿨는지 알 수 있게 적습니다.
- PR은 `.github/pull_request_template.md`의 항목을 채워서 올립니다.

## UI 수정 요청 처리 규칙

사용자는 코드를 직접 고치지 않고 화면별 수정사항을 말로 전달합니다
("간격이 넓다", "카드가 너무 크다", "폰트가 다르다", "상단 여백을 줄여줘").
이런 요청은 아래 순서로 처리합니다.

1. **기준값을 먼저 확인한다.** 해당 화면의 `.dc.html` 시안에서 실제 선언값을 읽습니다.
   추측하거나 "보기 좋게" 조정하지 않습니다.
2. **영향 범위를 확인한다.** 고칠 값이 화면 파일에 있는지, 공통 컴포넌트/토큰에 있는지 확인합니다.
3. **공통 컴포넌트를 건드려야 하면 먼저 알린다.** 어떤 화면들이 함께 바뀌는지 말한 뒤 진행합니다.
   화면 하나만 바꿔야 하면 그 화면에서 로컬 스타일로 덮습니다.
4. **요청한 부분만 고친다.** 이미 시안과 맞는 값은 손대지 않고, 기능 로직은 바꾸지 않습니다.
5. **검증 후 보고한다.** `npm run lint` · `npm run typecheck` · `npm run export:web`을 돌리고,
   바뀐 값을 `변경 전 → 변경 후`로 적어 보고합니다.

### 공통 컴포넌트 영향 범위

값을 여기서 바꾸면 아래 화면이 전부 함께 바뀝니다. 한 화면만 바꿔야 할 때는 쓰지 마세요.

| 위치 | 함께 바뀌는 범위 |
|---|---|
| `src/theme/tokens.ts` · `typography.ts` | **전 화면** |
| `components/NavBar` | 헤더가 있는 14개 화면 |
| `components/Card` | 카드를 쓰는 11개 화면 |
| `components/Button` · `CtaDock` | 하단 CTA가 있는 6~7개 화면 |
| `components/Controls` | ON-2 · RP-1 · MY-1 · MY-2 · MY-3 |
| `components/Chip` | ON-2 · RP-1 · RV-1 · MY-1b (variant별로 분리돼 있어 variant 단위 수정은 안전) |
| `components/SkillBar` | ON-4 · RP-4 · MY-2 |
| `components/SituationCard` | HM-1 · RP-1 |
| `components/KoreanText` | RV-2 · RV-2a~RV-2e (미션 러너 전용) |
| `components/NativeLanguageSheet` | ON-2 · MY-1 · MY-1b (모국어 목록과 선택 동작) |
| `components/BubbleBookmark` | RP-3b · RV-6 (대화 말풍선 북마크) |
| `components/MicButton` | ON-3 · RP-3 · RV-2b (`distinctStates`는 ON-3만 켬) |

`Waveform`(ON-3) · `StepProgress`(RV-2) · `HomeParts`(HM-1)는 단일 화면 전용이라 자유롭게 고쳐도 됩니다.

## 작업 규칙

- 커밋과 푸시는 사용자가 요청할 때만 합니다.
- PR 생성도 명시적으로 요청받았을 때만 합니다.
- 변경 범위를 요청받은 것 이상으로 넓히지 않습니다.
- 비밀 값(토큰, API 키, `.env`)은 절대 커밋하지 않습니다. `.gitignore`에 이미 제외되어 있습니다.
- 린트·타입체크가 실패하면 결과를 그대로 보고합니다.

## 음성 (실제 동작)

- **TTS** — `src/services/speech.ts`. 기기 내장 음성 합성(`expo-speech`)으로 `ko-KR`을 읽습니다.
  문장은 rate 0.85, 낱말은 0.7. 서버도 API 키도 필요 없습니다.
  스피커 버튼과 `KoreanText`의 낱말 탭이 전부 여기로 들어옵니다.
- **녹음** — `src/services/recorder.ts`. `expo-audio`로 녹음하고 바로 되들을 수 있습니다.
  웹은 HTTPS에서만 마이크가 열립니다. 권한이 거부되면 녹음을 시작하지 않고 그 사실을 화면에 알립니다.

- **음성 인식(STT)** — `src/services/recognition.ts`. 브라우저 내장 인식으로 `ko-KR`을 받아씁니다.
  키도 서버도 없어서 정적 호스팅에 그대로 올라갑니다. **웹 전용**이고 Chrome·Edge·Safari에서
  동작합니다(Firefox 없음). 인식은 브라우저 제공업체 서버에서 이뤄지므로 인터넷이 필요합니다.
  네이티브 앱에서는 `supported`가 false가 되고 화면은 기존 목 동작으로 돌아갑니다.

한국어 음성이 없는 기기에서는 소리가 나지 않습니다. `useSpeaker()`의 `koreanVoice`로 확인할 수 있습니다.

판정은 이펙트가 아니라 인식 콜백(`start({ onTranscript, onEnd })`)에서 합니다.
이펙트에서 상태를 바꾸면 무엇이 판정을 유발했는지 코드에서 사라지고, 린트도 막습니다.

## 아직 목(mock)인 것

AI 대화 생성, RP-4 리포트의 6-스킬 점수, 레벨 진단, 로그인, 알림, 결제는 인터페이스만 있고 실제 연동이 없습니다.
결제는 `src/services/billing.ts`의 `sandbox` 모드로 동작하며 청구하지 않습니다. 화면은 이 파일만 부릅니다.
대본이 없는 상황을 다른 상황의 대본으로 대신하지 않습니다 — 없으면 없다고 보여줍니다.
RV-2b 말하기는 인식 결과를 목표 문장과 맞춰 실제로 판정하지만, 스킬별 점수는 고정값입니다.
로마자 툴팁은 `src/services/romanize.ts`의 규칙 기반 변환입니다(데이터의 `romanization`이 있으면 그 값이 우선).
RV-2a의 음절 하이라이트는 "그 글자로 알아들었다"는 뜻이지 받침 발음을 채점한 것이 아닙니다.
연동할 때는 `src/data/`의 타입(`src/data/types.ts`)을 그대로 만족시키면 화면을 고치지 않아도 됩니다.
