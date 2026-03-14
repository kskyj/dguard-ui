const runService = window.MockInspectionTargetService;
const runShared = window.DGuardShared;
const runRefs = {};
let runSidebarController;
let runUserMenuController;

const runState = {
  role: "admin",
  sidebarCollapsed: false,
  selectedMenuKey: "inspection-target",
  openSidebarGroupKey: null,
  userMenuOpen: false,
  checkedTargetIds: new Set(),
  filters: {
    query: "",
    statuses: [],
    dbTypes: [],
    panelOpen: false,
  },
  filterDraft: {
    statuses: [],
    dbTypes: [],
  },
  filterUi: {
    openKey: null,
    statusesSearch: "",
    dbTypesSearch: "",
  },
  labelModal: {
    open: false,
    addLabels: [],
    removeLabels: [],
  },
};

document.addEventListener("DOMContentLoaded", initRunPage);

function initRunPage() {
  cacheRunRefs();
  runSidebarController = runShared.initSidebar({
    sidebarNav: runRefs.sidebarNav,
    sidebarToggle: runRefs.sidebarToggle,
    roleButtons: runRefs.roleButtons,
    getState: () => runState,
    onRoleChange: (nextRole) => {
      pushRunToast(`역할이 ${nextRole === "admin" ? "관리자" : "일반사용자"}로 변경되었습니다.`);
    },
    onRender: renderRunPage,
  });
  runUserMenuController = runShared.initUserMenu({
    root: runRefs.userMenu,
    trigger: runRefs.userMenuTrigger,
    panel: runRefs.userMenuPanel,
    settingsButton: runRefs.userSettingsButton,
    logoutButton: runRefs.logoutButton,
    getState: () => runState,
    onRender: renderRunPage,
    onSettings: () => pushRunToast("사용자설정 화면은 샘플에서 준비 중입니다."),
    onLogout: () => pushRunToast("로그아웃이 요청되었습니다."),
  });
  bindEvents();
  renderFilterControls();
  renderRunPage();
}

function cacheRunRefs() {
  const ids = [
    "sidebarToggle",
    "userMenu",
    "userMenuTrigger",
    "userMenuPanel",
    "userSettingsButton",
    "logoutButton",
    "runHeroTarget",
    "runSelectedCount",
    "runRunningCount",
    "runDetectionTotal",
    "runCaption",
    "runSearchInput",
    "toggleRunFilterButton",
    "runFilterSummary",
    "runFilterBadgeText",
    "clearRunFiltersButton",
    "bulkRunLabelButton",
    "startRunButton",
    "exportRunButton",
    "selectAllRunTargets",
    "runTargetTableBody",
    "runFilterModal",
    "runStatusFilterTrigger",
    "runStatusFilterPanel",
    "runStatusFilterSearch",
    "runStatusFilterList",
    "runDbTypeFilterTrigger",
    "runDbTypeFilterPanel",
    "runDbTypeFilterSearch",
    "runDbTypeFilterList",
    "cancelRunFilterButton",
    "applyRunFilterButton",
    "runLabelModal",
    "runLabelSelectionCaption",
    "runSelectedLabelSummary",
    "runAddLabelInput",
    "runAddLabelButton",
    "runAddLabelTokens",
    "runRemoveLabelInput",
    "runRemoveLabelButton",
    "runRemoveLabelTokens",
    "closeRunLabelModalButton",
    "applyRunLabelModalButton",
    "toastStack",
  ];
  ids.forEach((id) => {
    runRefs[id] = document.getElementById(id);
  });
  runRefs.sidebarNav = document.querySelector(".sidebar-nav");
  runRefs.roleButtons = [...document.querySelectorAll(".role-btn")];
}

