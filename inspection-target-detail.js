const detailService = window.MockInspectionTargetDetailService;
const detailShared = window.DGuardShared;
const detailRefs = {};
let detailSidebarController;
let detailUserMenuController;

const detailState = {
  role: "admin",
  sidebarCollapsed: false,
  selectedMenuKey: "inspection-target",
  openSidebarGroupKey: null,
  userMenuOpen: false,
  selectedFailureHistoryId: null,
  edit: {
    targetId: null,
    infraOpen: false,
    labelOpen: false,
    memoOpen: false,
    saved: {
      infraManager: "",
      infraContact: "",
      labels: [],
      memoLines: [],
    },
    draft: {
      infraManager: "",
      infraContact: "",
      labels: [],
      memoText: "",
    },
  },
  tableForm: {
    open: false,
    mode: "create",
    editingId: null,
  },
  tableFilters: {
    query: "",
    applied: {
      scope: "ALL",
      method: "ALL",
    },
    draft: {
      scope: "ALL",
      method: "ALL",
    },
    filterOpen: false,
  },
};

document.addEventListener("DOMContentLoaded", initDetailPage);

function initDetailPage() {
  cacheDetailRefs();
  detailSidebarController = detailShared.initSidebar({
    sidebarNav: detailRefs.sidebarNav,
    sidebarToggle: detailRefs.sidebarToggle,
    roleButtons: detailRefs.roleButtons,
    getState: () => detailState,
    onRoleChange: renderDetailPage,
    onRender: renderDetailPage,
  });
  detailUserMenuController = detailShared.initUserMenu({
    root: detailRefs.userMenu,
    trigger: detailRefs.userMenuTrigger,
    panel: detailRefs.userMenuPanel,
    settingsButton: detailRefs.userSettingsButton,
    logoutButton: detailRefs.logoutButton,
    getState: () => detailState,
    onRender: renderDetailPage,
    onSettings: () => pushDetailToast("사용자설정 화면은 샘플에서 준비 중입니다."),
    onLogout: () => pushDetailToast("로그아웃이 요청되었습니다."),
  });

  bindDetailEvents();
  renderDetailPage();
}

function cacheDetailRefs() {
  const ids = [
    "sidebarToggle",
    "userMenu",
    "userMenuTrigger",
    "userMenuPanel",
    "userSettingsButton",
    "logoutButton",
    "detailHeroTarget",
    "detailBreadcrumbName",
    "dbInfoGrid",
    "detailDbId",
    "detailRegisteredAt",
    "detailProxyName",
    "detailProxyAddress",
    "detailProxyStatus",
    "detailInfraBody",
    "detailLabelList",
    "detailMemoList",
    "editLabelButton",
    "labelEditPanel",
    "labelEditInput",
    "addLabelButton",
    "labelDraftList",
    "saveLabelButton",
    "cancelLabelButton",
    "editMemoButton",
    "memoEditPanel",
    "memoEditInput",
    "saveMemoButton",
    "cancelMemoButton",
    "openTableInfoCreateButton",
    "tableInfoSearchInput",
    "toggleTableInfoFilterButton",
    "tableInfoToolbarSummary",
    "tableInfoFilterSummary",
    "tableInfoFilterBadge",
    "clearTableInfoFiltersButton",
    "tableInfoFilterPopover",
    "tableInfoScopeFilterList",
    "tableInfoMethodFilterList",
    "cancelTableInfoFilterButton",
    "applyTableInfoFilterButton",
    "tableInfoBody",
    "tableInfoEmpty",
    "tableInfoModal",
    "tableInfoModalTitle",
    "tableInfoModalCaption",
    "cancelTableInfoModalButton",
    "saveTableInfoButton",
    "tableInfoSchemaInput",
    "tableInfoTableNameInput",
    "tableInfoDescriptionInput",
    "tableInfoScopeSelect",
    "tableInfoChangeColumnInput",
    "tableInfoMethodSelect",
    "tableInfoCriterionLabel",
    "tableInfoCriterionInput",
    "tableInfoAssigneesInput",
    "tableInfoNoteInput",
    "historyTableBody",
    "historyEmpty",
    "startInspectionButton",
    "failureReasonModal",
    "failureReasonCaption",
    "failureDetectId",
    "failureScheduleName",
    "failureStatusText",
    "failureReasonList",
    "closeFailureReasonButton",
    "toastStack",
  ];
  ids.forEach((id) => {
    detailRefs[id] = document.getElementById(id);
  });
  detailRefs.sidebarNav = document.querySelector(".sidebar-nav");
  detailRefs.roleButtons = [...document.querySelectorAll(".role-btn")];
  detailRefs.dbInfoCard = document.querySelector(".db-info-card");
  detailRefs.tableInfoCard = document.querySelector(".table-info-card");
}

