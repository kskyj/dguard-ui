const exceptionService = window.MockExceptionRequestService;
const exceptionShared = window.DGuardShared;

const refs = {};
let sidebarController;
let userMenuController;

const state = {
  role: "admin",
  sidebarCollapsed: false,
  selectedMenuKey: "exception-request",
  openSidebarGroupKey: null,
  userMenuOpen: false,
  currentTab: "pending",
  summaryFilter: "all",
  pendingQuery: "",
  processedQuery: "",
  processedFilters: {
    statuses: [],
    draftStatuses: [],
    panelOpen: false,
  },
  processedFilterUi: {
    openKey: null,
    statusesSearch: "",
  },
  checkedPendingIds: new Set(),
  pendingSelectionScope: "page",
  sort: {
    pending: { key: "requestedAt", dir: "desc" },
    processed: { key: "processedAt", dir: "desc" },
  },
  pagination: {
    pendingPage: 1,
    pendingPageSize: 10,
    processedPage: 1,
    processedPageSize: 10,
  },
  processModal: {
    open: false,
    action: "approve",
    opinion: "",
  },
};

const TAB_LABELS = {
  pending: "제외신청목록",
  processed: "제외처리결과",
};

document.addEventListener("DOMContentLoaded", init);

function init() {
  cacheRefs();
  sidebarController = exceptionShared.initSidebar({
    sidebarNav: refs.sidebarNav,
    sidebarToggle: refs.sidebarToggle,
    roleButtons: refs.roleButtons,
    getState: () => state,
    onRoleChange: (nextRole) => {
      state.selectedMenuKey = "exception-request";
      state.openSidebarGroupKey = null;
      resetViewState();
      pushToast(`역할이 ${nextRole === "admin" ? "관리자" : "일반사용자"}로 변경되었습니다.`);
    },
    onRender: render,
  });
  userMenuController = exceptionShared.initUserMenu({
    root: refs.userMenu,
    trigger: refs.userMenuTrigger,
    panel: refs.userMenuPanel,
    settingsButton: refs.userSettingsButton,
    logoutButton: refs.logoutButton,
    getState: () => state,
    onRender: render,
    onSettings: () => pushToast("사용자설정 화면은 샘플에서 준비 중입니다."),
    onLogout: () => pushToast("로그아웃이 요청되었습니다."),
  });
  bindEvents();
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
    "pageTitle",
    "breadcrumbSection",
    "breadcrumbCurrent",
    "summaryAllButton",
    "summaryPendingButton",
    "summaryApprovedButton",
    "summaryRejectedButton",
    "totalRowsValue",
    "pendingRowsValue",
    "approvedRowsValue",
    "rejectedRowsValue",
    "pendingTabButton",
    "processedTabButton",
    "pendingTabCount",
    "processedTabCount",
    "pendingPanel",
    "processedPanel",
    "pendingSearchInput",
    "processedSearchInput",
    "pendingFilterSummary",
    "pendingFilterText",
    "clearPendingFilters",
    "pendingToolbarCaption",
    "processedToolbarCaption",
    "approveButton",
    "rejectButton",
    "cancelRequestButton",
    "toggleProcessedFilterButton",
    "processedFilterSummary",
    "processedFilterText",
    "clearProcessedFilters",
    "selectAllPending",
    "pendingSelectionBannerBody",
    "pendingTableBody",
    "processedTableBody",
    "pendingEmpty",
    "processedEmpty",
    "pendingPagination",
    "processedPagination",
    "pendingPageSizeSelect",
    "processedPageSizeSelect",
    "processedFilterModal",
    "processedStatusFilterSelect",
    "processedStatusFilterTrigger",
    "processedStatusFilterPanel",
    "processedStatusFilterSearch",
    "processedStatusFilterList",
    "cancelProcessedFilterButton",
    "applyProcessedFilterButton",
    "processModal",
    "processModalTitle",
    "processModalCaption",
    "processOpinionInput",
    "processOpinionCount",
    "confirmProcessButton",
    "pendingSortRequestedBy",
    "pendingSortRequestedAt",
    "pendingSortRequestComment",
    "pendingSortDbName",
    "pendingSortUrl",
    "pendingSortDetectId",
    "pendingSortPath",
    "processedSortStatus",
    "processedSortProcessedAt",
    "processedSortProcessedBy",
    "processedSortProcessedComment",
    "processedSortRequestedBy",
    "processedSortRequestComment",
    "processedSortDbName",
    "processedSortUrl",
    "processedSortDetectId",
    "processedSortPath",
    "toastStack",
  ];

  ids.forEach((id) => {
    refs[id] = document.getElementById(id);
  });
  refs.sidebarNav = document.querySelector(".sidebar-nav");
  refs.roleButtons = [...document.querySelectorAll(".role-btn")];
  refs.tabButtons = [...document.querySelectorAll(".tab-btn")];
  refs.sortButtons = [...document.querySelectorAll("[data-sort-key]")];
  refs.summaryButtons = [...document.querySelectorAll(".summary-tile-button[data-summary-filter]")];
}

