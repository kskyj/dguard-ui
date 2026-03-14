(() => {
  "use strict";

  const targetService = window.MockInspectionTargetService;

  const HISTORY_STATUS_META = {
    SUCCESS: { label: "성공", className: "is-success" },
    FAILED: { label: "실패", className: "is-failed" },
    RUNNING: { label: "진행중", className: "is-running" },
    WAITING: { label: "대기", className: "is-waiting" },
  };

  const PROXY_STATUS_META = {
    HEALTHY: { label: "연결정상", className: "is-healthy" },
    DEGRADED: { label: "지연감지", className: "is-degraded" },
    OFFLINE: { label: "미연결", className: "is-offline" },
  };

  const GROUP_NAMES = [
    "개인정보 집중관리 그룹",
    "정기 운영 점검 그룹",
    "고위험 DB 상시 모니터링 그룹",
    "대외연계 검출 우선 그룹",
    "배치 정합성 점검 그룹",
  ];

  const INFRA_MANAGERS = [
    { name: "김도현", contact: "인프라운영1팀 / 내선 2143" },
    { name: "박서윤", contact: "데이터플랫폼팀 / 내선 2188" },
    { name: "이성준", contact: "DBA운영팀 / 내선 2251" },
    { name: "정하늘", contact: "시스템엔지니어링팀 / 내선 2314" },
    { name: "윤지후", contact: "공통인프라팀 / 내선 2406" },
  ];

  const INSPECTORS = ["김성진", "장민교", "이아름", "박준호", "최윤서", "정하림"];
  const SCHEDULE_NAMES = ["새벽 정기점검", "오전 증분점검", "수시 변경점검", "주간 심화점검", "긴급 재점검"];
  const RULE_NAMES = [
    "기본 주민번호/운전면허 통합 룰",
    "업무컬럼 증분 검출 룰",
    "고위험 식별정보 우선 룰",
    "민감정보 조합 검출 룰",
    "백업/임시테이블 포함 룰",
  ];

  const FAILURE_REASON_TEMPLATES = [
    [
      "Proxy(에이전트) 응답 지연으로 스캔 세션이 종료되었습니다.",
      "네트워크 재시도 3회 후에도 대상 DB 연결이 복구되지 않았습니다.",
    ],
    [
      "증분 기준 컬럼 UPDATED_AT 인덱스 누락으로 조회 시간이 임계치를 초과했습니다.",
      "해당 테이블은 Full Scan으로 전환되지 않아 점검이 중단되었습니다.",
    ],
    [
      "점검 중 계정 권한이 변경되어 일부 스키마 메타데이터 조회가 실패했습니다.",
      "DB 인프라 담당자 승인 후 재점검이 필요합니다.",
    ],
  ];

  const TABLE_TEMPLATES = [
    {
      schema: "CUSTOMER",
      tableName: "TB_CUSTOMER",
      description: "고객 마스터",
      scopeLabel: "업데이트된 ROW만 검출",
      changeKey: "UPDATED_AT",
      assignees: ["김성진", "장민교"],
      rowsOnly: true,
      note: "주요 고객식별 컬럼 포함",
    },
    {
      schema: "CUSTOMER",
      tableName: "TB_CUSTOMER_LOG",
      description: "고객 변경 이력",
      scopeLabel: "업데이트된 ROW만 검출",
      changeKey: "CHANGE_SEQ",
      assignees: ["이아름"],
      rowsOnly: true,
      note: "배치 적재 후 점검",
    },
    {
      schema: "ORDER",
      tableName: "TB_ORDER_MASTER",
      description: "주문 마스터",
      scopeLabel: "업데이트된 ROW만 검출",
      changeKey: "LAST_MODIFIED_AT",
      assignees: ["박준호", "정하림"],
      rowsOnly: true,
      note: "대외연계 주문 포함",
    },
    {
      schema: "ORDER",
      tableName: "TB_ORDER_DETAIL",
      description: "주문 상세",
      scopeLabel: "전체 스캔",
      changeKey: "없음",
      assignees: ["정하림"],
      rowsOnly: false,
      note: "초기 정합성 검토 대상",
    },
    {
      schema: "BATCH",
      tableName: "TB_EXPORT_QUEUE",
      description: "배치 추출 큐",
      scopeLabel: "업데이트된 ROW만 검출",
      changeKey: "QUEUE_UPDATED_AT",
      assignees: ["최윤서"],
      rowsOnly: true,
      note: "외부 파일 반출 전 검증",
    },
    {
      schema: "AUDIT",
      tableName: "TB_ACCESS_AUDIT",
      description: "접근 로그",
      scopeLabel: "업데이트된 ROW만 검출",
      changeKey: "LOG_ID",
      assignees: ["김성진", "최윤서"],
      rowsOnly: true,
      note: "PII 접근 로그 모니터링",
    },
  ];

  function getDetailById(id) {
    const target = targetService.findTargetById(id) ?? targetService.getTargets()[0] ?? null;
    if (!target) {
      return null;
    }
    return buildDetail(target);
  }

  function buildDetail(target) {
    const seed = Number.parseInt(String(target.id).replace(/\D/g, ""), 10) || 1;
    const manager = INFRA_MANAGERS[(seed - 1) % INFRA_MANAGERS.length];
    const registeredAt = new Date(new Date(target.inspectionStartedAt).getTime() - (seed % 75 + 18) * 86400000).toISOString();
    const proxyStatusKeys = Object.keys(PROXY_STATUS_META);
    const proxyStatus = proxyStatusKeys[seed % proxyStatusKeys.length];
    const history = createHistory(seed, target);
    const tableInfo = createTableInfo(seed);
    const mappedOwners = [...new Set(tableInfo.flatMap((item) => item.assignees))];
    const proxyName = `DG-AGENT-${String((seed % 17) + 1).padStart(2, "0")}`;

    return {
      target,
      summary: {
        mappedOwnerCount: mappedOwners.length,
        rowsOnlyEnabledCount: tableInfo.filter((item) => item.rowsOnly).length,
        latestStartedAt: history[0]?.startedAt ?? target.inspectionStartedAt,
      },
      dbInfo: {
        dbId: target.id.toUpperCase(),
        groupName: GROUP_NAMES[(seed - 1) % GROUP_NAMES.length],
        proxy: {
          name: proxyName,
          ip: `172.22.${12 + (seed % 18)}.${30 + (seed % 140)}`,
          version: `v3.${(seed % 4) + 1}.${(seed % 7) + 2}`,
          status: proxyStatus,
        },
        registeredAt,
        infraManager: manager.name,
        infraContact: manager.contact,
        labels: unique([target.dbType, ...target.labels, "상세점검대상", seed % 2 === 0 ? "증분검출" : "정기점검"]),
        memo: [
          `${manager.name} 담당으로 ${formatDateTime(registeredAt)} 등록되었습니다.`,
          `Proxy ${proxyName} 경유로 ${target.dbType} 점검을 수행합니다.`,
          seed % 3 === 0
            ? "변경량이 큰 테이블은 배치 종료 후 증분 점검으로 운영합니다."
            : "주요 민감정보 컬럼은 업무시간 외 재점검 대상으로 지정되어 있습니다.",
        ],
      },
      tableInfo,
      inspectionHistory: history,
    };
  }

  function createTableInfo(seed) {
    return TABLE_TEMPLATES.map((template, index) => {
      const updatedAt = new Date(Date.UTC(2026, 2, 14, 1, 30) - (seed * 17 + index * 9) * 3600000).toISOString();
      return {
        ...template,
        updatedAt,
        assignees: template.assignees.slice(0, ((seed + index) % template.assignees.length) + 1),
      };
    });
  }

  function createHistory(seed, target) {
    const baseTime = new Date(target.inspectionStartedAt).getTime() + (seed % 4) * 1800000;
    return Array.from({ length: 8 }, (_, index) => {
      const startedAt = new Date(baseTime - index * 6 * 3600000 - (seed % 3) * 900000).toISOString();
      const durationMinutes = 24 + ((seed * 11 + index * 7) % 71);
      const status = index === 1 || (index === 5 && seed % 2 === 0) ? "FAILED" : index === 0 && target.status === "RUNNING" ? "RUNNING" : "SUCCESS";
      const residentCount = 18 + ((seed * 7 + index * 5) % 104);
      const driverLicenseCount = 4 + ((seed * 5 + index * 3) % 22);
      const passportCount = 3 + ((seed * 4 + index * 4) % 16);
      const cardCount = 12 + ((seed * 9 + index * 6) % 61);
      const totalCount = residentCount + driverLicenseCount + passportCount + cardCount + (index % 2 === 0 ? 11 : 17);

      return {
        id: `${target.id}-history-${index + 1}`,
        detectId: `DET-${String(seed).padStart(4, "0")}-${String(index + 1).padStart(2, "0")}`,
        scheduleName: SCHEDULE_NAMES[index % SCHEDULE_NAMES.length],
        inspector: INSPECTORS[(seed + index) % INSPECTORS.length],
        status,
        ruleName: `${RULE_NAMES[index % RULE_NAMES.length]} v${(seed % 4) + 2}.${index + 1}`,
        startedAt,
        endedAt: status === "RUNNING" ? null : new Date(new Date(startedAt).getTime() + durationMinutes * 60000).toISOString(),
        durationMinutes,
        searchVolume: 120000 + seed * 431 + index * 8200,
        totalCount,
        residentCount,
        driverLicenseCount,
        passportCount,
        cardCount,
        failureReason: status === "FAILED" ? FAILURE_REASON_TEMPLATES[(seed + index) % FAILURE_REASON_TEMPLATES.length] : [],
      };
    });
  }

  function unique(values) {
    return [...new Set(values.filter(Boolean))];
  }

  function formatDateTime(value) {
    const date = new Date(value);
    const pad = (number) => String(number).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  window.MockInspectionTargetDetailService = {
    HISTORY_STATUS_META,
    PROXY_STATUS_META,
    getDetailById,
  };
})();
