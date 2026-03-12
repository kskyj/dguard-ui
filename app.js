const STATUS_META = {
  UNCHECKED: { label: "미확인", className: "status-unchecked" },
  ACTION_REQUIRED: { label: "조치필요", className: "status-action" },
  EXCLUDED: { label: "제외", className: "status-excluded" },
  EXCLUSION_REQUESTED: { label: "제외신청", className: "status-requested" },
  EXCLUSION_REJECTED: { label: "제외거부", className: "status-rejected" },
};

const STATUS_ORDER = [
  "UNCHECKED",
  "ACTION_REQUIRED",
  "EXCLUDED",
  "EXCLUSION_REQUESTED",
  "EXCLUSION_REJECTED",
];

const USER_ALLOWED_STATUSES = new Set([
  "UNCHECKED",
  "ACTION_REQUIRED",
  "EXCLUSION_REQUESTED",
]);

const ASSIGNEES = [
  "김성진",
  "장민교",
  "이아름",
  "박준호",
  "최윤서",
  "정하림",
  "임다빈",
  "송지후",
];

const detectionData = [
  {
    id: "det-1",
    path: "/CUSTOMER/TB_CUSTOMER/RRN",
    detectType: "주민등록번호",
    count: 40,
    assignees: ["김성진", "장민교", "이아름"],
    status: "ACTION_REQUIRED",
    comment: "마스킹 대상 우선 검토 필요",
    assignee: "김성진",
    piiRecords: [
      {
        id: "pii-1-1",
        value: "820101-2345678",
        count: 12,
        uniqueValue: "CUST_NO=100948",
        contextLines: [
          "주문 이력 테이블 조인 결과에 원문 주민번호가 포함되어 있습니다.",
          "최근 90일 내 조회 기록 4건이 확인되었습니다.",
        ],
        lookupQuery: "SELECT * FROM TB_CUSTOMER WHERE CUST_NO = '100948';",
      },
      {
        id: "pii-1-2",
        value: "790315-1456789",
        count: 8,
        uniqueValue: "CUST_NO=101204",
        contextLines: [
          "회원 통합 과정에서 이관된 데이터입니다.",
          "주문 배송지 확인용 조회에서 함께 검출되었습니다.",
        ],
        lookupQuery: "SELECT * FROM TB_CUSTOMER WHERE CUST_NO = '101204';",
      },
      {
        id: "pii-1-3",
        value: "920711-2123456",
        count: 6,
        uniqueValue: "CUST_NO=109442",
        contextLines: [
          "정기 배치 산출물과 원본 컬럼이 동시에 노출됩니다.",
          "조회 이력은 없지만 백업 스냅샷에 포함됩니다.",
        ],
        lookupQuery: "SELECT * FROM TB_CUSTOMER WHERE CUST_NO = '109442';",
      },
      {
        id: "pii-1-4",
        value: "700902-1654321",
        count: 5,
        uniqueValue: "CUST_NO=112908",
        contextLines: [
          "보상 처리 서브시스템에서 참조한 값입니다.",
          "마스킹 정책 미반영 컬럼으로 분류됩니다.",
        ],
        lookupQuery: "SELECT * FROM TB_CUSTOMER WHERE CUST_NO = '112908';",
      },
      {
        id: "pii-1-5",
        value: "860624-2234567",
        count: 4,
        uniqueValue: "CUST_NO=119871",
        contextLines: [
          "외부 배치 파일 적재 과정에서 검출되었습니다.",
          "개인정보 영향도 산정 대상입니다.",
        ],
        lookupQuery: "SELECT * FROM TB_CUSTOMER WHERE CUST_NO = '119871';",
      },
      {
        id: "pii-1-6",
        value: "950201-2012456",
        count: 3,
        uniqueValue: "CUST_NO=126551",
        contextLines: [
          "테스트 계정으로 추정되는 레코드와 함께 존재합니다.",
          "업무팀 확인 필요 메모가 등록되어 있습니다.",
        ],
        lookupQuery: "SELECT * FROM TB_CUSTOMER WHERE CUST_NO = '126551';",
      },
    ],
  },
  {
    id: "det-2",
    path: "/CUSTOMER/TB_CUSTOMER/PASSPORT_NO",
    detectType: "여권번호",
    count: 20,
    assignees: ["김성진", "장민교"],
    status: "UNCHECKED",
    comment: "",
    assignee: "장민교",
    piiRecords: [
      {
        id: "pii-2-1",
        value: "M12845091",
        count: 9,
        uniqueValue: "PASSENGER_ID=30021",
        contextLines: [
          "해외여행 보험 가입 이력에서 여권번호가 확인되었습니다.",
          "만료일 정보와 함께 저장되어 있습니다.",
        ],
        lookupQuery: "SELECT * FROM TB_CUSTOMER WHERE PASSENGER_ID = '30021';",
      },
      {
        id: "pii-2-2",
        value: "K90981244",
        count: 6,
        uniqueValue: "PASSENGER_ID=30117",
        contextLines: [
          "항공권 재발급 이력에서 추출되었습니다.",
          "암호화 미적용 백업 테이블에 존재합니다.",
        ],
        lookupQuery: "SELECT * FROM TB_CUSTOMER WHERE PASSENGER_ID = '30117';",
      },
      {
        id: "pii-2-3",
        value: "N77451220",
        count: 5,
        uniqueValue: "PASSENGER_ID=30244",
        contextLines: [
          "고객센터 민원 처리 메모에 원문이 남아 있습니다.",
          "접근 로그 2건이 확인되었습니다.",
        ],
        lookupQuery: "SELECT * FROM TB_CUSTOMER WHERE PASSENGER_ID = '30244';",
      },
    ],
  },
  {
    id: "det-3",
    path: "/PAYMENT/TB_BILLING/CARD_NO",
    detectType: "카드번호",
    count: 68,
    assignees: ["박준호", "최윤서", "정하림", "송지후"],
    status: "EXCLUSION_REQUESTED",
    comment: "운영 정책상 부분 마스킹 예외 검토 중",
    assignee: "박준호",
    piiRecords: [
      {
        id: "pii-3-1",
        value: "5123-1894-6672-8841",
        count: 20,
        uniqueValue: "BILL_ID=80021",
        contextLines: [
          "실결제 승인 로그에 부분 마스킹 형태로 남아 있습니다.",
          "결제 취소 처리 프로시저에서 재참조됩니다.",
        ],
        lookupQuery: "SELECT * FROM TB_BILLING WHERE BILL_ID = '80021';",
      },
      {
        id: "pii-3-2",
        value: "4571-7732-4410-5519",
        count: 18,
        uniqueValue: "BILL_ID=81244",
        contextLines: [
          "정산 오류 분석용 임시 테이블에서 검출되었습니다.",
          "장기 보관 정책 제외 신청 대상입니다.",
        ],
        lookupQuery: "SELECT * FROM TB_BILLING WHERE BILL_ID = '81244';",
      },
      {
        id: "pii-3-3",
        value: "3762-0048-1294-1190",
        count: 12,
        uniqueValue: "BILL_ID=82192",
        contextLines: [
          "국제 결제 이력 분석 리포트에 포함되었습니다.",
          "삭제 예정 데이터셋과 중복됩니다.",
        ],
        lookupQuery: "SELECT * FROM TB_BILLING WHERE BILL_ID = '82192';",
      },
      {
        id: "pii-3-4",
        value: "5403-9182-6601-4412",
        count: 10,
        uniqueValue: "BILL_ID=83660",
        contextLines: [
          "부가 서비스 연동 로그에서 검출되었습니다.",
          "개인정보 등급 재분류 필요 메모가 있습니다.",
        ],
        lookupQuery: "SELECT * FROM TB_BILLING WHERE BILL_ID = '83660';",
      },
      {
        id: "pii-3-5",
        value: "4485-0411-9022-9081",
        count: 8,
        uniqueValue: "BILL_ID=84001",
        contextLines: [
          "QA 샘플 테이블과 원본이 동시에 보관됩니다.",
          "마이그레이션 잔존 데이터입니다.",
        ],
        lookupQuery: "SELECT * FROM TB_BILLING WHERE BILL_ID = '84001';",
      },
    ],
  },
  {
    id: "det-4",
    path: "/CUSTOMER/TB_PROFILE/EMAIL",
    detectType: "이메일",
    count: 120,
    assignees: ["최윤서"],
    status: "EXCLUDED",
    comment: "고객 식별용 내부 대체키로 관리",
    assignee: "최윤서",
    piiRecords: [
      {
        id: "pii-4-1",
        value: "sample.one@domain.com",
        count: 35,
        uniqueValue: "PROFILE_ID=42190",
        contextLines: [
          "마케팅 수신 동의 이력과 함께 저장됩니다.",
          "표준 암호화 컬럼 전환 완료 대상입니다.",
        ],
        lookupQuery: "SELECT * FROM TB_PROFILE WHERE PROFILE_ID = '42190';",
      },
      {
        id: "pii-4-2",
        value: "hello.client@domain.com",
        count: 29,
        uniqueValue: "PROFILE_ID=42901",
        contextLines: [
          "로그인 실패 분석 리포트에서 추가 검출되었습니다.",
          "서비스 탈퇴 후 익명화 예정입니다.",
        ],
        lookupQuery: "SELECT * FROM TB_PROFILE WHERE PROFILE_ID = '42901';",
      },
      {
        id: "pii-4-3",
        value: "vip.user@domain.com",
        count: 24,
        uniqueValue: "PROFILE_ID=43022",
        contextLines: [
          "우수고객 대응용 메모에서 원문이 확인되었습니다.",
          "접근 권한 그룹 제한 예정입니다.",
        ],
        lookupQuery: "SELECT * FROM TB_PROFILE WHERE PROFILE_ID = '43022';",
      },
      {
        id: "pii-4-4",
        value: "renew.user@domain.com",
        count: 18,
        uniqueValue: "PROFILE_ID=43310",
        contextLines: [
          "갱신 캠페인 대상 추출 이력입니다.",
          "보유 기간 만료 검토가 진행 중입니다.",
        ],
        lookupQuery: "SELECT * FROM TB_PROFILE WHERE PROFILE_ID = '43310';",
      },
      {
        id: "pii-4-5",
        value: "guest.account@domain.com",
        count: 14,
        uniqueValue: "PROFILE_ID=43997",
        contextLines: [
          "테스트 계정으로 생성되었으나 실제 데이터가 존재합니다.",
          "운영팀 후속 정리가 필요합니다.",
        ],
        lookupQuery: "SELECT * FROM TB_PROFILE WHERE PROFILE_ID = '43997';",
      },
    ],
  },
  {
    id: "det-5",
    path: "/HR/TB_EMPLOYEE/MOBILE",
    detectType: "휴대전화번호",
    count: 56,
    assignees: ["정하림", "임다빈"],
    status: "ACTION_REQUIRED",
    comment: "연락망 컬럼 정비 필요",
    assignee: "임다빈",
    piiRecords: [
      {
        id: "pii-5-1",
        value: "010-2011-8821",
        count: 14,
        uniqueValue: "EMP_ID=E-1004",
        contextLines: [
          "비상 연락망과 급여 시스템 양쪽에서 확인됩니다.",
          "퇴사자 정리 배치 미적용 대상입니다.",
        ],
        lookupQuery: "SELECT * FROM TB_EMPLOYEE WHERE EMP_ID = 'E-1004';",
      },
      {
        id: "pii-5-2",
        value: "010-7721-4410",
        count: 12,
        uniqueValue: "EMP_ID=E-1092",
        contextLines: [
          "사내 메신저 동기화 로그에 함께 남아 있습니다.",
          "정책상 보관 기간 초과 가능성이 있습니다.",
        ],
        lookupQuery: "SELECT * FROM TB_EMPLOYEE WHERE EMP_ID = 'E-1092';",
      },
      {
        id: "pii-5-3",
        value: "010-5522-9831",
        count: 10,
        uniqueValue: "EMP_ID=E-1120",
        contextLines: [
          "채용 시스템 이관 데이터에서 확인되었습니다.",
          "인사팀 검토 요청이 등록되어 있습니다.",
        ],
        lookupQuery: "SELECT * FROM TB_EMPLOYEE WHERE EMP_ID = 'E-1120';",
      },
      {
        id: "pii-5-4",
        value: "010-4119-5517",
        count: 10,
        uniqueValue: "EMP_ID=E-1188",
        contextLines: [
          "임시 프로젝트 조직도 자료에 원문이 포함됩니다.",
          "마스킹 전환 우선순위 높음으로 분류됩니다.",
        ],
        lookupQuery: "SELECT * FROM TB_EMPLOYEE WHERE EMP_ID = 'E-1188';",
      },
      {
        id: "pii-5-5",
        value: "010-9221-6605",
        count: 10,
        uniqueValue: "EMP_ID=E-1234",
        contextLines: [
          "현장근무자 연락처 공유 문서에서 중복 검출되었습니다.",
          "삭제 요청 이력은 아직 없습니다.",
        ],
        lookupQuery: "SELECT * FROM TB_EMPLOYEE WHERE EMP_ID = 'E-1234';",
      },
    ],
  },
  {
    id: "det-6",
    path: "/CLAIM/TB_CASE/NAME",
    detectType: "성명",
    count: 310,
    assignees: ["송지후", "이아름"],
    status: "UNCHECKED",
    comment: "",
    assignee: "송지후",
    piiRecords: [
      {
        id: "pii-6-1",
        value: "김민준",
        count: 84,
        uniqueValue: "CASE_ID=CL-3100",
        contextLines: [
          "민원 접수 본문과 첨부 메모에서 동시에 검출됩니다.",
          "비정형 데이터 정제 룰 추가가 필요합니다.",
        ],
        lookupQuery: "SELECT * FROM TB_CASE WHERE CASE_ID = 'CL-3100';",
      },
      {
        id: "pii-6-2",
        value: "박서연",
        count: 76,
        uniqueValue: "CASE_ID=CL-3122",
        contextLines: [
          "진행 메모와 고객 요청사항 텍스트에 포함됩니다.",
          "반복 검출 빈도가 높습니다.",
        ],
        lookupQuery: "SELECT * FROM TB_CASE WHERE CASE_ID = 'CL-3122';",
      },
      {
        id: "pii-6-3",
        value: "최하은",
        count: 68,
        uniqueValue: "CASE_ID=CL-3191",
        contextLines: [
          "기존 수기 입력 데이터로 분류됩니다.",
          "정형 컬럼으로 분리 검토 대상입니다.",
        ],
        lookupQuery: "SELECT * FROM TB_CASE WHERE CASE_ID = 'CL-3191';",
      },
      {
        id: "pii-6-4",
        value: "정도윤",
        count: 48,
        uniqueValue: "CASE_ID=CL-3207",
        contextLines: [
          "심사 의견 본문에 포함됩니다.",
          "삭제보다 가명화가 적합한 사례로 표시되었습니다.",
        ],
        lookupQuery: "SELECT * FROM TB_CASE WHERE CASE_ID = 'CL-3207';",
      },
      {
        id: "pii-6-5",
        value: "이주원",
        count: 34,
        uniqueValue: "CASE_ID=CL-3289",
        contextLines: [
          "문의 템플릿 자동완성으로 중복 저장되었습니다.",
          "운영 가이드 정비가 필요합니다.",
        ],
        lookupQuery: "SELECT * FROM TB_CASE WHERE CASE_ID = 'CL-3289';",
      },
    ],
  },
  {
    id: "det-7",
    path: "/SUPPORT/TB_LOG/PHONE",
    detectType: "전화번호",
    count: 82,
    assignees: ["박준호"],
    status: "EXCLUSION_REJECTED",
    comment: "제외 사유 불충분",
    assignee: "박준호",
    piiRecords: [
      {
        id: "pii-7-1",
        value: "02-551-9921",
        count: 26,
        uniqueValue: "LOG_ID=LG-712",
        contextLines: [
          "콜백 요청 로그에 남아 있습니다.",
          "API 중계 로그에도 동일 값이 존재합니다.",
        ],
        lookupQuery: "SELECT * FROM TB_LOG WHERE LOG_ID = 'LG-712';",
      },
      {
        id: "pii-7-2",
        value: "031-889-1200",
        count: 21,
        uniqueValue: "LOG_ID=LG-731",
        contextLines: [
          "장애 대응 티켓 본문에서 확인되었습니다.",
          "전화번호 저장 목적 검토가 필요합니다.",
        ],
        lookupQuery: "SELECT * FROM TB_LOG WHERE LOG_ID = 'LG-731';",
      },
      {
        id: "pii-7-3",
        value: "010-1149-2282",
        count: 20,
        uniqueValue: "LOG_ID=LG-764",
        contextLines: [
          "내부 담당자 연락처와 혼재되어 있습니다.",
          "표준 분류 룰이 부정확할 수 있습니다.",
        ],
        lookupQuery: "SELECT * FROM TB_LOG WHERE LOG_ID = 'LG-764';",
      },
      {
        id: "pii-7-4",
        value: "070-4122-1838",
        count: 15,
        uniqueValue: "LOG_ID=LG-799",
        contextLines: [
          "외부 협력사 연락처 이력입니다.",
          "업무 목적 저장 근거가 부족합니다.",
        ],
        lookupQuery: "SELECT * FROM TB_LOG WHERE LOG_ID = 'LG-799';",
      },
    ],
  },
  {
    id: "det-8",
    path: "/ANALYTICS/TB_EXPORT/BIRTHDAY",
    detectType: "생년월일",
    count: 47,
    assignees: ["임다빈", "김성진"],
    status: "ACTION_REQUIRED",
    comment: "비식별 정책 미준수 가능",
    assignee: "김성진",
    piiRecords: [
      {
        id: "pii-8-1",
        value: "1982-02-01",
        count: 16,
        uniqueValue: "ANALYSIS_ID=A-2201",
        contextLines: [
          "고객 분석용 추출본에 포함되었습니다.",
          "대체키 적용 전 원문 컬럼이 남아 있습니다.",
        ],
        lookupQuery: "SELECT * FROM TB_EXPORT WHERE ANALYSIS_ID = 'A-2201';",
      },
      {
        id: "pii-8-2",
        value: "1994-07-15",
        count: 13,
        uniqueValue: "ANALYSIS_ID=A-2271",
        contextLines: [
          "모델 학습 샘플 테이블에 저장됩니다.",
          "반출 통제 점검 필요 항목입니다.",
        ],
        lookupQuery: "SELECT * FROM TB_EXPORT WHERE ANALYSIS_ID = 'A-2271';",
      },
      {
        id: "pii-8-3",
        value: "1979-12-09",
        count: 10,
        uniqueValue: "ANALYSIS_ID=A-2290",
        contextLines: [
          "리포트 생성 임시 테이블에서 검출되었습니다.",
          "보관기간 종료 대상입니다.",
        ],
        lookupQuery: "SELECT * FROM TB_EXPORT WHERE ANALYSIS_ID = 'A-2290';",
      },
      {
        id: "pii-8-4",
        value: "1988-11-21",
        count: 8,
        uniqueValue: "ANALYSIS_ID=A-2333",
        contextLines: [
          "샘플링 과정에서 원문이 유지되었습니다.",
          "비식별 전처리 룰 보완이 필요합니다.",
        ],
        lookupQuery: "SELECT * FROM TB_EXPORT WHERE ANALYSIS_ID = 'A-2333';",
      },
    ],
  },
];