function bindEvents() {
  refs.summaryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      applySummaryFilter(button.dataset.summaryFilter ?? "all");
    });
  });

  refs.tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.currentTab = button.dataset.tab;
      if (state.currentTab === "pending" && (state.summaryFilter === "approved" || state.summaryFilter === "rejected")) {
        state.summaryFilter = "all";
        state.processedFilters.statuses = [];
        state.processedFilters.draftStatuses = [];
      }
      if (state.currentTab === "processed" && state.summaryFilter === "pending") {
        state.summaryFilter = "all";
      }
      state.checkedPendingIds.clear();
      state.pendingSelectionScope = "page";
      render();
    });
  });

  refs.pendingSearchInput.addEventListener("input", (event) => {
    state.pendingQuery = event.target.value.trim();
    state.pagination.pendingPage = 1;
    state.checkedPendingIds.clear();
    state.pendingSelectionScope = "page";
    render();
  });

  refs.processedSearchInput.addEventListener("input", (event) => {
    state.processedQuery = event.target.value.trim();
    state.pagination.processedPage = 1;
    render();
  });

  refs.sortButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tab = button.dataset.tab;
      const key = button.dataset.sortKey;
      if (!tab || !key) {
        return;
      }
      const targetSort = state.sort[tab];
      if (targetSort.key === key) {
        targetSort.dir = targetSort.dir === "asc" ? "desc" : "asc";
      } else {
        targetSort.key = key;
        targetSort.dir = key === "requestedAt" || key === "processedAt" || key === "detectId" ? "desc" : "asc";
      }
      state.pagination[tab === "pending" ? "pendingPage" : "processedPage"] = 1;
      render();
    });
  });

  refs.selectAllPending.addEventListener("change", (event) => {
    const pageItems = getPendingPageItems().items;
    pageItems.forEach((item) => {
      if (event.target.checked) {
        state.checkedPendingIds.add(item.id);
      } else {
        state.checkedPendingIds.delete(item.id);
      }
    });
    state.pendingSelectionScope = "page";
    render();
  });

  refs.pendingSelectionBannerBody.addEventListener("click", (event) => {
    const target = event.target.closest("#selectAllFilteredPending");
    if (!target) {
      return;
    }
    getPendingRows().forEach((item) => state.checkedPendingIds.add(item.id));
    state.pendingSelectionScope = "filtered";
    render();
  });

  refs.approveButton.addEventListener("click", () => openProcessModal("approve"));
  refs.rejectButton.addEventListener("click", () => openProcessModal("reject"));
  refs.cancelRequestButton.addEventListener("click", handleCancelRequests);

  refs.pendingPageSizeSelect.addEventListener("change", (event) => {
    const nextSize = Number.parseInt(event.target.value, 10);
    if (!Number.isFinite(nextSize)) {
      return;
    }
    state.pagination.pendingPageSize = nextSize;
    state.pagination.pendingPage = 1;
    state.checkedPendingIds.clear();
    state.pendingSelectionScope = "page";
    render();
  });

  refs.processedPageSizeSelect.addEventListener("change", (event) => {
    const nextSize = Number.parseInt(event.target.value, 10);
    if (!Number.isFinite(nextSize)) {
      return;
    }
    state.pagination.processedPageSize = nextSize;
    state.pagination.processedPage = 1;
    render();
  });

  refs.toggleProcessedFilterButton.addEventListener("click", () => {
    state.processedFilters.panelOpen = !state.processedFilters.panelOpen;
    state.processedFilters.draftStatuses = [...state.processedFilters.statuses];
    state.processedFilterUi.openKey = null;
    renderProcessedFilterControls();
    if (state.processedFilters.panelOpen) {
      positionProcessedFilterPopover();
    }
  });

  refs.clearPendingFilters.addEventListener("click", clearPendingFilters);
  refs.clearProcessedFilters.addEventListener("click", clearProcessedFilters);
  refs.cancelProcessedFilterButton.addEventListener("click", () => {
    state.processedFilters.panelOpen = false;
    state.processedFilterUi.openKey = null;
    render();
  });
  refs.applyProcessedFilterButton.addEventListener("click", () => {
    state.processedFilters.statuses = [...state.processedFilters.draftStatuses];
    state.processedFilters.panelOpen = false;
    state.processedFilterUi.openKey = null;
    state.summaryFilter = deriveSummaryFilterFromProcessedStatuses(state.processedFilters.statuses);
    state.pagination.processedPage = 1;
    render();
  });

  bindProcessedStatusFilter();

  refs.processOpinionInput.addEventListener("input", (event) => {
    state.processModal.opinion = event.target.value.slice(0, 500);
    renderProcessModal();
  });

  refs.confirmProcessButton.addEventListener("click", handleConfirmProcess);

  document.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", closeProcessModal);
  });

  refs.processModal.addEventListener("click", (event) => {
    if (event.target === refs.processModal) {
      closeProcessModal();
    }
  });

  document.addEventListener("click", (event) => {
    userMenuController?.handleDocumentClick(event);
    if (state.processedFilters.panelOpen) {
      const insideFilterSelect = event.target.closest(".filter-select");
      const insideFilter = event.target.closest("#processedFilterModal .filter-popover-card");
      const onButton = event.target.closest("#toggleProcessedFilterButton");
      if (!insideFilter && !onButton) {
        state.processedFilters.panelOpen = false;
        state.processedFilterUi.openKey = null;
        render();
      }
      if (insideFilter && !insideFilterSelect) {
        state.processedFilterUi.openKey = null;
        renderProcessedFilterSelectPanels();
      }
    }
  });

  window.addEventListener("resize", () => {
    if (state.processedFilters.panelOpen) {
      positionProcessedFilterPopover();
    }
  });
}

