const shared = window.DGuardShared;
const actionPlanService = window.MockActionPlanService;

const refs = {};
let sidebarController;
let userMenuController;

const state = {
  role: "admin",
  sidebarCollapsed: false,
  selectedMenuKey: "action-plan",
  openSidebarGroupKey: null,
  userMenuOpen: false,
  query: "",
  filters: {
    statuses: [],
    draftStatuses: [],
    panelOpen: false,
  },
  filterUi: {
    openKey: null,
    statusSearch: "",
  },
  pagination: {
    page: 1,
    pageSize: 5,
  },
  detail: {
    open: false,
    planId: null,
  },
};

document.addEventListener("DOMContentLoaded", init);

function init() {
  cacheRefs();
  sidebarController = shared.initSidebar({
    sidebarNav: refs.sidebarNav,
    sidebarToggle: refs.sidebarToggle,
    roleButtons: refs.roleButtons,
    getState: () => state,
    onRoleChange: (nextRole) => {
      state.selectedMenuKey = "action-plan";
      state.openSidebarGroupKey = null;
      state.userMenuOpen = false;
      state.detail.open = false;
      state.detail.planId = null;
      state.pagination.page = 1;
      pushToast(`역할이 ${nextRole === "admin" ? "관리자" : "일반사용자"}로 변경되었습니다.`);
      render();
    },
    onRender: render,
  });
  userMenuController = shared.initUserMenu({
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
    "planSearchInput",
    "planToolbarCaption",
    "planFilterSummary",
    "planFilterBadge",
    "clearPlanFilters",
    "togglePlanFilterButton",
    "planFilterModal",
    "planStatusFilterSelect",
    "planStatusFilterTrigger",
    "planStatusFilterPanel",
    "planStatusFilterSearch",
    "planStatusFilterList",
    "cancelPlanFilterButton",
    "applyPlanFilterButton",
    "noteSendButton",
    "planTableBody",
    "planEmpty",
    "planPagination",
    "planPageSizeSelect",
    "planDetailModal",
    "planDetailTitle",
    "planDetailSubtitle",
    "planDetailMethod",
    "planDetailDueDate",
    "planTargetDetailBody",
    "planTargetDetailEmpty",
    "planUploadInput",
    "planUploadList",
    "planDownloadButton",
    "planRecheckButton",
    "toastStack",
  ];
  ids.forEach((id) => {
    refs[id] = document.getElementById(id);
  });
  refs.sidebarNav = document.querySelector(".sidebar-nav");
  refs.roleButtons = [...document.querySelectorAll(".role-btn")];
}

function bindEvents() {
  refs.planSearchInput.addEventListener("input", (event) => {
    state.query = event.target.value.trim();
    state.pagination.page = 1;
    render();
  });

  refs.clearPlanFilters.addEventListener("click", () => {
    state.query = "";
    refs.planSearchInput.value = "";
    state.filters.statuses = [];
    state.filters.draftStatuses = [];
    state.filterUi.statusSearch = "";
    state.pagination.page = 1;
    render();
  });

  refs.togglePlanFilterButton.addEventListener("click", () => {
    const shouldOpen = !state.filters.panelOpen;
    state.filters.panelOpen = shouldOpen;
    state.filterUi.openKey = null;
    if (shouldOpen) {
      state.filters.draftStatuses = [...state.filters.statuses];
      state.filterUi.statusSearch = "";
    } else {
      state.filters.draftStatuses = [...state.filters.statuses];
      state.filterUi.statusSearch = "";
    }
    render();
  });

  refs.cancelPlanFilterButton.addEventListener("click", () => {
    state.filters.panelOpen = false;
    state.filterUi.openKey = null;
    state.filters.draftStatuses = [...state.filters.statuses];
    state.filterUi.statusSearch = "";
    render();
  });

  refs.applyPlanFilterButton.addEventListener("click", () => {
    state.filters.statuses = [...state.filters.draftStatuses];
    state.filters.panelOpen = false;
    state.filterUi.openKey = null;
    state.filterUi.statusSearch = "";
    state.pagination.page = 1;
    render();
  });

  bindStatusFilter();

  refs.planPageSizeSelect.addEventListener("change", (event) => {
    const nextSize = Number.parseInt(event.target.value, 10);
    if (!Number.isFinite(nextSize)) {
      return;
    }
    state.pagination.pageSize = nextSize;
    state.pagination.page = 1;
    render();
  });

  refs.noteSendButton.addEventListener("click", () => {
    if (state.role !== "admin") {
      return;
    }
    const overdue = actionPlanService.getOverduePlans();
    if (!overdue.length) {
      pushToast("쪽지 발송 대상이 없습니다.");
      return;
    }
    pushToast(`조치예정일이 지난 ${overdue.length}건에 쪽지를 발송했습니다.`, "success");
  });

  refs.planDownloadButton.addEventListener("click", () => {
    if (!state.detail.planId) {
      return;
    }
    pushToast("조치계획서 다운로드가 시작되었습니다.", "success");
  });

  refs.planRecheckButton.addEventListener("click", () => {
    if (!state.detail.planId) {
      return;
    }
    const result = actionPlanService.recheckPlan(state.detail.planId);
    if (!result.ok) {
      pushToast("이행점검 처리에 실패했습니다.", "danger");
      return;
    }
    render();
    pushToast(result.completed ? "모든 검출경로가 0건으로 조치 완료되었습니다." : "이행점검이 완료되었습니다.", "success");
  });

  refs.planUploadInput.addEventListener("change", (event) => {
    if (!state.detail.planId) {
      return;
    }
    const files = [...event.target.files];
    if (!files.length) {
      return;
    }
    const { added, rejected } = actionPlanService.addAttachments(state.detail.planId, files);
    if (added.length) {
      pushToast(`${added.length}개 파일이 업로드되었습니다.`, "success");
    }
    if (rejected.length) {
      pushToast("PDF 파일만 업로드할 수 있습니다.", "danger");
    }
    refs.planUploadInput.value = "";
    render();
  });

  document.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", () => {
      closeDetailModal();
      render();
    });
  });

  refs.planDetailModal.addEventListener("click", (event) => {
    if (event.target === refs.planDetailModal) {
      closeDetailModal();
      render();
    }
  });

  document.addEventListener("click", (event) => {
    userMenuController?.handleDocumentClick(event);
    if (state.filters.panelOpen) {
      const insideFilterSelect = event.target.closest(".filter-select");
      const insideFilterModal = event.target.closest("#planFilterModal .filter-popover-card");
      const onFilterButton = event.target.closest("#togglePlanFilterButton");
      if (!insideFilterModal && !onFilterButton) {
        state.filters.panelOpen = false;
        state.filterUi.openKey = null;
        state.filters.draftStatuses = [...state.filters.statuses];
        state.filterUi.statusSearch = "";
        render();
        return;
      }
      if (insideFilterModal && !insideFilterSelect) {
        state.filterUi.openKey = null;
        renderStatusFilterPanels();
      }
    }
  });
}