function bindDetailEvents() {
  detailRefs.dbInfoGrid.addEventListener("click", (event) => {
    const action = event.target.closest("[data-edit-action]")?.dataset.editAction;
    if (!action) {
      return;
    }
    if (action === "infra-open") {
      openEdit("infra");
      renderDetailPage();
      return;
    }
    if (action === "infra-save") {
      saveEdit("infra");
      renderDetailPage();
      return;
    }
    if (action === "infra-cancel") {
      cancelEdit("infra");
      renderDetailPage();
    }
  });

  detailRefs.dbInfoGrid.addEventListener("input", (event) => {
    if (!(event.target instanceof HTMLInputElement)) {
      return;
    }
    if (!event.target.matches("[data-infra-input]")) {
      return;
    }
    const key = event.target.dataset.infraInput;
    if (key === "name") {
      detailState.edit.draft.infraManager = event.target.value;
    }
    if (key === "contact") {
      detailState.edit.draft.infraContact = event.target.value;
    }
  });

  detailRefs.editLabelButton.addEventListener("click", () => {
    openEdit("label");
    renderDetailPage();
  });

  detailRefs.addLabelButton.addEventListener("click", () => {
    appendLabelDraft();
    renderLabelSection(getCurrentDetail());
  });

  detailRefs.labelEditInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      appendLabelDraft();
      renderLabelSection(getCurrentDetail());
    }
  });

  detailRefs.labelDraftList.addEventListener("click", (event) => {
    const remove = event.target.closest("[data-remove-label]");
    if (!remove) {
      return;
    }
    detailState.edit.draft.labels = detailState.edit.draft.labels.filter((label) => label !== remove.dataset.removeLabel);
    renderLabelSection(getCurrentDetail());
  });

  detailRefs.saveLabelButton.addEventListener("click", () => {
    saveEdit("label");
    renderDetailPage();
  });

  detailRefs.cancelLabelButton.addEventListener("click", () => {
    cancelEdit("label");
    renderDetailPage();
  });

  detailRefs.editMemoButton.addEventListener("click", () => {
    openEdit("memo");
    renderDetailPage();
  });

  detailRefs.memoEditInput.addEventListener("input", (event) => {
    detailState.edit.draft.memoText = event.target.value;
  });

  detailRefs.saveMemoButton.addEventListener("click", () => {
    saveEdit("memo");
    renderDetailPage();
  });

  detailRefs.cancelMemoButton.addEventListener("click", () => {
    cancelEdit("memo");
    renderDetailPage();
  });

  detailRefs.openTableInfoCreateButton.addEventListener("click", () => {
    openTableInfoModal("create");
  });

  detailRefs.tableInfoSearchInput.addEventListener("input", (event) => {
    detailState.tableFilters.query = event.target.value;
    renderDetailPage();
  });

  detailRefs.toggleTableInfoFilterButton.addEventListener("click", () => {
    detailState.tableFilters.filterOpen = !detailState.tableFilters.filterOpen;
    syncTableInfoFilterDraft();
    renderTableInfo(getCurrentDetail());
    if (detailState.tableFilters.filterOpen) {
      positionTableInfoFilterPopover();
    }
  });

  detailRefs.tableInfoScopeFilterList.addEventListener("click", (event) => {
    const option = event.target.closest("[data-filter-group='scope']");
    if (!option) {
      return;
    }
    detailState.tableFilters.draft.scope = option.dataset.filterValue;
    renderTableInfoFilterControls();
  });

  detailRefs.tableInfoMethodFilterList.addEventListener("click", (event) => {
    const option = event.target.closest("[data-filter-group='method']");
    if (!option) {
      return;
    }
    detailState.tableFilters.draft.method = option.dataset.filterValue;
    renderTableInfoFilterControls();
  });

  detailRefs.applyTableInfoFilterButton.addEventListener("click", () => {
    detailState.tableFilters.applied = { ...detailState.tableFilters.draft };
    detailState.tableFilters.filterOpen = false;
    renderDetailPage();
  });

  detailRefs.cancelTableInfoFilterButton.addEventListener("click", () => {
    detailState.tableFilters.filterOpen = false;
    syncTableInfoFilterDraft();
    renderTableInfo(getCurrentDetail());
  });

  detailRefs.clearTableInfoFiltersButton.addEventListener("click", () => {
    detailState.tableFilters.query = "";
    detailState.tableFilters.applied = { scope: "ALL", method: "ALL" };
    detailState.tableFilters.draft = { scope: "ALL", method: "ALL" };
    detailRefs.tableInfoSearchInput.value = "";
    renderDetailPage();
  });

  detailRefs.tableInfoBody.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-table-edit]");
    if (!editButton) {
      return;
    }
    const detail = getCurrentDetail();
    const tableInfo = detail?.tableInfo.find((item) => item.id === editButton.dataset.tableEdit);
    if (!tableInfo) {
      pushDetailToast("수정할 테이블 정보를 찾을 수 없습니다.", "danger");
      return;
    }
    openTableInfoModal("edit", tableInfo);
  });

  detailRefs.tableInfoScopeSelect.addEventListener("change", syncTableInfoFormState);
  detailRefs.tableInfoMethodSelect.addEventListener("change", syncTableInfoFormState);
  detailRefs.cancelTableInfoModalButton.addEventListener("click", closeTableInfoModal);
  detailRefs.saveTableInfoButton.addEventListener("click", saveTableInfoDraft);

  detailRefs.tableInfoModal.addEventListener("click", (event) => {
    if (event.target === detailRefs.tableInfoModal) {
      closeTableInfoModal();
    }
  });

  detailRefs.startInspectionButton.addEventListener("click", () => {
    const detail = getCurrentDetail();
    if (!detail) {
      pushDetailToast("선택된 DB 정보를 찾을 수 없습니다.", "danger");
      return;
    }
  });

  detailRefs.historyTableBody.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-history-action]");
    if (!actionButton) {
      return;
    }

    const historyId = actionButton.dataset.historyId;
    const detail = getCurrentDetail();
    const record = detail?.inspectionHistory.find((item) => item.id === historyId);
    if (!detail || !record) {
      pushDetailToast("점검 이력 정보를 찾을 수 없습니다.", "danger");
      return;
    }

    const action = actionButton.dataset.historyAction;
    if (action === "reason") {
      detailState.selectedFailureHistoryId = historyId;
      renderFailureReasonModal(detail);
      return;
    }

    if (action === "all-detections") {
      window.location.href = buildDetectionListUrl(detail);
      return;
    }

    if (action === "resident-detections") {
      window.location.href = buildDetectionListUrl(detail, { detectType: "주민등록번호" });
    }
  });

  detailRefs.closeFailureReasonButton.addEventListener("click", closeFailureReasonModal);

  detailRefs.failureReasonModal.addEventListener("click", (event) => {
    if (event.target === detailRefs.failureReasonModal) {
      closeFailureReasonModal();
    }
  });

  document.addEventListener("click", (event) => {
    detailUserMenuController?.handleDocumentClick(event);
    if (
      detailState.tableFilters.filterOpen &&
      !detailRefs.tableInfoFilterPopover.contains(event.target) &&
      !detailRefs.toggleTableInfoFilterButton.contains(event.target)
    ) {
      detailState.tableFilters.filterOpen = false;
      syncTableInfoFilterDraft();
      renderTableInfo(getCurrentDetail());
      return;
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && detailState.tableForm.open) {
      closeTableInfoModal();
      return;
    }
    if (event.key === "Escape" && detailState.tableFilters.filterOpen) {
      detailState.tableFilters.filterOpen = false;
      syncTableInfoFilterDraft();
      renderTableInfo(getCurrentDetail());
      return;
    }
    if (event.key === "Escape" && !detailRefs.failureReasonModal.hidden) {
      closeFailureReasonModal();
    }
  });

  window.addEventListener("resize", () => {
    syncTableInfoCardHeight();
    if (detailState.tableFilters.filterOpen) {
      positionTableInfoFilterPopover();
    }
  });
}