function handleConfirmProcess() {
  if (!state.processModal.opinion.trim() || state.checkedPendingIds.size === 0) {
    return;
  }
  const action = state.processModal.action;
  const result = exceptionService.processRows(
    [...state.checkedPendingIds],
    action,
    state.processModal.opinion.trim(),
    getCurrentActorName()
  );
  state.checkedPendingIds.clear();
  state.pendingSelectionScope = "page";
  state.currentTab = "processed";
  state.pagination.processedPage = 1;
  closeProcessModal(false);
  render();
  pushToast(
    action === "approve"
      ? `선택한 ${result.processedCount}건을 제외 승인했습니다.`
      : `선택한 ${result.processedCount}건을 제외 거부했습니다.`,
    action === "approve" ? "success" : "danger"
  );
}

function handleCancelRequests() {
  if (state.role !== "user" || state.checkedPendingIds.size === 0) {
    return;
  }
  const result = exceptionService.cancelRows([...state.checkedPendingIds], getCurrentActorName());
  state.checkedPendingIds.clear();
  state.pendingSelectionScope = "page";
  render();
  pushToast(`선택한 ${result.canceledCount}건의 제외신청이 취소되어 미확인 상태로 변경되었습니다.`, "danger");
}

function clearProcessedFilters() {
  state.summaryFilter = "all";
  state.processedQuery = "";
  state.processedFilters.statuses = [];
  state.processedFilters.draftStatuses = [];
  state.processedFilters.panelOpen = false;
  state.processedFilterUi.openKey = null;
  state.processedFilterUi.statusesSearch = "";
  refs.processedSearchInput.value = "";
  state.pagination.processedPage = 1;
  render();
}

