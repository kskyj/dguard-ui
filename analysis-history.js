const historyService = window.MockAnalysisHistoryService;
const historyShared = window.DGuardShared;
const { STATUS_META, FILTER_STATUS_ORDER } = historyService;

const refs = {};
let sidebarController;
let userMenuController;

const DETAIL_TARGETS_BY_SCHEDULE_ID = {
  "SCH-1001": [
    { type: "DB", path: "customer_db" },
    { type: "스키마", path: "customer_db/customer" },
    { type: "테이블", path: "customer_db/customer/customer_master" },
    { type: "컬럼", path: "customer_db/customer/customer_master/rrn" },
  ],
  "SCH-1002": [
    { type: "DB", path: "payment_db" },
    { type: "스키마", path: "payment_db/payment" },
    { type: "테이블", path: "payment_db/payment/card_transaction" },
    { type: "테이블", path: "payment_db/payment/billing_account" },
    { type: "컬럼", path: "payment_db/payment/card_transaction/card_no" },
  ],
  "SCH-1003": [
    { type: "DB", path: "civil_db" },
    { type: "스키마", path: "civil_db/civil" },
    { type: "테이블", path: "civil_db/civil/petition_body" },
    { type: "컬럼", path: "civil_db/civil/petition_body/address" },
    { type: "컬럼", path: "civil_db/civil/petition_body/mobile_no" },
  ],
  "SCH-1004": [
    { type: "DB", path: "hr_db" },
    { type: "스키마", path: "hr_db/hr" },
    { type: "테이블", path: "hr_db/hr/employee_profile" },
    { type: "컬럼", path: "hr_db/hr/employee_profile/ssn" },
  ],
  "SCH-1005": [
    { type: "DB", path: "api_gateway_db" },
    { type: "스키마", path: "api_gateway_db/logs" },
    { type: "테이블", path: "api_gateway_db/logs/api_request_log" },
    { type: "테이블", path: "api_gateway_db/logs/api_response_log" },
  ],
  "SCH-1006": [
    { type: "DB", path: "channel_db" },
    { type: "스키마", path: "channel_db/channel" },
    { type: "테이블", path: "channel_db/channel/consult_memo" },
    { type: "컬럼", path: "channel_db/channel/consult_memo/customer_note" },
  ],
  "SCH-1007": [
    { type: "DB", path: "docs_db" },
    { type: "스키마", path: "docs_db/docs" },
    { type: "테이블", path: "docs_db/docs/export_file" },
    { type: "컬럼", path: "docs_db/docs/export_file/owner_name" },
    { type: "컬럼", path: "docs_db/docs/export_file/email" },
  ],
  "SCH-1008": [
    { type: "DB", path: "asset_db" },
    { type: "스키마", path: "asset_db/asset" },
    { type: "테이블", path: "asset_db/asset/asset_owner" },
    { type: "테이블", path: "asset_db/asset/asset_history" },
  ],
  "SCH-1009": [
    { type: "DB", path: "integrated_log_db" },
    { type: "스키마", path: "integrated_log_db/log" },
    { type: "테이블", path: "integrated_log_db/log/daily_partition" },
    { type: "컬럼", path: "integrated_log_db/log/daily_partition/payload" },
  ],
  "SCH-1010": [
    { type: "DB", path: "settlement_db" },
    { type: "스키마", path: "settlement_db/settlement" },
    { type: "테이블", path: "settlement_db/settlement/approval_log" },
    { type: "컬럼", path: "settlement_db/settlement/approval_log/account_no" },
  ],
  "SCH-1011": [
    { type: "DB", path: "monitoring_db" },
    { type: "스키마", path: "monitoring_db/monitoring" },
    { type: "테이블", path: "monitoring_db/monitoring/failure_history" },
    { type: "컬럼", path: "monitoring_db/monitoring/failure_history/payload" },
  ],
  "SCH-1012": [
    { type: "DB", path: "insurance_claim_db" },
    { type: "스키마", path: "insurance_claim_db/claim" },
    { type: "테이블", path: "insurance_claim_db/claim/customer_claim" },
    { type: "컬럼", path: "insurance_claim_db/claim/customer_claim/phone_no" },
    { type: "컬럼", path: "insurance_claim_db/claim/customer_claim/address" },
  ],
};