function bindStatusFilter() {
  refs.planStatusFilterTrigger.addEventListener("click", (event) => {
    const removeButton = event.target.closest(".filter-chip-remove");
    if (removeButton) {
      event.stopPropagation();
      removeFilterDraftValue(removeButton.dataset.filterValue);
      return;
    }
    state.filterUi.openKey = state.filterUi.openKey === "statuses" ? null : "statuses";
    renderStatusFilterPanels();
  });

  refs.planStatusFilterSearch.addEventListener("input", (event) => {
    state.filterUi.statusSearch = event.target.value.trim();
    renderStatusFilterControls();
  });

  refs.planStatusFilterList.addEventListener("change", (event) => {
    if (!(event.target instanceof HTMLInputElement) || event.target.type !== "checkbox") {
      return;
    }
    const checkedValues = [...refs.planStatusFilterList.querySelectorAll("input[type='checkbox']:checked")].map(
      (input) => input.value
    );
    state.filters.draftStatuses = checkedValues;
    renderStatusFilterControls();
  });
}

function closeDetailModal() {
  state.detail.open = false;
  state.detail.planId = null;
}

function getCurrentActor() {
  return state.role === "admin" ? "관리자" : "김성진";
}

function getFilteredPlans() {
  const plans = actionPlanService.getPlans({
    role: state.role,
    actor: getCurrentActor(),
    query: state.query,
  });
  const filtered = plans.filter((plan) => {
    if (!state.filters.statuses.length) {
      return true;
    }
    return state.filters.statuses.includes(plan.status);
  });
  return filtered.sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

function getPageItems() {
  const all = getFilteredPlans();
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

function render() {
  sidebarController?.render();
  userMenuController?.render();
  refs.noteSendButton.hidden = state.role !== "admin";
  renderTable();
  renderFilterSummary();
  renderStatusFilterControls();
  renderDetailModal();
}

function renderStatusFilterControls() {
  refs.planFilterModal.hidden = !state.filters.panelOpen;
  if (state.filters.panelOpen) {
    positionFilterPopover();
  }
  refs.planStatusFilterSearch.value = state.filterUi.statusSearch;
  renderFilterSelect(
    "statuses",
    refs.planStatusFilterTrigger,
    refs.planStatusFilterList,
    Object.entries(actionPlanService.STATUS_META).map(([key, meta]) => ({ value: key, label: meta.label })),
    state.filters.draftStatuses,
    state.filterUi.statusSearch
  );
  renderStatusFilterPanels();
}

function renderTable() {
  const { all, items } = getPageItems();
  refs.planTableBody.innerHTML = "";
  refs.planEmpty.hidden = all.length > 0;

  items.forEach((plan) => {
    const row = document.createElement("tr");

    const idCell = document.createElement("td");
    idCell.textContent = plan.id;

    const statusCell = document.createElement("td");
    const statusMeta = actionPlanService.STATUS_META[plan.status];
    statusCell.className = "status-cell";
    statusCell.innerHTML = `<span class="status-chip ${statusMeta?.className ?? ""}">${statusMeta?.label ?? plan.status}</span>`;

    const createdAtCell = document.createElement("td");
    createdAtCell.textContent = formatDateTime(plan.createdAt);

    const creatorCell = document.createElement("td");
    creatorCell.textContent = plan.createdBy;

    const dbCell = document.createElement("td");
    dbCell.innerHTML = `<span class="path-text">${escapeHtml(plan.dbName)}</span>`;

    const countCell = document.createElement("td");
    countCell.className = "number-cell";
    countCell.textContent = plan.targets.length.toLocaleString("ko-KR");

    const dueCell = document.createElement("td");
    dueCell.textContent = plan.dueDate || "-";

    const methodCell = document.createElement("td");
    methodCell.textContent = plan.method || "-";

    const recheckCell = document.createElement("td");
    recheckCell.className = "number-cell";
    recheckCell.textContent = actionPlanService.getRecheckTotal(plan).toLocaleString("ko-KR");

    row.append(
      idCell,
      statusCell,
      createdAtCell,
      creatorCell,
      dbCell,
      countCell,
      dueCell,
      methodCell,
      recheckCell
    );

    row.addEventListener("click", () => {
      state.detail.planId = plan.id;
      state.detail.open = true;
      render();
    });

    refs.planTableBody.appendChild(row);
  });

  refs.planToolbarCaption.innerHTML = all.length
    ? `<span class="toolbar-caption-strong">전체 ${all.length}건</span> <span class="toolbar-caption-highlight">${Math.min((state.pagination.page - 1) * state.pagination.pageSize + 1, all.length)} - ${Math.min(state.pagination.page * state.pagination.pageSize, all.length)} 표시됨</span>`
    : '<span class="toolbar-caption-strong">전체 0건</span> <span class="toolbar-caption-highlight">0 - 0 표시됨</span>';

  shared.renderPagination(refs.planPagination, all.length, state.pagination.pageSize, state.pagination.page, (page) => {
    state.pagination.page = page;
    render();
  });
}

function renderFilterSummary() {
  const hasQuery = Boolean(state.query);
  const hasStatuses = state.filters.statuses.length > 0;
  refs.planFilterSummary.hidden = !(hasQuery || hasStatuses);
  if (refs.planFilterSummary.hidden) {
    return;
  }
  const parts = [];
  if (hasQuery) {
    parts.push(`검색 "${state.query}"`);
  }
  if (hasStatuses) {
    const labels = state.filters.statuses.map((status) => actionPlanService.STATUS_META[status]?.label ?? status);
    parts.push(`상태 ${labels.join(", ")}`);
  }
  refs.planFilterBadge.textContent = parts.join(" · ") || "필터 적용됨";
}

function renderStatusFilterPanels() {
  const isOpen = state.filterUi.openKey === "statuses" && state.filters.panelOpen;
  refs.planStatusFilterPanel.hidden = !isOpen;
}

function positionFilterPopover() {
  const rect = refs.togglePlanFilterButton.getBoundingClientRect();
  refs.planFilterModal.style.top = `${rect.bottom + 8}px`;
  refs.planFilterModal.style.left = `${Math.max(12, Math.min(rect.left, window.innerWidth - refs.planFilterModal.offsetWidth - 12))}px`;
}

function renderFilterSelect(key, trigger, container, items, selectedValues, searchQuery) {
  trigger.classList.toggle("has-selection", selectedValues.length > 0);
  if (selectedValues.length) {
    const labelMap = new Map(items.map((item) => [item.value, item.label]));
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
    .filter((item) => !normalizedQuery || item.label.toLowerCase().includes(normalizedQuery))
    .forEach((item) => {
      const label = document.createElement("label");
      label.className = "filter-option";
      const input = document.createElement("input");
      input.type = "checkbox";
      input.value = item.value;
      input.checked = selectedValues.includes(item.value);
      const text = document.createElement("span");
      text.textContent = item.label;
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

function removeFilterDraftValue(value) {
  state.filters.draftStatuses = state.filters.draftStatuses.filter((status) => status !== value);
  renderStatusFilterControls();
}

function renderDetailModal() {
  refs.planDetailModal.hidden = !state.detail.open;
  if (!state.detail.open || !state.detail.planId) {
    return;
  }
  const plan = actionPlanService.getPlanById(state.detail.planId);
  if (!plan) {
    return;
  }

  refs.planDetailTitle.textContent = `조치계획서 상세 (${plan.id})`;
  refs.planDetailSubtitle.textContent = `${plan.dbName} · 작성자 ${plan.createdBy}`;
  refs.planDetailMethod.textContent = plan.method || "-";
  refs.planDetailDueDate.textContent = plan.dueDate || "-";

  refs.planTargetDetailBody.innerHTML = "";
  refs.planTargetDetailEmpty.hidden = plan.targets.length > 0;
  plan.targets.forEach((target) => {
    const row = document.createElement("tr");

    const pathCell = document.createElement("td");
    pathCell.innerHTML = `<span class="path-text">${escapeHtml(target.path)}</span>`;

    const countCell = document.createElement("td");
    countCell.className = "number-cell";
    countCell.textContent = Number(target.count ?? 0).toLocaleString("ko-KR");

    const recheckAtCell = document.createElement("td");
    recheckAtCell.textContent = target.recheckAt ? formatDateTime(target.recheckAt) : "-";

    const recheckCountCell = document.createElement("td");
    recheckCountCell.className = "number-cell";
    recheckCountCell.textContent = Number(target.recheckResultCount ?? 0).toLocaleString("ko-KR");

    row.append(pathCell, countCell, recheckAtCell, recheckCountCell);
    refs.planTargetDetailBody.appendChild(row);
  });

  renderUploadList(plan.attachments);
}

function renderUploadList(files) {
  refs.planUploadList.innerHTML = "";
  if (!files.length) {
    const empty = document.createElement("div");
    empty.className = "file-row";
    empty.textContent = "업로드된 조치계획서가 없습니다.";
    refs.planUploadList.appendChild(empty);
    return;
  }

  files.forEach((file) => {
    const row = document.createElement("div");
    row.className = "file-row";

    const meta = document.createElement("div");
    meta.className = "file-meta";
    const name = document.createElement("strong");
    name.textContent = file.name;
    const info = document.createElement("span");
    info.textContent = `PDF · ${formatFileSize(file.size)}`;
    meta.append(name, info);

    row.appendChild(meta);
    refs.planUploadList.appendChild(row);
  });
}

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes)) {
    return "-";
  }
  if (bytes < 1024) {
    return `${bytes}B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)}KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
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
