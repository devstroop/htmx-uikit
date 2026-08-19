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

  /* ---------------- API ---------------- */

  window.dtToast = showToast;
  window.dtUikit = {
    tabs: { activate: activateTab },
    datafilter: { init: initDataFilter },
    datagrid: { init: initDataGrid },
    datalist: { init: initDataList },
  };
})();