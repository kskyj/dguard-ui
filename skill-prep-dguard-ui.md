# D-Guard UI Skill Prep

## 목적
- D-Guard UI를 정적 멀티페이지 목업 구조로 전달하기 위한 기준 문서다.
- 이 문서는 `skill-creator`로 D-Guard UI 스킬을 보정하거나 재작성할 때 참고하는 준비 문서다.
- 기준 예시는 현재 워크스페이스의 멀티페이지 구조이며, 단일 `index.html + styles.css + app.js` 구조를 더 이상 기본 전제로 두지 않는다.

## 현재 기준 구조

### 전달물 성격
- 목적은 서버 연동용 앱이 아니라 업체 전달용 정적 목업이다.
- 각 페이지는 독립 HTML 파일로 열어 구조를 파악할 수 있어야 한다.
- 공통화는 `공통 스타일 + 공통 유틸`까지만 적용한다.
- HTML 자체를 과도하게 템플릿화하지 않는다.

### 권장 파일 구조
- 루트 진입/안내: `index.html`
- 공통 스타일: `shared.css`
- 공통 동작: `shared.js`
- 페이지별 화면:
  - `detection-list.html`
  - `detection-list.css`
  - `detection-list.js`
  - `analysis-history.html`
  - `analysis-history.css`
  - `analysis-history.js`
- 페이지별 목업 데이터:
  - `mock-detection-service.js`
  - `mock-analysis-history-service.js`

### 파일명 변경 기준
- 기존 `index.html` 단일 화면은 `detection-list.html`로 역할을 분리했다.
- 기존 `styles.css`는 `shared.css + detection-list.css + analysis-history.css` 구조로 나눴다.
- 기존 `app.js`는 `shared.js + detection-list.js + analysis-history.js` 구조로 나눴다.
- 기존 `mock-service.js`는 `mock-detection-service.js`로 이름을 명확히 바꾸고, 새 페이지용 `mock-analysis-history-service.js`를 분리했다.
- 현재 `index.html`은 실제 업무 화면이 아니라 페이지 진입용 목차/안내 페이지다.

### 구조 원칙
- `index.html`은 실제 업무 페이지가 아니라 목업 진입용 목차 또는 안내 페이지로 유지할 수 있다.
- 공통 셸, 버튼, 카드, 테이블, 필터, 페이지네이션, 토스트 같은 범용 UI는 `shared.css`와 `shared.js`에 둔다.
- 특정 페이지에만 필요한 레이아웃, 우측 패널, 상세 카드, 상태 편집 패턴은 해당 페이지 CSS/JS에 둔다.
- 페이지별 목업 데이터와 샘플 비즈니스 규칙은 페이지별 mock service로 분리한다.
- 스킬 문서도 이 구조를 기준 예시로 설명해야 한다.
- 새 페이지를 추가할 때도 `shared.*`를 먼저 검토하고, 공통이 아닌 경우에만 page-specific 파일로 내려야 한다.

## 1. Skill로 고정할 공통 범위

### 1.1 레이아웃 규칙
- 기본 레이아웃은 `좌측 사이드바 + 우측 메인 영역` 구조를 사용한다.
- 사이드바 기본 폭은 확장 `200px`, 축소 `64px`를 기준으로 둔다.
- 메인 영역은 `상단 헤더 카드 + 본문 카드` 구조를 사용한다.
- 본문은 카드 중심으로 구성하고, 마케팅 랜딩처럼 여백이 큰 화면보다 운영형 밀도를 유지한다.
- 기준 화면은 FHD, 브라우저 100% 배율이다.

### 1.2 헤더 패턴
- 헤더는 `페이지 제목 + 강조 대상 pill + breadcrumb + 우측 사용자 메뉴` 구조를 사용한다.
- 헤더는 tall hero가 아니라 compact white card를 기본으로 한다.
- breadcrumb 구분자는 `>`를 사용한다.
- breadcrumb 링크는 hover 피드백을 갖고, 현재 항목은 더 진하고 무겁게 표시한다.
- 사용자 메뉴는 `아이콘 + 사용자 식별자 + 드롭다운 표시` 형태의 compact pill을 사용한다.

### 1.3 사이드바 패턴
- 사이드바는 보라 계열 그라데이션/톤을 유지한다.
- 메뉴는 `아이콘 + 라벨` 구조를 사용한다.
- 축소 상태에서는 아이콘 위주로 동작한다.
- 테스트용 역할 전환 UI가 있으면 사이드바 하단에 둔다.
- 메뉴 데이터는 한 곳에서 정의하고 각 페이지는 active 상태만 다르게 적용한다.

## 2. 공통 디자인 토큰
- 페이지 배경: `#EDF0F5`
- 카드 배경: `#FFFFFF`
- 메인 액센트: `#987BE9`
- 주요 액션 버튼: `#727CF4`
- 버튼 텍스트: `#FFFFFF`
- 테이블은 세로 보더 없이 가로 구분 중심으로 구성한다.

## 3. 타이포그래피와 밀도

