# D-Guard 개발 프롬프트 (docs/DEVELOPMENT-PROMPT.md)

> **이 파일은 Claude Code가 참조하는 개발 가이드입니다.**
> 사람이 직접 읽을 필요 없습니다. Claude Code가 지시를 받으면 이 파일을 자동으로 참조합니다.
>
> **디렉토리 구조** (두 저장소가 같은 레벨에 위치):
> ```
> 상위 디렉토리/
> ├── {프로젝트}/        ← 프로젝트 루트 (Claude Code 실행 위치, Spring Boot + Vue.js)
> │   ├── CLAUDE.md
> │   ├── PLAN.md             ← Phase 1에서 생성되는 구현 계획서
> │   ├── docs/
> │   │   ├── README.md             ← 실행 가이드
> │   │   ├── SETUP-GUIDE.md        ← 환경 세팅 가이드 (Claude 참조)
> │   │   └── DEVELOPMENT-PROMPT.md ← 이 파일 (Claude 참조)
> │   ├── .mcp.json
> │   ├── .claude/settings.json
> │   ├── .claude/skills/dguard-ui/
> │   ├── src/
> │   └── ...
> └── dguard-ui-mockup/       ← Mockup 참조 저장소 (읽기 전용)
>     ├── index.html
>     ├── detection-list.html/.js
>     ├── skills/dguard-ui/           ← 원본 스킬 (Codex용으로 변환 참고만 하고 사용하지 않음)
>     ├── requirements/
>     └── ...
> ```
> - `./` 또는 경로 없음 → **프로젝트 루트** (프로젝트)
> - `../dguard-ui-mockup/` → **Mockup 저장소** (참조 전용)

---

## Phase 1: 전체 분석 및 계획

> Claude에게 `/plan` 모드에서 `"docs/DEVELOPMENT-PROMPT.md의 Phase 1을 참고해서 전체 분석하고 구현 계획을 PLAN.md로 만들어줘"`라고 지시하면,
> Claude는 아래 항목을 분석하고 `PLAN.md` 파일로 계획서를 생성합니다.

### 분석할 참조 자료

1. Mockup 페이지 (`../dguard-ui-mockup/`):
   - index.html (전체 개요)
   - detection-list.html + detection-list.js + mock-detection-service.js
   - analysis-history.html + analysis-history.js + mock-analysis-history-service.js
   - exception-request.html + exception-request.js + mock-exception-request-service.js
   - action-plan.html + action-plan.js + action-plan-create.html + action-plan-create.js + mock-action-plan-service.js
   - inspection-target.html + inspection-target.js + mock-inspection-target-service.js
   - inspection-target-detail.html + inspection-target-detail.js + mock-inspection-target-detail-service.js
   - inspection-run.html + inspection-run.js
   - shared.css + shared.js (공통 패턴)

2. 요구사항: `../dguard-ui-mockup/requirements/DB변경데이터_260326.html`

3. UI 스킬:
   - `.claude/skills/dguard-ui/SKILL.md`
   - `.claude/skills/dguard-ui/references/common-patterns.md`
   - `.claude/skills/dguard-ui/references/page-input-checklist.md`

4. 프로젝트 컨텍스트: `CLAUDE.md` + 기존 소스코드 구조 전체

### 계획서(PLAN.md)에 포함할 내용

#### A. 기존 코드 분석
- 현재 프로젝트에 이미 구현된 페이지 확인
- 각 페이지별로 "기존 수정" vs "신규 생성" 판단
- 기존 Spring Boot API 엔드포인트 목록 파악
- 기존 DB 테이블/엔티티 구조 파악

#### B. 페이지 간 의존성 그래프
- 페이지 간 네비게이션 흐름
- 공유 데이터 모델 (검출결과, 스케줄, 조치계획 등)
- 공통 컴포넌트 (사이드바, 테이블, 필터, 페이지네이션, 상태칩 등)

