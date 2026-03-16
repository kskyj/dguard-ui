(() => {
  "use strict";

  const targetService = window.MockInspectionTargetService;

  const STATUS_META = {
    UNCHECKED: { label: "미확인", className: "status-unchecked" },
    EXCLUSION_REQUESTED: { label: "제외신청", className: "status-requested" },
    EXCLUDED: { label: "제외", className: "status-excluded" },
    EXCLUSION_REJECTED: { label: "제외거부", className: "status-rejected" },
  };

  const baseRows = [
    { id: "req-101", targetId: "db-005", detectId: 1041, path: "/CUSTOMER/TB_CUSTOMER/EMAIL", requestedBy: "김성진", requestedAt: "2026-03-15T09:20:00+09:00", requestComment: "내부 대체키 컬럼이라 오탐 여부 확인 요청", status: "EXCLUSION_REQUESTED" },
    { id: "req-102", targetId: "db-011", detectId: 1048, path: "/ORDER/TB_ORDER_MASTER/BUYER_NAME", requestedBy: "장민교", requestedAt: "2026-03-15T10:10:00+09:00", requestComment: "테스트 주문 데이터만 검출되어 제외신청", status: "EXCLUSION_REQUESTED" },
    { id: "req-103", targetId: "db-017", detectId: 1053, path: "/PAYMENT/TB_BILLING/CARD_NO", requestedBy: "이아름", requestedAt: "2026-03-15T11:25:00+09:00", requestComment: "부분 마스킹 로그 컬럼이라 검토 필요", status: "EXCLUSION_REQUESTED" },
    { id: "req-104", targetId: "db-023", detectId: 1062, path: "/LOGISTICS/TB_DELIVERY_LOG/PHONE_NO", requestedBy: "김성진", requestedAt: "2026-03-15T13:05:00+09:00", requestComment: "고객센터 테스트 시나리오 데이터입니다.", status: "EXCLUSION_REQUESTED" },
    { id: "req-105", targetId: "db-029", detectId: 1068, path: "/MEMBER/TB_PROFILE/BIRTH_DATE", requestedBy: "박준호", requestedAt: "2026-03-15T14:40:00+09:00", requestComment: "해시 대체값 컬럼으로 확인되어 신청합니다.", status: "EXCLUSION_REQUESTED" },
    { id: "req-106", targetId: "db-035", detectId: 1077, path: "/MARKETING/TB_AUDIENCE/EMAIL", requestedBy: "김성진", requestedAt: "2026-03-15T15:30:00+09:00", requestComment: "샘플 캠페인 계정이라 예외 적용 요청", status: "EXCLUSION_REQUESTED" },
    { id: "req-107", targetId: "db-041", detectId: 1084, path: "/CS/TB_CALL_HISTORY/PHONE_NO", requestedBy: "정하림", requestedAt: "2026-03-15T16:10:00+09:00", requestComment: "업무용 대표번호가 혼입되어 있습니다.", status: "EXCLUSION_REQUESTED" },
    { id: "req-108", targetId: "db-047", detectId: 1089, path: "/SETTLEMENT/TB_VENDOR_ACCOUNT/ACCOUNT_NO", requestedBy: "김성진", requestedAt: "2026-03-15T16:55:00+09:00", requestComment: "법인 공용계좌 컬럼이어서 제외신청합니다.", status: "EXCLUSION_REQUESTED" },
    { id: "req-109", targetId: "db-053", detectId: 1094, path: "/TRAVEL/TB_PASSENGER/PASSPORT_NO", requestedBy: "최윤서", requestedAt: "2026-03-15T17:20:00+09:00", requestComment: "비식별 처리된 샘플 데이터라 검토 바랍니다.", status: "EXCLUSION_REQUESTED" },
    { id: "req-110", targetId: "db-059", detectId: 1102, path: "/STAT/TB_USER_SEGMENT/NAME", requestedBy: "김성진", requestedAt: "2026-03-16T09:05:00+09:00", requestComment: "집계용 가명값 컬럼으로 신청합니다.", status: "EXCLUSION_REQUESTED" },
    { id: "req-111", targetId: "db-065", detectId: 1108, path: "/FINANCE/TB_EXPENSE_CARD/CARD_NO", requestedBy: "임다빈", requestedAt: "2026-03-16T09:35:00+09:00", requestComment: "토큰화 카드번호로 검출되어 신청", status: "EXCLUSION_REQUESTED" },
    { id: "req-112", targetId: "db-071", detectId: 1116, path: "/AUDIT/TB_ACCESS_LOG/EMAIL", requestedBy: "김성진", requestedAt: "2026-03-16T10:15:00+09:00", requestComment: "운영 점검용 샘플 주소라 제외신청합니다.", status: "EXCLUSION_REQUESTED" },
    { id: "req-201", targetId: "db-077", detectId: 981, path: "/CUSTOMER/TB_CUSTOMER_LOG/RRN", requestedBy: "김성진", requestedAt: "2026-03-13T13:20:00+09:00", requestComment: "운영서버 마스킹 테스트 잔존값입니다.", status: "EXCLUDED", processedBy: "관리자", processedAt: "2026-03-14T09:05:00+09:00", processedComment: "테스트 데이터로 확인되어 제외 승인" },
    { id: "req-202", targetId: "db-083", detectId: 986, path: "/PAYMENT/TB_REFUND_HISTORY/CARD_NO", requestedBy: "장민교", requestedAt: "2026-03-13T14:15:00+09:00", requestComment: "토큰값으로 확인되어 승인 요청", status: "EXCLUSION_REJECTED", processedBy: "관리자", processedAt: "2026-03-14T10:40:00+09:00", processedComment: "원문 카드번호 보관이 확인되어 거부" },
    { id: "req-203", targetId: "db-089", detectId: 995, path: "/LOGISTICS/TB_RECEIVER/PHONE_NO", requestedBy: "김성진", requestedAt: "2026-03-13T15:05:00+09:00", requestComment: "발송 테스트용 번호입니다.", status: "EXCLUDED", processedBy: "관리자", processedAt: "2026-03-14T11:15:00+09:00", processedComment: "업무 테스트 번호로 확인되어 제외" },
    { id: "req-204", targetId: "db-095", detectId: 1004, path: "/MEMBER/TB_PROFILE/EMAIL", requestedBy: "최윤서", requestedAt: "2026-03-13T16:00:00+09:00", requestComment: "샘플 계정 주소로 운영 미사용 데이터", status: "EXCLUDED", processedBy: "관리자", processedAt: "2026-03-14T14:10:00+09:00", processedComment: "샘플 계정 확인 완료" },
    { id: "req-205", targetId: "db-101", detectId: 1012, path: "/CS/TB_CHAT_LOG/NAME", requestedBy: "김성진", requestedAt: "2026-03-13T16:50:00+09:00", requestComment: "상담용 가명 데이터입니다.", status: "EXCLUSION_REJECTED", processedBy: "관리자", processedAt: "2026-03-14T15:20:00+09:00", processedComment: "실사용 고객명 포함으로 거부" },
    { id: "req-206", targetId: "db-107", detectId: 1018, path: "/SETTLEMENT/TB_VENDOR_CONTACT/PHONE_NO", requestedBy: "임다빈", requestedAt: "2026-03-13T17:25:00+09:00", requestComment: "대표번호 컬럼입니다.", status: "EXCLUDED", processedBy: "관리자", processedAt: "2026-03-14T16:05:00+09:00", processedComment: "대표번호 사용 확인" },
    { id: "req-207", targetId: "db-113", detectId: 1024, path: "/FINANCE/TB_EMPLOYEE_CARD/CARD_NO", requestedBy: "김성진", requestedAt: "2026-03-13T18:10:00+09:00", requestComment: "암호화 필드라고 전달받았습니다.", status: "EXCLUSION_REJECTED", processedBy: "관리자", processedAt: "2026-03-14T17:30:00+09:00", processedComment: "복호화 가능한 원문 컬럼 확인" },
    { id: "req-208", targetId: "db-119", detectId: 1030, path: "/AUDIT/TB_DEBUG_USER/EMAIL", requestedBy: "송지후", requestedAt: "2026-03-13T18:45:00+09:00", requestComment: "개발계 샘플 계정만 존재합니다.", status: "EXCLUDED", processedBy: "관리자", processedAt: "2026-03-14T18:05:00+09:00", processedComment: "개발 샘플 계정만 포함되어 승인" },
  ];

  const rows = baseRows.map((row) => ({
    ...row,
    history: buildHistory(row),
  }));

  function buildHistory(row) {
    const history = [{ type: "request", actor: row.requestedBy, actedAt: row.requestedAt, comment: row.requestComment, status: "EXCLUSION_REQUESTED" }];
    if (row.processedAt) {
      history.unshift({
        type: row.status === "EXCLUDED" ? "approve" : "reject",
        actor: row.processedBy ?? "관리자",
        actedAt: row.processedAt,
        comment: row.processedComment ?? "",
        status: row.status,
      });
    }
    return history;
  }

  function cloneRow(row) {
    const target = targetService?.findTargetById?.(row.targetId);
    const dbName = target?.name ?? row.targetId;
    const url = target ? `${target.host}:${target.port}/${target.instanceName}` : "-";
    return {
      ...row,
      dbName,
      url,
      history: (row.history ?? []).map((entry) => ({ ...entry })),
    };
  }

  function getVisibleRows(role, actor) {
    const scoped = role === "admin" ? rows : rows.filter((row) => row.requestedBy === actor);
    return scoped.filter((row) => row.status !== "UNCHECKED");
  }

  function compareValues(left, right, dir) {
    if (typeof left === "number" || typeof right === "number") {
      return ((Number(left) || 0) - (Number(right) || 0)) * dir;
    }
    return String(left ?? "").localeCompare(String(right ?? ""), "ko") * dir;
  }

  function sortRows(items, sort) {
    const dir = sort?.dir === "asc" ? 1 : -1;
    const key = sort?.key ?? "requestedAt";
    items.sort((left, right) => {
      if (key === "requestedAt" || key === "processedAt") {
        return (new Date(left[key] ?? 0).getTime() - new Date(right[key] ?? 0).getTime()) * dir;
      }
      if (key === "status") {
        return compareValues(STATUS_META[left.status]?.label, STATUS_META[right.status]?.label, dir);
      }
      return compareValues(left[key], right[key], dir);
    });
    return items;
  }

  function getRows(options = {}) {
    const {
      tab = "pending",
      role = "admin",
      actor = "",
      query = "",
      sort = { key: tab === "pending" ? "requestedAt" : "processedAt", dir: "desc" },
      statuses = [],
    } = options;
    const visible = getVisibleRows(role, actor);
    const normalizedQuery = query.trim().toLowerCase();
    const decorated = visible.map(cloneRow);
    const filtered = decorated.filter((row) => {
      const isPending = row.status === "EXCLUSION_REQUESTED";
      const isProcessed = row.status === "EXCLUDED" || row.status === "EXCLUSION_REJECTED";
      if (tab === "pending" && !isPending) {
        return false;
      }
      if (tab === "processed" && !isProcessed) {
        return false;
      }
      if (normalizedQuery) {
        const haystack = [
          row.requestedBy,
          row.dbName,
          row.url,
          row.path,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(normalizedQuery)) {
          return false;
        }
      }
      if (tab === "processed") {
        if (statuses.length && !statuses.includes(row.status)) {
          return false;
        }
      }
      return true;
    });

    return sortRows(filtered, sort);
  }

  function processRows(ids, action, opinion, actor) {
    const changedAt = new Date().toISOString();
    const nextStatus = action === "approve" ? "EXCLUDED" : "EXCLUSION_REJECTED";
    let processedCount = 0;

    rows.forEach((row) => {
      if (!ids.includes(row.id) || row.status !== "EXCLUSION_REQUESTED") {
        return;
      }
      row.status = nextStatus;
      row.processedBy = actor;
      row.processedAt = changedAt;
      row.processedComment = opinion;
      row.history.unshift({ type: action, actor, actedAt: changedAt, comment: opinion, status: nextStatus });
      processedCount += 1;
    });

    return { processedCount, nextStatus, changedAt };
  }

  function cancelRows(ids, actor) {
    let canceledCount = 0;
    rows.forEach((row) => {
      if (!ids.includes(row.id) || row.status !== "EXCLUSION_REQUESTED" || row.requestedBy !== actor) {
        return;
      }
      row.status = "UNCHECKED";
      row.processedBy = "";
      row.processedAt = "";
      row.processedComment = "";
      row.history.unshift({
        type: "cancel",
        actor,
        actedAt: new Date().toISOString(),
        comment: "제외신청이 취소되어 미확인 상태로 복귀",
        status: "UNCHECKED",
      });
      canceledCount += 1;
    });
    return { canceledCount };
  }

  function getPageStats(options = {}) {
    const { role = "admin", actor = "" } = options;
    const scoped = getVisibleRows(role, actor);
    return {
      total: scoped.length,
      pending: scoped.filter((row) => row.status === "EXCLUSION_REQUESTED").length,
      approved: scoped.filter((row) => row.status === "EXCLUDED").length,
      rejected: scoped.filter((row) => row.status === "EXCLUSION_REJECTED").length,
    };
  }

  window.MockExceptionRequestService = {
    STATUS_META,
    getRows,
    processRows,
    cancelRows,
    getPageStats,
  };
})();
