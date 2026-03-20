const service = window.MockDetectionService;
const { STATUS_META, STATUS_ORDER, ASSIGNEES } = service;

const ROLE_STORAGE_KEY = "dguard.currentRole";
const refs = {};

const DEFAULT_MENU_KEY = "detection-list";

const state = {
  role: "admin",
  sidebarCollapsed: false,
  selectedMenuKey: DEFAULT_MENU_KEY,
  openSidebarGroupKey: null,
  selectedDetectionId: null,
  selectedPiiId: null,
  checkedDetectionIds: new Set(),
  detectionFilters: {
    query: "",
    detectTypes: [],
    assignees: [],
    statuses: [],
    panelOpen: false,
  },
  detectionFilterDraft: {
    detectTypes: [],
    assignees: [],
    statuses: [],
  },
  detectionSort: {
    key: "path",
    dir: "asc",
  },
  piiFilters: {
    query: "",
    sortKey: "count",
    sortDir: "desc",
  },
  pagination: {
    detectionPage: 1,
    detectionPageSize: 5,
    piiPage: 1,
    piiPageSize: 7,
  },
  editorDraft: {
    status: null,
    comment: "",
    assignees: [],
  },
  editorDraftSourceId: null,
  assigneeSearch: "",
  filterUi: {
    openKey: null,
    detectTypesSearch: "",
    assigneesSearch: "",
    statusesSearch: "",
  },
  bulkEditDraft: {
    open: false,
    statusEnabled: false,
    status: null,
    commentEnabled: false,
    comment: "",
    assigneeEnabled: false,
    assignee: "",
  },
  deleteModalOpen: false,
  historyModalOpen: false,
  userMenuOpen: false,
  routeContext: {
    dbId: "",
    targetName: "",
    detectType: "",
  },
};

document.addEventListener("DOMContentLoaded", init);

function init() {
  cacheRefs();
  ensureDetectionTableColumns();
  applyPersistedRole();
  refs.detectionSearchInput.placeholder = "검출경로, DB명, 스케줄ID 검색";
  applyInitialRouteState();
  bindEvents();
  populateStaticControls();
  syncSelectionState();
  render();
}

function applyPersistedRole() {
  const savedRole = window.sessionStorage.getItem(ROLE_STORAGE_KEY);
  if (savedRole === "admin" || savedRole === "user") {
    state.role = savedRole;
    state.selectedMenuKey = getDefaultMenuKey(savedRole);
    return;
  }
  window.sessionStorage.setItem(ROLE_STORAGE_KEY, state.role);
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
    "detectionSearchInput",
    "toggleFilterButton",
    "detectTypeFilterSelect",
    "detectTypeFilterTrigger",
    "detectTypeFilterPanel",
    "detectTypeFilterSearch",
    "detectTypeFilterList",
    "assigneeFilterSelect",
    "assigneeFilterTrigger",
    "assigneeFilterPanel",
    "assigneeFilterSearch",
    "assigneeFilterList",
    "statusFilterSelect",
    "statusFilterTrigger",
    "statusFilterPanel",
    "statusFilterSearch",
    "statusFilterList",
    "applyFilterButton",
    "cancelFilterButton",
    "detectionFilterSummary",
    "detectionFilterBadge",
    "clearDetectionFilters",
    "detectionToolbarCaption",
    "selectAllDetections",
    "detectionSelectionBannerBody",
    "detectionTableBody",
    "detectionEmpty",
    "detectionPagination",
    "detectionPageSizeSelect",
    "detectionSortIndicatorPath",
    "detectionSortIndicatorDbName",
    "detectionSortIndicatorDetectType",
    "detectionSortIndicatorCount",
    "detectionSortIndicatorAssignees",
    "detectionSortIndicatorStatus",
    "bulkEditButton",
    "deleteButton",
    "actionPlanButton",
    "recheckButton",
    "exportButton",
    "editorSummary",
    "statusChangedAt",
    "historyButton",
    "statusGrid",
    "commentInput",
    "commentCount",
    "assigneePicker",
    "assigneePickerTrigger",
    "assigneePickerPanel",
    "assigneeSearchInput",
    "assigneeOptions",
    "saveButton",
    "piiSearchInput",
    "piiFilterSummary",
    "piiFilterBadge",
    "clearPiiFilters",
    "piiTableBody",
    "piiEmpty",
    "piiPagination",
    "piiPaginationCaption",
    "detailUnique",
    "contextList",
    "detailRecheckButton",
    "copyQueryButton",
    "sortIndicatorValue",
    "sortIndicatorCount",
    "bulkModal",
    "filterModal",
    "bulkSelectionCaption",
    "bulkStatusEnabled",
    "bulkStatusGrid",
    "bulkCommentEnabled",
    "bulkCommentInput",
    "bulkAssigneeEnabled",
    "bulkAssigneeSelect",
    "bulkApplyButton",
    "deleteModal",
    "deleteCaption",
    "confirmDeleteButton",
    "historyModal",
    "historyTableBody",
    "historyEmpty",
    "toastStack",
  ];

  ids.forEach((id) => {
    refs[id] = document.getElementById(id);
  });
  refs.sidebarNav = document.querySelector(".sidebar-nav");
  refs.sidebarBrand = document.querySelector(".sidebar-brand");
  refs.roleButtons = [...document.querySelectorAll(".role-btn")];
  refs.workspace = document.querySelector(".workspace");
  refs.rightRail = document.querySelector(".right-rail");
  refs.detectionHeroTarget = document.querySelector(".hero-target");
  refs.detectionTitle = document.querySelector(".hero-card h1");
  const breadcrumbLinks = [...document.querySelectorAll(".breadcrumb-link")];
  refs.detectionBreadcrumbHome = breadcrumbLinks[0] ?? null;
  refs.detectionBreadcrumbTarget = breadcrumbLinks[1] ?? null;
  refs.detectionBreadcrumbCurrent = breadcrumbLinks[2] ?? null;
}