function clearPendingFilters() {
  state.pendingQuery = "";
  refs.pendingSearchInput.value = "";
  state.pagination.pendingPage = 1;
  state.checkedPendingIds.clear();
  state.pendingSelectionScope = "page";
  render();
}

function resetViewState() {
  state.summaryFilter = "all";
  state.pendingQuery = "";
  state.processedQuery = "";
  state.currentTab = "pending";
  state.checkedPendingIds.clear();
  state.pendingSelectionScope = "page";
  state.processedFilters.statuses = [];
  state.processedFilters.draftStatuses = [];
  state.processedFilters.panelOpen = false;
  state.processedFilterUi.openKey = null;
  state.processedFilterUi.statusesSearch = "";
  state.pagination.pendingPage = 1;
  state.pagination.processedPage = 1;
  state.pagination.pendingPageSize = 10;
  state.pagination.processedPageSize = 10;
  refs.pendingSearchInput.value = "";
  refs.processedSearchInput.value = "";
  closeProcessModal(false);
}

function getCurrentActorName() {
  return state.role === "admin" ? "관리자" : "김성진";
}

function getPendingRows() {
  return exceptionService.getRows({
    tab: "pending",
    role: state.role,
    actor: getCurrentActorName(),
    query: state.pendingQuery,
    sort: state.sort.pending,
  });
}

function getProcessedRows() {
  return exceptionService.getRows({
    tab: "processed",
    role: state.role,
    actor: getCurrentActorName(),
    query: state.processedQuery,
    statuses: state.processedFilters.statuses,
    sort: state.sort.processed,
  });
}

function getPendingPageItems() {
  const all = getPendingRows();
  const start = (state.pagination.pendingPage - 1) * state.pagination.pendingPageSize;
  return { all, items: all.slice(start, start + state.pagination.pendingPageSize) };
}

function getProcessedPageItems() {
  const all = getProcessedRows();
  const start = (state.pagination.processedPage - 1) * state.pagination.processedPageSize;
  return { all, items: all.slice(start, start + state.pagination.processedPageSize) };
}

function syncPagination() {
  const pending = getPendingRows();
  const processed = getProcessedRows();
  const maxPendingPage = Math.max(1, Math.ceil(pending.length / state.pagination.pendingPageSize));
  const maxProcessedPage = Math.max(1, Math.ceil(processed.length / state.pagination.processedPageSize));

  if (state.pagination.pendingPage > maxPendingPage) {
    state.pagination.pendingPage = maxPendingPage;
  }
  if (state.pagination.processedPage > maxProcessedPage) {
    state.pagination.processedPage = maxProcessedPage;
  }

  const pendingIds = new Set(pending.map((item) => item.id));
  state.checkedPendingIds.forEach((id) => {
    if (!pendingIds.has(id)) {
      state.checkedPendingIds.delete(id);
    }
  });
}

function render() {
  syncPagination();
  sidebarController?.render();
  userMenuController?.render();
  renderHeaderContext();
  renderSummary();
  renderTabs();
  renderPendingToolbar();
  renderPendingTable();
  renderProcessedToolbar();
  renderProcessedTable();
  renderSortIndicators();
  renderProcessModal();
  renderProcessedFilterControls();
}

function renderHeaderContext() {
  const label = TAB_LABELS[state.currentTab];
  refs.pageTitle.textContent = label;
  refs.breadcrumbCurrent.textContent = label;
  document.title = `${label} | D-Guard`;
}

function renderSummary() {
  const stats = exceptionService.getPageStats({ role: state.role, actor: getCurrentActorName() });
  refs.totalRowsValue.textContent = stats.total.toLocaleString("ko-KR");
  refs.pendingRowsValue.textContent = stats.pending.toLocaleString("ko-KR");
  refs.approvedRowsValue.textContent = stats.approved.toLocaleString("ko-KR");
  refs.rejectedRowsValue.textContent = stats.rejected.toLocaleString("ko-KR");
  refs.pendingTabCount.textContent = stats.pending.toLocaleString("ko-KR");
  refs.processedTabCount.textContent = (stats.approved + stats.rejected).toLocaleString("ko-KR");
  refs.summaryAllButton.classList.toggle("is-active", state.summaryFilter === "all");
  refs.summaryPendingButton.classList.toggle("is-active", state.summaryFilter === "pending");
  refs.summaryApprovedButton.classList.toggle("is-active", state.summaryFilter === "approved");
  refs.summaryRejectedButton.classList.toggle("is-active", state.summaryFilter === "rejected");
}