#### C. DB 스키마 설계 (mock-service.js 데이터 형태 기반)
- 각 mock-service.js의 데이터 구조를 PostgreSQL 테이블로 매핑
- 공유 enum 정의:
  * 검출상태: 미확인, 조치필요, 제외, 제외신청, 제외거부
  * 스케줄상태: 대기, 점검중, 완료, 실패, 중지
  * 조치계획상태: 등록대기, 등록완료, 조치완료
- 테이블 간 FK 관계 설계

#### D. 구현 순서 (의존성 기반 권장)
1. 공통 컴포넌트 (Layout, Sidebar, Table, Filter, Pagination)
2. 점검대상 (inspection-target) — 기본 CRUD, 라벨 관리
3. 점검대상 상세 (inspection-target-detail) — 점검대상에서 이동
4. 검출목록 (detection-list) — 핵심 페이지, 가장 복잡
5. 점검이력 (analysis-history) — 스케줄 관리
6. 점검수행 (inspection-run) — 스케줄 등록 별도 화면
7. 제외신청관리 (exception-request) — 검출목록 상태에 의존
8. 조치계획관리 (action-plan + action-plan-create) — 검출목록에서 이동

#### E. 각 페이지별 구현 범위
페이지마다:
- 관련 Jira 이슈 번호 (아래 Jira 매핑표 참조)
- 필요한 API 엔드포인트 목록
- 필요한 DB 테이블
- Vue 컴포넌트 구조
- 기존 API 활용 vs 신규 API 개발 판단

#### F. 페이지 간 공통 패턴
- 테이블 + 필터 + 페이지네이션 공통 컴포넌트
- 상태편집 패턴 (상태버튼 + textarea + 담당자선택)
- 상세필터 팝오버 패턴
- Gmail 스타일 일괄선택 배너
- 요약 타일 (전체/완료/진행중/오류) 필터 단축키
- Toast 알림 패턴
- 확인 모달 패턴

#### G. Must NOT Have (범위 외)
- 대시보드 페이지 (Mockup 없음)
- 게시판/공지&QnA 페이지 (별도 진행)
- 정책관리, 대상관리, 보안관리 하위 페이지 (Mockup 없음)
- SSO 실제 연동 (KB 인프라 접근 필요)
- worKB 실제 API 연동 (외부 서비스)

---

## Phase 2: 페이지별 구현 가이드

> Claude에게 `"검출목록 구현해줘"`라고 지시하면,
> Claude는 PLAN.md의 계획 + 이 섹션의 구현 절차 + 해당 페이지의 QA 시나리오를 참고하여 구현합니다.

### 구현 원칙

- **한 번에 하나의 페이지만** 구현
- **기존 코드 우선**: 기존 Spring Boot API, Controller, Service, Repository, Entity가 이미 있으면 반드시 재사용. 없는 것만 새로 만들기. 기존 코드를 무시하고 처음부터 다시 만들지 않기
- **새로 만드는 것이 더 좋으면 새로 만들기**: 기존 코드가 있더라도, 재사용보다 새로 만드는 것이 명확히 더 나은 경우에는 새로 만들기

### 각 페이지 구현 시 수행할 절차

#### Step 1: Mockup 분석
Mockup 파일(HTML + JS + mock-service)을 분석하여 정리:
- 테이블 컬럼 구성, 필터 항목, 액션 버튼, 상태값 정의
- 역할별 권한 차이, API 응답 데이터 형태

#### Step 2: 기존 코드 확인 (반드시 먼저)
- 관련 Vue 컴포넌트, Spring Boot Controller/Service/Repository, DB Entity/Table 확인
- 기존 REST API 엔드포인트 목록 파악
- 판단 결과를 표로 정리: `| 항목 | 기존 파일 | 판단(수정/신규) |`

#### Step 3: DB 마이그레이션 (필요시)
- Flyway/Liquibase 마이그레이션 스크립트 생성
- Entity 클래스 생성 또는 수정
- → git commit: `"feat(schema): add {PAGE} database migration"`

#### Step 4: 백엔드 테스트 (TDD, 신규 API만)
- Step 2에서 "신규"로 판단된 API만 테스트 작성
- 기존 API는 기존 테스트를 확인하고 필요시 보완만
- Controller 통합 테스트 (MockMvc) + Service 단위 테스트
- 테스트에 Jira 이슈 번호 주석 포함
- → git commit: `"test(api): add {PAGE} API endpoint tests"`

