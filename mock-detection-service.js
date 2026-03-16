(() => {
  "use strict";

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

const INITIAL_HISTORY_TIMESTAMPS = [
  "2026-03-12T09:20:00+09:00",
  "2026-03-11T16:10:00+09:00",
  "2026-03-10T14:25:00+09:00",
  "2026-03-09T11:40:00+09:00",
  "2026-03-08T15:05:00+09:00",
  "2026-03-07T10:30:00+09:00",
  "2026-03-06T13:15:00+09:00",
  "2026-03-05T17:45:00+09:00",
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

detectionData.forEach((item, index) => {
  item.detectId = item.detectId ?? 1001 + index;
  initializeDetectionHistory(item, index);
});

function getInitialHistoryTimestamp(index) {
  return INITIAL_HISTORY_TIMESTAMPS[index] ?? INITIAL_HISTORY_TIMESTAMPS[INITIAL_HISTORY_TIMESTAMPS.length - 1];
}

function initializeDetectionHistory(detection, index) {
  const changedAt = detection.statusChangedAt ?? getInitialHistoryTimestamp(index);
  detection.statusChangedAt = changedAt;
  if (Array.isArray(detection.changeHistory) && detection.changeHistory.length) {
    detection.changeHistory = detection.changeHistory.map((entry) => ({
      changedAt: entry.changedAt ?? changedAt,
      actor: entry.actor ?? "관리자",
      status: entry.status ?? detection.status,
      comment: entry.comment ?? "",
      assignees: [...(entry.assignees ?? detection.assignees ?? [])],
    }));
    return;
  }

  const initialAssignees = [...(detection.assignees ?? [])];
  detection.changeHistory = [
    {
      changedAt,
      actor: detection.assignee || initialAssignees[0] || "관리자",
      status: detection.status,
      comment: detection.comment ?? "",
      assignees: initialAssignees,
    },
  ];

  if (index === 0) {
    detection.changeHistory = [
      {
        changedAt,
        actor: "김성진",
        status: detection.status,
        comment: detection.comment ?? "",
        assignees: initialAssignees,
      },
      {
        changedAt: "2026-03-10T14:15:00+09:00",
        actor: "장민교",
        status: "UNCHECKED",
        comment: "초기 검출 후 담당자 지정",
        assignees: ["김성진", "장민교"],
      },
      {
        changedAt: "2026-03-09T09:00:00+09:00",
        actor: "시스템",
        status: "UNCHECKED",
        comment: "배치 스캔으로 신규 검출",
        assignees: ["김성진"],
      },
    ];
  }
}

function createHistoryEntry(detection, actor, changedAt) {
  return {
    changedAt,
    actor,
    status: detection.status,
    comment: detection.comment ?? "",
    assignees: [...(detection.assignees ?? [])],
  };
}

function addDetectionHistory(detection, actor, changedAt) {
  detection.changeHistory = detection.changeHistory ?? [];
  detection.changeHistory.unshift(createHistoryEntry(detection, actor, changedAt));
}

function updateStatusChangedAt(detection, previousStatus, changedAt) {
  if (previousStatus !== detection.status) {
    detection.statusChangedAt = changedAt;
  }
}


function getDetections() {
  return detectionData;
}

function getAssignees() {
  return [...ASSIGNEES];
}

function getDetectTypes() {
  return [...new Set(detectionData.map((item) => item.detectType))];
}

function isStatusAllowedForRole(status, role) {
  if (status === "EXCLUDED" || status === "EXCLUSION_REJECTED") {
    return false;
  }
  return role === "admin" || USER_ALLOWED_STATUSES.has(status);
}

function findDetectionById(id) {
  return detectionData.find((item) => item.id === id) ?? null;
}

function getPiiRecords(detectionId) {
  return findDetectionById(detectionId)?.piiRecords ?? [];
}

function findPiiRecord(detectionId, piiId) {
  return getPiiRecords(detectionId).find((item) => item.id === piiId) ?? null;
}

function getFilteredDetections(filters, sort) {
  const query = (filters.query ?? "").toLowerCase();
  const items = detectionData.filter((item) => {
    if (item.count <= 0) {
      return false;
    }
    const matchesQuery = !query || item.path.toLowerCase().includes(query);
    const matchesType = !filters.detectTypes.length || filters.detectTypes.includes(item.detectType);
    const matchesAssignee = !filters.assignees.length || filters.assignees.every((assignee) => item.assignees.includes(assignee));
    const matchesStatus = !filters.statuses.length || filters.statuses.includes(item.status);
    return matchesQuery && matchesType && matchesAssignee && matchesStatus;
  });
  const dir = sort.dir === "asc" ? 1 : -1;
  items.sort((a, b) => {
    if (sort.key === "count") {
      return (a.count - b.count) * dir;
    }
    if (sort.key === "assignees") {
      return a.assignees.join(", ").localeCompare(b.assignees.join(", "), "ko") * dir;
    }
    if (sort.key === "status") {
      return STATUS_META[a.status].label.localeCompare(STATUS_META[b.status].label, "ko") * dir;
    }
    return String(a[sort.key]).localeCompare(String(b[sort.key]), "ko") * dir;
  });
  return items;
}

function getFilteredPii(detectionId, filters) {
  const query = (filters.query ?? "").toLowerCase();
  const items = [...getPiiRecords(detectionId)].filter((item) => {
    if (item.count <= 0) {
      return false;
    }
    return !query || item.value.toLowerCase().includes(query) || item.uniqueValue.toLowerCase().includes(query);
  });
  const dir = filters.sortDir === "asc" ? 1 : -1;
  items.sort((a, b) => {
    if (filters.sortKey === "count") {
      return (a.count - b.count) * dir;
    }
    return a.value.localeCompare(b.value, "ko") * dir;
  });
  return items;
}

function updateDetection(detectionId, updates) {
  const detection = findDetectionById(detectionId);
  if (!detection) {
    return null;
  }
  const previousStatus = detection.status;
  const previousComment = detection.comment ?? "";
  const previousAssignees = [...(detection.assignees ?? [])];

  if (Object.prototype.hasOwnProperty.call(updates, "status")) {
    detection.status = updates.status;
  }
  if (Object.prototype.hasOwnProperty.call(updates, "comment")) {
    detection.comment = updates.comment;
  }
  if (Object.prototype.hasOwnProperty.call(updates, "assignees")) {
    detection.assignees = [...updates.assignees];
    detection.assignee = detection.assignees[0] ?? "";
  }
  const hasChanges =
    previousStatus !== detection.status ||
    previousComment !== (detection.comment ?? "") ||
    previousAssignees.join("|") !== (detection.assignees ?? []).join("|");

  if (hasChanges) {
    const changedAt = new Date().toISOString();
    updateStatusChangedAt(detection, previousStatus, changedAt);
    addDetectionHistory(detection, updates.actor ?? "관리자", changedAt);
  }
  return detection;
}

function applyBulkEdit(ids, draft) {
  detectionData.forEach((item) => {
    if (!ids.includes(item.id)) {
      return;
    }
    const previousStatus = item.status;
    const previousComment = item.comment ?? "";
    const previousAssignees = [...(item.assignees ?? [])];

    if (draft.statusEnabled && draft.status) {
      item.status = draft.status;
    }
    if (draft.commentEnabled) {
      item.comment = draft.comment;
    }
    if (draft.assigneeEnabled && draft.assignee) {
      item.assignee = draft.assignee;
      if (!item.assignees.includes(draft.assignee)) {
        item.assignees = [draft.assignee, ...item.assignees].slice(0, 4);
      }
    }
    const hasChanges =
      previousStatus !== item.status ||
      previousComment !== (item.comment ?? "") ||
      previousAssignees.join("|") !== (item.assignees ?? []).join("|");

    if (hasChanges) {
      const changedAt = new Date().toISOString();
      updateStatusChangedAt(item, previousStatus, changedAt);
      addDetectionHistory(item, draft.actor ?? "관리자", changedAt);
    }
  });
}

function deleteDetections(ids) {
  ids.forEach((id) => {
    const index = detectionData.findIndex((item) => item.id === id);
    if (index >= 0) {
      detectionData.splice(index, 1);
    }
  });
}

function recheckDetections(ids) {
  ids.forEach((id, index) => {
    const detection = findDetectionById(id);
    if (!detection) {
      return;
    }
    const previousStatus = detection.status;
    const nextCount = Math.max(0, detection.count - (index + 1) * 2);
    detection.count = nextCount;
    detection.status = nextCount === 0 ? "EXCLUDED" : nextCount <= 10 ? "UNCHECKED" : "ACTION_REQUIRED";
    detection.comment = "이행점검 샘플 결과로 갱신되었습니다.";
    detection.piiRecords = detection.piiRecords.slice(0, Math.max(1, Math.min(detection.piiRecords.length, Math.ceil(nextCount / 8))));
    const changedAt = new Date().toISOString();
    updateStatusChangedAt(detection, previousStatus, changedAt);
    addDetectionHistory(detection, "시스템", changedAt);
  });
}

function recheckPiiRecord(detectionId, piiId) {
  const detection = findDetectionById(detectionId);
  const record = findPiiRecord(detectionId, piiId);
  if (!detection || !record) {
    return { ok: false, reason: "not-found" };
  }
  if (record.rechecked) {
    return { ok: false, reason: "already-processed" };
  }
  const removedCount = record.count;
  record.rechecked = true;
  record.count = 0;
  detection.count = Math.max(0, detection.count - removedCount);
  const processedCount = detection.piiRecords.filter((item) => item.rechecked).length;
  const totalCount = detection.piiRecords.length;
  if (processedCount === totalCount || detection.count === 0) {
    const previousStatus = detection.status;
    detection.piiRecords.forEach((item) => {
      item.count = 0;
      item.rechecked = true;
    });
    detection.count = 0;
    detection.status = "EXCLUDED";
    const changedAt = new Date().toISOString();
    updateStatusChangedAt(detection, previousStatus, changedAt);
    addDetectionHistory(detection, "시스템", changedAt);
    return { ok: true, completed: true, processedCount: totalCount, totalCount, removedCount, remainingCount: 0 };
  }
  return { ok: true, completed: false, processedCount, totalCount, removedCount, remainingCount: detection.count };
}

function buildContextPreview(record, detection) {
  const detectType = detection?.detectType ?? "";
  const snippets = {
    "주민등록번호": [
      `김미미 ${record.value} 서울시`,
      `이정민 ${record.value} 부산시`,
    ],
    "여권번호": [
      `김미미 ${record.value} 서울시`,
      `박서준 ${record.value} 인천시`,
    ],
    "카드번호": [
      `김미미 ${record.value} 서울시`,
      `박서준 ${record.value} 경기`,
    ],
    "이메일": [
      `김미미 ${record.value} 서울시`,
      `박서준 ${record.value} 인천시`,
    ],
    "휴대전화번호": [
      `김미미 ${record.value} 서울시`,
      `이정민 ${record.value} 성남시`,
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

window.MockDetectionService = {
  STATUS_META,
  STATUS_ORDER,
  ASSIGNEES,
  getDetections,
  getAssignees,
  getDetectTypes,
  isStatusAllowedForRole,
  findDetectionById,
  getPiiRecords,
  findPiiRecord,
  getFilteredDetections,
  getFilteredPii,
  updateDetection,
  applyBulkEdit,
  deleteDetections,
  recheckDetections,
  recheckPiiRecord,
  buildContextPreview,
};

})();
