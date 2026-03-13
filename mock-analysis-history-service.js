(() => {
  "use strict";

  const STATUS_META = {
    COMPLETE: { label: "완료", className: "analysis-status-complete" },
    RUNNING: { label: "진행중", className: "analysis-status-running" },
    FAILED: { label: "오류", className: "analysis-status-failed" },
    REVIEW_REQUIRED: { label: "검토필요", className: "analysis-status-review" },
  };

  const STATUS_ORDER = ["COMPLETE", "RUNNING", "FAILED", "REVIEW_REQUIRED"];

  const runs = [
    {
      id: "run-12",
      runName: "12차 정기분석",
      targetName: "부동산플랫폼 운영 DB",
      scope: "CUSTOMER, PAYMENT, CLAIM",
      owner: "김성진",
      status: "REVIEW_REQUIRED",
      detectionCount: 743,
      piiTypes: 8,
      startedAt: "2026-03-13T11:20:00+09:00",
      endedAt: "2026-03-13T14:30:00+09:00",
      durationMinutes: 190,
      summary: "주민등록번호, 카드번호, 이메일 컬럼에서 재검토가 필요한 검출건이 증가했습니다.",
      notes: [
        "업체 전달용 목업에서는 검출목록 상세로 연결되는 흐름만 확인하면 됩니다.",
        "12차는 직전 차수 대비 카드번호 검출 건수가 18% 증가했습니다.",
      ],
    },
    {
      id: "run-11",
      runName: "11차 정기분석",
      targetName: "부동산플랫폼 운영 DB",
      scope: "CUSTOMER, PAYMENT",
      owner: "장민교",
      status: "COMPLETE",
      detectionCount: 604,
      piiTypes: 6,
      startedAt: "2026-03-12T11:10:00+09:00",
      endedAt: "2026-03-12T13:55:00+09:00",
      durationMinutes: 165,
      summary: "운영 대상 2개 스키마 기준 정기 스캔이 정상 종료되었습니다.",
      notes: [
        "11차는 결제영역 마스킹 정책 반영 이후 재측정 기준선으로 사용됩니다.",
      ],
    },
    {
      id: "run-10",
      runName: "10차 긴급분석",
      targetName: "부동산플랫폼 운영 DB",
      scope: "PAYMENT",
      owner: "박준호",
      status: "FAILED",
      detectionCount: 0,
      piiTypes: 0,
      startedAt: "2026-03-10T16:00:00+09:00",
      endedAt: "2026-03-10T16:42:00+09:00",
      durationMinutes: 42,
      summary: "결제 스키마 연결 타임아웃으로 중단되었습니다.",
      notes: [
        "목업에서는 실패 이력의 상태 표현과 메모 영역 확인이 목적입니다.",
      ],
    },
    {
      id: "run-09",
      runName: "9차 정기분석",
      targetName: "고객센터 민원 DB",
      scope: "CLAIM, SUPPORT",
      owner: "이아름",
      status: "COMPLETE",
      detectionCount: 418,
      piiTypes: 5,
      startedAt: "2026-03-08T20:00:00+09:00",
      endedAt: "2026-03-08T21:24:00+09:00",
      durationMinutes: 84,
      summary: "민원 본문 텍스트 영역에서 이름과 전화번호 패턴이 다수 확인되었습니다.",
      notes: [
        "비정형 텍스트 탐지 규칙 검토가 병행되어야 합니다.",
      ],
    },
    {
      id: "run-08",
      runName: "8차 야간분석",
      targetName: "HR 인사 DB",
      scope: "HR",
      owner: "임다빈",
      status: "RUNNING",
      detectionCount: 193,
      piiTypes: 3,
      startedAt: "2026-03-13T01:30:00+09:00",
      endedAt: "2026-03-13T02:50:00+09:00",
      durationMinutes: 80,
      summary: "휴대전화번호 및 연락망 컬럼 정비 여부를 재확인하는 중간 이력입니다.",
      notes: [
        "진행중 상태에서는 최종 검출건수가 확정되지 않은 샘플로 취급합니다.",
      ],
    },
    {
      id: "run-07",
      runName: "7차 정기분석",
      targetName: "마케팅 분석 추출본",
      scope: "ANALYTICS, EXPORT",
      owner: "최윤서",
      status: "REVIEW_REQUIRED",
      detectionCount: 257,
      piiTypes: 4,
      startedAt: "2026-03-07T09:00:00+09:00",
      endedAt: "2026-03-07T10:20:00+09:00",
      durationMinutes: 80,
      summary: "생년월일, 이메일 반출본에서 비식별 정책 미준수 가능성이 포착되었습니다.",
      notes: [
        "업체 시연 시 검토 필요 상태와 필터링 예시로 사용합니다.",
      ],
    },
    {
      id: "run-06",
      runName: "6차 정기분석",
      targetName: "고객프로필 통합 DB",
      scope: "CUSTOMER, PROFILE",
      owner: "정하림",
      status: "COMPLETE",
      detectionCount: 331,
      piiTypes: 5,
      startedAt: "2026-03-05T13:00:00+09:00",
      endedAt: "2026-03-05T14:22:00+09:00",
      durationMinutes: 82,
      summary: "이메일, 휴대전화번호, 이름 컬럼 기준 점검이 정상 종료되었습니다.",
      notes: [
        "통합 DB 표준 마스킹 적용 이후 비교 기준선으로 활용합니다.",
      ],
    },
  ];

  function getRuns() {
    return runs;
  }

  function getOwners() {
    return [...new Set(runs.map((item) => item.owner))];
  }

  function findRunById(id) {
    return runs.find((item) => item.id === id) ?? null;
  }

  function getFilteredRuns(filters, sort) {
    const query = (filters.query ?? "").toLowerCase();
    const items = runs.filter((item) => {
      const matchesQuery =
        !query ||
        item.runName.toLowerCase().includes(query) ||
        item.targetName.toLowerCase().includes(query) ||
        item.scope.toLowerCase().includes(query);
      const matchesStatus = !filters.statuses.length || filters.statuses.includes(item.status);
      const matchesOwner = !filters.owners.length || filters.owners.includes(item.owner);
      return matchesQuery && matchesStatus && matchesOwner;
    });

    const dir = sort.dir === "asc" ? 1 : -1;
    items.sort((left, right) => {
      if (sort.key === "detectionCount") {
        return (left.detectionCount - right.detectionCount) * dir;
      }
      if (sort.key === "endedAt") {
        return (new Date(left.endedAt).getTime() - new Date(right.endedAt).getTime()) * dir;
      }
      if (sort.key === "status") {
        return STATUS_META[left.status].label.localeCompare(STATUS_META[right.status].label, "ko") * dir;
      }
      return String(left[sort.key]).localeCompare(String(right[sort.key]), "ko") * dir;
    });
    return items;
  }

  function getSummary() {
    const total = runs.length;
    const completed = runs.filter((item) => item.status === "COMPLETE").length;
    const reviewRequired = runs.filter((item) => item.status === "REVIEW_REQUIRED").length;
    const averageDetections = Math.round(runs.reduce((sum, item) => sum + item.detectionCount, 0) / Math.max(total, 1));
    return {
      total,
      completed,
      reviewRequired,
      averageDetections,
    };
  }

  window.MockAnalysisHistoryService = {
    STATUS_META,
    STATUS_ORDER,
    getRuns,
    getOwners,
    findRunById,
    getFilteredRuns,
    getSummary,
  };
})();