#### Step 5: 백엔드 구현 (기존 API 재사용 우선)
- 기존 API 재사용, 신규 API만 Controller → Service → Repository 패턴
- REST API: `/api/v1/{resource}`
- mock-service.js 데이터 형태와 일치하도록 DTO 정의
- 모르는 Spring Boot API는 Context7으로 확인
- 테스트 통과 확인
- → git commit: `"feat(api): implement {PAGE} REST endpoints"`

#### Step 6: 프론트엔드 구현
- Mockup HTML 구조 참조하여 Vue 컴포넌트 구현
- 공통 컴포넌트(DataTable, FilterToolbar 등) 활용
- API 연동, 역할별 권한 처리
- `.claude/skills/dguard-ui/SKILL.md` 패턴 준수
- 모르는 Vue.js API는 Context7으로 확인
- → git commit: `"feat(ui): implement {PAGE} Vue component"`

#### Step 7: 브라우저 검증
- Chrome으로 아래 **페이지별 QA 시나리오**에서 해당 페이지의 시나리오 실행
- → git commit: `"verify({PAGE}): browser verification passed"`

#### Step 8: 문제 수정
- 검증에서 발견된 문제 수정 후 재검증
- → git commit: `"fix({PAGE}): resolve verification issues"`

### 페이지별 Mockup 대응표

| 순서 | 페이지명 | Mockup HTML | Mock Service | 관련 Jira |
|------|----------|-------------|--------------|-----------|
| 2-0 | 공통 컴포넌트 | shared.css + shared.js | — | B0XNF01-1081 |
| 2-1 | 점검대상 | inspection-target.html | mock-inspection-target-service.js | B0XNF01-1061 |
| 2-2 | 점검대상 상세 | inspection-target-detail.html | mock-inspection-target-detail-service.js | B0XNF01-1062 |
| 2-3 | 검출목록 | detection-list.html | mock-detection-service.js | B0XNF01-1060, B0XNF01-1059, B0XNF01-1045 |
| 2-4 | 점검이력 | analysis-history.html | mock-analysis-history-service.js | B0XNF01-1101 |
| 2-5 | 점검수행 (스케줄등록) | inspection-run.html + inspection-run.js | (analysis-history와 공유) | B0XNF01-1101|
| 2-6 | 제외신청관리 | exception-request.html | mock-exception-request-service.js | B0XNF01-1058 |
| 2-7 | 조치계획관리 | action-plan.html + action-plan-create.html | mock-action-plan-service.js | B0XNF01-1088 |

> **참고**: 2-5 점검수행(inspection-run)은 점검이력에서 "스케줄 등록" 버튼 클릭 시 이동하는 별도 화면입니다.

### 공통 컴포넌트 구현 가이드 (2-0)

공통 컴포넌트는 `shared.css`와 `shared.js`를 분석하고, PLAN.md의 공통 패턴 추출 결과를 참고하여 구현:

1. **Layout** (사이드바 확장200px/축소64px + 헤더 + 콘텐츠, 메뉴는 B0XNF01-1081 참조)
2. **DataTable** (체크박스 선택 + Gmail 일괄선택 배너 + 정렬 + 행 선택)
3. **FilterToolbar** (텍스트 검색 280px + 상세필터 팝오버 + 필터 요약 행 + 목록 요약)
4. **Pagination** (페이지 크기 선택 + 이전/번호/다음)
5. **StatusChip** (상태별 색상 + 클릭 가능 필터 타일 모드)
6. **StatusEditor** (상태 버튼 그리드 + textarea 500자 + 담당자 드롭다운 + 역할별 제한)
7. **Toast / ConfirmModal**

세부 스타일 기준과 디자인 토큰은 `.claude/skills/dguard-ui/SKILL.md` 및 `.claude/skills/dguard-ui/references/common-patterns.md`를 우선 참조합니다.

### 페이지별 QA 시나리오