function renderTabs() {
  refs.pendingTabButton.classList.toggle("is-active", state.currentTab === "pending");
  refs.processedTabButton.classList.toggle("is-active", state.currentTab === "processed");
  refs.pendingTabButton.setAttribute("aria-selected", String(state.currentTab === "pending"));
  refs.processedTabButton.setAttribute("aria-selected", String(state.currentTab === "processed"));
  refs.pendingPanel.hidden = state.currentTab !== "pending";
  refs.processedPanel.hidden = state.currentTab !== "processed";
}

function renderPendingToolbar() {
  const { all, items } = getPendingPageItems();
  const checkedCount = state.checkedPendingIds.size;
  refs.pendingToolbarCaption.innerHTML = all.length
    ? `<span class="toolbar-caption-strong">전체 ${all.length}건</span> <span class="toolbar-caption-highlight">${Math.min((state.pagination.pendingPage - 1) * state.pagination.pendingPageSize + 1, all.length)} - ${Math.min(state.pagination.pendingPage * state.pagination.pendingPageSize, all.length)} 표시됨</span>${checkedCount ? ` <span class="toolbar-caption-selected">${checkedCount}건 선택됨</span>` : ""}`
    : '<span class="toolbar-caption-strong">전체 0건</span> <span class="toolbar-caption-highlight">0 - 0 표시됨</span>';
  refs.pendingSearchInput.value = state.pendingQuery;
  refs.pendingFilterSummary.hidden = !state.pendingQuery;
  refs.pendingFilterText.textContent = state.pendingQuery ? `검색 "${state.pendingQuery}"` : "";
  refs.approveButton.hidden = state.role !== "admin";
  refs.rejectButton.hidden = state.role !== "admin";
  refs.cancelRequestButton.hidden = state.role !== "user";
  refs.approveButton.disabled = checkedCount === 0;
  refs.rejectButton.disabled = checkedCount === 0;
  refs.cancelRequestButton.disabled = checkedCount === 0;
  refs.selectAllPending.checked = items.length > 0 && items.every((item) => state.checkedPendingIds.has(item.id));
  refs.selectAllPending.indeterminate = items.some((item) => state.checkedPendingIds.has(item.id)) && !refs.selectAllPending.checked;
  refs.pendingPageSizeSelect.value = String(state.pagination.pendingPageSize);
}

