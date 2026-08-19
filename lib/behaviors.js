/**
 * uikit-htmx behaviors — tiny, dependency-free enhancements that HTML
 * cannot express. All hooks are data-dt-* attributes; htmx attributes
 * remain available for server-driven swaps.
 *
 * Components:
 *   Tabs        [data-dt-tabs] ARIA tabs: click, arrows, Home/End
 *   Accordion   [data-dt-accordion] (data-dt-accordion-multiple for multi)
 *   Tooltip     [data-dt-tooltip] hover/focus, Escape, aria-describedby
 *   Dialog      <dialog data-dt-dialog> + [data-dt-dialog-open="#id"]
 *   Toast       [data-dt-toast] container + window.dtToast(options)
 *   Dismiss     [data-dt-dismiss] removes the closest [data-dt-dismissable]
 *   Interactive [data-dt-interactive] Enter/Space dispatch click
 *   Sidebar     [data-dt-sidebar-toggle="#id"] toggles --collapsed on the
 *               target sidebar and mirrors aria-expanded on the trigger;
 *               [data-dt-sidebar-mask="#id"] closes the target drawer
 *               (Escape closes any open drawer)
*  Theme       [data-dt-theme-switch] flips data-theme on <html>
 *  Form        [data-dt-form] gates submit on [data-dt-field] validity:
 *              invalid (aria-invalid/data-dt-invalid) blocks + dt:invalid;
 *              valid dispatches dt:submit (FormData) and proceeds
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
    const root = tab.closest("[data-dt-tabs]");
    if (!root) return;
    const key = tab.getAttribute("data-dt-tab-key");
    root.querySelectorAll("[data-dt-tab]").forEach((t) => {
      const active = t === tab;
      t.classList.toggle("dt-tabs-tab--active", active);
      t.setAttribute("aria-selected", String(active));
      t.tabIndex = active ? 0 : -1;
    });
    root.querySelectorAll("[data-dt-tabpanel]").forEach((panel) => {
      panel.hidden = panel.getAttribute("data-dt-tab-key") !== key;
    });
  }

  on("[data-dt-tab]", "click", (tab) => {
    if (tab.disabled) return;
    activateTab(tab);
    tab.focus();
  });

  on("[data-dt-tablist]", "keydown", (list, e) => {
    const tabs = [...list.querySelectorAll("[data-dt-tab]")].filter((t) => !t.disabled);
    const index = tabs.indexOf(document.activeElement);
    if (index < 0) return;
    const vertical = list.dataset.dtTablistOrientation === "vertical";
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
    const root = trigger.closest("[data-dt-accordion]");
    const item = trigger.closest("[data-dt-accordion-item]");
    if (!root || !item) return;
    const panel = item.querySelector("[data-dt-accordion-panel]");
    if (!panel) return;
    const isOpen = trigger.getAttribute("aria-expanded") === "true";
    if (!root.hasAttribute("data-dt-accordion-multiple")) {
      root.querySelectorAll("[data-dt-accordion-trigger][aria-expanded='true']").forEach((t) => {
        if (t !== trigger) {
          t.setAttribute("aria-expanded", "false");
          t.closest("[data-dt-accordion-item]")?.querySelector("[data-dt-accordion-panel]")?.removeAttribute("open");
        }
      });
    }
    trigger.setAttribute("aria-expanded", String(!isOpen));
    if (isOpen) panel.removeAttribute("open");
    else panel.setAttribute("open", "");
  }

  on("[data-dt-accordion-trigger]", "click", (trigger) => toggleAccordion(trigger));

  /* ---------------- Tooltip ---------------- */

  on("[data-dt-tooltip]", "mouseenter", (root) => scheduleTooltip(root, true));
  on("[data-dt-tooltip]", "mouseleave", (root) => setTooltip(root, false));
  on("[data-dt-tooltip]", "focusin", (root) => scheduleTooltip(root, true));
  on("[data-dt-tooltip]", "focusout", (root) => setTooltip(root, false));
  on("[data-dt-tooltip]", "keydown", (root, e) => {
    if (e.key === "Escape") setTooltip(root, false);
  });

  function scheduleTooltip(root, open) {
    clearTimeout(root._dtTooltipTimer);
    if (!open) return;
    const delay = Number(root.getAttribute("data-dt-delay-ms") ?? 300);
    root._dtTooltipTimer = setTimeout(() => setTooltip(root, true), delay);
  }

  function setTooltip(root, open) {
    clearTimeout(root._dtTooltipTimer);
    const bubble = root.querySelector("[data-dt-tooltip-content]");
    const trigger = root.firstElementChild;
    if (!bubble) return;
    if (open) {
      bubble.hidden = false;
      trigger?.setAttribute("aria-describedby", bubble.id || bubble.getAttribute("data-dt-tooltip-id") || "");
    } else {
      bubble.hidden = true;
      trigger?.removeAttribute("aria-describedby");
    }
  }

  /* ---------------- Dialog ---------------- */

  on("[data-dt-dialog-open]", "click", (trigger) => {
    const dialog = document.querySelector(trigger.getAttribute("data-dt-dialog-open"));
    if (!(dialog instanceof HTMLDialogElement)) return;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    dialog._dtDialogOpener = trigger;
  });

  on("[data-dt-dialog-close]", "click", (button) => {
    const dialog = button.closest("dialog");
    dialog?.close();
  });

  document.addEventListener(
    "close",
    (e) => {
      const dialog = e.target instanceof Element ? e.target.closest("dialog") : null;
      if (!dialog) return;
      const opener = dialog._dtDialogOpener;
      dialog._dtDialogOpener = null;
      opener?.focus();
    },
    true,
  );

  /* ---------------- Toast ---------------- */

  const TOAST_EXIT_MS = 200;

  function toastViewport(position) {
    const corner = position ?? "bottom-right";
    let container = document.querySelector(`.dt-toast-viewport--${corner}`);
    if (!container && corner === "bottom-right") {
      container = document.querySelector(".dt-toast-viewport:not([class*='--'])");
    }
    if (!container) {
      container = document.createElement("div");
      container.setAttribute("data-dt-toast", "");
      container.setAttribute("aria-live", "polite");
      container.className = `dt-toast-viewport dt-toast-viewport--${corner}`;
      document.body.appendChild(container);
    }
    return container;
  }

  function pauseToastTimer(item) {
    const timer = item._dtToastTimer;
    if (!timer) return;
    clearTimeout(item._dtToastTimeout);
    timer.remaining = Math.max(0, timer.remaining - (Date.now() - timer.startedAt));
    item.setAttribute("data-paused", "true");
  }

  function resumeToastTimer(item) {
    const timer = item._dtToastTimer;
    if (!timer || timer.remaining <= 0) return;
    timer.startedAt = Date.now();
    item._dtToastTimeout = setTimeout(() => expireToast(item), timer.remaining);
    item.setAttribute("data-paused", "false");
  }

  function expireToast(item) {
    if (!item || item.classList.contains("dt-toast--leaving")) return;
    stopToastTimer(item);
    item._dtToastOnAutoClose?.();
    removeToastItem(item);
  }

  function dismissToast(item) {
    if (!item || item.classList.contains("dt-toast--leaving")) return;
    stopToastTimer(item);
    item._dtToastOnDismiss?.();
    removeToastItem(item);
  }

  function removeToastItem(item) {
    item.classList.add("dt-toast--leaving");
    setTimeout(() => item.remove(), TOAST_EXIT_MS);
  }

  function startToastTimer(item, duration) {
    if (duration <= 0) return;
    item._dtToastTimer = { remaining: duration, startedAt: Date.now() };
    item._dtToastTimeout = setTimeout(() => expireToast(item), duration);
  }

  function stopToastTimer(item) {
    clearTimeout(item._dtToastTimeout);
    item._dtToastTimer = null;
  }

  function pauseAllToasts() {
    document.querySelectorAll(".dt-toast").forEach(pauseToastTimer);
  }

  function resumeAllToasts() {
    document.querySelectorAll(".dt-toast").forEach(resumeToastTimer);
  }

  document.addEventListener(
    "mouseover",
    (e) => {
      const target = e.target instanceof Element ? e.target.closest(".dt-toast") : null;
      if (target) pauseAllToasts();
    },
    true,
  );

  document.addEventListener(
    "mouseout",
    (e) => {
      const target = e.target instanceof Element ? e.target.closest(".dt-toast") : null;
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
    item.className = `dt-toast dt-toast--${options.tone ?? "info"}`;
    item.classList.remove("dt-toast--leaving");
    item.setAttribute("role", options.tone === "danger" ? "alert" : "status");
    item.setAttribute("data-dt-dismissable", "");
    if (options.id != null) {
      item.setAttribute("data-dt-toast-id", String(options.id));
    }
    item._dtToastOnAutoClose = options.onAutoClose;
    item._dtToastOnDismiss = options.onDismiss;
    item._dtToastClickClose = options.closeOnClick === true;
    item.classList.toggle("dt-toast--clickable", item._dtToastClickClose);
    item.onclick = item._dtToastClickClose ? () => dismissToast(item) : null;

    const content = document.createElement("div");
    content.className = "dt-toast-content";
    if (options.title) {
      const title = document.createElement("div");
      title.className = "dt-toast-title";
      title.textContent = options.title;
      content.appendChild(title);
    }
    if (options.description) {
      const desc = document.createElement("div");
      desc.className = "dt-toast-description";
      desc.textContent = options.description;
      content.appendChild(desc);
    }
    const actionButtons = [
      ["dt-toast-action", options.action],
      ["dt-toast-cancel", options.cancel],
    ].filter(([, action]) => action);
    if (actionButtons.length > 0) {
      const row = document.createElement("div");
      row.className = "dt-toast-actions";
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
      dismiss.className = "dt-toast-dismiss";
      dismiss.setAttribute("aria-label", "Dismiss notification");
      dismiss.setAttribute("data-dt-dismiss", "");
      dismiss.textContent = "\u00d7";
      item.appendChild(dismiss);
    }

    const duration = options.durationMs ?? 4000;
    if (options.showProgress && duration > 0) {
      const bar = document.createElement("div");
      bar.className = "dt-toast-progress";
      bar.style.animationDuration = `${duration}ms`;
      item.appendChild(bar);
    }

    return duration;
  }

  function showToast(options) {
    let item = null;
    if (options.id != null) {
      item = document.querySelector(`[data-dt-toast-id="${CSS.escape(String(options.id))}"]`);
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

  on("[data-dt-dismiss]", "click", (button) => {
    const target = button.closest("[data-dt-dismissable]");
    if (!target) return;
    if (target.classList.contains("dt-toast")) {
      dismissToast(target);
    } else {
      target.remove();
    }
  });

  /* ---------------- Interactive (clickable cards etc.) ---------------- */

  on("[data-dt-interactive]", "keydown", (el, e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      el.click();
    }
  });

  /* ---------------- Sidebar toggle ---------------- */

  on("[data-dt-sidebar-toggle]", "click", (trigger) => {
    const selector = trigger.getAttribute("data-dt-sidebar-toggle");
    const target = selector
      ? document.querySelector(selector)
      : trigger.closest("[data-dt-sidebar]");
    if (!target) return;
    const collapsed = target.classList.toggle("dt-sidebar--collapsed");
    trigger.setAttribute("aria-expanded", String(!collapsed));
    if (selector) {
      const mask = document.querySelector(`[data-dt-sidebar-mask="${selector}"]`);
      mask?.classList.toggle("dt-layout-mask--hidden", collapsed);
    }
  });

  /* ---------------- Sidebar overlay mask ---------------- */

  on("[data-dt-sidebar-mask]", "click", (mask) => {
    const selector = mask.getAttribute("data-dt-sidebar-mask");
    const target = selector ? document.querySelector(selector) : null;
    if (!target) return;
    target.classList.add("dt-sidebar--collapsed");
    mask.classList.add("dt-layout-mask--hidden");
    if (selector) {
      const trigger = document.querySelector(`[aria-controls="${selector.replace(/^#/, "")}"]`);
      trigger?.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    document
      .querySelectorAll("[data-dt-sidebar-mask]:not(.dt-layout-mask--hidden)")
      .forEach((mask) => mask.click());
  });

  /* ---------------- Theme switch ---------------- */

  function initThemeSwitches() {
    document.querySelectorAll("[data-dt-theme-switch]").forEach((input) => {
      input.checked = document.documentElement.dataset.theme === "dark";
    });
  }

  initThemeSwitches();
  document.addEventListener("htmx:afterSettle", initThemeSwitches);

  on("[data-dt-theme-switch]", "change", (input) => {
    document.documentElement.dataset.theme = input.checked ? "dark" : "light";
  });

  /* ---------------- Form ---------------- */

  // [data-dt-form] gates the native submit on field validity. Fields are
  // [data-dt-field] elements. Rules are declared as data-dt-* attributes
  // (data-dt-required, data-dt-email, data-dt-pattern, data-dt-min,
  // data-dt-max, data-dt-minlength, data-dt-maxlength); messages come
  // from data-dt-<rule>-message, data-dt-error-message, or defaults.
  // Native constraints (required/min/max/minlength/maxlength/pattern/
  // type=email/number) are respected via the validity API. Empty values
  // pass every rule except required. Invalid fields get
  // aria-invalid="true" + data-dt-invalid and their messages; a blocked
  // submit dispatches dt:invalid; a valid submit dispatches dt:submit
  // with the serialized FormData and proceeds natively. Messages are
  // read back for error rendering via dt:invalid detail / fieldMessages.

  const RULE_CHECKS = {
    required: (input) => input.value.trim() !== "",
    email: (input) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim()),
    pattern: (input) => new RegExp(input.getAttribute("data-dt-pattern")).test(input.value),
    min: (input) => Number(input.value) >= Number(input.getAttribute("data-dt-min")),
    max: (input) => Number(input.value) <= Number(input.getAttribute("data-dt-max")),
    minlength: (input) => input.value.length >= Number(input.getAttribute("data-dt-minlength")),
    maxlength: (input) => input.value.length <= Number(input.getAttribute("data-dt-maxlength")),
  };

  const RULE_MESSAGES = {
    required: () => "Required",
    email: () => "Invalid email",
    pattern: () => "Invalid format",
    min: (input) => `Minimum ${input.getAttribute("data-dt-min")}`,
    max: (input) => `Maximum ${input.getAttribute("data-dt-max")}`,
    minlength: (input) => `Minimum ${input.getAttribute("data-dt-minlength")} characters`,
    maxlength: (input) => `Maximum ${input.getAttribute("data-dt-maxlength")} characters`,
  };

  const NATIVE_CONSTRAINTS =
    "[required], [min], [max], [minlength], [maxlength], [pattern], [type='email'], [type='number']";

  const fieldMessages = new WeakMap();

  function validateField(input) {
    const messages = [];
    for (const [rule, check] of Object.entries(RULE_CHECKS)) {
      if (!input.hasAttribute(`data-dt-${rule}`)) continue;
      const value = String(input.value ?? "");
      if (rule !== "required" && value.trim() === "") continue;
      if (check(input)) continue;
      messages.push(
        input.getAttribute(`data-dt-${rule}-message`) ||
          input.getAttribute("data-dt-error-message") ||
          RULE_MESSAGES[rule](input),
      );
    }
    if (messages.length === 0 && input.matches(NATIVE_CONSTRAINTS) && !input.validity.valid) {
      messages.push(input.validationMessage || "Invalid value");
    }
    const invalid = messages.length > 0;
    if (invalid) {
      input.setAttribute("aria-invalid", "true");
      fieldMessages.set(input, messages);
    } else {
      input.removeAttribute("aria-invalid");
      fieldMessages.delete(input);
    }
    input.toggleAttribute("data-dt-invalid", invalid);
    return invalid;
  }

  on("[data-dt-form]", "submit", (form, e) => {
    const fields = [...form.querySelectorAll("[data-dt-field]")].filter((f) => !f.disabled);
    const invalid = fields.filter(validateField);
    if (invalid.length === 0) {
      form.dispatchEvent(
        new CustomEvent("dt:submit", {
          bubbles: true,
          detail: { form, data: new FormData(form) },
        }),
      );
      return;
    }
    e.preventDefault();
    form.dispatchEvent(
      new CustomEvent("dt:invalid", {
        bubbles: true,
        detail: {
          fields: invalid.map((f) => ({
            name: f.getAttribute("name"),
            element: f,
            messages: fieldMessages.get(f) ?? [],
          })),
        },
      }),
    );
  });

  /* ---------------- API ---------------- */

  window.dtToast = showToast;
  window.dtUikit = { tabs: { activate: activateTab } };
})();