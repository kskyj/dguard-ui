const targetService = window.MockInspectionTargetService;
const targetShared = window.DGuardShared;
const { STATUS_META, STATUS_ORDER } = targetService;

const refs = {};
let sidebarController;
let userMenuController;

const state = {
  role: "admin",
  sidebarCollapsed: false,
  selectedMenuKey: "inspection-target",
  openSidebarGroupKey: null,
  userMenuOpen: false,
  checkedTargetIds: new Set(),
  filters: {
    query: "",
    statuses: [],
    labelKeyword: "",
    panelOpen: false,
  },
  filterDraft: {
    statuses: [],
    labelKeyword: "",
  },
  filterUi: {
    openKey: null,
    statusesSearch: "",
  },
  sort: {
    key: "name",
    dir: "asc",
  },
  bulkLabel: {
    open: false,
    addLabels: [],
    removeLabels: [],
  },
};

document.addEventListener("DOMContentLoaded", init);

function init() {
  cacheRefs();
  sidebarController = targetShared.initSidebar({
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
  userMenuController = targetShared.initUserMenu({
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
  populateStaticControls();
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
    "summaryTotal",
    "summaryRunning",
    "summaryCompleted",
    "summaryFailed",
    "targetSearchInput",
    "toggleFilterButton",
    "targetFilterSummary",
    "filterBadgeText",
    "clearFiltersButton",
    "bulkLabelButton",
    "startInspectionButton",
    "exportButton",
    "selectAllTargets",
    "targetTableBody",
    "targetEmpty",
    "listCaption",
    "targetFilterModal",
    "statusFilterTrigger",
    "statusFilterPanel",
    "statusFilterSearch",
    "statusFilterList",
    "labelKeywordInput",
    "cancelFilterButton",
    "applyFilterButton",
    "bulkLabelModal",
    "bulkLabelSelectionCaption",
    "selectedLabelSummary",
    "bulkAddLabelInput",
    "addLabelTokenButton",
    "bulkAddLabelTokens",
    "bulkRemoveLabelInput",
    "removeLabelTokenButton",
    "bulkRemoveLabelTokens",
    "labelSuggestionList",
    "closeLabelModalButton",
    "applyLabelModalButton",
    "sortIndicatorId",
    "sortIndicatorName",
    "sortIndicatorDbType",
    "sortIndicatorSearchCount",
    "sortIndicatorStatus",
    "sortIndicatorTableCount",
    "sortIndicatorDetectionCount",
    "sortIndicatorStartedAt",
    "sortIndicatorDuration",
    "toastStack",
  ];
  ids.forEach((id) => {
    refs[id] = document.getElementById(id);
  });
  refs.sidebarNav = document.querySelector(".sidebar-nav");
  refs.roleButtons = [...document.querySelectorAll(".role-btn")];
}

function bindEvents() {
  refs.targetSearchInput.addEventListener("input", (event) => {
    state.filters.query = event.target.value.trim();
    render();
  });

  refs.toggleFilterButton.addEventListener("click", () => {
    const shouldOpen = !state.filters.panelOpen;
    state.filters.panelOpen = shouldOpen;
    state.filterUi.openKey = null;
    if (shouldOpen) {
      state.filterDraft.statuses = [...state.filters.statuses];
      state.filterDraft.labelKeyword = state.filters.labelKeyword;
    }
    render();
  });

  refs.clearFiltersButton.addEventListener("click", () => {
    state.filters.query = "";
    state.filters.statuses = [];
    state.filters.labelKeyword = "";
    state.filterDraft.statuses = [];
    state.filterDraft.labelKeyword = "";
    state.filterUi.statusesSearch = "";
    refs.targetSearchInput.value = "";
    render();
  });

  bindStatusFilter();

  refs.cancelFilterButton.addEventListener("click", () => {
    state.filters.panelOpen = false;
    state.filterUi.openKey = null;
    render();
  });

  refs.applyFilterButton.addEventListener("click", () => {
    state.filters.statuses = [...state.filterDraft.statuses];
    state.filters.labelKeyword = state.filterDraft.labelKeyword.trim();
    state.filters.panelOpen = false;
    state.filterUi.openKey = null;
    render();
  });

  refs.selectAllTargets.addEventListener("change", (event) => {
    const checked = event.target.checked;
    getFilteredTargets().forEach((item) => {
      if (checked) {
        state.checkedTargetIds.add(item.id);
      } else {
        state.checkedTargetIds.delete(item.id);
      }
    });
    render();
  });

  refs.targetTableBody.addEventListener("change", (event) => {
    if (!(event.target instanceof HTMLInputElement) || event.target.type !== "checkbox") {
      return;
    }
    const id = event.target.dataset.targetId;
    if (!id) {
      return;
    }
    if (event.target.checked) {
      state.checkedTargetIds.add(id);
    } else {
      state.checkedTargetIds.delete(id);
    }
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
        state.sort.dir =
          key === "searchCount" || key === "recentDetectionCount" || key === "recentTableCount" ? "desc" : "asc";
      }
      render();
    });
  });

  refs.bulkLabelButton.addEventListener("click", () => {
    if (!state.checkedTargetIds.size) {
      pushToast("라벨 수정할 DB를 체크박스로 선택하세요.", "danger");
      return;
    }
    state.bulkLabel.open = true;
    state.bulkLabel.addLabels = [];
    state.bulkLabel.removeLabels = [];
    refs.bulkAddLabelInput.value = "";
    refs.bulkRemoveLabelInput.value = "";
    render();
  });

  refs.closeLabelModalButton.addEventListener("click", closeBulkLabelModal);
  refs.addLabelTokenButton.addEventListener("click", () => appendBulkLabel("add"));
  refs.removeLabelTokenButton.addEventListener("click", () => appendBulkLabel("remove"));

  refs.bulkAddLabelInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      appendBulkLabel("add");
    }
  });

  refs.bulkRemoveLabelInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      appendBulkLabel("remove");
    }
  });

  refs.labelSuggestionList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-label-value]");
    if (!button) {
      return;
    }
    const value = button.dataset.labelValue;
    if (!value || state.bulkLabel.addLabels.includes(value)) {
      return;
    }
    state.bulkLabel.addLabels = [...state.bulkLabel.addLabels, value];
    state.bulkLabel.removeLabels = state.bulkLabel.removeLabels.filter((label) => label !== value);
    renderBulkLabelModal();
  });

  refs.bulkAddLabelTokens.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-add-label]");
    if (!button) {
      return;
    }
    state.bulkLabel.addLabels = state.bulkLabel.addLabels.filter((label) => label !== button.dataset.removeAddLabel);
    renderBulkLabelModal();
  });

  refs.bulkRemoveLabelTokens.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-delete-label]");
    if (!button) {
      return;
    }
    state.bulkLabel.removeLabels = state.bulkLabel.removeLabels.filter((label) => label !== button.dataset.removeDeleteLabel);
    renderBulkLabelModal();
  });

  refs.applyLabelModalButton.addEventListener("click", () => {
    targetService.updateLabels([...state.checkedTargetIds], {
      addLabels: state.bulkLabel.addLabels,
      removeLabels: state.bulkLabel.removeLabels,
    });
    const selectionCount = state.checkedTargetIds.size;
    closeBulkLabelModal();
    render();
    pushToast(`선택한 ${selectionCount}대의 라벨을 반영했습니다.`, "success");
  });

  refs.startInspectionButton.addEventListener("click", () => {
    if (!state.checkedTargetIds.size) {
      pushToast("점검할 DB를 선택하세요.", "danger");
      return;
    }
    window.location.href = `./inspection-run.html?ids=${encodeURIComponent([...state.checkedTargetIds].join(","))}`;
  });

  refs.exportButton.addEventListener("click", () => {
    const rows = getFilteredTargets().filter((item) => state.checkedTargetIds.has(item.id));
    if (!rows.length) {
      pushToast("내보낼 DB를 선택하세요.", "danger");
      return;
    }
    downloadExcel(rows);
    pushToast(`선택한 ${rows.length}대 기준으로 Excel 파일을 생성했습니다.`, "success");
  });

  document.addEventListener("click", (event) => {
    userMenuController?.handleDocumentClick(event);

    if (state.filters.panelOpen) {
      const insideFilterSelect = event.target.closest(".filter-select");
      const insideFilterModal = event.target.closest("#targetFilterModal .filter-popover-card");
      const onFilterButton = event.target.closest("#toggleFilterButton");
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

    if (state.bulkLabel.open) {
      const insideModal = event.target.closest("#bulkLabelModal .modal-card");
      const onOpenButton = event.target.closest("#bulkLabelButton");
      if (!insideModal && !onOpenButton) {
        closeBulkLabelModal();
        render();
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
  refs.statusFilterTrigger.addEventListener("click", (event) => {
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

  refs.statusFilterSearch.addEventListener("input", (event) => {
    state.filterUi.statusesSearch = event.target.value.trim();
    renderFilterControls();
  });

  refs.statusFilterList.addEventListener("change", (event) => {
    if (!(event.target instanceof HTMLInputElement) || event.target.type !== "checkbox") {
      return;
    }
    state.filterDraft.statuses = [...refs.statusFilterList.querySelectorAll("input[type='checkbox']:checked")].map(
      (input) => input.value
    );
    renderFilterControls();
  });

  refs.labelKeywordInput.addEventListener("input", (event) => {
    state.filterDraft.labelKeyword = event.target.value;
  });
}

function populateStaticControls() {
  renderFilterControls();
}

function render() {
  sidebarController?.render();
  userMenuController?.render();
  refs.targetFilterModal.hidden = !state.filters.panelOpen;
  refs.targetFilterSummary.hidden = !isFiltered();
  refs.toggleFilterButton.classList.toggle("is-filtered", isFiltered());
  refs.bulkLabelModal.hidden = !state.bulkLabel.open;
  renderFilterControls();
  if (state.filters.panelOpen) {
    positionFilterPopover();
  }
  renderSortIndicators();
  renderSummary();
  renderTable();
  renderToolbarState();
  renderBulkLabelModal();
}

function renderSummary() {
  const summary = targetService.getSummary();
  refs.summaryTotal.textContent = summary.total.toLocaleString("ko-KR");
  refs.summaryRunning.textContent = summary.running.toLocaleString("ko-KR");
  refs.summaryCompleted.textContent = summary.completed.toLocaleString("ko-KR");
  refs.summaryFailed.textContent = summary.failed.toLocaleString("ko-KR");
}

function renderSortIndicators() {
  const indicatorMap = {
    id: refs.sortIndicatorId,
    name: refs.sortIndicatorName,
    dbType: refs.sortIndicatorDbType,
    searchCount: refs.sortIndicatorSearchCount,
    status: refs.sortIndicatorStatus,
    recentTableCount: refs.sortIndicatorTableCount,
    recentDetectionCount: refs.sortIndicatorDetectionCount,
    inspectionStartedAt: refs.sortIndicatorStartedAt,
    durationMinutes: refs.sortIndicatorDuration,
  };
  Object.entries(indicatorMap).forEach(([key, element]) => {
    element.textContent = state.sort.key === key ? (state.sort.dir === "asc" ? "▲" : "▼") : "";
  });
}

function renderToolbarState() {
  const selectedCount = state.checkedTargetIds.size;
  refs.bulkLabelButton.disabled = selectedCount === 0;
  refs.startInspectionButton.disabled = selectedCount === 0;
  refs.exportButton.disabled = selectedCount === 0;
  refs.filterBadgeText.textContent = buildFilterSummaryText();
}

function renderTable() {
  const items = getFilteredTargets();
  refs.targetTableBody.innerHTML = "";
  refs.targetEmpty.hidden = items.length > 0;

  items.forEach((item) => {
    const row = document.createElement("tr");
    row.classList.toggle("is-checked", state.checkedTargetIds.has(item.id));

    const checkboxCell = document.createElement("td");
    checkboxCell.className = "checkbox-cell";
    checkboxCell.innerHTML = `<input type="checkbox" data-target-id="${escapeHtml(item.id)}" ${
      state.checkedTargetIds.has(item.id) ? "checked" : ""
    } aria-label="${escapeHtml(item.name)} 선택">`;

    const idCell = document.createElement("td");
    idCell.className = "center-cell";
    idCell.textContent = item.id.toUpperCase();

    const nameCell = document.createElement("td");
    nameCell.innerHTML = `
      <div class="db-name-cell">
        <a class="db-link" href="./inspection-target-detail.html?dbId=${encodeURIComponent(item.id)}">${escapeHtml(item.name)}</a>
        <span class="subtle-text">${escapeHtml(item.host)}:${escapeHtml(item.port)}/${escapeHtml(item.instanceName)}</span>
      </div>
    `;

    const statusCell = document.createElement("td");
    statusCell.appendChild(createStatusChip(item.status));

    const dbTypeCell = document.createElement("td");
    dbTypeCell.className = "center-cell";
    dbTypeCell.textContent = item.dbType;

    const searchCountCell = document.createElement("td");
    searchCountCell.className = "number-cell";
    searchCountCell.textContent = item.searchCount.toLocaleString("ko-KR");

    const tableCountCell = document.createElement("td");
    tableCountCell.className = "number-cell";
    tableCountCell.textContent = item.recentTableCount.toLocaleString("ko-KR");

    const detectionCountCell = document.createElement("td");
    detectionCountCell.className = "number-cell";
    if (item.recentDetectionCount > 0) {
      detectionCountCell.innerHTML = `<a class="count-link" href="./detection-list.html?dbId=${encodeURIComponent(item.id)}">${item.recentDetectionCount.toLocaleString("ko-KR")}</a>`;
    } else {
      detectionCountCell.textContent = "0";
    }

    const startedAtCell = document.createElement("td");
    startedAtCell.className = "center-cell";
    startedAtCell.textContent = formatDateTime(item.inspectionStartedAt);

    const durationCell = document.createElement("td");
    durationCell.className = "center-cell";
    durationCell.textContent = formatDuration(item.durationMinutes);

    const labelCell = document.createElement("td");
    labelCell.innerHTML = renderLabelCell(item.labels);

    row.append(
      checkboxCell,
      idCell,
      nameCell,
      dbTypeCell,
      searchCountCell,
      statusCell,
      tableCountCell,
      detectionCountCell,
      startedAtCell,
      durationCell,
      labelCell
    );
    refs.targetTableBody.appendChild(row);
  });

  const checkedVisibleCount = items.filter((item) => state.checkedTargetIds.has(item.id)).length;
  refs.selectAllTargets.checked = items.length > 0 && checkedVisibleCount === items.length;
  refs.selectAllTargets.indeterminate = checkedVisibleCount > 0 && checkedVisibleCount < items.length;
  refs.listCaption.textContent = `총 ${targetService.getTargets().length.toLocaleString("ko-KR")}대 중 ${items.length.toLocaleString("ko-KR")}대 표시 · 선택 ${state.checkedTargetIds.size.toLocaleString("ko-KR")}대`;
}

function renderLabelCell(labels) {
  const visible = labels.slice(0, 3);
  const hiddenCount = labels.length - visible.length;
  const chips = visible.map((label) => `<span class="label-chip compact">${escapeHtml(label)}</span>`);
  if (hiddenCount > 0) {
    chips.push(`<span class="label-chip more-chip">+${hiddenCount}</span>`);
  }
  return `<div class="label-chip-wrap" title="${escapeHtml(labels.join(", "))}">${chips.join("")}</div>`;
}

function renderFilterControls() {
  refs.statusFilterSearch.value = state.filterUi.statusesSearch;
  refs.labelKeywordInput.value = state.filterDraft.labelKeyword;
  renderFilterSelect(
    refs.statusFilterTrigger,
    refs.statusFilterList,
    STATUS_ORDER.map((status) => ({ value: status, label: STATUS_META[status].label })),
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
  refs.statusFilterPanel.hidden = !(state.filterUi.openKey === "statuses" && state.filters.panelOpen);
}

function renderBulkLabelModal() {
  refs.bulkLabelModal.hidden = !state.bulkLabel.open;
  if (!state.bulkLabel.open) {
    return;
  }

  const selectedTargets = targetService.getTargetsByIds([...state.checkedTargetIds]);
  const unionLabels = [...new Set(selectedTargets.flatMap((item) => item.labels))].sort((left, right) =>
    left.localeCompare(right, "ko")
  );
  refs.bulkLabelSelectionCaption.textContent = `선택 DB ${selectedTargets.length.toLocaleString("ko-KR")}대`;
  refs.selectedLabelSummary.innerHTML = unionLabels.length
    ? unionLabels.map((label) => `<span class="label-chip">${escapeHtml(label)}</span>`).join("")
    : `<span class="label-chip is-muted">등록 라벨 없음</span>`;

  refs.bulkAddLabelTokens.innerHTML = renderEditableLabelTokens(state.bulkLabel.addLabels, "add");
  refs.bulkRemoveLabelTokens.innerHTML = renderEditableLabelTokens(state.bulkLabel.removeLabels, "remove");
  refs.labelSuggestionList.innerHTML = targetService
    .getPopularLabels()
    .map((label) => `<button type="button" class="suggestion-chip" data-label-value="${escapeHtml(label)}">${escapeHtml(label)}</button>`)
    .join("");
  refs.applyLabelModalButton.disabled = !state.bulkLabel.addLabels.length && !state.bulkLabel.removeLabels.length;
}

function renderEditableLabelTokens(labels, mode) {
  if (!labels.length) {
    return `<span class="label-chip is-muted">${mode === "add" ? "추가 라벨 없음" : "제거 라벨 없음"}</span>`;
  }
  return labels
    .map((label) => {
      const dataAttribute = mode === "add" ? "data-remove-add-label" : "data-remove-delete-label";
      return `
        <span class="editable-chip ${mode === "add" ? "is-add" : "is-remove"}">
          ${escapeHtml(label)}
          <button type="button" ${dataAttribute}="${escapeHtml(label)}">×</button>
        </span>
      `;
    })
    .join("");
}

function appendBulkLabel(mode) {
  const input = mode === "add" ? refs.bulkAddLabelInput : refs.bulkRemoveLabelInput;
  const nextValue = input.value.trim();
  if (!nextValue) {
    return;
  }
  const key = mode === "add" ? "addLabels" : "removeLabels";
  const oppositeKey = mode === "add" ? "removeLabels" : "addLabels";
  if (!state.bulkLabel[key].includes(nextValue)) {
    state.bulkLabel[key] = [...state.bulkLabel[key], nextValue];
  }
  state.bulkLabel[oppositeKey] = state.bulkLabel[oppositeKey].filter((label) => label !== nextValue);
  input.value = "";
  renderBulkLabelModal();
}

function closeBulkLabelModal() {
  state.bulkLabel.open = false;
  state.bulkLabel.addLabels = [];
  state.bulkLabel.removeLabels = [];
}

function getFilteredTargets() {
  const query = state.filters.query.toLowerCase();
  const labelKeyword = state.filters.labelKeyword.toLowerCase();
  const items = targetService.getTargets().filter((item) => {
    const matchesQuery =
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.dbType.toLowerCase().includes(query) ||
      item.labels.some((label) => label.toLowerCase().includes(query));
    const matchesStatus = !state.filters.statuses.length || state.filters.statuses.includes(item.status);
    const matchesLabelKeyword =
      !labelKeyword || item.labels.some((label) => label.toLowerCase().includes(labelKeyword));
    return matchesQuery && matchesStatus && matchesLabelKeyword;
  });

  const dir = state.sort.dir === "asc" ? 1 : -1;
  items.sort((left, right) => {
    if (state.sort.key === "status") {
      return STATUS_META[left.status].label.localeCompare(STATUS_META[right.status].label, "ko") * dir;
    }
    if (state.sort.key === "inspectionStartedAt") {
      return (new Date(left.inspectionStartedAt).getTime() - new Date(right.inspectionStartedAt).getTime()) * dir;
    }
    if (
      state.sort.key === "searchCount" ||
      state.sort.key === "recentTableCount" ||
      state.sort.key === "recentDetectionCount" ||
      state.sort.key === "durationMinutes"
    ) {
      return (left[state.sort.key] - right[state.sort.key]) * dir;
    }
    return String(left[state.sort.key]).localeCompare(String(right[state.sort.key]), "ko") * dir;
  });

  return items;
}

function createStatusChip(status) {
  const chip = document.createElement("span");
  chip.className = `inspection-status-chip ${STATUS_META[status].className}`;
  chip.textContent = STATUS_META[status].label;
  return chip;
}

function buildFilterSummaryText() {
  const parts = [];
  if (state.filters.statuses.length) {
    parts.push(`상태 ${state.filters.statuses.length}개`);
  }
  if (state.filters.labelKeyword) {
    parts.push(`라벨 "${state.filters.labelKeyword}"`);
  }
  if (state.filters.query) {
    parts.push(`검색 "${state.filters.query}"`);
  }
  return parts.length ? parts.join(" · ") : "필터 적용됨";
}

function downloadExcel(rows) {
  const header = [
    "ID",
    "DB명",
    "DB종류",
    "검색 수",
    "점검상태",
    "최근검색테이블수",
    "최근검출건수",
    "점검시작일시",
    "점검소요시간",
    "라벨",
  ];
  const body = rows.map((item) => [
    item.id.toUpperCase(),
    item.name,
    item.dbType,
    item.searchCount,
    STATUS_META[item.status].label,
    item.recentTableCount,
    item.recentDetectionCount,
    formatDateTime(item.inspectionStartedAt),
    formatDuration(item.durationMinutes),
    item.labels.join(", "),
  ]);

  const tableMarkup = `
    <html>
      <head>
        <meta charset="UTF-8">
      </head>
      <body>
        <table border="1">
          <thead>
            <tr>${header.map((label) => `<th>${escapeHtml(label)}</th>`).join("")}</tr>
          </thead>
          <tbody>
            ${body
              .map(
                (row) =>
                  `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`
              )
              .join("")}
          </tbody>
        </table>
      </body>
    </html>
  `;
  const blob = new Blob([`\ufeff${tableMarkup}`], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const timestamp = getFileTimestamp();
  link.href = url;
  link.download = `inspection-targets-${timestamp}.xls`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function positionFilterPopover() {
  const rect = refs.toggleFilterButton.getBoundingClientRect();
  refs.targetFilterModal.style.top = `${rect.bottom + 8}px`;
  refs.targetFilterModal.style.left = `${Math.max(12, Math.min(rect.left, window.innerWidth - refs.targetFilterModal.offsetWidth - 12))}px`;
}

function isFiltered() {
  return Boolean(state.filters.query || state.filters.statuses.length || state.filters.labelKeyword);
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  const pad = (number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatDuration(minutes) {
  if (!Number.isFinite(minutes)) {
    return "-";
  }
  const totalSeconds = Math.max(0, Math.round(minutes * 60));
  const hours = Math.floor(totalSeconds / 3600);
  const remainMinutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(remainMinutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getFileTimestamp() {
  const now = new Date();
  const pad = (number) => String(number).padStart(2, "0");
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
}

function pushToast(message, type = "default") {
  targetShared.pushToast(refs.toastStack, message, type);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