function renderPendingTable() {
  const { all, items } = getPendingPageItems();
  refs.pendingTableBody.innerHTML = "";
  refs.pendingSelectionBannerBody.innerHTML = "";
  refs.pendingSelectionBannerBody.hidden = true;
  refs.pendingEmpty.hidden = all.length > 0;

  const checkedCount = state.checkedPendingIds.size;
  const allSelectedOnPage = items.length > 0 && items.every((item) => state.checkedPendingIds.has(item.id));
  if (checkedCount > 0) {
    const row = document.createElement("tr");
    row.className = "selection-banner-row";
    const cell = document.createElement("td");
    cell.colSpan = 8;
    if (state.pendingSelectionScope === "filtered") {
      cell.innerHTML = `검색결과 총 ${all.length}건이 선택되었습니다.`;
    } else if (allSelectedOnPage) {
      const pageMessage = `페이지에서 ${items.length}개가 선택되었습니다.`;
      if (all.length > items.length) {
        cell.innerHTML = `${pageMessage} <button type="button" class="text-btn selection-banner-link" id="selectAllFilteredPending">목록에서 총 ${all.length}개 데이터 선택</button>`;
      } else {
        cell.innerHTML = `${pageMessage} 목록에서 총 ${all.length}개 데이터 선택`;
      }
    } else {
      cell.innerHTML = `현재 선택된 제외신청 ${checkedCount}건이 업무 대상입니다.`;
      }
    row.appendChild(cell);
    refs.pendingSelectionBannerBody.appendChild(row);
    refs.pendingSelectionBannerBody.hidden = false;
  }

  items.forEach((item) => {
    const row = document.createElement("tr");
    row.classList.toggle("is-checked", state.checkedPendingIds.has(item.id));

    const checkboxCell = document.createElement("td");
    checkboxCell.className = "checkbox-cell";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = state.checkedPendingIds.has(item.id);
    checkbox.setAttribute("aria-label", `${item.detectId} 검출건 선택`);
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        state.checkedPendingIds.add(item.id);
      } else {
        state.checkedPendingIds.delete(item.id);
        state.pendingSelectionScope = "page";
      }
      render();
    });
    checkboxCell.appendChild(checkbox);

    row.append(
      checkboxCell,
      createTextCell(item.requestedBy),
      createTextCell(formatDateTime(item.requestedAt)),
      createHtmlCell("comment-text", escapeHtml(item.requestComment || "-")),
      createTextCell(item.dbName),
      createHtmlCell("url-text", escapeHtml(item.url)),
      createNumberCell(item.detectId),
      createHtmlCell("path-block", escapeHtml(item.path))
    );
    refs.pendingTableBody.appendChild(row);
  });

  exceptionShared.renderPagination(refs.pendingPagination, all.length, state.pagination.pendingPageSize, state.pagination.pendingPage, (page) => {
    state.pagination.pendingPage = page;
    render();
  });
}

function renderProcessedToolbar() {
  const { all } = getProcessedPageItems();
  refs.processedToolbarCaption.innerHTML = all.length
    ? `<span class="toolbar-caption-strong">전체 ${all.length}건</span> <span class="toolbar-caption-highlight">${Math.min((state.pagination.processedPage - 1) * state.pagination.processedPageSize + 1, all.length)} - ${Math.min(state.pagination.processedPage * state.pagination.processedPageSize, all.length)} 표시됨</span>`
    : '<span class="toolbar-caption-strong">전체 0건</span> <span class="toolbar-caption-highlight">0 - 0 표시됨</span>';
  refs.processedSearchInput.value = state.processedQuery;
  const processedFiltersText = buildProcessedFilterSummary();
  refs.processedFilterSummary.hidden = processedFiltersText.length === 0;
  refs.processedFilterText.textContent = processedFiltersText;
  refs.toggleProcessedFilterButton.classList.toggle(
    "is-filtered",
    state.processedFilters.statuses.length > 0 || state.summaryFilter === "approved" || state.summaryFilter === "rejected"
  );
  refs.processedPageSizeSelect.value = String(state.pagination.processedPageSize);
}

function renderProcessedTable() {
  const { all, items } = getProcessedPageItems();
  refs.processedTableBody.innerHTML = "";
  refs.processedEmpty.hidden = all.length > 0;

  items.forEach((item) => {
    const row = document.createElement("tr");
    const statusCell = document.createElement("td");
    statusCell.className = "status-cell";
    statusCell.innerHTML = renderStatusChip(item.status);

    row.append(
      statusCell,
      createTextCell(formatDateTime(item.processedAt)),
      createTextCell(item.processedBy || "-"),
      createHtmlCell("comment-text", escapeHtml(item.processedComment || "-")),
      createTextCell(item.requestedBy),
      createHtmlCell("comment-text", escapeHtml(item.requestComment || "-")),
      createTextCell(item.dbName),
      createHtmlCell("url-text", escapeHtml(item.url)),
      createNumberCell(item.detectId),
      createHtmlCell("path-block", escapeHtml(item.path))
    );
    refs.processedTableBody.appendChild(row);
  });

  exceptionShared.renderPagination(refs.processedPagination, all.length, state.pagination.processedPageSize, state.pagination.processedPage, (page) => {
    state.pagination.processedPage = page;
    render();
  });
}