function bindEvents() {
  runRefs.runSearchInput.addEventListener("input", (event) => {
    runState.filters.query = event.target.value.trim();
    syncCheckedTargets();
    renderRunPage();
  });

  runRefs.toggleRunFilterButton.addEventListener("click", () => {
    const shouldOpen = !runState.filters.panelOpen;
    runState.filters.panelOpen = shouldOpen;
    runState.filterUi.openKey = null;
    if (shouldOpen) {
      runState.filterDraft.statuses = [...runState.filters.statuses];
      runState.filterDraft.dbTypes = [...runState.filters.dbTypes];
    }
    renderRunPage();
  });

  runRefs.clearRunFiltersButton.addEventListener("click", () => {
    runState.filters.query = "";
    runState.filters.statuses = [];
    runState.filters.dbTypes = [];
    runState.filterDraft.statuses = [];
    runState.filterDraft.dbTypes = [];
    runState.filterUi.statusesSearch = "";
    runState.filterUi.dbTypesSearch = "";
    runRefs.runSearchInput.value = "";
    syncCheckedTargets();
    renderRunPage();
  });

  bindFilterSelect("statuses");
  bindFilterSelect("dbTypes");

  runRefs.cancelRunFilterButton.addEventListener("click", () => {
    runState.filters.panelOpen = false;
    runState.filterUi.openKey = null;
    renderRunPage();
  });

  runRefs.applyRunFilterButton.addEventListener("click", () => {
    runState.filters.statuses = [...runState.filterDraft.statuses];
    runState.filters.dbTypes = [...runState.filterDraft.dbTypes];
    runState.filters.panelOpen = false;
    runState.filterUi.openKey = null;
    syncCheckedTargets();
    renderRunPage();
  });

  runRefs.selectAllRunTargets.addEventListener("change", (event) => {
    const checked = event.target.checked;
    getFilteredTargets().forEach((item) => {
      if (checked) {
        runState.checkedTargetIds.add(item.id);
      } else {
        runState.checkedTargetIds.delete(item.id);
      }
    });
    renderRunPage();
  });

  runRefs.runTargetTableBody.addEventListener("change", (event) => {
    if (!(event.target instanceof HTMLInputElement) || event.target.type !== "checkbox") {
      return;
    }
    const id = event.target.dataset.targetId;
    if (!id) {
      return;
    }
    if (event.target.checked) {
      runState.checkedTargetIds.add(id);
    } else {
      runState.checkedTargetIds.delete(id);
    }
    renderRunPage();
  });

  runRefs.bulkRunLabelButton.addEventListener("click", () => {
    if (!runState.checkedTargetIds.size) {
      pushRunToast("라벨 수정할 DB를 체크박스로 선택하세요.", "danger");
      return;
    }
    runState.labelModal.open = true;
    runState.labelModal.addLabels = [];
    runState.labelModal.removeLabels = [];
    runRefs.runAddLabelInput.value = "";
    runRefs.runRemoveLabelInput.value = "";
    renderRunPage();
  });

  runRefs.closeRunLabelModalButton.addEventListener("click", closeRunLabelModal);
  runRefs.runAddLabelButton.addEventListener("click", () => appendRunLabel("add"));
  runRefs.runRemoveLabelButton.addEventListener("click", () => appendRunLabel("remove"));

  runRefs.runAddLabelInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      appendRunLabel("add");
    }
  });

  runRefs.runRemoveLabelInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      appendRunLabel("remove");
    }
  });

  runRefs.runAddLabelTokens.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-add-label]");
    if (!button) {
      return;
    }
    runState.labelModal.addLabels = runState.labelModal.addLabels.filter((label) => label !== button.dataset.removeAddLabel);
    renderRunLabelModal();
  });

  runRefs.runRemoveLabelTokens.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-delete-label]");
    if (!button) {
      return;
    }
    runState.labelModal.removeLabels = runState.labelModal.removeLabels.filter(
      (label) => label !== button.dataset.removeDeleteLabel
    );
    renderRunLabelModal();
  });

  runRefs.applyRunLabelModalButton.addEventListener("click", () => {
    runService.updateLabels([...runState.checkedTargetIds], {
      addLabels: runState.labelModal.addLabels,
      removeLabels: runState.labelModal.removeLabels,
    });
    const selectedCount = runState.checkedTargetIds.size;
    closeRunLabelModal();
    renderRunPage();
    pushRunToast(`선택한 ${selectedCount}대의 라벨을 반영했습니다.`, "success");
  });

  runRefs.startRunButton.addEventListener("click", () => {
    const targets = getCheckedTargets();
    if (!targets.length) {
      pushRunToast("점검할 DB를 체크박스로 선택하세요.", "danger");
      return;
    }
    pushRunToast(`선택한 ${targets.length}대 점검을 시작했습니다.`, "success");
  });

  runRefs.exportRunButton.addEventListener("click", () => {
    const targets = getCheckedTargets();
    if (!targets.length) {
      pushRunToast("내보낼 DB를 체크박스로 선택하세요.", "danger");
      return;
    }
    downloadExcel(targets);
    pushRunToast(`선택한 ${targets.length}대 기준으로 Excel 파일을 생성했습니다.`, "success");
  });

  document.addEventListener("click", (event) => {
    runUserMenuController?.handleDocumentClick(event);

    if (runState.filters.panelOpen) {
      const insideFilterSelect = event.target.closest(".filter-select");
      const insideFilterModal = event.target.closest("#runFilterModal .filter-popover-card");
      const onFilterButton = event.target.closest("#toggleRunFilterButton");
      if (!insideFilterModal && !onFilterButton) {
        runState.filters.panelOpen = false;
        runState.filterUi.openKey = null;
        renderRunPage();
        return;
      }
      if (insideFilterModal && !insideFilterSelect) {
        runState.filterUi.openKey = null;
        renderFilterSelectPanels();
      }
    }

    if (runState.labelModal.open) {
      const insideModal = event.target.closest("#runLabelModal .modal-card");
      const onOpenButton = event.target.closest("#bulkRunLabelButton");
      if (!insideModal && !onOpenButton) {
        closeRunLabelModal();
        renderRunPage();
      }
    }
  });

  window.addEventListener("resize", () => {
    if (runState.filters.panelOpen) {
      positionFilterPopover();
    }
  });
}