const state = {
  role: "admin",
  sidebarCollapsed: false,
  selectedMenuKey: "analysis-history",
  openSidebarGroupKey: null,
  userMenuOpen: false,
  selectedScheduleId: null,
  checkedScheduleIds: new Set(),
  filters: {
    query: "",
    statuses: [],
    summaryStatus: null,
    panelOpen: false,
  },
  filterDraft: {
    statuses: [],
  },
  filterUi: {
    openKey: null,
    statusesSearch: "",
  },
  sort: {
    key: "id",
    dir: "asc",
  },
  pagination: {
    page: 1,
    pageSize: 10,
  },
  confirmAction: {
    open: false,
    type: null,
    title: "",
    message: "",
  },
};

document.addEventListener("DOMContentLoaded", init);

function init() {
  cacheRefs();
  sidebarController = historyShared.initSidebar({
    sidebarNav: refs.sidebarNav,
    sidebarToggle: refs.sidebarToggle,
    roleButtons: refs.roleButtons,
    getState: () => state,
    onRoleChange: (nextRole) => {
      state.userMenuOpen = false;
      state.checkedScheduleIds.clear();
      pushToast(`역할이 ${nextRole === "admin" ? "관리자" : "일반사용자"}로 변경되었습니다.`);
    },
    onRender: render,
  });
  userMenuController = historyShared.initUserMenu({
    root: refs.userMenu,
    trigger: refs.userMenuTrigger,
    panel: refs.userMenuPanel,
    settingsButton: refs.userSettingsButton,
    logoutButton: refs.logoutButton,
    getState: () => state,
    onRender: render,
    onSettings: () => pushToast("사용자설정 화면은 샘플에서 준비 중입니다."),
    onLogout: () => pushToast("로그아웃 요청을 처리했습니다."),
  });

  bindEvents();
  syncSelectionState();
  render();
}

function cacheRefs() {
  const ids = [
    "sidebarToggle",
    "userMenu",
    "userMenuTrigger",
    "userMenuPanel",
    "userSettingsButton",
    "logoutButton",
    "statusSummaryStrip",
    "summaryWaitingCount",
    "summaryRunningCount",
    "summaryCompletedCount",
    "summaryStoppedCount",
    "summaryFailedCount",
    "scheduleSearchInput",
    "toggleScheduleFilterButton",
    "scheduleToolbarCaption",
    "stopSchedulesButton",
    "restartSchedulesButton",
    "deleteSchedulesButton",
    "openBulkRegisterButton",
    "scheduleFilterSummary",
    "scheduleFilterBadge",
    "clearScheduleFiltersButton",
    "selectAllSchedules",
    "scheduleTableBody",
    "scheduleEmpty",
    "schedulePageSizeSelect",
    "schedulePagination",
    "sortIndicatorId",
    "sortIndicatorName",
    "sortIndicatorStatus",
    "sortIndicatorLastEndedAt",
    "sortIndicatorNextStartedAt",
    "detailPanelSubtitle",
    "detailScheduleId",
    "detailScheduleName",
    "detailTargetCount",
    "detailTargetList",
    "moveScheduleEditButton",
    "scheduleFilterModal",
    "scheduleStatusFilterTrigger",
    "scheduleStatusFilterPanel",
    "scheduleStatusFilterSearch",
    "scheduleStatusFilterList",
    "cancelScheduleFilterButton",
    "applyScheduleFilterButton",
    "confirmActionModal",
    "confirmActionTitle",
    "confirmActionMessage",
    "cancelConfirmActionButton",
    "confirmActionButton",
    "toastStack",
  ];

  ids.forEach((id) => {
    refs[id] = document.getElementById(id);
  });
  refs.sidebarNav = document.querySelector(".sidebar-nav");
  refs.roleButtons = [...document.querySelectorAll(".role-btn")];
  refs.scheduleContentGrid = document.querySelector(".schedule-content-grid");
  refs.scheduleDetailCard = document.querySelector(".schedule-detail-card");
}