### 3.1 헤더
- 페이지 제목: `18px`, `font-weight: 800`
- breadcrumb: `12px`
- breadcrumb 현재 항목: `font-weight: 700`
- 사이드바 라벨: `14px`, `font-weight: 700`

### 3.2 테이블
- `detection-list.html` 메인 검출목록 테이블 본문: `14px`
- `detection-list.html` 메인 검출목록 테이블 헤더: `13px`
- `detection-list.html` 하위 개인정보 목록 테이블 본문: `13px`
- `detection-list.html` 하위 개인정보 목록 테이블 헤더: `12px`
- 숫자 컬럼은 기본 우측 정렬을 사용한다.

### 3.3 입력/버튼
- 일반 버튼 높이: `32px`
- 일반 버튼 폰트 크기: `11px`
- 주요 액션 최소 폭: `92px`
- 표 상단 액션 버튼 폰트 크기: `14px`
- 표 상단 액션 버튼 높이: `32px`
- 표 상단 액션 버튼은 `단색 SVG 아이콘 + 텍스트` 조합을 사용한다.
- 표 상단 액션 버튼 아이콘은 `currentColor`를 따르고 텍스트와 세로 가운데 정렬되어야 한다.
- 검색 input 기본 폭: `280px`
- 상태 편집 textarea 본문: `13px`
- 상태 편집 placeholder: `12px`
- 글자수 카운터: `12px`

## 4. 상단 검색/액션 바 규칙
- 기본 구성은 `검색 input + 상세필터 버튼 + 필터 상태 + 액션 버튼`이다.
- 가능하면 한 줄 배치를 유지한다.
- 액션 버튼은 우측 정렬을 기본으로 한다.
- 주요 액션 버튼은 컬러 이모지 대신 단색 아이콘 + 텍스트 조합을 기본으로 사용한다.
- 액션 버튼 아이콘은 `currentColor`를 따르는 단색 SVG를 우선 사용한다.
- 아이콘과 텍스트는 세로 가운데 정렬되어야 하며, 현재 기준 아이콘 크기는 `14px`이다.
- 검출목록처럼 상단 검색/액션 바 안에 목록 요약 캡션을 둘 수 있다.
- 현재 기준 요약 형식은 `전체 8건 1 - 5 표시됨 5건 선택됨`이다.
- 목록 요약은 현재 검색/필터 결과 기준 총 건수, 현재 페이지 표시 구간, 현재 선택 건수를 함께 보여준다.
- 현재 기준 강조 방식은 `전체 8건`, `5건 선택됨`은 보라색 계열 강조, `1 - 5 표시됨`은 검은색 계열 텍스트다.
- 적용된 필터 상태와 초기화 액션을 명확하게 보여준다.

## 5. 상세필터 규칙
- 상세필터는 풀스크린 모달이 아니라 버튼 하단 popover를 기본으로 한다.
- 검색 가능한 멀티셀렉트 드롭다운을 사용한다.
- 선택값은 flat chip으로 표시하고 `x`로 제거 가능해야 한다.
- 선택 즉시 반영하지 않고 `적용 / 취소` 이후 반영한다.
- 기본 placeholder는 `전체`를 사용한다.
- 옵션이 없으면 `검색 결과 없음`을 표시한다.

## 6. 테이블 규칙
- 헤더 배경은 본문과 구분되어야 한다.
- hover, selected, disabled 상태를 명확하게 보여준다.
- row 선택과 checkbox 선택은 분리한다.
- checkbox 상태는 checkbox 클릭으로만 바뀌게 한다.
- 정렬 가능 컬럼은 정렬 방향 표시를 제공한다.
- 페이지네이션을 기본 제공한다.
- 현재 페이지 전체 선택 시, 표 헤더 바로 아래에 Gmail식 선택 안내 줄을 표시할 수 있다.
- 현재 기준 문구 형식은 `페이지에서 5개가 선택되었습니다. 목록에서 총 8개 데이터 선택`이다.
- 안내 줄의 링크 액션을 누르면 현재 필터된 목록 전체를 선택하도록 동작시킨다.

## 7. 페이지네이션 규칙
- 기본 패턴은 하단에 `1-5 / 20건` 형태의 캡션을 두는 것이다.
- 단, 같은 정보가 상단 검색/액션 바의 목록 요약 캡션으로 이미 제공되면 하단 왼쪽 캡션은 제거할 수 있다.
- `이전 / 페이지 번호 / 다음` 구조를 기본으로 한다.
- 검색, 필터, 정렬 결과와 일관되게 동작해야 한다.

## 8. 상태 편집 규칙
- 선택된 항목 요약을 상단에 보여준다.
- 상태 버튼은 밀도 있는 그리드/그룹으로 배치한다.
- textarea와 글자수 카운터를 함께 제공한다.
- 담당자 선택은 검색 가능한 멀티셀렉트로 구성한다.
- 저장 버튼은 실제 변경이 있을 때만 활성화한다.
- 권한에 따라 상태 변경 범위와 버튼 노출을 제어한다.