function bindProcessedStatusFilter() {
  refs.processedStatusFilterTrigger.addEventListener("click", (event) => {
    const removeButton = event.target.closest(".filter-chip-remove");
    if (removeButton) {
      event.stopPropagation();
      state.processedFilters.draftStatuses = state.processedFilters.draftStatuses.filter(
        (status) => status !== removeButton.dataset.filterValue
      );
      renderProcessedFilterControls();
      return;
    }
    state.processedFilterUi.openKey = state.processedFilterUi.openKey === "statuses" ? null : "statuses";
    renderProcessedFilterSelectPanels();
  });

  refs.processedStatusFilterSearch.addEventListener("input", (event) => {
    state.processedFilterUi.statusesSearch = event.target.value.trim();
    renderProcessedFilterControls();
  });

  refs.processedStatusFilterList.addEventListener("change", (event) => {
    if (!(event.target instanceof HTMLInputElement) || event.target.type !== "checkbox") {
      return;
    }
    state.processedFilters.draftStatuses = [
      ...refs.processedStatusFilterList.querySelectorAll("input[type='checkbox']:checked"),
    ].map((input) => input.value);
    renderProcessedFilterControls();
  });
}

function renderProcessedFilterSelectPanels() {
  const isOpen = state.processedFilterUi.openKey === "statuses" && state.processedFilters.panelOpen;
  refs.processedStatusFilterPanel.hidden = !isOpen;
}

function renderFilterSelect(trigger, container, items, selectedValues, searchQuery) {
  const normalizedQuery = searchQuery.toLowerCase();
  const labelMap = new Map(items.map((item) => [item.value, item.label]));
  trigger.classList.toggle("has-selection", selectedValues.length > 0);
  if (selectedValues.length) {
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
    trigger.innerHTML = '<span class="filter-select-placeholder">전체</span>';
  }

  container.innerHTML = "";
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

  if (!container.children.length) {
    const empty = document.createElement("div");
    empty.className = "filter-option-empty";
    empty.textContent = "검색 결과 없음";
    container.appendChild(empty);
  }
}

function renderProcessedFilterControls() {
  refs.processedFilterModal.hidden = !state.processedFilters.panelOpen;
  refs.processedStatusFilterSearch.value = state.processedFilterUi.statusesSearch;
  renderFilterSelect(
    refs.processedStatusFilterTrigger,
    refs.processedStatusFilterList,
    ["EXCLUDED", "EXCLUSION_REJECTED"].map((status) => ({
      value: status,
      label: exceptionService.STATUS_META[status]?.label ?? status,
    })),
    state.processedFilters.draftStatuses,
    state.processedFilterUi.statusesSearch
  );
  renderProcessedFilterSelectPanels();
  if (state.processedFilters.panelOpen) {
    positionProcessedFilterPopover();
  }
}

function positionProcessedFilterPopover() {
  const rect = refs.toggleProcessedFilterButton.getBoundingClientRect();
  refs.processedFilterModal.style.top = `${rect.bottom + 8}px`;
  refs.processedFilterModal.style.left = `${Math.max(
    12,
    Math.min(rect.left, window.innerWidth - refs.processedFilterModal.offsetWidth - 12)
  )}px`;
}

function renderProcessModal() {
  refs.processModal.hidden = !state.processModal.open;
  refs.processModalTitle.textContent = state.processModal.action === "approve" ? "제외 승인 의견 입력" : "제외 거부 의견 입력";
  refs.processModalCaption.textContent =
    state.processModal.action === "approve"
      ? `선택한 ${state.checkedPendingIds.size}건을 제외 승인합니다. 처리의견을 입력하세요.`
      : `선택한 ${state.checkedPendingIds.size}건을 제외 거부합니다. 처리의견을 입력하세요.`;
  refs.processOpinionInput.value = state.processModal.opinion;
  refs.processOpinionCount.textContent = `${state.processModal.opinion.length} / 500`;
  refs.confirmProcessButton.disabled = !state.processModal.opinion.trim();
}