function renderDetailPage() {
  detailSidebarController?.render();
  detailUserMenuController?.render();

  const detail = getCurrentDetail();
  if (!detail) {
    renderEmptyDetailState();
    return;
  }

  syncEditState(detail);

  detailRefs.detailHeroTarget.textContent = `${detail.target.name} (${detail.target.host}:${detail.target.port}/${detail.target.instanceName})`;
  detailRefs.detailBreadcrumbName.textContent = detail.target.name;

  renderDbInfo(detail);
  renderTableInfo(detail);
  renderHistory(detail);
  renderFailureReasonModal(detail);
  syncTableInfoCardHeight();
}

function renderEmptyDetailState() {
  detailRefs.detailHeroTarget.textContent = "DB 선택";
  detailRefs.detailBreadcrumbName.textContent = "DB 상세";
  detailRefs.detailDbId.textContent = "-";
  detailRefs.detailRegisteredAt.textContent = "-";
  detailRefs.detailProxyAddress.textContent = "-";
  detailRefs.detailProxyStatus.textContent = "-";
  detailRefs.detailProxyStatus.className = "proxy-pill";
  detailRefs.detailProxyStatus.hidden = true;
  detailRefs.detailInfraBody.innerHTML = "";
  detailRefs.detailLabelList.innerHTML = "";
  detailRefs.detailMemoList.textContent = "";
  detailRefs.tableInfoToolbarSummary.innerHTML = buildTableInfoToolbarSummaryHtml(0, 0);
  detailRefs.tableInfoBody.innerHTML = "";
  detailRefs.historyTableBody.innerHTML = "";
  detailRefs.tableInfoEmpty.hidden = false;
  detailRefs.historyEmpty.hidden = false;
  detailRefs.tableInfoFilterSummary.hidden = true;
  detailRefs.tableInfoFilterPopover.hidden = true;
  detailRefs.startInspectionButton.disabled = true;
  detailRefs.labelEditPanel.hidden = true;
  detailRefs.labelEditPanel.style.display = "none";
  detailRefs.memoEditPanel.hidden = true;
  detailRefs.memoEditPanel.style.display = "none";
  detailRefs.detailLabelList.hidden = false;
  detailRefs.detailMemoList.hidden = false;
  closeTableInfoModal();
  closeFailureReasonModal();
  syncTableInfoCardHeight();
}