## 9. 피드백 규칙
- 저장, 삭제, 복사, 내보내기, 이행점검 결과는 toast로 보여준다.
- 삭제나 일괄 수정은 별도 확인 UI를 제공한다.
- 각 주요 영역에 empty state를 제공한다.
- disabled 상태는 opacity, cursor, hover 제거 등으로 분명히 표현한다.

## 10. 코드 구조 원칙
- 공통 셸과 범용 UI 동작은 `shared.js`에 둔다.
- 공통 시각 규칙은 `shared.css`에 둔다.
- 페이지 전용 DOM 렌더링, 상태, 이벤트, 레이아웃은 페이지별 JS/CSS에 둔다.
- 목업 데이터와 샘플 비즈니스 로직은 페이지별 mock service에 둔다.
- 스킬 문서는 `shared 레이어와 page-specific 레이어를 분리하는 구조`를 권장 기본값으로 가져가야 한다.

## 11. 검증 규칙
- 구현 후 실제 브라우저 검증을 기본 완료 조건으로 둔다.
- 검증은 `playwright` skill을 우선 사용한다.
- 기본 검증 기준은 FHD, 브라우저 100% 배율이다.
- 최소 확인 항목:
  - 콘솔 에러 없음
  - 레이아웃 겹침, 잘림, 비정상 overflow 없음
  - 헤더, 사이드바, 툴바 밀도 유지
  - 액션 버튼 아이콘이 컬러 이모지가 아니라 단색 아이콘으로 통일되었는지
  - 액션 버튼 아이콘과 텍스트가 세로 가운데 정렬되어 있는지
  - 상단 목록 요약 캡션이 총 건수, 표시 구간, 선택 건수를 올바르게 반영하는지
  - 하단 왼쪽 중복 페이지네이션 캡션이 제거되어야 할 경우 실제로 제거되었는지
  - Gmail식 전체선택 안내 줄이 페이지 전체 선택 시 정상 노출되고 전체 선택 링크가 동작하는지
  - 검색, 상세필터, 정렬, 페이지네이션, 모달/팝오버 동작
  - 역할 전환 시 버튼 노출/비활성 상태 일관성
  - 공통 CSS/JS와 페이지별 CSS/JS 경계가 유지되는지 확인

## 12. Skill에서 공통으로 다룰 것과 페이지별 입력으로 남길 것

### 12.1 Skill에서 공통으로 다룰 것
- 앱 셸 레이아웃
- 헤더 구조
- breadcrumb 규칙
- 디자인 토큰
- 검색/필터/테이블/페이지네이션 패턴
- 상태 편집 패턴
- 피드백/권한 처리 패턴
- `shared + page-specific + mock service` 파일 구조 원칙
- 브라우저 검증 절차

### 12.2 페이지별 입력으로 남길 것
- 페이지 제목
- 강조 대상 명칭
- breadcrumb 값
- 컬럼 정의
- 필터 항목
- 액션 버튼 구성
- 상세 패널 또는 우측 보조 영역 필요 여부
- 권한별 노출 정책
- 페이지 전용 목업 데이터 구조
- 삭제, 저장, 이행점검 같은 비즈니스 규칙

## 13. 추천 Skill 구성
- `SKILL.md`
  - 언제 이 Skill을 써야 하는지
  - 멀티페이지 목업 구조 기준
  - 공통 레이아웃/디자인/상호작용 규칙
  - 공통 코드 구조 원칙
  - 브라우저 검증 규칙
  - 새 페이지 생성 시 필요한 입력 항목
- `references/common-patterns.md`
  - 헤더
  - 검색/상세필터
  - 테이블
  - 페이지네이션
  - 상태 편집
  - 토스트/확인 UI
  - 공통 파일 분리 기준
- `references/page-input-checklist.md`
  - 페이지 제목
  - 강조 대상
  - breadcrumb
  - 컬럼 정의
  - 필터 정의
  - 액션 버튼
  - 상세 영역 정의
  - 권한 규칙
  - 목업 데이터 구조

## 14. 기준 파일
- 진입/목차 페이지: [index.html](F:\dev\workspace\dguard-ui\index.html)
- 공통 스타일: [shared.css](F:\dev\workspace\dguard-ui\shared.css)
- 공통 동작: [shared.js](F:\dev\workspace\dguard-ui\shared.js)
- 검출목록 페이지:
  - [detection-list.html](F:\dev\workspace\dguard-ui\detection-list.html)
  - [detection-list.css](F:\dev\workspace\dguard-ui\detection-list.css)
  - [detection-list.js](F:\dev\workspace\dguard-ui\detection-list.js)
- 분석이력 페이지:
  - [analysis-history.html](F:\dev\workspace\dguard-ui\analysis-history.html)
  - [analysis-history.css](F:\dev\workspace\dguard-ui\analysis-history.css)
  - [analysis-history.js](F:\dev\workspace\dguard-ui\analysis-history.js)
- 페이지별 목업 데이터:
  - [mock-detection-service.js](F:\dev\workspace\dguard-ui\mock-detection-service.js)
  - [mock-analysis-history-service.js](F:\dev\workspace\dguard-ui\mock-analysis-history-service.js)