function ensureDetectionTableColumns() {
  const table = document.querySelector(".detection-card .data-table");
  const colgroup = table?.querySelector("colgroup");
  const headerRow = table?.querySelector("thead tr");
  const detectIdHeader = headerRow?.querySelector(".detect-id-cell");

  if (!table || !colgroup || !headerRow || !detectIdHeader) {
    return;
  }

  if (!document.getElementById("detectionScheduleIdHeader") || !document.getElementById("detectionSortIndicatorDbName")) {
    const colWidths = ["40px", "56px", "14%", "14%", "24%", "12%", "8%", "14%", "12%"];
    const cols = [...colgroup.querySelectorAll("col")];
    if (cols.length !== colWidths.length) {
      colgroup.innerHTML = "";
      colWidths.forEach((width) => {
        const col = document.createElement("col");
        col.style.width = width;
        colgroup.appendChild(col);
      });
    }

    if (!document.getElementById("detectionScheduleIdHeader")) {
      const scheduleHeader = document.createElement("th");
      scheduleHeader.id = "detectionScheduleIdHeader";
      scheduleHeader.textContent = "스케줄ID";
      detectIdHeader.insertAdjacentElement("afterend", scheduleHeader);
    }

    const dbHeader = document.createElement("th");
    dbHeader.innerHTML = `
      <button type="button" class="sort-btn" data-detection-sort-key="dbName">
        DB명
        <span class="sort-indicator" id="detectionSortIndicatorDbName"></span>
      </button>
    `;
    const scheduleHeader = document.getElementById("detectionScheduleIdHeader");
    if (!document.getElementById("detectionSortIndicatorDbName")) {
      scheduleHeader.insertAdjacentElement("afterend", dbHeader);
    }
  }

  refs.detectionSortIndicatorDbName = document.getElementById("detectionSortIndicatorDbName");
}

function applyInitialRouteState() {
  const params = new URLSearchParams(window.location.search);
  state.routeContext.dbId = (params.get("dbId") ?? "").trim();
  state.routeContext.targetName = (params.get("target") ?? "").trim();
  state.routeContext.detectType = (params.get("detectType") ?? "").trim();
  state.detectionFilters.query = (params.get("detectionQuery") ?? "").trim();
  state.piiFilters.query = (params.get("piiQuery") ?? "").trim();

  if (!state.routeContext.targetName && state.routeContext.dbId) {
    state.routeContext.targetName = service.getDbNameById(state.routeContext.dbId);
  }

  if (state.routeContext.detectType && getDetectTypes().includes(state.routeContext.detectType)) {
    state.detectionFilters.detectTypes = [state.routeContext.detectType];
    state.detectionFilterDraft.detectTypes = [state.routeContext.detectType];
  }

  const detectionId = (params.get("detectionId") ?? "").trim();
  if (detectionId && service.findDetectionById(detectionId)) {
    state.selectedDetectionId = detectionId;
  }

  refs.detectionSearchInput.value = state.detectionFilters.query;
  refs.piiSearchInput.value = state.piiFilters.query;
}

function navigateToHome() {
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  if (currentPath !== "index.html") {
    window.location.href = "index.html";
  }
}

