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
    "summaryGroupName",
    "summaryTableCount",
    "summaryOwnerCount",
    "summaryLatestStatus",
    "dbInfoGrid",
    "detailLabelList",
    "detailMemoList",
    "tableInfoSummary",
    "tableInfoBody",
    "tableInfoEmpty",
    "historyCaption",
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
}

function bindDetailEvents() {
  detailRefs.startInspectionButton.addEventListener("click", () => {
    const detail = getCurrentDetail();
    if (!detail) {
      pushDetailToast("선택된 DB 정보를 찾을 수 없습니다.", "danger");
      return;
    }
    window.location.href = `./inspection-run.html?ids=${encodeURIComponent(detail.target.id)}`;
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
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !detailRefs.failureReasonModal.hidden) {
      closeFailureReasonModal();
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

  const latestHistory = detail.inspectionHistory[0] ?? null;
  const latestStatusMeta = latestHistory
    ? detailService.HISTORY_STATUS_META[latestHistory.status]
    : { label: "-", className: "is-waiting" };

  detailRefs.detailHeroTarget.textContent = `${detail.target.name} (${detail.target.host}:${detail.target.port}/${detail.target.instanceName})`;
  detailRefs.detailBreadcrumbName.textContent = detail.target.name;
  detailRefs.summaryGroupName.textContent = detail.dbInfo.groupName;
  detailRefs.summaryTableCount.textContent = detail.tableInfo.length.toLocaleString("ko-KR");
  detailRefs.summaryOwnerCount.textContent = detail.summary.mappedOwnerCount.toLocaleString("ko-KR");
  detailRefs.summaryLatestStatus.textContent = latestStatusMeta.label;
  detailRefs.summaryLatestStatus.className = "";
  detailRefs.summaryLatestStatus.classList.add(latestStatusMeta.className);

  renderDbInfo(detail);
  renderTableInfo(detail);
  renderHistory(detail);
  renderFailureReasonModal(detail);
}

function renderEmptyDetailState() {
  detailRefs.detailHeroTarget.textContent = "DB 선택";
  detailRefs.detailBreadcrumbName.textContent = "DB 상세";
  detailRefs.summaryGroupName.textContent = "-";
  detailRefs.summaryTableCount.textContent = "0";
  detailRefs.summaryOwnerCount.textContent = "0";
  detailRefs.summaryLatestStatus.textContent = "-";
  detailRefs.summaryLatestStatus.className = "";
  detailRefs.dbInfoGrid.innerHTML = "";
  detailRefs.detailLabelList.innerHTML = "";
  detailRefs.detailMemoList.innerHTML = "";
  detailRefs.tableInfoSummary.innerHTML = "";
  detailRefs.tableInfoBody.innerHTML = "";
  detailRefs.historyTableBody.innerHTML = "";
  detailRefs.tableInfoEmpty.hidden = false;
  detailRefs.historyEmpty.hidden = false;
  detailRefs.startInspectionButton.disabled = true;
  closeFailureReasonModal();
}

function renderDbInfo(detail) {
  const proxyStatusMeta = detailService.PROXY_STATUS_META[detail.dbInfo.proxy.status];
  const fields = [
    { label: "DB ID", value: detail.dbInfo.dbId },
    { label: "그룹명", value: detail.dbInfo.groupName },
    {
      label: "Proxy(에이전트)",
      value: detail.dbInfo.proxy.name,
      note: `${detail.dbInfo.proxy.ip} / ${detail.dbInfo.proxy.version}`,
      badge: `<span class="proxy-pill ${proxyStatusMeta.className}">${proxyStatusMeta.label}</span>`,
    },
    {
      label: "Host / Instance",
      value: `${detail.target.host}:${detail.target.port}`,
      note: detail.target.instanceName,
    },
    { label: "DB 등록일시", value: formatDateTime(detail.dbInfo.registeredAt) },
    { label: "최근 점검일시", value: formatDateTime(detail.summary.latestStartedAt) },
    {
      label: "DB 인프라 담당자",
      value: detail.dbInfo.infraManager,
      note: detail.dbInfo.infraContact,
    },
    { label: "메인 설명", value: detail.target.description },
  ];

  detailRefs.dbInfoGrid.innerHTML = fields
    .map((field) => {
      const valueHtml = field.note
        ? `
          <div class="value-with-note">
            <div class="inline-badge-row">
              <strong>${escapeHtml(field.value)}</strong>
              ${field.badge ?? ""}
            </div>
            <span class="field-note">${escapeHtml(field.note)}</span>
          </div>
        `
        : `
          <div class="inline-badge-row">
            <strong>${escapeHtml(field.value)}</strong>
            ${field.badge ?? ""}
          </div>
        `;
      return `
        <div class="detail-field">
          <span>${escapeHtml(field.label)}</span>
          ${valueHtml}
        </div>
      `;
    })
    .join("");

  detailRefs.detailLabelList.innerHTML = detail.dbInfo.labels
    .map((label) => `<span class="label-chip">${escapeHtml(label)}</span>`)
    .join("");
  detailRefs.detailMemoList.innerHTML = detail.dbInfo.memo
    .map((note) => `<li>${escapeHtml(note)}</li>`)
    .join("");
}

function renderTableInfo(detail) {
  detailRefs.tableInfoEmpty.hidden = detail.tableInfo.length > 0;
  detailRefs.tableInfoSummary.innerHTML = [
    `업데이트된 ROW만 검출 설정 ${detail.summary.rowsOnlyEnabledCount}개`,
    `전체 테이블 ${detail.tableInfo.length}개`,
    `매핑 담당자 ${detail.summary.mappedOwnerCount}명`,
  ]
    .map((text) => `<span class="info-badge">${escapeHtml(text)}</span>`)
    .join("");

  detailRefs.tableInfoBody.innerHTML = detail.tableInfo
    .map((item) => {
      return `
        <tr>
          <td>${escapeHtml(item.schema)}</td>
          <td>
            <strong>${escapeHtml(item.tableName)}</strong>
            <div class="muted-note">${escapeHtml(item.description)}</div>
          </td>
          <td><span class="setting-pill ${item.rowsOnly ? "is-enabled" : "is-disabled"}">${escapeHtml(item.scopeLabel)}</span></td>
          <td>${escapeHtml(item.changeKey)}</td>
          <td>
            <div class="assignee-stack">
              ${item.assignees.map((assignee) => `<span class="assignee-chip">${escapeHtml(assignee)}</span>`).join("")}
            </div>
          </td>
          <td class="center-cell">${escapeHtml(formatDateTime(item.updatedAt))}</td>
          <td>${escapeHtml(item.note)}</td>
        </tr>
      `;
    })
    .join("");
}

function renderHistory(detail) {
  detailRefs.startInspectionButton.disabled = false;
  detailRefs.historyEmpty.hidden = detail.inspectionHistory.length > 0;
  detailRefs.historyCaption.textContent = `최근 ${detail.inspectionHistory.length}건의 점검 실행 이력입니다.`;

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
      const residentAction = record.residentCount > 0
        ? `
          <button type="button" class="history-count-btn" data-history-action="resident-detections" data-history-id="${escapeHtml(record.id)}">
            ${record.residentCount.toLocaleString("ko-KR")}
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
          <td>${escapeHtml(record.detectId)}</td>
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
          <td class="number-cell">${residentAction}</td>
          <td class="number-cell numeric-text">${record.driverLicenseCount.toLocaleString("ko-KR")}</td>
          <td class="number-cell numeric-text">${record.passportCount.toLocaleString("ko-KR")}</td>
          <td class="number-cell numeric-text">${record.cardCount.toLocaleString("ko-KR")}</td>
        </tr>
      `;
    })
    .join("");
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