> 모든 시나리오에서 **콘솔 에러 0건** + **FHD(1920x1080) 레이아웃 깨짐 없음**을 공통으로 확인합니다.

**공통 컴포넌트 QA:**
1. Storybook 또는 테스트 페이지에서 각 컴포넌트 렌더링
2. DataTable: 행 5개 이상 렌더링 → 전체 체크박스 클릭 → 모든 행 체크 + Gmail 배너 표시 확인
3. DataTable: 헤더 클릭 시 정렬 아이콘 변경 + 행 순서 변경 확인
4. FilterToolbar: 텍스트 입력 → "검색 '키워드' 초기화" 요약 행 표시 확인
5. FilterToolbar: 상세필터 버튼 클릭 → 팝오버 → 옵션 선택 → "적용" → 필터 칩 표시 확인
6. Pagination: 페이지 2 클릭 → 데이터 변경 확인, 페이지 크기 변경 → 행 수 변경 확인
7. StatusEditor: 상태 버튼 클릭 → textarea 500자 제한 → 담당자 검색/선택 → 저장 활성화 확인
8. Toast: 저장 후 토스트 표시 + 자동 사라짐 확인
9. ConfirmModal: 삭제 → 모달 표시 → "취소"로 닫기 확인

**점검대상 (inspection-target) QA:**
1. 페이지 진입 → 테이블에 DB 목록 표시 (DB명, 테이블수, 컬럼수, 라벨, 최근점검일)
2. 검색창에 DB명 입력 → 필터링 확인
3. 상세필터 → 라벨 선택 → "적용" → 필터 칩 + 테이블 필터링 확인
4. 테이블 헤더 "테이블수" 클릭 → 정렬 확인
5. DB 행 클릭 → 점검대상 상세 페이지 이동 확인
6. "라벨 관리" → 추가/수정/삭제 모달 확인
7. 라벨 추가 → 이름+색상 → 저장 → 반영 확인

**점검대상 상세 (inspection-target-detail) QA:**
1. 페이지 진입 → DB 정보 요약 표시 (DB명, 호스트, 포트, 인스턴스)
2. 테이블 목록 표시 (테이블명, 컬럼수, 검출건수, 최근점검일)
3. 검출건수 클릭 → 검출목록 페이지로 해당 테이블 필터 적용 이동 확인
4. 체크박스 3개 선택 → "삭제" → 확인 모달 → 삭제 반영 확인
5. 관리자: 삭제 버튼 표시, 일반사용자: 숨김 확인

**검출목록 (detection-list) QA:**
1. 상단 요약 타일 표시 (전체/미확인/조치필요/제외/제외신청/제외거부 건수)
2. "미확인" 타일 클릭 → 미확인만 필터링 확인
3. 테이블 컬럼: DB명, 테이블명, 컬럼명, 검출룰, 검출건수, 상태, 담당자, 최종처리일시
4. 행 클릭 → 하단 상태편집 패널 → 상태 버튼 5개 확인
5. "조치필요" 클릭 → textarea 500자 제한 → 담당자 선택 → "저장" → 토스트 + 상태 갱신 확인
6. 일반사용자 → 상태 버튼 3개만(미확인/조치필요/제외신청) 표시 확인
7. 체크박스 5개 선택 → Gmail "5건 선택됨" 배너 확인
8. "전체 N건 선택" 링크 → 전체 결과 선택 확인
9. 검색창 입력 → 필터링 + "검색 '키워드' 초기화" 요약 행 확인

**점검이력 (analysis-history) QA:**
1. 스케줄 목록 테이블 (스케줄명, 대상DB, 상태, 반복주기, 최근실행, 다음실행)
2. 상태칩 색상 (대기=회색, 점검중=파랑, 완료=녹색, 실패=빨강, 중지=노랑)
3. "스케줄 등록" → 점검수행 페이지 이동 확인
4. 스케줄 행 클릭 → 상세 정보 (실행 이력, 검출 통계) 표시
5. "중지" → 확인 모달 → 상태 "중지" 변경 확인
6. "삭제" → 확인 모달 → 목록 제거 확인
7. 상세필터 "완료" → 완료 스케줄만 표시 확인

