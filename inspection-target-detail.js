const detailService = window.MockInspectionTargetService;
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

  document.addEventListener("click", (event) => {
    detailUserMenuController?.handleDocumentClick(event);
  });

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
    "detailDbType",
    "detailStatusText",
    "detailTableCount",
    "detailDetectionCount",
    "infoName",
    "infoServiceName",
    "infoHost",
    "infoInstance",
    "infoOwnerTeam",
    "infoStartedAt",
    "infoDescription",
    "detailLabelList",
    "detailNotes",
    "openDetectionListLink",
    "openRunPageLink",
    "toastStack",
  ];
  ids.forEach((id) => {
    detailRefs[id] = document.getElementById(id);
  });
  detailRefs.sidebarNav = document.querySelector(".sidebar-nav");
  detailRefs.roleButtons = [...document.querySelectorAll(".role-btn")];
}

function renderDetailPage() {
  detailSidebarController?.render();
  detailUserMenuController?.render();

  const target = getCurrentTarget();
  if (!target) {
    detailRefs.detailHeroTarget.textContent = "대상 없음";
    detailRefs.detailBreadcrumbName.textContent = "대상 없음";
    return;
  }

  detailRefs.detailHeroTarget.textContent = target.name;
  detailRefs.detailBreadcrumbName.textContent = target.name;
  detailRefs.detailDbType.textContent = target.dbType;
  detailRefs.detailStatusText.textContent = detailService.STATUS_META[target.status].label;
  detailRefs.detailTableCount.textContent = target.recentTableCount.toLocaleString("ko-KR");
  detailRefs.detailDetectionCount.textContent = target.recentDetectionCount.toLocaleString("ko-KR");
  detailRefs.infoName.textContent = target.name;
  detailRefs.infoServiceName.textContent = target.serviceName;
  detailRefs.infoHost.textContent = `${target.host}:${target.port}`;
  detailRefs.infoInstance.textContent = target.instanceName;
  detailRefs.infoOwnerTeam.textContent = target.ownerTeam;
  detailRefs.infoStartedAt.textContent = formatDateTime(target.inspectionStartedAt);
  detailRefs.infoDescription.textContent = target.description;
  detailRefs.detailLabelList.innerHTML = target.labels.map((label) => `<span class="label-chip">${escapeHtml(label)}</span>`).join("");
  detailRefs.detailNotes.innerHTML = [
    `${target.dbType} 유형 라벨은 등록 시 기본 부여됩니다.`,
    `${target.ownerTeam} 기준 운영 대상이며 최근 점검 소요시간은 ${formatDuration(target.durationMinutes)}입니다.`,
    `최근 검출건수 ${target.recentDetectionCount.toLocaleString("ko-KR")}건 상세는 검출목록 링크로 이동합니다.`,
  ]
    .map((note) => `<li>${escapeHtml(note)}</li>`)
    .join("");
  detailRefs.openDetectionListLink.href = `./detection-list.html?dbId=${encodeURIComponent(target.id)}`;
  detailRefs.openRunPageLink.href = `./inspection-run.html?ids=${encodeURIComponent(target.id)}`;
}

function getCurrentTarget() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("dbId");
  return detailService.findTargetById(id) ?? detailService.getTargets()[0] ?? null;
}

function formatDateTime(value) {
  const date = new Date(value);
  const pad = (number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const remainMinutes = minutes % 60;
  if (!hours) {
    return `${remainMinutes}분`;
  }
  if (!remainMinutes) {
    return `${hours}시간`;
  }
  return `${hours}시간 ${remainMinutes}분`;
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