function syncTableInfoCardHeight() {
  if (!detailRefs.dbInfoCard || !detailRefs.tableInfoCard) {
    return;
  }

  detailRefs.tableInfoCard.style.height = "";

  const dbInfoHeight = Math.ceil(detailRefs.dbInfoCard.getBoundingClientRect().height);
  if (dbInfoHeight <= 0) {
    return;
  }

  detailRefs.tableInfoCard.style.height = `${dbInfoHeight}px`;
}

function renderDbInfo(detail) {
  const proxyStatusMeta = detailService.PROXY_STATUS_META[detail.dbInfo.proxy.status];

  detailRefs.detailDbId.textContent = detail.dbInfo.dbId;
  detailRefs.detailRegisteredAt.textContent = formatDateTime(detail.dbInfo.registeredAt);
  detailRefs.detailProxyName.textContent = detail.dbInfo.proxy.name;
  const proxyAddress = detail.dbInfo.proxy.port
    ? `${detail.dbInfo.proxy.ip}:${detail.dbInfo.proxy.port}`
    : detail.dbInfo.proxy.version
      ? `${detail.dbInfo.proxy.ip}/${detail.dbInfo.proxy.version}`
      : detail.dbInfo.proxy.ip;
  detailRefs.detailProxyAddress.textContent = proxyAddress;
  detailRefs.detailProxyStatus.hidden = detail.dbInfo.proxy.status === "DEGRADED";
  if (detailRefs.detailProxyStatus.hidden) {
    detailRefs.detailProxyStatus.textContent = "";
    detailRefs.detailProxyStatus.className = "proxy-pill";
  } else {
    detailRefs.detailProxyStatus.textContent = proxyStatusMeta.label;
    detailRefs.detailProxyStatus.className = `proxy-pill ${proxyStatusMeta.className}`;
  }
  detailRefs.detailInfraBody.innerHTML = `<span class="segment-value">${escapeHtml(detail.target.dbType)}</span>`;

  renderLabelSection(detail);
  renderMemoSection(detail);
}

