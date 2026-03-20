(() => {
  "use strict";

  const targetService = window.MockInspectionTargetService;
  const detailStore = new Map();

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

  const GLOBAL_CHANGE_TRACKING_RULE = {
    column: "UPDATED_AT",
    method: "DATE",
    criterion: "YYYY-MM-DD HH:mm:ss",
  };

  const SCHEMA_CHANGE_TRACKING_RULES = {
    ORDER: {
      column: "LAST_MODIFIED_AT",
      method: "DATE",
      criterion: "YYYY-MM-DD HH:mm:ss",
    },
    BATCH: {
      column: "QUEUE_UPDATED_AT",
      method: "DATE",
      criterion: "YYYY-MM-DD HH:mm:ss.SSS",
    },
    AUDIT: {
      column: "LOG_ID",
      method: "SEQUENCE",
      criterion: 200000,
    },
  };

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
      changeTrackingRule: {
        column: "CHANGE_SEQ",
        method: "SEQUENCE",
        criterion: 120000,
      },
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
      changeTrackingRule: {
        column: "LOG_ID",
        method: "SEQUENCE",
        criterion: 300000,
      },
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
    if (!detailStore.has(target.id)) {
      detailStore.set(target.id, buildDetail(target));
    }
    return detailStore.get(target.id);
  }

  function saveTableInfo(id, draft) {
    const detail = getDetailById(id);
    if (!detail) {
      return null;
    }

    const normalized = normalizeTableInfoDraft(draft);
    const rowType = resolveRowType(normalized.schema, normalized.tableName);
    const savedRow = buildSavedTableRow(normalized, rowType);
    if (normalized.originalId && normalized.originalId !== savedRow.id) {
      const previousIndex = detail.tableInfo.findIndex((item) => item.id === normalized.originalId);
      if (previousIndex >= 0) {
        detail.tableInfo.splice(previousIndex, 1);
      }
    }
    upsertTableInfoRow(detail.tableInfo, savedRow);

    if (rowType === "GLOBAL_POLICY") {
      syncInheritedRows(detail.tableInfo, (row) => row.rowType === "TABLE" && row.changeTracking.sourceType === "GLOBAL", savedRow.changeTracking);
    }

    if (rowType === "SCHEMA_POLICY") {
      syncInheritedRows(
        detail.tableInfo,
        (row) =>
          row.rowType === "TABLE" &&
          row.schema === savedRow.schema &&
          row.rowsOnly &&
          row.changeTracking.sourceType !== "TABLE",
        {
          ...savedRow.changeTracking,
          sourceType: "SCHEMA",
          sourceLabel: `${savedRow.schema} 스키마 기본`,
        }
      );
    }

    if (rowType === "TABLE" && !savedRow.rowsOnly) {
      savedRow.changeTracking = buildDisabledChangeTracking();
    }

    refreshSummary(detail);
    return savedRow;
  }

  function buildDetail(target) {
    const seed = Number.parseInt(String(target.id).replace(/\D/g, ""), 10) || 1;
    const manager = INFRA_MANAGERS[(seed - 1) % INFRA_MANAGERS.length];
    const registeredAt = new Date(new Date(target.inspectionStartedAt).getTime() - (seed % 75 + 18) * 86400000).toISOString();
    const proxyStatusKeys = Object.keys(PROXY_STATUS_META);
    const proxyStatus = proxyStatusKeys[seed % proxyStatusKeys.length];
    const history = createHistory(seed, target);
    const proxyName = `DG-AGENT-${String((seed % 17) + 1).padStart(2, "0")}`;
    const detail = {
      target,
      summary: {
        mappedOwnerCount: 0,
        rowsOnlyEnabledCount: 0,
        latestStartedAt: history[0]?.startedAt ?? target.inspectionStartedAt,
      },
      dbInfo: {
        dbId: target.id.toUpperCase(),
        groupName: GROUP_NAMES[(seed - 1) % GROUP_NAMES.length],
        proxy: {
          name: proxyName,
          ip: `172.22.${12 + (seed % 18)}.${30 + (seed % 140)}`,
          port: 9988,
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
      tableInfo: createTableInfo(seed),
      inspectionHistory: history,
    };
    refreshSummary(detail);
    return detail;
  }

  function createTableInfo(seed) {
    return [
      ...createDefaultRuleRows(seed),
      ...TABLE_TEMPLATES.map((template, index) => {
        const updatedAt = new Date(Date.UTC(2026, 2, 14, 1, 30) - (seed * 17 + index * 9) * 3600000).toISOString();
        const changeTracking = resolveChangeTracking(template);
        const assignees = template.assignees.slice(0, ((seed + index) % template.assignees.length) + 1);
        return {
          id: buildRowId("TABLE", template.schema, template.tableName),
          rowType: "TABLE",
          ...template,
          updatedAt,
          assignees,
          changeTracking,
        };
      }),
    ];
  }

  function createDefaultRuleRows(seed) {
    const baseTime = new Date(Date.UTC(2026, 2, 15, 2, 0) - seed * 5400000);
    const globalRuleRow = buildDefaultRuleRow({
      schema: "전체",
      tableName: "전체",
      description: "해당 DB 전체 기본 설정",
      rule: GLOBAL_CHANGE_TRACKING_RULE,
      sourceLabel: "해당 DB 전체 기본",
      note: "스키마/개별 테이블 설정이 없을 때 적용",
      updatedAt: new Date(baseTime).toISOString(),
    });
    const schemaRuleRows = Object.entries(SCHEMA_CHANGE_TRACKING_RULES).map(([schema, rule], index) =>
      buildDefaultRuleRow({
        schema,
        tableName: "전체",
        description: `${schema} 스키마 기본 설정`,
        rule,
        sourceLabel: `${schema} 스키마 기본`,
        note: "개별 테이블 설정이 없을 때 적용",
        updatedAt: new Date(baseTime.getTime() - (index + 1) * 3600000).toISOString(),
      })
    );

    return [globalRuleRow, ...schemaRuleRows];
  }

  function buildDefaultRuleRow({ schema, tableName, description, rule, sourceLabel, note, updatedAt }) {
    return {
      id: buildRowId(schema === "전체" ? "GLOBAL_POLICY" : "SCHEMA_POLICY", schema, tableName),
      rowType: schema === "전체" ? "GLOBAL_POLICY" : "SCHEMA_POLICY",
      schema,
      tableName,
      description,
      scopeLabel: "업데이트된 ROW만 검출",
      rowsOnly: true,
      assignees: [],
      updatedAt,
      note,
      changeTracking: buildChangeTrackingLabels(rule, sourceLabel),
      isPolicyRow: true,
    };
  }

  function buildChangeTrackingLabels(rule, sourceLabel) {
    const sourceType = sourceLabel === "개별 테이블 설정"
      ? "TABLE"
      : sourceLabel.includes("스키마 기본")
        ? "SCHEMA"
        : "GLOBAL";
    return {
      columnLabel: rule.column,
      methodLabel: rule.method === "DATE" ? "날짜" : "시퀀스",
      criterionLabel:
        rule.method === "DATE"
          ? rule.criterion
          : `${Number(rule.criterion).toLocaleString("ko-KR")}건`,
      sourceLabel,
      sourceType,
    };
  }

  function resolveChangeTracking(template) {
    if (!template.rowsOnly) {
      return buildDisabledChangeTracking();
    }

    const schemaRule = SCHEMA_CHANGE_TRACKING_RULES[template.schema] ?? null;
    const tableRule = template.changeTrackingRule ?? null;
    const effectiveRule = tableRule ?? schemaRule ?? GLOBAL_CHANGE_TRACKING_RULE;
    const sourceLabel = tableRule
      ? "개별 테이블 설정"
      : schemaRule
        ? `${template.schema} 스키마 기본`
        : "해당 DB 전체 기본";

    return buildChangeTrackingLabels(effectiveRule, sourceLabel);
  }

  function buildDisabledChangeTracking() {
    return {
      columnLabel: "-",
      methodLabel: "-",
      criterionLabel: "-",
      sourceLabel: "변경감지 미적용",
      sourceType: "DISABLED",
    };
  }

  function resolveRowType(schema, tableName) {
    if (schema === "전체" && tableName === "전체") {
      return "GLOBAL_POLICY";
    }
    if (tableName === "전체") {
      return "SCHEMA_POLICY";
    }
    return "TABLE";
  }

  function buildRowId(rowType, schema, tableName) {
    return `${rowType}:${schema}:${tableName}`.replaceAll(/\s+/g, "");
  }

  function getRowTypeFromId(id) {
    return String(id ?? "").split(":")[0] || "";
  }

  function normalizeTableInfoDraft(draft) {
    const schema = normalizeText(draft.schema) || "전체";
    const tableName = normalizeText(draft.tableName) || "전체";
    const rowsOnly = draft.rowsOnly !== false;
    const assignees = unique(
      String(draft.assigneesText ?? "")
        .split(",")
        .map((value) => normalizeText(value))
        .filter(Boolean)
    );

    return {
      id: normalizeText(draft.id),
      originalId: normalizeText(draft.originalId),
      schema,
      tableName,
      description: normalizeText(draft.description) || (tableName === "전체" ? `${schema} 기본 설정` : "-"),
      rowsOnly,
      changeColumn: rowsOnly ? normalizeText(draft.changeColumn) || "UPDATED_AT" : "",
      changeMethod: rowsOnly && draft.changeMethod === "SEQUENCE" ? "SEQUENCE" : "DATE",
      criterion: rowsOnly
        ? normalizeText(draft.criterion) || (draft.changeMethod === "SEQUENCE" ? "50000" : "YYYY-MM-DD HH:mm:ss")
        : "",
      assignees,
      note: normalizeText(draft.note),
    };
  }

  function buildSavedTableRow(draft, rowType) {
    const updatedAt = new Date().toISOString();
    const sourceLabel = rowType === "GLOBAL_POLICY"
      ? "해당 DB 전체 기본"
      : rowType === "SCHEMA_POLICY"
        ? `${draft.schema} 스키마 기본`
        : draft.rowsOnly
          ? "개별 테이블 설정"
          : "변경감지 미적용";

    const description = draft.description || (
      rowType === "GLOBAL_POLICY"
        ? "해당 DB 전체 기본 설정"
        : rowType === "SCHEMA_POLICY"
          ? `${draft.schema} 스키마 기본 설정`
          : "-"
    );

    return {
      id:
        draft.id && getRowTypeFromId(draft.id) === rowType
          ? draft.id
          : buildRowId(rowType, draft.schema, draft.tableName),
      rowType,
      schema: draft.schema,
      tableName: draft.tableName,
      description,
      scopeLabel: draft.rowsOnly ? "업데이트된 ROW만 검출" : "전체 스캔",
      rowsOnly: draft.rowsOnly,
      assignees: rowType === "TABLE" ? draft.assignees : [],
      updatedAt,
      note: draft.note || (
        rowType === "GLOBAL_POLICY"
          ? "스키마/개별 테이블 설정이 없을 때 적용"
          : rowType === "SCHEMA_POLICY"
            ? "개별 테이블 설정이 없을 때 적용"
            : ""
      ),
      changeTracking: draft.rowsOnly
        ? buildChangeTrackingLabels(
            {
              column: draft.changeColumn,
              method: draft.changeMethod,
              criterion: draft.changeMethod === "DATE" ? draft.criterion : Number.parseInt(draft.criterion, 10) || 0,
            },
            sourceLabel
          )
        : buildDisabledChangeTracking(),
    };
  }

  function upsertTableInfoRow(rows, nextRow) {
    const existingIndex = rows.findIndex(
      (row) =>
        row.id === nextRow.id ||
        (row.rowType === nextRow.rowType && row.schema === nextRow.schema && row.tableName === nextRow.tableName)
    );
    if (existingIndex >= 0) {
      rows.splice(existingIndex, 1, nextRow);
    } else {
      rows.push(nextRow);
    }
    rows.sort((left, right) => {
      const priority = { GLOBAL_POLICY: 0, SCHEMA_POLICY: 1, TABLE: 2 };
      return (
        (priority[left.rowType] ?? 9) - (priority[right.rowType] ?? 9) ||
        left.schema.localeCompare(right.schema, "ko") ||
        left.tableName.localeCompare(right.tableName, "ko")
      );
    });
  }

  function syncInheritedRows(rows, predicate, changeTracking) {
    rows.forEach((row) => {
      if (!predicate(row) || !row.rowsOnly) {
        return;
      }
      row.changeTracking = {
        ...changeTracking,
      };
      row.updatedAt = new Date().toISOString();
    });
  }

  function refreshSummary(detail) {
    const actualRows = detail.tableInfo.filter((item) => item.rowType === "TABLE");
    const mappedOwners = [...new Set(actualRows.flatMap((item) => item.assignees))];
    detail.summary.mappedOwnerCount = mappedOwners.length;
    detail.summary.rowsOnlyEnabledCount = actualRows.filter((item) => item.rowsOnly).length;
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
        scheduleId: `SCH-${String(1000 + (seed - 1) * 10 + index + 1).padStart(4, "0")}`,
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

  function normalizeText(value) {
    return String(value ?? "").trim();
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
    saveTableInfo,
  };
})();
