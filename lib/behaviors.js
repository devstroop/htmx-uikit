/**
 * uikit-htmx behaviors — tiny, dependency-free enhancements that HTML
 * cannot express. All hooks are data-se-* attributes; htmx attributes
 * remain available for server-driven swaps.
 *
 * Components:
 *   Tabs        [data-se-tabs] ARIA tabs: click, arrows, Home/End
 *   Accordion   [data-se-accordion] (data-se-accordion-multiple for multi)
 *   Tooltip     [data-se-tooltip] hover/focus, Escape, aria-describedby
 *   Dialog      <dialog data-se-dialog> + [data-se-dialog-open="#id"]
 *   Toast       [data-se-toast] container + window.seToast(options)
 *   Dismiss     [data-se-dismiss] removes the closest [data-se-dismissable]
 *   Interactive [data-se-interactive] Enter/Space dispatch click
 *   Sidebar     [data-se-sidebar-toggle="#id"] toggles --collapsed on the
 *               target sidebar and mirrors aria-expanded on the trigger;
 *               [data-se-sidebar-mask="#id"] closes the target drawer
 *               (Escape closes any open drawer)
 *   Theme       [data-se-theme-switch] flips data-theme on <html>
 */

(function () {
  "use strict";

  function on(selector, event, handler) {
    document.addEventListener(event, (e) => {
      const target = e.target instanceof Element ? e.target.closest(selector) : null;
      if (target) handler(target, e);
    });
  }

  /* ---------------- Tabs ---------------- */

  function activateTab(tab) {
    const root = tab.closest("[data-se-tabs]");
    if (!root) return;
    const key = tab.getAttribute("data-se-tab-key");
    root.querySelectorAll("[data-se-tab]").forEach((t) => {
      const active = t === tab;
      t.classList.toggle("se-tabs-tab--active", active);
      t.setAttribute("aria-selected", String(active));
      t.tabIndex = active ? 0 : -1;
    });
    root.querySelectorAll("[data-se-tabpanel]").forEach((panel) => {
      panel.hidden = panel.getAttribute("data-se-tab-key") !== key;
    });
  }

  on("[data-se-tab]", "click", (tab) => {
    if (tab.disabled) return;
    activateTab(tab);
    tab.focus();
  });

  on("[data-se-tablist]", "keydown", (list, e) => {
    const tabs = [...list.querySelectorAll("[data-se-tab]")].filter((t) => !t.disabled);
    const index = tabs.indexOf(document.activeElement);
    if (index < 0) return;
    const vertical = list.dataset.seTablistOrientation === "vertical";
    let next = -1;
    if ((!vertical && e.key === "ArrowRight") || (vertical && e.key === "ArrowDown")) {
      next = (index + 1) % tabs.length;
    } else if ((!vertical && e.key === "ArrowLeft") || (vertical && e.key === "ArrowUp")) {
      next = (index - 1 + tabs.length) % tabs.length;
    } else if (e.key === "Home") {
      next = 0;
    } else if (e.key === "End") {
      next = tabs.length - 1;
    }
    if (next >= 0) {
      e.preventDefault();
      activateTab(tabs[next]);
      tabs[next].focus();
    }
  });

  /* ---------------- Accordion ---------------- */

  function toggleAccordion(trigger) {
    const root = trigger.closest("[data-se-accordion]");
    const item = trigger.closest("[data-se-accordion-item]");
    if (!root || !item) return;
    const panel = item.querySelector("[data-se-accordion-panel]");
    if (!panel) return;
    const isOpen = trigger.getAttribute("aria-expanded") === "true";
    if (!root.hasAttribute("data-se-accordion-multiple")) {
      root.querySelectorAll("[data-se-accordion-trigger][aria-expanded='true']").forEach((t) => {
        if (t !== trigger) {
          t.setAttribute("aria-expanded", "false");
          t.closest("[data-se-accordion-item]")?.querySelector("[data-se-accordion-panel]")?.removeAttribute("open");
        }
      });
    }
    trigger.setAttribute("aria-expanded", String(!isOpen));
    if (isOpen) panel.removeAttribute("open");
    else panel.setAttribute("open", "");
  }

  on("[data-se-accordion-trigger]", "click", (trigger) => toggleAccordion(trigger));

  /* ---------------- Tooltip ---------------- */

  on("[data-se-tooltip]", "mouseenter", (root) => scheduleTooltip(root, true));
  on("[data-se-tooltip]", "mouseleave", (root) => setTooltip(root, false));
  on("[data-se-tooltip]", "focusin", (root) => scheduleTooltip(root, true));
  on("[data-se-tooltip]", "focusout", (root) => setTooltip(root, false));
  on("[data-se-tooltip]", "keydown", (root, e) => {
    if (e.key === "Escape") setTooltip(root, false);
  });

  function scheduleTooltip(root, open) {
    clearTimeout(root._seTooltipTimer);
    if (!open) return;
    const delay = Number(root.getAttribute("data-se-delay-ms") ?? 300);
    root._seTooltipTimer = setTimeout(() => setTooltip(root, true), delay);
  }

  function setTooltip(root, open) {
    clearTimeout(root._seTooltipTimer);
    const bubble = root.querySelector("[data-se-tooltip-content]");
    const trigger = root.firstElementChild;
    if (!bubble) return;
    if (open) {
      bubble.hidden = false;
      trigger?.setAttribute("aria-describedby", bubble.id || bubble.getAttribute("data-se-tooltip-id") || "");
    } else {
      bubble.hidden = true;
      trigger?.removeAttribute("aria-describedby");
    }
  }

  /* ---------------- Dialog ---------------- */

  on("[data-se-dialog-open]", "click", (trigger) => {
    const dialog = document.querySelector(trigger.getAttribute("data-se-dialog-open"));
    if (!(dialog instanceof HTMLDialogElement)) return;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    dialog._seDialogOpener = trigger;
  });

  on("[data-se-dialog-close]", "click", (button) => {
    const dialog = button.closest("dialog");
    dialog?.close();
  });

  document.addEventListener(
    "close",
    (e) => {
      const dialog = e.target instanceof Element ? e.target.closest("dialog") : null;
      if (!dialog) return;
      const opener = dialog._seDialogOpener;
      dialog._seDialogOpener = null;
      opener?.focus();
    },
    true,
  );

  /* ---------------- Toast ---------------- */

  const TOAST_EXIT_MS = 200;

  function toastViewport(position) {
    const corner = position ?? "bottom-right";
    let container = document.querySelector(`.se-toast-viewport--${corner}`);
    if (!container && corner === "bottom-right") {
      container = document.querySelector(".se-toast-viewport:not([class*='--'])");
    }
    if (!container) {
      container = document.createElement("div");
      container.setAttribute("data-se-toast", "");
      container.setAttribute("aria-live", "polite");
      container.className = `se-toast-viewport se-toast-viewport--${corner}`;
      document.body.appendChild(container);
    }
    return container;
  }

  function pauseToastTimer(item) {
    const timer = item._seToastTimer;
    if (!timer) return;
    clearTimeout(item._seToastTimeout);
    timer.remaining = Math.max(0, timer.remaining - (Date.now() - timer.startedAt));
    item.setAttribute("data-paused", "true");
  }

  function resumeToastTimer(item) {
    const timer = item._seToastTimer;
    if (!timer || timer.remaining <= 0) return;
    timer.startedAt = Date.now();
    item._seToastTimeout = setTimeout(() => expireToast(item), timer.remaining);
    item.setAttribute("data-paused", "false");
  }

  function expireToast(item) {
    if (!item || item.classList.contains("se-toast--leaving")) return;
    stopToastTimer(item);
    item._seToastOnAutoClose?.();
    removeToastItem(item);
  }

  function dismissToast(item) {
    if (!item || item.classList.contains("se-toast--leaving")) return;
    stopToastTimer(item);
    item._seToastOnDismiss?.();
    removeToastItem(item);
  }

  function removeToastItem(item) {
    item.classList.add("se-toast--leaving");
    setTimeout(() => item.remove(), TOAST_EXIT_MS);
  }

  function startToastTimer(item, duration) {
    if (duration <= 0) return;
    item._seToastTimer = { remaining: duration, startedAt: Date.now() };
    item._seToastTimeout = setTimeout(() => expireToast(item), duration);
  }

  function stopToastTimer(item) {
    clearTimeout(item._seToastTimeout);
    item._seToastTimer = null;
  }

  function pauseAllToasts() {
    document.querySelectorAll(".se-toast").forEach(pauseToastTimer);
  }

  function resumeAllToasts() {
    document.querySelectorAll(".se-toast").forEach(resumeToastTimer);
  }

  document.addEventListener(
    "mouseover",
    (e) => {
      const target = e.target instanceof Element ? e.target.closest(".se-toast") : null;
      if (target) pauseAllToasts();
    },
    true,
  );

  document.addEventListener(
    "mouseout",
    (e) => {
      const target = e.target instanceof Element ? e.target.closest(".se-toast") : null;
      if (target) resumeAllToasts();
    },
    true,
  );

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      pauseAllToasts();
    } else {
      resumeAllToasts();
    }
  });

  function buildToastItem(item, options) {
    item.className = `se-toast se-toast--${options.tone ?? "info"}`;
    item.classList.remove("se-toast--leaving");
    item.setAttribute("role", options.tone === "danger" ? "alert" : "status");
    item.setAttribute("data-se-dismissable", "");
    if (options.id != null) {
      item.setAttribute("data-se-toast-id", String(options.id));
    }
    item._seToastOnAutoClose = options.onAutoClose;
    item._seToastOnDismiss = options.onDismiss;
    item._seToastClickClose = options.closeOnClick === true;
    item.classList.toggle("se-toast--clickable", item._seToastClickClose);
    item.onclick = item._seToastClickClose ? () => dismissToast(item) : null;

    const content = document.createElement("div");
    content.className = "se-toast-content";
    if (options.title) {
      const title = document.createElement("div");
      title.className = "se-toast-title";
      title.textContent = options.title;
      content.appendChild(title);
    }
    if (options.description) {
      const desc = document.createElement("div");
      desc.className = "se-toast-description";
      desc.textContent = options.description;
      content.appendChild(desc);
    }
    const actionButtons = [
      ["se-toast-action", options.action],
      ["se-toast-cancel", options.cancel],
    ].filter(([, action]) => action);
    if (actionButtons.length > 0) {
      const row = document.createElement("div");
      row.className = "se-toast-actions";
      for (const [buttonClass, action] of actionButtons) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = buttonClass;
        button.textContent = action.label;
        button.addEventListener("click", () => {
          action.onClick?.();
          dismissToast(item);
        });
        row.appendChild(button);
      }
      content.appendChild(row);
    }
    item.replaceChildren(content);

    if (options.dismissible !== false) {
      const dismiss = document.createElement("button");
      dismiss.type = "button";
      dismiss.className = "se-toast-dismiss";
      dismiss.setAttribute("aria-label", "Dismiss notification");
      dismiss.setAttribute("data-se-dismiss", "");
      dismiss.textContent = "\u00d7";
      item.appendChild(dismiss);
    }

    const duration = options.durationMs ?? 4000;
    if (options.showProgress && duration > 0) {
      const bar = document.createElement("div");
      bar.className = "se-toast-progress";
      bar.style.animationDuration = `${duration}ms`;
      item.appendChild(bar);
    }

    return duration;
  }

  function showToast(options) {
    let item = null;
    if (options.id != null) {
      item = document.querySelector(`[data-se-toast-id="${CSS.escape(String(options.id))}"]`);
    }
    if (item) {
      const duration = buildToastItem(item, options);
      stopToastTimer(item);
      startToastTimer(item, duration);
      return;
    }
    item = document.createElement("div");
    const duration = buildToastItem(item, options);
    toastViewport(options.position).appendChild(item);
    startToastTimer(item, duration);
  }

  on("[data-se-dismiss]", "click", (button) => {
    const target = button.closest("[data-se-dismissable]");
    if (!target) return;
    if (target.classList.contains("se-toast")) {
      dismissToast(target);
    } else {
      target.remove();
    }
  });

  /* ---------------- Interactive (clickable cards etc.) ---------------- */

  on("[data-se-interactive]", "keydown", (el, e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      el.click();
    }
  });

  /* ---------------- Sidebar toggle ---------------- */

  on("[data-se-sidebar-toggle]", "click", (trigger) => {
    const selector = trigger.getAttribute("data-se-sidebar-toggle");
    const target = selector
      ? document.querySelector(selector)
      : trigger.closest("[data-se-sidebar]");
    if (!target) return;
    const collapsed = target.classList.toggle("se-sidebar--collapsed");
    trigger.setAttribute("aria-expanded", String(!collapsed));
    if (selector) {
      const mask = document.querySelector(`[data-se-sidebar-mask="${selector}"]`);
      mask?.classList.toggle("se-layout-mask--hidden", collapsed);
    }
  });

  /* ---------------- Sidebar overlay mask ---------------- */

  on("[data-se-sidebar-mask]", "click", (mask) => {
    const selector = mask.getAttribute("data-se-sidebar-mask");
    const target = selector ? document.querySelector(selector) : null;
    if (!target) return;
    target.classList.add("se-sidebar--collapsed");
    mask.classList.add("se-layout-mask--hidden");
    if (selector) {
      const trigger = document.querySelector(`[aria-controls="${selector.replace(/^#/, "")}"]`);
      trigger?.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    document
      .querySelectorAll("[data-se-sidebar-mask]:not(.se-layout-mask--hidden)")
      .forEach((mask) => mask.click());
  });

  /* ---------------- Theme switch ---------------- */

  function initThemeSwitches() {
    document.querySelectorAll("[data-se-theme-switch]").forEach((input) => {
      input.checked = document.documentElement.dataset.theme === "dark";
    });
  }

  initThemeSwitches();
  document.addEventListener("htmx:afterSettle", initThemeSwitches);

  on("[data-se-theme-switch]", "change", (input) => {
    document.documentElement.dataset.theme = input.checked ? "dark" : "light";
  });

  /* ---------------- API ---------------- */

  window.seToast = showToast;
  window.seUikit = { tabs: { activate: activateTab } };
})();