function renderTableInfo(detail) {
  const filteredTableInfo = getFilteredTableInfo(detail.tableInfo);
  const totalCount = detail.tableInfo.length;
  const visibleCount = filteredTableInfo.length;
  detailRefs.tableInfoSearchInput.value = detailState.tableFilters.query;
  detailRefs.tableInfoToolbarSummary.innerHTML = buildTableInfoToolbarSummaryHtml(totalCount, visibleCount);
  detailRefs.tableInfoEmpty.hidden = visibleCount > 0;
  detailRefs.toggleTableInfoFilterButton.classList.toggle("is-filtered", isTableInfoFiltered());
  detailRefs.tableInfoFilterPopover.hidden = !detailState.tableFilters.filterOpen;
  detailRefs.tableInfoFilterSummary.hidden = !isTableInfoFiltered();
  detailRefs.tableInfoFilterBadge.textContent = buildTableInfoFilterSummaryText();
  renderTableInfoFilterControls();

  if (detailState.tableFilters.filterOpen) {
    positionTableInfoFilterPopover();
  }

  detailRefs.tableInfoBody.innerHTML = filteredTableInfo
    .map((item) => {
      return `
        <tr>
          <td>${escapeHtml(item.schema)}</td>
          <td>
            <strong>${escapeHtml(item.tableName)}</strong>
            <div class="muted-note">${escapeHtml(item.description)}</div>
          </td>
          <td>
            <div class="tracking-stack">
              <strong>${escapeHtml(item.changeTracking.columnLabel)}</strong>
            </div>
          </td>
          <td>
            <div class="tracking-stack">
              <span>${escapeHtml(item.changeTracking.methodLabel)}</span>
            </div>
          </td>
          <td>
            <div class="tracking-stack">
              <strong>${escapeHtml(item.changeTracking.criterionLabel)}</strong>
              <div class="muted-note">${escapeHtml(item.changeTracking.sourceLabel)}</div>
            </div>
          </td>
          <td>
            ${item.assignees.length
              ? `
                <div class="assignee-stack">
                  ${item.assignees.map((assignee) => `<span class="assignee-chip">${escapeHtml(assignee)}</span>`).join("")}
                </div>
              `
              : '<span class="muted-note">-</span>'}
          </td>
          <td class="center-cell">${escapeHtml(formatDateTime(item.updatedAt))}</td>
          <td>${escapeHtml(item.note)}</td>
          <td class="center-cell">
            <button type="button" class="icon-btn edit-icon-btn table-row-edit-btn" aria-label="테이블 정보 수정" title="테이블 정보 수정" data-table-edit="${escapeHtml(item.id)}">
              <svg viewBox="0 0 16 16" focusable="false">
                <path d="M11.8 2.3 13.7 4.2 5.1 12.8 2.5 13.5 3.2 10.9z"></path>
                <path d="M10.9 3.2 12.8 5.1"></path>
              </svg>
            </button>
          </td>
        </tr>
      `;
    })
    .join("");
}

function getFilteredTableInfo(rows) {
  const query = detailState.tableFilters.query.trim().toLowerCase();
  const { scope, method } = detailState.tableFilters.applied;

  return rows.filter((item) => {
    const matchesQuery =
      !query ||
      item.tableName.toLowerCase().includes(query) ||
      item.changeTracking.columnLabel.toLowerCase().includes(query) ||
      item.assignees.some((assignee) => assignee.toLowerCase().includes(query));
    const matchesScope = scope === "ALL" || getTableInfoScopeFilterValue(item) === scope;
    const matchesMethod = method === "ALL" || getTableInfoMethodFilterValue(item) === method;
    return matchesQuery && matchesScope && matchesMethod;
  });
}

function getTableInfoScopeFilterValue(item) {
  return item.rowsOnly ? "ROWS_ONLY" : "FULL_SCAN";
}

function getTableInfoMethodFilterValue(item) {
  const methodLabel = item.changeTracking.methodLabel;
  if (methodLabel === "-") {
    return "DISABLED";
  }
  return methodLabel === "시퀀스" ? "SEQUENCE" : "DATE";
}

function isTableInfoFiltered() {
  return Boolean(
    detailState.tableFilters.query.trim() ||
    detailState.tableFilters.applied.scope !== "ALL" ||
    detailState.tableFilters.applied.method !== "ALL"
  );
}

function buildTableInfoFilterSummaryText() {
  const parts = [];
  const query = detailState.tableFilters.query.trim();
  if (query) {
    parts.push(`검색 "${query}"`);
  }
  if (detailState.tableFilters.applied.scope !== "ALL") {
    parts.push(`검출범위 "${detailState.tableFilters.applied.scope === "ROWS_ONLY" ? "업데이트된 ROW만 검출" : "전체 스캔"}"`);
  }
  if (detailState.tableFilters.applied.method !== "ALL") {
    const methodLabelMap = {
      DATE: "날짜",
      SEQUENCE: "시퀀스",
      DISABLED: "미적용",
    };
    parts.push(`변경감지방식 "${methodLabelMap[detailState.tableFilters.applied.method]}"`);
  }
  return parts.join(" · ");
}

function buildTableInfoToolbarSummaryHtml(totalCount, visibleCount) {
  const start = visibleCount > 0 ? 1 : 0;
  const end = visibleCount;
  return `<span class="toolbar-caption-strong">전체 ${totalCount}건</span> <span class="toolbar-caption-highlight">${start} - ${end} 표시됨</span>`;
}

function syncTableInfoFilterDraft() {
  if (!detailRefs.tableInfoScopeFilterList || !detailRefs.tableInfoMethodFilterList) {
    return;
  }
  detailState.tableFilters.draft = { ...detailState.tableFilters.applied };
}

function renderTableInfoFilterControls() {
  renderTableInfoFilterOptions(
    detailRefs.tableInfoScopeFilterList,
    detailState.tableFilters.draft.scope
  );
  renderTableInfoFilterOptions(
    detailRefs.tableInfoMethodFilterList,
    detailState.tableFilters.draft.method
  );
}