function bindEvents() {
  if (refs.sidebarBrand) {
    refs.sidebarBrand.setAttribute("role", "link");
    refs.sidebarBrand.tabIndex = 0;
    refs.sidebarBrand.setAttribute("aria-label", "D-Guard 홈으로 이동");
    refs.sidebarBrand.addEventListener("click", navigateToHome);
    refs.sidebarBrand.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }
      event.preventDefault();
      navigateToHome();
    });
  }

  refs.sidebarToggle.addEventListener("click", () => {
    state.sidebarCollapsed = !state.sidebarCollapsed;
    render();
  });

  refs.sidebarNav.addEventListener("click", (event) => {
    const groupTrigger = event.target.closest("[data-group-key]");
    if (groupTrigger) {
      const groupKey = groupTrigger.dataset.groupKey;
      state.selectedMenuKey = groupKey;
      state.openSidebarGroupKey = state.openSidebarGroupKey === groupKey ? null : groupKey;
      render();
      return;
    }

    const item = event.target.closest("[data-menu-key]");
    if (!item || item.hasAttribute("data-group-key")) {
      return;
    }
    state.selectedMenuKey = item.dataset.menuKey;
    state.openSidebarGroupKey = item.dataset.parentGroupKey ?? null;
    const href = item.dataset.href;
    if (href && href !== "#") {
      const currentPath = window.location.pathname.split("/").pop() || "index.html";
      if (currentPath !== href || (href === "detection-list.html" && window.location.search)) {
        window.location.href = href;
        return;
      }
    }
    if (state.selectedMenuKey === "inspection-target") {
      return;
    }
    render();
  });

  refs.roleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.role = button.dataset.role;
      state.selectedMenuKey = getDefaultMenuKey(state.role);
      state.openSidebarGroupKey = null;
      window.sessionStorage.setItem(ROLE_STORAGE_KEY, state.role);
      state.userMenuOpen = false;
      refs.assigneePickerPanel.hidden = true;
      refs.assigneePickerTrigger.setAttribute("aria-expanded", "false");
      render();
      pushToast(`역할이 ${state.role === "admin" ? "관리자" : "일반사용자"}로 변경되었습니다.`);
    });
  });

  refs.userMenuTrigger.addEventListener("click", () => {
    state.userMenuOpen = !state.userMenuOpen;
    render();
  });

  refs.userSettingsButton.addEventListener("click", () => {
    state.userMenuOpen = false;
    render();
    pushToast("사용자설정 화면은 샘플에서 준비 중입니다.");
  });

  refs.logoutButton.addEventListener("click", () => {
    state.userMenuOpen = false;
    render();
    pushToast("로그아웃이 요청되었습니다.");
  });

  refs.detectionSearchInput.addEventListener("input", (event) => {
    state.detectionFilters.query = event.target.value.trim();
    state.pagination.detectionPage = 1;
    syncSelectionState();
    render();
  });

  refs.toggleFilterButton.addEventListener("click", () => {
    const shouldOpen = !state.detectionFilters.panelOpen;
    state.detectionFilters.panelOpen = shouldOpen;
    state.filterUi.openKey = null;
    if (shouldOpen) {
      state.detectionFilterDraft.detectTypes = [...state.detectionFilters.detectTypes];
      state.detectionFilterDraft.assignees = [...state.detectionFilters.assignees];
      state.detectionFilterDraft.statuses = [...state.detectionFilters.statuses];
    }
    render();
  });

  refs.clearDetectionFilters.addEventListener("click", () => {
    state.detectionFilters.query = "";
    state.detectionFilters.detectTypes = [];
    state.detectionFilters.assignees = [];
    state.detectionFilters.statuses = [];
    state.detectionFilterDraft.detectTypes = [];
    state.detectionFilterDraft.assignees = [];
    state.detectionFilterDraft.statuses = [];
    state.filterUi.detectTypesSearch = "";
    state.filterUi.assigneesSearch = "";
    state.filterUi.statusesSearch = "";
    state.pagination.detectionPage = 1;
    refs.detectionSearchInput.value = "";
    syncSelectionState();
    render();
  });

  bindFilterSelect("detectTypes");
  bindFilterSelect("assignees");
  bindFilterSelect("statuses");

  refs.selectAllDetections.addEventListener("change", (event) => {
    const pageItems = getDetectionPageItems().items;
    pageItems.forEach((item) => {
      if (event.target.checked) {
        state.checkedDetectionIds.add(item.id);
      } else {
        state.checkedDetectionIds.delete(item.id);
      }
    });
    render();
  });

  refs.detectionPageSizeSelect.addEventListener("change", (event) => {
    const nextSize = Number.parseInt(event.target.value, 10);
    if (!Number.isFinite(nextSize)) {
      return;
    }
    state.pagination.detectionPageSize = nextSize;
    state.pagination.detectionPage = 1;
    state.checkedDetectionIds.clear();
    render();
  });

  refs.detectionSelectionBannerBody.addEventListener("click", (event) => {
    const button = event.target.closest("#selectAllFilteredDetections");
    if (!button) {
      return;
    }
    getFilteredDetections().forEach((item) => {
      state.checkedDetectionIds.add(item.id);
    });
    render();
  });

  refs.commentInput.addEventListener("input", (event) => {
    state.editorDraft.comment = event.target.value.slice(0, 500);
    render();
  });

  refs.assigneePickerTrigger.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-assignee-remove]");
    if (removeButton) {
      event.stopPropagation();
      state.editorDraft.assignees = state.editorDraft.assignees.filter((name) => name !== removeButton.dataset.assigneeRemove);
      renderAssigneeTrigger();
      renderAssigneeOptions();
      refs.saveButton.disabled = !hasEditorChanges();
      return;
    }
    const isOpen = !refs.assigneePickerPanel.hidden;
    refs.assigneePickerPanel.hidden = isOpen;
    refs.assigneePickerTrigger.setAttribute("aria-expanded", String(!isOpen));
    if (!isOpen) {
      refs.assigneeSearchInput.focus();
    }
  });

  refs.assigneeSearchInput.addEventListener("input", (event) => {
    state.assigneeSearch = event.target.value.trim();
    renderAssigneeOptions();
  });

  document.addEventListener("click", (event) => {
    if (!refs.userMenu.contains(event.target)) {
      state.userMenuOpen = false;
    }
    if (!refs.assigneePicker.contains(event.target)) {
      refs.assigneePickerPanel.hidden = true;
      refs.assigneePickerTrigger.setAttribute("aria-expanded", "false");
    }
    if (state.detectionFilters.panelOpen) {
      const insideFilterSelect = event.target.closest(".filter-select");
      const insideFilterModal = event.target.closest("#filterModal .filter-popover-card");
      const onFilterButton = event.target.closest("#toggleFilterButton");
      if (!insideFilterModal && !onFilterButton) {
        state.detectionFilters.panelOpen = false;
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

  refs.cancelFilterButton.addEventListener("click", () => {
    state.detectionFilters.panelOpen = false;
    state.filterUi.openKey = null;
    render();
  });

  refs.applyFilterButton.addEventListener("click", () => {
    state.detectionFilters.detectTypes = [...state.detectionFilterDraft.detectTypes];
    state.detectionFilters.assignees = [...state.detectionFilterDraft.assignees];
    state.detectionFilters.statuses = [...state.detectionFilterDraft.statuses];
    state.pagination.detectionPage = 1;
    state.detectionFilters.panelOpen = false;
    state.filterUi.openKey = null;
    syncSelectionState();
    render();
  });

  refs.saveButton.addEventListener("click", handleSave);
  refs.historyButton.addEventListener("click", () => {
    if (!getSelectedDetection()) {
      return;
    }
    state.historyModalOpen = true;
    render();
  });

  refs.piiSearchInput.addEventListener("input", (event) => {
    state.piiFilters.query = event.target.value.trim();
    state.pagination.piiPage = 1;
    syncPiiSelectionState();
    render();
  });

  refs.clearPiiFilters.addEventListener("click", () => {
    state.piiFilters.query = "";
    refs.piiSearchInput.value = "";
    state.pagination.piiPage = 1;
    syncPiiSelectionState();
    render();
  });

  document.querySelectorAll(".sort-btn").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.detectionSortKey) {
        const key = button.dataset.detectionSortKey;
        if (state.detectionSort.key === key) {
          state.detectionSort.dir = state.detectionSort.dir === "asc" ? "desc" : "asc";
        } else {
          state.detectionSort.key = key;
          state.detectionSort.dir = key === "count" ? "desc" : "asc";
        }
        state.pagination.detectionPage = 1;
        syncSelectionState();
        render();
        return;
      }
      const key = button.dataset.sortKey;
      if (state.piiFilters.sortKey === key) {
        state.piiFilters.sortDir = state.piiFilters.sortDir === "asc" ? "desc" : "asc";
      } else {
        state.piiFilters.sortKey = key;
        state.piiFilters.sortDir = key === "count" ? "desc" : "asc";
      }
      state.pagination.piiPage = 1;
      syncPiiSelectionState();
      render();
    });
  });

  refs.copyQueryButton.addEventListener("click", async () => {
    const record = getSelectedPii();
    if (!record) {
      return;
    }
    try {
      await copyText(record.lookupQuery);
      pushToast("조회 Query가 클립보드에 복사되었습니다.", "success");
    } catch (error) {
      pushToast("클립보드 복사에 실패했습니다.", "danger");
    }
  });

  refs.detailRecheckButton.addEventListener("click", () => {
    const detection = getSelectedDetection();
    const record = getSelectedPii();
    if (!detection || !record) {
      pushToast("이행점검할 개인정보를 선택하세요.", "danger");
      return;
    }
    const result = service.recheckPiiRecord(detection.id, record.id);
    if (!result.ok && result.reason === "already-processed") {
      pushToast("선택한 Unique 대상은 이미 이행점검 처리되었습니다.");
      return;
    }
    if (result.completed) {
      state.checkedDetectionIds.delete(detection.id);
      syncSelectionState();
      render();
      pushToast("모든 개인정보 이행점검이 완료되어 검출 목록에서 제거되었습니다.", "success");
      return;
    }

    syncSelectionState();
    render();
    pushToast(
      `Unique 기준 이행점검이 완료되었습니다. ${result.removedCount}건 제외, 잔여 ${result.remainingCount}건`,
      "success"
    );
  });

  refs.bulkEditButton.addEventListener("click", () => {
    state.bulkEditDraft.open = true;
    render();
  });

  refs.actionPlanButton.addEventListener("click", handleActionPlanCreate);

  refs.deleteButton.addEventListener("click", () => {
    state.deleteModalOpen = true;
    render();
  });

  refs.exportButton.addEventListener("click", () => {
    const selectedCount = state.checkedDetectionIds.size;
    if (selectedCount > 0) {
      pushToast(`선택한 ${selectedCount}건 기준으로 Excel 보고서를 생성했습니다.`);
    } else {
      pushToast("현재 검색 결과 기준으로 Excel 보고서를 생성했습니다.");
    }
  });

  refs.recheckButton.addEventListener("click", () => {
    const targetIds = [...state.checkedDetectionIds];
    if (!targetIds.length) {
      pushToast("이행점검할 검출 경로를 체크박스로 선택하세요.", "danger");
      return;
    }
    service.recheckDetections(targetIds);
    syncSelectionState();
    render();
    pushToast(`이행점검이 완료되어 ${targetIds.length}건의 검출 결과를 갱신했습니다.`, "success");
  });

  refs.bulkStatusEnabled.addEventListener("change", (event) => {
    state.bulkEditDraft.statusEnabled = event.target.checked;
    renderBulkModal();
  });

  refs.bulkCommentEnabled.addEventListener("change", (event) => {
    state.bulkEditDraft.commentEnabled = event.target.checked;
    renderBulkModal();
  });

  refs.bulkCommentInput.addEventListener("input", (event) => {
    state.bulkEditDraft.comment = event.target.value.slice(0, 500);
  });

  refs.bulkAssigneeEnabled.addEventListener("change", (event) => {
    state.bulkEditDraft.assigneeEnabled = event.target.checked;
    renderBulkModal();
  });

  refs.bulkAssigneeSelect.addEventListener("change", (event) => {
    state.bulkEditDraft.assignee = event.target.value;
  });

  refs.bulkApplyButton.addEventListener("click", applyBulkEdit);
  refs.confirmDeleteButton.addEventListener("click", applyDelete);

  document.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", () => {
      closeModalById(button.dataset.closeModal);
      render();
    });
  });

  [refs.bulkModal, refs.deleteModal, refs.historyModal].forEach((modal) => {
    modal.addEventListener("click", (event) => {
      if (event.target !== modal) {
        return;
      }
      closeModalById(modal.id);
      render();
    });
  });
}

