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
 *  Password    [data-dt-password-toggle] flips [data-dt-password-input]
 *              between text/password and mirrors aria-pressed + aria-label
 *  Mask        [data-dt-mask="(###) ###-####"] formats digits on input
 *              (# placeholders, literal separators); Backspace over a
 *              separator also removes the digit before it
 *  Numeric     [data-dt-numeric] steppers [data-dt-numeric-up/down] and
 *              ArrowUp/Down clamp/snap via data-dt-min/max/step
 *  Form        [data-dt-form] gates submit on [data-dt-field] validity:
 *              invalid (aria-invalid/data-dt-invalid) blocks + dt:invalid;
 *              valid dispatches dt:submit (FormData) and proceeds
 *  Togglebutton [data-dt-togglebutton] toggles aria-pressed + --pressed
 *  Selectbar   [data-dt-selectbar] + [data-dt-selectbar-option]: single-
 *              select aria-pressed group; dispatches dt:selectbar-change
 *  Listbox     [data-dt-listbox] (+ data-dt-listbox-multiple for multi):
 *              arrows, Home/End, Space, Enter, type-ahead via
 *              aria-activedescendant; dispatches dt:listbox-change
 *  Dropdown    [data-dt-dropdown] combobox popup: trigger/menu/option,
 *              arrows, Home/End, Enter, Escape, outside click; dispatches
 *              dt:dropdown-change
 *  Autocomplete [data-dt-autocomplete] input + menu/option/clear/empty:
 *              label filtering, arrows, Enter, Escape; dispatches
 *              dt:autocomplete-select
 *  Splitbutton [data-dt-splitbutton] caret/menu/item: arrows, Home/End,
 *              Enter, Escape, outside click; dispatches
 *              dt:splitbutton-activate
 *  Datepicker   [data-dt-datepicker] calendar popup: rendered grid,
 *              arrow/PageUp/PageDown/Home/End navigation, typing, time
 *              steppers, locale; dispatches dt:change / dt:invalid
 *  Timespanpicker [data-dt-timespanpicker] duration popup with unit
 *              steppers (staged edits, OK/Cancel); dispatches
 *              dt:change / dt:invalid
 *  Colorpicker  [data-dt-colorpicker] HSV popup (saturation/hue/alpha
 *              sliders, hex/RGBA inputs, palette swatches); dispatches
 *              dt:change
 *  Slider       [data-dt-slider] pointer + keyboard slider, single or
 *              range, horizontal/vertical; dispatches dt:change
 *  Rating       [data-dt-rating] star radiogroup with clear button;
 *              dispatches dt:change
 *  SecurityCode [data-dt-securitycode] OTP digit cells: typing
 *              auto-advances, Backspace/arrows navigate, paste splits;
 *              dispatches dt:change with the full code and announces
 *              completion in a live region
 *  SignaturePad [data-dt-signaturepad] canvas pointer drawing (mouse/pen/
 *              touch), clear button, value = PNG data URL; dispatches
 *              dt:signature-change on stroke end
 *  Upload      [data-dt-upload] hidden file input + trigger, XHR upload
 *              with FormData and progress; dispatches dt:upload-progress /
 *              dt:upload-complete / dt:upload-error
 *  DropZone    [data-dt-dropzone] drag-over visual + drop with FileList,
 *              accept filter, browse fallback; dispatches
 *              dt:dropzone-drop
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

  /* ---------------- Password toggle ---------------- */

  on("[data-dt-password-toggle]", "click", (button) => {
    if (button.disabled) return;
    const root = button.closest("[data-dt-password]");
    if (!root) return;
    const input = root.querySelector("[data-dt-password-input]");
    if (!input) return;
    const show = input.type === "text";
    input.type = show ? "password" : "text";
    const showLabel = button.getAttribute("data-dt-password-show") || "Show password";
    const hideLabel = button.getAttribute("data-dt-password-hide") || "Hide password";
    button.setAttribute("aria-pressed", String(!show));
    button.setAttribute("aria-label", show ? showLabel : hideLabel);
    const isText = input.type === "text";
    root.querySelectorAll("[data-dt-password-icon]").forEach((svg) => {
      svg.hidden = (svg.getAttribute("data-dt-password-icon") === "visible") === isText;
    });
  });

  /* ---------------- Mask ---------------- */

  function maskDigits(value) {
    return value.replace(/\D/g, "");
  }

  function formatMask(value, mask) {
    let digits = maskDigits(value);
    let out = "";
    for (const ch of mask) {
      if (ch === "#") {
        if (digits.length === 0) break;
        out += digits[0];
        digits = digits.slice(1);
      } else if (digits.length > 0) {
        out += ch;
      } else {
        break;
      }
    }
    return out;
  }

  on("[data-dt-mask]", "input", (input) => {
    if (input.readOnly || input.disabled) return;
    const mask = input.getAttribute("data-dt-mask");
    if (!mask) return;
    const next = formatMask(input.value, mask);
    if (next !== input.value) input.value = next;
  });

  on("[data-dt-mask]", "keydown", (input, e) => {
    if (e.key !== "Backspace" || input.readOnly || input.disabled) return;
    const mask = input.getAttribute("data-dt-mask");
    if (!mask) return;
    const caret = input.selectionStart ?? input.value.length;
    const before = input.value[caret - 1];
    if (before !== undefined && /\D/.test(before)) {
      e.preventDefault();
      const next = formatMask(maskDigits(input.value).slice(0, -1), mask);
      input.value = next;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });

  /* ---------------- Numeric ---------------- */

  function numericParams(input) {
    const root = input.closest("[data-dt-numeric]");
    return {
      root,
      min: root && root.hasAttribute("data-dt-min") ? Number(root.getAttribute("data-dt-min")) : undefined,
      max: root && root.hasAttribute("data-dt-max") ? Number(root.getAttribute("data-dt-max")) : undefined,
      step: root && root.hasAttribute("data-dt-step") ? Number(root.getAttribute("data-dt-step")) : 1,
    };
  }

  function numericParse(value) {
    const num = parseFloat(value);
    return Number.isNaN(num) ? null : num;
  }

  function numericClamp(value, min, max) {
    const lo = min ?? -Infinity;
    const hi = max ?? Infinity;
    return Math.min(hi, Math.max(lo, value));
  }

  function numericStep(input, direction) {
    const { root, min, max, step } = numericParams(input);
    if (!root) return;
    const EPS = 1e-9;
    const current = numericParse(input.value) ?? (min ?? 0);
    let next;
    if (min === undefined) {
      next = current + direction * step;
    } else if (direction > 0) {
      next = min + Math.ceil((current - min + EPS) / step) * step;
    } else {
      next = min + Math.floor((current - min - EPS) / step) * step;
    }
    next = numericClamp(next, min, max);
    input.value = String(next);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  on("[data-dt-numeric-up]", "click", (button) => {
    if (button.disabled) return;
    const input = button.closest("[data-dt-numeric]")?.querySelector("[data-dt-numeric-input]");
    if (input && !input.disabled) numericStep(input, 1);
  });

  on("[data-dt-numeric-down]", "click", (button) => {
    if (button.disabled) return;
    const input = button.closest("[data-dt-numeric]")?.querySelector("[data-dt-numeric-input]");
    if (input && !input.disabled) numericStep(input, -1);
  });

  on("[data-dt-numeric-input]", "input", (input) => {
    const raw = input.value;
    let out = "";
    let seenDot = false;
    for (const ch of raw) {
      if (ch >= "0" && ch <= "9") out += ch;
      else if (ch === "." && !seenDot) {
        seenDot = true;
        out += ch;
      } else if (ch === "-" && out.length === 0) {
        out += ch;
      }
    }
    if (out !== raw) input.value = out;
  });

  on("[data-dt-numeric-input]", "keydown", (input, e) => {
    if (input.disabled) return;
    if (e.key === "ArrowUp") {
      e.preventDefault();
      numericStep(input, 1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      numericStep(input, -1);
    }
  });

  on("[data-dt-numeric-input]", "blur", (input) => {
    const { root, min, max, step } = numericParams(input);
    if (!root) return;
    const current = numericParse(input.value);
    if (current === null) {
      input.value = "";
      return;
    }
    const snapped = min !== undefined ? min + Math.round((current - min) / step) * step : current;
    input.value = String(numericClamp(snapped, min, max));
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
  // aria-invalid="true" + data-dt-invalid, their messages are written
  // into a sibling/closest [data-dt-field-error] (aria-live=polite) and
  // the error id is merged into the control's aria-describedby (existing
  // hint ids preserved); a blocked submit dispatches dt:invalid; a valid
  // submit dispatches dt:submit with the serialized FormData and proceeds
  // natively. Messages are read back for error rendering via dt:invalid
  // detail / fieldMessages. Editing a field clears its invalid state
  // (re-evaluated on the next submit).

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

  function errorTarget(input) {
    const wrapper = input.closest(".dt-field");
    const inWrapper = wrapper && wrapper.querySelector("[data-dt-field-error]");
    if (inWrapper) return inWrapper;
    const next = input.nextElementSibling;
    return next && next.matches("[data-dt-field-error]") ? next : null;
  }

  function setDescribedBy(input, errorId) {
    if (input._dtDescribedBy === undefined) {
      input._dtDescribedBy = input.getAttribute("aria-describedby") || "";
    }
    if (errorId) {
      input.setAttribute(
        "aria-describedby",
        [input._dtDescribedBy, errorId].filter(Boolean).join(" "),
      );
    } else if (input._dtDescribedBy) {
      input.setAttribute("aria-describedby", input._dtDescribedBy);
    } else {
      input.removeAttribute("aria-describedby");
    }
  }

  function renderFieldState(input, messages) {
    const invalid = messages.length > 0;
    const target = errorTarget(input);
    if (target) {
      target.textContent = invalid ? messages.join(" · ") : "";
      if (invalid) {
        target.setAttribute("aria-live", "polite");
        if (target.id) setDescribedBy(input, target.id);
      } else {
        setDescribedBy(input, null);
      }
    }
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
    return renderFieldState(input, messages);
  }

  on("[data-dt-field]", "input", (input) => {
    if (!input.hasAttribute("data-dt-invalid")) return;
    input.removeAttribute("data-dt-invalid");
    input.removeAttribute("aria-invalid");
    fieldMessages.delete(input);
    const target = errorTarget(input);
    if (target) target.textContent = "";
    setDescribedBy(input, null);
  });

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

  /* ---------------- Togglebutton ---------------- */

  on("[data-dt-togglebutton]", "click", (button) => {
    if (button.disabled) return;
    const pressed = button.getAttribute("aria-pressed") === "true";
    button.setAttribute("aria-pressed", String(!pressed));
    button.classList.toggle("dt-togglebutton--pressed", !pressed);
  });

  /* ---------------- Selectbar ---------------- */

  on("[data-dt-selectbar-option]", "click", (option) => {
    if (option.disabled) return;
    const group = option.closest("[data-dt-selectbar]");
    if (!group) return;
    const value = option.getAttribute("data-dt-selectbar-value");
    group.querySelectorAll("[data-dt-selectbar-option]").forEach((o) => {
      const active = o === option;
      o.classList.toggle("dt-selectbar__option--selected", active);
      o.setAttribute("aria-pressed", String(active));
    });
    group.dispatchEvent(
      new CustomEvent("dt:selectbar-change", { bubbles: true, detail: { value } }),
    );
  });

  /* ---------------- Listbox ---------------- */

  const listboxState = new WeakMap();

  function listboxOptions(root) {
    return [...root.querySelectorAll("[data-dt-listbox-option]")];
  }

  function listboxEnabled(root) {
    return listboxOptions(root).filter(
      (o) => !o.hasAttribute("aria-disabled") && !o.classList.contains("dt-listbox__option--disabled"),
    );
  }

  function listboxIsMultiple(root) {
    return root.hasAttribute("data-dt-listbox-multiple");
  }

  function listboxActiveIndex(root) {
    const enabled = listboxEnabled(root);
    const id = root.getAttribute("aria-activedescendant");
    const active = id ? enabled.find((o) => o.id === id) : null;
    return enabled.indexOf(active);
  }

  function listboxSetActive(root, index) {
    const enabled = listboxEnabled(root);
    if (index < 0 || index >= enabled.length) return;
    const active = enabled[index];
    root.setAttribute("aria-activedescendant", active.id);
    enabled.forEach((o) => o.classList.toggle("dt-listbox__option--active", o === active));
  }

  function listboxSelectedValues(root) {
    return listboxOptions(root)
      .filter((o) => o.getAttribute("aria-selected") === "true")
      .map((o) => o.getAttribute("data-dt-listbox-value"));
  }

  function listboxCommit(root) {
    const state = listboxState.get(root) ?? (listboxState.set(root, {}), listboxState.get(root));
    const values = listboxSelectedValues(root);
    if (listboxIsMultiple(root)) {
      state.values = values;
    } else {
      state.value = values[0] ?? null;
    }
    root.dispatchEvent(
      new CustomEvent("dt:listbox-change", {
        bubbles: true,
        detail: listboxIsMultiple(root) ? { values } : { value: values[0] ?? null },
      }),
    );
  }

  function listboxToggle(root, option) {
    const selected = option.getAttribute("aria-selected") === "true";
    const next = !selected;
    option.setAttribute("aria-selected", String(next));
    option.classList.toggle("dt-listbox__option--selected", next);
    if (!listboxIsMultiple(root)) {
      listboxOptions(root).forEach((o) => {
        if (o !== option) {
          o.setAttribute("aria-selected", "false");
          o.classList.remove("dt-listbox__option--selected");
        }
      });
    }
  }

  function listboxMove(root, direction) {
    const enabled = listboxEnabled(root);
    if (enabled.length === 0) return;
    let index = listboxActiveIndex(root);
    if (index < 0) {
      index = direction > 0 ? -1 : 0;
    }
    const next = (index + direction + enabled.length) % enabled.length;
    listboxSetActive(root, next);
    return enabled[next];
  }

  function listboxTypeahead(root, char) {
    const state = listboxState.get(root) ?? (listboxState.set(root, {}), listboxState.get(root));
    const now = Date.now();
    state.search = state.search && now - state.searchAt < 500 ? state.search + char : char;
    state.searchAt = now;
    const query = state.search.toLowerCase();
    const enabled = listboxEnabled(root);
    const start = Math.max(listboxActiveIndex(root), 0);
    for (let i = 1; i <= enabled.length; i++) {
      const option = enabled[(start + i) % enabled.length];
      if (option.textContent.trim().toLowerCase().startsWith(query)) {
        listboxSetActive(root, (start + i) % enabled.length);
        if (!listboxIsMultiple(root)) {
          listboxToggle(root, option);
          listboxCommit(root);
        }
        return;
      }
    }
  }

  on("[data-dt-listbox]", "keydown", (root, e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      const option = listboxMove(root, 1);
      if (option && !listboxIsMultiple(root)) {
        listboxToggle(root, option);
        listboxCommit(root);
      }
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      const option = listboxMove(root, -1);
      if (option && !listboxIsMultiple(root)) {
        listboxToggle(root, option);
        listboxCommit(root);
      }
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      const enabled = listboxEnabled(root);
      if (enabled.length === 0) return;
      const option = enabled[e.key === "Home" ? 0 : enabled.length - 1];
      listboxSetActive(root, e.key === "Home" ? 0 : enabled.length - 1);
      if (!listboxIsMultiple(root)) {
        listboxToggle(root, option);
        listboxCommit(root);
      }
    } else if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      const enabled = listboxEnabled(root);
      const index = listboxActiveIndex(root);
      if (index < 0 || index >= enabled.length) return;
      listboxToggle(root, enabled[index]);
      listboxCommit(root);
    } else if (/^[a-zA-Z0-9]$/.test(e.key)) {
      listboxTypeahead(root, e.key);
    }
  });

  on("[data-dt-listbox-option]", "click", (option, e) => {
    const root = option.closest("[data-dt-listbox]");
    if (!root || option.hasAttribute("aria-disabled")) return;
    if (e.detail > 0) e.preventDefault();
    const index = listboxEnabled(root).indexOf(option);
    listboxSetActive(root, index);
    listboxToggle(root, option);
    listboxCommit(root);
  });

  /* ---------------- Dropdown ---------------- */

  const dropdownState = new WeakMap();

  function dropdownData(root) {
    let state = dropdownState.get(root);
    if (!state) {
      const trigger = root.querySelector("[data-dt-dropdown-trigger]");
      const menu = root.querySelector("[data-dt-dropdown-menu]");
      state = { trigger, menu, activeIndex: -1, selectedIndex: -1 };
      dropdownState.set(root, state);
      if (menu) {
        const options = dropdownOptions(root);
        state.selectedIndex = options.findIndex(
          (o) => o.getAttribute("aria-selected") === "true",
        );
      }
    }
    return state;
  }

  function dropdownOptions(root) {
    return [...root.querySelectorAll("[data-dt-dropdown-option]")];
  }

  function dropdownEnabled(root) {
    return dropdownOptions(root).filter(
      (o) => !o.hasAttribute("aria-disabled") && !o.classList.contains("dt-dropdown__option--disabled"),
    );
  }

  function dropdownSetOpen(root, open) {
    const { trigger, menu } = dropdownData(root);
    if (!trigger || !menu) return;
    root.classList.toggle("dt-dropdown--open", open);
    menu.hidden = !open;
    trigger.setAttribute("aria-expanded", String(open));
    if (open) {
      const { selectedIndex } = dropdownData(root);
      const enabled = dropdownEnabled(root);
      const state = dropdownData(root);
      state.activeIndex = enabled.findIndex((o, i) => {
        const all = dropdownOptions(root);
        return all.indexOf(o) === selectedIndex;
      });
      if (state.activeIndex < 0) state.activeIndex = 0;
      dropdownRenderActive(root);
    }
  }

  function dropdownRenderActive(root) {
    const state = dropdownData(root);
    const { menu } = state;
    if (!menu) return;
    const enabled = dropdownEnabled(root);
    const active = enabled[state.activeIndex];
    menu.setAttribute("aria-activedescendant", active ? active.id : "");
    enabled.forEach((o) => o.classList.toggle("dt-dropdown__option--active", o === active));
  }

  function dropdownSelect(root, option) {
    const state = dropdownData(root);
    const all = dropdownOptions(root);
    const label = option.textContent.trim();
    const value = option.getAttribute("data-dt-dropdown-value");
    state.selectedIndex = all.indexOf(option);
    dropdownOptions(root).forEach((o) => {
      const selected = o === option;
      o.setAttribute("aria-selected", String(selected));
      o.classList.toggle("dt-dropdown__option--selected", selected);
    });
    if (state.trigger) {
      const span = state.trigger.querySelector(".dt-dropdown__placeholder, .dt-dropdown__label");
      if (span) {
        span.textContent = label;
        span.classList.remove("dt-dropdown__placeholder");
        span.classList.add("dt-dropdown__label");
      }
    }
    dropdownSetOpen(root, false);
    state.trigger?.focus();
    root.dispatchEvent(
      new CustomEvent("dt:dropdown-change", { bubbles: true, detail: { value } }),
    );
  }

  function dropdownMove(root, direction) {
    const state = dropdownData(root);
    const enabled = dropdownEnabled(root);
    if (enabled.length === 0) return;
    let index = state.activeIndex;
    if (index < 0) index = direction > 0 ? -1 : 0;
    state.activeIndex = (index + direction + enabled.length) % enabled.length;
    dropdownRenderActive(root);
  }

  on("[data-dt-dropdown-trigger]", "click", (trigger) => {
    if (trigger.disabled) return;
    const root = trigger.closest("[data-dt-dropdown]");
    if (!root) return;
    const { menu } = dropdownData(root);
    dropdownSetOpen(root, menu.hidden);
  });

  on("[data-dt-dropdown]", "keydown", (root, e) => {
    const { trigger, menu } = dropdownData(root);
    if (!menu || menu.hidden) {
      if ((e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") && trigger && !trigger.disabled) {
        e.preventDefault();
        dropdownSetOpen(root, true);
      }
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      dropdownMove(root, 1);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      dropdownMove(root, -1);
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      const state = dropdownData(root);
      const enabled = dropdownEnabled(root);
      if (enabled.length === 0) return;
      state.activeIndex = e.key === "Home" ? 0 : enabled.length - 1;
      dropdownRenderActive(root);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const state = dropdownData(root);
      const enabled = dropdownEnabled(root);
      const option = enabled[state.activeIndex];
      if (option) dropdownSelect(root, option);
    } else if (e.key === "Escape") {
      e.preventDefault();
      dropdownSetOpen(root, false);
      trigger?.focus();
    }
  });

  on("[data-dt-dropdown-option]", "click", (option) => {
    if (option.hasAttribute("aria-disabled")) return;
    const root = option.closest("[data-dt-dropdown]");
    if (!root) return;
    dropdownSelect(root, option);
  });

  document.addEventListener("mousedown", (e) => {
    const target = e.target instanceof Element ? e.target : null;
    if (!target) return;
    document.querySelectorAll("[data-dt-dropdown].dt-dropdown--open").forEach((root) => {
      if (!root.contains(target)) dropdownSetOpen(root, false);
    });
    document.querySelectorAll("[data-dt-splitbutton] .dt-splitbutton__menu:not([hidden])").forEach((menu) => {
      const root = menu.closest("[data-dt-splitbutton]");
      if (root && !root.contains(target)) splitbuttonSetOpen(root, false);
    });
  });

  /* ---------------- Autocomplete ---------------- */

  function autocompleteData(root) {
    let state = autocompleteState.get(root);
    if (!state) {
      const input = root.querySelector("[data-dt-autocomplete-input]");
      const menu = root.querySelector("[data-dt-autocomplete-menu]");
      const clear = root.querySelector("[data-dt-autocomplete-clear]");
      state = { input, menu, clear, activeIndex: -1 };
      autocompleteState.set(root, state);
    }
    return state;
  }

  function autocompleteOptions(root) {
    return [...root.querySelectorAll("[data-dt-autocomplete-option]")];
  }

  function autocompleteEnabled(root) {
    return autocompleteOptions(root).filter(
      (o) => !o.hasAttribute("aria-disabled") && !o.classList.contains("dt-autocomplete__option--disabled"),
    );
  }

  function autocompleteFiltered(root) {
    const state = autocompleteData(root);
    const query = (state.input?.value ?? "").trim().toLowerCase();
    return query === ""
      ? autocompleteEnabled(root)
      : autocompleteEnabled(root).filter((o) =>
          (o.getAttribute("data-dt-autocomplete-label") ?? "").toLowerCase().includes(query),
        );
  }

  function autocompleteRender(root) {
    const state = autocompleteData(root);
    const { input, menu, clear } = state;
    if (!menu || !input) return;
    const filtered = autocompleteFiltered(root);
    autocompleteOptions(root).forEach((o) => {
      o.hidden = !filtered.includes(o);
    });
    const empty = menu.querySelector("[data-dt-autocomplete-empty]");
    if (empty) empty.hidden = filtered.length > 0;
    if (state.activeIndex >= filtered.length) state.activeIndex = -1;
    const visible = filtered.length > 0 || (empty && !empty.hidden);
    menu.hidden = !visible;
    if (clear) clear.hidden = input.value === "";
    input.setAttribute("aria-expanded", String(!menu.hidden));
    const active = filtered[state.activeIndex];
    input.setAttribute("aria-activedescendant", active ? active.id : "");
    filtered.forEach((o) => o.classList.toggle("dt-autocomplete__option--active", o === active));
  }

  function autocompleteMove(root, direction) {
    const state = autocompleteData(root);
    const filtered = autocompleteFiltered(root);
    if (filtered.length === 0) return;
    let index = state.activeIndex;
    if (index < 0) index = direction > 0 ? -1 : 0;
    state.activeIndex = (index + direction + filtered.length) % filtered.length;
    autocompleteRender(root);
  }

  function autocompleteSelect(root, option) {
    const state = autocompleteData(root);
    const value = option.getAttribute("data-dt-autocomplete-value");
    const label = option.getAttribute("data-dt-autocomplete-label") ?? option.textContent.trim();
    if (state.input) {
      state.input.value = label;
      state.input.setAttribute("aria-activedescendant", "");
    }
    if (state.clear) state.clear.hidden = true;
    if (state.menu) state.menu.hidden = true;
    state.activeIndex = -1;
    root.dispatchEvent(
      new CustomEvent("dt:autocomplete-select", {
        bubbles: true,
        detail: { value, label },
      }),
    );
  }

  on("[data-dt-autocomplete-input]", "input", (input) => {
    if (input.disabled) return;
    const root = input.closest("[data-dt-autocomplete]");
    if (!root) return;
    const state = autocompleteData(root);
    state.activeIndex = -1;
    autocompleteRender(root);
  });

  on("[data-dt-autocomplete-input]", "keydown", (input, e) => {
    const root = input.closest("[data-dt-autocomplete]");
    if (!root) return;
    const state = autocompleteData(root);
    const filtered = autocompleteFiltered(root);
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      if (state.menu?.hidden) {
        autocompleteRender(root);
      }
      autocompleteMove(root, 1);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      autocompleteMove(root, -1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const option = filtered[state.activeIndex];
      if (option) autocompleteSelect(root, option);
    } else if (e.key === "Escape") {
      e.preventDefault();
      state.activeIndex = -1;
      if (state.menu) state.menu.hidden = true;
      input.setAttribute("aria-expanded", "false");
      input.setAttribute("aria-activedescendant", "");
      if (state.clear) state.clear.hidden = input.value === "";
    } else if (e.key === "Tab") {
      const option = filtered[state.activeIndex];
      if (option && state.menu && !state.menu.hidden) {
        autocompleteSelect(root, option);
      }
    }
  });

  on("[data-dt-autocomplete-option]", "click", (option) => {
    if (option.hasAttribute("aria-disabled")) return;
    const root = option.closest("[data-dt-autocomplete]");
    if (!root) return;
    autocompleteSelect(root, option);
  });

  on("[data-dt-autocomplete-clear]", "click", (clear) => {
    const root = clear.closest("[data-dt-autocomplete]");
    if (!root) return;
    const state = autocompleteData(root);
    if (state.input) state.input.value = "";
    state.activeIndex = -1;
    autocompleteRender(root);
    state.input?.focus();
  });

  /* ---------------- Splitbutton ---------------- */

  const splitbuttonState = new WeakMap();

  function splitbuttonData(root) {
    let state = splitbuttonState.get(root);
    if (!state) {
      const caret = root.querySelector("[data-dt-splitbutton-caret]");
      const menu = root.querySelector("[data-dt-splitbutton-menu]");
      state = { caret, menu, activeIndex: -1 };
      splitbuttonState.set(root, state);
    }
    return state;
  }

  function splitbuttonItems(root) {
    return [...root.querySelectorAll("[data-dt-splitbutton-item]")];
  }

  function splitbuttonEnabled(root) {
    return splitbuttonItems(root).filter(
      (o) => !o.hasAttribute("aria-disabled") && !o.classList.contains("dt-splitbutton__item--disabled"),
    );
  }

  function splitbuttonSetOpen(root, open) {
    const state = splitbuttonData(root);
    if (!state.caret || !state.menu) return;
    state.menu.hidden = !open;
    state.caret.setAttribute("aria-expanded", String(open));
    if (open) {
      const enabled = splitbuttonEnabled(root);
      state.activeIndex = enabled.length > 0 ? 0 : -1;
    }
    splitbuttonRender(root);
  }

  function splitbuttonRender(root) {
    const state = splitbuttonData(root);
    if (!state.menu) return;
    const enabled = splitbuttonEnabled(root);
    const active = enabled[state.activeIndex];
    state.menu.setAttribute("aria-activedescendant", active ? active.id : "");
    enabled.forEach((o) => o.classList.toggle("dt-splitbutton__item--active", o === active));
  }

  function splitbuttonMove(root, direction) {
    const state = splitbuttonData(root);
    const enabled = splitbuttonEnabled(root);
    if (enabled.length === 0) return;
    let index = state.activeIndex;
    if (index < 0) index = direction > 0 ? -1 : 0;
    state.activeIndex = (index + direction + enabled.length) % enabled.length;
    splitbuttonRender(root);
  }

  function splitbuttonActivate(root, index) {
    const state = splitbuttonData(root);
    const enabled = splitbuttonEnabled(root);
    const item = enabled[index];
    if (!item) return;
    const key = item.getAttribute("data-dt-splitbutton-action");
    splitbuttonSetOpen(root, false);
    state.caret?.focus();
    root.dispatchEvent(
      new CustomEvent("dt:splitbutton-activate", { bubbles: true, detail: { key } }),
    );
  }

  on("[data-dt-splitbutton-caret]", "click", (caret) => {
    if (caret.disabled) return;
    const root = caret.closest("[data-dt-splitbutton]");
    if (!root) return;
    const { menu } = splitbuttonData(root);
    splitbuttonSetOpen(root, menu.hidden);
  });

  on("[data-dt-splitbutton]", "keydown", (root, e) => {
    const state = splitbuttonData(root);
    const { menu } = state;
    if (!menu || menu.hidden) {
      if ((e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") && state.caret && !state.caret.disabled) {
        e.preventDefault();
        splitbuttonSetOpen(root, true);
      }
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      splitbuttonMove(root, 1);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      splitbuttonMove(root, -1);
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      const enabled = splitbuttonEnabled(root);
      if (enabled.length === 0) return;
      state.activeIndex = e.key === "Home" ? 0 : enabled.length - 1;
      splitbuttonRender(root);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (state.activeIndex >= 0) splitbuttonActivate(root, state.activeIndex);
    } else if (e.key === "Escape") {
      e.preventDefault();
      splitbuttonSetOpen(root, false);
      state.caret?.focus();
    }
  });

  on("[data-dt-splitbutton-item]", "click", (item) => {
    if (item.hasAttribute("aria-disabled")) return;
    const root = item.closest("[data-dt-splitbutton]");
    if (!root) return;
    const index = splitbuttonEnabled(root).indexOf(item);
    if (index >= 0) splitbuttonActivate(root, index);
  });

  /* ---------------- DataFilter ---------------- */

  const NULLISH_OPS = ["IsNull", "IsEmpty", "IsNotNull", "IsNotEmpty"];
  const OPERATOR_LABELS = {
    Equals: "Equals",
    NotEquals: "Not equals",
    LessThan: "Less than",
    LessThanOrEquals: "Less than or equals",
    GreaterThan: "Greater than",
    GreaterThanOrEquals: "Greater than or equals",
    Contains: "Contains",
    StartsWith: "Starts with",
    EndsWith: "Ends with",
    DoesNotContain: "Does not contain",
    In: "In",
    NotIn: "Not in",
    IsNull: "Is null",
    IsEmpty: "Is empty",
    IsNotNull: "Is not null",
    IsNotEmpty: "Is not empty",
    Custom: "Custom",
  };
  const OPERATORS_BY_TYPE = {
    string: ["Contains", "StartsWith", "EndsWith", "DoesNotContain", "Equals", "NotEquals", "In", "NotIn", "IsNull", "IsEmpty", "IsNotNull", "IsNotEmpty"],
    number: ["Equals", "NotEquals", "LessThan", "LessThanOrEquals", "GreaterThan", "GreaterThanOrEquals", "IsNull", "IsNotNull"],
    date: ["Equals", "NotEquals", "LessThan", "LessThanOrEquals", "GreaterThan", "GreaterThanOrEquals", "IsNull", "IsNotNull"],
    boolean: ["Equals", "NotEquals", "IsNull", "IsNotNull"],
    enum: ["Equals", "NotEquals", "In", "NotIn"],
  };
  const DEFAULT_OPERATOR = { string: "Contains", number: "Equals", date: "Equals", boolean: "Equals", enum: "Equals" };
  const ODATA_OPS = {
    Equals: "eq",
    NotEquals: "ne",
    LessThan: "lt",
    LessThanOrEquals: "le",
    GreaterThan: "gt",
    GreaterThanOrEquals: "ge",
  };

  function parseProperties(root) {
    try {
      const parsed = JSON.parse(root.dataset.dtDatafilterProperties ?? "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function fillSelect(select, options, value) {
    select.replaceChildren(
      ...options.map((o) => {
        const option = document.createElement("option");
        option.value = o.value;
        option.textContent = o.label;
        option.selected = o.value === value;
        return option;
      }),
    );
  }

  function propertyOf(properties, name) {
    return properties.find((p) => p.name === name) ?? { name, type: "string" };
  }

  function renderRowEditor(row, properties) {
    const propertySelect = row.querySelector("[data-dt-datafilter-property]");
    const operatorSelect = row.querySelector("[data-dt-datafilter-operator]");
    const valueEl = row.querySelector("[data-dt-datafilter-value]");
    if (!propertySelect || !operatorSelect || !valueEl) return;

    const property = propertyOf(properties, propertySelect.value);
    fillSelect(
      operatorSelect,
      OPERATORS_BY_TYPE[property.type ?? "string"].map((op) => ({ value: op, label: OPERATOR_LABELS[op] })),
      operatorSelect.value || DEFAULT_OPERATOR[property.type ?? "string"],
    );
    if (operatorSelect.value !== operatorSelect.querySelector("option")?.value) {
      operatorSelect.value = DEFAULT_OPERATOR[property.type ?? "string"];
    }

    const valueParent = valueEl.parentElement ?? row;
    const editor = document.createElement(
      property.type === "boolean" || property.type === "enum" ? "select" : "input",
    );
    editor.setAttribute("data-dt-datafilter-value", "");
    editor.setAttribute("aria-label", "Value");
    if (property.type === "number") {
      editor.setAttribute("type", "number");
    } else if (property.type === "date") {
      editor.setAttribute("type", "date");
    } else if (property.type === "boolean") {
      fillSelect(editor, [
        { value: "", label: "" },
        { value: "true", label: "True" },
        { value: "false", label: "False" },
      ]);
    } else if (property.type === "enum") {
      fillSelect(
        editor,
        (property.values ?? []).map((v) => ({ value: String(v.value), label: v.label ?? String(v.value) })),
      );
    }
    valueEl.replaceWith(editor);
  }

  function collectFilters(root) {
    const properties = parseProperties(root);
    const logicalOperator = root.dataset.dtDatafilterOperator === "Or" ? "Or" : "And";
    const filters = [];
    root.querySelectorAll("[data-dt-datafilter-row]").forEach((row) => {
      const property = row.querySelector("[data-dt-datafilter-property]")?.value ?? "";
      const operator = row.querySelector("[data-dt-datafilter-operator]")?.value ?? "";
      const valueEl = row.querySelector("[data-dt-datafilter-value]");
      let value = valueEl?.value ?? "";
      if (valueEl?.type === "number" && value !== "") value = Number(value);
      if (valueEl?.type === "checkbox") value = valueEl.checked;
      if (property === "" || operator === "") return;
      if ((value == null || value === "") && !NULLISH_OPS.includes(operator)) return;
      filters.push({ property, operator, value });
    });
    return { filters, logicalOperator };
  }

  function toLinqString(filter) {
    const lit = (v) =>
      typeof v === "string"
        ? `"${v.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`
        : typeof v === "number" || typeof v === "boolean"
          ? String(v)
          : `"${v}"`;
    switch (filter.operator) {
      case "Equals":
        return `${filter.property}.Equals(${lit(filter.value)})`;
      case "NotEquals":
        return `!${filter.property}.Equals(${lit(filter.value)})`;
      case "LessThan":
        return `${filter.property}.LessThan(${lit(filter.value)})`;
      case "LessThanOrEquals":
        return `${filter.property}.LessThanOrEquals(${lit(filter.value)})`;
      case "GreaterThan":
        return `${filter.property}.GreaterThan(${lit(filter.value)})`;
      case "GreaterThanOrEquals":
        return `${filter.property}.GreaterThanOrEquals(${lit(filter.value)})`;
      case "Contains":
        return `${filter.property}.Contains(${lit(filter.value)})`;
      case "StartsWith":
        return `${filter.property}.StartsWith(${lit(filter.value)})`;
      case "EndsWith":
        return `${filter.property}.EndsWith(${lit(filter.value)})`;
      case "DoesNotContain":
        return `!${filter.property}.Contains(${lit(filter.value)})`;
      case "In":
        return `${filter.property}.In(${lit(filter.value)})`;
      case "NotIn":
        return `!${filter.property}.In(${lit(filter.value)})`;
      case "IsNull":
        return `${filter.property} == null`;
      case "IsNotNull":
        return `${filter.property} != null`;
      case "IsEmpty":
        return `${filter.property} == ""`;
      case "IsNotEmpty":
        return `${filter.property} != ""`;
      default:
        return `${filter.property}.Custom()`;
    }
  }

  function toODataString(filter) {
    const esc = (v) => String(v ?? "").replace(/'/g, "''");
    const lit = (v) =>
      typeof v === "string" ? `'${esc(v)}'` : typeof v === "number" || typeof v === "boolean" ? String(v) : `'${esc(v)}'`;
    const prop = filter.property;
    switch (filter.operator) {
      case "Equals":
      case "NotEquals":
      case "LessThan":
      case "LessThanOrEquals":
      case "GreaterThan":
      case "GreaterThanOrEquals":
        return `${prop} ${ODATA_OPS[filter.operator]} ${lit(filter.value)}`;
      case "Contains":
        return `contains(tolower(${prop}), tolower(${lit(filter.value)}))`;
      case "StartsWith":
        return `startswith(tolower(${prop}), tolower(${lit(filter.value)}))`;
      case "EndsWith":
        return `endswith(tolower(${prop}), tolower(${lit(filter.value)}))`;
      case "DoesNotContain":
        return `not(contains(tolower(${prop}), tolower(${lit(filter.value)})))`;
      case "In":
        return `${prop} in (${lit(filter.value)})`;
      case "NotIn":
        return `not(${prop} in (${lit(filter.value)}))`;
      case "IsNull":
        return `${prop} eq null`;
      case "IsNotNull":
        return `${prop} ne null`;
      case "IsEmpty":
        return `${prop} eq ''`;
      case "IsNotEmpty":
        return `${prop} ne ''`;
      default:
        return `${prop} custom`;
    }
  }

  function announceFilters(root) {
    const { filters, logicalOperator } = collectFilters(root);
    const linqString = filters.map(toLinqString).join(` ${logicalOperator} `);
    const odataString = filters.map(toODataString).join(` ${logicalOperator === "Or" ? "or" : "and"} `);
    const detail = {
      filters,
      logicalOperator,
      filterString: linqString,
      oDataFilterString: odataString,
    };
    const output = root.querySelector("[data-dt-datafilter-output]");
    if (output) output.value = JSON.stringify(filters);
    root.dispatchEvent(
      new CustomEvent("dt:filter-change", { bubbles: true, detail }),
    );
  }

  on("[data-dt-datafilter]", "change", (root, e) => {
    const target = e.target;
    if (target.matches("[data-dt-datafilter-operator-bar] input[type=radio]")) {
      root.dataset.dtDatafilterOperator = target.value;
      announceFilters(root);
      return;
    }
    if (target.matches("[data-dt-datafilter-property]")) {
      renderRowEditor(target.closest("[data-dt-datafilter-row]"), parseProperties(root));
      announceFilters(root);
      return;
    }
    if (target.matches("[data-dt-datafilter-value], [data-dt-datafilter-operator]")) {
      announceFilters(root);
    }
  });

  on("[data-dt-datafilter]", "click", (root, e) => {
    const add = e.target.closest("[data-dt-datafilter-add]");
    const remove = e.target.closest("[data-dt-datafilter-remove]");
    if (remove) {
      const rows = [...root.querySelectorAll("[data-dt-datafilter-row]")];
      if (rows.length > 1) {
        remove.closest("[data-dt-datafilter-row]").remove();
        announceFilters(root);
      }
      return;
    }
    if (!add) return;
    const template = root.querySelector("[data-dt-datafilter-row]");
    if (!template) return;
    const clone = template.cloneNode(true);
    const propertySelect = clone.querySelector("[data-dt-datafilter-property]");
    if (propertySelect) propertySelect.value = template.querySelector("[data-dt-datafilter-property]")?.value ?? "";
    const valueEl = clone.querySelector("[data-dt-datafilter-value]");
    if (valueEl) valueEl.value = "";
    root.querySelector("[data-dt-datafilter-rows]").appendChild(clone);
    renderRowEditor(clone, parseProperties(root));
    clone.querySelector("[data-dt-datafilter-property]")?.focus();
    announceFilters(root);
  });

  function initDataFilter(root) {
    const properties = parseProperties(root);
    root.querySelectorAll("[data-dt-datafilter-property]").forEach((select) => {
      fillSelect(
        select,
        properties.map((p) => ({ value: p.name, label: p.title ?? p.name })),
        select.value || properties[0]?.name,
      );
    });
    root.querySelectorAll("[data-dt-datafilter-row]").forEach((row) => renderRowEditor(row, properties));
  }

  document.querySelectorAll("[data-dt-datafilter]").forEach(initDataFilter);

  /* ---------------- DataGrid ---------------- */

  const gridState = new WeakMap();

  function parseGridColumns(root) {
    try {
      const parsed = JSON.parse(root.dataset.dtDatagridProperties ?? "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function gridSortable(root, column) {
    return column.sortable ?? root.hasAttribute("data-dt-datagrid-sortable");
  }

  function gridFilterable(root, column) {
    return column.filterable ?? root.hasAttribute("data-dt-datagrid-filterable");
  }

  function defaultGridState(root) {
    const pageSize = Number(root.dataset.dtDatagridPagesize ?? "10");
    const columns = parseGridColumns(root);
    return {
      sorts: [],
      filters: new Map(),
      pageNumber: 1,
      pageSize: Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 10,
      logicalOperator: "And",
      caseSensitivity: root.hasAttribute("data-dt-datagrid-case-sensitive") ? "CaseSensitive" : "CaseInsensitive",
      order: columns.map((c, i) => gridColumnKey(c, i)),
      visible: new Set(columns.map((c, i) => gridColumnKey(c, i))),
      widths: {},
      selected: [],
      pickerOpen: false,
      dragKey: null,
      groupBy: null,
      expanded: new Set(),
      editKey: null,
      edits: null,
    };
  }

  function gridColumnKey(column, index) {
    return column.property ?? `col-${index}`;
  }

  function gridEffectiveColumns(state, columns) {
    return state.order
      .map((key) => ({ key, column: columns.find((c) => gridColumnKey(c, columns.indexOf(c)) === key) }))
      .filter((entry) => entry.column != null && state.visible.has(entry.key))
      .filter((entry) => entry.column.property !== state.groupBy);
  }

  function gridShowCommandColumn(root) {
    return root.hasAttribute("data-dt-datagrid-edit") || root.hasAttribute("data-dt-datagrid-delete") || root.hasAttribute("data-dt-datagrid-create");
  }

  function gridRowValues(row) {
    try {
      return JSON.parse(row.dataset.dtRowValue ?? "{}") ?? {};
    } catch {
      return {};
    }
  }

  function gridComparable(value) {
    if (typeof value === "number") return value;
    if (value instanceof Date) return value.getTime();
    if (typeof value === "string" && !Number.isNaN(Date.parse(value)) && /^\d{4}-\d{2}-\d{2}/.test(value)) {
      return Date.parse(value);
    }
    return value;
  }

  function gridCompare(a, b) {
    const ca = gridComparable(a);
    const cb = gridComparable(b);
    if (typeof ca === "number" && typeof cb === "number") return ca - cb;
    const sa = String(ca ?? "");
    const sb = String(cb ?? "");
    return sa < sb ? -1 : sa > sb ? 1 : 0;
  }

  function gridCoerce(value, type) {
    if (type === "number") {
      const n = Number(value);
      return Number.isNaN(n) ? value : n;
    }
    if (type === "date") {
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? value : d;
    }
    if (type === "boolean") return value === "true" ? true : value === "false" ? false : value;
    return value;
  }

  function gridMatches(value, filter, state) {
    const insensitive = state.caseSensitivity === "CaseInsensitive";
    const norm = (v) => (insensitive && typeof v === "string" ? v.toLowerCase() : v);
    const actual = norm(value);
    const expected = norm(gridCoerce(filter.value, filter.type ?? "string"));
    switch (filter.operator) {
      case "Equals":
        return actual === expected;
      case "NotEquals":
        return actual !== expected;
      case "LessThan":
        return gridCompare(actual, expected) < 0;
      case "LessThanOrEquals":
        return gridCompare(actual, expected) <= 0;
      case "GreaterThan":
        return gridCompare(actual, expected) > 0;
      case "GreaterThanOrEquals":
        return gridCompare(actual, expected) >= 0;
      case "Contains":
        return typeof actual === "string" && typeof expected === "string" && actual.includes(expected);
      case "StartsWith":
        return typeof actual === "string" && typeof expected === "string" && actual.startsWith(expected);
      case "EndsWith":
        return typeof actual === "string" && typeof expected === "string" && actual.endsWith(expected);
      case "DoesNotContain":
        return typeof actual === "string" && typeof expected === "string" && !actual.includes(expected);
      case "IsNull":
        return value == null;
      case "IsNotNull":
        return value != null;
      case "IsEmpty":
        return value == null || value === "";
      case "IsNotEmpty":
        return value != null && value !== "";
      default:
        return true;
    }
  }

  function gridSortIndicator(sortOrder) {
    return sortOrder === "Ascending" ? "▲" : "▼";
  }

  function renderGridHeader(root, columns) {
    const state = gridState.get(root);
    const head = root.querySelector("[data-dt-datagrid-head]");
    if (!head) return;
    const effective = gridEffectiveColumns(state, columns);
    const sortable = effective.some((e) => gridSortable(root, e.column));
    const filterable = effective.some((e) => gridFilterable(root, e.column));
    const cols = root.querySelector("[data-dt-datagrid-cols]");
    if (cols) {
      cols.replaceChildren();
      effective.forEach(({ key, column }) => {
        const col = document.createElement("col");
        const width = state.widths[key] ?? column.width;
        if (width) col.style.width = width;
        cols.append(col);
      });
      if (gridShowCommandColumn(root)) {
        const col = document.createElement("col");
        col.style.width = "8rem";
        cols.append(col);
      }
    }
    const headerRow = document.createElement("tr");
    let frozenTotal = 0;
    effective.forEach(({ key, column }, i) => {
      const th = document.createElement("th");
      th.scope = "col";
      th.setAttribute("data-dt-grid-col", key);
      if (column.width) th.style.width = column.width;
      if (column.align === "center") th.classList.add("dt-datagrid-cell--center");
      if (column.align === "right") th.classList.add("dt-datagrid-cell--right");
      if (column.frozen) {
        th.classList.add("dt-datagrid-cell--frozen");
        th.style.left = frozenTotal === 0 ? "0px" : `${frozenTotal}px`;
        const width = state.widths[key] ?? column.width ?? "6rem";
        frozenTotal += parseFloat(width);
      }
      if (root.hasAttribute("data-dt-datagrid-reorder")) {
        th.draggable = true;
        th.setAttribute("data-dt-grid-reorder-src", key);
      }
      const canSort = gridSortable(root, column);
      if (canSort) {
        const sort = state.sorts.find((s) => s.property === column.property);
        const button = document.createElement("button");
        button.type = "button";
        button.className = "dt-datagrid-sort";
        button.setAttribute("data-dt-grid-sort", column.property);
        button.textContent = column.title ?? column.property;
        const indicator = document.createElement("span");
        indicator.className = "dt-datagrid-sort-indicator";
        indicator.setAttribute("data-dt-grid-sort-indicator", "");
        if (sort) {
          indicator.textContent = gridSortIndicator(sort.sortOrder);
          th.setAttribute("aria-sort", sort.sortOrder === "Ascending" ? "ascending" : "descending");
        } else {
          th.setAttribute("aria-sort", "none");
        }
        button.append(indicator);
        th.append(button);
      } else {
        th.textContent = column.title ?? column.property;
      }
      if (root.hasAttribute("data-dt-datagrid-resize")) {
        const handle = document.createElement("span");
        handle.className = "dt-datagrid-resize-handle";
        handle.setAttribute("data-dt-grid-resize", key);
        handle.setAttribute("role", "separator");
        handle.setAttribute("aria-orientation", "vertical");
        handle.setAttribute("aria-label", `Resize ${column.title ?? column.property}`);
        th.append(handle);
      }
      headerRow.append(th);
    });
    if (gridShowCommandColumn(root)) {
      const th = document.createElement("th");
      th.scope = "col";
      th.textContent = "Actions";
      headerRow.append(th);
    }
    head.replaceChildren(headerRow);
    if (!filterable) return;
    const filterRow = document.createElement("tr");
    effective.forEach(({ column }) => {
      const td = document.createElement("td");
      td.className = "dt-datagrid-filter-cell";
      if (!gridFilterable(root, column)) {
        filterRow.append(td);
        return;
      }
      const select = document.createElement("select");
      select.className = "dt-datagrid-filter-select";
      select.setAttribute("data-dt-grid-filter-op", column.property);
      const opLabel = document.createElement("label");
      opLabel.className = "dt-visually-hidden";
      opLabel.textContent = `${column.title ?? column.property} operator`;
      const operators = column.type === "number" || column.type === "date"
        ? ["Equals", "NotEquals", "LessThan", "LessThanOrEquals", "GreaterThan", "GreaterThanOrEquals", "IsNull", "IsNotNull"]
        : column.type === "boolean"
          ? ["Equals", "NotEquals", "IsNull", "IsNotNull"]
          : ["Contains", "StartsWith", "EndsWith", "DoesNotContain", "Equals", "NotEquals", "IsNull", "IsEmpty", "IsNotNull", "IsNotEmpty"];
      const defaultOp = column.type === "number" || column.type === "date" ? "Equals" : "Contains";
      operators.forEach((op) => {
        const option = document.createElement("option");
        option.value = op;
        option.textContent = op;
        select.append(option);
      });
      select.value = defaultOp;
      const input = document.createElement("input");
      input.className = "dt-datagrid-filter-input";
      input.setAttribute("data-dt-grid-filter-value", column.property);
      input.placeholder = `Filter ${column.title ?? column.property}`;
      const valueLabel = document.createElement("label");
      valueLabel.className = "dt-visually-hidden";
      valueLabel.textContent = `${column.title ?? column.property} value`;
      td.append(opLabel, select, valueLabel, input);
      filterRow.append(td);
    });
    head.append(filterRow);
  }

  function renderGridPager(root, view) {
    const container = root.querySelector("[data-dt-datagrid-pager]");
    if (!container) return;
    const { pageNumber, pageSize, pageCount, total } = view;
    const summary = document.createElement("span");
    summary.className = "dt-datagrid-pager-summary";
    summary.textContent = `Page ${pageNumber} of ${pageCount} (${total} records)`;
    const controls = document.createElement("div");
    controls.className = "dt-datagrid-pager-controls";
    const prev = document.createElement("button");
    prev.type = "button";
    prev.className = "dt-datagrid-pager-button";
    prev.textContent = "‹";
    prev.setAttribute("aria-label", "Previous page");
    prev.disabled = pageNumber <= 1;
    prev.setAttribute("data-dt-grid-page", String(pageNumber - 1));
    const max = Number(root.dataset.dtDatagridPagenumbers ?? "5");
    const items = gridPageItems(pageNumber, pageCount, max);
    const next = document.createElement("button");
    next.type = "button";
    next.className = "dt-datagrid-pager-button";
    next.textContent = "›";
    next.setAttribute("aria-label", "Next page");
    next.disabled = pageNumber >= pageCount;
    next.setAttribute("data-dt-grid-page", String(pageNumber + 1));
    controls.append(prev);
    items.forEach((item) => {
      if (item === "ellipsis") {
        const span = document.createElement("span");
        span.className = "dt-datagrid-pager-ellipsis";
        span.setAttribute("aria-hidden", "true");
        span.textContent = "…";
        controls.append(span);
        return;
      }
      const button = document.createElement("button");
      button.type = "button";
      button.className = "dt-datagrid-pager-button" + (item === pageNumber ? " dt-datagrid-pager-button--active" : "");
      button.textContent = String(item);
      if (item === pageNumber) button.setAttribute("aria-current", "page");
      button.setAttribute("data-dt-grid-page", String(item));
      controls.append(button);
    });
    controls.append(next);
    container.replaceChildren(summary, controls);
    const sizes = root.dataset.dtDatagridPagesizeOptions;
    if (sizes) {
      try {
        const options = JSON.parse(sizes);
        const label = document.createElement("label");
        label.className = "dt-datagrid-pager-size";
        label.textContent = "Items per page";
        const select = document.createElement("select");
        select.setAttribute("data-dt-grid-page-size", "");
        options.forEach((size) => {
          const option = document.createElement("option");
          option.value = String(size);
          option.textContent = String(size);
          select.append(option);
        });
        select.value = String(pageSize);
        label.append(select);
        container.append(label);
      } catch {
        /* invalid page size options — skip selector */
      }
    }
  }

  function gridPageItems(pageNumber, pageCount, max) {
    if (pageCount <= max) return Array.from({ length: pageCount }, (_, i) => i + 1);
    const half = Math.floor(max / 2);
    let start = Math.max(1, pageNumber - half);
    const end = Math.min(pageCount, start + max - 1);
    start = Math.max(1, end - max + 1);
    const items = [];
    for (let i = start; i <= end; i++) items.push(i);
    if (start > 2) items.unshift("ellipsis");
    if (start > 1) items.unshift(1);
    if (end < pageCount - 1) items.push("ellipsis");
    if (end < pageCount) items.push(pageCount);
    return items;
  }

  function renderGridPicker(root, columns) {
    const toolbar = root.querySelector("[data-dt-datagrid-toolbar]");
    if (!toolbar) return;
    const state = gridState.get(root);
    const parts = [];
    if (root.hasAttribute("data-dt-datagrid-groupable")) {
      const panel = document.createElement("div");
      panel.className = "dt-datagrid-group-panel" + (state.groupBy ? " dt-datagrid-group-panel--active" : "");
      panel.setAttribute("data-dt-grid-group-panel", "");
      if (state.groupBy) {
        const column = columns.find((c) => c.property === state.groupBy);
        const chip = document.createElement("span");
        chip.className = "dt-datagrid-group-chip";
        const clear = document.createElement("button");
        clear.type = "button";
        clear.className = "dt-datagrid-group-clear";
        clear.setAttribute("data-dt-grid-group-clear", "");
        clear.setAttribute("aria-label", `Remove group by ${column?.title ?? state.groupBy}`);
        clear.textContent = "×";
        chip.append(`${column?.title ?? state.groupBy}: `);
        chip.append(clear);
        panel.append(chip);
      } else {
        const hint = document.createElement("span");
        hint.className = "dt-datagrid-group-hint";
        hint.textContent = root.dataset.dtDatagridGroupText ?? "Drag a column header here to group";
        panel.append(hint);
      }
      parts.push(panel);
    }
    if (root.hasAttribute("data-dt-datagrid-create")) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "dt-datagrid-picker-button";
      button.setAttribute("data-dt-grid-row-create", "");
      button.textContent = root.dataset.dtDatagridCreateText ?? "Add row";
      parts.push(button);
    }
    if (root.hasAttribute("data-dt-datagrid-column-picker")) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "dt-datagrid-picker-button";
      button.setAttribute("data-dt-grid-picker-toggle", "");
      button.setAttribute("aria-haspopup", "menu");
      button.setAttribute("aria-expanded", String(state.pickerOpen));
      button.textContent = root.dataset.dtDatagridPickerText ?? "Columns";
      const panel = document.createElement("div");
      panel.className = "dt-datagrid-picker-panel";
      panel.setAttribute("data-dt-grid-picker-panel", "");
      panel.hidden = !state.pickerOpen;
      panel.setAttribute("role", "menu");
      columns.forEach((column, i) => {
        const key = gridColumnKey(column, i);
        const label = document.createElement("label");
        label.className = "dt-datagrid-picker-item";
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.setAttribute("data-dt-grid-picker-item", key);
        checkbox.checked = state.visible.has(key);
        label.append(checkbox);
        label.append(column.title ?? column.property);
        panel.append(label);
      });
      parts.push(button, panel);
    }
    toolbar.replaceChildren(...parts);
  }

  function gridSyncColumns(root, columns) {
    const state = gridState.get(root);
    const effective = gridEffectiveColumns(state, columns);
    const tbody = root.querySelector("[data-dt-datagrid-rows]");
    if (!tbody) return;
    tbody.querySelectorAll("[data-dt-row]").forEach((row) => {
      const cells = row.querySelectorAll("td");
      let running = 0;
      effective.forEach(({ key, column }, i) => {
        const td = cells[i];
        if (!td) return;
        td.classList.toggle("dt-datagrid-cell--frozen", Boolean(column.frozen));
        if (column.frozen) {
          td.style.left = running === 0 ? "0px" : `${running}px`;
          const width = state.widths[key] ?? column.width ?? "6rem";
          running += parseFloat(width);
        } else {
          td.style.left = "";
        }
      });
    });
  }

  function gridSelectRow(root, row, toggle) {
    const mode = root.dataset.dtDatagridSelect;
    if (mode !== "single" && mode !== "multiple") return;
    const key = row.dataset.dtRowKey ?? String([...row.parentElement.children].indexOf(row));
    const state = gridState.get(root);
    const wasSelected = state.selected.includes(key);
    let selected = state.selected.filter((k) => k !== key);
    if (toggle && !wasSelected) {
      if (mode === "single") selected = [key];
      else selected.push(key);
    }
    state.selected = selected;
    row.setAttribute("aria-selected", String(selected.includes(key)));
    row.classList.toggle("dt-datagrid-row--selected", selected.includes(key));
    root.dispatchEvent(new CustomEvent("dt:grid-select", { bubbles: true, detail: { keys: selected } }));
  }

  function gridResizeStart(root, handle, e) {
    const key = handle.getAttribute("data-dt-grid-resize");
    const state = gridState.get(root);
    const column = parseGridColumns(root).find((c, i) => gridColumnKey(c, i) === key);
    const base = state.widths[key] ?? column?.width;
    const width = base ? parseFloat(base) : 96;
    state.widths[key] = String(Number.isFinite(width) ? width : 96);
    state.resize = { key, startX: e.clientX, startWidth: Number(state.widths[key]) };
    const move = (ev) => {
      const resize = state.resize;
      if (!resize) return;
      const delta = ev.clientX - resize.startX;
      const next = Math.max(48, resize.startWidth + delta);
      state.widths[resize.key] = `${next}px`;
      const effective = gridEffectiveColumns(state, parseGridColumns(root));
      const index = effective.findIndex((e) => e.key === resize.key);
      const col = root.querySelector(`[data-dt-datagrid-cols] col:nth-child(${index + 1})`);
      if (col) col.style.width = `${next}px`;
    };
    const end = () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", end);
      state.resize = null;
    };
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", end);
  }

  function gridEnsureCommandCells(root, columns) {
    if (!gridShowCommandColumn(root)) return;
    const state = gridState.get(root);
    const effective = gridEffectiveColumns(state, columns);
    const editing = state.editKey != null;
    root.querySelectorAll("[data-dt-row]").forEach((row) => {
      if (row.querySelector("[data-dt-grid-command]")) return;
      const td = document.createElement("td");
      td.setAttribute("data-dt-grid-command", "");
      td.className = "dt-datagrid-command-cell";
      if (editing && row.dataset.dtRowKey === state.editKey) {
        td.append(gridButton("Save", "data-dt-grid-row-save"), gridButton("Cancel", "data-dt-grid-row-cancel"));
      } else {
        if (root.hasAttribute("data-dt-datagrid-edit")) td.append(gridButton("Edit", "data-dt-grid-row-edit"));
        if (root.hasAttribute("data-dt-datagrid-delete")) td.append(gridButton("Delete", "data-dt-grid-row-delete"));
      }
      row.append(td);
    });
    void effective;
  }

  function gridButton(text, attr) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "dt-datagrid-command-button";
    button.setAttribute(attr, "");
    button.textContent = text;
    return button;
  }

  function gridStartEdit(root, row) {
    const state = gridState.get(root);
    if (state.editKey != null) return;
    const columns = parseGridColumns(root);
    const values = gridRowValues(row);
    state.editKey = row.dataset.dtRowKey;
    state.edits = { row, original: values, cells: [] };
    const effective = gridEffectiveColumns(state, columns);
    effective.forEach(({ column }) => {
      const td = row.querySelector(`[data-dt-col="${column.property}"]`);
      if (!td || !column.property) return;
      state.edits.cells.push({ td, text: td.textContent, className: td.className });
      td.replaceChildren();
      const input = document.createElement("input");
      input.className = "dt-datagrid-edit-input";
      input.setAttribute("data-dt-grid-edit-input", column.property);
      input.type = column.type === "number" ? "number" : column.type === "boolean" ? "checkbox" : "text";
      if (column.type === "boolean") input.checked = Boolean(values[column.property]);
      else input.value = String(values[column.property] ?? "");
      td.append(input);
    });
    row.classList.add("dt-datagrid-row--editing");
    const command = row.querySelector("[data-dt-grid-command]");
    if (command) command.replaceChildren(gridButton("Save", "data-dt-grid-row-save"), gridButton("Cancel", "data-dt-grid-row-cancel"));
  }

  function gridRestoreRow(root) {
    const state = gridState.get(root);
    if (!state.edits) return;
    state.edits.cells.forEach(({ td, text, className }) => {
      td.replaceChildren(document.createTextNode(text));
      td.className = className;
    });
    state.edits.row.classList.remove("dt-datagrid-row--editing");
    const command = state.edits.row.querySelector("[data-dt-grid-command]");
    if (command) {
      const parts = [];
      if (root.hasAttribute("data-dt-datagrid-edit")) parts.push(gridButton("Edit", "data-dt-grid-row-edit"));
      if (root.hasAttribute("data-dt-datagrid-delete")) parts.push(gridButton("Delete", "data-dt-grid-row-delete"));
      command.replaceChildren(...parts);
    }
    state.editKey = null;
    state.edits = null;
  }

  function gridSaveEdit(root) {
    const state = gridState.get(root);
    if (!state.edits) return;
    const updated = { ...state.edits.original };
    state.edits.row.querySelectorAll("[data-dt-grid-edit-input]").forEach((input) => {
      const property = input.getAttribute("data-dt-grid-edit-input");
      updated[property] = input.type === "checkbox" ? input.checked : input.value;
    });
    root.dispatchEvent(new CustomEvent("dt:grid-row-update", { bubbles: true, detail: { original: state.edits.original, updated } }));
    gridRestoreRow(root);
  }

  function gridDeleteRow(root, row) {
    const values = gridRowValues(row);
    root.dispatchEvent(new CustomEvent("dt:grid-row-delete", { bubbles: true, detail: { row: values } }));
    row.remove();
    gridApplyView(root);
  }

  function gridStartCreate(root) {
    const state = gridState.get(root);
    if (state.editKey != null) return;
    const columns = parseGridColumns(root);
    const tbody = root.querySelector("[data-dt-datagrid-rows]");
    if (!tbody || tbody.querySelector("[data-dt-grid-new-row]")) return;
    state.editKey = "__new__";
    state.edits = { row: null, original: {}, cells: [] };
    const tr = document.createElement("tr");
    tr.setAttribute("data-dt-grid-new-row", "");
    tr.className = "dt-datagrid-row--editing";
    gridEffectiveColumns(state, columns).forEach(({ column }) => {
      const td = document.createElement("td");
      const input = document.createElement("input");
      input.className = "dt-datagrid-edit-input";
      input.setAttribute("data-dt-grid-edit-input", column.property);
      input.type = column.type === "number" ? "number" : column.type === "boolean" ? "checkbox" : "text";
      if (column.type === "boolean") input.checked = false;
      td.append(input);
      tr.append(td);
    });
    if (gridShowCommandColumn(root)) {
      const td = document.createElement("td");
      td.setAttribute("data-dt-grid-command", "");
      td.className = "dt-datagrid-command-cell";
      td.append(gridButton("Save", "data-dt-grid-row-create-save"), gridButton("Cancel", "data-dt-grid-row-create-cancel"));
      tr.append(td);
    }
    tbody.prepend(tr);
  }

  function gridSaveCreate(root) {
    const state = gridState.get(root);
    const newRow = root.querySelector("[data-dt-grid-new-row]");
    if (!newRow) return;
    const row = {};
    newRow.querySelectorAll("[data-dt-grid-edit-input]").forEach((input) => {
      const property = input.getAttribute("data-dt-grid-edit-input");
      row[property] = input.type === "checkbox" ? input.checked : input.value;
    });
    root.dispatchEvent(new CustomEvent("dt:grid-row-create", { bubbles: true, detail: { row } }));
    newRow.remove();
    state.editKey = null;
    state.edits = null;
    gridApplyView(root);
  }

  function gridApplyView(root) {
    const state = gridState.get(root);
    const columns = parseGridColumns(root);
    const rows = [...root.querySelectorAll("[data-dt-row]")];
    const data = rows.map((row) => ({ row, values: gridRowValues(row) }));
    const filters = [...state.filters.entries()]
      .filter(([, f]) => f.value !== "" && f.value !== undefined)
      .map(([property, f]) => {
        const column = columns.find((c) => c.property === property);
        return { property, operator: f.operator ?? "Contains", value: f.value, type: column?.type };
      });
    let visible = data;
    if (filters.length > 0) {
      const join = state.logicalOperator === "Or" ? "some" : "every";
      visible = data.filter((entry) =>
        filters[join]((filter) => gridMatches(entry.values[filter.property], filter, state)),
      );
    }
    if (state.sorts.length > 0) {
      visible = visible.slice().sort((a, b) => {
        for (const sort of state.sorts) {
          const diff = gridCompare(a.values[sort.property], b.values[sort.property]);
          if (diff !== 0) return sort.sortOrder === "Descending" ? -diff : diff;
        }
        return 0;
      });
    }
    const total = visible.length;
    const pageCount = Math.max(1, Math.ceil(total / state.pageSize));
    state.pageNumber = Math.min(Math.max(1, state.pageNumber), pageCount);
    const start = (state.pageNumber - 1) * state.pageSize;
    const page = visible.slice(start, start + state.pageSize);
    const pageRows = new Set(page.map((entry) => entry.row));
    data.forEach((entry) => {
      entry.row.hidden = !pageRows.has(entry.row);
    });
    const tbody = root.querySelector("[data-dt-datagrid-rows]");
    if (tbody) {
      gridEnsureCommandCells(root, columns);
      const fragment = [];
      const newRow = tbody.querySelector("[data-dt-grid-new-row]");
      if (newRow) fragment.push(newRow);
      if (state.groupBy) {
        const groups = new Map();
        page.forEach((entry) => {
          const value = gridRowValues(entry.row)[state.groupBy];
          const key = String(value ?? "");
          if (!groups.has(key)) groups.set(key, []);
          groups.get(key).push(entry.row);
        });
        const column = columns.find((c) => c.property === state.groupBy);
        const effective = gridEffectiveColumns(state, columns);
        const colSpan = effective.length + (gridShowCommandColumn(root) ? 1 : 0);
        groups.forEach((rows, key) => {
          const header = document.createElement("tr");
          header.className = "dt-datagrid-group-row";
          const td = document.createElement("td");
          td.colSpan = colSpan;
          td.className = "dt-datagrid-group-cell";
          const button = document.createElement("button");
          button.type = "button";
          button.className = "dt-datagrid-group-toggle";
          button.setAttribute("data-dt-grid-group-toggle", key);
          button.setAttribute("aria-expanded", String(state.expanded.has(key)));
          const arrow = document.createElement("span");
          arrow.setAttribute("aria-hidden", "true");
          arrow.textContent = state.expanded.has(key) ? "▼" : "▶";
          const label = document.createElement("span");
          label.textContent = `${column?.title ?? state.groupBy}: ${key} (${rows.length})`;
          button.append(arrow, label);
          td.append(button);
          header.append(td);
          fragment.push(header);
          rows.forEach((row) => {
            if (!state.expanded.has(key)) row.hidden = true;
            fragment.push(row);
          });
        });
        data
          .filter((entry) => !pageRows.has(entry.row))
          .forEach((entry) => fragment.push(entry.row));
      } else {
        const currentOrder = [...tbody.querySelectorAll("[data-dt-row]")];
        const needsReorder = page.some((entry, i) => currentOrder[i] !== entry.row);
        if (needsReorder) {
          currentOrder.filter((row) => !pageRows.has(row)).forEach((row) => fragment.push(row));
          page.forEach((entry) => fragment.push(entry.row));
        } else {
          currentOrder.forEach((row) => fragment.push(row));
        }
      }
      tbody.replaceChildren(...fragment);
    }
    const empty = root.querySelector("[data-dt-datagrid-empty]");
    if (empty) empty.hidden = total > 0;
    gridSyncColumns(root, columns);
    renderGridPager(root, { pageNumber: state.pageNumber, pageSize: state.pageSize, pageCount, total });
    const detail = {
      pageNumber: state.pageNumber,
      pageSize: state.pageSize,
      pageCount,
      total,
      sorts: state.sorts,
      filters,
      filterString: filters.map(toLinqString).join(` ${state.logicalOperator} `),
      oDataFilterString: filters.map(toODataString).join(` ${state.logicalOperator === "Or" ? "or" : "and"} `),
    };
    root.dispatchEvent(new CustomEvent("dt:grid-change", { bubbles: true, detail }));
  }

  on("[data-dt-datagrid]", "click", (root, e) => {
    const sortButton = e.target.closest("[data-dt-grid-sort]");
    if (sortButton) {
      const state = gridState.get(root);
      if (!state) return;
      const property = sortButton.getAttribute("data-dt-grid-sort");
      const current = state.sorts.find((s) => s.property === property);
      const next = current
        ? current.sortOrder === "Ascending"
          ? "Descending"
          : null
        : "Ascending";
      const without = state.sorts.filter((s) => s.property !== property);
      state.sorts = next == null ? without : [...(root.hasAttribute("data-dt-datagrid-multisort") ? without : []), { property, sortOrder: next }];
      renderGridHeader(root, parseGridColumns(root));
      gridApplyView(root);
      root.dispatchEvent(new CustomEvent("dt:grid-sort", { bubbles: true, detail: { property, sortOrder: next } }));
      return;
    }
    const page = e.target.closest("[data-dt-grid-page]");
    if (page) {
      const state = gridState.get(root);
      if (!state) return;
      state.pageNumber = Number(page.getAttribute("data-dt-grid-page"));
      gridApplyView(root);
      root.dispatchEvent(new CustomEvent("dt:grid-page", { bubbles: true, detail: { pageNumber: state.pageNumber } }));
      return;
    }
    const pickerToggle = e.target.closest("[data-dt-grid-picker-toggle]");
    if (pickerToggle) {
      const state = gridState.get(root);
      if (!state) return;
      state.pickerOpen = !state.pickerOpen;
      renderGridPicker(root, parseGridColumns(root));
      return;
    }
    const pickerPanel = e.target.closest("[data-dt-grid-picker-panel]");
    if (pickerPanel && e.target.closest("[data-dt-grid-picker-item]")) {
      return;
    }
    const groupToggle = e.target.closest("[data-dt-grid-group-toggle]");
    if (groupToggle) {
      const state = gridState.get(root);
      if (!state) return;
      const key = groupToggle.getAttribute("data-dt-grid-group-toggle");
      if (state.expanded.has(key)) state.expanded.delete(key);
      else state.expanded.add(key);
      gridApplyView(root);
      return;
    }
    const groupClear = e.target.closest("[data-dt-grid-group-clear]");
    if (groupClear) {
      const state = gridState.get(root);
      if (!state) return;
      state.groupBy = null;
      state.expanded = new Set();
      renderGridHeader(root, parseGridColumns(root));
      renderGridPicker(root, parseGridColumns(root));
      gridApplyView(root);
      root.dispatchEvent(new CustomEvent("dt:grid-group-change", { bubbles: true, detail: { property: null } }));
      return;
    }
    const rowEdit = e.target.closest("[data-dt-grid-row-edit]");
    if (rowEdit) {
      const row = rowEdit.closest("[data-dt-row]");
      if (row) gridStartEdit(root, row);
      return;
    }
    const rowSave = e.target.closest("[data-dt-grid-row-save]");
    if (rowSave) {
      gridSaveEdit(root);
      return;
    }
    const rowCancel = e.target.closest("[data-dt-grid-row-cancel]");
    if (rowCancel) {
      gridRestoreRow(root);
      return;
    }
    const rowDelete = e.target.closest("[data-dt-grid-row-delete]");
    if (rowDelete) {
      const row = rowDelete.closest("[data-dt-row]");
      if (row) gridDeleteRow(root, row);
      return;
    }
    const createSave = e.target.closest("[data-dt-grid-row-create-save]");
    if (createSave) {
      gridSaveCreate(root);
      return;
    }
    const createCancel = e.target.closest("[data-dt-grid-row-create-cancel]");
    if (createCancel) {
      root.querySelector("[data-dt-grid-new-row]")?.remove();
      gridState.get(root).editKey = null;
      gridState.get(root).edits = null;
      gridApplyView(root);
      return;
    }
    const createButton = e.target.closest("[data-dt-grid-row-create]");
    if (createButton) {
      gridStartCreate(root);
      return;
    }
    const row = e.target.closest("[data-dt-row]");
    if (row && !e.target.closest("button, select, input, a, label, [data-dt-grid-resize]")) {
      gridSelectRow(root, row, true);
    }
  });

  on("[data-dt-datagrid]", "mousedown", (root, e) => {
    const resizeHandle = e.target.closest("[data-dt-grid-resize]");
    if (!resizeHandle) return;
    e.preventDefault();
    gridResizeStart(root, resizeHandle, e);
  });

  on("[data-dt-datagrid]", "dragover", (root, e) => {
    if (root.hasAttribute("data-dt-datagrid-reorder") && e.target.closest("[data-dt-grid-col]")) {
      e.preventDefault();
    }
  });

  on("[data-dt-datagrid]", "dragstart", (root, e) => {
    const source = e.target.closest("[data-dt-grid-col]");
    if (!source) return;
    const state = gridState.get(root);
    if (!state) return;
    state.dragKey = source.getAttribute("data-dt-grid-col");
    if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
  });

  on("[data-dt-datagrid]", "drop", (root, e) => {
    const panel = e.target.closest("[data-dt-grid-group-panel]");
    if (panel) {
      e.preventDefault();
      const state = gridState.get(root);
      if (!state || state.dragKey == null || !root.hasAttribute("data-dt-datagrid-groupable")) return;
      const key = state.dragKey;
      state.dragKey = null;
      const column = parseGridColumns(root).find((c, i) => gridColumnKey(c, i) === key);
      if (!column?.property) return;
      state.groupBy = column.property;
      state.expanded = new Set(
        [...root.querySelectorAll("[data-dt-row]")].map((row) => String(gridRowValues(row)[column.property] ?? "")),
      );
      renderGridHeader(root, parseGridColumns(root));
      renderGridPicker(root, parseGridColumns(root));
      gridApplyView(root);
      root.dispatchEvent(new CustomEvent("dt:grid-group-change", { bubbles: true, detail: { property: column.property } }));
      return;
    }
    const target = e.target.closest("[data-dt-grid-col]");
    if (!target) return;
    e.preventDefault();
    const state = gridState.get(root);
    if (!state || state.dragKey == null) return;
    const sourceKey = state.dragKey;
    const targetKey = target.getAttribute("data-dt-grid-col");
    if (sourceKey !== targetKey) {
      const next = state.order.filter((k) => k !== sourceKey);
      next.splice(next.indexOf(targetKey), 0, sourceKey);
      state.order = next;
      renderGridHeader(root, parseGridColumns(root));
      gridApplyView(root);
      root.dispatchEvent(new CustomEvent("dt:grid-column-reorder", { bubbles: true, detail: { from: sourceKey, to: targetKey } }));
    }
  });

  on("[data-dt-datagrid]", "change", (root, e) => {
    const state = gridState.get(root);
    if (!state) return;
    const pickerItem = e.target.closest("[data-dt-grid-picker-item]");
    if (pickerItem) {
      const key = pickerItem.getAttribute("data-dt-grid-picker-item");
      if (pickerItem.checked) state.visible.add(key);
      else state.visible.delete(key);
      renderGridHeader(root, parseGridColumns(root));
      gridApplyView(root);
      root.dispatchEvent(new CustomEvent("dt:grid-column-pick", { bubbles: true, detail: { key, visible: pickerItem.checked } }));
      return;
    }
    const op = e.target.closest("[data-dt-grid-filter-op]");
    const value = e.target.closest("[data-dt-grid-filter-value]");
    const pageSize = e.target.closest("[data-dt-grid-page-size]");
    if (pageSize) {
      state.pageSize = Number(pageSize.value);
      state.pageNumber = 1;
      gridApplyView(root);
      return;
    }
    if (!op && !value) return;
    const property = op
      ? op.getAttribute("data-dt-grid-filter-op")
      : value.getAttribute("data-dt-grid-filter-value");
    const current = state.filters.get(property) ?? {};
    const opSelect = root.querySelector(`[data-dt-grid-filter-op="${property}"]`);
    state.filters.set(property, {
      operator: op ? op.value : (opSelect ? opSelect.value : current.operator),
      value: value ? value.value : current.value,
    });
    state.pageNumber = 1;
    gridApplyView(root);
    root.dispatchEvent(new CustomEvent("dt:grid-filter", { bubbles: true, detail: { property, ...state.filters.get(property) } }));
  });

  function initDataGrid(root) {
    if (gridState.has(root)) return;
    gridState.set(root, defaultGridState(root));
    if (root.hasAttribute("data-dt-datagrid-column-picker")) {
      renderGridPicker(root, parseGridColumns(root));
    }
    renderGridHeader(root, parseGridColumns(root));
    gridApplyView(root);
  }

  document.querySelectorAll("[data-dt-datagrid]").forEach(initDataGrid);

  /* ---------------- DataList ---------------- */

  const datalistState = new WeakMap();

  function initDataList(root) {
    if (datalistState.has(root)) return;
    const size = Number(root.dataset.dtDatalistPagesize ?? "10") || 10;
    datalistState.set(root, { pageNumber: 1, pageSize: size });
    datalistApplyView(root);
  }

  function datalistApplyView(root) {
    const state = datalistState.get(root);
    const items = [...root.querySelectorAll("[data-dt-datalist-item]")];
    const total = items.length;
    const pageCount = Math.max(1, Math.ceil(total / state.pageSize));
    state.pageNumber = Math.min(Math.max(1, state.pageNumber), pageCount);
    const start = (state.pageNumber - 1) * state.pageSize;
    items.forEach((item, i) => {
      item.hidden = i < start || i >= start + state.pageSize;
    });
    const empty = root.querySelector("[data-dt-datalist-empty]");
    if (empty) empty.hidden = total > 0;
    datalistRenderPager(root, { pageNumber: state.pageNumber, pageSize: state.pageSize, pageCount, total });
    root.dispatchEvent(
      new CustomEvent("dt:datalist-change", {
        bubbles: true,
        detail: { pageNumber: state.pageNumber, pageSize: state.pageSize, pageCount, total },
      }),
    );
  }

  function datalistRenderPager(root, view) {
    const container = root.querySelector("[data-dt-datalist-pager]");
    if (!container) return;
    const { pageNumber, pageSize, pageCount, total } = view;
    const summary = document.createElement("span");
    summary.className = "dt-datalist-pager-summary";
    summary.textContent = `Page ${pageNumber} of ${pageCount} (${total} items)`;
    const controls = document.createElement("div");
    controls.className = "dt-datalist-pager-controls";
    const prev = document.createElement("button");
    prev.type = "button";
    prev.className = "dt-datalist-pager-button";
    prev.textContent = "‹";
    prev.setAttribute("aria-label", "Previous page");
    prev.disabled = pageNumber <= 1;
    prev.setAttribute("data-dt-datalist-page", String(pageNumber - 1));
    const max = Number(root.dataset.dtDatalistPagenumbers ?? "5");
    const items = gridPageItems(pageNumber, pageCount, max);
    const next = document.createElement("button");
    next.type = "button";
    next.className = "dt-datalist-pager-button";
    next.textContent = "›";
    next.setAttribute("aria-label", "Next page");
    next.disabled = pageNumber >= pageCount;
    next.setAttribute("data-dt-datalist-page", String(pageNumber + 1));
    controls.append(prev);
    items.forEach((item) => {
      if (item === "ellipsis") {
        const span = document.createElement("span");
        span.className = "dt-datalist-pager-ellipsis";
        span.setAttribute("aria-hidden", "true");
        span.textContent = "…";
        controls.append(span);
        return;
      }
      const button = document.createElement("button");
      button.type = "button";
      button.className = "dt-datalist-pager-button" + (item === pageNumber ? " dt-datalist-pager-button--active" : "");
      button.textContent = String(item);
      if (item === pageNumber) button.setAttribute("aria-current", "page");
      button.setAttribute("data-dt-datalist-page", String(item));
      controls.append(button);
    });
    controls.append(next);
    container.replaceChildren(summary, controls);
    const sizes = root.dataset.dtDatalistPagesizeOptions;
    if (sizes) {
      try {
        const options = JSON.parse(sizes);
        const label = document.createElement("label");
        label.className = "dt-datalist-pager-size";
        label.textContent = "Items per page";
        const select = document.createElement("select");
        select.setAttribute("data-dt-datalist-page-size", "");
        options.forEach((size) => {
          const option = document.createElement("option");
          option.value = String(size);
          option.textContent = String(size);
          select.append(option);
        });
        select.value = String(pageSize);
        label.append(select);
        container.append(label);
      } catch {
        /* invalid page size options — skip selector */
      }
    }
  }

  on("[data-dt-datalist]", "click", (root, e) => {
    const page = e.target.closest("[data-dt-datalist-page]");
    if (!page) return;
    const state = datalistState.get(root);
    if (!state) return;
    state.pageNumber = Number(page.getAttribute("data-dt-datalist-page"));
    datalistApplyView(root);
    root.dispatchEvent(new CustomEvent("dt:datalist-page", { bubbles: true, detail: { pageNumber: state.pageNumber } }));
  });

  on("[data-dt-datalist]", "change", (root, e) => {
    const select = e.target.closest("[data-dt-datalist-page-size]");
    if (!select) return;
    const state = datalistState.get(root);
    if (!state) return;
    state.pageSize = Number(select.value);
    state.pageNumber = 1;
    datalistApplyView(root);
  });

  document.querySelectorAll("[data-dt-datalist]").forEach(initDataList);

/* ---------------- Datepicker ---------------- */

  // [data-dt-datepicker] is a calendar popup picker. The root carries
  // data-dt-format (yyyy/yy/MM/M/dd/d/HH/H/mm/m/ss/s tokens),
  // data-dt-min/data-dt-max (ISO dates), data-dt-locale (BCP 47),
  // data-dt-show-time (time steppers + OK commit), data-dt-inline
  // (always-visible calendar, no input/trigger) and data-dt-value (ISO
  // date used when there is no input). The behavior renders the weekday
  // header and the 6x7 day grid, drives roving tabindex / aria-selected /
  // aria-disabled, commits on Enter/Space or day click, parses free
  // typing on blur/Enter and dispatches dt:change (detail.value = ISO
  // date, "yyyy-MM-dd" or "yyyy-MM-ddTHH:mm:ss" with time) and dt:invalid
  // when parsing fails. Init is lazy and idempotent (also re-run on
  // htmx:afterSettle); window.dtUikit.datepicker.init(root) forces it.

  function datepickerData(root) {
    let st = root._dtDatepicker;
    if (!st) {
      st = {
        input: root.querySelector("[data-dt-datepicker-input]"),
        trigger: root.querySelector("[data-dt-datepicker-trigger]"),
        clear: root.querySelector("[data-dt-datepicker-clear]"),
        popup: root.querySelector("[data-dt-datepicker-popup]"),
        grid: root.querySelector("[data-dt-datepicker-grid]"),
        weekdays: root.querySelector("[data-dt-datepicker-weekdays]"),
        title: root.querySelector("[data-dt-datepicker-title]"),
        prev: root.querySelector("[data-dt-datepicker-prev]"),
        next: root.querySelector("[data-dt-datepicker-next]"),
        time: root.querySelector("[data-dt-datepicker-time]"),
        footer: root.querySelector("[data-dt-datepicker-footer]"),
        ok: root.querySelector("[data-dt-datepicker-ok]"),
        open: false,
        selected: null,
        focus: null,
        view: null,
      };
      root._dtDatepicker = st;
    }
    return st;
  }

  function datepickerPad(n) {
    return String(n).padStart(2, "0");
  }

  function datepickerISO(date) {
    return `${date.getFullYear()}-${datepickerPad(date.getMonth() + 1)}-${datepickerPad(date.getDate())}`;
  }

  function datepickerISOFull(date) {
    return `${datepickerISO(date)}T${datepickerPad(date.getHours())}:${datepickerPad(date.getMinutes())}:${datepickerPad(date.getSeconds())}`;
  }

  function datepickerParseISO(text) {
    const m = String(text).match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (!m) return null;
    const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
    if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
    const date = new Date(y, mo - 1, d);
    return date.getMonth() === mo - 1 && date.getDate() === d ? date : null;
  }

  function datepickerBounds(root) {
    return {
      min: datepickerParseISO(root.getAttribute("data-dt-min")),
      max: datepickerParseISO(root.getAttribute("data-dt-max")),
    };
  }

  function datepickerFormat(date, format) {
    const toks = {
      yyyy: String(date.getFullYear()),
      yy: String(date.getFullYear()).slice(-2),
      MM: datepickerPad(date.getMonth() + 1),
      M: String(date.getMonth() + 1),
      dd: datepickerPad(date.getDate()),
      d: String(date.getDate()),
      HH: datepickerPad(date.getHours()),
      H: String(date.getHours()),
      mm: datepickerPad(date.getMinutes()),
      m: String(date.getMinutes()),
      ss: datepickerPad(date.getSeconds()),
      s: String(date.getSeconds()),
    };
    return String(format || "yyyy-MM-dd").replace(/yyyy|yy|MM|M|dd|d|HH|H|mm|m|ss|s/g, (tok) => toks[tok] ?? tok);
  }

  function datepickerParse(text, format) {
    const tokens = [...String(format || "yyyy-MM-dd").matchAll(/yyyy|yy|MM|M|dd|d|HH|H|mm|m|ss|s/g)].map((m) => m[0]);
    const nums = [...String(text).matchAll(/\d+/g)].map((m) => Number(m[0]));
    if (nums.length < tokens.length) return null;
    let y = 1970, mo = 1, d = 1, h = 0, mi = 0, s = 0;
    tokens.forEach((tok, i) => {
      const v = nums[i];
      if (tok === "yyyy") y = v;
      else if (tok === "yy") y = 2000 + v;
      else if (tok === "MM" || tok === "M") mo = v;
      else if (tok === "dd" || tok === "d") d = v;
      else if (tok === "HH" || tok === "H") h = v;
      else if (tok === "mm" || tok === "m") mi = v;
      else if (tok === "ss" || tok === "s") s = v;
    });
    if (mo < 1 || mo > 12 || d < 1 || d > 31 || h > 23 || mi > 59 || s > 59) return null;
    const date = new Date(y, mo - 1, d, h, mi, s);
    return date.getMonth() === mo - 1 && date.getDate() === d ? date : null;
  }

  function datepickerWeekStart(locale) {
    try {
      return new Intl.Locale(locale).weekInfo.firstDay ?? 0;
    } catch {
      return 0;
    }
  }

  function datepickerAddDays(date, n) {
    const out = new Date(date);
    out.setDate(out.getDate() + n);
    return out;
  }

  function datepickerAddMonths(date, n) {
    const out = new Date(date.getFullYear(), date.getMonth() + n, 1);
    const last = new Date(out.getFullYear(), out.getMonth() + 1, 0).getDate();
    out.setDate(Math.min(date.getDate(), last));
    return out;
  }

  function datepickerAddYears(date, n) {
    const out = new Date(date.getFullYear() + n, date.getMonth(), 1);
    const last = new Date(out.getFullYear(), out.getMonth() + 1, 0).getDate();
    out.setDate(Math.min(date.getDate(), last));
    return out;
  }

  function datepickerClamp(date, min, max) {
    if (min && date < min) return new Date(min);
    if (max && date > max) return new Date(max);
    return date;
  }

  function datepickerRender(root) {
    const st = datepickerData(root);
    if (!st.view) initDatepicker(root);
    if (!st.grid) return;
    const locale = root.getAttribute("data-dt-locale") || "en-US";
    const { min, max } = datepickerBounds(root);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekStart = datepickerWeekStart(locale);
    const first = new Date(st.view.getFullYear(), st.view.getMonth(), 1);
    const start = datepickerAddDays(first, -((first.getDay() - weekStart + 7) % 7));
    const month = st.view.getMonth();
    if (st.title) {
      st.title.textContent = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(st.view);
    }
    if (st.weekdays) {
      const names = [...Array(7).keys()].map((i) =>
        new Intl.DateTimeFormat(locale, { weekday: "narrow" }).format(datepickerAddDays(start, i)),
      );
      st.weekdays.replaceChildren(
        ...names.map((name) => {
          const cell = document.createElement("div");
          cell.className = "dt-datepicker-weekday";
          cell.setAttribute("role", "columnheader");
          cell.textContent = name;
          return cell;
        }),
      );
    }
    const cells = [];
    for (let i = 0; i < 42; i++) {
      const day = datepickerAddDays(start, i);
      const iso = datepickerISO(day);
      const inMonth = day.getMonth() === month;
      const outOfBounds = (min && day < min) || (max && day > max);
      const disabled = !inMonth || outOfBounds;
      const selected = !!st.selected && datepickerISO(st.selected) === iso;
      const isToday = day.getTime() === today.getTime();
      const focused = !!st.focus && datepickerISO(st.focus) === iso;
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "dt-datepicker-day";
      if (!inMonth) cell.classList.add("dt-datepicker-day--outside");
      if (selected) cell.classList.add("dt-datepicker-day--selected");
      if (isToday) cell.classList.add("dt-datepicker-day--today");
      cell.setAttribute("role", "gridcell");
      cell.setAttribute("data-dt-datepicker-day", "");
      cell.setAttribute("data-dt-date-value", iso);
      cell.tabIndex = focused ? 0 : -1;
      if (selected) cell.setAttribute("aria-selected", "true");
      if (disabled) cell.setAttribute("aria-disabled", "true");
      cell.textContent = String(day.getDate());
      cells.push(cell);
    }
    st.grid.replaceChildren(...cells);
  }

  function datepickerFocused(root) {
    return root.querySelector("[data-dt-datepicker-day][tabindex='0']");
  }

  function datepickerSyncTime(root) {
    const st = datepickerData(root);
    if (!root.hasAttribute("data-dt-show-time")) return;
    const base = st.selected || st.focus || new Date();
    root.querySelectorAll("[data-dt-datepicker-time-field]").forEach((field) => {
      const kind = field.getAttribute("data-dt-datepicker-time-field");
      field.value = kind === "hours" ? datepickerPad(base.getHours())
        : kind === "minutes" ? datepickerPad(base.getMinutes())
        : datepickerPad(base.getSeconds());
    });
  }

  function datepickerReadTime(root, date) {
    const hours = root.querySelector('[data-dt-datepicker-time-field="hours"]');
    const minutes = root.querySelector('[data-dt-datepicker-time-field="minutes"]');
    const seconds = root.querySelector('[data-dt-datepicker-time-field="seconds"]');
    const out = new Date(date);
    if (hours) out.setHours(numericClamp(Number(hours.value) || 0, 0, 23));
    if (minutes) out.setMinutes(numericClamp(Number(minutes.value) || 0, 0, 59));
    if (seconds) out.setSeconds(numericClamp(Number(seconds.value) || 0, 0, 59));
    return out;
  }

  function datepickerSetOpen(root, open) {
    const st = datepickerData(root);
    if (!st.view) initDatepicker(root);
    const inline = root.hasAttribute("data-dt-inline");
    if (st.open === open) return;
    if (st.trigger) {
      st.trigger.setAttribute("aria-expanded", String(open));
      root.classList.toggle("dt-datepicker--open", open);
    }
    if (st.popup && !inline) st.popup.hidden = !open;
    if (open) {
      if (st.time) st.time.hidden = !root.hasAttribute("data-dt-show-time");
      if (st.footer) st.footer.hidden = !root.hasAttribute("data-dt-show-time");
      datepickerSyncTime(root);
      datepickerRender(root);
      datepickerFocused(root)?.focus();
    }
    st.open = open;
  }

  function datepickerCommit(root) {
    const st = datepickerData(root);
    if (!st.view) initDatepicker(root);
    if (!st.selected) return;
    if (root.hasAttribute("data-dt-show-time")) {
      st.selected = datepickerReadTime(root, st.selected);
    }
    const format = root.getAttribute("data-dt-format") || "yyyy-MM-dd";
    const iso = root.hasAttribute("data-dt-show-time")
      ? datepickerISOFull(st.selected)
      : datepickerISO(st.selected);
    if (st.input) {
      st.input.value = datepickerFormat(st.selected, format);
      st.input.classList.remove("dt-datepicker-input--invalid");
      st.input.removeAttribute("aria-invalid");
    }
    if (st.clear) st.clear.hidden = false;
    datepickerSetOpen(root, false);
    root.dispatchEvent(new CustomEvent("dt:change", { bubbles: true, detail: { value: iso } }));
    st.input?.focus();
  }

  function datepickerSelect(root, day) {
    const st = datepickerData(root);
    if (!st.view) initDatepicker(root);
    st.focus = new Date(day.getFullYear(), day.getMonth(), day.getDate());
    st.selected = new Date(st.focus);
    if (!root.hasAttribute("data-dt-show-time")) {
      datepickerCommit(root);
    } else {
      st.selected = datepickerReadTime(root, st.selected);
      datepickerRender(root);
    }
  }

  function datepickerApplyInput(root) {
    const st = datepickerData(root);
    if (!st.input) return;
    if (!st.view) initDatepicker(root);
    const format = root.getAttribute("data-dt-format") || "yyyy-MM-dd";
    const parsed = datepickerParse(st.input.value, format);
    const { min, max } = datepickerBounds(root);
    if (!parsed || (min && parsed < min) || (max && parsed > max)) {
      st.input.classList.add("dt-datepicker-input--invalid");
      st.input.setAttribute("aria-invalid", "true");
      root.dispatchEvent(new CustomEvent("dt:invalid", { bubbles: true, detail: { value: st.input.value } }));
      return;
    }
    st.selected = parsed;
    st.focus = new Date(parsed);
    st.view = new Date(parsed.getFullYear(), parsed.getMonth(), 1);
    st.input.value = datepickerFormat(parsed, format);
    st.input.classList.remove("dt-datepicker-input--invalid");
    st.input.removeAttribute("aria-invalid");
    datepickerRender(root);
    root.dispatchEvent(
      new CustomEvent("dt:change", {
        bubbles: true,
        detail: { value: root.hasAttribute("data-dt-show-time") ? datepickerISOFull(parsed) : datepickerISO(parsed) },
      }),
    );
  }

  function datepickerClear(root) {
    const st = datepickerData(root);
    if (!st.view) initDatepicker(root);
    st.selected = null;
    if (st.input) {
      st.input.value = "";
      st.input.classList.remove("dt-datepicker-input--invalid");
      st.input.removeAttribute("aria-invalid");
    }
    if (st.clear) st.clear.hidden = true;
    if (st.trigger) st.trigger.setAttribute("aria-expanded", "false");
    root.classList.remove("dt-datepicker--open");
    if (st.popup && !root.hasAttribute("data-dt-inline")) st.popup.hidden = true;
    st.open = false;
    datepickerRender(root);
    root.dispatchEvent(new CustomEvent("dt:change", { bubbles: true, detail: { value: null } }));
    st.input?.focus();
  }

  function datepickerNavMonth(root, delta) {
    const st = datepickerData(root);
    if (!st.view) initDatepicker(root);
    const { min, max } = datepickerBounds(root);
    st.view = datepickerAddMonths(st.view, delta);
    const dayNum = Math.min(st.focus.getDate(), new Date(st.view.getFullYear(), st.view.getMonth() + 1, 0).getDate());
    st.focus = datepickerClamp(new Date(st.view.getFullYear(), st.view.getMonth(), dayNum), min, max);
    datepickerRender(root);
    datepickerFocused(root)?.focus();
  }

  function initDatepicker(root) {
    const st = datepickerData(root);
    if (st.view) return;
    const format = root.getAttribute("data-dt-format") || "yyyy-MM-dd";
    let initial = datepickerParseISO(root.getAttribute("data-dt-value"));
    if (!initial && st.input && st.input.value) {
      initial = datepickerParse(st.input.value, format);
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { min, max } = datepickerBounds(root);
    st.selected = initial;
    st.focus = datepickerClamp(initial ? new Date(initial) : today, min, max);
    st.view = new Date(st.focus.getFullYear(), st.focus.getMonth(), 1);
    if (st.clear) st.clear.hidden = !st.selected;
    if (root.hasAttribute("data-dt-inline")) {
      if (st.time) st.time.hidden = !root.hasAttribute("data-dt-show-time");
      if (st.footer) st.footer.hidden = !root.hasAttribute("data-dt-show-time");
      if (st.popup) st.popup.hidden = false;
      datepickerSyncTime(root);
      datepickerRender(root);
    }
  }

  on("[data-dt-datepicker-trigger]", "click", (trigger) => {
    if (trigger.disabled) return;
    const root = trigger.closest("[data-dt-datepicker]");
    if (!root) return;
    initDatepicker(root);
    datepickerSetOpen(root, !datepickerData(root).open);
  });

  on("[data-dt-datepicker-clear]", "click", (clear) => {
    if (clear.disabled) return;
    const root = clear.closest("[data-dt-datepicker]");
    if (!root) return;
    datepickerClear(root);
  });

  on("[data-dt-datepicker-prev]", "click", (btn) => {
    const root = btn.closest("[data-dt-datepicker]");
    if (root) datepickerNavMonth(root, -1);
  });

  on("[data-dt-datepicker-next]", "click", (btn) => {
    const root = btn.closest("[data-dt-datepicker]");
    if (root) datepickerNavMonth(root, 1);
  });

  on("[data-dt-datepicker-ok]", "click", (btn) => {
    const root = btn.closest("[data-dt-datepicker]");
    if (root) datepickerCommit(root);
  });

  on("[data-dt-datepicker-day]", "click", (cell) => {
    if (cell.getAttribute("aria-disabled") === "true") return;
    const root = cell.closest("[data-dt-datepicker]");
    if (!root) return;
    const date = datepickerParseISO(cell.getAttribute("data-dt-date-value"));
    if (date) datepickerSelect(root, date);
  });

  on("[data-dt-datepicker-grid]", "keydown", (grid, e) => {
    const root = grid.closest("[data-dt-datepicker]");
    if (!root) return;
    initDatepicker(root);
    const st = datepickerData(root);
    const cell = e.target.closest("[data-dt-datepicker-day]");
    if (!cell) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (cell.getAttribute("aria-disabled") === "true") return;
      const date = datepickerParseISO(cell.getAttribute("data-dt-date-value"));
      if (date) datepickerSelect(root, date);
      return;
    }
    if (cell.getAttribute("aria-disabled") === "true") return;
    const { min, max } = datepickerBounds(root);
    const weekStart = datepickerWeekStart(root.getAttribute("data-dt-locale") || "en-US");
    let next = null;
    if (e.key === "ArrowLeft") next = datepickerAddDays(st.focus, -1);
    else if (e.key === "ArrowRight") next = datepickerAddDays(st.focus, 1);
    else if (e.key === "ArrowUp") next = datepickerAddDays(st.focus, -7);
    else if (e.key === "ArrowDown") next = datepickerAddDays(st.focus, 7);
    else if (e.key === "Home") next = datepickerAddDays(st.focus, -((st.focus.getDay() - weekStart + 7) % 7));
    else if (e.key === "End") next = datepickerAddDays(st.focus, 6 - ((st.focus.getDay() - weekStart + 7) % 7));
    else if (e.key === "PageUp") next = e.shiftKey ? datepickerAddYears(st.focus, 1) : datepickerAddMonths(st.focus, 1);
    else if (e.key === "PageDown") next = e.shiftKey ? datepickerAddYears(st.focus, -1) : datepickerAddMonths(st.focus, -1);
    if (!next) return;
    e.preventDefault();
    st.focus = datepickerClamp(next, min, max);
    if (st.focus.getMonth() !== st.view.getMonth() || st.focus.getFullYear() !== st.view.getFullYear()) {
      st.view = new Date(st.focus.getFullYear(), st.focus.getMonth(), 1);
    }
    datepickerRender(root);
    datepickerFocused(root)?.focus();
  });

  on("[data-dt-datepicker-input]", "keydown", (input, e) => {
    if (input.disabled) return;
    if (e.key === "Enter") {
      e.preventDefault();
      const root = input.closest("[data-dt-datepicker]");
      if (root) datepickerApplyInput(root);
    }
  });

  on("[data-dt-datepicker-input]", "blur", (input) => {
    const root = input.closest("[data-dt-datepicker]");
    if (root) datepickerApplyInput(root);
  });

  on("[data-dt-datepicker-time-field]", "input", (field) => {
    const digits = field.value.replace(/[^0-9]/g, "");
    if (digits !== field.value) field.value = digits;
  });

  on("[data-dt-datepicker-time-field]", "change", (field) => {
    const root = field.closest("[data-dt-datepicker]");
    if (!root) return;
    const max = field.getAttribute("data-dt-datepicker-time-field") === "hours" ? 23 : 59;
    field.value = datepickerPad(numericClamp(Number(field.value) || 0, 0, max));
  });

  on("[data-dt-datepicker-time-field]", "keydown", (field, e) => {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    e.preventDefault();
    const root = field.closest("[data-dt-datepicker]");
    if (!root) return;
    const max = field.getAttribute("data-dt-datepicker-time-field") === "hours" ? 23 : 59;
    const v = (Number(field.value) || 0) + (e.key === "ArrowUp" ? 1 : -1);
    field.value = datepickerPad(numericClamp(v, 0, max));
  });

  on("[data-dt-datepicker-time-step]", "click", (btn) => {
    if (btn.disabled) return;
    const root = btn.closest("[data-dt-datepicker]");
    if (!root) return;
    const field = root.querySelector(
      `[data-dt-datepicker-time-field="${btn.getAttribute("data-dt-datepicker-time-step-field")}"]`,
    );
    if (!field) return;
    const max = field.getAttribute("data-dt-datepicker-time-field") === "hours" ? 23 : 59;
    const v = (Number(field.value) || 0) + Number(btn.getAttribute("data-dt-datepicker-time-step-dir"));
    field.value = datepickerPad(numericClamp(v, 0, max));
  });

  on("[data-dt-datepicker]", "keydown", (root, e) => {
    const st = datepickerData(root);
    if (!st.open) return;
    if (e.key === "Escape" || e.key === "Tab") {
      if (e.key === "Escape") e.preventDefault();
      datepickerSetOpen(root, false);
      st.input?.focus();
    }
  });

  document.querySelectorAll("[data-dt-datepicker]").forEach(initDatepicker);

  /* ---------------- Timespanpicker ---------------- */

  // [data-dt-timespanpicker] is a duration popup with numeric unit
  // steppers (data-dt-unit="days|hours|minutes|seconds", per-unit maxima,
  // data-dt-min/data-dt-max as ISO 8601 durations). The value is staged
  // in the unit fields and committed on OK; closing without confirming
  // (outside click / Escape / Tab) reverts the staged edits. Enter in the
  // input toggles the popup; ArrowUp/Down and Home/End step the focused
  // unit field. Commits fire dt:change (detail.value = ISO duration, e.g.
  // "P1DT2H30M"); failed typing fires dt:invalid. data-dt-format is
  // "d.HH:mm:ss" (days) or "HH:mm:ss"; data-dt-precision rounds the
  // committed value; data-dt-show-days/-hours/-minutes/-seconds pick the
  // visible units; data-dt-inline renders the panel always visible. Init
  // is lazy and idempotent; window.dtUikit.timespanpicker.init(root)
  // forces it.

  function timespanData(root) {
    if (!root._dtTimespanpicker) {
      root._dtTimespanpicker = {
        input: root.querySelector("[data-dt-timespanpicker-input]"),
        trigger: root.querySelector("[data-dt-timespanpicker-trigger]"),
        clear: root.querySelector("[data-dt-timespanpicker-clear]"),
        popup: root.querySelector("[data-dt-timespanpicker-popup]"),
        ok: root.querySelector("[data-dt-timespanpicker-ok]"),
        open: false,
        committed: 0,
        staged: 0,
        ready: false,
      };
    }
    return root._dtTimespanpicker;
  }

  const TIMESPAN_SECONDS = { days: 86400, hours: 3600, minutes: 60, seconds: 1 };
  const TIMESPAN_MAX = { days: 9999, hours: 23, minutes: 59, seconds: 59 };

  function timespanParseISO(text) {
    const m = String(text).match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/i);
    if (!m) return null;
    const d = Number(m[1]) || 0, h = Number(m[2]) || 0, mi = Number(m[3]) || 0, s = Number(m[4]) || 0;
    return ((d * 24 + h) * 60 + mi) * 60 + s;
  }

  function timespanToISO(total) {
    let rest = Math.max(0, Math.floor(total));
    const d = Math.floor(rest / 86400);
    rest %= 86400;
    const h = Math.floor(rest / 3600);
    rest %= 3600;
    const m = Math.floor(rest / 60);
    const s = rest % 60;
    const parts = [];
    if (d > 0) parts.push(`${d}D`);
    if (h > 0 || m > 0 || s > 0) {
      const t = [];
      if (h > 0) t.push(`${h}H`);
      if (m > 0) t.push(`${m}M`);
      if (s > 0) t.push(`${s}S`);
      parts.push(`T${t.join("")}`);
    }
    return parts.length > 0 ? `P${parts.join("")}` : "PT0S";
  }

  function timespanFormat(total, format) {
    const t = Math.max(0, Math.floor(total));
    const fmt = String(format || "HH:mm:ss");
    const hasDays = fmt.includes("d");
    const d = Math.floor(t / 86400);
    const h = hasDays ? Math.floor((t % 86400) / 3600) : Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = t % 60;
    const p = (n) => String(n).padStart(2, "0");
    return fmt.replace("d", String(d)).replace("HH", p(h)).replace("mm", p(m)).replace("ss", p(s));
  }

  function timespanParse(text, hasDays) {
    const str = String(text).trim();
    if (hasDays) {
      const m = str.match(/^(\d+)\.(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/);
      if (m) {
        const h = Number(m[2]), mi = Number(m[3]), s = Number(m[4]) || 0;
        if (h > 23 || mi > 59 || s > 59) return null;
        return ((Number(m[1]) * 24 + h) * 60 + mi) * 60 + s;
      }
    }
    const m = str.match(/^(\d+):(\d{1,2})(?::(\d{1,2}))?$/);
    if (!m) return null;
    const mi = Number(m[2]), s = Number(m[3]) || 0;
    if (mi > 59 || s > 59) return null;
    return (Number(m[1]) * 60 + mi) * 60 + s;
  }

  function timespanUnits(root) {
    return [...root.querySelectorAll("[data-dt-timespanpicker-value]")].map((input) =>
      input.getAttribute("data-dt-unit"),
    );
  }

  function timespanUnitInput(root, unit) {
    return root.querySelector(`[data-dt-timespanpicker-value][data-dt-unit="${unit}"]`);
  }

  function timespanReadStaged(root) {
    let total = 0;
    timespanUnits(root).forEach((unit) => {
      const input = timespanUnitInput(root, unit);
      total += (Number(input?.value) || 0) * TIMESPAN_SECONDS[unit];
    });
    return total;
  }

  function timespanSync(root, total) {
    const t = Math.max(0, Math.floor(total));
    const units = timespanUnits(root);
    const hasDays = units.includes("days");
    const d = Math.floor(t / 86400);
    const h = Math.floor(t / 3600);
    const mi = Math.floor((t % 3600) / 60);
    const s = t % 60;
    units.forEach((unit) => {
      const input = timespanUnitInput(root, unit);
      if (!input) return;
      const value = unit === "days" ? d
        : unit === "hours" ? (hasDays ? Math.floor((t % 86400) / 3600) : h)
        : unit === "minutes" ? mi
        : s;
      input.value = String(value);
    });
  }

  function timespanUnitBounds(root, unit) {
    const { max } = timespanBounds(root);
    const hasDays = timespanUnits(root).includes("days");
    let hi = TIMESPAN_MAX[unit];
    if (unit === "hours" && !hasDays) hi = 99999;
    if (unit === "days") hi = 9999;
    if (max !== null) {
      hi = Math.min(hi, Math.floor(max / TIMESPAN_SECONDS[unit]));
    }
    return { lo: 0, hi };
  }

  function timespanBounds(root) {
    return {
      min: timespanParseISO(root.getAttribute("data-dt-min")),
      max: timespanParseISO(root.getAttribute("data-dt-max")),
    };
  }

  function timespanRound(total, precision) {
    const units = { day: 86400, hour: 3600, minute: 60, second: 1 };
    const per = units[precision] ?? 1;
    return Math.round(total / per) * per;
  }

  function timespanSetOpen(root, open) {
    const st = timespanData(root);
    if (!st.ready) initTimespanpicker(root);
    const inline = root.hasAttribute("data-dt-inline");
    if (st.open === open) return;
    if (st.trigger) {
      st.trigger.setAttribute("aria-expanded", String(open));
      root.classList.toggle("dt-timespanpicker--open", open);
    }
    if (st.popup && !inline) st.popup.hidden = !open;
    if (open) {
      st.staged = st.committed;
      timespanSync(root, st.staged);
      timespanUnitInput(root, timespanUnits(root)[0])?.focus();
    }
    st.open = open;
  }

  function timespanCommit(root) {
    const st = timespanData(root);
    if (!st.ready) initTimespanpicker(root);
    const precision = root.getAttribute("data-dt-precision") || "second";
    let total = timespanRound(timespanReadStaged(root), precision);
    const { min, max } = timespanBounds(root);
    if (min !== null) total = Math.max(total, min);
    if (max !== null) total = Math.min(total, max);
    st.committed = total;
    if (st.input) {
      st.input.value = timespanFormat(total, root.getAttribute("data-dt-format"));
      st.input.classList.remove("dt-timespanpicker-input--invalid");
      st.input.removeAttribute("aria-invalid");
    }
    if (st.clear) st.clear.hidden = false;
    timespanSync(root, total);
    timespanSetOpen(root, false);
    root.dispatchEvent(new CustomEvent("dt:change", { bubbles: true, detail: { value: timespanToISO(total) } }));
    st.input?.focus();
  }

  function timespanRevert(root) {
    const st = timespanData(root);
    if (!st.ready) initTimespanpicker(root);
    st.staged = st.committed;
    timespanSync(root, st.staged);
  }

  function timespanApplyInput(root) {
    const st = timespanData(root);
    if (!st.input) return;
    if (!st.ready) initTimespanpicker(root);
    const hasDays = String(root.getAttribute("data-dt-format") || "HH:mm:ss").includes("d");
    const parsed = timespanParse(st.input.value, hasDays);
    if (parsed === null) {
      st.input.classList.add("dt-timespanpicker-input--invalid");
      st.input.setAttribute("aria-invalid", "true");
      root.dispatchEvent(new CustomEvent("dt:invalid", { bubbles: true, detail: { value: st.input.value } }));
      return;
    }
    st.committed = parsed;
    st.staged = parsed;
    st.input.classList.remove("dt-timespanpicker-input--invalid");
    st.input.removeAttribute("aria-invalid");
    root.dispatchEvent(new CustomEvent("dt:change", { bubbles: true, detail: { value: timespanToISO(parsed) } }));
  }

  function timespanClear(root) {
    const st = timespanData(root);
    if (!st.ready) initTimespanpicker(root);
    st.committed = 0;
    st.staged = 0;
    if (st.input) {
      st.input.value = "";
      st.input.classList.remove("dt-timespanpicker-input--invalid");
      st.input.removeAttribute("aria-invalid");
    }
    if (st.clear) st.clear.hidden = true;
    if (st.trigger) st.trigger.setAttribute("aria-expanded", "false");
    root.classList.remove("dt-timespanpicker--open");
    if (st.popup && !root.hasAttribute("data-dt-inline")) st.popup.hidden = true;
    st.open = false;
    root.dispatchEvent(new CustomEvent("dt:change", { bubbles: true, detail: { value: null } }));
    st.input?.focus();
  }

  function timespanStepUnit(root, unit, delta) {
    const st = timespanData(root);
    if (!st.ready) initTimespanpicker(root);
    const input = timespanUnitInput(root, unit);
    if (!input) return;
    const { lo, hi } = timespanUnitBounds(root, unit);
    const next = numericClamp((Number(input.value) || 0) + delta, lo, hi);
    input.value = String(next);
    if (root.hasAttribute("data-dt-inline")) {
      st.committed = timespanReadStaged(root);
      if (st.input) st.input.value = timespanFormat(st.committed, root.getAttribute("data-dt-format"));
      root.dispatchEvent(new CustomEvent("dt:change", { bubbles: true, detail: { value: timespanToISO(st.committed) } }));
    }
  }

  function initTimespanpicker(root) {
    const st = timespanData(root);
    if (st.ready) return;
    st.ready = true;
    const hasDays = String(root.getAttribute("data-dt-format") || "HH:mm:ss").includes("d");
    let initial = st.input?.value ? timespanParse(st.input.value, hasDays) : null;
    if (initial === null && root.hasAttribute("data-dt-value")) {
      initial = timespanParseISO(root.getAttribute("data-dt-value"));
    }
    st.committed = initial ?? 0;
    st.staged = st.committed;
    if (st.clear) st.clear.hidden = !initial && !(st.input && st.input.value);
    if (root.hasAttribute("data-dt-inline")) {
      if (st.popup) st.popup.hidden = false;
      if (st.ok) st.ok.hidden = true;
      timespanSync(root, st.committed);
    }
  }

  on("[data-dt-timespanpicker-trigger]", "click", (trigger) => {
    if (trigger.disabled) return;
    const root = trigger.closest("[data-dt-timespanpicker]");
    if (!root) return;
    initTimespanpicker(root);
    timespanSetOpen(root, !timespanData(root).open);
  });

  on("[data-dt-timespanpicker-clear]", "click", (clear) => {
    if (clear.disabled) return;
    const root = clear.closest("[data-dt-timespanpicker]");
    if (root) timespanClear(root);
  });

  on("[data-dt-timespanpicker-ok]", "click", (btn) => {
    const root = btn.closest("[data-dt-timespanpicker]");
    if (root) timespanCommit(root);
  });

  on("[data-dt-timespanpicker-step]", "click", (btn) => {
    if (btn.disabled) return;
    const root = btn.closest("[data-dt-timespanpicker]");
    if (!root) return;
    const unit = btn.getAttribute("data-dt-timespanpicker-step-unit");
    const dir = Number(btn.getAttribute("data-dt-timespanpicker-step-dir")) || 0;
    timespanStepUnit(root, unit, dir);
  });

  on("[data-dt-timespanpicker-value]", "input", (input) => {
    const digits = input.value.replace(/[^0-9]/g, "");
    if (digits !== input.value) input.value = digits;
    const root = input.closest("[data-dt-timespanpicker]");
    if (root && root.hasAttribute("data-dt-inline")) {
      const unit = input.getAttribute("data-dt-unit");
      timespanStepUnit(root, unit, 0);
    }
  });

  on("[data-dt-timespanpicker-value]", "change", (input) => {
    const root = input.closest("[data-dt-timespanpicker]");
    if (!root) return;
    const unit = input.getAttribute("data-dt-unit");
    const { lo, hi } = timespanUnitBounds(root, unit);
    input.value = String(numericClamp(Number(input.value) || 0, lo, hi));
  });

  on("[data-dt-timespanpicker-value]", "keydown", (input, e) => {
    const root = input.closest("[data-dt-timespanpicker]");
    if (!root) return;
    const unit = input.getAttribute("data-dt-unit");
    const { lo, hi } = timespanUnitBounds(root, unit);
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const v = (Number(input.value) || 0) + (e.key === "ArrowUp" ? 1 : -1);
      input.value = String(numericClamp(v, lo, hi));
      if (root.hasAttribute("data-dt-inline")) timespanStepUnit(root, unit, 0);
    } else if (e.key === "Home") {
      e.preventDefault();
      input.value = String(lo);
    } else if (e.key === "End") {
      e.preventDefault();
      input.value = String(hi);
    }
  });

  on("[data-dt-timespanpicker-input]", "keydown", (input, e) => {
    if (input.disabled) return;
    if (e.key === "Enter") {
      e.preventDefault();
      const root = input.closest("[data-dt-timespanpicker]");
      if (root) {
        timespanApplyInput(root);
        timespanSetOpen(root, !timespanData(root).open);
      }
    }
  });

  on("[data-dt-timespanpicker-input]", "blur", (input) => {
    const root = input.closest("[data-dt-timespanpicker]");
    if (root) timespanApplyInput(root);
  });

  on("[data-dt-timespanpicker]", "keydown", (root, e) => {
    const st = timespanData(root);
    if (!st.open) return;
    if (e.key === "Escape" || e.key === "Tab") {
      if (e.key === "Escape") e.preventDefault();
      timespanRevert(root);
      timespanSetOpen(root, false);
      st.input?.focus();
    }
  });

  document.querySelectorAll("[data-dt-timespanpicker]").forEach(initTimespanpicker);

  /* ---------------- Colorpicker ---------------- */

  // [data-dt-colorpicker] is an HSV popup picker. The behavior renders
  // the palette swatches from data-dt-palette (JSON hex array; default
  // the Radzen 22-swatch grid), drives the saturation/hue/alpha sliders
  // with pointer + keyboard, keeps hex/R/G/B/A inputs in sync and
  // normalizes the committed color to "rgb(r, g, b)" / "rgba(r, g, b, a)".
  // With data-dt-show-button edits are staged and committed on OK (outside
  // click / Escape revert); otherwise every change commits immediately.
  // Commits fire dt:change (detail.value = the CSS color string). Init is
  // lazy and idempotent; window.dtUikit.colorpicker.init(root) forces it.

  function colorpickerData(root) {
    if (!root._dtColorpicker) {
      root._dtColorpicker = {
        trigger: root.querySelector("[data-dt-colorpicker-trigger]"),
        value: root.querySelector("[data-dt-colorpicker-value]"),
        popup: root.querySelector("[data-dt-colorpicker-popup]"),
        saturation: root.querySelector("[data-dt-colorpicker-saturation]"),
        hue: root.querySelector("[data-dt-colorpicker-hue]"),
        alpha: root.querySelector("[data-dt-colorpicker-alpha]"),
        rgba: root.querySelector("[data-dt-colorpicker-rgba]"),
        palette: root.querySelector("[data-dt-colorpicker-palette]"),
        ok: root.querySelector("[data-dt-colorpicker-ok]"),
        open: false,
        h: 0, s: 0, v: 1, a: 1,
        staged: null,
        baseline: null,
        ready: false,
      };
    }
    return root._dtColorpicker;
  }

  const COLORPICKER_DEFAULT_PALETTE = [
    "#ff2800", "#fe9300", "#fefb00", "#02f900", "#00fdff", "#0433ff",
    "#ff40ff", "#942292", "#aa7942", "#ffffff", "#000000", "#53d5fd",
    "#73a7fe", "#874efe", "#d357fe", "#ed719e", "#ff8c82", "#ffa57d",
    "#ffc677", "#fff995", "#ebf38f", "#b1dd8c",
  ];

  function colorpickerPad(n) {
    return String(n).padStart(2, "0");
  }

  function colorpickerHsvToRgb(h, s, v) {
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;
    let r = 0, g = 0, b = 0;
    if (h < 60) [r, g, b] = [c, x, 0];
    else if (h < 120) [r, g, b] = [x, c, 0];
    else if (h < 180) [r, g, b] = [0, c, x];
    else if (h < 240) [r, g, b] = [0, x, c];
    else if (h < 300) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];
    return [
      Math.round((r + m) * 255),
      Math.round((g + m) * 255),
      Math.round((b + m) * 255),
    ];
  }

  function colorpickerRgbToHsv(r, g, b) {
    const rr = r / 255, gg = g / 255, bb = b / 255;
    const max = Math.max(rr, gg, bb), min = Math.min(rr, gg, bb);
    const delta = max - min;
    let h = 0;
    if (delta !== 0) {
      if (max === rr) h = ((gg - bb) / delta) % 6;
      else if (max === gg) h = (bb - rr) / delta + 2;
      else h = (rr - gg) / delta + 4;
      h *= 60;
      if (h < 0) h += 360;
    }
    return [h, max === 0 ? 0 : delta / max, max];
  }

  function colorpickerHexToRgb(hex) {
    const m = String(hex).trim().match(/^#?([0-9a-f]{6})$/i);
    if (!m) return null;
    const n = parseInt(m[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function colorpickerRgbToHex(r, g, b) {
    return "#" + [r, g, b].map((v) => colorpickerPad(Math.round(numericClamp(v, 0, 255)))).join("");
  }

  function colorpickerParseColor(text) {
    const str = String(text).trim();
    const hex = str.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (hex) {
      let h = hex[1];
      if (h.length === 3) h = [...h].map((c) => c + c).join("");
      const n = parseInt(h, 16);
      return { h: 0, s: 0, v: 1, a: 1, rgb: [(n >> 16) & 255, (n >> 8) & 255, n & 255] };
    }
    const rgba = str.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)$/i);
    if (rgba) {
      const [r, g, b] = [Number(rgba[1]), Number(rgba[2]), Number(rgba[3])];
      const a = rgba[4] === undefined ? 1 : Number(rgba[4]);
      return { h: 0, s: 0, v: 1, a, rgb: [r, g, b] };
    }
    return null;
  }

  function colorpickerRgbString(st) {
    const [r, g, b] = colorpickerHsvToRgb(st.h, st.s, st.v);
    if (st.a >= 1) return `rgb(${r}, ${g}, ${b})`;
    const a = Math.round(st.a * 100) / 100;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  function colorpickerRender(root) {
    const st = colorpickerData(root);
    if (!st.ready) {
      initColorpicker(root);
      return;
    }
    const [r, g, b] = colorpickerHsvToRgb(st.h, st.s, st.v);
    const rgb = `rgb(${r}, ${g}, ${b})`;
    if (st.saturation) {
      st.saturation.style.background =
        `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent), hsl(${Math.round(st.h)}, 100%, 50%)`;
      st.saturation.setAttribute("aria-valuenow", String(Math.round(st.s * 100)));
      st.saturation.setAttribute("aria-valuetext", `Saturation ${Math.round(st.s * 100)}%, value ${Math.round(st.v * 100)}%`);
      const indicator = st.saturation.querySelector(".dt-saturation-indicator");
      if (indicator) {
        indicator.style.left = `${st.s * 100}%`;
        indicator.style.top = `${(1 - st.v) * 100}%`;
      }
    }
    if (st.hue) {
      st.hue.setAttribute("aria-valuenow", String(Math.round(st.h)));
      const indicator = st.hue.querySelector(".dt-hue-indicator");
      if (indicator) indicator.style.left = `${(st.h / 360) * 100}%`;
    }
    if (st.alpha) {
      st.alpha.setAttribute("aria-valuenow", String(Math.round(st.a * 100)));
      st.alpha.style.setProperty("--dt-color-primary", rgb);
      const indicator = st.alpha.querySelector(".dt-alpha-indicator");
      if (indicator) indicator.style.left = `${st.a * 100}%`;
    }
    if (st.rgba) {
      st.rgba.querySelectorAll("[data-dt-colorpicker-rgba-input]").forEach((input) => {
        const channel = input.getAttribute("data-dt-colorpicker-rgba-channel");
        if (channel === "hex") input.value = colorpickerRgbToHex(r, g, b);
        else if (channel === "a") input.value = String(Math.round(st.a * 100));
        else input.value = String(channel === "r" ? r : channel === "g" ? g : b);
      });
    }
    if (st.value) st.value.style.backgroundColor = st.a >= 1 ? rgb : colorpickerRgbString(st);
  }

  function colorpickerSet(root, h, s, v, a) {
    const st = colorpickerData(root);
    if (!st.ready) initColorpicker(root);
    st.h = ((h % 360) + 360) % 360;
    st.s = numericClamp(s, 0, 1);
    st.v = numericClamp(v, 0, 1);
    st.a = numericClamp(a, 0, 1);
    colorpickerRender(root);
    if (root.hasAttribute("data-dt-show-button")) colorpickerStage(root);
    else colorpickerCommit(root);
  }

  function colorpickerStage(root) {
    const st = colorpickerData(root);
    if (!st.staged) st.staged = { h: st.h, s: st.s, v: st.v, a: st.a };
    st.staged.h = st.h;
    st.staged.s = st.s;
    st.staged.v = st.v;
    st.staged.a = st.a;
  }

  function colorpickerCommit(root) {
    const st = colorpickerData(root);
    if (!st.ready) initColorpicker(root);
    if (root.hasAttribute("data-dt-show-button")) {
      if (!st.staged) return;
      st.h = st.staged.h;
      st.s = st.staged.s;
      st.v = st.staged.v;
      st.a = st.staged.a;
      colorpickerRender(root);
    }
    st.baseline = { h: st.h, s: st.s, v: st.v, a: st.a };
    const value = colorpickerRgbString(st);
    if (st.value) st.value.style.backgroundColor = value;
    if (st.trigger) st.trigger.setAttribute("aria-label", `Pick a color (${value})`);
    if (root.hasAttribute("data-dt-show-button")) {
      colorpickerSetOpen(root, false);
      st.trigger?.focus();
    }
    root.dispatchEvent(new CustomEvent("dt:change", { bubbles: true, detail: { value } }));
  }

  function colorpickerRevert(root) {
    const st = colorpickerData(root);
    if (!st.ready) initColorpicker(root);
    const base = st.baseline ?? st.staged;
    if (!base) return;
    st.h = base.h;
    st.s = base.s;
    st.v = base.v;
    st.a = base.a;
    colorpickerRender(root);
  }

  function colorpickerSetOpen(root, open) {
    const st = colorpickerData(root);
    if (!st.ready) initColorpicker(root);
    const inline = root.hasAttribute("data-dt-inline");
    if (st.open === open) return;
    if (st.trigger) {
      st.trigger.setAttribute("aria-expanded", String(open));
      root.classList.toggle("dt-colorpicker--open", open);
    }
    if (st.popup && !inline) st.popup.hidden = !open;
    if (open) {
      st.baseline = { h: st.h, s: st.s, v: st.v, a: st.a };
      colorpickerStage(root);
      colorpickerRender(root);
      st.saturation?.focus();
    }
    st.open = open;
  }

  function colorpickerPointer(el, e) {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return {
      x: numericClamp(rect.width > 0 ? x / rect.width : 0, 0, 1),
      y: numericClamp(rect.height > 0 ? y / rect.height : 0, 0, 1),
    };
  }

  function colorpickerRenderPalette(root) {
    const st = colorpickerData(root);
    if (!st.palette) return;
    let colors = COLORPICKER_DEFAULT_PALETTE;
    const raw = root.getAttribute("data-dt-palette");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) colors = parsed;
      } catch {
        /* invalid palette — fall back to the default grid */
      }
    }
    st.palette.replaceChildren(
      ...colors.map((hex) => {
        const swatch = document.createElement("button");
        swatch.type = "button";
        swatch.role = "button";
        swatch.className = "dt-colorpicker-swatch";
        swatch.setAttribute("data-dt-colorpicker-swatch", "");
        swatch.setAttribute("data-dt-colorpicker-swatch-value", String(hex).toLowerCase());
        swatch.setAttribute("aria-label", String(hex).toLowerCase());
        swatch.tabIndex = 0;
        swatch.style.backgroundColor = hex;
        return swatch;
      }),
    );
  }

  function initColorpicker(root) {
    const st = colorpickerData(root);
    if (st.ready) return;
    st.ready = true;
    const parsed = colorpickerParseColor(root.getAttribute("data-dt-value") || "#2563eb");
    if (!parsed) return;
    const [h, s, v] = colorpickerRgbToHsv(...parsed.rgb);
    st.h = h;
    st.s = s;
    st.v = v;
    st.a = parsed.a;
    colorpickerRenderPalette(root);
    colorpickerRender(root);
    if (root.hasAttribute("data-dt-inline")) {
      if (st.popup) st.popup.hidden = false;
      if (st.ok) st.ok.hidden = true;
    }
  }

  on("[data-dt-colorpicker-trigger]", "click", (trigger) => {
    if (trigger.disabled) return;
    const root = trigger.closest("[data-dt-colorpicker]");
    if (!root) return;
    initColorpicker(root);
    colorpickerSetOpen(root, !colorpickerData(root).open);
  });

  on("[data-dt-colorpicker]", "keydown", (root, e) => {
    const st = colorpickerData(root);
    if (e.key === "Enter" || e.key === " ") {
      const swatch = e.target.closest("[data-dt-colorpicker-swatch]");
      if (swatch) {
        e.preventDefault();
        const rgb = colorpickerHexToRgb(swatch.getAttribute("data-dt-colorpicker-swatch-value"));
        if (rgb) {
          const [h, s, v] = colorpickerRgbToHsv(...rgb);
          colorpickerSet(root, h, s, v, st.a);
        }
        return;
      }
    }
    if (!st.open) return;
    if (e.key === "Escape") {
      e.preventDefault();
      colorpickerRevert(root);
      colorpickerSetOpen(root, false);
      st.trigger?.focus();
    } else if (e.key === "Tab") {
      colorpickerRevert(root);
      colorpickerSetOpen(root, false);
      st.trigger?.focus();
    }
  });

  on("[data-dt-colorpicker-swatch]", "click", (swatch) => {
    const root = swatch.closest("[data-dt-colorpicker]");
    if (!root) return;
    const st = colorpickerData(root);
    const rgb = colorpickerHexToRgb(swatch.getAttribute("data-dt-colorpicker-swatch-value"));
    if (!rgb) return;
    const [h, s, v] = colorpickerRgbToHsv(...rgb);
    colorpickerSet(root, h, s, v, st.a);
  });

  function colorpickerDragStart(el, e, apply) {
    e.preventDefault();
    el.setPointerCapture?.(e.pointerId);
    const root = el.closest("[data-dt-colorpicker]");
    const move = (ev) => apply(ev);
    const up = (ev) => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.releasePointerCapture?.(ev.pointerId);
    };
    move(e);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  }

  on("[data-dt-colorpicker-saturation]", "pointerdown", (el, e) => {
    colorpickerDragStart(el, e, (ev) => {
      const root = el.closest("[data-dt-colorpicker]");
      const { x, y } = colorpickerPointer(el, ev);
      const st = colorpickerData(root);
      colorpickerSet(root, st.h, x, y, st.a);
    });
  });

  on("[data-dt-colorpicker-hue]", "pointerdown", (el, e) => {
    colorpickerDragStart(el, e, (ev) => {
      const root = el.closest("[data-dt-colorpicker]");
      const { x } = colorpickerPointer(el, ev);
      const st = colorpickerData(root);
      colorpickerSet(root, x * 360, st.s, st.v, st.a);
    });
  });

  on("[data-dt-colorpicker-alpha]", "pointerdown", (el, e) => {
    colorpickerDragStart(el, e, (ev) => {
      const root = el.closest("[data-dt-colorpicker]");
      const { x } = colorpickerPointer(el, ev);
      const st = colorpickerData(root);
      colorpickerSet(root, st.h, st.s, st.v, x);
    });
  });

  on("[data-dt-colorpicker-saturation]", "keydown", (el, e) => {
    const root = el.closest("[data-dt-colorpicker]");
    if (!root) return;
    const st = colorpickerData(root);
    let next = null;
    const delta = e.shiftKey ? 0.1 : 0.05;
    if (e.key === "ArrowRight") next = [st.s + delta, st.v];
    else if (e.key === "ArrowLeft") next = [st.s - delta, st.v];
    else if (e.key === "ArrowUp") next = [st.s, st.v + delta];
    else if (e.key === "ArrowDown") next = [st.s, st.v - delta];
    if (!next) return;
    e.preventDefault();
    colorpickerSet(root, st.h, next[0], next[1], st.a);
  });

  on("[data-dt-colorpicker-hue]", "keydown", (el, e) => {
    const root = el.closest("[data-dt-colorpicker]");
    if (!root) return;
    const st = colorpickerData(root);
    const delta = e.shiftKey ? 10 : 1;
    let next = null;
    if (e.key === "ArrowUp" || e.key === "ArrowRight") next = st.h + delta;
    else if (e.key === "ArrowDown" || e.key === "ArrowLeft") next = st.h - delta;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = 360;
    if (next === null) return;
    e.preventDefault();
    colorpickerSet(root, next, st.s, st.v, st.a);
  });

  on("[data-dt-colorpicker-alpha]", "keydown", (el, e) => {
    const root = el.closest("[data-dt-colorpicker]");
    if (!root) return;
    const st = colorpickerData(root);
    const delta = e.shiftKey ? 0.1 : 0.05;
    let next = null;
    if (e.key === "ArrowUp" || e.key === "ArrowRight") next = st.a + delta;
    else if (e.key === "ArrowDown" || e.key === "ArrowLeft") next = st.a - delta;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = 1;
    if (next === null) return;
    e.preventDefault();
    colorpickerSet(root, st.h, st.s, st.v, next);
  });

  on("[data-dt-colorpicker-rgba-input]", "change", (input) => {
    const root = input.closest("[data-dt-colorpicker]");
    if (!root) return;
    const st = colorpickerData(root);
    const channel = input.getAttribute("data-dt-colorpicker-rgba-channel");
    if (channel === "hex") {
      const rgb = colorpickerHexToRgb(input.value);
      if (rgb) {
        const [h, s, v] = colorpickerRgbToHsv(...rgb);
        colorpickerSet(root, h, s, v, st.a);
      } else {
        colorpickerRender(root);
      }
      return;
    }
    const value = Number(input.value);
    if (Number.isNaN(value)) {
      colorpickerRender(root);
      return;
    }
    const [r, g, b] = colorpickerHsvToRgb(st.h, st.s, st.v);
    if (channel === "a") {
      colorpickerSet(root, st.h, st.s, st.v, numericClamp(value / 100, 0, 1));
    } else {
      const next = channel === "r" ? [numericClamp(value, 0, 255), g, b]
        : channel === "g" ? [r, numericClamp(value, 0, 255), b]
        : [r, g, numericClamp(value, 0, 255)];
      const [h, s, v] = colorpickerRgbToHsv(...next);
      colorpickerSet(root, h, s, v, st.a);
    }
  });

  on("[data-dt-colorpicker-ok]", "click", (btn) => {
    const root = btn.closest("[data-dt-colorpicker]");
    if (root) colorpickerCommit(root);
  });

  document.querySelectorAll("[data-dt-colorpicker]").forEach(initColorpicker);

  /* ---------------- Slider ---------------- */

  // [data-dt-slider] is a range slider without an input box: one handle,
  // or two (data-dt-range) where the track between the handles is filled.
  // data-dt-min/data-dt-max/data-dt-step define the scale,
  // data-dt-orientation="horizontal|vertical" flips the axis and
  // data-dt-value / data-dt-value-min / data-dt-value-max seed the
  // handles. The behavior drives pointer drags (setPointerCapture) and
  // the keyboard (Arrows ±step, Home/End, roving tabindex) and dispatches
  // dt:change with detail.value = number (or {min, max} in range mode).
  // Init is lazy and idempotent; window.dtUikit.slider.init(root) forces
  // it.

  function sliderData(root) {
    if (!root._dtSlider) {
      root._dtSlider = {
        track: root.querySelector("[data-dt-slider-track]"),
        range: root.querySelector("[data-dt-slider-range]"),
        handles: [...root.querySelectorAll("[data-dt-slider-handle]")],
        min: Number(root.getAttribute("data-dt-min")) || 0,
        max: Number(root.getAttribute("data-dt-max")) || 100,
        step: Number(root.getAttribute("data-dt-step")) || 1,
        vertical: root.getAttribute("data-dt-orientation") === "vertical" || root.classList.contains("dt-slider--vertical"),
        rangeMode: root.hasAttribute("data-dt-range") || root.querySelectorAll("[data-dt-slider-handle]").length > 1,
        values: [],
        dragging: -1,
        ready: false,
      };
    }
    return root._dtSlider;
  }

  function sliderSnap(value, min, max, step) {
    if (step <= 0) return numericClamp(value, min, max);
    const snapped = min + Math.round((value - min) / step) * step;
    return numericClamp(snapped, min, max);
  }

  function sliderPercent(value, min, max) {
    if (max <= min) return 0;
    return ((value - min) / (max - min)) * 100;
  }

  function sliderRender(root) {
    const st = sliderData(root);
    if (!st.ready) return;
    const vertical = st.vertical;
    const positions = st.values.map((v) => sliderPercent(v, st.min, st.max));
    st.handles.forEach((handle, i) => {
      const pct = positions[i];
      if (vertical) {
        handle.style.bottom = `calc(${pct}% - 8px)`;
      } else {
        handle.style.left = `calc(${pct}% - 8px)`;
      }
      handle.setAttribute("aria-valuenow", String(st.values[i]));
      handle.setAttribute("aria-valuemin", String(st.min));
      handle.setAttribute("aria-valuemax", String(st.max));
      handle.setAttribute("aria-orientation", vertical ? "vertical" : "horizontal");
      handle.tabIndex = st.dragging === i || handle === document.activeElement ? 0 : -1;
    });
    if (st.rangeMode) {
      const lo = positions[0], hi = positions[1];
      if (st.range) {
        if (vertical) {
          st.range.style.bottom = `calc(${lo}%)`;
          st.range.style.height = `calc(${hi - lo}%)`;
        } else {
          st.range.style.left = `calc(${lo}%)`;
          st.range.style.width = `calc(${hi - lo}%)`;
        }
      }
    } else if (st.range) {
      const pct = positions[0];
      if (vertical) {
        st.range.style.bottom = "0";
        st.range.style.height = `calc(${pct}%)`;
      } else {
        st.range.style.left = "0";
        st.range.style.width = `calc(${pct}%)`;
      }
    }
  }

  function sliderSetValue(root, index, value, commit = true) {
    const st = sliderData(root);
    if (!st.ready) return;
    let next = sliderSnap(value, st.min, st.max, st.step);
    if (st.rangeMode) {
      const other = 1 - index;
      if (index === 0) next = Math.min(next, st.values[other]);
      else next = Math.max(next, st.values[other]);
    }
    if (next === st.values[index]) return;
    st.values[index] = next;
    sliderRender(root);
    if (commit) {
      root.dispatchEvent(
        new CustomEvent("dt:change", {
          bubbles: true,
          detail: { value: st.rangeMode ? { min: st.values[0], max: st.values[1] } : st.values[0] },
        }),
      );
    }
  }

  function sliderValueFromEvent(st, e) {
    const rect = st.track.getBoundingClientRect();
    if (st.vertical) {
      return st.max - ((e.clientY - rect.top) / rect.height) * (st.max - st.min);
    }
    return st.min + ((e.clientX - rect.left) / rect.width) * (st.max - st.min);
  }

  function initSlider(root) {
    const st = sliderData(root);
    if (st.ready) return;
    st.ready = true;
    const count = st.rangeMode ? 2 : 1;
    for (let i = 0; i < count; i++) {
      const attr = i === 0 ? (count === 1 ? "data-dt-value" : "data-dt-value-min") : "data-dt-value-max";
      const raw = st.handles[i]?.getAttribute("aria-valuenow") ?? root.getAttribute(attr);
      const v = sliderSnap(raw === null ? (i === 0 ? st.min : st.max) : Number(raw), st.min, st.max, st.step);
      st.values.push(v);
    }
    if (st.rangeMode) {
      const lo = Math.min(st.values[0], st.values[1]);
      const hi = Math.max(st.values[0], st.values[1]);
      st.values[0] = lo;
      st.values[1] = hi;
    }
    sliderRender(root);
  }

  on("[data-dt-slider-handle]", "pointerdown", (handle, e) => {
    const root = handle.closest("[data-dt-slider]");
    if (!root || root.hasAttribute("data-dt-disabled")) return;
    e.preventDefault();
    handle.setPointerCapture?.(e.pointerId);
    const st = sliderData(root);
    initSlider(root);
    st.dragging = st.handles.indexOf(handle);
    st.handles.forEach((h, i) => {
      h.tabIndex = i === st.dragging ? 0 : -1;
    });
    const onMove = (ev) => {
      sliderSetValue(root, st.dragging, sliderValueFromEvent(st, ev), false);
    };
    const onUp = (ev) => {
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", onUp);
      handle.removeEventListener("pointercancel", onUp);
      handle.releasePointerCapture?.(ev.pointerId);
      st.dragging = -1;
      sliderRender(root);
      root.dispatchEvent(
        new CustomEvent("dt:change", {
          bubbles: true,
          detail: { value: st.rangeMode ? { min: st.values[0], max: st.values[1] } : st.values[0] },
        }),
      );
    };
    handle.addEventListener("pointermove", onMove);
    handle.addEventListener("pointerup", onUp);
    handle.addEventListener("pointercancel", onUp);
    sliderSetValue(root, st.dragging, sliderValueFromEvent(st, e), false);
  });

  on("[data-dt-slider-handle]", "keydown", (handle, e) => {
    const root = handle.closest("[data-dt-slider]");
    if (!root || root.hasAttribute("data-dt-disabled")) return;
    const st = sliderData(root);
    initSlider(root);
    const index = st.handles.indexOf(handle);
    if (index < 0) return;
    let delta = 0;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") delta = st.step;
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") delta = -st.step;
    else if (e.key === "Home") {
      e.preventDefault();
      sliderSetValue(root, index, st.min);
      return;
    } else if (e.key === "End") {
      e.preventDefault();
      sliderSetValue(root, index, st.max);
      return;
    }
    if (delta === 0) return;
    e.preventDefault();
    sliderSetValue(root, index, st.values[index] + delta);
  });

  on("[data-dt-slider-handle]", "focusin", (handle) => {
    const root = handle.closest("[data-dt-slider]");
    if (!root) return;
    const st = sliderData(root);
    initSlider(root);
    st.handles.forEach((h) => {
      h.tabIndex = h === handle ? 0 : -1;
    });
  });

  document.querySelectorAll("[data-dt-slider]").forEach(initSlider);

  /* ---------------- Rating ---------------- */

  // [data-dt-rating] is a star rating rendered as a radiogroup of
  // role="radio" buttons with an optional clear button. The behavior
  // syncs aria-checked, the filled/outline icon swap, aria-posinset/
  // aria-setsize and the roving tabindex, sets the value on click or
  // Arrow/Home/End keys and dispatches dt:change (detail.value = integer
  // 0..data-dt-stars). data-dt-readonly and data-dt-disabled disable
  // interaction. Init is lazy and idempotent;
  // window.dtUikit.rating.init(root) forces it.

  function ratingData(root) {
    if (!root._dtRating) {
      root._dtRating = {
        stars: Number(root.getAttribute("data-dt-stars")) || 5,
        value: 0,
        ready: false,
      };
    }
    return root._dtRating;
  }

  function ratingItems(root) {
    return [...root.querySelectorAll("[data-dt-rating-item]")];
  }

  function ratingBuild(root) {
    const st = ratingData(root);
    const existing = ratingItems(root);
    if (existing.length === st.stars) return existing;
    const template = existing[0] ?? null;
    existing.forEach((btn) => btn.remove());
    const items = [];
    for (let i = 0; i < st.stars; i++) {
      const btn = template ? template.cloneNode(true) : document.createElement("button");
      btn.type = "button";
      btn.className = "dt-rating-item";
      btn.setAttribute("role", "radio");
      btn.setAttribute("data-dt-rating-item", "");
      btn.setAttribute("data-dt-rating-value", String(i + 1));
      btn.setAttribute("aria-posinset", String(i + 1));
      btn.setAttribute("aria-setsize", String(st.stars));
      btn.setAttribute("aria-label", `${i + 1} ${i === 0 ? "star" : "stars"}`);
      btn.tabIndex = -1;
      if (!template) {
        const path = "M12 2l2.9 6.26 6.6.7-4.94 4.5 1.36 6.54L12 16.9l-5.92 3.1 1.36-6.54L2.5 8.96l6.6-.7L12 2z";
        const filled = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        filled.setAttribute("viewBox", "0 0 24 24");
        filled.setAttribute("width", "20");
        filled.setAttribute("height", "20");
        filled.setAttribute("fill", "currentColor");
        filled.setAttribute("aria-hidden", "true");
        filled.setAttribute("focusable", "false");
        filled.classList.add("dt-rating-icon--filled");
        const fpath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        fpath.setAttribute("d", path);
        filled.append(fpath);
        const empty = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        empty.setAttribute("viewBox", "0 0 24 24");
        empty.setAttribute("width", "20");
        empty.setAttribute("height", "20");
        empty.setAttribute("fill", "none");
        empty.setAttribute("stroke", "currentColor");
        empty.setAttribute("stroke-width", "2");
        empty.setAttribute("stroke-linejoin", "round");
        empty.setAttribute("aria-hidden", "true");
        empty.setAttribute("focusable", "false");
        empty.classList.add("dt-rating-icon--empty");
        const epath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        epath.setAttribute("d", path);
        empty.append(epath);
        btn.append(filled, empty);
      }
      root.appendChild(btn);
      items.push(btn);
    }
    return items;
  }

  function ratingRender(root) {
    const st = ratingData(root);
    if (!st.ready) return;
    ratingItems(root).forEach((item) => {
      const value = Number(item.getAttribute("data-dt-rating-value"));
      const checked = value <= st.value;
      item.setAttribute("aria-checked", String(checked));
      item.classList.toggle("dt-rating-item--filled", checked);
      item.tabIndex = value === st.value ? 0 : -1;
      item.setAttribute("aria-posinset", String(value));
      item.setAttribute("aria-setsize", String(st.stars));
    });
    const clear = root.querySelector("[data-dt-rating-clear]");
    if (clear) clear.tabIndex = st.value === 0 ? 0 : -1;
  }

  function ratingSet(root, value) {
    const st = ratingData(root);
    if (!st.ready) initRating(root);
    const next = numericClamp(Math.round(value), 0, st.stars);
    if (next === st.value) return;
    st.value = next;
    ratingRender(root);
    root.dispatchEvent(new CustomEvent("dt:change", { bubbles: true, detail: { value: next } }));
  }

  function ratingReadonly(root) {
    return root.hasAttribute("data-dt-readonly") || root.hasAttribute("data-dt-disabled");
  }

  function initRating(root) {
    const st = ratingData(root);
    if (st.ready) return;
    st.ready = true;
    st.value = numericClamp(Number(root.getAttribute("data-dt-value")) || 0, 0, st.stars);
    ratingBuild(root);
    ratingRender(root);
    if (root.hasAttribute("data-dt-readonly")) {
      root.setAttribute("aria-readonly", "true");
      root.classList.add("dt-rating--readonly");
    }
    if (root.hasAttribute("data-dt-disabled")) {
      root.classList.add("dt-state-disabled");
      ratingItems(root).forEach((item) => item.setAttribute("aria-disabled", "true"));
      const clear = root.querySelector("[data-dt-rating-clear]");
      if (clear) clear.setAttribute("aria-disabled", "true");
    }
  }

  on("[data-dt-rating-item]", "click", (item) => {
    const root = item.closest("[data-dt-rating]");
    if (!root || ratingReadonly(root) || item.hasAttribute("aria-disabled")) return;
    initRating(root);
    ratingSet(root, Number(item.getAttribute("data-dt-rating-value")));
  });

  on("[data-dt-rating-clear]", "click", (clear) => {
    const root = clear.closest("[data-dt-rating]");
    if (!root || ratingReadonly(root) || clear.hasAttribute("aria-disabled")) return;
    initRating(root);
    ratingSet(root, 0);
  });

  on("[data-dt-rating]", "keydown", (root, e) => {
    if (ratingReadonly(root)) return;
    initRating(root);
    const st = ratingData(root);
    const items = ratingItems(root);
    if (items.length === 0) return;
    let next = null;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") next = Math.min(st.value + 1, st.stars);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = Math.max(st.value - 1, 0);
    else if (e.key === "Home") next = 1;
    else if (e.key === "End") next = st.stars;
    if (next === null) return;
    e.preventDefault();
    st.value = next;
    ratingRender(root);
    const target = items[next - 1];
    if (target) target.focus();
    root.dispatchEvent(new CustomEvent("dt:change", { bubbles: true, detail: { value: next } }));
  });

  document.querySelectorAll("[data-dt-rating]").forEach(initRating);

  /* ---------------- SecurityCode ---------------- */

  function securityCodeCells(root) {
    const cells = [...root.querySelectorAll("[data-dt-securitycode-cell]")];
    cells.forEach((cell, i) => {
      if (!cell.getAttribute("aria-label")) {
        cell.setAttribute("aria-label", `Digit ${i + 1} of ${cells.length}`);
      }
    });
    return cells;
  }

  function securityCodeReadonly(root) {
    return root.hasAttribute("data-dt-disabled");
  }

  function securityCodeValue(root) {
    return securityCodeCells(root).map((c) => c.value).join("");
  }

  function securityCodeComplete(root) {
    const cells = securityCodeCells(root);
    return cells.length > 0 && cells.every((c) => c.value.length === 1);
  }

  function securityCodeDispatch(root) {
    root.dispatchEvent(
      new CustomEvent("dt:change", { bubbles: true, detail: { value: securityCodeValue(root) } }),
    );
  }

  function securityCodeAnnounce(root) {
    const live = root.querySelector("[data-dt-securitycode-live]");
    if (!live) return;
    live.textContent = "";
    void live.offsetWidth;
    live.textContent = securityCodeComplete(root) ? "Code complete" : "";
  }

  function securityCodeFocusCell(root, cell) {
    if (cell && !cell.disabled) cell.focus();
  }

  function securityCodeFill(root, index, digit) {
    const cells = securityCodeCells(root);
    if (index >= cells.length) return;
    cells[index].value = digit;
    securityCodeDispatch(root);
    if (index < cells.length - 1) securityCodeFocusCell(root, cells[index + 1]);
  }

  on("[data-dt-securitycode-cell]", "input", (cell) => {
    const root = cell.closest("[data-dt-securitycode]");
    if (!root || securityCodeReadonly(root)) return;
    const digits = cell.value.replace(/\D/g, "").slice(-1);
    if (cell.value !== digits) cell.value = digits;
    const cells = securityCodeCells(root);
    const index = cells.indexOf(cell);
    if (index < 0) return;
    const remaining = digits;
    if (remaining) {
      for (let i = 0; i < remaining.length && index + i < cells.length; i++) {
        cells[index + i].value = remaining[i];
      }
      const nextIndex = Math.min(index + remaining.length, cells.length);
      securityCodeDispatch(root);
      if (securityCodeComplete(root)) {
        securityCodeAnnounce(root);
      } else if (nextIndex < cells.length) {
        securityCodeFocusCell(root, cells[nextIndex]);
      }
    }
  });

  on("[data-dt-securitycode-cell]", "keydown", (cell, e) => {
    const root = cell.closest("[data-dt-securitycode]");
    if (!root || securityCodeReadonly(root)) return;
    const cells = securityCodeCells(root);
    const index = cells.indexOf(cell);
    if (index < 0) return;
    if (e.key === "Backspace") {
      e.preventDefault();
      if (cell.value) {
        cell.value = "";
        securityCodeDispatch(root);
      } else if (index > 0) {
        cells[index - 1].value = "";
        securityCodeDispatch(root);
        securityCodeFocusCell(root, cells[index - 1]);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      securityCodeFocusCell(root, cells[index - 1]);
    } else if (e.key === "ArrowRight" && index < cells.length - 1) {
      e.preventDefault();
      securityCodeFocusCell(root, cells[index + 1]);
    } else if (e.key === "Home") {
      e.preventDefault();
      securityCodeFocusCell(root, cells[0]);
    } else if (e.key === "End") {
      e.preventDefault();
      securityCodeFocusCell(root, cells[cells.length - 1]);
    }
  });

  on("[data-dt-securitycode-cell]", "paste", (cell, e) => {
    const root = cell.closest("[data-dt-securitycode]");
    if (!root || securityCodeReadonly(root)) return;
    e.preventDefault();
    const text = e.clipboardData.getData("text");
    const digits = text.replace(/\D/g, "").slice(0, 12);
    const cells = securityCodeCells(root);
    const start = cells.indexOf(cell);
    if (start < 0 || digits.length === 0) return;
    for (let i = 0; i < digits.length && start + i < cells.length; i++) {
      cells[start + i].value = digits[i];
    }
    const last = Math.min(start + digits.length - 1, cells.length - 1);
    securityCodeDispatch(root);
    if (securityCodeComplete(root)) {
      securityCodeAnnounce(root);
    } else if (last < cells.length - 1) {
      securityCodeFocusCell(root, cells[last + 1]);
    }
  });

  on("[data-dt-securitycode-cell]", "focus", (cell) => {
    const root = cell.closest("[data-dt-securitycode]");
    if (!root || securityCodeReadonly(root)) return;
    cell.select();
  });

  on("[data-dt-securitycode]", "click", (root) => {
    if (securityCodeReadonly(root)) return;
    const firstEmpty = securityCodeCells(root).find((c) => !c.value);
    if (firstEmpty) firstEmpty.focus();
  });

  function securityCodeInit(root) {
    const cells = securityCodeCells(root);
    cells.forEach((cell, i) => {
      if (!cell.getAttribute("aria-label")) {
        cell.setAttribute("aria-label", `Digit ${i + 1} of ${cells.length}`);
      }
    });
  }

  document.querySelectorAll("[data-dt-securitycode]").forEach(securityCodeInit);

  /* ---------------- SignaturePad ---------------- */

  function signatureContext(canvas) {
    return canvas.getContext("2d");
  }

  function signatureSize(canvas) {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = Math.max(1, Math.round(rect.width * dpr));
    const h = Math.max(1, Math.round(rect.height * dpr));
    return { w, h, dpr };
  }

  function signatureResize(canvas) {
    const ctx = signatureContext(canvas);
    const { w, h, dpr } = signatureSize(canvas);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    ctx.lineWidth = Number(canvas.dataset.dtPenWidth) || 2.5;
    ctx.strokeStyle = canvas.dataset.dtPenColor || "#1c1c1c";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }

  function signaturePoint(canvas, e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  function signatureStrokeEnd(canvas) {
    const root = canvas.closest("[data-dt-signaturepad]");
    if (!root || canvas.dataset.dtDrawing !== "true") return;
    canvas.dataset.dtDrawing = "false";
    if (canvas.dataset.dtMoved !== "true") return;
    const value = canvas.toDataURL("image/png");
    root.dispatchEvent(new CustomEvent("dt:signature-change", { bubbles: true, detail: { value } }));
  }

  function initSignaturepad(root) {
    const canvas = root.querySelector("[data-dt-signaturepad-canvas]");
    if (!canvas || canvas.dataset.dtReady === "true") return;
    canvas.dataset.dtReady = "true";
    if (root.hasAttribute("data-dt-disabled")) {
      root.classList.add("dt-state-disabled");
      canvas.setAttribute("aria-disabled", "true");
      const clear = root.querySelector("[data-dt-signaturepad-clear]");
      if (clear) clear.disabled = true;
    }
    signatureResize(canvas);

    canvas.addEventListener("pointerdown", (e) => {
      if (root.hasAttribute("data-dt-disabled")) return;
      e.preventDefault();
      if (typeof canvas.setPointerCapture === "function") canvas.setPointerCapture(e.pointerId);
      canvas.dataset.dtDrawing = "true";
      canvas.dataset.dtMoved = "false";
      canvas.dataset.dtLast = JSON.stringify(signaturePoint(canvas, e));
      signatureResize(canvas);
    });

    canvas.addEventListener("pointermove", (e) => {
      if (canvas.dataset.dtDrawing !== "true") return;
      e.preventDefault();
      const ctx = signatureContext(canvas);
      const prev = JSON.parse(canvas.dataset.dtLast);
      const cur = signaturePoint(canvas, e);
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(cur.x, cur.y);
      ctx.stroke();
      canvas.dataset.dtLast = JSON.stringify(cur);
      canvas.dataset.dtMoved = "true";
    });

    const endStroke = (e) => {
      if (canvas.dataset.dtDrawing !== "true") return;
      e.preventDefault();
      canvas.releasePointerCapture?.(e.pointerId);
      signatureStrokeEnd(canvas);
    };
    canvas.addEventListener("pointerup", endStroke);
    canvas.addEventListener("pointercancel", endStroke);
  }

  on("[data-dt-signaturepad-clear]", "click", (button) => {
    const root = button.closest("[data-dt-signaturepad]");
    if (!root || root.hasAttribute("data-dt-disabled")) return;
    const canvas = root.querySelector("[data-dt-signaturepad-canvas]");
    if (!canvas) return;
    signatureResize(canvas);
    const ctx = signatureContext(canvas);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    root.dispatchEvent(new CustomEvent("dt:signature-change", { bubbles: true, detail: { value: "" } }));
  });

  document.querySelectorAll("[data-dt-signaturepad]").forEach(initSignaturepad);

  /* ---------------- Upload ---------------- */

  function uploadParams(root) {
    return {
      url: root.getAttribute("data-dt-upload-url") || "",
      param: root.getAttribute("data-dt-upload-param") || "files",
      auto: root.getAttribute("data-dt-upload-auto") !== "false",
      headers: root.hasAttribute("data-dt-upload-headers") ? JSON.parse(root.getAttribute("data-dt-upload-headers")) : null,
    };
  }

  function uploadAddRow(root, file) {
    const list = root.querySelector("[data-dt-upload-list]");
    if (!list) return;
    const row = document.createElement("li");
    row.className = "dt-upload-row";
    row.dataset.dtUploadRow = "";
    row.dataset.dtUploadState = "pending";
    row.dataset.dtUploadName = file.name;

    const name = document.createElement("span");
    name.className = "dt-upload-name";
    name.textContent = file.name;

    const size = document.createElement("span");
    size.className = "dt-upload-size";
    size.textContent = file.size > 0 ? `${Math.max(1, Math.round(file.size / 1024))} KB` : "0 KB";

    const progress = document.createElement("span");
    progress.className = "dt-upload-progress";
    progress.setAttribute("role", "progressbar");
    progress.setAttribute("aria-valuemin", "0");
    progress.setAttribute("aria-valuemax", "100");
    progress.setAttribute("aria-valuenow", "0");
    const fill = document.createElement("span");
    fill.className = "dt-upload-progress-fill";
    progress.append(fill);

    const status = document.createElement("span");
    status.className = "dt-upload-status";
    status.setAttribute("role", "status");

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "dt-upload-remove";
    remove.dataset.dtUploadRemove = "";
    remove.setAttribute("aria-label", `Remove ${file.name}`);
    remove.textContent = "\u00d7";

    row.append(name, size, progress, status, remove);
    list.appendChild(row);
    return row;
  }

  function uploadProgress(root, row, percent) {
    const progress = row.querySelector(".dt-upload-progress");
    const fill = row.querySelector(".dt-upload-progress-fill");
    if (progress) progress.setAttribute("aria-valuenow", String(percent));
    if (fill) fill.style.width = `${percent}%`;
    row.dataset.dtUploadState = "uploading";
    root.dispatchEvent(new CustomEvent("dt:upload-progress", { bubbles: true, detail: { name: row.dataset.dtUploadName, progress: percent } }));
  }

  function uploadSetState(root, row, state, statusText) {
    row.dataset.dtUploadState = state;
    const status = row.querySelector(".dt-upload-status");
    if (status && statusText !== undefined) status.textContent = statusText;
  }

  function uploadStart(root, row, file) {
    const { url, param, auto, headers } = uploadParams(root);
    if (!url || !auto) return;
    const xhr = new XMLHttpRequest();
    row.dataset.dtXhr = "pending";
    const fd = new FormData();
    fd.append(param, file);

    xhr.upload.addEventListener("progress", (e) => {
      if (!e.lengthComputable) return;
      uploadProgress(root, row, Math.round((e.loaded / e.total) * 100));
    });
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        uploadSetState(root, row, "complete", "Complete");
        root.dispatchEvent(new CustomEvent("dt:upload-complete", { bubbles: true, detail: { name: file.name } }));
      } else {
        uploadFail(root, row, file, `HTTP ${xhr.status}`);
      }
    });
    xhr.addEventListener("error", () => uploadFail(root, row, file, "Network error"));
    xhr.addEventListener("abort", () => {
      if (row.dataset.dtUploadState !== "pending") uploadSetState(root, row, "pending", "Cancelled");
    });
    if (headers) {
      for (const [key, value] of Object.entries(headers)) {
        xhr.setRequestHeader(key, value);
      }
    }
    xhr.open("POST", url);
    xhr.send(fd);
    row.dataset.dtXhr = "active";
    uploadSetState(root, row, "uploading", "Uploading");
  }

  function uploadFail(root, row, file, message) {
    uploadSetState(root, row, "error", "Failed");
    root.dispatchEvent(new CustomEvent("dt:upload-error", { bubbles: true, detail: { name: file.name, message } }));
  }

  on("[data-dt-upload-trigger]", "click", (trigger) => {
    const root = trigger.closest("[data-dt-upload]");
    const input = root?.querySelector("[data-dt-upload-input]");
    if (input) input.click();
  });

  on("[data-dt-upload-input]", "change", (input) => {
    const root = input.closest("[data-dt-upload]");
    if (!root || !input.files) return;
    for (const file of input.files) {
      const row = uploadAddRow(root, file);
      if (row) uploadStart(root, row, file);
    }
    input.value = "";
  });

  on("[data-dt-upload-remove]", "click", (button) => {
    const row = button.closest("[data-dt-upload-row]");
    if (!row) return;
    const root = row.closest("[data-dt-upload]");
    if (root) {
      root.dispatchEvent(new CustomEvent("dt:upload-cancel", { bubbles: true, detail: { name: row.dataset.dtUploadName } }));
    }
    row.remove();
  });

  /* ---------------- DropZone ---------------- */

  function dropzoneDisabled(root) {
    return root.hasAttribute("data-dt-dropzone-disabled");
  }

  function dropzoneMatches(file, accept) {
    if (!accept) return true;
    return accept.split(",").some((part) => {
      part = part.trim();
      if (!part) return false;
      if (part.startsWith(".")) return file.name.toLowerCase().endsWith(part.toLowerCase());
      if (part.endsWith("/*")) {
        const type = part.slice(0, -1);
        return file.type.startsWith(type);
      }
      return file.type === part;
    });
  }

  function dropzoneSetDrag(root, dragging) {
    root.classList.toggle("dt-dropzone--dragging", dragging);
    const caption = root.querySelector("[data-dt-dropzone-caption]");
    if (caption) {
      const base = root.getAttribute("aria-label") || caption.textContent || "Drop files here";
      caption.textContent = dragging ? "Drop to attach" : base.replace(/Drop to attach/, "").trim();
    }
  }

  on("[data-dt-dropzone]", "dragenter", (root, e) => {
    if (dropzoneDisabled(root)) return;
    e.preventDefault();
    dropzoneSetDrag(root, true);
  });

  on("[data-dt-dropzone]", "dragover", (root, e) => {
    if (dropzoneDisabled(root)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    dropzoneSetDrag(root, true);
  });

  on("[data-dt-dropzone]", "dragleave", (root, e) => {
    if (dropzoneDisabled(root)) return;
    if (root.contains(e.relatedTarget)) return;
    dropzoneSetDrag(root, false);
  });

  on("[data-dt-dropzone]", "drop", (root, e) => {
    if (dropzoneDisabled(root)) return;
    e.preventDefault();
    dropzoneSetDrag(root, false);
    const accept = root.getAttribute("data-dt-dropzone-accept") || "";
    const files = [...(e.dataTransfer?.files ?? [])].filter((f) => dropzoneMatches(f, accept));
    root.dispatchEvent(new CustomEvent("dt:dropzone-drop", { bubbles: true, detail: { files } }));
  });

  on("[data-dt-dropzone-browse]", "click", (button) => {
    const root = button.closest("[data-dt-dropzone]");
    if (!root || dropzoneDisabled(root)) return;
    const input = root.querySelector("[data-dt-dropzone-input]");
    if (input) input.click();
  });

  on("[data-dt-dropzone-input]", "change", (input) => {
    const root = input.closest("[data-dt-dropzone]");
    if (!root || !input.files) return;
    root.dispatchEvent(new CustomEvent("dt:dropzone-drop", { bubbles: true, detail: { files: [...input.files] } }));
    input.value = "";
  });

  /* ---------------- Picker popups: outside click ---------------- */

  document.addEventListener("mousedown", (e) => {
    const target = e.target instanceof Element ? e.target : null;
    if (!target) return;
    document.querySelectorAll("[data-dt-datepicker].dt-datepicker--open").forEach((root) => {
      if (!root.contains(target)) datepickerSetOpen(root, false);
    });
    document.querySelectorAll("[data-dt-timespanpicker].dt-timespanpicker--open").forEach((root) => {
      if (!root.contains(target)) {
        timespanRevert(root);
        timespanSetOpen(root, false);
      }
    });
    document.querySelectorAll("[data-dt-colorpicker].dt-colorpicker--open").forEach((root) => {
      if (!root.contains(target)) {
        colorpickerRevert(root);
        colorpickerSetOpen(root, false);
      }
    });
  });

  /* ---------------- Picker re-init on htmx swaps ---------------- */

  document.addEventListener("htmx:afterSettle", () => {
    document.querySelectorAll("[data-dt-datepicker]").forEach(initDatepicker);
    document.querySelectorAll("[data-dt-timespanpicker]").forEach(initTimespanpicker);
    document.querySelectorAll("[data-dt-colorpicker]").forEach(initColorpicker);
    document.querySelectorAll("[data-dt-slider]").forEach(initSlider);
    document.querySelectorAll("[data-dt-rating]").forEach(initRating);
    document.querySelectorAll("[data-dt-signaturepad]").forEach(initSignaturepad);
    document.querySelectorAll("[data-dt-securitycode]").forEach(securityCodeInit);
  });


  /* ---------------- API ---------------- */

  window.dtToast = showToast;
  window.dtUikit = {
    tabs: { activate: activateTab },
    datafilter: { init: initDataFilter },
    datagrid: { init: initDataGrid },
    datalist: { init: initDataList },
    datepicker: { init: initDatepicker },
    timespanpicker: { init: initTimespanpicker },
    colorpicker: { init: initColorpicker },
    slider: { init: initSlider },
    rating: { init: initRating },
    signaturepad: { init: initSignaturepad },
    securitycode: { init: securityCodeInit },
  };
})();