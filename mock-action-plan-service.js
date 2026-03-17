(() => {
  "use strict";

  const STORAGE_KEY = "dguard.actionPlans";
  const SELECTION_KEY = "dguard.actionPlanSelection";

  const detectionService = window.MockDetectionService;

  const STATUS_META = {
    PENDING: { label: "등록 대기", className: "status-pending" },
    REGISTERED: { label: "등록 완료", className: "status-registered" },
    COMPLETED: { label: "조치 완료", className: "status-completed" },
  };

  const seedPlans = buildSeedPlans();
  let plans = loadPlans();

  function loadPlans() {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      persistPlans(seedPlans);
      return [...seedPlans];
    }
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (error) {
      console.warn("failed to parse action plans", error);
    }
    persistPlans(seedPlans);
    return [...seedPlans];
  }

  function persistPlans(nextPlans) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextPlans));
  }

  function buildSeedPlans() {
    const detections = detectionService?.getDetections?.() ?? [];
    const defaultTargetName = "부동산플랫폼(192.168.20.1:3306/DSTTT)";
    const makeTargets = (ids) =>
      ids
        .map((id) => detections.find((item) => item.id === id))
        .filter(Boolean)
        .map((item) => ({
          id: item.id,
          path: item.path,
          detectType: item.detectType,
          count: item.count,
          recheckAt: "",
          recheckResultCount: 0,
        }));

    const seed = [
      {
        id: "AP-20260316-001",
        status: "PENDING",
        createdAt: "2026-03-16T10:05:00+09:00",
        createdBy: "관리자",
        dbName: defaultTargetName,
        dueDate: "2026-03-28",
        cause: "마스킹 정책 미적용 컬럼이 발견되어 긴급 조치가 필요합니다.",
        method: "검출 컬럼 마스킹 적용 및 저장 프로시저 점검",
        targets: makeTargets(["det-1", "det-5"]).map((target) => ({
          ...target,
          recheckResultCount: 0,
        })),
        attachments: [],
      },
      {
        id: "AP-20260315-002",
        status: "REGISTERED",
        createdAt: "2026-03-15T15:40:00+09:00",
        createdBy: "김성진",
        dbName: defaultTargetName,
        dueDate: "2026-03-22",
        cause: "외부 반출 데이터에 민감정보가 포함되어 있습니다.",
        method: "반출 데이터 재생성 및 접근 로그 검토",
        targets: makeTargets(["det-3", "det-8"]).map((target, index) => ({
          ...target,
          recheckAt: "2026-03-16T09:10:00+09:00",
          recheckResultCount: Math.max(0, target.count - (index + 1) * 8),
        })),
        attachments: [
          {
            name: "조치계획서_부동산플랫폼_0315.pdf",
            size: 245120,
            type: "application/pdf",
          },
        ],
      },
      {
        id: "AP-20260312-003",
        status: "COMPLETED",
        createdAt: "2026-03-12T11:10:00+09:00",
        createdBy: "관리자",
        dbName: defaultTargetName,
        dueDate: "2026-03-18",
        cause: "오래된 이력 테이블에서 반복 검출됩니다.",
        method: "이관 데이터 정리 및 주기적 삭제 스케줄 등록",
        targets: makeTargets(["det-6"]).map((target) => ({
          ...target,
          recheckAt: "2026-03-14T10:40:00+09:00",
          recheckResultCount: 0,
        })),
        attachments: [
          {
            name: "조치계획서_이력테이블_0312.pdf",
            size: 192820,
            type: "application/pdf",
          },
        ],
      },
    ];

    return seed;
  }

  function getPlans(options = {}) {
    const { role = "admin", actor = "관리자", query = "" } = options;
    const normalizedQuery = query.trim().toLowerCase();
    const filteredByRole = role === "admin" ? plans : plans.filter((plan) => plan.createdBy === actor);
    return filteredByRole.filter((plan) => {
      if (!normalizedQuery) {
        return true;
      }
      const haystack = [plan.id, plan.createdBy, plan.dbName, plan.method]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }

  function getPlanById(id) {
    return plans.find((plan) => plan.id === id) ?? null;
  }

  function getSelectionIds() {
    const raw = sessionStorage.getItem(SELECTION_KEY);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function createPlan(payload) {
    const { targets, cause, method, dueDate, actor, dbName } = payload;
    const now = new Date().toISOString();
    const base = now.slice(0, 10).replaceAll("-", "");
    const seq = String(plans.length + 1).padStart(3, "0");
    const plan = {
      id: `AP-${base}-${seq}`,
      status: "PENDING",
      createdAt: now,
      createdBy: actor,
      dbName,
      dueDate,
      cause,
      method,
      targets: targets.map((target) => ({
        id: target.id,
        path: target.path,
        detectType: target.detectType,
        count: target.count,
        recheckAt: "",
        recheckResultCount: 0,
      })),
      attachments: [],
    };
    plans = [plan, ...plans];
    persistPlans(plans);
    sessionStorage.removeItem(SELECTION_KEY);
    return plan;
  }

  function addAttachments(planId, files) {
    const plan = getPlanById(planId);
    if (!plan) {
      return { added: [], rejected: files };
    }
    const accepted = [];
    const rejected = [];
    files.forEach((file) => {
      if (!file || file.type !== "application/pdf") {
        rejected.push(file);
        return;
      }
      accepted.push({
        id: `file-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        name: file.name,
        size: file.size,
        type: file.type,
      });
    });
    if (accepted.length) {
      plan.attachments = [...plan.attachments, ...accepted];
      if (plan.status !== "COMPLETED") {
        plan.status = "REGISTERED";
      }
      persistPlans(plans);
    }
    return { added: accepted, rejected };
  }

  function removeAttachment(planId, index) {
    const plan = getPlanById(planId);
    if (!plan) {
      return { ok: false };
    }
    if (!Number.isInteger(index) || index < 0 || index >= plan.attachments.length) {
      return { ok: false };
    }
    plan.attachments.splice(index, 1);
    if (plan.attachments.length === 0 && plan.status === "REGISTERED") {
      plan.status = "PENDING";
    }
    persistPlans(plans);
    return { ok: true };
  }

  function recheckPlan(planId) {
    const plan = getPlanById(planId);
    if (!plan) {
      return { ok: false };
    }
    const changedAt = new Date().toISOString();
    plan.targets = plan.targets.map((target, index) => {
      const current = Number.isFinite(target.recheckResultCount)
        ? target.recheckResultCount
        : target.count;
      const nextCount = Math.max(0, current - (index + 1) * 4);
      return {
        ...target,
        recheckAt: changedAt,
        recheckResultCount: nextCount,
      };
    });
    if (plan.targets.every((target) => target.recheckResultCount === 0)) {
      plan.status = "COMPLETED";
    } else if (plan.attachments.length && plan.status !== "COMPLETED") {
      plan.status = "REGISTERED";
    }
    persistPlans(plans);
    return { ok: true, completed: plan.status === "COMPLETED", changedAt };
  }

  function getRecheckTotal(plan) {
    return plan.targets.reduce((sum, target) => sum + (Number(target.recheckResultCount) || 0), 0);
  }

  function getOverduePlans(now = new Date()) {
    return plans.filter((plan) => {
      if (!plan.dueDate) {
        return false;
      }
      const due = new Date(`${plan.dueDate}T00:00:00`);
      if (Number.isNaN(due.getTime())) {
        return false;
      }
      return due < now && getRecheckTotal(plan) > 0;
    });
  }

  window.MockActionPlanService = {
    STATUS_META,
    getPlans,
    getPlanById,
    getSelectionIds,
    createPlan,
    addAttachments,
    removeAttachment,
    recheckPlan,
    getRecheckTotal,
    getOverduePlans,
  };
})();