function closeModalById(modalId) {
  if (modalId === "bulkModal") {
    state.bulkEditDraft.open = false;
  }
  if (modalId === "deleteModal") {
    state.deleteModalOpen = false;
  }
  if (modalId === "historyModal") {
    state.historyModalOpen = false;
  }
}

function populateStaticControls() {
  renderDetectionFilterControls();
  populateSelect(refs.bulkAssigneeSelect, ["", ...ASSIGNEES], "담당자 선택");
  renderStatusButtons();
  renderBulkStatusButtons();
  renderAssigneeOptions();
}

function bindFilterSelect(key) {
  const mapping = {
    detectTypes: {
      trigger: refs.detectTypeFilterTrigger,
      panel: refs.detectTypeFilterPanel,
      search: refs.detectTypeFilterSearch,
      list: refs.detectTypeFilterList,
      searchKey: "detectTypesSearch",
    },
    assignees: {
      trigger: refs.assigneeFilterTrigger,
      panel: refs.assigneeFilterPanel,
      search: refs.assigneeFilterSearch,
      list: refs.assigneeFilterList,
      searchKey: "assigneesSearch",
    },
    statuses: {
      trigger: refs.statusFilterTrigger,
      panel: refs.statusFilterPanel,
      search: refs.statusFilterSearch,
      list: refs.statusFilterList,
      searchKey: "statusesSearch",
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
    renderDetectionFilterControls();
  });
  target.list.addEventListener("change", (event) => {
    if (!(event.target instanceof HTMLInputElement) || event.target.type !== "checkbox") {
      return;
    }
    const checkedValues = [...target.list.querySelectorAll("input[type='checkbox']:checked")].map((input) => input.value);
    state.detectionFilterDraft[key] = checkedValues;
    renderDetectionFilterControls();
  });
}

function renderDetectionFilterControls() {
  refs.detectTypeFilterSearch.value = state.filterUi.detectTypesSearch;
  refs.assigneeFilterSearch.value = state.filterUi.assigneesSearch;
  refs.statusFilterSearch.value = state.filterUi.statusesSearch;
  renderFilterSelect(
    "detectTypes",
    refs.detectTypeFilterTrigger,
    refs.detectTypeFilterList,
    getDetectTypes(),
    state.detectionFilterDraft.detectTypes,
    state.filterUi.detectTypesSearch
  );
  renderFilterSelect(
    "assignees",
    refs.assigneeFilterTrigger,
    refs.assigneeFilterList,
    ASSIGNEES,
    state.detectionFilterDraft.assignees,
    state.filterUi.assigneesSearch
  );
  renderFilterSelect(
    "statuses",
    refs.statusFilterTrigger,
    refs.statusFilterList,
    STATUS_ORDER.map((status) => ({ value: status, label: STATUS_META[status].label })),
    state.detectionFilterDraft.statuses,
    state.filterUi.statusesSearch
  );
  renderFilterSelectPanels();
}

function renderFilterSelect(key, trigger, container, items, selectedValues, searchQuery) {
  trigger.classList.toggle("has-selection", selectedValues.length > 0);
  if (selectedValues.length) {
    const labelMap = new Map(
      items.map((item) => (typeof item === "string" ? [item, item] : [item.value, item.label]))
    );
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
    detectTypes: refs.detectTypeFilterPanel,
    assignees: refs.assigneeFilterPanel,
    statuses: refs.statusFilterPanel,
  };
  Object.entries(mapping).forEach(([key, panel]) => {
    const isOpen = state.filterUi.openKey === key && state.detectionFilters.panelOpen;
    panel.hidden = !isOpen;
  });
}

function removeFilterDraftValue(key, value) {
  state.detectionFilterDraft[key] = state.detectionFilterDraft[key].filter((item) => item !== value);
  renderDetectionFilterControls();
}

function populateSelect(element, values, allLabel, useStatusLabel = false) {
  element.innerHTML = "";
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    if (value === "ALL" || value === "") {
      option.textContent = allLabel;
    } else {
      option.textContent = useStatusLabel ? STATUS_META[value].label : value;
    }
    element.appendChild(option);
  });
}

function render() {
  const hasSelection = Boolean(state.selectedDetectionId);
  document.body.classList.toggle("sidebar-collapsed", state.sidebarCollapsed);
  refs.workspace.classList.toggle("is-detail-open", hasSelection);
  refs.rightRail.hidden = !hasSelection;
  refs.sidebarToggle.textContent = state.sidebarCollapsed ? ">" : "<";
  refs.sidebarToggle.setAttribute("aria-expanded", String(!state.sidebarCollapsed));
  refs.userMenuTrigger.setAttribute("aria-expanded", String(state.userMenuOpen));
  refs.userMenuPanel.hidden = !state.userMenuOpen;
  refs.roleButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.role === state.role);
  });
  renderSidebar();
  renderRouteContext();
  refs.filterModal.hidden = !state.detectionFilters.panelOpen;
  refs.deleteButton.hidden = state.role !== "admin";
  refs.toggleFilterButton.classList.toggle("is-filtered", isDetectionFiltered());
  renderDetectionFilterControls();
  if (state.detectionFilters.panelOpen) {
    positionFilterPopover();
  }
  renderDetectionTable();
  renderStatusButtons();
  renderStatusCardHeader();
  renderEditor();
  renderPiiTable();
  renderPiiDetail();
  renderBulkModal();
  renderDeleteModal();
  renderHistoryModal();
}