function bindEvents() {
  refs.scheduleSearchInput.addEventListener("input", (event) => {
    state.filters.query = event.target.value.trim();
    state.pagination.page = 1;
    syncSelectionState();
    render();
  });

  refs.statusSummaryStrip.addEventListener("click", (event) => {
    const button = event.target.closest("[data-summary-status]");
    if (!button) {
      return;
    }
    const nextStatus = button.dataset.summaryStatus;
    state.filters.summaryStatus = state.filters.summaryStatus === nextStatus ? null : nextStatus;
    state.pagination.page = 1;
    syncSelectionState();
    render();
  });

  refs.toggleScheduleFilterButton.addEventListener("click", () => {
    state.filters.panelOpen = !state.filters.panelOpen;
    state.filterUi.openKey = null;
    if (state.filters.panelOpen) {
      state.filterDraft.statuses = [...state.filters.statuses];
    }
    render();
  });

  refs.clearScheduleFiltersButton.addEventListener("click", () => {
    state.filters.query = "";
    state.filters.statuses = [];
    state.filters.summaryStatus = null;
    state.filterDraft.statuses = [];
    state.filterUi.statusesSearch = "";
    refs.scheduleSearchInput.value = "";
    state.pagination.page = 1;
    syncSelectionState();
    render();
  });

  bindStatusFilter();

  refs.cancelScheduleFilterButton.addEventListener("click", () => {
    state.filters.panelOpen = false;
    state.filterUi.openKey = null;
    render();
  });

  refs.applyScheduleFilterButton.addEventListener("click", () => {
    state.filters.statuses = [...state.filterDraft.statuses];
    state.filters.panelOpen = false;
    state.filterUi.openKey = null;
    state.pagination.page = 1;
    syncSelectionState();
    render();
  });

  refs.selectAllSchedules.addEventListener("change", (event) => {
    const checked = event.target.checked;
    getPageItems().items.forEach((item) => {
      setScheduleChecked(item.id, checked);
    });
    render();
  });

  refs.scheduleTableBody.addEventListener("change", (event) => {
    if (!(event.target instanceof HTMLInputElement) || event.target.type !== "checkbox") {
      return;
    }
    setScheduleChecked(event.target.dataset.scheduleId, event.target.checked);
    render();
  });

  refs.scheduleTableBody.addEventListener("click", (event) => {
    const row = event.target.closest("tr[data-schedule-id]");
    if (!row || event.target.closest("input, button, a, label")) {
      return;
    }
    state.selectedScheduleId = row.dataset.scheduleId;
    render();
  });

  document.querySelectorAll(".sort-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.sortKey;
      if (!key) {
        return;
      }
      if (state.sort.key === key) {
        state.sort.dir = state.sort.dir === "asc" ? "desc" : "asc";
      } else {
        state.sort.key = key;
        state.sort.dir = key === "lastEndedAt" || key === "nextStartedAt" ? "desc" : "asc";
      }
      state.pagination.page = 1;
      syncSelectionState();
      render();
    });
  });

  refs.schedulePageSizeSelect.addEventListener("change", (event) => {
    const nextSize = Number.parseInt(event.target.value, 10);
    if (!Number.isFinite(nextSize)) {
      return;
    }
    state.pagination.pageSize = nextSize;
    state.pagination.page = 1;
    render();
  });

  refs.stopSchedulesButton.addEventListener("click", () => openConfirmAction("stop"));
  refs.restartSchedulesButton.addEventListener("click", () => openConfirmAction("restart"));
  refs.deleteSchedulesButton.addEventListener("click", () => openConfirmAction("delete"));
  refs.moveScheduleEditButton.addEventListener("click", () => {
    window.alert("스케줄 설정 하는 화면으로 이동");
  });

  refs.openBulkRegisterButton.addEventListener("click", () => {});

  refs.cancelConfirmActionButton.addEventListener("click", closeConfirmAction);
  refs.confirmActionButton.addEventListener("click", executeConfirmedAction);

  document.addEventListener("click", (event) => {
    userMenuController?.handleDocumentClick(event);

    if (state.filters.panelOpen) {
      const insideFilterSelect = event.target.closest(".filter-select");
      const insideFilterModal = event.target.closest("#scheduleFilterModal .filter-popover-card");
      const onFilterButton = event.target.closest("#toggleScheduleFilterButton");
      if (!insideFilterModal && !onFilterButton) {
        state.filters.panelOpen = false;
        state.filterUi.openKey = null;
        render();
        return;
      }
      if (insideFilterModal && !insideFilterSelect) {
        state.filterUi.openKey = null;
        renderFilterSelectPanels();
      }
    }

    if (state.confirmAction.open) {
      const insideConfirmModal = event.target.closest("#confirmActionModal .modal-card");
      if (!insideConfirmModal) {
        closeConfirmAction();
      }
    }
  });

  window.addEventListener("resize", () => {
    if (state.filters.panelOpen) {
      positionFilterPopover();
    }
  });
}

