const historyService = window.MockAnalysisHistoryService;
const historyShared = window.DGuardShared;
const { STATUS_META: HISTORY_STATUS_META, STATUS_ORDER: HISTORY_STATUS_ORDER } = historyService;

const refs = {};
let sidebarController;
let userMenuController;

const state = {
  role: "admin",
  sidebarCollapsed: false,
  selectedMenuKey: "analysis-history",
  openSidebarGroupKey: null,
  userMenuOpen: false,
  selectedRunId: historyService.getRuns()[0]?.id ?? null,
  filters: {
    query: "",
    statuses: [],
    owners: [],
    panelOpen: false,
  },
  filterDraft: {
    statuses: [],
    owners: [],
  },
  filterUi: {
    openKey: null,
    statusesSearch: "",
    ownersSearch: "",
  },
  sort: {
    key: "endedAt",
    dir: "desc",
  },
  pagination: {
    page: 1,
    pageSize: 6,
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
    onSettings: () => {
      pushToast("사용자설정 화면은 샘플에서 준비 중입니다.");
    },
    onLogout: () => {
      pushToast("로그아웃이 요청되었습니다.");
    },
  });
  bindEvents();
  populateStaticControls();
  syncSelectionState();
  render();
}

function cacheRefs() {
  const ids = [
    "sidebar",
    "sidebarToggle",
    "userMenu",
    "userMenuTrigger",
    "userMenuPanel",
    "userSettingsButton",
    "logoutButton",
    "analysisSearchInput",
    "toggleHistoryFilterButton",
    "historyFilterSummary",
    "clearHistoryFilters",
    "historyStatusFilterTrigger",
    "historyStatusFilterPanel",
    "historyStatusFilterSearch",
    "historyStatusFilterList",
    "historyOwnerFilterTrigger",
    "historyOwnerFilterPanel",
    "historyOwnerFilterSearch",
    "historyOwnerFilterList",
    "applyHistoryFilterButton",
    "cancelHistoryFilterButton",
    "historyFilterModal",
    "compareReportButton",
    "historyExportButton",
    "analysisTableBody",
    "analysisEmpty",
    "analysisPagination",
    "analysisPaginationCaption",
    "sortIndicatorRunName",
    "sortIndicatorTargetName",
    "sortIndicatorEndedAt",
    "sortIndicatorDetectionCount",
    "sortIndicatorStatus",
    "sortIndicatorOwner",
    "detailRunTitle",
    "detailRunTarget",
    "detailStatus",
    "detailOwner",
    "detailDuration",
    "detailPiiTypes",
    "detailSummary",
    "detailNotes",
    "openDetectionPageButton",
    "totalRunsValue",
    "completedRunsValue",
    "reviewRunsValue",
    "averageDetectionValue",
    "toastStack",
  ];

  ids.forEach((id) => {
    refs[id] = document.getElementById(id);
  });
  refs.sidebarNav = document.querySelector(".sidebar-nav");
  refs.roleButtons = [...document.querySelectorAll(".role-btn")];
}

function bindEvents() {
  refs.analysisSearchInput.addEventListener("input", (event) => {
    state.filters.query = event.target.value.trim();
    state.pagination.page = 1;
    syncSelectionState();
    render();
  });

  refs.toggleHistoryFilterButton.addEventListener("click", () => {
    const shouldOpen = !state.filters.panelOpen;
    state.filters.panelOpen = shouldOpen;
    state.filterUi.openKey = null;
    if (shouldOpen) {
      state.filterDraft.statuses = [...state.filters.statuses];
      state.filterDraft.owners = [...state.filters.owners];
    }
    render();
  });

  refs.clearHistoryFilters.addEventListener("click", () => {
    state.filters.query = "";
    state.filters.statuses = [];
    state.filters.owners = [];
    state.filterDraft.statuses = [];
    state.filterDraft.owners = [];
    state.filterUi.statusesSearch = "";
    state.filterUi.ownersSearch = "";
    state.pagination.page = 1;
    refs.analysisSearchInput.value = "";
    syncSelectionState();
    render();
  });

  bindFilterSelect("statuses");
  bindFilterSelect("owners");

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
        state.sort.dir = key === "endedAt" || key === "detectionCount" ? "desc" : "asc";
      }
      state.pagination.page = 1;
      syncSelectionState();
      render();
    });
  });

  refs.compareReportButton.addEventListener("click", () => {
    const run = getSelectedRun();
    pushToast(run ? `${run.runName} 기준 비교 보고서 샘플을 생성했습니다.` : "비교할 점검이력을 선택하세요.");
  });

  refs.historyExportButton.addEventListener("click", () => {
    pushToast("현재 필터 기준 점검이력 Excel 샘플을 생성했습니다.", "success");
  });

  refs.openDetectionPageButton.addEventListener("click", () => {
    window.location.href = "detection-list.html";
  });

  document.addEventListener("click", (event) => {
    userMenuController?.handleDocumentClick(event);
    if (state.filters.panelOpen) {
      const insideFilterSelect = event.target.closest(".filter-select");
      const insideFilterModal = event.target.closest("#historyFilterModal .filter-popover-card");
      const onFilterButton = event.target.closest("#toggleHistoryFilterButton");
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
  });

  refs.cancelHistoryFilterButton.addEventListener("click", () => {
    state.filters.panelOpen = false;
    state.filterUi.openKey = null;
    render();
  });

  refs.applyHistoryFilterButton.addEventListener("click", () => {
    state.filters.statuses = [...state.filterDraft.statuses];
    state.filters.owners = [...state.filterDraft.owners];
    state.pagination.page = 1;
    state.filters.panelOpen = false;
    state.filterUi.openKey = null;
    syncSelectionState();
    render();
  });
}