function renderTableInfoFilterOptions(container, selectedValue) {
  [...container.querySelectorAll(".table-info-filter-option")].forEach((button) => {
    button.classList.toggle("is-selected", button.dataset.filterValue === selectedValue);
    button.setAttribute("aria-pressed", String(button.dataset.filterValue === selectedValue));
  });
}

function positionTableInfoFilterPopover() {
  const rect = detailRefs.toggleTableInfoFilterButton.getBoundingClientRect();
  detailRefs.tableInfoFilterPopover.style.top = `${rect.bottom + 8}px`;
  detailRefs.tableInfoFilterPopover.style.left = `${Math.max(12, Math.min(rect.left, window.innerWidth - detailRefs.tableInfoFilterPopover.offsetWidth - 12))}px`;
}

function openTableInfoModal(mode, row = null) {
  detailState.tableForm.open = true;
  detailState.tableForm.mode = mode;
  detailState.tableForm.editingId = row?.id ?? null;

  detailRefs.tableInfoModalTitle.textContent = mode === "create" ? "테이블 정보 등록" : "테이블 정보 수정";
  detailRefs.tableInfoModalCaption.textContent = mode === "create"
    ? "스키마와 테이블명을 모두 전체로 두면 해당 DB 전체 기본 설정으로 저장됩니다."
    : "현재 행 기준으로 테이블 정보와 변경감지 설정을 수정합니다.";

  detailRefs.tableInfoSchemaInput.value = row?.schema ?? "";
  detailRefs.tableInfoTableNameInput.value = row?.tableName ?? "";
  detailRefs.tableInfoDescriptionInput.value = row?.description ?? "";
  detailRefs.tableInfoScopeSelect.value = row?.rowsOnly === false ? "FULL_SCAN" : "ROWS_ONLY";
  detailRefs.tableInfoChangeColumnInput.value = row?.changeTracking?.columnLabel && row.changeTracking.columnLabel !== "-" ? row.changeTracking.columnLabel : "";
  detailRefs.tableInfoMethodSelect.value = row?.changeTracking?.methodLabel === "시퀀스" ? "SEQUENCE" : "DATE";
  detailRefs.tableInfoCriterionInput.value = normalizeCriterionInput(row?.changeTracking?.criterionLabel, detailRefs.tableInfoMethodSelect.value);
  detailRefs.tableInfoAssigneesInput.value = row?.assignees?.join(", ") ?? "";
  detailRefs.tableInfoNoteInput.value = row?.note ?? "";

  syncTableInfoFormState();
  detailRefs.tableInfoModal.hidden = false;
}

function closeTableInfoModal() {
  detailState.tableForm.open = false;
  detailState.tableForm.mode = "create";
  detailState.tableForm.editingId = null;
  detailRefs.tableInfoModal.hidden = true;
}

function syncTableInfoFormState() {
  const rowsOnly = detailRefs.tableInfoScopeSelect.value === "ROWS_ONLY";
  const isSequence = detailRefs.tableInfoMethodSelect.value === "SEQUENCE";
  detailRefs.tableInfoCriterionLabel.textContent = isSequence ? "기준 (조회 건수)" : "기준 (날짜 포맷)";
  detailRefs.tableInfoCriterionInput.placeholder = isSequence ? "예: 50000" : "예: YYYY-MM-DD HH:mm:ss";
  detailRefs.tableInfoChangeColumnInput.disabled = !rowsOnly;
  detailRefs.tableInfoMethodSelect.disabled = !rowsOnly;
  detailRefs.tableInfoCriterionInput.disabled = !rowsOnly;
}

function normalizeCriterionInput(value, method) {
  if (!value || value === "-") {
    return "";
  }
  return method === "SEQUENCE" ? String(value).replace(/건$/, "").replaceAll(",", "").trim() : value;
}

function saveTableInfoDraft() {
  const detail = getCurrentDetail();
  if (!detail) {
    pushDetailToast("저장할 DB 정보를 찾을 수 없습니다.", "danger");
    return;
  }

  const draft = {
    id: detailState.tableForm.editingId,
    originalId: detailState.tableForm.editingId,
    schema: detailRefs.tableInfoSchemaInput.value,
    tableName: detailRefs.tableInfoTableNameInput.value,
    description: detailRefs.tableInfoDescriptionInput.value,
    rowsOnly: detailRefs.tableInfoScopeSelect.value === "ROWS_ONLY",
    changeColumn: detailRefs.tableInfoChangeColumnInput.value,
    changeMethod: detailRefs.tableInfoMethodSelect.value,
    criterion: detailRefs.tableInfoCriterionInput.value,
    assigneesText: detailRefs.tableInfoAssigneesInput.value,
    note: detailRefs.tableInfoNoteInput.value,
  };

  const saved = detailService.saveTableInfo(detail.target.id, draft);
  if (!saved) {
    pushDetailToast("테이블 정보를 저장하지 못했습니다.", "danger");
    return;
  }

  const savedMode = detailState.tableForm.mode;
  closeTableInfoModal();
  renderDetailPage();
  pushDetailToast(savedMode === "create" ? "테이블 정보가 등록되었습니다." : "테이블 정보가 수정되었습니다.", "success");
}