function renderRouteContext() {
  if (refs.detectionTitle) {
    refs.detectionTitle.innerHTML = `검출목록<span class="hero-target">${escapeHtml(state.routeContext.targetName)}</span>`;
    refs.detectionHeroTarget = refs.detectionTitle.querySelector(".hero-target");
  }

  document.title = `${state.routeContext.targetName} 검출목록 | D-Guard`;

  if (refs.detectionBreadcrumbHome) {
    refs.detectionBreadcrumbHome.textContent = "검출목록";
    refs.detectionBreadcrumbHome.href = "./detection-list.html";
  }

  if (refs.detectionBreadcrumbTarget) {
    refs.detectionBreadcrumbTarget.textContent = state.routeContext.targetName;
    refs.detectionBreadcrumbTarget.href = state.routeContext.dbId
      ? `./detection-list.html?dbId=${encodeURIComponent(state.routeContext.dbId)}`
      : "./detection-list.html";
  }

  if (refs.detectionBreadcrumbCurrent && (state.routeContext.targetName || state.routeContext.detectType)) {
    refs.detectionBreadcrumbCurrent.textContent = state.routeContext.detectType
      ? `${state.routeContext.detectType} 필터 결과`
      : state.routeContext.dbId
        ? "DB 검출목록"
        : "전체 검출목록";
  }
}

function getDetectTypes() {
  return service.getDetectTypes();
}

function getFilteredDetections() {
  return service.getFilteredDetections(
    {
      ...state.detectionFilters,
      dbId: state.routeContext.dbId,
    },
    state.detectionSort
  );
}

function getDetectionPageItems() {
  const items = getFilteredDetections();
  const start = (state.pagination.detectionPage - 1) * state.pagination.detectionPageSize;
  return {
    all: items,
    items: items.slice(start, start + state.pagination.detectionPageSize),
  };
}

function renderDetectionTable() {
  syncSelectionState();
  const { all, items } = getDetectionPageItems();
  refs.detectionTableBody.innerHTML = "";
  refs.detectionSelectionBannerBody.innerHTML = "";
  refs.detectionEmpty.hidden = all.length > 0;
  refs.detectionFilterSummary.hidden = !isDetectionFiltered();
  if (!refs.detectionFilterSummary.hidden) {
    refs.detectionFilterBadge.textContent = buildDetectionFilterSummary();
  }

  items.forEach((item) => {
    const row = document.createElement("tr");
    row.className = "clickable-row";
    if (item.id === state.selectedDetectionId) {
      row.classList.add("is-selected");
    }

    const checkboxCell = document.createElement("td");
    checkboxCell.className = "checkbox-cell";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = state.checkedDetectionIds.has(item.id);
    checkbox.addEventListener("click", (event) => event.stopPropagation());
    checkbox.addEventListener("change", (event) => {
      if (event.target.checked) {
        state.checkedDetectionIds.add(item.id);
      } else {
        state.checkedDetectionIds.delete(item.id);
      }
      render();
    });
    checkboxCell.appendChild(checkbox);

    const detectIdCell = document.createElement("td");
    detectIdCell.className = "number-cell detect-id-cell";
    detectIdCell.textContent = item.detectId.toLocaleString("ko-KR");

    const scheduleIdCell = document.createElement("td");
    scheduleIdCell.textContent = item.scheduleId || "-";

    const dbNameCell = document.createElement("td");
    dbNameCell.textContent = item.dbName;

    const pathCell = document.createElement("td");
    pathCell.innerHTML = `<span class="path-text">${item.path}</span>`;

    const typeCell = document.createElement("td");
    typeCell.textContent = item.detectType;

    const countCell = document.createElement("td");
    countCell.className = "number-cell";
    countCell.textContent = item.count.toLocaleString("ko-KR");

    const assigneeCell = document.createElement("td");
    assigneeCell.title = item.assignees.join(", ");
    assigneeCell.textContent = formatAssignees(item.assignees);

    const statusCell = document.createElement("td");
    statusCell.appendChild(createStatusChip(item.status));

    row.append(checkboxCell, detectIdCell, scheduleIdCell, dbNameCell, pathCell, typeCell, countCell, assigneeCell, statusCell);
    row.addEventListener("click", () => {
      state.selectedDetectionId = item.id;
      syncEditorDraft();
      syncPiiSelectionState(true);
      render();
    });
    refs.detectionTableBody.appendChild(row);
  });

  const allSelectedOnPage = items.length > 0 && items.every((item) => state.checkedDetectionIds.has(item.id));
  const checkedCountInFiltered = all.filter((item) => state.checkedDetectionIds.has(item.id)).length;
  refs.selectAllDetections.checked = allSelectedOnPage;
  refs.selectAllDetections.indeterminate = !allSelectedOnPage && items.some((item) => state.checkedDetectionIds.has(item.id));
  refs.detectionPageSizeSelect.value = String(state.pagination.detectionPageSize);
  refs.detectionSelectionBannerBody.hidden = !(allSelectedOnPage && checkedCountInFiltered > 0 && checkedCountInFiltered < all.length);
  if (!refs.detectionSelectionBannerBody.hidden) {
    const row = document.createElement("tr");
    row.className = "selection-banner-row";
    const cell = document.createElement("td");
    cell.colSpan = 9;
    cell.innerHTML = `페이지에서 ${items.length}개가 선택되었습니다. <button type="button" class="text-btn selection-banner-link" id="selectAllFilteredDetections">목록에서 총 ${all.length}개 데이터 선택</button>`;
    row.appendChild(cell);
    refs.detectionSelectionBannerBody.appendChild(row);
  }
  refs.bulkEditButton.disabled = state.checkedDetectionIds.size === 0;
  refs.recheckButton.disabled = state.checkedDetectionIds.size === 0;
  refs.deleteButton.disabled = state.checkedDetectionIds.size === 0;
  refs.actionPlanButton.disabled = state.checkedDetectionIds.size === 0;
  refs.detectionSortIndicatorDbName.textContent = state.detectionSort.key === "dbName" ? (state.detectionSort.dir === "asc" ? "▲" : "▼") : "";
  refs.detectionSortIndicatorPath.textContent = state.detectionSort.key === "path" ? (state.detectionSort.dir === "asc" ? "▲" : "▼") : "";
  refs.detectionSortIndicatorDetectType.textContent = state.detectionSort.key === "detectType" ? (state.detectionSort.dir === "asc" ? "▲" : "▼") : "";
  refs.detectionSortIndicatorCount.textContent = state.detectionSort.key === "count" ? (state.detectionSort.dir === "asc" ? "▲" : "▼") : "";
  refs.detectionSortIndicatorAssignees.textContent = state.detectionSort.key === "assignees" ? (state.detectionSort.dir === "asc" ? "▲" : "▼") : "";
  refs.detectionSortIndicatorStatus.textContent = state.detectionSort.key === "status" ? (state.detectionSort.dir === "asc" ? "▲" : "▼") : "";
  refs.detectionToolbarCaption.innerHTML = all.length
    ? `<span class="toolbar-caption-strong">전체 ${all.length}건</span> <span class="toolbar-caption-highlight">${Math.min((state.pagination.detectionPage - 1) * state.pagination.detectionPageSize + 1, all.length)} - ${Math.min(state.pagination.detectionPage * state.pagination.detectionPageSize, all.length)} 표시됨</span>${checkedCountInFiltered > 0 ? ` <span class="toolbar-caption-selected">${checkedCountInFiltered}건 선택됨</span>` : ""}`
    : '<span class="toolbar-caption-strong">전체 0건</span> <span class="toolbar-caption-highlight">0 - 0 표시됨</span>';
  renderPagination(refs.detectionPagination, all.length, state.pagination.detectionPageSize, state.pagination.detectionPage, (page) => {
    state.pagination.detectionPage = page;
    render();
  });
}