function bindFilterSelect(key) {
  const mapping = {
    statuses: {
      trigger: runRefs.runStatusFilterTrigger,
      panel: runRefs.runStatusFilterPanel,
      search: runRefs.runStatusFilterSearch,
      list: runRefs.runStatusFilterList,
      searchKey: "statusesSearch",
      values: runService.STATUS_ORDER.map((status) => ({ value: status, label: runService.STATUS_META[status].label })),
    },
    dbTypes: {
      trigger: runRefs.runDbTypeFilterTrigger,
      panel: runRefs.runDbTypeFilterPanel,
      search: runRefs.runDbTypeFilterSearch,
      list: runRefs.runDbTypeFilterList,
      searchKey: "dbTypesSearch",
      values: runService.DB_TYPES.map((item) => ({ value: item, label: item })),
    },
  };
  const target = mapping[key];

  target.trigger.addEventListener("click", (event) => {
    const removeButton = event.target.closest(".filter-chip-remove");
    if (removeButton) {
      event.stopPropagation();
      runState.filterDraft[key] = runState.filterDraft[key].filter((item) => item !== removeButton.dataset.filterValue);
      renderFilterControls();
      return;
    }
    runState.filterUi.openKey = runState.filterUi.openKey === key ? null : key;
    renderFilterSelectPanels();
  });

  target.search.addEventListener("input", (event) => {
    runState.filterUi[target.searchKey] = event.target.value.trim();
    renderFilterControls();
  });

  target.list.addEventListener("change", (event) => {
    if (!(event.target instanceof HTMLInputElement) || event.target.type !== "checkbox") {
      return;
    }
    runState.filterDraft[key] = [...target.list.querySelectorAll("input[type='checkbox']:checked")].map((input) => input.value);
    renderFilterControls();
  });
}

function renderRunPage() {
  runSidebarController?.render();
  runUserMenuController?.render();

  runRefs.runFilterModal.hidden = !runState.filters.panelOpen;
  runRefs.runFilterSummary.hidden = !isFiltered();
  runRefs.toggleRunFilterButton.classList.toggle("is-filtered", isFiltered());
  renderFilterControls();
  if (runState.filters.panelOpen) {
    positionFilterPopover();
  }

  const targets = getAllTargets();
  const checkedTargets = getCheckedTargets();
  runRefs.runHeroTarget.textContent = `선택 DB ${targets.length.toLocaleString("ko-KR")}대`;
  runRefs.runSelectedCount.textContent = targets.length.toLocaleString("ko-KR");
  runRefs.runRunningCount.textContent = targets.filter((item) => item.status === "RUNNING").length.toLocaleString("ko-KR");
  runRefs.runDetectionTotal.textContent = targets
    .reduce((sum, item) => sum + item.recentDetectionCount, 0)
    .toLocaleString("ko-KR");
  runRefs.runCaption.textContent = `총 ${targets.length.toLocaleString("ko-KR")}대 중 ${getFilteredTargets().length.toLocaleString(
    "ko-KR"
  )}대 표시 · 선택 ${checkedTargets.length.toLocaleString("ko-KR")}대`;
  runRefs.bulkRunLabelButton.disabled = checkedTargets.length === 0;
  runRefs.startRunButton.disabled = checkedTargets.length === 0;
  runRefs.exportRunButton.disabled = checkedTargets.length === 0;
  runRefs.runFilterBadgeText.textContent = buildFilterSummaryText();

  renderTable();
  renderRunLabelModal();
}