const refs = {};

const state = {
  role: "admin",
  selectedDetectionId: detectionData[0]?.id ?? null,
  selectedPiiId: detectionData[0]?.piiRecords[0]?.id ?? null,
  checkedDetectionIds: new Set(),
  detectionFilters: {
    query: "",
    detectTypes: [],
    assignees: [],
    statuses: [],
    panelOpen: false,
  },
  detectionFilterDraft: {
    detectTypes: [],
    assignees: [],
    statuses: [],
  },
  detectionSort: {
    key: "path",
    dir: "asc",
  },
  piiFilters: {
    query: "",
    sortKey: "count",
    sortDir: "desc",
  },
  pagination: {
    detectionPage: 1,
    detectionPageSize: 5,
    piiPage: 1,
    piiPageSize: 7,
  },
  editorDraft: {
    status: detectionData[0]?.status ?? null,
    comment: detectionData[0]?.comment ?? "",
    assignees: [...(detectionData[0]?.assignees ?? [])],
  },
  editorDraftSourceId: detectionData[0]?.id ?? null,
  assigneeSearch: "",
  filterUi: {
    openKey: null,
    detectTypesSearch: "",
    assigneesSearch: "",
    statusesSearch: "",
  },
  bulkEditDraft: {
    open: false,
    statusEnabled: false,
    status: null,
    commentEnabled: false,
    comment: "",
    assigneeEnabled: false,
    assignee: "",
  },
  deleteModalOpen: false,
};