function renderSortIndicators() {
  const pendingSortMap = {
    requestedBy: refs.pendingSortRequestedBy,
    requestedAt: refs.pendingSortRequestedAt,
    requestComment: refs.pendingSortRequestComment,
    dbName: refs.pendingSortDbName,
    url: refs.pendingSortUrl,
    detectId: refs.pendingSortDetectId,
    path: refs.pendingSortPath,
  };
  const processedSortMap = {
    status: refs.processedSortStatus,
    processedAt: refs.processedSortProcessedAt,
    processedBy: refs.processedSortProcessedBy,
    processedComment: refs.processedSortProcessedComment,
    requestedBy: refs.processedSortRequestedBy,
    requestComment: refs.processedSortRequestComment,
    dbName: refs.processedSortDbName,
    url: refs.processedSortUrl,
    detectId: refs.processedSortDetectId,
    path: refs.processedSortPath,
  };

  Object.entries(pendingSortMap).forEach(([key, node]) => {
    node.textContent = state.sort.pending.key === key ? (state.sort.pending.dir === "asc" ? "▲" : "▼") : "";
  });
  Object.entries(processedSortMap).forEach(([key, node]) => {
    node.textContent = state.sort.processed.key === key ? (state.sort.processed.dir === "asc" ? "▲" : "▼") : "";
  });
}

function openProcessModal(action) {
  if (state.role !== "admin" || state.checkedPendingIds.size === 0) {
    return;
  }
  state.processModal.open = true;
  state.processModal.action = action;
  state.processModal.opinion = "";
  render();
}

function closeProcessModal(shouldRender = true) {
  state.processModal.open = false;
  state.processModal.action = "approve";
  state.processModal.opinion = "";
  if (shouldRender) {
    render();
  }
}

function renderStatusChip(status) {
  const meta = exceptionService.STATUS_META[status];
  return meta ? `<span class="status-chip ${meta.className}">${meta.label}</span>` : "-";
}

function buildProcessedFilterSummary() {
  const parts = [];
  if (state.processedQuery) {
    parts.push(`검색 "${state.processedQuery}"`);
  }
  if (state.processedFilters.statuses.length > 0) {
    const labels = state.processedFilters.statuses.map((status) => exceptionService.STATUS_META[status]?.label ?? status);
    parts.push(`검출상태: ${labels.join(", ")}`);
  }
  return parts.join(" · ");
}

function applySummaryFilter(nextFilter) {
  state.summaryFilter = nextFilter ?? "all";
  if (state.summaryFilter === "all") {
    state.processedFilters.statuses = [];
    state.processedFilters.draftStatuses = [];
  } else if (state.summaryFilter === "pending") {
    state.processedFilters.statuses = [];
    state.processedFilters.draftStatuses = [];
    state.currentTab = "pending";
  } else if (state.summaryFilter === "approved") {
    state.processedFilters.statuses = ["EXCLUDED"];
    state.processedFilters.draftStatuses = ["EXCLUDED"];
    state.currentTab = "processed";
  } else if (state.summaryFilter === "rejected") {
    state.processedFilters.statuses = ["EXCLUSION_REJECTED"];
    state.processedFilters.draftStatuses = ["EXCLUSION_REJECTED"];
    state.currentTab = "processed";
  }
  state.processedFilterUi.openKey = null;
  state.processedFilterUi.statusesSearch = "";
  state.pagination.pendingPage = 1;
  state.pagination.processedPage = 1;
  state.checkedPendingIds.clear();
  state.pendingSelectionScope = "page";
  render();
}

function deriveSummaryFilterFromProcessedStatuses(statuses) {
  if (statuses.length === 1 && statuses[0] === "EXCLUDED") {
    return "approved";
  }
  if (statuses.length === 1 && statuses[0] === "EXCLUSION_REJECTED") {
    return "rejected";
  }
  return "all";
}

function createTextCell(value) {
  const cell = document.createElement("td");
  cell.textContent = value;
  return cell;
}

function createNumberCell(value) {
  const cell = document.createElement("td");
  cell.className = "number-cell";
  cell.textContent = String(value);
  return cell;
}

function createHtmlCell(className, html) {
  const cell = document.createElement("td");
  cell.innerHTML = `<div class="${className}">${html}</div>`;
  return cell;
}

function formatDateTime(value) {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  const formatter = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return formatter.format(date).replace(/\.\s/g, "-").replace(".", "").trim();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function pushToast(message, type = "default") {
  exceptionShared.pushToast(refs.toastStack, message, type);
}