**점검수행 (inspection-run) QA:**
1. 스케줄 등록 폼 (스케줄명, 대상 선택, 검출룰 선택, 반복주기, 예외필터)
2. DB 선택 드롭다운 → 선택 시 테이블 목록 로딩 확인
3. 테이블 체크박스 3개 선택 → 선택 표시 확인
4. 검출룰 멀티선택: "주민등록번호", "여권번호" → 칩 표시 확인
5. 반복주기 "매일 02:00" → 반영 확인
6. "저장" → 점검이력 이동 + 목록 반영 확인
7. 필수값 미입력 시 "저장" 비활성화 확인

**제외신청관리 (exception-request) QA:**
1. 제외신청 목록 (신청자, DB명, 테이블명, 컬럼명, 검출룰, 사유, 상태, 신청일)
2. 상태칩: "제외신청" / "제외" / "제외거부"
3. 관리자 → 행 클릭 → "승인(제외)" / "거부(제외거부)" 버튼 확인
4. "승인" → 모달 → 상태 "제외" + 검출목록 해당 항목도 "제외" 갱신 확인
5. "거부" → 사유 입력 → 상태 "제외거부" 확인
6. 일반사용자 → 승인/거부 숨김, 본인 건만 표시 확인
7. 상세필터 "제외신청"만 → 미처리 건만 확인

**조치계획관리 (action-plan + action-plan-create) QA:**
1. 목록 테이블 (계획명, 담당자, 대상건수, 상태, 작성일, 완료예정일)
2. 상태칩: "등록대기" / "등록완료" / "조치완료"
3. "조치계획 작성" → action-plan-create 이동 확인
4. 작성: 계획명 + 대상 검출항목 선택 + 완료예정일 → 확인
5. "저장" → 목록 이동 + 등록 항목 표시 (상태: "등록대기")
6. 기존 행 클릭 → 상세 (검출항목 목록 + 이행점검 버튼)
7. 일반사용자 → 본인 조치계획만 표시 확인
8. 관리자 → 전체 표시 확인

---

## Phase 3: 통합 검증 가이드

> Claude에게 `"docs/DEVELOPMENT-PROMPT.md의 Phase 4를 참고해서 통합 검증해줘"`라고 지시하면,
> Claude는 아래 검증을 수행합니다.

### 3-1. 전체 빌드 확인
- 백엔드: `./gradlew clean build` (또는 `mvn clean package`)
- 프론트엔드: `npm run build`
- 모든 테스트 통과 확인

### 3-2. 전체 페이지 브라우저 검증
Chrome으로 순차 검증:
1. 점검대상 → DB 클릭 → 점검대상 상세 이동 확인
2. 점검대상 상세 → 검출건수 클릭 → 검출목록 이동 확인
3. 검출목록 → 상태 "제외신청" 변경 → 제외신청관리 반영 확인
4. 검출목록 → 조치계획작성 → 조치계획관리 반영 확인
5. 점검이력 → 스케줄 등록/수정/중지/삭제 확인
6. 사이드바 메뉴 네비게이션 전체 확인

### 3-3. 역할별 검증
- 관리자 → 모든 기능 접근 가능 확인
- 일반사용자 → 제한된 기능만:
  * 삭제 버튼 숨김
  * 상태 변경 제한 (미확인, 조치필요, 제외신청만)
  * 본인 작성 조치계획서만 표시

→ git commit: `"verify(integration): full integration verification passed"`

---

## 📎 부록: MCP 서버 용도

| MCP 서버 | 용도 | 활용 시점 |
|----------|------|----------|
| `postgres` | DB에 직접 연결하여 테이블 구조 파악, 쿼리 실행, 데이터 확인 | 페이지 구현 전 스키마 확인, API 개발, 디버깅 |
| `context7` | Vue.js, Spring Boot, PostgreSQL 등 공식 문서 실시간 조회 | API 사용법 확인, 최신 패턴 참조 |

## 📎 부록: 참조 자료 매핑표

