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

  runRefs.startRunButton.addEventListener("click", () => {
    const targets = getSelectedTargets();
    if (!targets.length) {
      pushRunToast("점검할 DB가 없습니다.", "danger");
      return;
    }
    pushRunToast(`선택한 ${targets.length}대 점검을 시작했습니다.`, "success");
  });

  document.addEventListener("click", (event) => {
    runUserMenuController?.handleDocumentClick(event);
  });

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
    "runTargetTableBody",
    "startRunButton",
    "toastStack",
  ];
  ids.forEach((id) => {
    runRefs[id] = document.getElementById(id);
  });
  runRefs.sidebarNav = document.querySelector(".sidebar-nav");
  runRefs.roleButtons = [...document.querySelectorAll(".role-btn")];
}

function renderRunPage() {
  runSidebarController?.render();
  runUserMenuController?.render();

  const targets = getSelectedTargets();
  runRefs.runHeroTarget.textContent = `선택 DB ${targets.length.toLocaleString("ko-KR")}대`;
  runRefs.runSelectedCount.textContent = targets.length.toLocaleString("ko-KR");
  runRefs.runRunningCount.textContent = targets
    .filter((item) => item.status === "RUNNING")
    .length
    .toLocaleString("ko-KR");
  runRefs.runDetectionTotal.textContent = targets
    .reduce((sum, item) => sum + item.recentDetectionCount, 0)
    .toLocaleString("ko-KR");
  runRefs.runCaption.textContent = targets.length
    ? `${targets.length.toLocaleString("ko-KR")}대가 점검 실행 대상에 포함됩니다.`
    : "선택된 DB가 없습니다.";

  runRefs.runTargetTableBody.innerHTML = targets
    .map(
      (item) => `
        <tr>
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
}

function getSelectedTargets() {
  const params = new URLSearchParams(window.location.search);
  const rawIds = params.get("ids") ?? "";
  const ids = rawIds
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return runService.getTargetsByIds(ids);
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