document.addEventListener("DOMContentLoaded", init);

function init() {
  cacheRefs();
  bindEvents();
  populateStaticControls();
  syncSelectionState();
  render();
}

function cacheRefs() {
  const ids = [
    "detectionSearchInput",
    "toggleFilterButton",
    "detectTypeFilterSelect",
    "detectTypeFilterTrigger",
    "detectTypeFilterPanel",
    "detectTypeFilterSearch",
    "detectTypeFilterList",
    "assigneeFilterSelect",
    "assigneeFilterTrigger",
    "assigneeFilterPanel",
    "assigneeFilterSearch",
    "assigneeFilterList",
    "statusFilterSelect",
    "statusFilterTrigger",
    "statusFilterPanel",
    "statusFilterSearch",
    "statusFilterList",
    "applyFilterButton",
    "cancelFilterButton",
    "detectionFilterSummary",
    "clearDetectionFilters",
    "selectAllDetections",
    "detectionTableBody",
    "detectionEmpty",
    "detectionPagination",
    "detectionPaginationCaption",
    "detectionSortIndicatorPath",
    "detectionSortIndicatorDetectType",
    "detectionSortIndicatorCount",
    "detectionSortIndicatorAssignees",
    "detectionSortIndicatorStatus",
    "bulkEditButton",
    "deleteButton",
    "exportButton",
    "editorSummary",
    "statusGrid",
    "commentInput",
    "commentCount",
    "assigneePicker",
    "assigneePickerTrigger",
    "assigneePickerPanel",
    "assigneeSearchInput",
    "assigneeOptions",
    "saveButton",
    "piiSearchInput",
    "piiFilterSummary",
    "clearPiiFilters",
    "piiTableBody",
    "piiEmpty",
    "piiPagination",
    "piiPaginationCaption",
    "detailUnique",
    "contextList",
    "copyQueryButton",
    "sortIndicatorValue",
    "sortIndicatorCount",
    "bulkModal",
    "filterModal",
    "bulkSelectionCaption",
    "bulkStatusEnabled",
    "bulkStatusGrid",
    "bulkCommentEnabled",
    "bulkCommentInput",
    "bulkAssigneeEnabled",
    "bulkAssigneeSelect",
    "bulkApplyButton",
    "deleteModal",
    "deleteCaption",
    "confirmDeleteButton",
    "toastStack",
  ];

  ids.forEach((id) => {
    refs[id] = document.getElementById(id);
  });
  refs.roleButtons = [...document.querySelectorAll(".role-btn")];
}

