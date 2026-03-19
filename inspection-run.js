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
};

document.addEventListener("DOMContentLoaded", initRunPage);

function initRunPage() {
  cacheRunRefs();
  runSidebarController = runShared.initSidebar({
    sidebarNav: runRefs.sidebarNav,
    sidebarToggle: runRefs.sidebarToggle,
    roleButtons: runRefs.roleButtons,
    getState: () => runState,
    onRoleChange: renderRunPage,
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

  bindRunEvents();
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
    "selectedTargetCount",
    "scheduleNameInput",
    "scheduleCycleSelect",
    "scheduleStartInput",
    "vendorMessageInput",
    "backToTargetButton",
    "saveScheduleButton",
    "runTargetTableBody",
    "runTargetEmpty",
    "toastStack",
  ];
  ids.forEach((id) => {
    runRefs[id] = document.getElementById(id);
  });
  runRefs.sidebarNav = document.querySelector(".sidebar-nav");
  runRefs.roleButtons = [...document.querySelectorAll(".role-btn")];
}

function bindRunEvents() {
  runRefs.backToTargetButton.addEventListener("click", () => {
    window.location.href = "./inspection-target.html";
  });

  runRefs.saveScheduleButton.addEventListener("click", () => {
    const selectedTargets = getSelectedTargets();
    if (!selectedTargets.length) {
      pushRunToast("선택된 DB가 없습니다.", "danger");
      return;
    }
    pushRunToast(`선택한 ${selectedTargets.length}대 기준으로 스케줄 저장 화면을 준비했습니다.`, "success");
  });

  document.addEventListener("click", (event) => {
    runUserMenuController?.handleDocumentClick(event);
  });
}

function renderRunPage() {
  runSidebarController?.render();
  runUserMenuController?.render();
  renderSelectedTargets();
}

function renderSelectedTargets() {
  const selectedTargets = getSelectedTargets();
  runRefs.selectedTargetCount.textContent = `${selectedTargets.length.toLocaleString("ko-KR")}대 선택`;
  runRefs.runTargetEmpty.hidden = selectedTargets.length > 0;
  runRefs.runTargetTableBody.innerHTML = selectedTargets
    .map((item) => {
      return `
        <tr>
          <td>${escapeHtml(item.id.toUpperCase())}</td>
          <td>
            <div class="run-target-name">
              <strong>${escapeHtml(item.name)}</strong>
              <span class="subtle-text">${escapeHtml(item.host)}:${escapeHtml(item.port)}/${escapeHtml(item.instanceName)}</span>
            </div>
          </td>
          <td class="center-cell">${escapeHtml(item.dbType)}</td>
          <td>${escapeHtml(item.recentScheduleName)}</td>
          <td class="number-cell">${item.recentTableCount.toLocaleString("ko-KR")}</td>
          <td class="center-cell">${renderStatusChip(item.status)}</td>
          <td>${renderLabelCell(item.labels)}</td>
        </tr>
      `;
    })
    .join("");
}

function getSelectedTargets() {
  const params = new URLSearchParams(window.location.search);
  const ids = (params.get("ids") ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return runService.getTargetsByIds(ids);
}

function renderStatusChip(status) {
  const meta = runService.STATUS_META[status];
  if (!meta) {
    return "-";
  }
  return `<span class="inspection-status-chip ${meta.className}">${escapeHtml(meta.label)}</span>`;
}

function renderLabelCell(labels) {
  return `<div class="label-chip-wrap">${labels
    .slice(0, 3)
    .map((label) => `<span class="label-chip compact">${escapeHtml(label)}</span>`)
    .join("")}</div>`;
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