function renderTable() {
  const targets = getFilteredTargets();
  runRefs.runTargetTableBody.innerHTML = targets
    .map(
      (item) => `
        <tr class="${runState.checkedTargetIds.has(item.id) ? "is-checked" : ""}">
          <td class="checkbox-cell">
            <input type="checkbox" data-target-id="${escapeHtml(item.id)}" ${runState.checkedTargetIds.has(item.id) ? "checked" : ""} aria-label="${escapeHtml(item.name)} 선택">
          </td>
          <td>${escapeHtml(item.name)}</td>
          <td>${escapeHtml(item.dbType)}</td>
          <td><span class="run-status-chip ${runService.STATUS_META[item.status].className}">${escapeHtml(
            runService.STATUS_META[item.status].label
          )}</span></td>
          <td class="number-cell">${item.recentTableCount.toLocaleString("ko-KR")}</td>
          <td class="number-cell">${item.recentDetectionCount.toLocaleString("ko-KR")}</td>
          <td>
            <div class="run-label-wrap">
              ${item.labels.map((label) => `<span class="run-label-chip">${escapeHtml(label)}</span>`).join("")}
            </div>
          </td>
        </tr>
      `
    )
    .join("");

  const checkedVisibleCount = targets.filter((item) => runState.checkedTargetIds.has(item.id)).length;
  runRefs.selectAllRunTargets.checked = targets.length > 0 && checkedVisibleCount === targets.length;
  runRefs.selectAllRunTargets.indeterminate = checkedVisibleCount > 0 && checkedVisibleCount < targets.length;
}

function renderFilterControls() {
  renderFilterSelect(
    runRefs.runStatusFilterTrigger,
    runRefs.runStatusFilterList,
    runService.STATUS_ORDER.map((status) => ({ value: status, label: runService.STATUS_META[status].label })),
    runState.filterDraft.statuses,
    runState.filterUi.statusesSearch
  );
  renderFilterSelect(
    runRefs.runDbTypeFilterTrigger,
    runRefs.runDbTypeFilterList,
    runService.DB_TYPES.map((item) => ({ value: item, label: item })),
    runState.filterDraft.dbTypes,
    runState.filterUi.dbTypesSearch
  );
  runRefs.runStatusFilterSearch.value = runState.filterUi.statusesSearch;
  runRefs.runDbTypeFilterSearch.value = runState.filterUi.dbTypesSearch;
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
  runRefs.runStatusFilterPanel.hidden = !(runState.filterUi.openKey === "statuses" && runState.filters.panelOpen);
  runRefs.runDbTypeFilterPanel.hidden = !(runState.filterUi.openKey === "dbTypes" && runState.filters.panelOpen);
}

function renderRunLabelModal() {
  runRefs.runLabelModal.hidden = !runState.labelModal.open;
  if (!runState.labelModal.open) {
    return;
  }

  const selectedTargets = getCheckedTargets();
  const unionLabels = [...new Set(selectedTargets.flatMap((item) => item.labels))].sort((left, right) =>
    left.localeCompare(right, "ko")
  );
  runRefs.runLabelSelectionCaption.textContent = `선택 DB ${selectedTargets.length.toLocaleString("ko-KR")}대`;
  runRefs.runSelectedLabelSummary.innerHTML = unionLabels.length
    ? unionLabels.map((label) => `<span class="run-label-chip">${escapeHtml(label)}</span>`).join("")
    : `<span class="run-label-chip is-muted">등록 라벨 없음</span>`;
  runRefs.runAddLabelTokens.innerHTML = renderEditableLabelTokens(runState.labelModal.addLabels, "add");
  runRefs.runRemoveLabelTokens.innerHTML = renderEditableLabelTokens(runState.labelModal.removeLabels, "remove");
  runRefs.applyRunLabelModalButton.disabled =
    !runState.labelModal.addLabels.length && !runState.labelModal.removeLabels.length;
}

function renderEditableLabelTokens(labels, mode) {
  if (!labels.length) {
    return `<span class="run-label-chip is-muted">${mode === "add" ? "추가 라벨 없음" : "제거 라벨 없음"}</span>`;
  }
  return labels
    .map((label) => {
      const dataAttribute = mode === "add" ? "data-remove-add-label" : "data-remove-delete-label";
      return `
        <span class="run-editable-chip ${mode === "add" ? "is-add" : "is-remove"}">
          ${escapeHtml(label)}
          <button type="button" ${dataAttribute}="${escapeHtml(label)}">×</button>
        </span>
      `;
    })
    .join("");
}