function bindEvents() {
  refs.roleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.role = button.dataset.role;
      refs.assigneePickerPanel.hidden = true;
      refs.assigneePickerTrigger.setAttribute("aria-expanded", "false");
      render();
      pushToast(`역할이 ${state.role === "admin" ? "관리자" : "일반사용자"}로 변경되었습니다.`);
    });
  });

  refs.detectionSearchInput.addEventListener("input", (event) => {
    state.detectionFilters.query = event.target.value.trim();
    state.pagination.detectionPage = 1;
    syncSelectionState();
    render();
  });

  refs.toggleFilterButton.addEventListener("click", () => {
    const shouldOpen = !state.detectionFilters.panelOpen;
    state.detectionFilters.panelOpen = shouldOpen;
    state.filterUi.openKey = null;
    if (shouldOpen) {
      state.detectionFilterDraft.detectTypes = [...state.detectionFilters.detectTypes];
      state.detectionFilterDraft.assignees = [...state.detectionFilters.assignees];
      state.detectionFilterDraft.statuses = [...state.detectionFilters.statuses];
    }
    render();
  });

  refs.clearDetectionFilters.addEventListener("click", () => {
    state.detectionFilters.query = "";
    state.detectionFilters.detectTypes = [];
    state.detectionFilters.assignees = [];
    state.detectionFilters.statuses = [];
    state.detectionFilterDraft.detectTypes = [];
    state.detectionFilterDraft.assignees = [];
    state.detectionFilterDraft.statuses = [];
    state.filterUi.detectTypesSearch = "";
    state.filterUi.assigneesSearch = "";
    state.filterUi.statusesSearch = "";
    state.pagination.detectionPage = 1;
    refs.detectionSearchInput.value = "";
    syncSelectionState();
    render();
  });

  bindFilterSelect("detectTypes");
  bindFilterSelect("assignees");
  bindFilterSelect("statuses");

  refs.selectAllDetections.addEventListener("change", (event) => {
    const pageItems = getDetectionPageItems().items;
    pageItems.forEach((item) => {
      if (event.target.checked) {
        state.checkedDetectionIds.add(item.id);
      } else {
        state.checkedDetectionIds.delete(item.id);
      }
    });
    render();
  });

  refs.commentInput.addEventListener("input", (event) => {
    state.editorDraft.comment = event.target.value.slice(0, 500);
    render();
  });

  refs.assigneePickerTrigger.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-assignee-remove]");
    if (removeButton) {
      event.stopPropagation();
      state.editorDraft.assignees = state.editorDraft.assignees.filter((name) => name !== removeButton.dataset.assigneeRemove);
      renderAssigneeTrigger();
      renderAssigneeOptions();
      refs.saveButton.disabled = !hasEditorChanges();
      return;
    }
    const isOpen = !refs.assigneePickerPanel.hidden;
    refs.assigneePickerPanel.hidden = isOpen;
    refs.assigneePickerTrigger.setAttribute("aria-expanded", String(!isOpen));
    if (!isOpen) {
      refs.assigneeSearchInput.focus();
    }
  });

  refs.assigneeSearchInput.addEventListener("input", (event) => {
    state.assigneeSearch = event.target.value.trim();
    renderAssigneeOptions();
  });

  document.addEventListener("click", (event) => {
    if (!refs.assigneePicker.contains(event.target)) {
      refs.assigneePickerPanel.hidden = true;
      refs.assigneePickerTrigger.setAttribute("aria-expanded", "false");
    }
    if (state.detectionFilters.panelOpen) {
      const insideFilterSelect = event.target.closest(".filter-select");
      const insideFilterModal = event.target.closest("#filterModal .filter-popover-card");
      const onFilterButton = event.target.closest("#toggleFilterButton");
      if (!insideFilterModal && !onFilterButton) {
        state.detectionFilters.panelOpen = false;
        state.filterUi.openKey = null;
        render();
        return;
      }
      if (insideFilterModal && !insideFilterSelect) {
        state.filterUi.openKey = null;
        renderFilterSelectPanels();
      }
    }
  });

  refs.cancelFilterButton.addEventListener("click", () => {
    state.detectionFilters.panelOpen = false;
    state.filterUi.openKey = null;
    render();
  });

  refs.applyFilterButton.addEventListener("click", () => {
    state.detectionFilters.detectTypes = [...state.detectionFilterDraft.detectTypes];
    state.detectionFilters.assignees = [...state.detectionFilterDraft.assignees];
    state.detectionFilters.statuses = [...state.detectionFilterDraft.statuses];
    state.pagination.detectionPage = 1;
    state.detectionFilters.panelOpen = false;
    state.filterUi.openKey = null;
    syncSelectionState();
    render();
  });

  refs.saveButton.addEventListener("click", handleSave);

  refs.piiSearchInput.addEventListener("input", (event) => {
    state.piiFilters.query = event.target.value.trim();
    state.pagination.piiPage = 1;
    syncPiiSelectionState();
    render();
  });

  refs.clearPiiFilters.addEventListener("click", () => {
    state.piiFilters.query = "";
    refs.piiSearchInput.value = "";
    state.pagination.piiPage = 1;
    syncPiiSelectionState();
    render();
  });

  document.querySelectorAll(".sort-btn").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.detectionSortKey) {
        const key = button.dataset.detectionSortKey;
        if (state.detectionSort.key === key) {
          state.detectionSort.dir = state.detectionSort.dir === "asc" ? "desc" : "asc";
        } else {
          state.detectionSort.key = key;
          state.detectionSort.dir = key === "count" ? "desc" : "asc";
        }
        state.pagination.detectionPage = 1;
        syncSelectionState();
        render();
        return;
      }
      const key = button.dataset.sortKey;
      if (state.piiFilters.sortKey === key) {
        state.piiFilters.sortDir = state.piiFilters.sortDir === "asc" ? "desc" : "asc";
      } else {
        state.piiFilters.sortKey = key;
        state.piiFilters.sortDir = key === "count" ? "desc" : "asc";
      }
      state.pagination.piiPage = 1;
      syncPiiSelectionState();
      render();
    });
  });

  refs.copyQueryButton.addEventListener("click", async () => {
    const record = getSelectedPii();
    if (!record) {
      return;
    }
    try {
      await copyText(record.lookupQuery);
      pushToast("조회 Query가 클립보드에 복사되었습니다.", "success");
    } catch (error) {
      pushToast("클립보드 복사에 실패했습니다.", "danger");
    }
  });

  refs.bulkEditButton.addEventListener("click", () => {
    state.bulkEditDraft.open = true;
    render();
  });

  refs.deleteButton.addEventListener("click", () => {
    state.deleteModalOpen = true;
    render();
  });

  refs.exportButton.addEventListener("click", () => {
    const selectedCount = state.checkedDetectionIds.size;
    if (selectedCount > 0) {
      pushToast(`선택한 ${selectedCount}건 기준으로 Excel 보고서를 생성했습니다.`);
    } else {
      pushToast("현재 검색 결과 기준으로 Excel 보고서를 생성했습니다.");
    }
  });

  refs.bulkStatusEnabled.addEventListener("change", (event) => {
    state.bulkEditDraft.statusEnabled = event.target.checked;
    renderBulkModal();
  });

  refs.bulkCommentEnabled.addEventListener("change", (event) => {
    state.bulkEditDraft.commentEnabled = event.target.checked;
    renderBulkModal();
  });

  refs.bulkCommentInput.addEventListener("input", (event) => {
    state.bulkEditDraft.comment = event.target.value.slice(0, 500);
  });

  refs.bulkAssigneeEnabled.addEventListener("change", (event) => {
    state.bulkEditDraft.assigneeEnabled = event.target.checked;
    renderBulkModal();
  });

  refs.bulkAssigneeSelect.addEventListener("change", (event) => {
    state.bulkEditDraft.assignee = event.target.value;
  });

  refs.bulkApplyButton.addEventListener("click", applyBulkEdit);
  refs.confirmDeleteButton.addEventListener("click", applyDelete);

  document.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.closeModal === "bulkModal") {
        state.bulkEditDraft.open = false;
      }
      if (button.dataset.closeModal === "deleteModal") {
        state.deleteModalOpen = false;
      }
      render();
    });
  });

  [refs.bulkModal, refs.deleteModal].forEach((modal) => {
    modal.addEventListener("click", (event) => {
      if (event.target !== modal) {
        return;
      }
      if (modal === refs.bulkModal) {
        state.bulkEditDraft.open = false;
      } else {
        state.deleteModalOpen = false;
      }
      render();
    });
  });
}