function renderHistory(detail) {
  detailRefs.startInspectionButton.disabled = false;
  detailRefs.historyEmpty.hidden = detail.inspectionHistory.length > 0;

  detailRefs.historyTableBody.innerHTML = detail.inspectionHistory
    .map((record) => {
      const statusMeta = detailService.HISTORY_STATUS_META[record.status];
      const totalAction = record.totalCount > 0
        ? `
          <button type="button" class="history-count-btn" data-history-action="all-detections" data-history-id="${escapeHtml(record.id)}">
            ${record.totalCount.toLocaleString("ko-KR")}
          </button>
        `
        : `<span class="numeric-text">0</span>`;
      const infoButton = record.failureReason.length
        ? `
          <button type="button" class="status-info-btn" aria-label="실패 사유 보기" title="실패 사유 보기" data-history-action="reason" data-history-id="${escapeHtml(record.id)}">
            <svg viewBox="0 0 16 16" focusable="false">
              <path d="M8 11.2v-3"></path>
              <path d="M8 4.7h.01"></path>
              <circle cx="8" cy="8" r="6"></circle>
            </svg>
          </button>
        `
        : "";

      return `
        <tr>
          <td>${escapeHtml(record.scheduleId)}</td>
          <td>${escapeHtml(record.scheduleName)}</td>
          <td>${escapeHtml(record.inspector)}</td>
          <td>
            <span class="history-status">
              <span class="status-pill ${statusMeta.className}">${escapeHtml(statusMeta.label)}</span>
              ${infoButton}
            </span>
          </td>
          <td class="history-rule">${escapeHtml(record.ruleName)}</td>
          <td class="center-cell history-date">${escapeHtml(formatDateTime(record.startedAt))}</td>
          <td class="center-cell history-date">${record.endedAt ? escapeHtml(formatDateTime(record.endedAt)) : "-"}</td>
          <td class="number-cell history-duration">${escapeHtml(formatDuration(record.durationMinutes))}</td>
          <td class="number-cell numeric-text">${record.searchVolume.toLocaleString("ko-KR")}</td>
          <td class="number-cell">${totalAction}</td>
        </tr>
      `;
    })
    .join("");
}

function syncEditState(detail) {
  const editState = detailState.edit;
  if (editState.targetId === detail.target.id) {
    return;
  }
  editState.targetId = detail.target.id;
  editState.infraOpen = false;
  editState.labelOpen = false;
  editState.memoOpen = false;
  editState.saved = {
    infraManager: detail.dbInfo.infraManager,
    infraContact: detail.dbInfo.infraContact,
    labels: [...detail.dbInfo.labels],
    memoLines: [...detail.dbInfo.memo],
  };
  resetDraftFromSaved();
}

function resetDraftFromSaved() {
  detailState.edit.draft = {
    infraManager: detailState.edit.saved.infraManager,
    infraContact: detailState.edit.saved.infraContact,
    labels: [...detailState.edit.saved.labels],
    memoText: detailState.edit.saved.memoLines.join("\n"),
  };
}

function openEdit(kind) {
  resetDraftFromSaved();
  detailState.edit.infraOpen = false;
  detailState.edit.labelOpen = false;
  detailState.edit.memoOpen = false;
  if (kind === "infra") {
    detailState.edit.infraOpen = true;
  }
  if (kind === "label") {
    detailState.edit.labelOpen = true;
  }
  if (kind === "memo") {
    detailState.edit.memoOpen = true;
  }
}

function saveEdit(kind) {
  if (kind === "infra") {
    detailState.edit.saved.infraManager = normalizeText(detailState.edit.draft.infraManager) || "미지정";
    detailState.edit.saved.infraContact = normalizeText(detailState.edit.draft.infraContact);
    detailState.edit.infraOpen = false;
  }
  if (kind === "label") {
    detailState.edit.saved.labels = uniqueValues(detailState.edit.draft.labels);
    detailState.edit.labelOpen = false;
  }
  if (kind === "memo") {
    detailState.edit.saved.memoLines = normalizeLines(detailState.edit.draft.memoText);
    detailState.edit.memoOpen = false;
  }
  resetDraftFromSaved();
}