function positionFilterPopover() {
  const rect = refs.toggleFilterButton.getBoundingClientRect();
  refs.filterModal.style.top = `${rect.bottom + 8}px`;
  refs.filterModal.style.left = `${Math.max(12, Math.min(rect.left, window.innerWidth - refs.filterModal.offsetWidth - 12))}px`;
}

function isDetectionFiltered() {
  return Boolean(
    state.detectionFilters.query ||
      state.detectionFilters.detectTypes.length ||
      state.detectionFilters.assignees.length ||
      state.detectionFilters.statuses.length
  );
}

function buildDetectionFilterSummary() {
  const parts = [];
  if (state.detectionFilters.query) {
    parts.push(`검색 "${state.detectionFilters.query}"`);
  }
  if (state.detectionFilters.detectTypes.length) {
    parts.push(formatFilterList("검출타입", state.detectionFilters.detectTypes));
  }
  if (state.detectionFilters.assignees.length) {
    parts.push(formatFilterList("담당자", state.detectionFilters.assignees));
  }
  if (state.detectionFilters.statuses.length) {
    const labels = state.detectionFilters.statuses.map((status) => STATUS_META[status]?.label ?? status);
    parts.push(formatFilterList("상태", labels));
  }
  return parts.length ? parts.join(" · ") : "필터 적용됨";
}

function formatFilterList(label, values, max = 2) {
  if (!values.length) {
    return label;
  }
  if (values.length <= max) {
    return `${label} ${values.join(", ")}`;
  }
  return `${label} ${values.slice(0, max).join(", ")} 외 ${values.length - max}`;
}

function formatAssignees(assignees) {
  if (assignees.length <= 2) {
    return assignees.join(", ");
  }
  return `${assignees.slice(0, 2).join(", ")} ...`;
}

function createStatusChip(status) {
  const chip = document.createElement("span");
  chip.className = `status-chip ${STATUS_META[status].className}`;
  chip.textContent = STATUS_META[status].label;
  return chip;
}

function getSelectedDetection() {
  return service.findDetectionById(state.selectedDetectionId);
}

function syncSelectionState() {
  const filtered = getFilteredDetections();
  const maxPage = Math.max(1, Math.ceil(filtered.length / state.pagination.detectionPageSize));
  const previousId = state.selectedDetectionId;
  if (state.pagination.detectionPage > maxPage) {
    state.pagination.detectionPage = maxPage;
  }
  if (!filtered.some((item) => item.id === state.selectedDetectionId)) {
    state.selectedDetectionId = null;
  }
  syncEditorDraft(previousId !== state.selectedDetectionId);
  syncPiiSelectionState();
}

function syncEditorDraft(force = false) {
  const detection = getSelectedDetection();
  const nextSourceId = detection?.id ?? null;
  if (!force && state.editorDraftSourceId === nextSourceId) {
    return;
  }
  state.editorDraft = {
    status: detection?.status ?? null,
    comment: detection?.comment ?? "",
    assignees: [...(detection?.assignees ?? [])],
  };
  state.editorDraftSourceId = nextSourceId;
}

function renderStatusButtons() {
  refs.statusGrid.innerHTML = "";
  STATUS_ORDER.forEach((status) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "status-option";
    button.textContent = STATUS_META[status].label;
    button.disabled = !getSelectedDetection() || !isStatusAllowedForRole(status, state.role);
    button.classList.toggle("is-selected", state.editorDraft.status === status);
    button.addEventListener("click", () => {
      state.editorDraft.status = status;
      render();
    });
    refs.statusGrid.appendChild(button);
  });
}

function renderStatusCardHeader() {
  const detection = getSelectedDetection();
  refs.statusChangedAt.textContent = `상태변경일시 ${formatDateTime(detection?.statusChangedAt)}`;
  refs.historyButton.disabled = !detection;
}

function renderEditor() {
  const detection = getSelectedDetection();
  if (!detection) {
    refs.editorSummary.innerHTML = `<strong>검출목록에서 1건을 선택하세요</strong><span class="subtle-text">선택된 검출건의 상태, 의견, 담당자를 수정할 수 있습니다.</span>`;
    refs.commentInput.value = "";
    refs.commentInput.disabled = true;
    refs.assigneePickerTrigger.disabled = true;
    refs.saveButton.disabled = true;
    refs.commentCount.textContent = "0 / 500";
    return;
  }

  refs.editorSummary.innerHTML = `
    <div class="summary-head">
      <span class="subtle-text">${detection.path}</span>
    </div>
    <div class="summary-meta">
      <strong>${detection.detectType}</strong>
      <span class="summary-mini">검출 ${detection.count.toLocaleString("ko-KR")}건</span>
    </div>
  `;
  refs.commentInput.disabled = false;
  refs.assigneePickerTrigger.disabled = false;
  refs.commentInput.value = state.editorDraft.comment;
  refs.commentCount.textContent = `${state.editorDraft.comment.length} / 500`;
  renderAssigneeTrigger();
  refs.saveButton.disabled = !hasEditorChanges();
  renderAssigneeOptions();
}