function populateStaticControls() {
  renderDetectionFilterControls();
  populateSelect(refs.bulkAssigneeSelect, ["", ...ASSIGNEES], "담당자 선택");
  renderStatusButtons();
  renderBulkStatusButtons();
  renderAssigneeOptions();
}

function bindFilterSelect(key) {
  const mapping = {
    detectTypes: {
      trigger: refs.detectTypeFilterTrigger,
      panel: refs.detectTypeFilterPanel,
      search: refs.detectTypeFilterSearch,
      list: refs.detectTypeFilterList,
      searchKey: "detectTypesSearch",
    },
    assignees: {
      trigger: refs.assigneeFilterTrigger,
      panel: refs.assigneeFilterPanel,
      search: refs.assigneeFilterSearch,
      list: refs.assigneeFilterList,
      searchKey: "assigneesSearch",
    },
    statuses: {
      trigger: refs.statusFilterTrigger,
      panel: refs.statusFilterPanel,
      search: refs.statusFilterSearch,
      list: refs.statusFilterList,
      searchKey: "statusesSearch",
    },
  };
  const target = mapping[key];
  target.trigger.addEventListener("click", (event) => {
    const removeButton = event.target.closest(".filter-chip-remove");
    if (removeButton) {
      event.stopPropagation();
      removeFilterDraftValue(key, removeButton.dataset.filterValue);
      return;
    }
    state.filterUi.openKey = state.filterUi.openKey === key ? null : key;
    renderFilterSelectPanels();
  });
  target.search.addEventListener("input", (event) => {
    state.filterUi[target.searchKey] = event.target.value.trim();
    renderDetectionFilterControls();
  });
  target.list.addEventListener("change", (event) => {
    if (!(event.target instanceof HTMLInputElement) || event.target.type !== "checkbox") {
      return;
    }
    const checkedValues = [...target.list.querySelectorAll("input[type='checkbox']:checked")].map((input) => input.value);
    state.detectionFilterDraft[key] = checkedValues;
    renderDetectionFilterControls();
  });
}

function renderDetectionFilterControls() {
  refs.detectTypeFilterSearch.value = state.filterUi.detectTypesSearch;
  refs.assigneeFilterSearch.value = state.filterUi.assigneesSearch;
  refs.statusFilterSearch.value = state.filterUi.statusesSearch;
  renderFilterSelect(
    "detectTypes",
    refs.detectTypeFilterTrigger,
    refs.detectTypeFilterList,
    getDetectTypes(),
    state.detectionFilterDraft.detectTypes,
    state.filterUi.detectTypesSearch
  );
  renderFilterSelect(
    "assignees",
    refs.assigneeFilterTrigger,
    refs.assigneeFilterList,
    ASSIGNEES,
    state.detectionFilterDraft.assignees,
    state.filterUi.assigneesSearch
  );
  renderFilterSelect(
    "statuses",
    refs.statusFilterTrigger,
    refs.statusFilterList,
    STATUS_ORDER.map((status) => ({ value: status, label: STATUS_META[status].label })),
    state.detectionFilterDraft.statuses,
    state.filterUi.statusesSearch
  );
  renderFilterSelectPanels();
}

function renderFilterSelect(key, trigger, container, items, selectedValues, searchQuery) {
  trigger.classList.toggle("has-selection", selectedValues.length > 0);
  if (selectedValues.length) {
    const labelMap = new Map(
      items.map((item) => (typeof item === "string" ? [item, item] : [item.value, item.label]))
    );
    trigger.innerHTML = `
      <span class="filter-chip-list">
        ${selectedValues
          .map(
            (value) =>
              `<span class="filter-chip">${escapeHtml(labelMap.get(value) ?? value)}<span class="filter-chip-remove" data-filter-key="${key}" data-filter-value="${escapeHtml(value)}">×</span></span>`
          )
          .join("")}
      </span>
    `;
  } else {
    trigger.innerHTML = `<span class="filter-select-placeholder">전체</span>`;
  }
  container.innerHTML = "";
  const normalizedQuery = searchQuery.toLowerCase();
  items
    .filter((item) => {
      const labelText = typeof item === "string" ? item : item.label;
      return !normalizedQuery || labelText.toLowerCase().includes(normalizedQuery);
    })
    .forEach((item) => {
    const value = typeof item === "string" ? item : item.value;
    const labelText = typeof item === "string" ? item : item.label;
    const label = document.createElement("label");
    label.className = "filter-option";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = value;
    input.checked = selectedValues.includes(value);
    const text = document.createElement("span");
    text.textContent = labelText;
    label.append(input, text);
    container.appendChild(label);
    });
  if (!container.children.length) {
    const empty = document.createElement("div");
    empty.className = "filter-option-empty";
    empty.textContent = "검색 결과 없음";
    container.appendChild(empty);
  }
}

function renderFilterSelectPanels() {
  const mapping = {
    detectTypes: refs.detectTypeFilterPanel,
    assignees: refs.assigneeFilterPanel,
    statuses: refs.statusFilterPanel,
  };
  Object.entries(mapping).forEach(([key, panel]) => {
    const isOpen = state.filterUi.openKey === key && state.detectionFilters.panelOpen;
    panel.hidden = !isOpen;
  });
}

function removeFilterDraftValue(key, value) {
  state.detectionFilterDraft[key] = state.detectionFilterDraft[key].filter((item) => item !== value);
  renderDetectionFilterControls();
}

function populateSelect(element, values, allLabel, useStatusLabel = false) {
  element.innerHTML = "";
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    if (value === "ALL" || value === "") {
      option.textContent = allLabel;
    } else {
      option.textContent = useStatusLabel ? STATUS_META[value].label : value;
    }
    element.appendChild(option);
  });
}

