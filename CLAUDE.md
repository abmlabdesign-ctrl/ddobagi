# CLAUDE.md

Claude Code가 이 저장소에서 작업할 때 참고하는 가이드입니다.

## 프로젝트

- 저장소: `abmlabdesign-ctrl/ddobagi`
- 상태: 초기 세팅 단계. 아직 애플리케이션 코드가 없습니다.
- 기술 스택이 정해지면 아래 "빌드 / 테스트" 절에 실제 명령어를 채워주세요.

## 빌드 / 테스트

아직 정의된 명령어가 없습니다. 스택이 정해지면 다음 형식으로 기록합니다.

```
설치:   (예: npm install)
개발:   (예: npm run dev)
빌드:   (예: npm run build)
테스트: (예: npm test)
린트:   (예: npm run lint)
```

CI(`.github/workflows/ci.yml`)는 `package.json` 또는 `pyproject.toml`/`requirements.txt`가
생기면 해당 잡이 자동으로 실행되도록 되어 있습니다. 다른 스택을 쓰게 되면 워크플로도 함께 수정하세요.

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
- 커밋 전에 사용 가능한 린트·테스트를 실행하고, 실패하면 결과를 그대로 보고합니다.

## 디렉터리

```
.github/
  workflows/ci.yml        푸시·PR 시 실행되는 CI
  ISSUE_TEMPLATE/         버그 리포트 / 기능 요청 양식
  pull_request_template.md
.gitignore
CLAUDE.md                 이 파일
README.md
```