function renderAssigneeOptions() {
  const query = state.assigneeSearch.toLowerCase();
  refs.assigneeOptions.innerHTML = "";
  ASSIGNEES.filter((name) => !query || name.toLowerCase().includes(query)).forEach((name) => {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "picker-option";
    option.textContent = name;
    option.classList.toggle("is-selected", state.editorDraft.assignees.includes(name));
    option.addEventListener("click", () => {
      if (state.editorDraft.assignees.includes(name)) {
        state.editorDraft.assignees = state.editorDraft.assignees.filter((item) => item !== name);
      } else {
        state.editorDraft.assignees = [...state.editorDraft.assignees, name];
      }
      renderAssigneeTrigger();
      renderAssigneeOptions();
      refs.saveButton.disabled = !hasEditorChanges();
    });
    refs.assigneeOptions.appendChild(option);
  });
}

function renderAssigneeTrigger() {
  if (!state.editorDraft.assignees.length) {
    refs.assigneePickerTrigger.classList.remove("has-selection");
    refs.assigneePickerTrigger.textContent = "담당자를 선택하세요";
    return;
  }
  refs.assigneePickerTrigger.classList.add("has-selection");
  refs.assigneePickerTrigger.innerHTML = `
    <span class="filter-chip-list">
      ${state.editorDraft.assignees
        .map(
          (name) =>
            `<span class="filter-chip">${escapeHtml(name)}<span class="filter-chip-remove" data-assignee-remove="${escapeHtml(name)}">×</span></span>`
        )
        .join("")}
    </span>
  `;
}

function hasEditorChanges() {
  const detection = getSelectedDetection();
  if (!detection) {
    return false;
  }
  return (
    detection.status !== state.editorDraft.status ||
    (detection.comment || "") !== state.editorDraft.comment ||
    !areStringArraysEqual(detection.assignees ?? [], state.editorDraft.assignees)
  );
}

function isStatusAllowedForRole(status, role) {
  return service.isStatusAllowedForRole(status, role);
}

function handleSave() {
  const detection = getSelectedDetection();
  if (!detection) {
    return;
  }
  const isExclusionRequest = state.editorDraft.status === "EXCLUSION_REQUESTED";
  service.updateDetection(detection.id, {
    status: state.editorDraft.status,
    comment: state.editorDraft.comment,
    assignees: state.editorDraft.assignees,
    actor: getCurrentActor(),
  });
  render();
  pushToast(isExclusionRequest ? "제외신청 상태가 저장되었습니다." : "검출결과 상태 정보가 저장되었습니다.", "success");
}

function getCurrentActor() {
  return state.role === "admin" ? "관리자" : "일반사용자";
}