function render() {
  refs.roleButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.role === state.role);
  });
  refs.filterModal.hidden = !state.detectionFilters.panelOpen;
  refs.deleteButton.hidden = state.role !== "admin";
  refs.toggleFilterButton.classList.toggle("is-filtered", isDetectionFiltered());
  renderDetectionFilterControls();
  if (state.detectionFilters.panelOpen) {
    positionFilterPopover();
  }
  renderDetectionTable();
  renderStatusButtons();
  renderEditor();
  renderPiiTable();
  renderPiiDetail();
  renderBulkModal();
  renderDeleteModal();
}

function getDetectTypes() {
  return [...new Set(detectionData.map((item) => item.detectType))];
}

function getFilteredDetections() {
  const items = detectionData.filter((item) => {
    const query = state.detectionFilters.query.toLowerCase();
    const matchesQuery = !query || item.path.toLowerCase().includes(query);
    const matchesType =
      state.detectionFilters.detectTypes.length === 0 || state.detectionFilters.detectTypes.includes(item.detectType);
    const matchesAssignee =
      state.detectionFilters.assignees.length === 0 ||
      state.detectionFilters.assignees.every((assignee) => item.assignees.includes(assignee));
    const matchesStatus =
      state.detectionFilters.statuses.length === 0 || state.detectionFilters.statuses.includes(item.status);
    return matchesQuery && matchesType && matchesAssignee && matchesStatus;
  });
  const dir = state.detectionSort.dir === "asc" ? 1 : -1;
  items.sort((a, b) => {
    if (state.detectionSort.key === "count") {
      return (a.count - b.count) * dir;
    }
    if (state.detectionSort.key === "assignees") {
      return a.assignees.join(", ").localeCompare(b.assignees.join(", "), "ko") * dir;
    }
    if (state.detectionSort.key === "status") {
      return STATUS_META[a.status].label.localeCompare(STATUS_META[b.status].label, "ko") * dir;
    }
    return String(a[state.detectionSort.key]).localeCompare(String(b[state.detectionSort.key]), "ko") * dir;
  });
  return items;
}

function getDetectionPageItems() {
  const items = getFilteredDetections();
  const start = (state.pagination.detectionPage - 1) * state.pagination.detectionPageSize;
  return {
    all: items,
    items: items.slice(start, start + state.pagination.detectionPageSize),
  };
}

function renderDetectionTable() {
  syncSelectionState();
  const { all, items } = getDetectionPageItems();
  refs.detectionTableBody.innerHTML = "";
  refs.detectionEmpty.hidden = all.length > 0;
  refs.detectionFilterSummary.hidden = !isDetectionFiltered();

  items.forEach((item) => {
    const row = document.createElement("tr");
    row.className = "clickable-row";
    if (item.id === state.selectedDetectionId) {
      row.classList.add("is-selected");
    }

    const checkboxCell = document.createElement("td");
    checkboxCell.className = "checkbox-cell";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = state.checkedDetectionIds.has(item.id);
    checkbox.addEventListener("click", (event) => event.stopPropagation());
    checkbox.addEventListener("change", (event) => {
      if (event.target.checked) {
        state.checkedDetectionIds.add(item.id);
      } else {
        state.checkedDetectionIds.delete(item.id);
      }
      render();
    });
    checkboxCell.appendChild(checkbox);

    const pathCell = document.createElement("td");
    pathCell.innerHTML = `<span class="path-text">${item.path}</span>`;

    const typeCell = document.createElement("td");
    typeCell.textContent = item.detectType;

    const countCell = document.createElement("td");
    countCell.className = "number-cell";
    countCell.textContent = item.count.toLocaleString("ko-KR");

    const assigneeCell = document.createElement("td");
    assigneeCell.title = item.assignees.join(", ");
    assigneeCell.textContent = formatAssignees(item.assignees);

    const statusCell = document.createElement("td");
    statusCell.appendChild(createStatusChip(item.status));

    row.append(checkboxCell, pathCell, typeCell, countCell, assigneeCell, statusCell);
    row.addEventListener("click", () => {
      state.selectedDetectionId = item.id;
      syncEditorDraft();
      syncPiiSelectionState(true);
      render();
    });
    refs.detectionTableBody.appendChild(row);
  });

  const allSelectedOnPage = items.length > 0 && items.every((item) => state.checkedDetectionIds.has(item.id));
  refs.selectAllDetections.checked = allSelectedOnPage;
  refs.selectAllDetections.indeterminate = !allSelectedOnPage && items.some((item) => state.checkedDetectionIds.has(item.id));
  refs.bulkEditButton.disabled = state.checkedDetectionIds.size === 0;
  refs.deleteButton.disabled = state.checkedDetectionIds.size === 0;
  refs.detectionSortIndicatorPath.textContent = state.detectionSort.key === "path" ? (state.detectionSort.dir === "asc" ? "▲" : "▼") : "";
  refs.detectionSortIndicatorDetectType.textContent = state.detectionSort.key === "detectType" ? (state.detectionSort.dir === "asc" ? "▲" : "▼") : "";
  refs.detectionSortIndicatorCount.textContent = state.detectionSort.key === "count" ? (state.detectionSort.dir === "asc" ? "▲" : "▼") : "";
  refs.detectionSortIndicatorAssignees.textContent = state.detectionSort.key === "assignees" ? (state.detectionSort.dir === "asc" ? "▲" : "▼") : "";
  refs.detectionSortIndicatorStatus.textContent = state.detectionSort.key === "status" ? (state.detectionSort.dir === "asc" ? "▲" : "▼") : "";
  refs.detectionPaginationCaption.textContent = all.length
    ? `${Math.min((state.pagination.detectionPage - 1) * state.pagination.detectionPageSize + 1, all.length)}-${Math.min(state.pagination.detectionPage * state.pagination.detectionPageSize, all.length)} / ${all.length}건`
    : "0건";
  renderPagination(refs.detectionPagination, all.length, state.pagination.detectionPageSize, state.pagination.detectionPage, (page) => {
    state.pagination.detectionPage = page;
    render();
  });
}

function positionFilterPopover() {
  const rect = refs.toggleFilterButton.getBoundingClientRect();
  refs.filterModal.style.top = `${rect.bottom + 8}px`;
  refs.filterModal.style.left = `${Math.max(12, Math.min(rect.left, window.innerWidth - refs.filterModal.offsetWidth - 12))}px`;
}

function isDetectionFiltered() {
  return Boolean(
    state.detectionFilters.query ||
      state.detectionFilters.detectTypes.length ||
      state.detectionFilters.assignees.length ||
      state.detectionFilters.statuses.length
  );
}

function formatAssignees(assignees) {
  if (assignees.length <= 2) {
    return assignees.join(", ");
  }
  return `${assignees.slice(0, 2).join(", ")} ...`;
}

function createStatusChip(status) {
  const chip = document.createElement("span");
  chip.className = `status-chip ${STATUS_META[status].className}`;
  chip.textContent = STATUS_META[status].label;
  return chip;
}

function getSelectedDetection() {
  return detectionData.find((item) => item.id === state.selectedDetectionId) ?? null;
}

function syncSelectionState() {
  const filtered = getFilteredDetections();
  const maxPage = Math.max(1, Math.ceil(filtered.length / state.pagination.detectionPageSize));
  const previousId = state.selectedDetectionId;
  if (state.pagination.detectionPage > maxPage) {
    state.pagination.detectionPage = maxPage;
  }
  if (!filtered.some((item) => item.id === state.selectedDetectionId)) {
    state.selectedDetectionId = filtered[0]?.id ?? null;
  }
  syncEditorDraft(previousId !== state.selectedDetectionId);
  syncPiiSelectionState();
}

function syncEditorDraft(force = false) {
  const detection = getSelectedDetection();
  const nextSourceId = detection?.id ?? null;
  if (!force && state.editorDraftSourceId === nextSourceId) {
    return;
  }
  state.editorDraft = {
    status: detection?.status ?? null,
    comment: detection?.comment ?? "",
    assignees: [...(detection?.assignees ?? [])],
  };
  state.editorDraftSourceId = nextSourceId;
}