| 목적 | 참조 파일 |
|------|----------|
| 화면 구조/레이아웃 | `../dguard-ui-mockup/{page}.html` |
| 인터랙션/이벤트 | `../dguard-ui-mockup/{page}.js` |
| 데이터 형태/API 응답 | `../dguard-ui-mockup/mock-{page}-service.js` |
| 시각적 규격/디자인 토큰 | `.claude/skills/dguard-ui/references/common-patterns.md` |
| 페이지 입력 체크리스트 | `.claude/skills/dguard-ui/references/page-input-checklist.md` |
| 전체 요구사항 | `../dguard-ui-mockup/requirements/DB변경데이터_260326.html` |
| 공통 UI 패턴 | `../dguard-ui-mockup/shared.css` + `shared.js` |
| 전체 흐름 개요 | `../dguard-ui-mockup/index.html` |

## 📎 부록: Jira 이슈 → 페이지 매핑표

### UI/UX 변경 (Mockup 페이지 대응)

| Jira Key | 우선순위 | 요약 | 대응 페이지 |
|----------|---------|------|-----------|
| B0XNF01-1060 | 최상위 | 검출목록 UI/UX 변경 | detection-list |
| B0XNF01-1059 | 최상위 | 검출결과 상태 관리 (5 states) | detection-list (상태편집) |
| B0XNF01-1101 | 최상위 | 점검이력 UI/UX 변경 | analysis-history |
| B0XNF01-1081 | 최상위 | 사이드바 메뉴 구성 변경 | 공통 Layout/Sidebar |
| B0XNF01-1061 | 중간 | 점검대상 UI/UX 변경 | inspection-target |
| B0XNF01-1062 | 중간 | 점검대상 상세 UI/UX 변경 | inspection-target-detail |
| B0XNF01-1058 | 중간 | 제외신청관리 UI/UX | exception-request |
| B0XNF01-1088 | 중간 | 조치계획 UI/UX | action-plan + action-plan-create |


### 범위 외 (이번에 포함하지 않음)

| Jira Key | 우선순위 | 요약 | 대응 페이지 |
|----------|---------|------|-----------|
| B0XNF01-1070 | 중간 | 게시판 개선 | 별도 진행 |
| B0XNF01-1071 | 중간 | SSO 연동 | KB 인프라 접근 필요 |
| B0XNF01-1072 | 중간 | worKB 연동 + 쪽지 | 외부 서비스 연동 필요 |
| B0XNF01-1053 | 최상위 | Dirty Read 방식 검색 | 별도 진행 |
| B0XNF01-1054 | 최상위 | 최종처리일시 기준 변경 | 별도 진행 |
| B0XNF01-1056 | 최상위 | Oracle 소문자테이블 버그 | 별도 진행 |
| B0XNF01-1073 | 중간 | REST API (3 endpoints) | 별도 진행 |
| B0XNF01-1074 | 중간 | 예외필터 멀티선택 | 별도 진행 |
| B0XNF01-1057 | 중간 | 예외필터 추가 후 재점검 없이 반영 | 별도 진행 |
| B0XNF01-1063 | 최상위 | CSV(tab) 일괄 등록 | 별도 진행 |
| B0XNF01-1055 | 최상위 | 재검색시 상태 유지/갱신 | 별도 진행 |
| B0XNF01-1043 | 최상위 | 최소 검출단위 = 검출룰 기준 | 별도 진행 |
| B0XNF01-1044 | 최상위 | 엑셀 출력 + 고유 URL 링크 | 별도 진행 |
| B0XNF01-1045 | 최상위 | 이행점검 3가지 방식 | 별도 진행 |

---

## Final Verification Wave

> **⚠️ 이 단계는 모든 구현이 완료된 후, 사람이 명시적으로 "확인" 한 뒤에만 작업을 완료로 표시합니다.**

모든 Phase가 완료되면:
1. 전체 테스트 스위트 실행 결과 확인
2. 모든 페이지 브라우저 검증 스크린샷 확인
3. Git 로그 확인 — 모든 커밋이 atomic하고 의미있는지 확인
4. 누락된 요구사항 없는지 Jira 이슈 매핑표 대조 확인
