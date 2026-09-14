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

## 코드 규칙

- **디자인 토큰을 쓴다.** 색상·간격·라운드·섀도우는 `src/theme/tokens.ts`, 타이포는 `src/theme/typography.ts`.
  화면에서 `#FF6A3D`나 `padding: 24` 같은 값을 직접 쓰지 않습니다.
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

## 작업 규칙

- 커밋과 푸시는 사용자가 요청할 때만 합니다.
- PR 생성도 명시적으로 요청받았을 때만 합니다.
- 변경 범위를 요청받은 것 이상으로 넓히지 않습니다.
- 비밀 값(토큰, API 키, `.env`)은 절대 커밋하지 않습니다. `.gitignore`에 이미 제외되어 있습니다.
- 린트·타입체크가 실패하면 결과를 그대로 보고합니다.

## 아직 목(mock)인 것

STT, TTS, AI 대화 생성, 발화 채점, 로마자 변환은 인터페이스만 있고 실제 연동이 없습니다.
연동할 때는 `src/data/`의 타입(`src/data/types.ts`)을 그대로 만족시키면 화면을 고치지 않아도 됩니다.