function renderStatusButtons() {
  refs.statusGrid.innerHTML = "";
  STATUS_ORDER.forEach((status) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "status-option";
    button.textContent = STATUS_META[status].label;
    button.disabled = !getSelectedDetection() || !isStatusAllowedForRole(status, state.role);
    button.classList.toggle("is-selected", state.editorDraft.status === status);
    button.addEventListener("click", () => {
      state.editorDraft.status = status;
      render();
    });
    refs.statusGrid.appendChild(button);
  });
}

function renderEditor() {
  const detection = getSelectedDetection();
  if (!detection) {
    refs.editorSummary.innerHTML = `<strong>검출목록에서 1건을 선택하세요</strong><span class="subtle-text">선택된 검출건의 상태, 의견, 담당자를 수정할 수 있습니다.</span>`;
    refs.commentInput.value = "";
    refs.commentInput.disabled = true;
    refs.assigneePickerTrigger.disabled = true;
    refs.saveButton.disabled = true;
    refs.commentCount.textContent = "0 / 500";
    return;
  }

  refs.editorSummary.innerHTML = `
    <div class="summary-head">
      <span class="subtle-text">${detection.path}</span>
    </div>
    <div class="summary-meta">
      <strong>${detection.detectType}</strong>
      <span class="summary-mini">검출 ${detection.count.toLocaleString("ko-KR")}건</span>
    </div>
  `;
  refs.commentInput.disabled = false;
  refs.assigneePickerTrigger.disabled = false;
  refs.commentInput.value = state.editorDraft.comment;
  refs.commentCount.textContent = `${state.editorDraft.comment.length} / 500`;
  renderAssigneeTrigger();
  refs.saveButton.disabled = !hasEditorChanges();
  renderAssigneeOptions();
}

function renderAssigneeOptions() {
  const query = state.assigneeSearch.toLowerCase();
  refs.assigneeOptions.innerHTML = "";
  ASSIGNEES.filter((name) => !query || name.toLowerCase().includes(query)).forEach((name) => {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "picker-option";
    option.textContent = name;
    option.classList.toggle("is-selected", state.editorDraft.assignees.includes(name));
    option.addEventListener("click", () => {
      if (state.editorDraft.assignees.includes(name)) {
        state.editorDraft.assignees = state.editorDraft.assignees.filter((item) => item !== name);
      } else {
        state.editorDraft.assignees = [...state.editorDraft.assignees, name];
      }
      renderAssigneeTrigger();
      renderAssigneeOptions();
      refs.saveButton.disabled = !hasEditorChanges();
    });
    refs.assigneeOptions.appendChild(option);
  });
}

function renderAssigneeTrigger() {
  if (!state.editorDraft.assignees.length) {
    refs.assigneePickerTrigger.classList.remove("has-selection");
    refs.assigneePickerTrigger.textContent = "담당자를 선택하세요";
    return;
  }
  refs.assigneePickerTrigger.classList.add("has-selection");
  refs.assigneePickerTrigger.innerHTML = `
    <span class="filter-chip-list">
      ${state.editorDraft.assignees
        .map(
          (name) =>
            `<span class="filter-chip">${escapeHtml(name)}<span class="filter-chip-remove" data-assignee-remove="${escapeHtml(name)}">×</span></span>`
        )
        .join("")}
    </span>
  `;
}

function hasEditorChanges() {
  const detection = getSelectedDetection();
  if (!detection) {
    return false;
  }
  return (
    detection.status !== state.editorDraft.status ||
    (detection.comment || "") !== state.editorDraft.comment ||
    !areStringArraysEqual(detection.assignees ?? [], state.editorDraft.assignees)
  );
}

function isStatusAllowedForRole(status, role) {
  return role === "admin" || USER_ALLOWED_STATUSES.has(status);
}

function handleSave() {
  const detection = getSelectedDetection();
  if (!detection) {
    return;
  }
  detection.status = state.editorDraft.status;
  detection.comment = state.editorDraft.comment;
  detection.assignees = [...state.editorDraft.assignees];
  detection.assignee = detection.assignees[0] ?? "";
  render();
  pushToast("검출 상태 정보가 저장되었습니다.", "success");
}

function areStringArraysEqual(left, right) {
  if (left.length !== right.length) {
    return false;
  }
  return left.every((value, index) => value === right[index]);
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const helper = document.createElement("textarea");
  helper.value = text;
  helper.setAttribute("readonly", "readonly");
  helper.style.position = "fixed";
  helper.style.top = "-9999px";
  document.body.appendChild(helper);
  helper.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(helper);
  if (!copied) {
    throw new Error("copy failed");
  }
}

function getSelectedPiiSet() {
  return getSelectedDetection()?.piiRecords ?? [];
}

function getFilteredPii() {
  const query = state.piiFilters.query.toLowerCase();
  const items = [...getSelectedPiiSet()].filter((item) => {
    return !query || item.value.toLowerCase().includes(query) || item.uniqueValue.toLowerCase().includes(query);
  });
  items.sort((a, b) => {
    const dir = state.piiFilters.sortDir === "asc" ? 1 : -1;
    if (state.piiFilters.sortKey === "count") {
      return (a.count - b.count) * dir;
    }
    return a.value.localeCompare(b.value, "ko") * dir;
  });
  return items;
}

function syncPiiSelectionState(forceReset = false) {
  const filtered = getFilteredPii();
  const maxPage = Math.max(1, Math.ceil(filtered.length / state.pagination.piiPageSize));
  if (state.pagination.piiPage > maxPage) {
    state.pagination.piiPage = maxPage;
  }
  if (forceReset || !filtered.some((item) => item.id === state.selectedPiiId)) {
    state.selectedPiiId = filtered[0]?.id ?? null;
  }
}

function getPiiPageItems() {
  const items = getFilteredPii();
  const start = (state.pagination.piiPage - 1) * state.pagination.piiPageSize;
  return {
    all: items,
    items: items.slice(start, start + state.pagination.piiPageSize),
  };
}

function renderPiiTable() {
  syncPiiSelectionState();
  const { all, items } = getPiiPageItems();
  refs.piiTableBody.innerHTML = "";
  refs.piiEmpty.hidden = all.length > 0;
  refs.piiFilterSummary.hidden = !state.piiFilters.query;

  items.forEach((item) => {
    const row = document.createElement("tr");
    row.className = "clickable-row";
    if (item.id === state.selectedPiiId) {
      row.classList.add("is-selected");
    }

    const valueCell = document.createElement("td");
    valueCell.innerHTML = `<span class="path-text">${item.value}</span>`;
    const countCell = document.createElement("td");
    countCell.className = "number-cell";
    countCell.textContent = item.count.toLocaleString("ko-KR");
    row.append(valueCell, countCell);
    row.addEventListener("click", () => {
      state.selectedPiiId = item.id;
      render();
    });
    refs.piiTableBody.appendChild(row);
  });

  refs.piiPaginationCaption.textContent = all.length
    ? `${Math.min((state.pagination.piiPage - 1) * state.pagination.piiPageSize + 1, all.length)}-${Math.min(state.pagination.piiPage * state.pagination.piiPageSize, all.length)} / ${all.length}건`
    : "0건";
  renderPagination(refs.piiPagination, all.length, state.pagination.piiPageSize, state.pagination.piiPage, (page) => {
    state.pagination.piiPage = page;
    render();
  });
  refs.sortIndicatorValue.textContent = state.piiFilters.sortKey === "value" ? (state.piiFilters.sortDir === "asc" ? "▲" : "▼") : "";
  refs.sortIndicatorCount.textContent = state.piiFilters.sortKey === "count" ? (state.piiFilters.sortDir === "asc" ? "▲" : "▼") : "";
}