function bindStatusFilter() {
  refs.scheduleStatusFilterTrigger.addEventListener("click", (event) => {
    const removeButton = event.target.closest(".filter-chip-remove");
    if (removeButton) {
      event.stopPropagation();
      state.filterDraft.statuses = state.filterDraft.statuses.filter((item) => item !== removeButton.dataset.filterValue);
      renderFilterControls();
      return;
    }
    state.filterUi.openKey = state.filterUi.openKey === "statuses" ? null : "statuses";
    renderFilterSelectPanels();
  });

  refs.scheduleStatusFilterSearch.addEventListener("input", (event) => {
    state.filterUi.statusesSearch = event.target.value.trim();
    renderFilterControls();
  });

  refs.scheduleStatusFilterList.addEventListener("change", (event) => {
    if (!(event.target instanceof HTMLInputElement) || event.target.type !== "checkbox") {
      return;
    }
    state.filterDraft.statuses = [...refs.scheduleStatusFilterList.querySelectorAll("input[type='checkbox']:checked")].map(
      (input) => input.value
    );
    renderFilterControls();
  });
}

function render() {
  sidebarController?.render();
  userMenuController?.render();
  refs.scheduleFilterModal.hidden = !state.filters.panelOpen;
  refs.scheduleFilterSummary.hidden = !isFiltered();
  refs.toggleScheduleFilterButton.classList.toggle("is-filtered", isFiltered());
  renderFilterControls();
  if (state.filters.panelOpen) {
    positionFilterPopover();
  }
  renderSummaryStrip();
  renderTable();
  renderToolbarState();
  renderDetailPanel();
  renderConfirmAction();
}

function renderSummaryStrip() {
  const items = getSchedulesForSummary();
  refs.summaryWaitingCount.textContent = items.filter((item) => item.status === "WAITING").length.toLocaleString("ko-KR");
  refs.summaryRunningCount.textContent = items.filter((item) => item.status === "RUNNING").length.toLocaleString("ko-KR");
  refs.summaryCompletedCount.textContent = items
    .filter((item) => item.status === "COMPLETED")
    .length.toLocaleString("ko-KR");
  refs.summaryStoppedCount.textContent = items.filter((item) => item.status === "STOPPED").length.toLocaleString("ko-KR");
  refs.summaryFailedCount.textContent = items.filter((item) => item.status === "FAILED").length.toLocaleString("ko-KR");

  refs.statusSummaryStrip.querySelectorAll("[data-summary-status]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.summaryStatus === state.filters.summaryStatus);
  });
}

function renderToolbarState() {
  const filtered = getFilteredSchedules();
  const selectedCount = filtered.filter((item) => state.checkedScheduleIds.has(item.id)).length;
  const start = filtered.length ? (state.pagination.page - 1) * state.pagination.pageSize + 1 : 0;
  const end = filtered.length ? Math.min(state.pagination.page * state.pagination.pageSize, filtered.length) : 0;

  refs.scheduleToolbarCaption.innerHTML = `<span class="toolbar-caption-strong">전체 ${filtered.length.toLocaleString(
    "ko-KR"
  )}건</span> <span class="toolbar-caption-highlight">${start} - ${end} 표시중</span>${
    selectedCount > 0 ? ` <span class="toolbar-caption-selected">${selectedCount.toLocaleString("ko-KR")}건 선택됨</span>` : ""
  }`;
  refs.scheduleFilterBadge.textContent = buildFilterSummaryText();

  const admin = isAdmin();
  const selectedRows = getSelectedSchedules();
  refs.stopSchedulesButton.disabled = !admin || !selectedRows.length || !selectedRows.every(canStopSchedule);
  refs.restartSchedulesButton.disabled = !admin || !selectedRows.length || !selectedRows.every(canRestartSchedule);
  refs.deleteSchedulesButton.disabled = !admin || !selectedRows.length;
  refs.openBulkRegisterButton.disabled = !admin;
}

