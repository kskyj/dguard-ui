(() => {
  "use strict";

  const STATUS_META = {
    WAITING: { label: "대기", className: "schedule-status-waiting" },
    RUNNING: { label: "점검중", className: "schedule-status-running" },
    COMPLETED: { label: "점검완료", className: "schedule-status-completed" },
    FAILED: { label: "실패", className: "schedule-status-failed" },
    STOPPED: { label: "중지", className: "schedule-status-stopped" },
  };

  const SUMMARY_STATUS_ORDER = ["WAITING", "RUNNING", "COMPLETED", "STOPPED"];
  const FILTER_STATUS_ORDER = ["WAITING", "RUNNING", "COMPLETED", "FAILED", "STOPPED"];
  const CSV_HEADERS = ["스케줄명", "점검룰", "점검대상", "설명", "다음시작일시"];
  const CURRENT_USER = "김성진";

  const schedules = [
    createSeedSchedule(1001, {
      name: "주간 고객정보 점검",
      ruleName: "고객 기본정보 표준 룰",
      targetName: "고객통합 DB",
      description: "매주 월요일 새벽 고객 기본정보 테이블 점검",
      status: "WAITING",
      durationMinutes: 0,
      lastEndedAt: null,
      nextStartedAt: "2026-03-20T01:00:00+09:00",
      createdBy: "김성진",
      createdAt: "2026-03-10T09:30:00+09:00",
    }),
    createSeedSchedule(1002, {
      name: "결제 민감정보 정기점검",
      ruleName: "결제/카드번호 강화 룰",
      targetName: "결제리포트 DB",
      description: "결제 스키마 내 카드번호 및 계좌정보 점검",
      status: "RUNNING",
      durationMinutes: 56,
      lastEndedAt: "2026-03-18T22:14:00+09:00",
      nextStartedAt: "2026-03-19T11:30:00+09:00",
      createdBy: "박서윤",
      createdAt: "2026-03-09T15:10:00+09:00",
    }),
    createSeedSchedule(1003, {
      name: "민원 본문 점검",
      ruleName: "비정형 텍스트 탐지 룰",
      targetName: "민원처리 DB",
      description: "민원 본문 내 이름, 전화번호, 주소 탐지",
      status: "COMPLETED",
      durationMinutes: 82,
      lastEndedAt: "2026-03-18T06:20:00+09:00",
      nextStartedAt: "2026-03-20T06:00:00+09:00",
      createdBy: "이아림",
      createdAt: "2026-03-08T10:00:00+09:00",
    }),
    createSeedSchedule(1004, {
      name: "인사 개인정보 긴급점검",
      ruleName: "고위험 주민번호 룰",
      targetName: "HR 인사 DB",
      description: "인사 테이블 긴급 재점검",
      status: "FAILED",
      durationMinutes: 17,
      lastEndedAt: "2026-03-17T23:48:00+09:00",
      nextStartedAt: "2026-03-19T23:00:00+09:00",
      createdBy: "최윤서",
      createdAt: "2026-03-11T13:20:00+09:00",
    }),
    createSeedSchedule(1005, {
      name: "API 로그 예약 점검",
      ruleName: "로그 비식별 보완 룰",
      targetName: "API 게이트웨이 DB",
      description: "로그성 테이블 주기 점검",
      status: "STOPPED",
      durationMinutes: 41,
      lastEndedAt: "2026-03-16T03:20:00+09:00",
      nextStartedAt: "2026-03-21T03:00:00+09:00",
      createdBy: "정하린",
      createdAt: "2026-03-07T17:42:00+09:00",
    }),
    createSeedSchedule(1006, {
      name: "채널관리 월간 점검",
      ruleName: "비정형 텍스트 탐지 룰",
      targetName: "채널관리 DB",
      description: "상담 메모와 고객 응대 로그 점검",
      status: "WAITING",
      durationMinutes: 0,
      lastEndedAt: "2026-03-15T02:10:00+09:00",
      nextStartedAt: "2026-03-22T02:00:00+09:00",
      createdBy: "김성진",
      createdAt: "2026-03-12T08:15:00+09:00",
    }),
    createSeedSchedule(1007, {
      name: "문서중앙화 야간 점검",
      ruleName: "문서 반출 사전 점검 룰",
      targetName: "문서중앙화 DB",
      description: "문서 메타 및 첨부정보 야간 점검",
      status: "COMPLETED",
      durationMinutes: 69,
      lastEndedAt: "2026-03-18T01:55:00+09:00",
      nextStartedAt: "2026-03-19T23:30:00+09:00",
      createdBy: "김성진",
      createdAt: "2026-03-05T19:40:00+09:00",
    }),
    createSeedSchedule(1008, {
      name: "자산관리 주간 점검",
      ruleName: "기본 주민번호/계좌 통합 룰",
      targetName: "자산관리 DB",
      description: "자산 담당자 및 반출 계정 점검",
      status: "STOPPED",
      durationMinutes: 38,
      lastEndedAt: "2026-03-14T18:42:00+09:00",
      nextStartedAt: "2026-03-24T18:00:00+09:00",
      createdBy: "박서윤",
      createdAt: "2026-03-04T11:12:00+09:00",
    }),
    createSeedSchedule(1009, {
      name: "통합로그 증분 점검",
      ruleName: "로그 비식별 보완 룰",
      targetName: "통합로그 DB",
      description: "당일 적재분 중심 증분 점검",
      status: "RUNNING",
      durationMinutes: 24,
      lastEndedAt: "2026-03-18T10:08:00+09:00",
      nextStartedAt: "2026-03-19T10:45:00+09:00",
      createdBy: "이아림",
      createdAt: "2026-03-13T07:30:00+09:00",
    }),
    createSeedSchedule(1010, {
      name: "정산허브 예약 점검",
      ruleName: "결제/카드번호 강화 룰",
      targetName: "정산허브 DB",
      description: "정산허브 카드번호 컬럼 주기 점검",
      status: "WAITING",
      durationMinutes: 0,
      lastEndedAt: "2026-03-17T04:40:00+09:00",
      nextStartedAt: "2026-03-20T04:30:00+09:00",
      createdBy: "정하린",
      createdAt: "2026-03-06T09:05:00+09:00",
    }),
    createSeedSchedule(1011, {
      name: "통합모니터링 재점검",
      ruleName: "고위험 주민번호 룰",
      targetName: "통합모니터링 DB",
      description: "실패 이후 수동 재시작 대상",
      status: "FAILED",
      durationMinutes: 11,
      lastEndedAt: "2026-03-18T08:02:00+09:00",
      nextStartedAt: "2026-03-19T20:00:00+09:00",
      createdBy: "최윤서",
      createdAt: "2026-03-14T16:23:00+09:00",
    }),
    createSeedSchedule(1012, {
      name: "보험청구 정기점검",
      ruleName: "고객 기본정보 표준 룰",
      targetName: "보험청구 DB",
      description: "보험청구 고객 및 수익자 개인정보 점검",
      status: "COMPLETED",
      durationMinutes: 95,
      lastEndedAt: "2026-03-18T07:30:00+09:00",
      nextStartedAt: "2026-03-21T07:00:00+09:00",
      createdBy: "김성진",
      createdAt: "2026-03-03T14:55:00+09:00",
    }),
  ];

  let nextScheduleNumber = 1013;

  function createSeedSchedule(number, payload) {
    return {
      id: `SCH-${String(number).padStart(4, "0")}`,
      ...payload,
    };
  }

  function getSchedules() {
    return schedules;
  }

  function getSummary() {
    return {
      total: schedules.length,
      WAITING: schedules.filter((item) => item.status === "WAITING").length,
      RUNNING: schedules.filter((item) => item.status === "RUNNING").length,
      COMPLETED: schedules.filter((item) => item.status === "COMPLETED").length,
      FAILED: schedules.filter((item) => item.status === "FAILED").length,
      STOPPED: schedules.filter((item) => item.status === "STOPPED").length,
    };
  }

  function getFilteredSchedules(filters, sort) {
    const query = String(filters?.query ?? "").trim().toLowerCase();
    const statuses = Array.isArray(filters?.statuses) ? filters.statuses : [];
    const summaryStatus = filters?.summaryStatus ?? null;

    const items = schedules.filter((item) => {
      const matchesQuery =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.ruleName.toLowerCase().includes(query) ||
        item.createdBy.toLowerCase().includes(query);
      const matchesStatuses = !statuses.length || statuses.includes(item.status);
      const matchesSummaryStatus = !summaryStatus || item.status === summaryStatus;
      return matchesQuery && matchesStatuses && matchesSummaryStatus;
    });

    const direction = sort?.dir === "asc" ? 1 : -1;
    items.sort((left, right) => compareSchedules(left, right, sort?.key ?? "id") * direction);
    return items;
  }

  function findScheduleById(id) {
    return schedules.find((item) => item.id === id) ?? null;
  }

  function updateSchedule(id, payload) {
    const target = findScheduleById(id);
    if (!target) {
      return null;
    }
    target.name = String(payload.name ?? target.name).trim();
    target.ruleName = String(payload.ruleName ?? target.ruleName).trim();
    target.targetName = String(payload.targetName ?? target.targetName).trim();
    target.description = String(payload.description ?? target.description).trim();
    target.nextStartedAt = normalizeDateTime(payload.nextStartedAt ?? target.nextStartedAt);
    return target;
  }

  function stopSchedules(ids) {
    return mutateSchedules(ids, (item) => {
      item.status = "STOPPED";
      item.nextStartedAt = addMinutes(new Date(), 45).toISOString();
    });
  }

  function restartSchedules(ids) {
    return mutateSchedules(ids, (item, index) => {
      item.status = "WAITING";
      item.nextStartedAt = addMinutes(new Date(), 30 + index * 15).toISOString();
    });
  }

  function deleteSchedules(ids) {
    const idSet = new Set(ids);
    const deleted = [];
    for (let index = schedules.length - 1; index >= 0; index -= 1) {
      if (!idSet.has(schedules[index].id)) {
        continue;
      }
      deleted.push(schedules[index]);
      schedules.splice(index, 1);
    }
    return deleted.reverse();
  }

  function parseBulkSchedules(input) {
    const normalized = String(input ?? "").replace(/\r\n/g, "\n").trim();
    if (!normalized) {
      return [];
    }

    const delimiter = normalized.includes("\t") ? "\t" : ",";
    const rows = delimiter === "\t" ? parseDelimitedText(normalized, "\t") : parseCsv(normalized);
    if (!rows.length) {
      return [];
    }

    const normalizedHeader = rows[0].map((value) => normalizeHeader(value));
    const expectedHeader = CSV_HEADERS.map((value) => normalizeHeader(value));
    const hasHeader = expectedHeader.every((value, index) => normalizedHeader[index] === value);
    const dataRows = hasHeader ? rows.slice(1) : rows;

    return dataRows
      .filter((row) => row.some((value) => String(value).trim()))
      .map((row, index) => buildParsedRow(index + 1, row));
  }

  function createSchedules(rows) {
    const created = rows.map((row, index) => {
      const schedule = createSeedSchedule(nextScheduleNumber + index, {
        name: row.name,
        ruleName: row.ruleName,
        targetName: row.targetName,
        description: row.description,
        status: "WAITING",
        durationMinutes: 0,
        lastEndedAt: null,
        nextStartedAt: normalizeDateTime(row.nextStartedAt),
        createdBy: CURRENT_USER,
        createdAt: new Date().toISOString(),
      });
      schedules.unshift(schedule);
      return schedule;
    });
    nextScheduleNumber += rows.length;
    return created;
  }

  function downloadSampleCsv() {
    const sampleRows = [
      CSV_HEADERS,
      [
        "고객정보 심야 점검",
        "고객 기본정보 표준 룰",
        "고객통합 DB",
        "고객 테이블 심야 점검",
        "2026-03-21 01:00",
      ],
      [
        "결제정보 재점검",
        "결제/카드번호 강화 룰",
        "결제리포트 DB",
        "실패 이력 재시작용 샘플",
        "2026-03-21 03:30",
      ],
    ];

    return {
      filename: "analysis-history-sample.csv",
      content: sampleRows.map((row) => row.map(escapeCsvValue).join(",")).join("\r\n"),
    };
  }

  function mutateSchedules(ids, mutator) {
    const updated = [];
    ids.forEach((id, index) => {
      const item = findScheduleById(id);
      if (!item) {
        return;
      }
      mutator(item, index);
      updated.push(item);
    });
    return updated;
  }

  function compareSchedules(left, right, key) {
    if (key === "status") {
      return FILTER_STATUS_ORDER.indexOf(left.status) - FILTER_STATUS_ORDER.indexOf(right.status);
    }
    if (key === "lastEndedAt" || key === "nextStartedAt") {
      return getTimeValue(left[key]) - getTimeValue(right[key]);
    }
    return String(left[key] ?? "").localeCompare(String(right[key] ?? ""), "ko");
  }

  function getTimeValue(value) {
    if (!value) {
      return -1;
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? -1 : date.getTime();
  }

  function buildParsedRow(rowNumber, row) {
    const values = [...row, "", "", "", "", ""].slice(0, 5).map((value) => String(value).trim());
    const [name, ruleName, targetName, description, nextStartedAt] = values;
    const errors = [];

    if (!name) {
      errors.push("스케줄명 누락");
    }
    if (!ruleName) {
      errors.push("점검룰 누락");
    }
    if (!targetName) {
      errors.push("점검대상 누락");
    }
    if (!nextStartedAt) {
      errors.push("다음시작일시 누락");
    } else if (!normalizeDateInput(nextStartedAt)) {
      errors.push("다음시작일시 형식 오류");
    }

    return {
      rowNumber,
      name,
      ruleName,
      targetName,
      description,
      nextStartedAt: normalizeDateInput(nextStartedAt),
      valid: errors.length === 0,
      errors,
    };
  }

  function parseDelimitedText(input, delimiter) {
    return input
      .split("\n")
      .map((line) => line.split(delimiter).map((value) => value.trim()))
      .filter((row) => row.length && row.some((value) => value));
  }

  function parseCsv(input) {
    const rows = [];
    let current = [];
    let value = "";
    let inQuotes = false;

    for (let index = 0; index < input.length; index += 1) {
      const char = input[index];
      const next = input[index + 1];

      if (char === '"') {
        if (inQuotes && next === '"') {
          value += '"';
          index += 1;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }

      if (char === "," && !inQuotes) {
        current.push(value);
        value = "";
        continue;
      }

      if (char === "\n" && !inQuotes) {
        current.push(value);
        rows.push(current.map((item) => item.trim()));
        current = [];
        value = "";
        continue;
      }

      value += char;
    }

    if (value || current.length) {
      current.push(value);
      rows.push(current.map((item) => item.trim()));
    }

    return rows.filter((row) => row.some((cell) => cell));
  }

  function normalizeHeader(value) {
    return String(value).replace(/\s+/g, "").trim().toLowerCase();
  }

  function normalizeDateInput(value) {
    const raw = String(value ?? "").trim();
    if (!raw) {
      return "";
    }
    const normalized = raw.replace(/\./g, "-").replace(/\//g, "-").replace("T", " ");
    const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})$/);
    if (!match) {
      return "";
    }
    const [, year, month, day, hour, minute] = match;
    return `${year}-${month}-${day}T${hour}:${minute}:00+09:00`;
  }

  function normalizeDateTime(value) {
    const normalized = normalizeDateInput(String(value).replace("T", " ").slice(0, 16));
    if (normalized) {
      return normalized;
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }

  function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes * 60000);
  }

  function escapeCsvValue(value) {
    const stringValue = String(value);
    if (!/[",\n]/.test(stringValue)) {
      return stringValue;
    }
    return `"${stringValue.replaceAll('"', '""')}"`;
  }

  window.MockAnalysisHistoryService = {
    STATUS_META,
    SUMMARY_STATUS_ORDER,
    FILTER_STATUS_ORDER,
    CSV_HEADERS,
    getSchedules,
    getSummary,
    getFilteredSchedules,
    findScheduleById,
    updateSchedule,
    stopSchedules,
    restartSchedules,
    deleteSchedules,
    parseBulkSchedules,
    createSchedules,
    downloadSampleCsv,
  };
})();
