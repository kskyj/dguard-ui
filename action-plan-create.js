const shared = window.DGuardShared;
const detectionService = window.MockDetectionService;
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
  targetName: "",
  selectionIds: [],
  targets: [],
  form: {
    cause: "",
    method: "",
    dueDate: "",
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
  loadSelection();
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
    "planTargetName",
    "planSelectionCaption",
    "planTargetBody",
    "planTargetEmpty",
    "planCauseInput",
    "planCauseCount",
    "planMethodInput",
    "planMethodCount",
    "planDueDateInput",
    "savePlanButton",
    "toastStack",
  ];
  ids.forEach((id) => {
    refs[id] = document.getElementById(id);
  });
  refs.sidebarNav = document.querySelector(".sidebar-nav");
  refs.roleButtons = [...document.querySelectorAll(".role-btn")];
}

function bindEvents() {
  refs.planCauseInput.addEventListener("input", (event) => {
    state.form.cause = event.target.value.slice(0, 600);
    renderFormCounters();
    renderSaveState();
  });

  refs.planMethodInput.addEventListener("input", (event) => {
    state.form.method = event.target.value.slice(0, 600);
    renderFormCounters();
    renderSaveState();
  });

  refs.planDueDateInput.addEventListener("change", (event) => {
    state.form.dueDate = event.target.value;
    renderSaveState();
  });

  refs.savePlanButton.addEventListener("click", handleSave);

  document.addEventListener("click", (event) => {
    userMenuController?.handleDocumentClick(event);
  });
}

function loadSelection() {
  state.selectionIds = actionPlanService.getSelectionIds();
  const targetName = sessionStorage.getItem("dguard.actionPlanTarget") ?? "";
  state.targetName = targetName.trim();
  state.targets = state.selectionIds
    .map((id) => detectionService.findDetectionById(id))
    .filter(Boolean);
}

function getCurrentActor() {
  return state.role === "admin" ? "관리자" : "김성진";
}

function render() {
  sidebarController?.render();
  userMenuController?.render();
  refs.planTargetName.textContent = state.targetName || "DB 선택";
  renderTargets();
  renderFormCounters();
  renderSaveState();
}

function renderTargets() {
  refs.planTargetBody.innerHTML = "";
  refs.planTargetEmpty.hidden = state.targets.length > 0;
  refs.planSelectionCaption.textContent = state.targets.length
    ? `총 ${state.targets.length}건의 조치대상 검출단위가 선택되었습니다.`
    : "선택된 조치대상 검출단위를 확인하세요.";

  state.targets.forEach((target) => {
    const row = document.createElement("tr");

    const idCell = document.createElement("td");
    idCell.textContent = target.detectId ?? target.id ?? "-";

    const pathCell = document.createElement("td");
    pathCell.innerHTML = `<span class="path-text">${escapeHtml(target.path)}</span>`;

    const typeCell = document.createElement("td");
    typeCell.textContent = target.detectType ?? "-";

    const countCell = document.createElement("td");
    countCell.className = "number-cell";
    countCell.textContent = Number(target.count ?? 0).toLocaleString("ko-KR");

    const statusCell = document.createElement("td");
    const statusLabel = detectionService.STATUS_META?.[target.status]?.label ?? target.status ?? "-";
    statusCell.innerHTML = `<span class="status-chip ${detectionService.STATUS_META?.[target.status]?.className ?? ""}">${statusLabel}</span>`;

    row.append(idCell, pathCell, typeCell, countCell, statusCell);
    refs.planTargetBody.appendChild(row);
  });
}

function renderFormCounters() {
  refs.planCauseInput.value = state.form.cause;
  refs.planMethodInput.value = state.form.method;
  refs.planCauseCount.textContent = `${state.form.cause.length} / 600`;
  refs.planMethodCount.textContent = `${state.form.method.length} / 600`;
}

function renderSaveState() {
  const hasTargets = state.targets.length > 0;
  const ready =
    hasTargets &&
    state.form.cause.trim().length > 0 &&
    state.form.method.trim().length > 0 &&
    state.form.dueDate;
  refs.savePlanButton.disabled = !ready;
}

function handleSave() {
  if (!state.targets.length) {
    pushToast("조치계획 대상 검출단위가 없습니다.", "danger");
    return;
  }
  if (!state.form.cause.trim() || !state.form.method.trim() || !state.form.dueDate) {
    pushToast("검출원인, 조치방법, 조치완료일을 모두 입력하세요.", "danger");
    return;
  }

  actionPlanService.createPlan({
    targets: state.targets,
    cause: state.form.cause.trim(),
    method: state.form.method.trim(),
    dueDate: state.form.dueDate,
    actor: getCurrentActor(),
    dbName: state.targetName || "DB 미지정",
  });

  pushToast("조치계획서가 저장되었습니다.", "success");
  window.location.href = "action-plan.html";
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