function renderTable() {
  syncSelectionState();
  const { all, items } = getPageItems();
  refs.scheduleTableBody.innerHTML = "";
  refs.scheduleEmpty.hidden = all.length > 0;

  items.forEach((item) => {
    const row = document.createElement("tr");
    row.classList.add("clickable-row");
    row.dataset.scheduleId = item.id;
    if (item.id === state.selectedScheduleId) {
      row.classList.add("is-selected");
    }

    const checkboxCell = document.createElement("td");
    checkboxCell.className = "checkbox-cell";
    checkboxCell.innerHTML = `<input type="checkbox" data-schedule-id="${escapeHtml(item.id)}" ${
      state.checkedScheduleIds.has(item.id) ? "checked" : ""
    } aria-label="${escapeHtml(item.name)} 선택">`;

    const idCell = document.createElement("td");
    idCell.className = "center-cell";
    idCell.textContent = item.id;

    const nameCell = document.createElement("td");
    nameCell.innerHTML = `
      <div class="schedule-name-cell">
        <strong>${escapeHtml(item.name)}</strong>
      </div>
    `;

    const ruleCell = document.createElement("td");
    ruleCell.textContent = item.ruleName;

    const statusCell = document.createElement("td");
    statusCell.className = "center-cell";
    statusCell.appendChild(createStatusChip(item.status));

    const targetCountCell = document.createElement("td");
    targetCountCell.className = "center-cell";
    targetCountCell.textContent = getScheduleTargets(item).length.toLocaleString("ko-KR");

    const durationCell = document.createElement("td");
    durationCell.className = "center-cell";
    durationCell.textContent = formatDuration(item.durationMinutes);

    const endedAtCell = document.createElement("td");
    endedAtCell.className = "center-cell";
    endedAtCell.textContent = formatDateTime(item.lastEndedAt);

    const nextStartedAtCell = document.createElement("td");
    nextStartedAtCell.className = "center-cell";
    nextStartedAtCell.textContent = formatDateTime(item.nextStartedAt);

    const createdByCell = document.createElement("td");
    createdByCell.textContent = item.createdBy;

    row.append(
      checkboxCell,
      idCell,
      nameCell,
      ruleCell,
      statusCell,
      targetCountCell,
      durationCell,
      endedAtCell,
      nextStartedAtCell,
      createdByCell
    );
    refs.scheduleTableBody.appendChild(row);
  });

  const checkedOnPage = items.filter((item) => state.checkedScheduleIds.has(item.id)).length;
  refs.selectAllSchedules.disabled = items.length === 0;
  refs.selectAllSchedules.checked = items.length > 0 && checkedOnPage === items.length;
  refs.selectAllSchedules.indeterminate = checkedOnPage > 0 && checkedOnPage < items.length;

  historyShared.renderPagination(refs.schedulePagination, all.length, state.pagination.pageSize, state.pagination.page, (page) => {
    state.pagination.page = page;
    render();
  });
  refs.schedulePageSizeSelect.value = String(state.pagination.pageSize);
  renderSortIndicators();
}

function renderSortIndicators() {
  const indicators = {
    id: refs.sortIndicatorId,
    name: refs.sortIndicatorName,
    status: refs.sortIndicatorStatus,
    lastEndedAt: refs.sortIndicatorLastEndedAt,
    nextStartedAt: refs.sortIndicatorNextStartedAt,
  };
  Object.entries(indicators).forEach(([key, element]) => {
    element.textContent = state.sort.key === key ? (state.sort.dir === "asc" ? "▲" : "▼") : "";
  });
}

function renderFilterControls() {
  refs.scheduleStatusFilterSearch.value = state.filterUi.statusesSearch;
  renderFilterSelect(
    refs.scheduleStatusFilterTrigger,
    refs.scheduleStatusFilterList,
    FILTER_STATUS_ORDER.map((status) => ({ value: status, label: STATUS_META[status].label })),
    state.filterDraft.statuses,
    state.filterUi.statusesSearch
  );
  renderFilterSelectPanels();
}

function renderFilterSelect(trigger, container, items, selectedValues, searchQuery) {
  trigger.classList.toggle("has-selection", selectedValues.length > 0);
  if (selectedValues.length) {
    const labelMap = new Map(items.map((item) => [item.value, item.label]));
    trigger.innerHTML = `
      <span class="filter-chip-list">
        ${selectedValues
          .map(
            (value) =>
              `<span class="filter-chip">${escapeHtml(labelMap.get(value) ?? value)}<span class="filter-chip-remove" data-filter-value="${escapeHtml(
                value
              )}">×</span></span>`
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
    .filter((item) => !normalizedQuery || item.label.toLowerCase().includes(normalizedQuery))
    .forEach((item) => {
      const option = document.createElement("label");
      option.className = "filter-option";
      option.innerHTML = `
        <input type="checkbox" value="${escapeHtml(item.value)}" ${selectedValues.includes(item.value) ? "checked" : ""}>
        <span>${escapeHtml(item.label)}</span>
      `;
      container.appendChild(option);
    });

  if (!container.childElementCount) {
    const empty = document.createElement("div");
    empty.className = "filter-option-empty";
    empty.textContent = "검색 결과 없음";
    container.appendChild(empty);
  }
}

