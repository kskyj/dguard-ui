# D-Guard 환경 세팅 가이드 (docs/SETUP-GUIDE.md)

> **이 파일은 Claude Code가 참조하는 세팅 가이드입니다.**
> 사람이 `"docs/SETUP-GUIDE.md 참고해서 환경 세팅하고 검증해줘"`라고 지시하면,
> Claude는 아래 항목을 순서대로 수행하고 각 단계를 검증합니다.
>
> **전제 조건**: 이 파일을 참조하기 전에 사람이 Mockup 저장소 클론과 `/init`을 이미 완료하여 `../dguard-ui-mockup/` 및 CLAUDE.md가 준비된 상태입니다.

---

## 0-1. .mcp.json 생성 (Spring Boot 환경설정 참조)

1. 프로젝트의 Spring Boot 환경설정 파일을 찾아 DB 접속 정보를 확인:
   - `src/main/resources/application.properties` 또는 `application.yml`
   - `spring.datasource.url`, `spring.datasource.username`, `spring.datasource.password` 값 확인
2. 확인한 DB 접속 정보로 프로젝트 루트에 `.mcp.json` 생성:

```json
{
  "mcpServers": {
    "postgres": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-postgres"],
      "env": {
        "POSTGRES_URL": "postgresql://{username}:{password}@{host}:{port}/{database}"
      }
    },
    "context7": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-context7"]
    }
  }
}
```

> **참고**: `{username}`, `{password}`, `{host}`, `{port}`, `{database}`는 Spring Boot 환경설정에서 읽은 실제 값으로 치환합니다.

## 0-2. JDK LSP 설정

프로젝트 루트의 `.claude/settings.json`에 추가:

```json
{
  "lsp": {
    "java": {
      "command": "jdtls",
      "args": ["-data", "/tmp/jdtls-workspace"]
    }
  }
}
```

## 0-3. CLAUDE.md 프로젝트 컨텍스트 보강

`/init`이 생성한 기존 CLAUDE.md 내용을 유지하면서, 아래 내용을 보강:

```markdown
## 프로젝트 개요
- 이미 운영 중인 D-Guard DB/서버 개인정보 검색 솔루션
- 이번 작업: 제공된 요구사항(Jira 22건)과 Mockup을 토대로 UI/UX 개선 및 신규 기능 추가
- 기존 코드를 최대한 재사용하고, 필요한 부분만 수정/추가하되, 새로 만드는 것이 더 좋으면 새로 만들기
- 세팅 가이드: `docs/SETUP-GUIDE.md` 참조
- 개발 가이드: `docs/DEVELOPMENT-PROMPT.md` 참조

## Mockup 참조
- Mockup HTML 파일: `../dguard-ui-mockup/` 디렉토리
- 요구사항: `../dguard-ui-mockup/requirements/DB변경데이터_260326.html`
- UI 스킬: `.claude/skills/dguard-ui/`

## 코딩 규칙
- Java: Google Java Style Guide
- Vue.js: SFC(Single File Component) + Composition API 사용
- API: RESTful 설계, `/api/v1/` prefix 사용
- 테스트: JUnit 5 (Backend), Vue Test Utils (Frontend)

## 개발 흐름
- 페이지별 순차 개발 (한 번에 하나의 페이지만)
- TDD: 테스트 먼저, 구현 후
- 구현 후 브라우저 검증 필수
- 중요 포인트마다 git commit

## 역할별 권한
- 관리자: 5가지 상태 전부 변경 가능 (미확인, 조치필요, 제외, 제외신청, 제외거부)
- 일반사용자: 미확인, 조치필요, 제외신청 3개만 변경 가능

## 검출 최소 단위
- 컬럼 + 검출룰(주민등록번호, 여권 등) 조합이 최소 단위
```

## 0-4. 스킬 변환 (Codex → Claude + Static HTML → Vue.js/Spring Boot)

> **중요**: 기존 스킬은 Codex/OpenAI 형식이며, Static HTML/CSS/JS 패턴으로 작성되어 있습니다.
> 단순 형식 변환이 아니라, Vue.js + Spring Boot 패턴으로 **내용 자체를 재작성**해야 합니다.

수행할 작업:

1. `../dguard-ui-mockup/skills/dguard-ui/` 분석
2. Claude용 Skill 형식 변환 → `.claude/skills/dguard-ui/SKILL.md` 생성
   - name, description, instructions를 Claude 기준에 맞게 수정
   - description에 사용 시점과 미사용 시점을 명확히 기술
   - references/ 폴더 문서를 연결
3. 내용을 Vue.js + Spring Boot 패턴으로 재작성:
   - Static HTML 레이아웃 → Vue 컴포넌트 구조
   - page-specific .html/.css/.js → Vue SFC(Component) 구조
   - mock-service.js 데이터 형태 → Spring Boot DTO + Repository
   - 세부 시각적/UX 규격은 `.claude/skills/dguard-ui/SKILL.md` 및 `references/common-patterns.md`를 우선 참조하여 보존
   - Verification 섹션은 Chrome 기반으로 수정
4. `references/common-patterns.md` → Vue 용어로 재작성
5. `references/page-input-checklist.md` → Vue.js + Spring Boot 기준으로 확장
6. `agents/openai.yaml` → Claude에서 불필요하므로 제외

## 0-5. 환경 확인

- `/mcp` 실행 → postgres, context7 연결 상태 확인
- `/chrome` 실행 → Chrome 연결 확인, "기본적으로 활성화" 설정 확인
- `/skills` 실행 → 스킬 목록 확인

## 0-6. 세팅 검증

모든 세팅 완료 후 검증:
- `.claude/skills/dguard-ui/SKILL.md` 가 Vue.js + Spring Boot 기준인지 확인 (Static HTML 참조 잔존 시 수정)
- `/mcp` 로 DB 연결 테스트 (간단한 쿼리 실행)
- Chrome으로 프로젝트 접근 가능한지 확인
- `CLAUDE.md`에 세팅 가이드, 개발 가이드 참조 경로가 있는지 확인