function getSelectedPii() {
  return getSelectedPiiSet().find((item) => item.id === state.selectedPiiId) ?? null;
}

function renderPiiDetail() {
  const record = getSelectedPii();
  const detection = getSelectedDetection();
  refs.copyQueryButton.disabled = !record;
  refs.detailUnique.textContent = record?.uniqueValue ?? "-";
  refs.contextList.innerHTML = "";
  if (!record) {
    const li = document.createElement("li");
    li.textContent = "개인정보 목록에서 항목을 선택하면 검출내역이 표시됩니다.";
    refs.contextList.appendChild(li);
    return;
  }
  buildContextPreview(record, detection).forEach((line) => {
    const li = document.createElement("li");
    li.innerHTML = highlightDetectedValue(line, record.value);
    refs.contextList.appendChild(li);
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function highlightDetectedValue(line, detectedValue) {
  const escapedLine = escapeHtml(line);
  const escapedValue = escapeHtml(detectedValue);
  return escapedLine.split(escapedValue).join(`<span class="detected-token">${escapedValue}</span>`);
}

function buildContextPreview(record, detection) {
  const detectType = detection?.detectType ?? "";
  const snippets = {
    "주민등록번호": [
      `김미미 ${record.value} 서울시 강남구`,
      `이정훈 ${record.value} 부산시 해운대구`,
    ],
    "여권번호": [
      `김미미 ${record.value} 서울시`,
      `박서준 ${record.value} 인천시`,
    ],
    "카드번호": [
      `김미미 ${record.value} VISA 서울`,
      `박서준 ${record.value} MASTER 경기`,
    ],
    "이메일": [
      `김미미 ${record.value} 서울시`,
      `박서준 ${record.value} 인천시`,
    ],
    "휴대전화번호": [
      `김미미 ${record.value} 서울시`,
      `이정훈 ${record.value} 성남시`,
    ],
    "성명": [
      `${record.value} 010-2234-8891 서울시`,
      `${record.value} 010-7781-2210 부산시`,
    ],
    "전화번호": [
      `김미미 ${record.value} 서울시`,
      `박서준 ${record.value} 대전시`,
    ],
    "생년월일": [
      `김미미 ${record.value} 서울시`,
      `박서준 ${record.value} 인천시`,
    ],
  };
  return snippets[detectType] ?? record.contextLines;
}

function renderPagination(container, totalItems, pageSize, currentPage, onClick) {
  container.innerHTML = "";
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const prev = document.createElement("button");
  prev.type = "button";
  prev.textContent = "‹";
  prev.disabled = currentPage === 1 || totalItems === 0;
  prev.addEventListener("click", () => onClick(currentPage - 1));
  container.appendChild(prev);

  for (let page = 1; page <= totalPages; page += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = String(page);
    button.disabled = totalItems === 0;
    button.classList.toggle("is-active", page === currentPage);
    button.addEventListener("click", () => onClick(page));
    container.appendChild(button);
  }

  const next = document.createElement("button");
  next.type = "button";
  next.textContent = "›";
  next.disabled = currentPage === totalPages || totalItems === 0;
  next.addEventListener("click", () => onClick(currentPage + 1));
  container.appendChild(next);
}

function renderBulkStatusButtons() {
  refs.bulkStatusGrid.innerHTML = "";
  STATUS_ORDER.forEach((status) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "bulk-status-option";
    button.textContent = STATUS_META[status].label;
    button.disabled = !isStatusAllowedForRole(status, state.role);
    button.classList.toggle("is-selected", state.bulkEditDraft.status === status);
    button.addEventListener("click", () => {
      state.bulkEditDraft.status = status;
      renderBulkModal();
    });
    refs.bulkStatusGrid.appendChild(button);
  });
}

function renderBulkModal() {
  refs.bulkModal.hidden = !state.bulkEditDraft.open;
  refs.bulkSelectionCaption.textContent = `선택된 ${state.checkedDetectionIds.size}건에 대해 필요한 항목만 일괄 반영합니다.`;
  refs.bulkStatusEnabled.checked = state.bulkEditDraft.statusEnabled;
  refs.bulkCommentEnabled.checked = state.bulkEditDraft.commentEnabled;
  refs.bulkAssigneeEnabled.checked = state.bulkEditDraft.assigneeEnabled;
  refs.bulkCommentInput.value = state.bulkEditDraft.comment;
  refs.bulkCommentInput.disabled = !state.bulkEditDraft.commentEnabled;
  refs.bulkAssigneeSelect.value = state.bulkEditDraft.assignee;
  refs.bulkAssigneeSelect.disabled = !state.bulkEditDraft.assigneeEnabled;
  renderBulkStatusButtons();
  [...refs.bulkStatusGrid.querySelectorAll("button")].forEach((button, index) => {
    button.disabled = !state.bulkEditDraft.statusEnabled || !isStatusAllowedForRole(STATUS_ORDER[index], state.role);
  });
  refs.bulkApplyButton.disabled =
    state.checkedDetectionIds.size === 0 ||
    (!state.bulkEditDraft.statusEnabled && !state.bulkEditDraft.commentEnabled && !state.bulkEditDraft.assigneeEnabled);
}

function applyBulkEdit() {
  if (state.checkedDetectionIds.size === 0) {
    return;
  }
  detectionData.forEach((item) => {
    if (!state.checkedDetectionIds.has(item.id)) {
      return;
    }
    if (state.bulkEditDraft.statusEnabled && state.bulkEditDraft.status) {
      item.status = state.bulkEditDraft.status;
    }
    if (state.bulkEditDraft.commentEnabled) {
      item.comment = state.bulkEditDraft.comment;
    }
    if (state.bulkEditDraft.assigneeEnabled && state.bulkEditDraft.assignee) {
      item.assignee = state.bulkEditDraft.assignee;
      if (!item.assignees.includes(state.bulkEditDraft.assignee)) {
        item.assignees = [state.bulkEditDraft.assignee, ...item.assignees].slice(0, 4);
      }
    }
  });
  state.bulkEditDraft = {
    open: false,
    statusEnabled: false,
    status: null,
    commentEnabled: false,
    comment: "",
    assigneeEnabled: false,
    assignee: "",
  };
  syncEditorDraft();
  render();
  pushToast("선택 항목 일괄수정이 완료되었습니다.", "success");
}

function renderDeleteModal() {
  refs.deleteModal.hidden = !state.deleteModalOpen;
  refs.deleteCaption.textContent = `선택한 ${state.checkedDetectionIds.size}건을 검출목록에서 삭제하시겠습니까?`;
}

function applyDelete() {
  const selectedIds = [...state.checkedDetectionIds];
  if (selectedIds.length === 0) {
    return;
  }
  selectedIds.forEach((id) => {
    const index = detectionData.findIndex((item) => item.id === id);
    if (index >= 0) {
      detectionData.splice(index, 1);
    }
  });
  state.checkedDetectionIds.clear();
  state.deleteModalOpen = false;
  syncSelectionState();
  render();
  pushToast("선택 항목이 삭제되었습니다.", "danger");
}

function pushToast(message, type = "default") {
  const toast = document.createElement("div");
  toast.className = `toast ${type === "default" ? "" : `is-${type}`}`.trim();
  toast.textContent = message;
  refs.toastStack.appendChild(toast);
  window.setTimeout(() => {
    toast.remove();
  }, 2600);
}