function renderFilterSelectPanels() {
  refs.scheduleStatusFilterPanel.hidden = !(state.filterUi.openKey === "statuses" && state.filters.panelOpen);
}

function renderDetailPanel() {
  const schedule = historyService.findScheduleById(state.selectedScheduleId);
  const hasSelection = Boolean(schedule);

  refs.scheduleDetailCard.hidden = !hasSelection;
  refs.scheduleContentGrid.classList.toggle("is-detail-open", hasSelection);

  if (!hasSelection) {
    refs.detailPanelSubtitle.textContent = "목록에서 스케줄을 선택하세요.";
    refs.detailScheduleId.textContent = "";
    refs.detailScheduleName.textContent = "";
    refs.detailTargetCount.textContent = "";
    refs.detailTargetList.innerHTML = "";
    refs.moveScheduleEditButton.disabled = true;
    return;
  }

  const targets = getScheduleTargets(schedule);
  refs.detailPanelSubtitle.textContent = `${targets.length.toLocaleString("ko-KR")}개의 점검대상`;
  refs.detailScheduleId.textContent = schedule.id;
  refs.detailScheduleName.textContent = schedule.name;
  refs.detailTargetCount.textContent = `총 ${targets.length.toLocaleString("ko-KR")}건`;
  refs.moveScheduleEditButton.disabled = !isAdmin();
  refs.detailTargetList.innerHTML = "";

  targets.forEach((target) => {
    const item = document.createElement("li");
    item.className = "detail-target-item";
    item.innerHTML = `
      <span class="detail-target-type">${escapeHtml(target.type)}</span>
      <div class="detail-target-copy">
        <strong>${escapeHtml(target.path)}</strong>
      </div>
    `;
    refs.detailTargetList.appendChild(item);
  });
}

function renderConfirmAction() {
  refs.confirmActionModal.hidden = !state.confirmAction.open;
  refs.confirmActionTitle.textContent = state.confirmAction.title || "확인";
  refs.confirmActionMessage.textContent = state.confirmAction.message || "";
  refs.confirmActionButton.className = state.confirmAction.type === "delete" ? "danger-btn" : "primary-btn";
  refs.confirmActionButton.textContent = state.confirmAction.type === "delete" ? "삭제" : "확인";
}

function getFilteredSchedules() {
  return historyService.getFilteredSchedules(state.filters, state.sort);
}

function getSchedulesForSummary() {
  return historyService.getFilteredSchedules(
    {
      query: state.filters.query,
      statuses: state.filters.statuses,
      summaryStatus: null,
    },
    state.sort
  );
}

function getPageItems() {
  const all = getFilteredSchedules();
  const totalPages = Math.max(1, Math.ceil(all.length / state.pagination.pageSize));
  if (state.pagination.page > totalPages) {
    state.pagination.page = totalPages;
  }
  const start = (state.pagination.page - 1) * state.pagination.pageSize;
  return {
    all,
    items: all.slice(start, start + state.pagination.pageSize),
  };
}

function syncSelectionState() {
  const idSet = new Set(historyService.getSchedules().map((item) => item.id));
  state.checkedScheduleIds.forEach((id) => {
    if (!idSet.has(id)) {
      state.checkedScheduleIds.delete(id);
    }
  });

  const filtered = getFilteredSchedules();
  if (!filtered.some((item) => item.id === state.selectedScheduleId)) {
    state.selectedScheduleId = null;
  }
}

function getScheduleTargets(schedule) {
  return DETAIL_TARGETS_BY_SCHEDULE_ID[schedule.id] ?? [{ type: "DB", path: schedule.targetName || schedule.id }];
}

function setScheduleChecked(id, checked) {
  if (!id) {
    return;
  }
  if (checked) {
    state.checkedScheduleIds.add(id);
  } else {
    state.checkedScheduleIds.delete(id);
  }
}

function getSelectedSchedules() {
  return getFilteredSchedules().filter((item) => state.checkedScheduleIds.has(item.id));
}