function bindFilterSelect(key) {
  const mapping = {
    statuses: {
      trigger: refs.historyStatusFilterTrigger,
      panel: refs.historyStatusFilterPanel,
      search: refs.historyStatusFilterSearch,
      list: refs.historyStatusFilterList,
      searchKey: "statusesSearch",
    },
    owners: {
      trigger: refs.historyOwnerFilterTrigger,
      panel: refs.historyOwnerFilterPanel,
      search: refs.historyOwnerFilterSearch,
      list: refs.historyOwnerFilterList,
      searchKey: "ownersSearch",
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
    renderFilterControls();
  });
  target.list.addEventListener("change", (event) => {
    if (!(event.target instanceof HTMLInputElement) || event.target.type !== "checkbox") {
      return;
    }
    const checkedValues = [...target.list.querySelectorAll("input[type='checkbox']:checked")].map((input) => input.value);
    state.filterDraft[key] = checkedValues;
    renderFilterControls();
  });
}

function populateStaticControls() {
  renderFilterControls();
}

function renderFilterControls() {
  refs.historyStatusFilterSearch.value = state.filterUi.statusesSearch;
  refs.historyOwnerFilterSearch.value = state.filterUi.ownersSearch;
  renderFilterSelect(
    "statuses",
    refs.historyStatusFilterTrigger,
    refs.historyStatusFilterList,
    HISTORY_STATUS_ORDER.map((status) => ({ value: status, label: HISTORY_STATUS_META[status].label })),
    state.filterDraft.statuses,
    state.filterUi.statusesSearch
  );
  renderFilterSelect(
    "owners",
    refs.historyOwnerFilterTrigger,
    refs.historyOwnerFilterList,
    historyService.getOwners(),
    state.filterDraft.owners,
    state.filterUi.ownersSearch
  );
  renderFilterSelectPanels();
}

function renderFilterSelect(key, trigger, container, items, selectedValues, searchQuery) {
  trigger.classList.toggle("has-selection", selectedValues.length > 0);
  if (selectedValues.length) {
    const labelMap = new Map(items.map((item) => (typeof item === "string" ? [item, item] : [item.value, item.label])));
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
    statuses: refs.historyStatusFilterPanel,
    owners: refs.historyOwnerFilterPanel,
  };
  Object.entries(mapping).forEach(([key, panel]) => {
    panel.hidden = !(state.filterUi.openKey === key && state.filters.panelOpen);
  });
}

function removeFilterDraftValue(key, value) {
  state.filterDraft[key] = state.filterDraft[key].filter((item) => item !== value);
  renderFilterControls();
}

function render() {
  sidebarController?.render();
  userMenuController?.render();
  refs.historyFilterModal.hidden = !state.filters.panelOpen;
  refs.historyFilterSummary.hidden = !isFiltered();
  refs.toggleHistoryFilterButton.classList.toggle("is-filtered", isFiltered());
  renderFilterControls();
  if (state.filters.panelOpen) {
    positionFilterPopover();
  }
  renderSummaryStrip();
  renderTable();
  renderDetail();
}

function renderSummaryStrip() {
  const summary = historyService.getSummary();
  refs.totalRunsValue.textContent = summary.total.toLocaleString("ko-KR");
  refs.completedRunsValue.textContent = summary.completed.toLocaleString("ko-KR");
  refs.reviewRunsValue.textContent = summary.reviewRequired.toLocaleString("ko-KR");
  refs.averageDetectionValue.textContent = summary.averageDetections.toLocaleString("ko-KR");
}

function getFilteredRuns() {
  return historyService.getFilteredRuns(state.filters, state.sort);
}

function getPageItems() {
  const items = getFilteredRuns();
  const start = (state.pagination.page - 1) * state.pagination.pageSize;
  return {
    all: items,
    items: items.slice(start, start + state.pagination.pageSize),
  };
}

function syncSelectionState() {
  const filtered = getFilteredRuns();
  const maxPage = Math.max(1, Math.ceil(filtered.length / state.pagination.pageSize));
  if (state.pagination.page > maxPage) {
    state.pagination.page = maxPage;
  }
  if (!filtered.some((item) => item.id === state.selectedRunId)) {
    state.selectedRunId = filtered[0]?.id ?? null;
  }
}