function appendRunLabel(mode) {
  const input = mode === "add" ? runRefs.runAddLabelInput : runRefs.runRemoveLabelInput;
  const nextValue = input.value.trim();
  if (!nextValue) {
    return;
  }
  const key = mode === "add" ? "addLabels" : "removeLabels";
  const oppositeKey = mode === "add" ? "removeLabels" : "addLabels";
  if (!runState.labelModal[key].includes(nextValue)) {
    runState.labelModal[key] = [...runState.labelModal[key], nextValue];
  }
  runState.labelModal[oppositeKey] = runState.labelModal[oppositeKey].filter((label) => label !== nextValue);
  input.value = "";
  renderRunLabelModal();
}

function closeRunLabelModal() {
  runState.labelModal.open = false;
  runState.labelModal.addLabels = [];
  runState.labelModal.removeLabels = [];
}

function getAllTargets() {
  const params = new URLSearchParams(window.location.search);
  const rawIds = params.get("ids") ?? "";
  const ids = rawIds
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return runService.getTargetsByIds(ids);
}

function getFilteredTargets() {
  const query = runState.filters.query.toLowerCase();
  return getAllTargets().filter((item) => {
    const matchesQuery =
      !query || item.name.toLowerCase().includes(query) || item.labels.some((label) => label.toLowerCase().includes(query));
    const matchesStatus = !runState.filters.statuses.length || runState.filters.statuses.includes(item.status);
    const matchesDbType = !runState.filters.dbTypes.length || runState.filters.dbTypes.includes(item.dbType);
    return matchesQuery && matchesStatus && matchesDbType;
  });
}

function getCheckedTargets() {
  const idSet = runState.checkedTargetIds;
  return getAllTargets().filter((item) => idSet.has(item.id));
}

function syncCheckedTargets() {
  const visibleIds = new Set(getFilteredTargets().map((item) => item.id));
  runState.checkedTargetIds.forEach((id) => {
    if (!visibleIds.has(id) && !getAllTargets().some((item) => item.id === id)) {
      runState.checkedTargetIds.delete(id);
    }
  });
}

function buildFilterSummaryText() {
  const parts = [];
  if (runState.filters.statuses.length) {
    parts.push(`상태 ${runState.filters.statuses.length}개`);
  }
  if (runState.filters.dbTypes.length) {
    parts.push(`DB종류 ${runState.filters.dbTypes.length}개`);
  }
  if (runState.filters.query) {
    parts.push(`검색 "${runState.filters.query}"`);
  }
  return parts.length ? parts.join(" · ") : "필터 적용됨";
}

function isFiltered() {
  return Boolean(runState.filters.query || runState.filters.statuses.length || runState.filters.dbTypes.length);
}

function positionFilterPopover() {
  const rect = runRefs.toggleRunFilterButton.getBoundingClientRect();
  runRefs.runFilterModal.style.top = `${rect.bottom + 8}px`;
  runRefs.runFilterModal.style.left = `${Math.max(
    12,
    Math.min(rect.left, window.innerWidth - runRefs.runFilterModal.offsetWidth - 12)
  )}px`;
}

function downloadExcel(rows) {
  const header = ["DB명", "DB종류", "점검상태", "최근검색테이블수", "최근검출건수", "라벨"];
  const body = rows.map((item) => [
    item.name,
    item.dbType,
    runService.STATUS_META[item.status].label,
    item.recentTableCount,
    item.recentDetectionCount,
    item.labels.join(", "),
  ]);
  const tableMarkup = `
    <html>
      <head><meta charset="UTF-8"></head>
      <body>
        <table border="1">
          <thead><tr>${header.map((label) => `<th>${escapeHtml(label)}</th>`).join("")}</tr></thead>
          <tbody>
            ${body.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}
          </tbody>
        </table>
      </body>
    </html>
  `;
  const blob = new Blob([`\ufeff${tableMarkup}`], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `inspection-run-${getFileTimestamp()}.xls`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function getFileTimestamp() {
  const now = new Date();
  const pad = (number) => String(number).padStart(2, "0");
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
}

function pushRunToast(message, type = "default") {
  runShared.pushToast(runRefs.toastStack, message, type);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
