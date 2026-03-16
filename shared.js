(() => {
  "use strict";

  const DEFAULT_MENU_KEY = "inspection-target";
  const SIDEBAR_MENUS = {
    admin: [
      { key: "dashboard", label: "대시보드", icon: "▥", href: "#" },
      { key: "inspection-target", label: "점검대상", icon: "◎", href: "inspection-target.html" },
      { key: "analysis-history", label: "점검이력", icon: "◴", href: "analysis-history.html" },
      { key: "exception-request", label: "제외신청관리", icon: "⊖", href: "exception-request.html" },
      { key: "action-plan", label: "조치계획관리", icon: "✎", href: "action-plan.html" },
      { key: "board", label: "게시판", icon: "☰", href: "#" },
      {
        key: "policy-management",
        label: "정책관리",
        icon: "⚙",
        children: [
          { key: "policy-profile", label: "검출정책", icon: "◌", href: "#" },
          { key: "policy-exception-filter", label: "예외필터", icon: "◇", href: "#" },
        ],
      },
      {
        key: "target-management",
        label: "대상관리",
        icon: "▤",
        children: [
          { key: "target-server-db", label: "서버/DB", icon: "▣", href: "#" },
          { key: "target-account", label: "접속계정", icon: "◍", href: "#" },
          { key: "target-group", label: "그룹", icon: "◑", href: "#" },
          { key: "target-image-server", label: "이미지서버", icon: "◫", href: "#" },
          { key: "target-server-token", label: "서버토큰", icon: "◇", href: "#" },
        ],
      },
      {
        key: "security-management",
        label: "보안관리",
        icon: "※",
        children: [
          { key: "security-user", label: "사용자", icon: "◉", href: "#" },
          { key: "security-user-group", label: "사용자 그룹", icon: "◍", href: "#" },
          { key: "security-access-right", label: "접근 권한", icon: "≣", href: "#" },
          { key: "security-log", label: "로그", icon: "⋯", href: "#" },
        ],
      },
    ],
    user: [
      { key: "inspection-target", label: "점검대상", icon: "◎", href: "inspection-target.html" },
      { key: "analysis-history", label: "점검이력", icon: "◴", href: "analysis-history.html" },
      { key: "exception-request", label: "제외신청관리", icon: "⊖", href: "exception-request.html" },
      { key: "action-plan", label: "조치계획관리", icon: "✎", href: "action-plan.html" },
      { key: "board", label: "게시판", icon: "☰", href: "#" },
    ],
  };

  function getSidebarMenu(role = "admin") {
    return SIDEBAR_MENUS[role] ?? SIDEBAR_MENUS.user;
  }

  function getDefaultMenuKey(role = "admin") {
    const menu = getSidebarMenu(role);
    const availableKeys = menu.flatMap((item) => [item.key, ...(item.children?.map((child) => child.key) ?? [])]);
    return availableKeys.includes(DEFAULT_MENU_KEY) ? DEFAULT_MENU_KEY : availableKeys[0] ?? null;
  }

  function findMenuItemByKey(role, key) {
    const menu = getSidebarMenu(role);
    for (const item of menu) {
      if (item.key === key) {
        return item;
      }
      if (item.children?.length) {
        const found = item.children.find((child) => child.key === key);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  function createSidebarButton(item, selectedMenuKey, options = {}) {
    const { child = false, parentGroupKey = null } = options;
    const button = document.createElement("button");
    button.type = "button";
    button.className = `sidebar-item${child ? " is-child-item" : ""}`;
    button.dataset.menuKey = item.key;
    if (parentGroupKey) {
      button.dataset.parentGroupKey = parentGroupKey;
    }
    if (item.href) {
      button.dataset.href = item.href;
    }
    button.classList.toggle("is-active", item.key === selectedMenuKey);
    if (item.key === selectedMenuKey) {
      button.setAttribute("aria-current", "page");
    }

    const icon = document.createElement("span");
    icon.className = "sidebar-icon";
    icon.textContent = item.icon;

    const label = document.createElement("span");
    label.className = "sidebar-label";
    label.textContent = item.label;

    button.append(icon, label);
    return button;
  }

  function createSidebarGroup(item, selectedMenuKey, openSidebarGroupKey) {
    const group = document.createElement("div");
    group.className = "sidebar-group";
    group.classList.toggle("is-open", openSidebarGroupKey === item.key);

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "sidebar-item sidebar-group-trigger";
    trigger.dataset.groupKey = item.key;
    trigger.dataset.menuKey = item.key;
    trigger.setAttribute("aria-haspopup", "true");
    trigger.setAttribute("aria-expanded", String(openSidebarGroupKey === item.key));
    trigger.classList.toggle(
      "is-active",
      item.key === selectedMenuKey || item.children.some((child) => child.key === selectedMenuKey)
    );
    if (item.key === selectedMenuKey) {
      trigger.setAttribute("aria-current", "page");
    }

    const icon = document.createElement("span");
    icon.className = "sidebar-icon";
    icon.textContent = item.icon;

    const label = document.createElement("span");
    label.className = "sidebar-label";
    label.textContent = item.label;

    const plus = document.createElement("span");
    plus.className = "sidebar-group-plus";
    plus.textContent = openSidebarGroupKey === item.key ? "-" : "+";

    trigger.append(icon, label, plus);

    const submenu = document.createElement("div");
    submenu.className = "sidebar-submenu";
    submenu.setAttribute("role", "menu");
    submenu.setAttribute("aria-label", `${item.label} 하위 메뉴`);
    item.children.forEach((child) => {
      submenu.appendChild(createSidebarButton(child, selectedMenuKey, { child: true, parentGroupKey: item.key }));
    });

    group.append(trigger, submenu);
    return group;
  }

  function renderSidebar(options) {
    const { container, role, selectedMenuKey, openSidebarGroupKey } = options;
    const menu = getSidebarMenu(role);
    const availableKeys = menu.flatMap((item) => [item.key, ...(item.children?.map((child) => child.key) ?? [])]);
    let nextSelectedMenuKey = selectedMenuKey;
    let nextOpenSidebarGroupKey = openSidebarGroupKey;

    if (!availableKeys.includes(nextSelectedMenuKey)) {
      nextSelectedMenuKey = getDefaultMenuKey(role);
    }

    const groupKeys = menu.filter((item) => item.children?.length).map((item) => item.key);
    if (nextOpenSidebarGroupKey && !groupKeys.includes(nextOpenSidebarGroupKey)) {
      nextOpenSidebarGroupKey = null;
    }
    if (!nextOpenSidebarGroupKey) {
      const selectedParent = menu.find((item) => item.children?.some((child) => child.key === nextSelectedMenuKey));
      if (selectedParent) {
        nextOpenSidebarGroupKey = selectedParent.key;
      }
    }

    container.setAttribute("aria-label", role === "admin" ? "관리자 메뉴" : "일반사용자 메뉴");
    container.innerHTML = "";

    menu.forEach((item) => {
      if (item.children?.length) {
        container.appendChild(createSidebarGroup(item, nextSelectedMenuKey, nextOpenSidebarGroupKey));
        return;
      }
      container.appendChild(createSidebarButton(item, nextSelectedMenuKey));
    });

    return {
      selectedMenuKey: nextSelectedMenuKey,
      openSidebarGroupKey: nextOpenSidebarGroupKey,
    };
  }

  function initSidebar(options) {
    const { sidebarNav, sidebarToggle, roleButtons, getState, onRoleChange, onNavigate, onRender } = options;

    sidebarToggle.addEventListener("click", () => {
      const state = getState();
      state.sidebarCollapsed = !state.sidebarCollapsed;
      onRender?.();
    });

    sidebarNav.addEventListener("click", (event) => {
      const state = getState();
      const groupTrigger = event.target.closest("[data-group-key]");
      if (groupTrigger) {
        const groupKey = groupTrigger.dataset.groupKey;
        state.selectedMenuKey = groupKey;
        state.openSidebarGroupKey = state.openSidebarGroupKey === groupKey ? null : groupKey;
        onRender?.();
        return;
      }

      const item = event.target.closest("[data-menu-key]");
      if (!item || item.hasAttribute("data-group-key")) {
        return;
      }

      state.selectedMenuKey = item.dataset.menuKey;
      state.openSidebarGroupKey = item.dataset.parentGroupKey ?? null;
      onRender?.();

      const menuItem = findMenuItemByKey(state.role, item.dataset.menuKey);
      if (!menuItem || !menuItem.href || menuItem.href === "#") {
        return;
      }
      if (typeof onNavigate === "function") {
        onNavigate(menuItem);
        return;
      }
      const currentPath = window.location.pathname.split("/").pop() || "index.html";
      if (currentPath !== menuItem.href) {
        window.location.href = menuItem.href;
      }
    });

    roleButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const state = getState();
        const nextRole = button.dataset.role;
        if (state.role === nextRole) {
          return;
        }
        state.role = nextRole;
        state.selectedMenuKey = getDefaultMenuKey(nextRole);
        state.openSidebarGroupKey = null;
        onRoleChange?.(nextRole);
        onRender?.();
      });
    });

    return {
      render() {
        const state = getState();
        document.body.classList.toggle("sidebar-collapsed", state.sidebarCollapsed);
        sidebarToggle.textContent = state.sidebarCollapsed ? ">" : "<";
        sidebarToggle.setAttribute("aria-expanded", String(!state.sidebarCollapsed));
        roleButtons.forEach((button) => {
          button.classList.toggle("is-active", button.dataset.role === state.role);
        });
        const normalized = renderSidebar({
          container: sidebarNav,
          role: state.role,
          selectedMenuKey: state.selectedMenuKey,
          openSidebarGroupKey: state.openSidebarGroupKey,
        });
        state.selectedMenuKey = normalized.selectedMenuKey;
        state.openSidebarGroupKey = normalized.openSidebarGroupKey;
      },
    };
  }

  function initUserMenu(options) {
    const { root, trigger, panel, settingsButton, logoutButton, getState, onRender, onSettings, onLogout } = options;

    trigger.addEventListener("click", () => {
      const state = getState();
      state.userMenuOpen = !state.userMenuOpen;
      onRender?.();
    });

    settingsButton?.addEventListener("click", () => {
      const state = getState();
      state.userMenuOpen = false;
      onSettings?.();
      onRender?.();
    });

    logoutButton?.addEventListener("click", () => {
      const state = getState();
      state.userMenuOpen = false;
      onLogout?.();
      onRender?.();
    });

    return {
      render() {
        const state = getState();
        trigger.setAttribute("aria-expanded", String(state.userMenuOpen));
        panel.hidden = !state.userMenuOpen;
      },
      handleDocumentClick(event) {
        const state = getState();
        if (root.contains(event.target) || !state.userMenuOpen) {
          return;
        }
        state.userMenuOpen = false;
        onRender?.();
      },
    };
  }

  function renderPagination(container, totalItems, pageSize, currentPage, onClick) {
    container.innerHTML = "";
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    const prev = document.createElement("button");
    prev.type = "button";
    prev.textContent = "이전";
    prev.disabled = currentPage === 1 || totalItems === 0;
    prev.addEventListener("click", () => onClick(currentPage - 1));
    container.appendChild(prev);

    for (let page = 1; page <= totalPages; page += 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = String(page);
      button.disabled = totalItems === 0;
      button.classList.toggle("is-active", page === currentPage);
      button.addEventListener("click", () => onClick(page));
      container.appendChild(button);
    }

    const next = document.createElement("button");
    next.type = "button";
    next.textContent = "다음";
    next.disabled = currentPage === totalPages || totalItems === 0;
    next.addEventListener("click", () => onClick(currentPage + 1));
    container.appendChild(next);
  }

  function pushToast(container, message, type = "default") {
    const toast = document.createElement("div");
    toast.className = `toast ${type === "default" ? "" : `is-${type}`}`.trim();
    toast.textContent = message;
    container.appendChild(toast);
    window.setTimeout(() => {
      toast.remove();
    }, 2600);
  }

  window.DGuardShared = {
    DEFAULT_MENU_KEY,
    SIDEBAR_MENUS,
    getSidebarMenu,
    getDefaultMenuKey,
    renderSidebar,
    initSidebar,
    initUserMenu,
    renderPagination,
    pushToast,
  };
})();
