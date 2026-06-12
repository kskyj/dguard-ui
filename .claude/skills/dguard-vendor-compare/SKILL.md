---
name: dguard-vendor-compare
description: D-Guard UI mock 사양(html/css/js)과 외부 업체가 https://121.130.177.24:29443 에 구현한 실제 페이지를 비교하여 누락/변경/추가 사항 보고서를 작성한다. 사용자가 검출목록·점검대상·점검이력·제외신청관리·조치계획관리·커뮤니티·정책관리·대상관리·보안관리 등 D-Guard 관련 페이지 mock 파일을 주면서 "외부 구현이랑 비교해줘", "차이 정리해줘", "보고서 만들어줘"라고 요청할 때 사용. 8개 페이지에 동일하게 적용.
---

# D-Guard 외부 구현 비교 검증

D-Guard mock 페이지(html/css/js)와 외부 업체(`https://121.130.177.24:29443/app/...`) 구현을 비교하고 마크다운 보고서를 만든다. mock의 모든 주요 기능(컬럼/필터/정렬/페이징/모달/저장/삭제/이행점검/변경이력/역할권한/URL 라우팅/시각 디자인)이 외부에 어떻게 구현되어 있는지, 또는 누락/변경/추가됐는지 객관적으로 정리한다.

## 입력

- **mock 파일 세트**: 사용자가 제공하는 `<page>.html`, `<page>.css`, `<page>.js` (예: `detection-list.html`)와 관련 의존(`mock-*-service.js`, `shared.js/css`)
- **외부 페이지 URL**: 기본값 `https://121.130.177.24:29443/app/<route>` — 사용자가 다른 URL을 주면 그것을 사용
- **자격 증명**: 기본값 `inebsoft / Ineb!@#$5`. 사용자가 다른 계정을 주면 사용

## 출력

`F:\dev\workspace\dguard-ui\<page>-vendor-comparison.md` (예: `detection-list-vendor-comparison.md`) 마크다운 보고서. 템플릿은 `templates/report-template.md` 참고.

## 워크플로

### Phase 1 — Mock 사양 파악

1. 사용자가 지정한 mock 파일을 모두 Read한다.
   - 메인: `<page>.html`, `<page>.css`, `<page>.js`
   - 의존: `mock-<page>-service.js`(있으면), `shared.js`, `shared.css`
2. 다음 항목을 머릿속(또는 메모)에 정리한다 — `templates/inspection-checklist.md`의 카테고리를 그대로 사용:
   - 레이아웃 / 사이드바 / 헤더(Hero) / 툴바
   - 테이블 컬럼 + 정렬 가능 키
   - 페이지 사이즈 옵션 / 페이징
   - 행 선택 / 일괄 액션 / 모달 (일괄수정·삭제·확인)
   - 우측/하단 상세 패널 카드 구성
   - 변경 이력 모달 컬럼
   - 역할 기반 권한 (관리자/일반사용자) 분기
   - URL 라우팅 파라미터
   - 토스트 메시지 문구

### Phase 2 — 외부 페이지 접속 (Chrome 브라우저 자동화)

`mcp__claude-in-chrome__*` 도구를 사용. 도구는 `ToolSearch`로 사전 로드:
`select:mcp__claude-in-chrome__tabs_context_mcp,mcp__claude-in-chrome__tabs_create_mcp,mcp__claude-in-chrome__navigate,mcp__claude-in-chrome__read_page,mcp__claude-in-chrome__find,mcp__claude-in-chrome__form_input,mcp__claude-in-chrome__computer,mcp__claude-in-chrome__javascript_tool,mcp__claude-in-chrome__read_console_messages,mcp__claude-in-chrome__read_network_requests,mcp__claude-in-chrome__resize_window`

1. `tabs_context_mcp(createIfEmpty: true)` 호출
2. `resize_window(width: 1600, height: 1000)` — 모바일 사이즈로 떨어지는 것 방지
3. `navigate` → `https://121.130.177.24:29443/app/<route>` (인증 안 됐으면 로그인 페이지로 리다이렉트됨)
4. **로그인** — 자세한 절차는 `templates/login-procedure.md` 필독. 핵심:
   - `form_input`으로 입력해도 React가 인식 못하는 경우가 있음 → **JavaScript `setNativeValue` + `input/change` 이벤트 디스패치**로 강제 입력
   - 비밀번호 특수문자(`!@#$`) 키 입력으로는 깨질 수 있음 — JS 직접 주입 권장
   - 1차 실패 후 백엔드가 일시 잠금하면 사용자에게 **"브라우저에서 직접 로그인해 달라"** 고 요청