function renderTable() {
  syncSelectionState();
  const { all, items } = getPageItems();
  refs.analysisTableBody.innerHTML = "";
  refs.analysisEmpty.hidden = all.length > 0;

  items.forEach((item) => {
    const row = document.createElement("tr");
    row.className = "clickable-row";
    if (item.id === state.selectedRunId) {
      row.classList.add("is-selected");
    }

    const runCell = document.createElement("td");
    runCell.innerHTML = `<strong>${escapeHtml(item.runName)}</strong>`;
    const targetCell = document.createElement("td");
    targetCell.innerHTML = `<span class="path-text">${escapeHtml(item.targetName)}</span>`;
    const scopeCell = document.createElement("td");
    scopeCell.textContent = item.scope;
    const endedAtCell = document.createElement("td");
    endedAtCell.textContent = formatDateTime(item.endedAt);
    const detectionCountCell = document.createElement("td");
    detectionCountCell.className = "number-cell";
    detectionCountCell.textContent = item.detectionCount.toLocaleString("ko-KR");
    const statusCell = document.createElement("td");
    statusCell.appendChild(createStatusChip(item.status));
    const ownerCell = document.createElement("td");
    ownerCell.textContent = item.owner;

    row.append(runCell, targetCell, scopeCell, endedAtCell, detectionCountCell, statusCell, ownerCell);
    row.addEventListener("click", () => {
      state.selectedRunId = item.id;
      render();
    });
    refs.analysisTableBody.appendChild(row);
  });

  refs.analysisPaginationCaption.textContent = all.length
    ? `${Math.min((state.pagination.page - 1) * state.pagination.pageSize + 1, all.length)}-${Math.min(state.pagination.page * state.pagination.pageSize, all.length)} / ${all.length}건`
    : "0건";
  renderPagination(refs.analysisPagination, all.length, state.pagination.pageSize, state.pagination.page, (page) => {
    state.pagination.page = page;
    render();
  });

  refs.sortIndicatorRunName.textContent = state.sort.key === "runName" ? (state.sort.dir === "asc" ? "▲" : "▼") : "";
  refs.sortIndicatorTargetName.textContent = state.sort.key === "targetName" ? (state.sort.dir === "asc" ? "▲" : "▼") : "";
  refs.sortIndicatorEndedAt.textContent = state.sort.key === "endedAt" ? (state.sort.dir === "asc" ? "▲" : "▼") : "";
  refs.sortIndicatorDetectionCount.textContent = state.sort.key === "detectionCount" ? (state.sort.dir === "asc" ? "▲" : "▼") : "";
  refs.sortIndicatorStatus.textContent = state.sort.key === "status" ? (state.sort.dir === "asc" ? "▲" : "▼") : "";
  refs.sortIndicatorOwner.textContent = state.sort.key === "owner" ? (state.sort.dir === "asc" ? "▲" : "▼") : "";
}

function createStatusChip(status) {
  const chip = document.createElement("span");
  chip.className = `analysis-status-chip ${HISTORY_STATUS_META[status].className}`;
  chip.textContent = HISTORY_STATUS_META[status].label;
  return chip;
}

function getSelectedRun() {
  return historyService.findRunById(state.selectedRunId);
}

function renderDetail() {
  const run = getSelectedRun();
  if (!run) {
    refs.detailRunTitle.textContent = "선택된 분석 없음";
    refs.detailRunTarget.textContent = "목록에서 점검이력을 선택하세요.";
    refs.detailStatus.textContent = "-";
    refs.detailOwner.textContent = "-";
    refs.detailDuration.textContent = "-";
    refs.detailPiiTypes.textContent = "-";
    refs.detailSummary.textContent = "-";
    refs.detailNotes.innerHTML = "<li>점검이력을 선택하면 업체 전달용 설명 메모가 표시됩니다.</li>";
    return;
  }

  refs.detailRunTitle.textContent = run.runName;
  refs.detailRunTarget.textContent = `${run.targetName} · ${formatDateTime(run.startedAt)} 시작`;
  refs.detailStatus.textContent = HISTORY_STATUS_META[run.status].label;
  refs.detailOwner.textContent = run.owner;
  refs.detailDuration.textContent = `${run.durationMinutes}분`;
  refs.detailPiiTypes.textContent = `${run.piiTypes}종`;
  refs.detailSummary.textContent = run.summary;
  refs.detailNotes.innerHTML = "";
  run.notes.forEach((note) => {
    const li = document.createElement("li");
    li.textContent = note;
    refs.detailNotes.appendChild(li);
  });
}

function positionFilterPopover() {
  const rect = refs.toggleHistoryFilterButton.getBoundingClientRect();
  refs.historyFilterModal.style.top = `${rect.bottom + 8}px`;
  refs.historyFilterModal.style.left = `${Math.max(12, Math.min(rect.left, window.innerWidth - refs.historyFilterModal.offsetWidth - 12))}px`;
}

function isFiltered() {
  return Boolean(state.filters.query || state.filters.statuses.length || state.filters.owners.length);
}

function renderPagination(...args) {
  historyShared.renderPagination(...args);
}

function pushToast(message, type = "default") {
  historyShared.pushToast(refs.toastStack, message, type);
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  const pad = (number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