function cancelEdit(kind) {
  if (kind === "infra") {
    detailState.edit.infraOpen = false;
  }
  if (kind === "label") {
    detailState.edit.labelOpen = false;
  }
  if (kind === "memo") {
    detailState.edit.memoOpen = false;
  }
  resetDraftFromSaved();
}

function renderLabelSection(detail) {
  if (!detail) {
    return;
  }
  const editState = detailState.edit;
  detailRefs.detailLabelList.hidden = editState.labelOpen;
  detailRefs.labelEditPanel.hidden = !editState.labelOpen;
  detailRefs.labelEditPanel.style.display = editState.labelOpen ? "grid" : "none";
  detailRefs.detailLabelList.innerHTML = editState.saved.labels
    .map((label) => `<span class="label-chip">${escapeHtml(label)}</span>`)
    .join("");
  detailRefs.labelDraftList.innerHTML = editState.draft.labels
    .map(
      (label) =>
        `<span class="label-chip is-editable">${escapeHtml(label)}<button type="button" class="chip-remove" data-remove-label="${escapeHtml(label)}">×</button></span>`
    )
    .join("");
  detailRefs.labelEditInput.value = "";
}

function renderMemoSection(detail) {
  if (!detail) {
    return;
  }
  const editState = detailState.edit;
  detailRefs.detailMemoList.hidden = editState.memoOpen;
  detailRefs.memoEditPanel.hidden = !editState.memoOpen;
  detailRefs.memoEditPanel.style.display = editState.memoOpen ? "grid" : "none";
  const memoLine = editState.saved.memoLines.join(" · ");
  detailRefs.detailMemoList.textContent = memoLine || "-";
  detailRefs.detailMemoList.title = memoLine;
  detailRefs.memoEditInput.value = editState.draft.memoText;
}

function appendLabelDraft() {
  const raw = detailRefs.labelEditInput.value;
  if (!raw) {
    return;
  }
  const nextValues = raw
    .split(",")
    .map((value) => normalizeText(value))
    .filter(Boolean);
  if (!nextValues.length) {
    return;
  }
  detailState.edit.draft.labels = uniqueValues([...detailState.edit.draft.labels, ...nextValues]);
  detailRefs.labelEditInput.value = "";
}

function normalizeLines(text) {
  return text
    .split(/\r?\n/)
    .map((line) => normalizeText(line))
    .filter(Boolean);
}

function normalizeText(value) {
  return String(value ?? "").trim();
}

function uniqueValues(values) {
  return [...new Set(values.map((value) => normalizeText(value)).filter(Boolean))];
}

function renderFailureReasonModal(detail) {
  const record = detail?.inspectionHistory.find((item) => item.id === detailState.selectedFailureHistoryId) ?? null;
  const isOpen = Boolean(record);
  detailRefs.failureReasonModal.hidden = !isOpen;

  if (!record) {
    detailRefs.failureReasonCaption.textContent = "점검 실패 상세";
    detailRefs.failureDetectId.textContent = "-";
    detailRefs.failureScheduleName.textContent = "-";
    detailRefs.failureStatusText.textContent = "-";
    detailRefs.failureReasonList.innerHTML = "";
    return;
  }

  const statusMeta = detailService.HISTORY_STATUS_META[record.status];
  detailRefs.failureReasonCaption.textContent = `${record.scheduleName} 실패 상세`;
  detailRefs.failureDetectId.textContent = record.detectId;
  detailRefs.failureScheduleName.textContent = record.scheduleName;
  detailRefs.failureStatusText.textContent = statusMeta.label;
  detailRefs.failureReasonList.innerHTML = record.failureReason
    .map((reason) => `<li>${escapeHtml(reason)}</li>`)
    .join("");
}

function closeFailureReasonModal() {
  detailState.selectedFailureHistoryId = null;
  detailRefs.failureReasonModal.hidden = true;
}

function getCurrentDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("dbId");
  return detailService.getDetailById(id);
}

function buildDetectionListUrl(detail, options = {}) {
  const params = new URLSearchParams();
  params.set("dbId", detail.target.id);
  params.set("target", detail.target.name);
  if (options.detectType) {
    params.set("detectType", options.detectType);
  }
  return `./detection-list.html?${params.toString()}`;
}

function formatDateTime(value) {
  const date = new Date(value);
  const pad = (number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatDuration(minutes) {
  const wholeMinutes = Math.max(0, Math.round(minutes));
  const hours = Math.floor(wholeMinutes / 60);
  const remainMinutes = wholeMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(remainMinutes).padStart(2, "0")}`;
}

function pushDetailToast(message, type = "default") {
  detailShared.pushToast(detailRefs.toastStack, message, type);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