### Phase 3 — 인터랙션 검증 (mock 모든 기능에 대해)

`templates/inspection-checklist.md`의 항목을 위에서 아래로 수행. 각 항목별로:

- DOM/스크린샷으로 구조 확인
- 클릭/입력으로 동작 확인
- 토스트/네트워크/URL 변화 캡처

**저장/삭제/등록 등 영속 변경 동작도 직접 실행**한다 (사용자가 사전 승인). 단:
- **확인 다이얼로그(alert/confirm/prompt)**는 브라우저를 멈추게 하므로 발생 가능성이 보이면 사용자에게 먼저 알리기
- 가능한 경우 변경한 값을 원래대로 되돌림 (삭제는 제외)
- 실제 데이터 변경 흔적은 보고서 마지막 부록에 기록

### Phase 4 — 보고서 작성

`templates/report-template.md`를 복사해 `F:\dev\workspace\dguard-ui\<page>-vendor-comparison.md`에 저장 후 실제 데이터로 채운다. 빈 섹션은 "(해당 없음)"으로 명시.

## 핵심 함정 (Common Pitfalls)

1. **React controlled input은 `form_input`이나 `type` 액션으로 값을 못 넣는 경우가 있다.**
   해결: `javascript_tool`로 `setNativeValue` 헬퍼 사용:
   ```js
   const setNativeValue = (el, value) => {
     const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
     setter.call(el, value);
     el.dispatchEvent(new Event('input', { bubbles: true }));
     el.dispatchEvent(new Event('change', { bubbles: true }));
   };
   ```

2. **윈도우 사이즈가 540×855(모바일)로 시작**하는 경우가 있다.
   → `resize_window(1600, 1000)` 먼저 호출.

3. **토스트는 매우 짧게 사라진다 (~2초).**
   클릭 직후 즉시 `screenshot` 또는 `javascript_tool`로 `[role="status"]` 캐치.

4. **`read_page`/`find`로 잡은 ref_ID는 페이지 갱신 시 바로 무효화**된다.
   동일 행/요소를 두 번 조작하려면 매번 다시 `find` 호출.

5. **세션 만료가 빠르다.** 다른 페이지를 한참 보다 돌아오면 401로 로그인 페이지 리다이렉트되니 매 phase 시작 시 URL 확인.

6. **사이드바 메뉴 라우팅** (외부 기준, 검출목록 분석 시 확인됨):
   - 검출목록 `/app/detection`
   - 점검대상 `/app/inspection/target`
   - 점검이력 `/app/schedule/history`
   - 제외신청관리 `/app/exception`
   - 조치계획관리 `/app/action-plan`
   - 커뮤니티 `/app/community`
   - 대시보드 `/index`
   - (정책관리·대상관리·보안관리는 사이드바에 있으나 라우트 미확인 — 첫 검증 시 클릭으로 확인)

7. **mock의 `target명` 표시 / `사용자 메뉴` / `역할 스위치` 같은 mock-only 위젯은 외부에 없을 가능성이 높다.** "누락" 섹션에 기본으로 의심하고 검증.

8. **외부의 추가 기능(검색 카테고리 분리, URL 라우팅, 페이지 사이즈 50/100 등)은 mock에 없으므로 "추가" 섹션에 별도로 정리**한다.

## 진행 상황 추적

페이지 작업 시 `TaskCreate`로 페이지별 작업을 만들어 진행률을 추적한다. 페이지마다 다음 7개 하위 작업이 보통 필요:

1. mock 파일 read + 사양 정리
2. 외부 페이지 접속 + 초기 구조 분석
3. 정렬·페이징·검색·필터 검증
4. 행 선택 + 상세 패널 검증
5. 모달(일괄수정·삭제·변경이력) 검증
6. **저장/삭제/이행점검/내보내기 등 실제 동작 실행**
7. 보고서 작성 + 저장

## 첫 페이지 결과 (참고)

`detection-list-vendor-comparison.md`에 검출목록 비교가 이미 끝나 있다. 다른 페이지 비교 시 형식과 발견 패턴을 그대로 참고.

## 메모리/선호

- **외부 시스템 저장/삭제/등록 동작은 사용자 사전 승인됨** — `C:\Users\kbuser_win10\.claude\projects\F--dev-workspace-dguard-ui\memory\feedback_external_system_destructive_actions.md` 참조.
- 보고서는 한국어 markdown.
- 우선순위 라벨은 🔴 High / 🟡 Medium / 🟢 Low.