function formatDateTime(value) {
  if (!value) {
    return "-";
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  const pad = (number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function areStringArraysEqual(left, right) {
  if (left.length !== right.length) {
    return false;
  }
  return left.every((value, index) => value === right[index]);
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const helper = document.createElement("textarea");
  helper.value = text;
  helper.setAttribute("readonly", "readonly");
  helper.style.position = "fixed";
  helper.style.top = "-9999px";
  document.body.appendChild(helper);
  helper.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(helper);
  if (!copied) {
    throw new Error("copy failed");
  }
}

function getSelectedPiiSet() {
  return service.getPiiRecords(state.selectedDetectionId);
}

function getFilteredPii() {
  return service.getFilteredPii(state.selectedDetectionId, state.piiFilters);
}

function syncPiiSelectionState(forceReset = false) {
  if (!state.selectedDetectionId) {
    state.selectedPiiId = null;
    return;
  }
  const filtered = getFilteredPii();
  const maxPage = Math.max(1, Math.ceil(filtered.length / state.pagination.piiPageSize));
  if (state.pagination.piiPage > maxPage) {
    state.pagination.piiPage = maxPage;
  }
  if (forceReset || !filtered.some((item) => item.id === state.selectedPiiId)) {
    state.selectedPiiId = filtered[0]?.id ?? null;
  }
}

function getPiiPageItems() {
  const items = getFilteredPii();
  const start = (state.pagination.piiPage - 1) * state.pagination.piiPageSize;
  return {
    all: items,
    items: items.slice(start, start + state.pagination.piiPageSize),
  };
}

function renderPiiTable() {
  syncPiiSelectionState();
  const { all, items } = getPiiPageItems();
  refs.piiTableBody.innerHTML = "";
  refs.piiEmpty.hidden = all.length > 0;
  refs.piiFilterSummary.hidden = !state.piiFilters.query;
  if (!refs.piiFilterSummary.hidden) {
    refs.piiFilterBadge.textContent = `검색 "${state.piiFilters.query}"`;
  }

  items.forEach((item) => {
    const row = document.createElement("tr");
    row.className = "clickable-row";
    if (item.id === state.selectedPiiId) {
      row.classList.add("is-selected");
    }

    const valueCell = document.createElement("td");
    valueCell.innerHTML = `<span class="path-text">${item.value}</span>`;
    const countCell = document.createElement("td");
    countCell.className = "number-cell";
    countCell.textContent = item.count.toLocaleString("ko-KR");
    row.append(valueCell, countCell);
    row.addEventListener("click", () => {
      state.selectedPiiId = item.id;
      render();
    });
    refs.piiTableBody.appendChild(row);
  });

  refs.piiPaginationCaption.textContent = all.length
    ? `${Math.min((state.pagination.piiPage - 1) * state.pagination.piiPageSize + 1, all.length)}-${Math.min(state.pagination.piiPage * state.pagination.piiPageSize, all.length)} / ${all.length}건`
    : "0건";
  renderPagination(refs.piiPagination, all.length, state.pagination.piiPageSize, state.pagination.piiPage, (page) => {
    state.pagination.piiPage = page;
    render();
  });
  refs.sortIndicatorValue.textContent = state.piiFilters.sortKey === "value" ? (state.piiFilters.sortDir === "asc" ? "▲" : "▼") : "";
  refs.sortIndicatorCount.textContent = state.piiFilters.sortKey === "count" ? (state.piiFilters.sortDir === "asc" ? "▲" : "▼") : "";
}

function getSelectedPii() {
  return service.findPiiRecord(state.selectedDetectionId, state.selectedPiiId);
}

function renderPiiDetail() {
  const record = getSelectedPii();
  const detection = getSelectedDetection();
  refs.detailRecheckButton.disabled = !record || Boolean(record?.rechecked);
  refs.copyQueryButton.disabled = !record;
  refs.detailUnique.textContent = record?.uniqueValue ?? "-";
  refs.contextList.innerHTML = "";
  if (!record) {
    const li = document.createElement("li");
    li.textContent = "개인정보 목록에서 항목을 선택하면 검출내역이 표시됩니다.";
    refs.contextList.appendChild(li);
    return;
  }
  service.buildContextPreview(record, detection).forEach((line) => {
    const li = document.createElement("li");
    li.innerHTML = highlightDetectedValue(line, record.value);
    refs.contextList.appendChild(li);
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function highlightDetectedValue(line, detectedValue) {
  const escapedLine = escapeHtml(line);
  const escapedValue = escapeHtml(detectedValue);
  return escapedLine.split(escapedValue).join(`<span class="detected-token">${escapedValue}</span>`);
}

function renderBulkStatusButtons() {
  refs.bulkStatusGrid.innerHTML = "";
  STATUS_ORDER.forEach((status) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "bulk-status-option";
    button.textContent = STATUS_META[status].label;
    button.disabled = !isStatusAllowedForRole(status, state.role);
    button.classList.toggle("is-selected", state.bulkEditDraft.status === status);
    button.addEventListener("click", () => {
      state.bulkEditDraft.status = status;
      renderBulkModal();
    });
    refs.bulkStatusGrid.appendChild(button);
  });
}

function renderBulkModal() {
  refs.bulkModal.hidden = !state.bulkEditDraft.open;
  refs.bulkSelectionCaption.textContent = `선택된 ${state.checkedDetectionIds.size}건에 대해 필요한 항목만 일괄 반영합니다.`;
  refs.bulkStatusEnabled.checked = state.bulkEditDraft.statusEnabled;
  refs.bulkCommentEnabled.checked = state.bulkEditDraft.commentEnabled;
  refs.bulkAssigneeEnabled.checked = state.bulkEditDraft.assigneeEnabled;
  refs.bulkCommentInput.value = state.bulkEditDraft.comment;
  refs.bulkCommentInput.disabled = !state.bulkEditDraft.commentEnabled;
  refs.bulkAssigneeSelect.value = state.bulkEditDraft.assignee;
  refs.bulkAssigneeSelect.disabled = !state.bulkEditDraft.assigneeEnabled;
  renderBulkStatusButtons();
  [...refs.bulkStatusGrid.querySelectorAll("button")].forEach((button, index) => {
    button.disabled = !state.bulkEditDraft.statusEnabled || !isStatusAllowedForRole(STATUS_ORDER[index], state.role);
  });
  refs.bulkApplyButton.disabled =
    state.checkedDetectionIds.size === 0 ||
    (!state.bulkEditDraft.statusEnabled && !state.bulkEditDraft.commentEnabled && !state.bulkEditDraft.assigneeEnabled);
}

function applyBulkEdit() {
  if (state.checkedDetectionIds.size === 0) {
    return;
  }
  const isExclusionRequest = state.bulkEditDraft.statusEnabled && state.bulkEditDraft.status === "EXCLUSION_REQUESTED";
  service.applyBulkEdit([...state.checkedDetectionIds], {
    ...state.bulkEditDraft,
    actor: getCurrentActor(),
  });
  state.bulkEditDraft = {
    open: false,
    statusEnabled: false,
    status: null,
    commentEnabled: false,
    comment: "",
    assigneeEnabled: false,
    assignee: "",
  };
  syncEditorDraft();
  render();
  pushToast(isExclusionRequest ? "선택 항목 제외신청이 완료되었습니다." : "선택 항목 일괄수정이 완료되었습니다.", "success");
}

function handleActionPlanCreate() {
  const selected = [...state.checkedDetectionIds]
    .map((id) => service.findDetectionById(id))
    .filter(Boolean);

  if (!selected.length) {
    pushToast("조치계획 대상 검출 항목을 선택하세요.", "danger");
    return;
  }
  const invalid = selected.filter((item) => item.status !== "ACTION_REQUIRED");
  if (invalid.length) {
    pushToast("조치필요 상태만 조치계획 작성이 가능합니다.", "danger");
    return;
  }

  const targetName = (state.routeContext.targetName || refs.detectionHeroTarget?.textContent || "").trim();
  sessionStorage.setItem("dguard.actionPlanSelection", JSON.stringify(selected.map((item) => item.id)));
  if (targetName) {
    sessionStorage.setItem("dguard.actionPlanTarget", targetName);
  }
  window.location.href = "action-plan-create.html";
}

function renderDeleteModal() {
  refs.deleteModal.hidden = !state.deleteModalOpen;
  refs.deleteCaption.textContent = `선택한 ${state.checkedDetectionIds.size}건을 검출목록에서 삭제하시겠습니까?`;
}

function renderHistoryModal() {
  const detection = getSelectedDetection();
  const history = detection?.changeHistory ?? [];
  refs.historyModal.hidden = !state.historyModalOpen || !detection;
  refs.historyTableBody.innerHTML = "";
  refs.historyEmpty.hidden = history.length > 0;

  history.forEach((entry) => {
    const row = document.createElement("tr");

    const changedAtCell = document.createElement("td");
    changedAtCell.textContent = formatDateTime(entry.changedAt);

    const actorCell = document.createElement("td");
    actorCell.textContent = entry.actor || "-";

    const statusCell = document.createElement("td");
    statusCell.textContent = STATUS_META[entry.status]?.label ?? entry.status ?? "-";

    const commentCell = document.createElement("td");
    commentCell.textContent = entry.comment || "-";

    const assigneeCell = document.createElement("td");
    assigneeCell.textContent = entry.assignees?.length ? entry.assignees.join(", ") : "-";

    row.append(changedAtCell, actorCell, statusCell, commentCell, assigneeCell);
    refs.historyTableBody.appendChild(row);
  });
}

function applyDelete() {
  const selectedIds = [...state.checkedDetectionIds];
  if (selectedIds.length === 0) {
    return;
  }
  service.deleteDetections(selectedIds);
  state.checkedDetectionIds.clear();
  state.deleteModalOpen = false;
  syncSelectionState();
  render();
  pushToast("선택 항목을 삭제했습니다.", "danger");
}

const shared = window.DGuardShared;

function getSidebarMenu(role = state.role) {
  return shared.getSidebarMenu(role);
}

function getDefaultMenuKey(role = state.role) {
  return shared.getDefaultMenuKey(role);
}

function renderSidebar() {
  const normalized = shared.renderSidebar({
    container: refs.sidebarNav,
    role: state.role,
    selectedMenuKey: state.selectedMenuKey,
    openSidebarGroupKey: state.openSidebarGroupKey,
  });
  state.selectedMenuKey = normalized.selectedMenuKey;
  state.openSidebarGroupKey = normalized.openSidebarGroupKey;
}

function renderPagination(container, totalItems, pageSize, currentPage, onClick) {
  shared.renderPagination(container, totalItems, pageSize, currentPage, onClick);
}

function pushToast(message, type = "default") {
  const toast = document.createElement("div");
  toast.className = `toast ${type === "default" ? "" : `is-${type}`}`.trim();
  toast.textContent = message;
  refs.toastStack.appendChild(toast);
  window.setTimeout(() => {
    toast.remove();
  }, 2600);
}
