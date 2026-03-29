# D-Guard UI 개선 개발 가이드

> **목적**: 이미 구현된 D-Guard DB변경데이터 검색 솔루션에 대해, 제공된 요구사항·Mockup·UI Skills를 토대로 Claude Code를 사용하여 **기존 솔루션을 개선 개발**하기 위한 가이드입니다.
>
> **현재 상태**: 솔루션이 이미 운영 중이며, UI/UX 개선 및 신규 기능 추가가 필요한 상황입니다.
>
> **기술 스택**: PostgreSQL + Spring Boot + Vue.js
>
> **제공 자료**: https://github.com/kskyj/dguard-ui
> - 요구사항 (Jira 22건)
> - 요구사항이 반영된 Mockup HTML 8개 페이지
> - UI/UX 개발용 AI Skills (디자인 토큰, 컴포넌트 패턴, 체크리스트)

---

## 문서 구조

| 파일 | 역할 | 대상 |
|------|------|------|
| `README.md` | 실행 가이드 (이 파일) | 사람 확인 |
| `docs/SETUP-GUIDE.md` | 환경 세팅 상세 | Claude가 참조 |
| `docs/DEVELOPMENT-PROMPT.md` | 개발 가이드 (Phase 1~4 + 부록) | Claude가 참조 |

> `docs/SETUP-GUIDE.md`와 `docs/DEVELOPMENT-PROMPT.md`는 사람이 직접 읽을 필요 없습니다.
> Claude Code가 지시를 받으면 해당 파일을 자동으로 참조합니다.

---

## 전체 진행 흐름

```
사전 준비 → 환경 세팅 → 분석 + 계획 → 계획 검토/피드백 → 순차 구현 → 통합 검증
```

---

## 1단계: 사전 준비 (사람이 직접, 1회만)

1. **Chrome 확장 프로그램 설치** (브라우저에서 직접 설치)
   - Chrome 웹 스토어: https://chromewebstore.google.com/detail/claude/fcoeoabgfenejglbffodgkkbkcdhcgfn

2. **기존 소스코드 Root에서 Claude Code 실행 및 프로젝트 초기화(기존 진행한 경우 Skip)**
   ```bash
   cd $소스코드_ROOT
   claude --dangerously-skip-permissions
   /init
   ```
   > 기존 코드를 분석하여 CLAUDE.md를 자동 생성합니다.

---

## 2단계: 환경 세팅 (Claude에게 지시)

Claude 세션에서 아래 프롬프트를 입력합니다:

```
docs/SETUP-GUIDE.md 참고해서 환경 세팅하고 검증해줘
```

> Claude가 Mockup 클론, MCP 설정(Spring Boot 환경설정에서 DB 정보 참조), JDK LSP, CLAUDE.md 보강, 스킬 변환, 검증을 순서대로 수행합니다.

---

## 2-1단계: 새 세션 시작

환경 세팅이 끝나면 새 Claude 세션을 시작합니다:

```
/new
```

> 환경 세팅 로그와 개발 컨텍스트를 분리하기 위해, 분석 + 계획은 새 세션에서 시작합니다.

---

## 3단계: 분석 + 계획 (Plan 모드)

```
/plan
```

Plan 모드를 켜고 아래 프롬프트를 입력합니다:

```
docs/DEVELOPMENT-PROMPT.md의 Phase 1을 참고해서 전체 분석하고 구현 계획을 PLAN.md로 만들어줘
```

> Claude가 기존 코드, Mockup, 요구사항, DB 스키마를 분석하여 PLAN.md를 생성합니다.

---

## 4단계: 계획 검토 + 피드백 (선택)

PLAN.md가 생성되면 내용을 확인합니다. 수정이 필요하면 **Plan 모드 상태에서** 피드백합니다:

```
PLAN.md에서 검출목록을 점검대상보다 먼저 구현하도록 순서 바꿔줘
```

```
PLAN.md에서 대시보드 페이지는 범위에서 제외해줘
```

> 피드백을 여러 번 줄 수 있습니다. PLAN.md가 만족스러우면 다음 단계로 진행합니다.

---

## 5단계: 구현 시작

Plan 모드를 해제하고 구현 프롬프트를 입력합니다:

```
/plan
```

```
PLAN.md와 docs/DEVELOPMENT-PROMPT.md 참고해서 순차적으로 구현해줘
```

> Claude가 PLAN.md의 계획 + DEVELOPMENT-PROMPT.md의 구현 절차·QA 시나리오를 참고하여
> 페이지별로 순차 구현합니다 (DB → 백엔드 → 프론트엔드 → 브라우저 검증 → git commit).

---

## 6단계: 공통 연계 기능 + 통합 검증

페이지 구현이 모두 완료되면:

```
docs/DEVELOPMENT-PROMPT.md의 Phase 3을 참고해서 공통 연계 기능 구현해줘
```

```
docs/DEVELOPMENT-PROMPT.md의 Phase 4를 참고해서 통합 검증해줘
```

---

## ⚠️ 컨텍스트 관리 (중요)

- 페이지 2~3개 구현할 때마다 `/compact` 명령으로 컨텍스트를 압축하세요.
- `/compact` 후에도 Claude는 `docs/DEVELOPMENT-PROMPT.md`와 `PLAN.md`를 다시 읽어서 맥락을 복구합니다.
- 환경 세팅이 끝난 뒤에는 `/new`로 새 세션을 시작하고, 분석 + 계획을 시작한 이후부터는 같은 세션을 유지하는 것이 중요합니다.
- `/compact` 직후 첫 지시에는 `"docs/DEVELOPMENT-PROMPT.md와 PLAN.md를 다시 읽고, {페이지명} 구현해줘"` 라고 하면 됩니다.

---

## 전체 작업 과정

| 순서 | 누가 | 입력 |
|------|------|------|
| 1 | 사람 | Chrome 확장 설치 (브라우저) |
| 2 | 사람 | `claude --dangerously-skip-permissions` |
| 3 | 사람 | `/init` |
| 4 | 사람 → Claude | `docs/SETUP-GUIDE.md 참고해서 환경 세팅하고 검증해줘` |
| 5 | 사람 | `/new` |
| 6 | 사람 | `/plan` |
| 7 | 사람 → Claude | `docs/DEVELOPMENT-PROMPT.md의 Phase 1을 참고해서 전체 분석하고 구현 계획을 PLAN.md로 만들어줘` |
| 8 | 사람 → Claude | (선택) PLAN.md 피드백: `"PLAN.md에서 ○○ 수정해줘"` |
| 9 | 사람 | `/plan` (해제) |
| 10 | 사람 → Claude | `PLAN.md와 docs/DEVELOPMENT-PROMPT.md 참고해서 순차적으로 구현해줘` |
| 11 | 사람 → Claude | `docs/DEVELOPMENT-PROMPT.md의 Phase 3을 참고해서 공통 연계 기능 구현해줘` |
| 12 | 사람 → Claude | `docs/DEVELOPMENT-PROMPT.md의 Phase 4를 참고해서 통합 검증해줘` |
| 수시 | 사람 | `/compact` (페이지 2~3개마다) |