function canStopSchedule(schedule) {
  return schedule.status === "WAITING" || schedule.status === "RUNNING";
}

function canRestartSchedule(schedule) {
  return schedule.status === "STOPPED" || schedule.status === "FAILED" || schedule.status === "COMPLETED";
}

function openConfirmAction(type) {
  if (!isAdmin()) {
    return;
  }
  const selected = getSelectedSchedules();
  if (!selected.length) {
    pushToast("스케줄을 먼저 선택하세요.", "danger");
    return;
  }

  const mapping = {
    stop: {
      valid: selected.every(canStopSchedule),
      title: "스케줄 중지",
      message: `선택한 ${selected.length}개의 스케줄을 중지하시겠습니까?`,
    },
    restart: {
      valid: selected.every(canRestartSchedule),
      title: "스케줄 재시작",
      message: `선택한 ${selected.length}개의 스케줄을 재시작하시겠습니까?`,
    },
    delete: {
      valid: true,
      title: "스케줄 삭제",
      message: `선택한 ${selected.length}개의 스케줄과 예약 작업을 삭제하시겠습니까?`,
    },
  };

  const option = mapping[type];
  if (!option.valid) {
    pushToast("선택한 스케줄 상태로는 해당 작업을 수행할 수 없습니다.", "danger");
    return;
  }

  state.confirmAction = {
    open: true,
    type,
    title: option.title,
    message: option.message,
  };
  renderConfirmAction();
}

function closeConfirmAction() {
  state.confirmAction = {
    open: false,
    type: null,
    title: "",
    message: "",
  };
  renderConfirmAction();
}

function executeConfirmedAction() {
  const ids = [...state.checkedScheduleIds];
  if (!ids.length) {
    closeConfirmAction();
    return;
  }

  if (state.confirmAction.type === "stop") {
    historyService.stopSchedules(ids);
    pushToast(`${ids.length}개의 스케줄을 중지했습니다.`, "success");
  }
  if (state.confirmAction.type === "restart") {
    historyService.restartSchedules(ids);
    pushToast(`${ids.length}개의 스케줄을 재시작했습니다.`, "success");
  }
  if (state.confirmAction.type === "delete") {
    historyService.deleteSchedules(ids);
    pushToast(`${ids.length}개의 스케줄을 삭제했습니다.`, "success");
  }

  state.checkedScheduleIds.clear();
  closeConfirmAction();
  syncSelectionState();
  render();
}

function positionFilterPopover() {
  const rect = refs.toggleScheduleFilterButton.getBoundingClientRect();
  refs.scheduleFilterModal.style.top = `${rect.bottom + 8}px`;
  refs.scheduleFilterModal.style.left = `${Math.max(
    12,
    Math.min(rect.left, window.innerWidth - refs.scheduleFilterModal.offsetWidth - 12)
  )}px`;
}

function buildFilterSummaryText() {
  const parts = [];
  if (state.filters.summaryStatus) {
    parts.push(`요약 ${STATUS_META[state.filters.summaryStatus].label}`);
  }
  if (state.filters.statuses.length) {
    parts.push(`상태 ${state.filters.statuses.map((status) => STATUS_META[status].label).join(", ")}`);
  }
  if (state.filters.query) {
    parts.push(`검색 "${state.filters.query}"`);
  }
  return parts.join(" · ");
}

function isFiltered() {
  return Boolean(state.filters.query || state.filters.statuses.length || state.filters.summaryStatus);
}

function createStatusChip(status) {
  const chip = document.createElement("span");
  chip.className = `schedule-status-chip ${STATUS_META[status].className}`;
  chip.textContent = STATUS_META[status].label;
  return chip;
}

function formatDateTime(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const pad = (number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(
    date.getMinutes()
  )}`;
}

function formatDuration(minutes) {
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return "";
  }
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function toDateTimeLocalValue(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const offsetDate = new Date(date.getTime() + 9 * 60 * 60000);
  return offsetDate.toISOString().slice(0, 16);
}

function fromDateTimeLocalValue(value) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) {
    return "";
  }
  return `${trimmed}:00+09:00`;
}

function downloadTextFile(filename, content, type) {
  const blob = new Blob([`\ufeff${content}`], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function isAdmin() {
  return state.role === "admin";
}

function pushToast(message, type = "default") {
  historyShared.pushToast(refs.toastStack, message, type);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
