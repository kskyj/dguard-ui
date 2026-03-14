(() => {
  "use strict";

  const STATUS_META = {
    READY: { label: "대기", className: "inspection-status-ready" },
    RUNNING: { label: "점검중", className: "inspection-status-running" },
    COMPLETED: { label: "점검완료", className: "inspection-status-completed" },
    FAILED: { label: "오류", className: "inspection-status-failed" },
  };

  const STATUS_ORDER = ["RUNNING", "READY", "COMPLETED", "FAILED"];

  const DB_TYPES = ["Oracle", "DB2", "Sybase", "MSSQL", "MySQL", "PostgreSQL", "Tibero", "MariaDB"];
  const TARGET_NAMES = [
    "개인정보통합관리",
    "통합로그",
    "부동산시스템",
    "결제리포트",
    "고객마스터",
    "회원포털",
    "인사정보",
    "급여정산",
    "전자계약",
    "민원처리",
    "대외연계",
    "영업지원",
    "물류추적",
    "정산허브",
    "리스크관리",
    "감사추적",
    "데이터허브",
    "API게이트웨이",
    "통합모니터링",
    "문서중앙화",
    "채널관리",
    "자산관리",
    "예산통제",
    "점포운영",
  ];
  const DOMAINS = ["고객", "결제", "민원", "영업", "물류", "인사", "마케팅", "통합", "정산", "파트너"];
  const SYSTEMS = ["운영", "분석", "중계", "리포트", "원장", "백업"];
  const ENVIRONMENTS = ["운영", "개발", "검증", "DR"];
  const EXTRA_LABELS = [
    "핵심",
    "외부연계",
    "개인정보",
    "배치",
    "실시간",
    "야간점검",
    "권한통제",
    "고위험",
    "장기보관",
    "마스킹대상",
    "공통계정",
    "암호화대상",
    "민감테이블",
    "API연계",
    "센터전용",
  ];

  const targets = createTargets();

  function createTargets() {
    const baseDate = new Date("2026-03-13T09:00:00+09:00").getTime();
    const list = [];

    for (let index = 1; index <= 420; index += 1) {
      const dbType = DB_TYPES[(index - 1) % DB_TYPES.length];
      const domain = DOMAINS[(index - 1) % DOMAINS.length];
      const system = SYSTEMS[(index + 1) % SYSTEMS.length];
      const environment = ENVIRONMENTS[(index + 2) % ENVIRONMENTS.length];
      const status = STATUS_ORDER[(index * 3) % STATUS_ORDER.length];
      const startedAt = new Date(baseDate - ((index % 19) * 54 + index * 17) * 60000).toISOString();
      const durationMinutes = 12 + ((index * 11) % 214);
      const searchCount = 4 + ((index * 13) % 186);
      const recentTableCount = 24 + ((index * 17) % 612);
      const recentDetectionCount = index % 6 === 0 ? 0 : 8 + ((index * 29) % 1830);
      const labelSeed = [
        environment,
        `${domain}계`,
        index % 2 === 0 ? "핵심" : "실시간",
        EXTRA_LABELS[(index + 1) % EXTRA_LABELS.length],
      ];
      if (index % 4 === 0) {
        labelSeed.push("외부연계");
      }
      if (index % 5 === 0) {
        labelSeed.push("개인정보");
      }
      if (index % 9 === 0) {
        labelSeed.push("야간점검");
      }
      if (index % 11 === 0) {
        labelSeed.push("고위험");
      }

      const name = `${TARGET_NAMES[(index - 1) % TARGET_NAMES.length]} ${String(index).padStart(3, "0")}`;
      const serviceName = `${domain.toUpperCase()}_${system.toUpperCase()}_${String(index).padStart(3, "0")}`;

      list.push({
        id: `db-${String(index).padStart(3, "0")}`,
        name,
        serviceName,
        dbType,
        searchCount,
        status,
        recentTableCount,
        recentDetectionCount,
        inspectionStartedAt: startedAt,
        durationMinutes,
        labels: uniqueLabels(labelSeed),
        host: `10.20.${20 + (index % 24)}.${30 + (index % 180)}`,
        port: 1500 + ((index * 37) % 5000),
        instanceName: `${dbType.slice(0, 3).toUpperCase()}${String(index).padStart(3, "0")}`,
        ownerTeam: `${domain}보안운영팀`,
        description: `${domain} 업무 ${system} 계열로 등록된 ${dbType} 대상입니다.`,
      });
    }

    return list;
  }

  function uniqueLabels(labels) {
    return [...new Set(labels.map((label) => String(label).trim()).filter((label) => label && !DB_TYPES.includes(label)))];
  }

  function getTargets() {
    return targets;
  }

  function findTargetById(id) {
    return targets.find((item) => item.id === id) ?? null;
  }

  function getTargetsByIds(ids) {
    const idSet = new Set(ids);
    return targets.filter((item) => idSet.has(item.id));
  }

  function getAllLabels() {
    return [...new Set(targets.flatMap((item) => item.labels))].sort((left, right) => left.localeCompare(right, "ko"));
  }

  function getPopularLabels(limit = 12) {
    const counts = new Map();
    targets.forEach((item) => {
      item.labels.forEach((label) => {
        counts.set(label, (counts.get(label) ?? 0) + 1);
      });
    });
    return [...counts.entries()]
      .sort((left, right) => {
        if (right[1] !== left[1]) {
          return right[1] - left[1];
        }
        return left[0].localeCompare(right[0], "ko");
      })
      .slice(0, limit)
      .map(([label]) => label);
  }

  function getSummary() {
    return {
      total: targets.length,
      running: targets.filter((item) => item.status === "RUNNING").length,
      completed: targets.filter((item) => item.status === "COMPLETED").length,
      failed: targets.filter((item) => item.status === "FAILED").length,
      labelCount: getAllLabels().length,
    };
  }

  function updateLabels(ids, payload) {
    const idSet = new Set(ids);
    const addLabels = uniqueLabels(payload.addLabels ?? []);
    const removeLabels = new Set(uniqueLabels(payload.removeLabels ?? []));

    targets.forEach((item) => {
      if (!idSet.has(item.id)) {
        return;
      }
      const nextLabels = item.labels.filter((label) => !removeLabels.has(label));
      item.labels = uniqueLabels([...nextLabels, ...addLabels]);
    });
  }

  window.MockInspectionTargetService = {
    STATUS_META,
    STATUS_ORDER,
    DB_TYPES,
    getTargets,
    findTargetById,
    getTargetsByIds,
    getAllLabels,
    getPopularLabels,
    getSummary,
    updateLabels,
  };
})();
