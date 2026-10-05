/**
 * uikit-htmx behaviors — tiny, dependency-free enhancements that HTML
 * cannot express. All hooks are data-dx-* attributes; htmx attributes
 * remain available for server-driven swaps.
 *
 * Components:
 *   Tabs        [data-dx-tabs] ARIA tabs: click, arrows, Home/End
 *   Accordion   [data-dx-accordion] (data-dx-accordion-multiple for multi)
 *   Tooltip     [data-dx-tooltip] hover/focus, Escape, aria-describedby
 *   Dialog      <dialog data-dx-dialog> + [data-dx-dialog-open="#id"]
 *   Toast       [data-dx-toast] container + window.dxToast(options)
 *   Dismiss     [data-dx-dismiss] removes the closest [data-dx-dismissable]
 *   Interactive [data-dx-interactive] Enter/Space dispatch click
 *   Sidebar     [data-dx-sidebar-toggle="#id"] toggles --collapsed on the
 *               target sidebar and mirrors aria-expanded on the trigger;
 *               [data-dx-sidebar-mask="#id"] closes the target drawer
 *               (Escape closes any open drawer)
*  Theme       [data-dx-theme-switch] flips data-theme on <html>
 *  Password    [data-dx-password-toggle] flips [data-dx-password-input]
 *              between text/password and mirrors aria-pressed + aria-label
 *  LiveRegion  [data-dx-live-region] + window.dxLiveRegion.announce(text)
 *  DialogSvc  window.dxDialog.open/close/closeAll/refresh/alert/confirm +
 *  Popup       window.dxPopup.open(anchor, content, options) anchored panel +
 *              close; open/close events; parity with react PopupProvider
 *  ContextMenu window.dxContextMenu.open(x, y, {items|content}) + close;
 *              `[data-dx-contextmenu]` trigger opens at the cursor; keyboard
 *              (arrows/Home/End/Enter/Escape), focus in + restore on close;
 *              parity with the react ContextMenuProvider
 *              dx:close{result} (parity with the react DialogProvider)
 *  MediaQuery  [data-dx-media-query="(min-width: 768px)"] toggles `hidden`;
 *  ThemeService window.dxTheme: get/set theme (data-palette) + appearance
 *              (data-theme) with dx-palette/dx-theme storage and listeners;
 *              parity with the react ThemeService module
 *              dispatches dx:media-change{query, matches} (parity with react useMediaQuery)
 *  Mask        [data-dx-mask="(###) ###-####"] formats digits on input
 *  RangeNav    [data-dx-range-navigator] zoom/pan window with slider
 *              handles; dx:range-change{start,end} (parity with react
 *              RangeNavigator; chart linkage stays consumer-side)
 *  Markdown    [data-dx-markdown] renders its Markdown source to HTML +
 *  Chat        [data-dx-chat] message list + input; submit appends the
 *              user message and dispatches dx:chat-send{text};
 *              window.dxChat.appendMessage adds replies (aria-live)
 *              window.dxMarkdown.render(source) (parity with react
 *              renderMarkdown; same vectors, raw HTML escaped, links
 *              scheme-checked)
 *              (# placeholders, literal separators); Backspace over a
 *              separator also removes the digit before it
 *  Numeric     [data-dx-numeric] steppers [data-dx-numeric-up/down] and
 *              ArrowUp/Down clamp/snap via data-dx-min/max/step
 *  Form        [data-dx-form] gates submit on [data-dx-field] validity:
 *              invalid (aria-invalid/data-dx-invalid) blocks + dx:invalid;
 *              valid dispatches dx:submit (FormData) and proceeds
 *  HtmlEditor  [data-dx-htmleditor] contenteditable host + toolbar
 *              [data-dx-htmleditor-tool]; execCommand ops, source toggle,
 *              dx:htmleditor-change{value} (parity with react HtmlEditor;
 *              no sanitize client-side — sanitize server-side)
 *  Togglebutton [data-dx-togglebutton] toggles aria-pressed + --pressed
 *  Selectbar   [data-dx-selectbar] + [data-dx-selectbar-option]: single-
 *              select aria-pressed group; dispatches dx:selectbar-change
 *  Listbox     [data-dx-listbox] (+ data-dx-listbox-multiple for multi):
 *              arrows, Home/End, Space, Enter, type-ahead via
 *              aria-activedescendant; dispatches dx:listbox-change
 *  Dropdown    [data-dx-dropdown] combobox popup: trigger/menu/option,
 *              arrows, Home/End, Enter, Escape, outside click; dispatches
 *              dx:dropdown-change
 *  Autocomplete [data-dx-autocomplete] input + menu/option/clear/empty:
 *              label filtering, arrows, Enter, Escape; dispatches
 *              dx:autocomplete-select
 *  Splitbutton [data-dx-splitbutton] caret/menu/item: arrows, Home/End,
 *              Enter, Escape, outside click; dispatches
 *              dx:splitbutton-activate
 *  Datepicker   [data-dx-datepicker] calendar popup: rendered grid,
 *              arrow/PageUp/PageDown/Home/End navigation, typing, time
 *              steppers, locale; dispatches dx:change / dx:invalid
 *  Timespanpicker [data-dx-timespanpicker] duration popup with unit
 *              steppers (staged edits, OK/Cancel); dispatches
 *              dx:change / dx:invalid
 *  Colorpicker  [data-dx-colorpicker] HSV popup (saturation/hue/alpha
 *              sliders, hex/RGBA inputs, palette swatches); dispatches
 *              dx:change
 *  Slider       [data-dx-slider] pointer + keyboard slider, single or
 *              range, horizontal/vertical; dispatches dx:change
 *  Rating       [data-dx-rating] star radiogroup with clear button;
 *              dispatches dx:change
 *  Pager        [data-dx-pager] nav with first/prev/number/next/last,
 *              ellipsis, summary, page-size select; dispatches
 *              dx:page-change{page,skip,top,pageCount,pageSize} and
 *              dx:page-size-change{pageSize}
 *  Menu         [data-dx-menu] menubar with submenus, hover/click, arrows;
 *              dispatches dx:menu-click{ text, value, path }
 *  PanelMenu    [data-dx-panelmenu] accordion nav, expand/collapse, arrows;
 *              dispatches dx:panelmenu-click{ text, value, path }
 *  ProfileMenu  [data-dx-profilemenu] trigger + dropdown menu, arrows/Escape;
 *              dispatches dx:profilemenu-click{ text, path }
 *  FabMenu      [data-dx-fabmenu] FAB with position, items, tooltip;
 *              dispatches dx:fabmenu-click{ text, value }
 *  Breadcrumb   [data-dx-breadcrumb] trail with separators, aria-current;
 *              dispatches dx:breadcrumb-click{ text, path }
 *  Steps        [data-dx-steps] wizard header + content, linear,
 *              selectedIndex; dispatches dx:steps-change{ index }
 *  Splitter     [data-dx-splitter] h/v panes size/min/max/collapsible,
 *              separator handle; dispatches dx:splitter-resize /
 *              dx:splitter-collapse (cancelable)
 *  Toc          [data-dx-toc] scroll-spy, selector scope, orientation;
 *              dispatches dx:toc-click{ text, selector }
 *  Tree         [data-dx-tree] tree/treeitem with expand/collapse, selection;
 *              dispatches dx:tree-select/expand/collapse
 *  PickList     [data-dx-picklist] source/target listboxes, move/up/down;
 *              dispatches dx:picklist-move{ source, target, moved, direction }
 *  Scheduler    [data-dx-scheduler] grid with slots/events, prev/next, keyboard;
 *              dispatches dx:scheduler-event-click/slot-click/date-change
 *  Gantt        [data-dx-gantt] grid with task bars, progress, dependencies;
 *              dispatches dx:gantt-task-click
 *  Pivot        [data-dx-pivot] field chips dispatch dx:pivot-field-remove
 *  Timeline     [data-dx-timeline] static list (reverse via data-dx-reverse)
 *  VirtualGrid  [data-dx-virtual-grid]
 *  Chart        [data-dx-chart] json series, nice ticks, tooltip, click htmx-driven windowing on reveal
 *  QRCode       [data-dx-qrcode] static server-rendered svg
 *  Barcode      [data-dx-barcode] static server-rendered svg
 *  Carousel     [data-dx-carousel] slides with auto/interval/pauseOnHover,
 *              arrows/indicators; dispatches dx:carousel-change{ index }
 *  SecurityCode [data-dx-securitycode] OTP digit cells: typing
 *              auto-advances, Backspace/arrows navigate, paste splits;
 *              dispatches dx:change with the full code and announces
 *              completion in a live region
 *  SignaturePad [data-dx-signaturepad] canvas pointer drawing (mouse/pen/
 *              touch), clear button, value = PNG data URL; dispatches
 *              dx:signature-change on stroke end
 *  Upload      [data-dx-upload] hidden file input + trigger, XHR upload
 *              with FormData and progress; dispatches dx:upload-progress /
 *              dx:upload-complete / dx:upload-error
 *  DropZone    [data-dx-dropzone] drag-over visual + drop with FileList,
 *              accept filter, browse fallback; dispatches
 *              dx:dropzone-drop
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
    const root = tab.closest("[data-dx-tabs]");
    if (!root) return;
    const key = tab.getAttribute("data-dx-tab-key");
    root.querySelectorAll("[data-dx-tab]").forEach((t) => {
      const active = t === tab;
      t.classList.toggle("dx-tabs-tab--active", active);
      t.setAttribute("aria-selected", String(active));
      t.tabIndex = active ? 0 : -1;
    });
    root.querySelectorAll("[data-dx-tabpanel]").forEach((panel) => {
      panel.hidden = panel.getAttribute("data-dx-tab-key") !== key;
    });
  }

  on("[data-dx-tab]", "click", (tab) => {
    if (tab.disabled) return;
    activateTab(tab);
    tab.focus();
  });

  on("[data-dx-tablist]", "keydown", (list, e) => {
    const tabs = [...list.querySelectorAll("[data-dx-tab]")].filter((t) => !t.disabled);
    const index = tabs.indexOf(document.activeElement);
    if (index < 0) return;
    const vertical = list.dataset.dxTablistOrientation === "vertical";
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
    const root = trigger.closest("[data-dx-accordion]");
    const item = trigger.closest("[data-dx-accordion-item]");
    if (!root || !item) return;
    const panel = item.querySelector("[data-dx-accordion-panel]");
    if (!panel) return;
    const isOpen = trigger.getAttribute("aria-expanded") === "true";
    if (!root.hasAttribute("data-dx-accordion-multiple")) {
      root.querySelectorAll("[data-dx-accordion-trigger][aria-expanded='true']").forEach((t) => {
        if (t !== trigger) {
          t.setAttribute("aria-expanded", "false");
          t.closest("[data-dx-accordion-item]")?.querySelector("[data-dx-accordion-panel]")?.removeAttribute("open");
        }
      });
    }
    trigger.setAttribute("aria-expanded", String(!isOpen));
    if (isOpen) panel.removeAttribute("open");
    else panel.setAttribute("open", "");
  }

  on("[data-dx-accordion-trigger]", "click", (trigger) => toggleAccordion(trigger));

  /* ---------------- Tooltip ---------------- */

  on("[data-dx-tooltip]", "mouseover", (root, e) => {
    if (e.relatedTarget instanceof Node && root.contains(e.relatedTarget)) return;
    scheduleTooltip(root, true);
  });
  on("[data-dx-tooltip]", "mouseout", (root, e) => {
    if (e.relatedTarget instanceof Node && root.contains(e.relatedTarget)) return;
    setTooltip(root, false);
  });
  on("[data-dx-tooltip]", "focusin", (root) => scheduleTooltip(root, true));
  on("[data-dx-tooltip]", "focusout", (root) => setTooltip(root, false));
  on("[data-dx-tooltip]", "keydown", (root, e) => {
    if (e.key === "Escape") setTooltip(root, false);
  });

  function scheduleTooltip(root, open) {
    clearTimeout(root._dxTooltipTimer);
    if (!open) return;
    const delay = Number(root.getAttribute("data-dx-delay-ms") ?? 300);
    root._dxTooltipTimer = setTimeout(() => setTooltip(root, true), delay);
  }

  function setTooltip(root, open) {
    clearTimeout(root._dxTooltipTimer);
    const bubble = root.querySelector("[data-dx-tooltip-content]");
    const trigger = root.firstElementChild;
    if (!bubble) return;
    if (open) {
      bubble.hidden = false;
      trigger?.setAttribute("aria-describedby", bubble.id || bubble.getAttribute("data-dx-tooltip-id") || "");
    } else {
      bubble.hidden = true;
      trigger?.removeAttribute("aria-describedby");
    }
  }

  /* ---------------- Dialog ---------------- */

  on("[data-dx-dialog-open]", "click", (trigger) => {
    const dialog = document.querySelector(trigger.getAttribute("data-dx-dialog-open"));
    if (!(dialog instanceof HTMLDialogElement)) return;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    dialog._dxDialogOpener = trigger;
  });

  on("[data-dx-dialog-close]", "click", (button) => {
    const dialog = button.closest("dialog");
    dialog?.close();
  });

  document.addEventListener(
    "close",
    (e) => {
      const dialog = e.target instanceof Element ? e.target.closest("dialog") : null;
      if (!dialog) return;
      const opener = dialog._dxDialogOpener;
      dialog._dxDialogOpener = null;
      opener?.focus();
    },
    true,
  );

  /* ---------------- Dialog service ---------------- */

  // Imperative host + service (parity with the react DialogProvider): builds
  // `<dialog data-dx-dialog>` hosts on demand, so `dxDialog.open(...)`
  // needs no host markup. Every close flows through one settle path:
  // resolve the promise, dispatch `dx:close` with { result }, then close
  // natively (the listener above restores focus to the opener).
  const dxDialogPending = [];

  function dxDialogTop() {
    return dxDialogPending.length > 0
      ? dxDialogPending[dxDialogPending.length - 1]
      : null;
  }

  function dxDialogSettle(entry, result) {
    if (!entry || entry.settled) return;
    entry.settled = true;
    const index = dxDialogPending.indexOf(entry);
    if (index >= 0) dxDialogPending.splice(index, 1);
    entry.resolve(result);
    entry.dialog.dispatchEvent(
      new CustomEvent("dx:close", {
        bubbles: true,
        detail: { result },
      })
    );
    if (entry.dialog.open) entry.dialog.close();
  }

  function dxDialogBuild({ title, description, header = true } = {}) {
    const dialog = document.createElement("dialog");
    dialog.className = "dx-dialog dx-dialog--md";
    dialog.setAttribute("data-dx-dialog", "");
    dialog.setAttribute("data-dx-dialog-service", "");
    if (header && title != null) {
      const head = document.createElement("div");
      head.className = "dx-dialog-header";
      const wrap = document.createElement("div");
      const h = document.createElement("h2");
      h.className = "dx-dialog-title";
      h.textContent = typeof title === "string" ? title : "";
      wrap.appendChild(h);
      if (description != null) {
        const d = document.createElement("p");
        d.className = "dx-dialog-description";
        d.textContent =
          typeof description === "string" ? description : "";
        wrap.appendChild(d);
      }
      head.appendChild(wrap);
      dialog.appendChild(head);
    }
    const body = document.createElement("div");
    body.className = "dx-dialog-body";
    dialog.appendChild(body);
    return { dialog, body };
  }

  function dxDialogButton(label, tone, onActivate) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `dx-button dx-button--${tone}`;
    button.textContent = label;
    button.addEventListener("click", onActivate);
    return button;
  }

  function dxDialogFooter(dialog, buttons) {
    const footer = document.createElement("div");
    footer.className = "dx-dialog-footer";
    buttons.forEach((b) => footer.appendChild(b));
    dialog.appendChild(footer);
  }

  async function dxDialogShow(entry) {
    const { dialog, url } = entry;
    if (url != null) {
      const response = await fetch(url);
      const html = await response.text();
      dialog.querySelector(".dx-dialog-body").innerHTML = html;
    }
    document.body.appendChild(dialog);
    dialog._dxDialogOpener =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    const first =
      dialog.querySelector('[aria-label="Close dialog"]') ??
      dialog.querySelector("button");
    if (first) first.focus();
  }

  function dxDialogTrack(entry) {
    const { dialog, closeOnEsc = true } = entry;
    // Native cancel (ESC): never let the browser close silently — route
    // through settle so the promise resolves and dx:close fires. With
    // closeOnEsc disabled the gesture is swallowed entirely.
    dialog.addEventListener("cancel", (e) => {
      e.preventDefault();
      if (closeOnEsc) dxDialogSettle(entry, undefined);
    });
    // Native close from any other path (e.g. an authored
    // data-dx-dialog-close button): settle the pending promise so it
    // can never hang, without double-firing.
    dialog.addEventListener("close", () => {
      dxDialogSettle(entry, undefined);
    });
    // Backdrop clicks land on the dialog element itself.
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog && dialog.hasAttribute("data-dx-dialog-overlay-close")) {
        dxDialogSettle(entry, undefined);
      }
    });
  }

  function dxDialogOpenSync({
    title,
    description,
    content,
    url,
    options = {},
  } = {}) {
    const {
      size = "md",
      width,
      height,
      side = null,
      showCloseButton = true,
      showMask = true,
      closeOnOverlayClick = true,
      closeOnEsc = true,
      className,
    } = options;
    const built = dxDialogBuild({ title, description });
    const dialog = built.dialog;
    dialog.classList.remove("dx-dialog--md");
    dialog.classList.add(`dx-dialog--${size}`);
    if (side) dialog.classList.add(`dx-dialog--side-${side}`);
    if (showMask === false) dialog.classList.add("dx-dialog--no-mask");
    if (className) dialog.classList.add(...className.split(/\s+/));
    if (width != null) dialog.style.width = String(width);
    if (height != null) dialog.style.height = String(height);
    if (closeOnOverlayClick) dialog.setAttribute("data-dx-dialog-overlay-close", "");
    if (content != null) {
      if (typeof content === "string") built.body.innerHTML = content;
      else built.body.appendChild(content);
    }
    if (title != null && showCloseButton !== false) {
      const head = dialog.querySelector(".dx-dialog-header");
      if (head) {
        const x = document.createElement("button");
        x.type = "button";
        x.className = "dx-dialog-close";
        x.setAttribute("aria-label", "Close dialog");
        x.textContent = "×";
        x.addEventListener("click", () => {
          const top = dxDialogTop();
          if (top && top.dialog === dialog) dxDialogSettle(top, undefined);
        });
        head.appendChild(x);
      }
    }
    let resolve;
    const done = new Promise((r) => {
      resolve = r;
    });
    const entry = { dialog, url, closeOnEsc, resolve, settled: false };
    dxDialogPending.push(entry);
    dxDialogTrack(entry);
    void dxDialogShow(entry);
    return { dialog, done };
  }

  window.dxDialog = {
    open(args) {
      return dxDialogOpenSync(args).done;
    },
    openSide({ position, showMask = true, ...rest } = {}) {
      return dxDialogOpenSync({
        ...rest,
        options: { ...(rest.options || {}), side: position, showMask },
      }).done;
    },
    close(result) {
      dxDialogSettle(dxDialogTop(), result);
    },
    closeAll() {
      [...dxDialogPending].forEach((entry) => dxDialogSettle(entry, undefined));
    },
    refresh(html) {
      const top = dxDialogTop();
      if (!top) return null;
      if (html != null)
        top.dialog.querySelector(".dx-dialog-body").innerHTML = html;
      return top.dialog;
    },
    alert({ title, message, okText = "OK", size = "md" } = {}) {
      const { dialog, done } = dxDialogOpenSync({
        title: title ?? "Alert",
        content: message != null ? `<p>${message}</p>` : "",
        options: { size },
      });
      const ok = dxDialogButton(okText, "primary", () =>
        dxDialogSettle(
          dxDialogPending.find((e) => e.dialog === dialog),
          undefined
        )
      );
      dxDialogFooter(dialog, [ok]);
      return done.then(() => undefined);
    },
    confirm({
      title,
      message,
      confirmText = "Confirm",
      cancelText = "Cancel",
      tone = "primary",
      size = "md",
    } = {}) {
      const { dialog, done } = dxDialogOpenSync({
        title: title ?? "Confirm",
        content: message != null ? `<p>${message}</p>` : "",
        options: { size },
      });
      const entry = () =>
        dxDialogPending.find((e) => e.dialog === dialog);
      const cancel = dxDialogButton(cancelText, "secondary", () =>
        dxDialogSettle(entry(), false)
      );
      const ok = dxDialogButton(confirmText, tone, () =>
        dxDialogSettle(entry(), true)
      );
      dxDialogFooter(dialog, [cancel, ok]);
      return done.then((result) => Boolean(result));
    },
  };

  /* ---------------- ContextMenu ---------------- */

  // Right-click menu (parity with the react ContextMenuProvider + Menu):
  // builds a role=menu popup at the cursor from an items array (flat,
  // { text, value?, disabled? }) or arbitrary content HTML. Keyboard:
  // ArrowUp/Down + Home/End cycle, Enter/Space activate, Escape closes;
  // focus moves into the menu on open and returns to the invoker on
  // close. Single popup at a time; each evaluation dispatches
  // `dx:contextmenu-open` / `dx:contextmenu-close`, item activation
  // dispatches `dx:contextmenu-select` with { value, text }.
  let contextMenuState = null;

  function contextMenuFocusables() {
    if (!contextMenuState) return [];
    return [
      ...contextMenuState.popup.querySelectorAll(
        'button:not([disabled])'
      ),
    ];
  }

  function contextMenuClose(restore = true) {
    const state = contextMenuState;
    if (!state) return;
    contextMenuState = null;
    document.removeEventListener("pointerdown", contextMenuOutside, true);
    document.removeEventListener("keydown", contextMenuKeydown, true);
    window.removeEventListener("resize", contextMenuCloseBound);
    window.removeEventListener("hashchange", contextMenuCloseBound);
    state.popup.dispatchEvent(
      new CustomEvent("dx:contextmenu-close", { bubbles: true })
    );
    state.popup.remove();
    if (
      restore &&
      state.invoker &&
      document.body.contains(state.invoker) &&
      typeof state.invoker.focus === "function"
    ) {
      state.invoker.focus({ preventScroll: true });
    }
  }

  function contextMenuCloseBound() {
    contextMenuClose(false);
  }

  function contextMenuOutside(e) {
    const state = contextMenuState;
    if (!state) return;
    if (e.target instanceof Node && !state.popup.contains(e.target))
      contextMenuClose();
  }

  function contextMenuKeydown(e) {
    const state = contextMenuState;
    if (!state) return;
    if (e.key === "Escape") {
      e.preventDefault();
      contextMenuClose();
      return;
    }
    if (e.key === "Tab") {
      contextMenuClose(false);
      return;
    }
    const items = contextMenuFocusables();
    if (items.length === 0) return;
    const active = document.activeElement;
    const index = items.indexOf(active);
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const dir = e.key === "ArrowDown" ? 1 : -1;
      const next =
        index < 0
          ? dir > 0
            ? items[0]
            : items[items.length - 1]
          : items[(index + dir + items.length) % items.length];
      next.focus();
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      (e.key === "Home" ? items[0] : items[items.length - 1]).focus();
    } else if ((e.key === "Enter" || e.key === " ") && active instanceof HTMLElement && state.popup.contains(active) && active.tagName === "BUTTON") {
      e.preventDefault();
      active.click();
    }
  }

  function contextMenuClamp(popup, x, y) {
    const rect = popup.getBoundingClientRect();
    const w = rect.width || 0;
    const h = rect.height || 0;
    popup.style.left = `${Math.max(0, Math.min(x, window.innerWidth - w))}px`;
    popup.style.top = `${Math.max(0, Math.min(y, window.innerHeight - h))}px`;
  }

  function contextMenuBuildItems(popup, items, onClick) {
    for (const item of items) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "dx-menu-item";
      button.setAttribute("role", "menuitem");
      if (item.value != null)
        button.setAttribute("data-dx-value", String(item.value));
      button.textContent = item.text ?? "";
      if (item.disabled) button.disabled = true;
      button.addEventListener("click", () => {
        if (onClick) onClick({ value: item.value, text: item.text });
        popup.dispatchEvent(
          new CustomEvent("dx:contextmenu-select", {
            bubbles: true,
            detail: { value: item.value, text: item.text },
          })
        );
        contextMenuClose();
      });
      popup.appendChild(button);
    }
  }

  function contextMenuOpen(x, y, options = {}) {
    contextMenuClose(false);
    const popup = document.createElement("div");
    popup.className = "dx-contextmenu-popup";
    popup.setAttribute("role", "menu");
    popup.setAttribute("aria-label", options.ariaLabel ?? "Context menu");
    popup.style.position = "fixed";
    if (options.content != null) {
      if (typeof options.content === "string")
        popup.innerHTML = options.content;
      else popup.appendChild(options.content);
    } else {
      contextMenuBuildItems(popup, options.items ?? [], options.onClick);
    }
    document.body.appendChild(popup);
    contextMenuClamp(popup, x, y);
    contextMenuState = {
      popup,
      invoker:
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null,
      onClick: options.onClick,
    };
    document.addEventListener("pointerdown", contextMenuOutside, true);
    document.addEventListener("keydown", contextMenuKeydown, true);
    window.addEventListener("resize", contextMenuCloseBound);
    window.addEventListener("hashchange", contextMenuCloseBound);
    popup.dispatchEvent(
      new CustomEvent("dx:contextmenu-open", { bubbles: true })
    );
    const first = contextMenuFocusables()[0];
    if (first) first.focus();
    return popup;
  }

  // Declarative trigger: the attribute value is either a selector for a
  // menu/content element to clone, or a JSON items array. Item clicks
  // surface as `dx:contextmenu-select`; the attribute carries no
  // callbacks by design.
  function contextMenuTriggerOptions(trigger) {
    const raw = (trigger.getAttribute("data-dx-contextmenu") || "").trim();
    const menuSelector = trigger.getAttribute("data-dx-contextmenu-menu");
    if (menuSelector) {
      const source = document.querySelector(menuSelector);
      if (source) return { content: source.innerHTML };
    }
    // A JSON array is items; anything else shaped like a selector is a
    // menu/content reference. JSON.parse first so `[...]` never reaches
    // querySelector as an invalid selector.
    if (raw) {
      try {
        const items = JSON.parse(raw);
        if (Array.isArray(items)) return { items };
      } catch {
        /* not JSON — try it as a selector below */
      }
      if (raw.startsWith("#") || raw.startsWith(".") || raw.startsWith("[")) {
        try {
          const source = document.querySelector(raw);
          if (source) return { content: source.innerHTML };
        } catch {
          /* invalid selector — fall through to empty content mode */
        }
      }
    }
    return {};
  }

  on("[data-dx-contextmenu],[data-dx-contextmenu-menu]", "contextmenu", (trigger, e) => {
    e.preventDefault();
    contextMenuOpen(e.clientX, e.clientY, {
      ...contextMenuTriggerOptions(trigger),
      ariaLabel:
        trigger.getAttribute("data-dx-contextmenu-label") ?? undefined,
    });
  });

  window.dxContextMenu = {
    open: (x, y, options) => contextMenuOpen(x, y, options),
    close: () => contextMenuClose(),
    get isOpen() {
      return contextMenuState != null;
    },
  };

  /* ---------------- Popup ---------------- */

  // Anchored panel (parity with the react PopupProvider + usePopup):
  // positions content against an anchor element, flipping above near the
  // bottom edge and clamping horizontally. Single panel at a time;
  // open/close dispatch `dx:popup-open` / `dx:popup-close` on the panel.
  // Focus moves into the panel on open and returns to the invoker on
  // close; Escape / outside pointer / resize / hashchange dismiss.
  let popupState = null;

  function popupPlace(panel, anchor) {
    const box = anchor.getBoundingClientRect();
    const rect = panel.getBoundingClientRect();
    const left = Math.max(
      0,
      Math.min(box.left, window.innerWidth - rect.width)
    );
    let top = box.bottom + 4;
    if (
      top + rect.height > window.innerHeight &&
      box.top - 4 - rect.height >= 0
    ) {
      top = box.top - 4 - rect.height;
    }
    panel.style.left = `${Math.max(0, left)}px`;
    panel.style.top = `${Math.max(0, top)}px`;
  }

  function popupClose(restore = true) {
    const state = popupState;
    if (!state) return;
    popupState = null;
    document.removeEventListener("pointerdown", popupOutside, true);
    document.removeEventListener("keydown", popupKeydown, true);
    window.removeEventListener("resize", popupCloseBound);
    window.removeEventListener("hashchange", popupCloseBound);
    state.panel.dispatchEvent(
      new CustomEvent("dx:popup-close", { bubbles: true })
    );
    if (state.onClose) state.onClose();
    state.panel.remove();
    if (
      restore &&
      state.invoker &&
      document.body.contains(state.invoker) &&
      typeof state.invoker.focus === "function"
    ) {
      state.invoker.focus({ preventScroll: true });
    }
  }

  function popupCloseBound() {
    popupClose(false);
  }

  function popupOutside(e) {
    const state = popupState;
    if (!state) return;
    if (e.target instanceof Node && !state.panel.contains(e.target))
      popupClose();
  }

  function popupKeydown(e) {
    if (!popupState) return;
    if (e.key === "Escape") {
      e.preventDefault();
      popupClose();
    }
  }

  function popupOpen(anchor, content, options = {}) {
    popupClose(false);
    const host =
      typeof anchor === "string" ? document.querySelector(anchor) : anchor;
    if (!(host instanceof HTMLElement)) return null;
    const panel = document.createElement("div");
    panel.className = "dx-popup";
    if (options.cssClass)
      panel.classList.add(...String(options.cssClass).split(/\s+/));
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", options.ariaLabel ?? "Popup");
    panel.setAttribute("tabindex", "-1");
    panel.style.position = "fixed";
    if (options.width != null)
      panel.style.width =
        typeof options.width === "number"
          ? `${options.width}px`
          : options.width;
    if (options.height != null)
      panel.style.height =
        typeof options.height === "number"
          ? `${options.height}px`
          : options.height;
    if (typeof content === "string") panel.innerHTML = content;
    else if (content instanceof Node) panel.appendChild(content);
    document.body.appendChild(panel);
    popupPlace(panel, host);
    popupState = {
      panel,
      invoker:
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null,
      onClose: options.onClose,
    };
    document.addEventListener("pointerdown", popupOutside, true);
    document.addEventListener("keydown", popupKeydown, true);
    window.addEventListener("resize", popupCloseBound);
    window.addEventListener("hashchange", popupCloseBound);
    panel.dispatchEvent(
      new CustomEvent("dx:popup-open", { bubbles: true })
    );
    if (options.onOpen) options.onOpen();
    panel.focus();
    return () => {
      if (popupState && popupState.panel === panel) popupClose();
    };
  }

  // Declarative trigger: an element carrying both a popup anchor target
  // and popup content opens the service against itself on click.
  // `data-dx-popup` holds a selector whose element's innerHTML becomes
  // the content; `data-dx-popup-html` carries inline HTML instead.
  on("[data-dx-popup],[data-dx-popup-html]", "click", (trigger, e) => {
    e.preventDefault();
    const selector = trigger.getAttribute("data-dx-popup");
    const inline = trigger.getAttribute("data-dx-popup-html");
    let content = inline;
    if (content == null && selector) {
      const source = document.querySelector(selector);
      if (source) content = source.innerHTML;
    }
    popupOpen(trigger, content ?? "", {
      ariaLabel: trigger.getAttribute("data-dx-popup-label") ?? undefined,
    });
  });

  window.dxPopup = {
    open: (anchor, content, options) => popupOpen(anchor, content, options),
    close: () => popupClose(),
    get isOpen() {
      return popupState != null;
    },
  };

  /* ---------------- Toast ---------------- */

  const TOAST_EXIT_MS = 200;

  function toastViewport(position) {
    const corner = position ?? "bottom-right";
    let container = document.querySelector(`.dx-toast-viewport--${corner}`);
    if (!container && corner === "bottom-right") {
      container = document.querySelector(".dx-toast-viewport:not([class*='--'])");
    }
    if (!container) {
      container = document.createElement("div");
      container.setAttribute("data-dx-toast", "");
      container.setAttribute("aria-live", "polite");
      container.className = `dx-toast-viewport dx-toast-viewport--${corner}`;
      document.body.appendChild(container);
    }
    return container;
  }

  function pauseToastTimer(item) {
    const timer = item._dxToastTimer;
    if (!timer) return;
    clearTimeout(item._dxToastTimeout);
    timer.remaining = Math.max(0, timer.remaining - (Date.now() - timer.startedAt));
    item.setAttribute("data-paused", "true");
  }

  function resumeToastTimer(item) {
    const timer = item._dxToastTimer;
    if (!timer || timer.remaining <= 0) return;
    timer.startedAt = Date.now();
    item._dxToastTimeout = setTimeout(() => expireToast(item), timer.remaining);
    item.setAttribute("data-paused", "false");
  }

  function expireToast(item) {
    if (!item || item.classList.contains("dx-toast--leaving")) return;
    stopToastTimer(item);
    item._dxToastOnAutoClose?.();
    removeToastItem(item);
  }

  function dismissToast(item) {
    if (!item || item.classList.contains("dx-toast--leaving")) return;
    stopToastTimer(item);
    item._dxToastOnDismiss?.();
    removeToastItem(item);
  }

  function removeToastItem(item) {
    item.classList.add("dx-toast--leaving");
    setTimeout(() => item.remove(), TOAST_EXIT_MS);
  }

  function startToastTimer(item, duration) {
    if (duration <= 0) return;
    item._dxToastTimer = { remaining: duration, startedAt: Date.now() };
    item._dxToastTimeout = setTimeout(() => expireToast(item), duration);
  }

  function stopToastTimer(item) {
    clearTimeout(item._dxToastTimeout);
    item._dxToastTimer = null;
  }

  function pauseAllToasts() {
    document.querySelectorAll(".dx-toast").forEach(pauseToastTimer);
  }

  function resumeAllToasts() {
    document.querySelectorAll(".dx-toast").forEach(resumeToastTimer);
  }

  document.addEventListener(
    "mouseover",
    (e) => {
      const target = e.target instanceof Element ? e.target.closest(".dx-toast") : null;
      if (target) pauseAllToasts();
    },
    true,
  );

  document.addEventListener(
    "mouseout",
    (e) => {
      const target = e.target instanceof Element ? e.target.closest(".dx-toast") : null;
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
    item.className = `dx-toast dx-toast--${options.tone ?? "info"}`;
    item.classList.remove("dx-toast--leaving");
    item.setAttribute("role", options.tone === "danger" ? "alert" : "status");
    item.setAttribute("data-dx-dismissable", "");
    if (options.id != null) {
      item.setAttribute("data-dx-toast-id", String(options.id));
    }
    item._dxToastOnAutoClose = options.onAutoClose;
    item._dxToastOnDismiss = options.onDismiss;
    item._dxToastClickClose = options.closeOnClick === true;
    item._dxToastPayload = options.payload;
    item.classList.toggle("dx-toast--clickable", item._dxToastClickClose);
    // Body activation: fires click(payload) when present; the toast still
    // dismisses only when closeOnClick asked for it (Radzen Click parity).
    item.onclick =
      typeof options.click === "function" || item._dxToastClickClose
        ? () => {
            if (typeof options.click === "function")
              options.click(item._dxToastPayload);
            if (item._dxToastClickClose) dismissToast(item);
          }
        : null;

    const content = document.createElement("div");
    content.className = "dx-toast-content";
    if (options.title) {
      const title = document.createElement("div");
      title.className = "dx-toast-title";
      title.textContent = options.title;
      content.appendChild(title);
    }
    if (options.description) {
      const desc = document.createElement("div");
      desc.className = "dx-toast-description";
      desc.textContent = options.description;
      content.appendChild(desc);
    }
    const actionButtons = [
      ["dx-toast-action", options.action],
      ["dx-toast-cancel", options.cancel],
    ].filter(([, action]) => action);
    if (actionButtons.length > 0) {
      const row = document.createElement("div");
      row.className = "dx-toast-actions";
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
      dismiss.className = "dx-toast-dismiss";
      dismiss.setAttribute("aria-label", "Dismiss notification");
      dismiss.setAttribute("data-dx-dismiss", "");
      dismiss.textContent = "\u00d7";
      item.appendChild(dismiss);
    }

    const duration = options.durationMs ?? 4000;
    if (options.showProgress && duration > 0) {
      const bar = document.createElement("div");
      bar.className = "dx-toast-progress";
      bar.style.animationDuration = `${duration}ms`;
      item.appendChild(bar);
    }

    return duration;
  }

  function showToast(options) {
    let item = null;
    if (options.id != null) {
      item = document.querySelector(`[data-dx-toast-id="${CSS.escape(String(options.id))}"]`);
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

  on("[data-dx-dismiss]", "click", (button) => {
    const target = button.closest("[data-dx-dismissable]");
    if (!target) return;
    if (target.classList.contains("dx-toast")) {
      dismissToast(target);
    } else {
      target.remove();
    }
  });

  /* ---------------- HtmlEditor ---------------- */

  // `[data-dx-htmleditor]` contenteditable host with a declarative toolbar
  // (`[data-dx-htmleditor-tool="bold|italic|underline|strikeThrough|undo|
  // redo|removeFormat|source"]`). Tool clicks run the matching execCommand
  // (guarded: engines without it skip silently), input on the host
  // dispatches `dx:htmleditor-change` with { value }, and the source tool
  // toggles a textarea mirror. No client-side sanitize here (the bundle
  // stays dependency-free) — sanitize the HTML server-side.
  const HTML_EDITOR_COMMANDS = {
    bold: "bold",
    italic: "italic",
    underline: "underline",
    strikethrough: "strikeThrough",
    undo: "undo",
    redo: "redo",
    removeFormat: "removeFormat",
    unorderedList: "insertUnorderedList",
    orderedList: "insertOrderedList",
    indent: "indent",
    outdent: "outdent",
    justifyLeft: "justifyLeft",
    justifyCenter: "justifyCenter",
    justifyRight: "justifyRight",
    justifyFull: "justifyFull",
    unlink: "unlink",
  };

  function htmlEditorExec(host, command, value) {
    if (
      typeof document.execCommand !== "function" ||
      !host ||
      !(host instanceof Element)
    )
      return false;
    try {
      host.focus();
      return document.execCommand(command, false, value);
    } catch {
      return false;
    }
  }

  // formatBlock wants `<h1>` in Chromium but bare `h1` in Firefox.
  function htmlEditorBlock(host, tag) {
    return (
      htmlEditorExec(host, "formatBlock", `<${tag}>`) ||
      htmlEditorExec(host, "formatBlock", tag)
    );
  }

  function htmlEditorApi(host) {
    return {
      execCommand: (command, value) => {
        const ok = htmlEditorExec(host, command, value);
        if (ok) htmlEditorEmit(host);
        return ok;
      },
      getHtml: () => htmlEditorValue(host),
      insertHtml: (html) => {
        if (htmlEditorExec(host, "insertHTML", html)) htmlEditorEmit(host);
      },
    };
  }

  function htmlEditorValue(host) {
    return host.innerHTML;
  }

  function htmlEditorEmit(host) {
    const value = htmlEditorValue(host);
    const inputSelector = host.getAttribute("data-dx-htmleditor-input");
    if (inputSelector) {
      const input = document.querySelector(inputSelector);
      if (input && "value" in input) input.value = value;
    }
    host.dispatchEvent(
      new CustomEvent("dx:htmleditor-change", {
        bubbles: true,
        detail: { value },
      })
    );
  }

  function htmlEditorSource(host) {
    let area = host.parentElement
      ? host.parentElement.querySelector(
          "textarea[data-dx-htmleditor-source]"
        )
      : null;
    if (!area) {
      area = document.createElement("textarea");
      area.setAttribute("data-dx-htmleditor-source", "");
      area.setAttribute("aria-label", "HTML source");
      host.insertAdjacentElement("afterend", area);
    }
    const editing = host.hidden;
    if (editing) {
      host.innerHTML = area.value;
      host.hidden = false;
      area.hidden = true;
    } else {
      area.value = host.innerHTML;
      host.hidden = true;
      area.hidden = false;
    }
    return area;
  }

  function htmlEditorHostFor(node) {
    if (!node || !(node instanceof Element)) return null;
    if (node.hasAttribute("data-dx-htmleditor")) return node;
    const scope =
      node.closest("[data-dx-htmleditor-toolbar]") ??
      node.closest("[data-dx-htmleditor]");
    if (scope && scope.hasAttribute("data-dx-htmleditor")) return scope;
    if (scope) {
      const target = scope.getAttribute("data-dx-htmleditor-target");
      if (target) return document.querySelector(target);
      const host = scope.parentElement
        ? scope.parentElement.querySelector("[data-dx-htmleditor]")
        : null;
      return host;
    }
    return null;
  }

  // Keep the selection alive: mousedown on a toolbar button would
  // otherwise blur the editable region before click runs.
  on("[data-dx-htmleditor-tool]", "mousedown", (button, e) => {
    e.preventDefault();
  });

  on("[data-dx-htmleditor-tool]", "click", (button) => {
    const host = htmlEditorHostFor(button);
    if (!host) return;
    const tool = button.getAttribute("data-dx-htmleditor-tool");
    // The source toggle must work while the host is hidden (it is the
    // way back); exec tools require a visible host.
    if (tool === "source") {
      htmlEditorSource(host);
      htmlEditorEmit(host);
      return;
    }
    if (host.hidden) return;
    // Custom tools (`custom:<id>`) hand control to the consumer via
    // `dx:htmleditor-tool` carrying { id, host, api }; link/image/table
    // open service dialogs (see below); color/selects have their own
    // listeners further down.
    if (tool === "link") {
      htmlEditorLinkDialog(host);
      return;
    }
    if (tool === "image") {
      htmlEditorImageDialog(host);
      return;
    }
    if (tool === "table") {
      htmlEditorTableDialog(host);
      return;
    }
    if (tool.startsWith("custom:")) {
      host.dispatchEvent(
        new CustomEvent("dx:htmleditor-tool", {
          bubbles: true,
          detail: {
            id: tool.slice("custom:".length),
            host,
            api: htmlEditorApi(host),
          },
        })
      );
      return;
    }
    const command = HTML_EDITOR_COMMANDS[tool];
    if (!command) return;
    if (htmlEditorExec(host, command)) htmlEditorEmit(host);
  });

  on("[data-dx-htmleditor-color]", "change", (input) => {
    const host = htmlEditorHostFor(input);
    if (!host || host.hidden) return;
    const kind = input.getAttribute("data-dx-htmleditor-color");
    const value = input.value;
    // hiliteColor first (Chromium/Safari/modern Firefox), backColor
    // fallback for older engines.
    const command = kind === "background" ? "hiliteColor" : "foreColor";
    if (
      !htmlEditorExec(host, command, value) &&
      command === "hiliteColor"
    ) {
      htmlEditorExec(host, "backColor", value);
    }
    htmlEditorEmit(host);
  });

  on("[data-dx-htmleditor-select]", "change", (select) => {
    const host = htmlEditorHostFor(select);
    if (!host || host.hidden || !select.value) return;
    const kind = select.getAttribute("data-dx-htmleditor-select");
    if (kind === "formatBlock") htmlEditorBlock(host, select.value);
    else if (kind === "fontName")
      htmlEditorExec(host, "fontName", select.value);
    else if (kind === "fontSize")
      htmlEditorExec(host, "fontSize", select.value);
    htmlEditorEmit(host);
    select.value = "";
  });

  on("[data-dx-htmleditor]", "input", (host) => {
    htmlEditorEmit(host);
  });

  on("[data-dx-htmleditor]", "keydown", (host, e) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    const key = (e.key || "").toLowerCase();
    const tool =
      key === "b"
        ? "bold"
        : key === "i"
          ? "italic"
          : key === "u"
            ? "underline"
            : null;
    if (!tool) return;
    e.preventDefault();
    if (htmlEditorExec(host, HTML_EDITOR_COMMANDS[tool])) htmlEditorEmit(host);
  });

  function htmlEditorField(label, attrs) {
    const wrap = document.createElement("div");
    const lab = document.createElement("label");
    lab.textContent = label;
    const input = document.createElement("input");
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === "type") input.type = v;
      else if (k === "value") input.value = v;
      else input.setAttribute(k, v);
    }
    input.setAttribute("aria-label", label);
    lab.appendChild(input);
    wrap.appendChild(lab);
    return { wrap, input };
  }

  // Prompt dialog over dxDialog: fields + Cancel/Submit footer. Submit
  // hands the input values to onSubmit, then closes the top dialog.
  function htmlEditorPrompt({ title, fields, submitLabel, onSubmit }) {
    const body = document.createElement("div");
    const inputs = fields.map((f) => {
      const built = htmlEditorField(f.label, f.attrs);
      body.appendChild(built.wrap);
      return built.input;
    });
    const row = document.createElement("div");
    row.className = "dx-dialog-footer";
    const closeTop = (result) => {
      const top = dxDialogTop();
      if (top) dxDialogSettle(top, result);
    };
    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.className = "dx-button dx-button--secondary";
    cancel.textContent = "Cancel";
    cancel.addEventListener("click", () => closeTop(undefined));
    const ok = document.createElement("button");
    ok.type = "button";
    ok.className = "dx-button dx-button--primary";
    ok.textContent = submitLabel;
    ok.addEventListener("click", () => {
      onSubmit(inputs.map((i) => i.value));
      closeTop(undefined);
    });
    row.appendChild(cancel);
    row.appendChild(ok);
    body.appendChild(row);
    return window.dxDialog.open({ title, content: body });
  }

  function htmlEditorLinkDialog(host) {
    void htmlEditorPrompt({
      title: "Insert link",
      fields: [
        { label: "URL", attrs: { type: "url", placeholder: "https://" } },
      ],
      submitLabel: "Insert",
      onSubmit: ([url]) => {
        if (url && url.trim() && htmlEditorExec(host, "createLink", url.trim()))
          htmlEditorEmit(host);
      },
    });
  }

  function htmlEditorUpload(host, file, url) {
    const form = new FormData();
    form.append("file", file);
    return fetch(url, { method: "POST", body: form })
      .then((response) => {
        if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
        const contentType = response.headers.get("content-type") ?? "";
        return contentType.includes("application/json")
          ? response.json()
          : response.text();
      })
      .then((body) => {
        const out =
          typeof body === "string"
            ? body.trim()
            : body && typeof body.url === "string"
              ? body.url
              : "";
        if (!out) throw new Error("Upload response has no url");
        if (htmlEditorExec(host, "insertImage", out)) htmlEditorEmit(host);
      })
      .catch((err) => {
        host.dispatchEvent(
          new CustomEvent("dx:htmleditor-error", {
            bubbles: true,
            detail: {
              message: err instanceof Error ? err.message : "Image upload failed",
            },
          })
        );
      });
  }

  function htmlEditorImageDialog(host) {
    const uploadUrl = host.getAttribute("data-dx-htmleditor-upload-url");
    const body = document.createElement("div");
    const { wrap, input } = htmlEditorField("Image URL", {
      type: "url",
      placeholder: "https://",
    });
    body.appendChild(wrap);
    if (uploadUrl) {
      const fileWrap = document.createElement("div");
      const fileLabel = document.createElement("label");
      fileLabel.textContent = "Or upload a file";
      const file = document.createElement("input");
      file.type = "file";
      file.accept = "image/*";
      file.setAttribute("aria-label", "Upload image file");
      // Upload starts on select (react parity); success inserts and
      // closes, failure dispatches dx:htmleditor-error and stays open.
      file.addEventListener("change", () => {
        const picked = file.files && file.files[0];
        if (picked)
          void htmlEditorUpload(host, picked, uploadUrl).then(() => {
            closeTop();
          });
      });
      fileLabel.appendChild(file);
      fileWrap.appendChild(fileLabel);
      body.appendChild(fileWrap);
    }
    const row = document.createElement("div");
    row.className = "dx-dialog-footer";
    const closeTop = () => {
      const top = dxDialogTop();
      if (top) dxDialogSettle(top, undefined);
    };
    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.className = "dx-button dx-button--secondary";
    cancel.textContent = "Cancel";
    cancel.addEventListener("click", closeTop);
    const ok = document.createElement("button");
    ok.type = "button";
    ok.className = "dx-button dx-button--primary";
    ok.textContent = "Insert";
    ok.addEventListener("click", () => {
      const url = input.value.trim();
      if (url && htmlEditorExec(host, "insertImage", url)) htmlEditorEmit(host);
      closeTop();
    });
    row.appendChild(cancel);
    row.appendChild(ok);
    body.appendChild(row);
    void window.dxDialog.open({ title: "Insert image", content: body });
  }

  function htmlEditorTableDialog(host) {
    const body = document.createElement("div");
    const rows = htmlEditorField("Rows", { type: "number", value: "2" });
    const cols = htmlEditorField("Columns", { type: "number", value: "2" });
    body.appendChild(rows.wrap);
    body.appendChild(cols.wrap);
    const row = document.createElement("div");
    row.className = "dx-dialog-footer";
    const closeTop = () => {
      const top = dxDialogTop();
      if (top) dxDialogSettle(top, undefined);
    };
    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.className = "dx-button dx-button--secondary";
    cancel.textContent = "Cancel";
    cancel.addEventListener("click", closeTop);
    const ok = document.createElement("button");
    ok.type = "button";
    ok.className = "dx-button dx-button--primary";
    ok.textContent = "Insert";
    ok.addEventListener("click", () => {
      const r = Math.max(1, Math.min(10, Math.floor(Number(rows.input.value)) || 1));
      const c = Math.max(1, Math.min(10, Math.floor(Number(cols.input.value)) || 1));
      const cells = Array.from({ length: c }, () => "<td><br></td>").join("");
      const html = `<table><tbody>${Array.from({ length: r }, () => `<tr>${cells}</tr>`).join("")}</tbody></table>`;
      if (htmlEditorExec(host, "insertHTML", html)) htmlEditorEmit(host);
      closeTop();
    });
    row.appendChild(cancel);
    row.appendChild(ok);
    body.appendChild(row);
    void window.dxDialog.open({ title: "Insert table", content: body });
  }

  window.dxHtmlEditor = {
    execute(hostOrSelector, command, value) {
      const host =
        typeof hostOrSelector === "string"
          ? document.querySelector(hostOrSelector)
          : hostOrSelector;
      if (!host || !(host instanceof Element)) return false;
      const ok = htmlEditorExec(host, command, value);
      if (ok) htmlEditorEmit(host);
      return ok;
    },
    getHtml(hostOrSelector) {
      const host =
        typeof hostOrSelector === "string"
          ? document.querySelector(hostOrSelector)
          : hostOrSelector;
      return host && host instanceof Element ? host.innerHTML : "";
    },
  };


  /* ---------------- Interactive (clickable cards etc.) ---------------- */

  on("[data-dx-interactive]", "keydown", (el, e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      el.click();
    }
  });

  /* ---------------- Sidebar toggle ---------------- */

  on("[data-dx-sidebar-toggle]", "click", (trigger) => {
    const selector = trigger.getAttribute("data-dx-sidebar-toggle");
    const target = selector
      ? document.querySelector(selector)
      : trigger.closest("[data-dx-sidebar]");
    if (!target) return;
    const collapsed = target.classList.toggle("dx-sidebar--collapsed");
    trigger.setAttribute("aria-expanded", String(!collapsed));
    if (selector) {
      const mask = document.querySelector(`[data-dx-sidebar-mask="${selector}"]`);
      mask?.classList.toggle("dx-layout-mask--hidden", collapsed);
    }
  });

  /* ---------------- Sidebar overlay mask ---------------- */

  on("[data-dx-sidebar-mask]", "click", (mask) => {
    const selector = mask.getAttribute("data-dx-sidebar-mask");
    const target = selector ? document.querySelector(selector) : null;
    if (!target) return;
    target.classList.add("dx-sidebar--collapsed");
    mask.classList.add("dx-layout-mask--hidden");
    if (selector) {
      const trigger = document.querySelector(`[aria-controls="${selector.replace(/^#/, "")}"]`);
      trigger?.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    document
      .querySelectorAll("[data-dx-sidebar-mask]:not(.dx-layout-mask--hidden)")
      .forEach((mask) => mask.click());
  });

  /* ---------------- ThemeService ---------------- */

  // Imperative theme service (parity with the react ThemeService module):
  // owns `<html data-palette>` / `<html data-theme>` plus `dx-palette` /
  // `dx-theme` storage, with get/set/subscribe verbs. Same keys and
  // attribute contract as the react side, so both frameworks share state
  // on one page. DOM attributes win over storage on first read.
  const themeListeners = new Set();
  // Reads stay fresh from the DOM (the live source of truth) so writes
  // from the [data-dx-theme-switch] behavior — same keys, its own UI
  // logic — are visible to the service immediately. Storage seeds the
  // DOM once per process when no attribute is applied.
  let themeAdopted = false;

  function themeReadStored(key) {
    try {
      if (typeof localStorage === "undefined") return null;
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function themeWriteStored(key, value) {
    try {
      if (typeof localStorage === "undefined") return;
      if (value == null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    } catch {
      /* persistence is best-effort */
    }
  }

  function themeReadDom() {
    const el = document.documentElement;
    const theme = el.getAttribute("data-palette");
    const raw = el.getAttribute("data-theme");
    return {
      theme,
      appearance:
        raw === "light" || raw === "dark" ? raw : null,
    };
  }

  function themeCurrent() {
    const dom = themeReadDom();
    if (!themeAdopted) {
      themeAdopted = true;
      const storedTheme = themeReadStored("dx-palette");
      const storedAppearance = themeReadStored("dx-theme");
      const seeded = {
        theme: dom.theme ?? storedTheme,
        appearance:
          dom.appearance ??
          (storedAppearance === "light" || storedAppearance === "dark"
            ? storedAppearance
            : null),
      };
      if (seeded.theme != null || seeded.appearance != null) {
        const el = document.documentElement;
        if (seeded.theme != null) el.setAttribute("data-palette", seeded.theme);
        if (seeded.appearance != null)
          el.setAttribute("data-theme", seeded.appearance);
      }
      return seeded;
    }
    return dom;
  }

  function themeNotify() {
    const state = themeCurrent();
    themeListeners.forEach((fn) =>
      fn({ theme: state.theme, appearance: state.appearance })
    );
  }

  window.dxTheme = {
    getTheme() {
      return themeCurrent().theme;
    },
    setTheme(name) {
      const state = themeCurrent();
      if (state.theme === name) return;
      state.theme = name;
      const el = document.documentElement;
      if (name == null) el.removeAttribute("data-palette");
      else el.setAttribute("data-palette", name);
      themeWriteStored("dx-palette", name);
      themeNotify();
    },
    getAppearance() {
      return themeCurrent().appearance;
    },
    setAppearance(mode) {
      const state = themeCurrent();
      if (state.appearance === mode) return;
      state.appearance = mode;
      const el = document.documentElement;
      if (mode == null) el.removeAttribute("data-theme");
      else el.setAttribute("data-theme", mode);
      themeWriteStored("dx-theme", mode);
      themeNotify();
    },
    subscribe(fn) {
      themeListeners.add(fn);
      return () => {
        themeListeners.delete(fn);
      };
    },
  };

  // Test seam: jsdom suites share one document, so tests reset the
  // module-level adoption flag between cases.
  window.dxTheme.__resetForTests = () => {
    themeAdopted = false;
    themeListeners.clear();
  };

  /* ---------------- Theme switch ---------------- */

  function initThemeSwitches() {
    // Reads through the service so stored choices (adopted on first
    // read) materialize into the switch; the service and the switch
    // share the dx-theme key.
    const dark = window.dxTheme.getAppearance() === "dark";
    document.querySelectorAll("[data-dx-theme-switch]").forEach((input) => {
      input.checked = dark;
    });
  }

  initThemeSwitches();
  document.addEventListener("htmx:afterSettle", initThemeSwitches);

  on("[data-dx-theme-switch]", "change", (input) => {
    // Route through the service: persists the choice and notifies
    // subscribers (same observable effect as the direct assignment).
    window.dxTheme.setAppearance(input.checked ? "dark" : "light");
  });

  /* ---------------- Password toggle ---------------- */

  on("[data-dx-password-toggle]", "click", (button) => {
    if (button.disabled) return;
    const root = button.closest("[data-dx-password]");
    if (!root) return;
    const input = root.querySelector("[data-dx-password-input]");
    if (!input) return;
    const show = input.type === "text";
    input.type = show ? "password" : "text";
    const showLabel = button.getAttribute("data-dx-password-show") || "Show password";
    const hideLabel = button.getAttribute("data-dx-password-hide") || "Hide password";
    button.setAttribute("aria-pressed", String(!show));
    button.setAttribute("aria-label", show ? showLabel : hideLabel);
    const isText = input.type === "text";
    root.querySelectorAll("[data-dx-password-icon]").forEach((svg) => {
      svg.hidden = (svg.getAttribute("data-dx-password-icon") === "visible") === isText;
    });
  });

  /* ---------------- LiveRegion ---------------- */

  // `<div data-dx-live-region>` marks the polite SR panel for imperative
  // announcements (parity with react's useLiveRegion hook). The behavior
  // keeps the attribute contract: role=status + aria-live=polite.
  function initLiveRegion(scope) {
    const root = scope || document;
    root.querySelectorAll("[data-dx-live-region]").forEach((el) => {
      el.setAttribute("aria-live", "polite");
      el.setAttribute("role", "status");
    });
  }

  window.dxLiveRegion = {
    announce(text, root) {
      const container = root || document;
      let el =
        container.querySelector &&
        container.querySelector("[data-dx-live-region]");
      if (!el) {
        el = document.createElement("div");
        el.setAttribute("data-dx-live-region", "");
        document.body.appendChild(el);
      }
      el.setAttribute("aria-live", "polite");
      el.setAttribute("role", "status");
      el.textContent = String(text);
      return el;
    },
  };

  initLiveRegion();
  document.addEventListener("htmx:afterSettle", () => initLiveRegion());

  document
    .querySelectorAll("[data-dx-media-query]")
    .forEach(initMediaQuery);
  document.addEventListener("htmx:afterSettle", () => {
    document
      .querySelectorAll("[data-dx-media-query]")
      .forEach(initMediaQuery);
  });

  /* ---------------- MediaQuery ---------------- */

  // `[data-dx-media-query="(min-width: 768px)"]` hides the host while the
  // query does not match (removes `hidden` when it matches) and re-evaluates
  // whenever the media list changes — parity with the react `useMediaQuery`
  // hook and `<MediaQuery>` gate. Evaluations dispatch `dx:media-change`
  // carrying { query, matches }.
  const boundMediaQuery = new WeakSet();

  function initMediaQuery(el) {
    if (!el || !(el instanceof Element)) return;
    if (boundMediaQuery.has(el)) return;
    const query = el.getAttribute("data-dx-media-query") || "";
    if (!query || typeof window.matchMedia !== "function") return;
    boundMediaQuery.add(el);
    const list = window.matchMedia(query);
    const apply = () => {
      const matches = list.matches;
      if (matches) el.removeAttribute("hidden");
      else el.setAttribute("hidden", "");
      el.dispatchEvent(
        new CustomEvent("dx:media-change", {
          bubbles: true,
          detail: { query, matches },
        })
      );
    };
    apply();
    if (typeof list.addEventListener === "function")
      list.addEventListener("change", apply);
    else if (typeof list.addListener === "function") list.addListener(apply);
  }

  document
    .querySelectorAll("[data-dx-media-query]")
    .forEach(initMediaQuery);


  /* ---------------- Markdown ---------------- */

  // Small Markdown renderer (parity with react's renderMarkdown — keep
  // the two implementations and their shared vectors in sync): headings,
  // bold, italic, strikethrough, code, links, lists, quotes, rules,
  // fences. Raw HTML is escaped unless allowHtml is set; link targets
  // are scheme-checked either way (`javascript:` never survives).
  function markdownEscapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function markdownSafeHref(url) {
    const cleaned = String(url).trim();
    if (
      /^(https?:|mailto:|\/|#)/i.test(cleaned) ||
      (/^[a-zA-Z0-9._~:/?#[\]@!$&'()*+,;=%-]+$/.test(cleaned) &&
        !/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(cleaned))
    ) {
      return cleaned;
    }
    return null;
  }

  const MARKDOWN_CODE = "\u0000";

  function markdownInline(text, allowHtml) {
    const spans = [];
    let out = text.replace(/`([^`\n]+)`/g, (m, code) => {
      spans.push(`<code>${markdownEscapeHtml(code)}</code>`);
      return `${MARKDOWN_CODE}${spans.length - 1}${MARKDOWN_CODE}`;
    });
    if (!allowHtml) out = markdownEscapeHtml(out);
    out = out
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/__(.+?)__/g, "<strong>$1</strong>")
      .replace(/(?<!\w)\*([^*\n]+)\*(?!\w)/g, "<em>$1</em>")
      .replace(/(?<!\w)_([^_\n]+)_(?!\w)/g, "<em>$1</em>")
      .replace(/~~(.+?)~~/g, "<del>$1</del>")
      .replace(
        /\[([^\]\n]+)\]\(([^()\n]*(?:\([^()\n]*\)[^()\n]*)*)\)/g,
        (m, label, url) => {
          const href = markdownSafeHref(url);
          return href == null
            ? label
            : `<a href="${markdownEscapeHtml(href)}">${label}</a>`;
        }
      );
    const restore = new RegExp(
      `${MARKDOWN_CODE}(\\d+)${MARKDOWN_CODE}`,
      "g"
    );
    return out.replace(restore, (m, i) => spans[Number(i)] ?? "");
  }

  function markdownRender(source, options) {
    const allowHtml = !!(options && options.allowHtml);
    const lines = String(source).replace(/\r\n?/g, "\n").split("\n");
    const at = (n) => lines[n] ?? "";
    const blocks = [];
    let i = 0;

    const flushList = (items, ordered) => {
      const tag = ordered ? "ol" : "ul";
      blocks.push(
        `<${tag}>${items.map((item) => `<li>${markdownInline(item, allowHtml)}</li>`).join("")}</${tag}>`
      );
    };

    while (i < lines.length) {
      const line = at(i);
      if (/^\s*$/.test(line)) {
        i += 1;
        continue;
      }
      const heading = /^(#{1,6})\s+(.*)$/.exec(line);
      if (heading && heading[1] !== undefined && heading[2] !== undefined) {
        const level = heading[1].length;
        blocks.push(
          `<h${level}>${markdownInline(heading[2].trim(), allowHtml)}</h${level}>`
        );
        i += 1;
        continue;
      }
      if (/^(`{3,}|~{3,})\s*(\w*)\s*$/.test(line)) {
        const lang =
          /^(`{3,}|~{3,})\s*(\w*)\s*$/.exec(line)?.[2] ?? "";
        const body = [];
        i += 1;
        while (i < lines.length) {
          const fenceLine = at(i);
          if (/^(`{3,}|~{3,})\s*$/.test(fenceLine)) break;
          body.push(fenceLine);
          i += 1;
        }
        i += 1;
        const cls = lang ? ` class="language-${markdownEscapeHtml(lang)}"` : "";
        blocks.push(
          `<pre><code${cls}>${markdownEscapeHtml(body.join("\n"))}</code></pre>`
        );
        continue;
      }
      if (/^>\s?(.*)$/.test(line)) {
        const quoted = [];
        while (i < lines.length && /^>\s?(.*)$/.test(at(i))) {
          quoted.push(/^>\s?(.*)$/.exec(at(i))?.[1] ?? "");
          i += 1;
        }
        blocks.push(
          `<blockquote>${quoted.map((q) => `<p>${markdownInline(q, allowHtml)}</p>`).join("")}</blockquote>`
        );
        continue;
      }
      if (/^(\*\*\*|---|___)\s*$/.test(line.trim())) {
        blocks.push("<hr>");
        i += 1;
        continue;
      }
      const unordered = /^\s*[-*+]\s+(.*)$/.exec(line);
      if (unordered) {
        const items = [];
        while (i < lines.length) {
          const m = /^\s*[-*+]\s+(.*)$/.exec(at(i));
          const text = m?.[1];
          if (text === undefined) break;
          items.push(text);
          i += 1;
        }
        flushList(items, false);
        continue;
      }
      const ordered = /^\s*\d+[.)]\s+(.*)$/.exec(line);
      if (ordered) {
        const items = [];
        while (i < lines.length) {
          const m = /^\s*\d+[.)]\s+(.*)$/.exec(at(i));
          const text = m?.[1];
          if (text === undefined) break;
          items.push(text);
          i += 1;
        }
        flushList(items, true);
        continue;
      }
      const paragraph = [];
      while (
        i < lines.length &&
        !/^\s*$/.test(at(i)) &&
        !/^(#{1,6}\s|`{3,}|~{3,}|>|(\*\*\*|---|___)\s*$|\s*[-*+]\s+|\s*\d+[.)]\s+)/.test(
          at(i)
        )
      ) {
        paragraph.push(at(i));
        i += 1;
      }
      blocks.push(`<p>${markdownInline(paragraph.join("\n"), allowHtml)}</p>`);
    }
    return blocks.join("\n");
  }

  // `[data-dx-markdown]` hosts render their own text content (or the
  // referenced source element's text) to HTML on init. Rendered hosts
  // are marked so htmx swaps never re-render rendered output.
  function initMarkdown(scope) {
    const roots =
      scope && scope instanceof Element && scope.hasAttribute("data-dx-markdown")
        ? [scope]
        : [...(scope || document).querySelectorAll("[data-dx-markdown]")];
    for (const host of roots) initMarkdownHost(host);
  }

  function initMarkdownHost(host) {
    if (!host || !(host instanceof Element)) return;
    if (host.hasAttribute("data-dx-markdown-rendered")) return;
    const allowHtml = host.hasAttribute("data-dx-markdown-allow-html");
    const selector = host.getAttribute("data-dx-markdown-source");
    const source = selector
      ? (document.querySelector(selector)?.textContent ?? "")
      : host.textContent ?? "";
    host.innerHTML = markdownRender(source, { allowHtml });
    host.setAttribute("data-dx-markdown-rendered", "");
  }

  document.querySelectorAll("[data-dx-markdown]").forEach(initMarkdown);
  document.addEventListener("htmx:afterSettle", () => {
    document.querySelectorAll("[data-dx-markdown]").forEach(initMarkdown);
  });

  window.dxMarkdown = {
    render: (source, options) => markdownRender(source, options),
  };

  /* ---------------- Chat ---------------- */

  // Non-streaming chat surface (parity with the react AIChat): the host
  // form holds a `[data-dx-chat-list]` message log (aria-live polite) and
  // a `[data-dx-chat-input]` field. Submit appends the user message and
  // dispatches `dx:chat-send` with { text }; the app answers by calling
  // `dxChat.appendMessage(host|selector, { role, text })` (or by swapping
  // markup itself). Streaming is deferred — see uikit#100.
  function chatList(host) {
    return host.querySelector("[data-dx-chat-list]");
  }

  function chatAppend(host, role, text) {
    const list = chatList(host);
    if (!list) return null;
    const item = document.createElement("div");
    item.className = `dx-chat-message dx-chat-message--${role}`;
    item.textContent = text;
    list.appendChild(item);
    return item;
  }

  function chatEnsureLive(list) {
    if (!list.hasAttribute("aria-live"))
      list.setAttribute("aria-live", "polite");
  }

  on("[data-dx-chat]", "submit", (host, e) => {
    e.preventDefault();
    const input = host.querySelector("[data-dx-chat-input]");
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    const list = chatList(host);
    if (list) chatEnsureLive(list);
    chatAppend(host, "user", text);
    input.value = "";
    host.dispatchEvent(
      new CustomEvent("dx:chat-send", {
        bubbles: true,
        detail: { text },
      })
    );
  });

  window.dxChat = {
    appendMessage(hostOrSelector, { role = "assistant", text = "" } = {}) {
      const host =
        typeof hostOrSelector === "string"
          ? document.querySelector(hostOrSelector)
          : hostOrSelector;
      if (!host || !(host instanceof Element)) return null;
      const list = chatList(host);
      if (list) chatEnsureLive(list);
      return chatAppend(host, role, text);
    },
  };

  /* ---------------- RangeNavigator ---------------- */

  // Zoom/pan window over a value domain (parity with the react
  // RangeNavigator): two slider handles bound the window inside
  // `[data-dx-range-navigator="min max"]`, with optional
  // `data-dx-range-start/end` seeding. Dragging a handle (or the window
  // body), arrow keys, Home/End all commit through one path that
  // clamps to the domain and dispatches `dx:range-change` with
  // { start, end }. Chart linkage stays consumer-side (wire the event
  // into a chart value axis).
  const boundRangeNav = new WeakSet();

  function rangeNavParse(host) {
    const parts = (host.getAttribute("data-dx-range-navigator") || "")
      .trim()
      .split(/\s+/)
      .map(Number);
    const min = parts.length > 1 && !Number.isNaN(parts[0]) ? parts[0] : 0;
    const max =
      parts.length > 1 && !Number.isNaN(parts[1]) && parts[1] > min
        ? parts[1]
        : min + 100;
    const startAttr = host.getAttribute("data-dx-range-start");
    const endAttr = host.getAttribute("data-dx-range-end");
    const start =
      startAttr != null && !Number.isNaN(Number(startAttr))
        ? Number(startAttr)
        : min;
    const end =
      endAttr != null && !Number.isNaN(Number(endAttr)) ? Number(endAttr) : max;
    return { min, max, start, end };
  }

  function rangeNavClamp(host, start, end) {
    const { min, max } = rangeNavParse(host);
    let s = Math.max(min, Math.min(max, start));
    let e = Math.max(min, Math.min(max, end));
    if (s > e) {
      const t = s;
      s = e;
      e = t;
    }
    return { start: s, end: e };
  }

  function rangeNavHandles(host) {
    return [...host.querySelectorAll("[data-dx-range-handle]")];
  }

  function rangeNavPaint(host) {
    const { min, max } = rangeNavParse(host);
    const start = Number(host.getAttribute("data-dx-range-start") ?? min);
    const end = Number(host.getAttribute("data-dx-range-end") ?? max);
    const span = max - min || 1;
    const left = ((Math.max(min, Math.min(max, start)) - min) / span) * 100;
    const width = Math.max(
      0,
      ((Math.max(min, Math.min(max, end)) - min) / span) * 100 - left
    );
    const win = host.querySelector("[data-dx-range-window]");
    if (win) {
      win.style.left = `${left}%`;
      win.style.width = `${width}%`;
    }
    const [lo, hi] = rangeNavHandles(host);
    if (lo) {
      lo.style.left = `${left}%`;
      lo.setAttribute("aria-valuenow", String(start));
    }
    if (hi) {
      hi.style.left = `${left + width}%`;
      hi.setAttribute("aria-valuenow", String(end));
    }
  }

  function rangeNavCommit(host, start, end) {
    const next = rangeNavClamp(host, start, end);
    host.setAttribute("data-dx-range-start", String(next.start));
    host.setAttribute("data-dx-range-end", String(next.end));
    rangeNavPaint(host);
    host.dispatchEvent(
      new CustomEvent("dx:range-change", {
        bubbles: true,
        detail: { start: next.start, end: next.end },
      })
    );
  }

  function rangeNavValue(host, clientX) {
    const track = host.querySelector("[data-dx-range-track]");
    const box = (track || host).getBoundingClientRect();
    const { min, max } = rangeNavParse(host);
    const frac = box.width > 0 ? (clientX - box.left) / box.width : 0;
    return min + Math.max(0, Math.min(1, frac)) * (max - min || 1);
  }

  function initRangeNav(host) {
    if (!host || !(host instanceof Element)) return;
    if (boundRangeNav.has(host)) {
      rangeNavPaint(host);
      return;
    }
    boundRangeNav.add(host);
    const { min, max, start, end } = rangeNavParse(host);
    if (host.getAttribute("data-dx-range-start") == null)
      host.setAttribute("data-dx-range-start", String(start));
    if (host.getAttribute("data-dx-range-end") == null)
      host.setAttribute("data-dx-range-end", String(end));
    if (!host.hasAttribute("role")) host.setAttribute("role", "group");
    const step = (max - min || 1) / 100;
    host.addEventListener("pointerdown", (e) => {
      const handle = e.target instanceof Element ? e.target.closest("[data-dx-range-handle]") : null;
      const track = e.target instanceof Element ? e.target.closest("[data-dx-range-track]") : null;
      if (!handle && !track) return;
      e.preventDefault();
      const which = handle ? handle.getAttribute("data-dx-range-handle") : null;
      const cur = {
        start: Number(host.getAttribute("data-dx-range-start")),
        end: Number(host.getAttribute("data-dx-range-end")),
      };
      const move = (ev) => {
        const v = rangeNavValue(host, ev.clientX);
        if (which === "start") rangeNavCommit(host, v, cur.end);
        else if (which === "end") rangeNavCommit(host, cur.start, v);
        else {
          const span = cur.end - cur.start;
          rangeNavCommit(host, v, v + span);
        }
      };
      const up = () => {
        document.removeEventListener("pointermove", move);
        document.removeEventListener("pointerup", up);
      };
      document.addEventListener("pointermove", move);
      document.addEventListener("pointerup", up);
    });
    host.addEventListener("keydown", (e) => {
      const handle = e.target instanceof Element ? e.target.closest("[data-dx-range-handle]") : null;
      if (!handle) return;
      const which = handle.getAttribute("data-dx-range-handle");
      const cur = {
        start: Number(host.getAttribute("data-dx-range-start")),
        end: Number(host.getAttribute("data-dx-range-end")),
      };
      const big = e.shiftKey ? step * 10 : step;
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        e.preventDefault();
        if (which === "start") rangeNavCommit(host, cur.start - big, cur.end);
        else rangeNavCommit(host, cur.start, cur.end - big);
      } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        e.preventDefault();
        if (which === "start") rangeNavCommit(host, cur.start + big, cur.end);
        else rangeNavCommit(host, cur.start, cur.end + big);
      } else if (e.key === "Home") {
        e.preventDefault();
        if (which === "start") rangeNavCommit(host, min, cur.end);
        else rangeNavCommit(host, cur.start, max);
      } else if (e.key === "End") {
        e.preventDefault();
        if (which === "start") rangeNavCommit(host, cur.end, cur.end);
        else rangeNavCommit(host, cur.start, max);
      }
    });
    rangeNavPaint(host);
  }

  document.querySelectorAll("[data-dx-range-navigator]").forEach(initRangeNav);
  document.addEventListener("htmx:afterSettle", () => {
    document.querySelectorAll("[data-dx-range-navigator]").forEach(initRangeNav);
  });

  window.dxRangeNav = {
    commit: (hostOrSelector, start, end) => {
      const host =
        typeof hostOrSelector === "string"
          ? document.querySelector(hostOrSelector)
          : hostOrSelector;
      if (!host || !(host instanceof Element)) return null;
      initRangeNav(host);
      rangeNavCommit(host, start, end);
      return { start, end };
    },
  };

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

  on("[data-dx-mask]", "input", (input) => {
    if (input.readOnly || input.disabled) return;
    const mask = input.getAttribute("data-dx-mask");
    if (!mask) return;
    const next = formatMask(input.value, mask);
    if (next !== input.value) input.value = next;
  });

  on("[data-dx-mask]", "keydown", (input, e) => {
    if (e.key !== "Backspace" || input.readOnly || input.disabled) return;
    const mask = input.getAttribute("data-dx-mask");
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
    const root = input.closest("[data-dx-numeric]");
    return {
      root,
      min: root && root.hasAttribute("data-dx-min") ? Number(root.getAttribute("data-dx-min")) : undefined,
      max: root && root.hasAttribute("data-dx-max") ? Number(root.getAttribute("data-dx-max")) : undefined,
      step: root && root.hasAttribute("data-dx-step") ? Number(root.getAttribute("data-dx-step")) : 1,
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

  on("[data-dx-numeric-up]", "click", (button) => {
    if (button.disabled) return;
    const input = button.closest("[data-dx-numeric]")?.querySelector("[data-dx-numeric-input]");
    if (input && !input.disabled) numericStep(input, 1);
  });

  on("[data-dx-numeric-down]", "click", (button) => {
    if (button.disabled) return;
    const input = button.closest("[data-dx-numeric]")?.querySelector("[data-dx-numeric-input]");
    if (input && !input.disabled) numericStep(input, -1);
  });

  on("[data-dx-numeric-input]", "input", (input) => {
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

  on("[data-dx-numeric-input]", "keydown", (input, e) => {
    if (input.disabled) return;
    if (e.key === "ArrowUp") {
      e.preventDefault();
      numericStep(input, 1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      numericStep(input, -1);
    }
  });

  on("[data-dx-numeric-input]", "blur", (input) => {
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

  // [data-dx-form] gates the native submit on field validity. Fields are
  // [data-dx-field] elements. Rules are declared as data-dx-* attributes
  // (data-dx-required, data-dx-email, data-dx-pattern, data-dx-min,
  // data-dx-max, data-dx-minlength, data-dx-maxlength); messages come
  // from data-dx-<rule>-message, data-dx-error-message, or defaults.
  // Native constraints (required/min/max/minlength/maxlength/pattern/
  // type=email/number) are respected via the validity API. Empty values
  // pass every rule except required. Invalid fields get
  // aria-invalid="true" + data-dx-invalid, their messages are written
  // into a sibling/closest [data-dx-field-error] (aria-live=polite) and
  // the error id is merged into the control's aria-describedby (existing
  // hint ids preserved); a blocked submit dispatches dx:invalid; a valid
  // submit dispatches dx:submit with the serialized FormData and proceeds
  // natively. Messages are read back for error rendering via dx:invalid
  // detail / fieldMessages. Editing a field clears its invalid state
  // (re-evaluated on the next submit).

  const RULE_CHECKS = {
    required: (input) => input.value.trim() !== "",
    email: (input) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim()),
    pattern: (input) => new RegExp(input.getAttribute("data-dx-pattern")).test(input.value),
    min: (input) => Number(input.value) >= Number(input.getAttribute("data-dx-min")),
    max: (input) => Number(input.value) <= Number(input.getAttribute("data-dx-max")),
    minlength: (input) => input.value.length >= Number(input.getAttribute("data-dx-minlength")),
    maxlength: (input) => input.value.length <= Number(input.getAttribute("data-dx-maxlength")),
  };

  const RULE_MESSAGES = {
    required: () => "Required",
    email: () => "Invalid email",
    pattern: () => "Invalid format",
    min: (input) => `Minimum ${input.getAttribute("data-dx-min")}`,
    max: (input) => `Maximum ${input.getAttribute("data-dx-max")}`,
    minlength: (input) => `Minimum ${input.getAttribute("data-dx-minlength")} characters`,
    maxlength: (input) => `Maximum ${input.getAttribute("data-dx-maxlength")} characters`,
  };

  const NATIVE_CONSTRAINTS =
    "[required], [min], [max], [minlength], [maxlength], [pattern], [type='email'], [type='number']";

  const fieldMessages = new WeakMap();

  function errorTarget(input) {
    const wrapper = input.closest(".dx-field");
    const inWrapper = wrapper && wrapper.querySelector("[data-dx-field-error]");
    if (inWrapper) return inWrapper;
    const next = input.nextElementSibling;
    return next && next.matches("[data-dx-field-error]") ? next : null;
  }

  function setDescribedBy(input, errorId) {
    if (input._dxDescribedBy === undefined) {
      input._dxDescribedBy = input.getAttribute("aria-describedby") || "";
    }
    if (errorId) {
      input.setAttribute(
        "aria-describedby",
        [input._dxDescribedBy, errorId].filter(Boolean).join(" "),
      );
    } else if (input._dxDescribedBy) {
      input.setAttribute("aria-describedby", input._dxDescribedBy);
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
    input.toggleAttribute("data-dx-invalid", invalid);
    return invalid;
  }

  function validateField(input) {
    const messages = [];
    for (const [rule, check] of Object.entries(RULE_CHECKS)) {
      if (!input.hasAttribute(`data-dx-${rule}`)) continue;
      const value = String(input.value ?? "");
      if (rule !== "required" && value.trim() === "") continue;
      if (check(input)) continue;
      messages.push(
        input.getAttribute(`data-dx-${rule}-message`) ||
          input.getAttribute("data-dx-error-message") ||
          RULE_MESSAGES[rule](input),
      );
    }
    if (messages.length === 0 && input.matches(NATIVE_CONSTRAINTS) && !input.validity.valid) {
      messages.push(input.validationMessage || "Invalid value");
    }
    return renderFieldState(input, messages);
  }

  on("[data-dx-field]", "input", (input) => {
    if (!input.hasAttribute("data-dx-invalid")) return;
    input.removeAttribute("data-dx-invalid");
    input.removeAttribute("aria-invalid");
    fieldMessages.delete(input);
    const target = errorTarget(input);
    if (target) target.textContent = "";
    setDescribedBy(input, null);
  });

  on("[data-dx-form]", "submit", (form, e) => {
    const fields = [...form.querySelectorAll("[data-dx-field]")].filter((f) => !f.disabled);
    const invalid = fields.filter(validateField);
    if (invalid.length === 0) {
      form.dispatchEvent(
        new CustomEvent("dx:submit", {
          bubbles: true,
          detail: { form, data: new FormData(form) },
        }),
      );
      return;
    }
    e.preventDefault();
    form.dispatchEvent(
      new CustomEvent("dx:invalid", {
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

  on("[data-dx-togglebutton]", "click", (button) => {
    if (button.disabled) return;
    const pressed = button.getAttribute("aria-pressed") === "true";
    button.setAttribute("aria-pressed", String(!pressed));
    button.classList.toggle("dx-togglebutton--pressed", !pressed);
  });

  /* ---------------- Selectbar ---------------- */

  on("[data-dx-selectbar-option]", "click", (option) => {
    if (option.disabled) return;
    const group = option.closest("[data-dx-selectbar]");
    if (!group) return;
    const value = option.getAttribute("data-dx-selectbar-value");
    group.querySelectorAll("[data-dx-selectbar-option]").forEach((o) => {
      const active = o === option;
      o.classList.toggle("dx-selectbar__option--selected", active);
      o.setAttribute("aria-pressed", String(active));
    });
    group.dispatchEvent(
      new CustomEvent("dx:selectbar-change", { bubbles: true, detail: { value } }),
    );
  });

  /* ---------------- Listbox ---------------- */

  const listboxState = new WeakMap();

  function listboxOptions(root) {
    return [...root.querySelectorAll("[data-dx-listbox-option]")];
  }

  function listboxEnabled(root) {
    return listboxOptions(root).filter(
      (o) => !o.hasAttribute("aria-disabled") && !o.classList.contains("dx-listbox__option--disabled"),
    );
  }

  function listboxIsMultiple(root) {
    return root.hasAttribute("data-dx-listbox-multiple");
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
    enabled.forEach((o) => o.classList.toggle("dx-listbox__option--active", o === active));
  }

  function listboxSelectedValues(root) {
    return listboxOptions(root)
      .filter((o) => o.getAttribute("aria-selected") === "true")
      .map((o) => o.getAttribute("data-dx-listbox-value"));
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
      new CustomEvent("dx:listbox-change", {
        bubbles: true,
        detail: listboxIsMultiple(root) ? { values } : { value: values[0] ?? null },
      }),
    );
  }

  function listboxToggle(root, option) {
    const selected = option.getAttribute("aria-selected") === "true";
    const next = !selected;
    option.setAttribute("aria-selected", String(next));
    option.classList.toggle("dx-listbox__option--selected", next);
    if (!listboxIsMultiple(root)) {
      listboxOptions(root).forEach((o) => {
        if (o !== option) {
          o.setAttribute("aria-selected", "false");
          o.classList.remove("dx-listbox__option--selected");
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

  on("[data-dx-listbox]", "keydown", (root, e) => {
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

  on("[data-dx-listbox-option]", "click", (option, e) => {
    const root = option.closest("[data-dx-listbox]");
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
      const trigger = root.querySelector("[data-dx-dropdown-trigger]");
      const menu = root.querySelector("[data-dx-dropdown-menu]");
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
    return [...root.querySelectorAll("[data-dx-dropdown-option]")];
  }

  function dropdownEnabled(root) {
    return dropdownOptions(root).filter(
      (o) => !o.hasAttribute("aria-disabled") && !o.classList.contains("dx-dropdown__option--disabled"),
    );
  }

  function dropdownSetOpen(root, open) {
    const { trigger, menu } = dropdownData(root);
    if (!trigger || !menu) return;
    root.classList.toggle("dx-dropdown--open", open);
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
    enabled.forEach((o) => o.classList.toggle("dx-dropdown__option--active", o === active));
  }

  function dropdownSelect(root, option) {
    const state = dropdownData(root);
    const all = dropdownOptions(root);
    const label = option.textContent.trim();
    const value = option.getAttribute("data-dx-dropdown-value");
    state.selectedIndex = all.indexOf(option);
    dropdownOptions(root).forEach((o) => {
      const selected = o === option;
      o.setAttribute("aria-selected", String(selected));
      o.classList.toggle("dx-dropdown__option--selected", selected);
    });
    if (state.trigger) {
      const span = state.trigger.querySelector(".dx-dropdown__placeholder, .dx-dropdown__label");
      if (span) {
        span.textContent = label;
        span.classList.remove("dx-dropdown__placeholder");
        span.classList.add("dx-dropdown__label");
      }
    }
    dropdownSetOpen(root, false);
    state.trigger?.focus();
    root.dispatchEvent(
      new CustomEvent("dx:dropdown-change", { bubbles: true, detail: { value } }),
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

  on("[data-dx-dropdown-trigger]", "click", (trigger) => {
    if (trigger.disabled) return;
    const root = trigger.closest("[data-dx-dropdown]");
    if (!root) return;
    const { menu } = dropdownData(root);
    dropdownSetOpen(root, menu.hidden);
  });

  on("[data-dx-dropdown]", "keydown", (root, e) => {
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

  on("[data-dx-dropdown-option]", "click", (option) => {
    if (option.hasAttribute("aria-disabled")) return;
    const root = option.closest("[data-dx-dropdown]");
    if (!root) return;
    dropdownSelect(root, option);
  });

  document.addEventListener("mousedown", (e) => {
    const target = e.target instanceof Element ? e.target : null;
    if (!target) return;
    document.querySelectorAll("[data-dx-dropdown].dx-dropdown--open").forEach((root) => {
      if (!root.contains(target)) dropdownSetOpen(root, false);
    });
    document.querySelectorAll("[data-dx-splitbutton] .dx-splitbutton__menu:not([hidden])").forEach((menu) => {
      const root = menu.closest("[data-dx-splitbutton]");
      if (root && !root.contains(target)) splitbuttonSetOpen(root, false);
    });
  });

  /* ---------------- Autocomplete ---------------- */

  const autocompleteState = new WeakMap();

  function autocompleteData(root) {
    let state = autocompleteState.get(root);
    if (!state) {
      const input = root.querySelector("[data-dx-autocomplete-input]");
      const menu = root.querySelector("[data-dx-autocomplete-menu]");
      const clear = root.querySelector("[data-dx-autocomplete-clear]");
      state = { input, menu, clear, activeIndex: -1 };
      autocompleteState.set(root, state);
    }
    return state;
  }

  function autocompleteOptions(root) {
    return [...root.querySelectorAll("[data-dx-autocomplete-option]")];
  }

  function autocompleteEnabled(root) {
    return autocompleteOptions(root).filter(
      (o) => !o.hasAttribute("aria-disabled") && !o.classList.contains("dx-autocomplete__option--disabled"),
    );
  }

  function autocompleteFiltered(root) {
    const state = autocompleteData(root);
    const query = (state.input?.value ?? "").trim().toLowerCase();
    return query === ""
      ? autocompleteEnabled(root)
      : autocompleteEnabled(root).filter((o) =>
          (o.getAttribute("data-dx-autocomplete-label") ?? "").toLowerCase().includes(query),
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
    const empty = menu.querySelector("[data-dx-autocomplete-empty]");
    if (empty) empty.hidden = filtered.length > 0;
    if (state.activeIndex >= filtered.length) state.activeIndex = -1;
    const visible = filtered.length > 0 || (empty && !empty.hidden);
    menu.hidden = !visible;
    if (clear) clear.hidden = input.value === "";
    input.setAttribute("aria-expanded", String(!menu.hidden));
    const active = filtered[state.activeIndex];
    input.setAttribute("aria-activedescendant", active ? active.id : "");
    filtered.forEach((o) => o.classList.toggle("dx-autocomplete__option--active", o === active));
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
    const value = option.getAttribute("data-dx-autocomplete-value");
    const label = option.getAttribute("data-dx-autocomplete-label") ?? option.textContent.trim();
    if (state.input) {
      state.input.value = label;
      state.input.setAttribute("aria-activedescendant", "");
    }
    if (state.clear) state.clear.hidden = true;
    if (state.menu) state.menu.hidden = true;
    state.activeIndex = -1;
    root.dispatchEvent(
      new CustomEvent("dx:autocomplete-select", {
        bubbles: true,
        detail: { value, label },
      }),
    );
  }

  on("[data-dx-autocomplete-input]", "input", (input) => {
    if (input.disabled) return;
    const root = input.closest("[data-dx-autocomplete]");
    if (!root) return;
    const state = autocompleteData(root);
    state.activeIndex = -1;
    autocompleteRender(root);
  });

  on("[data-dx-autocomplete-input]", "keydown", (input, e) => {
    const root = input.closest("[data-dx-autocomplete]");
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

  on("[data-dx-autocomplete-option]", "click", (option) => {
    if (option.hasAttribute("aria-disabled")) return;
    const root = option.closest("[data-dx-autocomplete]");
    if (!root) return;
    autocompleteSelect(root, option);
  });

  on("[data-dx-autocomplete-clear]", "click", (clear) => {
    const root = clear.closest("[data-dx-autocomplete]");
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
      const caret = root.querySelector("[data-dx-splitbutton-caret]");
      const menu = root.querySelector("[data-dx-splitbutton-menu]");
      state = { caret, menu, activeIndex: -1 };
      splitbuttonState.set(root, state);
    }
    return state;
  }

  function splitbuttonItems(root) {
    return [...root.querySelectorAll("[data-dx-splitbutton-item]")];
  }

  function splitbuttonEnabled(root) {
    return splitbuttonItems(root).filter(
      (o) => !o.hasAttribute("aria-disabled") && !o.classList.contains("dx-splitbutton__item--disabled"),
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
    enabled.forEach((o) => o.classList.toggle("dx-splitbutton__item--active", o === active));
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
    const key = item.getAttribute("data-dx-splitbutton-action");
    splitbuttonSetOpen(root, false);
    state.caret?.focus();
    root.dispatchEvent(
      new CustomEvent("dx:splitbutton-activate", { bubbles: true, detail: { key } }),
    );
  }

  on("[data-dx-splitbutton-caret]", "click", (caret) => {
    if (caret.disabled) return;
    const root = caret.closest("[data-dx-splitbutton]");
    if (!root) return;
    const { menu } = splitbuttonData(root);
    splitbuttonSetOpen(root, menu.hidden);
  });

  on("[data-dx-splitbutton]", "keydown", (root, e) => {
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

  on("[data-dx-splitbutton-item]", "click", (item) => {
    if (item.hasAttribute("aria-disabled")) return;
    const root = item.closest("[data-dx-splitbutton]");
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
      const parsed = JSON.parse(root.dataset.dxDatafilterProperties ?? "[]");
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
    const propertySelect = row.querySelector("[data-dx-datafilter-property]");
    const operatorSelect = row.querySelector("[data-dx-datafilter-operator]");
    const valueEl = row.querySelector("[data-dx-datafilter-value]");
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
    editor.setAttribute("data-dx-datafilter-value", "");
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
    const logicalOperator = root.dataset.dxDatafilterOperator === "Or" ? "Or" : "And";
    const filters = [];
    root.querySelectorAll("[data-dx-datafilter-row]").forEach((row) => {
      const property = row.querySelector("[data-dx-datafilter-property]")?.value ?? "";
      const operator = row.querySelector("[data-dx-datafilter-operator]")?.value ?? "";
      const valueEl = row.querySelector("[data-dx-datafilter-value]");
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
    const output = root.querySelector("[data-dx-datafilter-output]");
    if (output) output.value = JSON.stringify(filters);
    root.dispatchEvent(
      new CustomEvent("dx:filter-change", { bubbles: true, detail }),
    );
  }

  on("[data-dx-datafilter]", "change", (root, e) => {
    const target = e.target;
    if (target.matches("[data-dx-datafilter-operator-bar] input[type=radio]")) {
      root.dataset.dxDatafilterOperator = target.value;
      announceFilters(root);
      return;
    }
    if (target.matches("[data-dx-datafilter-property]")) {
      renderRowEditor(target.closest("[data-dx-datafilter-row]"), parseProperties(root));
      announceFilters(root);
      return;
    }
    if (target.matches("[data-dx-datafilter-value], [data-dx-datafilter-operator]")) {
      announceFilters(root);
    }
  });

  on("[data-dx-datafilter]", "click", (root, e) => {
    const add = e.target.closest("[data-dx-datafilter-add]");
    const remove = e.target.closest("[data-dx-datafilter-remove]");
    if (remove) {
      const rows = [...root.querySelectorAll("[data-dx-datafilter-row]")];
      if (rows.length > 1) {
        remove.closest("[data-dx-datafilter-row]").remove();
        announceFilters(root);
      }
      return;
    }
    if (!add) return;
    const template = root.querySelector("[data-dx-datafilter-row]");
    if (!template) return;
    const clone = template.cloneNode(true);
    const propertySelect = clone.querySelector("[data-dx-datafilter-property]");
    if (propertySelect) propertySelect.value = template.querySelector("[data-dx-datafilter-property]")?.value ?? "";
    const valueEl = clone.querySelector("[data-dx-datafilter-value]");
    if (valueEl) valueEl.value = "";
    root.querySelector("[data-dx-datafilter-rows]").appendChild(clone);
    renderRowEditor(clone, parseProperties(root));
    clone.querySelector("[data-dx-datafilter-property]")?.focus();
    announceFilters(root);
  });

  function initDataFilter(root) {
    const properties = parseProperties(root);
    root.querySelectorAll("[data-dx-datafilter-property]").forEach((select) => {
      fillSelect(
        select,
        properties.map((p) => ({ value: p.name, label: p.title ?? p.name })),
        select.value || properties[0]?.name,
      );
    });
    root.querySelectorAll("[data-dx-datafilter-row]").forEach((row) => renderRowEditor(row, properties));
  }

  document.querySelectorAll("[data-dx-datafilter]").forEach(initDataFilter);

  /* ---------------- DataGrid ---------------- */

  const gridState = new WeakMap();

  function parseGridColumns(root) {
    try {
      const parsed = JSON.parse(root.dataset.dxDatagridProperties ?? "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function gridSortable(root, column) {
    return column.sortable ?? root.hasAttribute("data-dx-datagrid-sortable");
  }

  function gridFilterable(root, column) {
    return column.filterable ?? root.hasAttribute("data-dx-datagrid-filterable");
  }

  function defaultGridState(root) {
    const pageSize = Number(root.dataset.dxDatagridPagesize ?? "10");
    const columns = parseGridColumns(root);
    return {
      sorts: [],
      filters: new Map(),
      pageNumber: 1,
      pageSize: Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 10,
      logicalOperator: "And",
      caseSensitivity: root.hasAttribute("data-dx-datagrid-case-sensitive") ? "CaseSensitive" : "CaseInsensitive",
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
    return root.hasAttribute("data-dx-datagrid-edit") || root.hasAttribute("data-dx-datagrid-delete") || root.hasAttribute("data-dx-datagrid-create");
  }

  function gridRowValues(row) {
    try {
      return JSON.parse(row.dataset.dxRowValue ?? "{}") ?? {};
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
    const head = root.querySelector("[data-dx-datagrid-head]");
    if (!head) return;
    const effective = gridEffectiveColumns(state, columns);
    const sortable = effective.some((e) => gridSortable(root, e.column));
    const filterable = effective.some((e) => gridFilterable(root, e.column));
    const cols = root.querySelector("[data-dx-datagrid-cols]");
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
      th.setAttribute("data-dx-grid-col", key);
      if (column.width) th.style.width = column.width;
      if (column.align === "center") th.classList.add("dx-datagrid-cell--center");
      if (column.align === "right") th.classList.add("dx-datagrid-cell--right");
      if (column.frozen) {
        th.classList.add("dx-datagrid-cell--frozen");
        th.style.left = frozenTotal === 0 ? "0px" : `${frozenTotal}px`;
        const width = state.widths[key] ?? column.width ?? "6rem";
        frozenTotal += parseFloat(width);
      }
      if (root.hasAttribute("data-dx-datagrid-reorder")) {
        th.draggable = true;
        th.setAttribute("data-dx-grid-reorder-src", key);
      }
      const canSort = gridSortable(root, column);
      if (canSort) {
        const sort = state.sorts.find((s) => s.property === column.property);
        const button = document.createElement("button");
        button.type = "button";
        button.className = "dx-datagrid-sort";
        button.setAttribute("data-dx-grid-sort", column.property);
        button.textContent = column.title ?? column.property;
        const indicator = document.createElement("span");
        indicator.className = "dx-datagrid-sort-indicator";
        indicator.setAttribute("data-dx-grid-sort-indicator", "");
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
      if (root.hasAttribute("data-dx-datagrid-resize")) {
        const handle = document.createElement("span");
        handle.className = "dx-datagrid-resize-handle";
        handle.setAttribute("data-dx-grid-resize", key);
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
      td.className = "dx-datagrid-filter-cell";
      if (!gridFilterable(root, column)) {
        filterRow.append(td);
        return;
      }
      const select = document.createElement("select");
      select.className = "dx-datagrid-filter-select";
      select.setAttribute("data-dx-grid-filter-op", column.property);
      const opLabel = document.createElement("label");
      opLabel.className = "dx-visually-hidden";
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
      input.className = "dx-datagrid-filter-input";
      input.setAttribute("data-dx-grid-filter-value", column.property);
      input.placeholder = `Filter ${column.title ?? column.property}`;
      const valueLabel = document.createElement("label");
      valueLabel.className = "dx-visually-hidden";
      valueLabel.textContent = `${column.title ?? column.property} value`;
      td.append(opLabel, select, valueLabel, input);
      filterRow.append(td);
    });
    head.append(filterRow);
  }

  function renderGridPager(root, view) {
    const container = root.querySelector("[data-dx-datagrid-pager]");
    if (!container) return;
    const { pageNumber, pageSize, pageCount, total } = view;
    const summary = document.createElement("span");
    summary.className = "dx-datagrid-pager-summary";
    summary.textContent = `Page ${pageNumber} of ${pageCount} (${total} records)`;
    const controls = document.createElement("div");
    controls.className = "dx-datagrid-pager-controls";
    const prev = document.createElement("button");
    prev.type = "button";
    prev.className = "dx-datagrid-pager-button";
    prev.textContent = "‹";
    prev.setAttribute("aria-label", "Previous page");
    prev.disabled = pageNumber <= 1;
    prev.setAttribute("data-dx-grid-page", String(pageNumber - 1));
    const max = Number(root.dataset.dxDatagridPagenumbers ?? "5");
    const items = gridPageItems(pageNumber, pageCount, max);
    const next = document.createElement("button");
    next.type = "button";
    next.className = "dx-datagrid-pager-button";
    next.textContent = "›";
    next.setAttribute("aria-label", "Next page");
    next.disabled = pageNumber >= pageCount;
    next.setAttribute("data-dx-grid-page", String(pageNumber + 1));
    controls.append(prev);
    items.forEach((item) => {
      if (item === "ellipsis") {
        const span = document.createElement("span");
        span.className = "dx-datagrid-pager-ellipsis";
        span.setAttribute("aria-hidden", "true");
        span.textContent = "…";
        controls.append(span);
        return;
      }
      const button = document.createElement("button");
      button.type = "button";
      button.className = "dx-datagrid-pager-button" + (item === pageNumber ? " dx-datagrid-pager-button--active" : "");
      button.textContent = String(item);
      if (item === pageNumber) button.setAttribute("aria-current", "page");
      button.setAttribute("data-dx-grid-page", String(item));
      controls.append(button);
    });
    controls.append(next);
    container.replaceChildren(summary, controls);
    const sizes = root.dataset.dxDatagridPagesizeOptions;
    if (sizes) {
      try {
        const options = JSON.parse(sizes);
        const label = document.createElement("label");
        label.className = "dx-datagrid-pager-size";
        label.textContent = "Items per page";
        const select = document.createElement("select");
        select.setAttribute("data-dx-grid-page-size", "");
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
    const toolbar = root.querySelector("[data-dx-datagrid-toolbar]");
    if (!toolbar) return;
    const state = gridState.get(root);
    const parts = [];
    if (root.hasAttribute("data-dx-datagrid-groupable")) {
      const panel = document.createElement("div");
      panel.className = "dx-datagrid-group-panel" + (state.groupBy ? " dx-datagrid-group-panel--active" : "");
      panel.setAttribute("data-dx-grid-group-panel", "");
      if (state.groupBy) {
        const column = columns.find((c) => c.property === state.groupBy);
        const chip = document.createElement("span");
        chip.className = "dx-datagrid-group-chip";
        const clear = document.createElement("button");
        clear.type = "button";
        clear.className = "dx-datagrid-group-clear";
        clear.setAttribute("data-dx-grid-group-clear", "");
        clear.setAttribute("aria-label", `Remove group by ${column?.title ?? state.groupBy}`);
        clear.textContent = "×";
        chip.append(`${column?.title ?? state.groupBy}: `);
        chip.append(clear);
        panel.append(chip);
      } else {
        const hint = document.createElement("span");
        hint.className = "dx-datagrid-group-hint";
        hint.textContent = root.dataset.dxDatagridGroupText ?? "Drag a column header here to group";
        panel.append(hint);
      }
      parts.push(panel);
    }
    if (root.hasAttribute("data-dx-datagrid-create")) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "dx-datagrid-picker-button";
      button.setAttribute("data-dx-grid-row-create", "");
      button.textContent = root.dataset.dxDatagridCreateText ?? "Add row";
      parts.push(button);
    }
    if (root.hasAttribute("data-dx-datagrid-column-picker")) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "dx-datagrid-picker-button";
      button.setAttribute("data-dx-grid-picker-toggle", "");
      button.setAttribute("aria-haspopup", "menu");
      button.setAttribute("aria-expanded", String(state.pickerOpen));
      button.textContent = root.dataset.dxDatagridPickerText ?? "Columns";
      const panel = document.createElement("div");
      panel.className = "dx-datagrid-picker-panel";
      panel.setAttribute("data-dx-grid-picker-panel", "");
      panel.hidden = !state.pickerOpen;
      panel.setAttribute("role", "menu");
      columns.forEach((column, i) => {
        const key = gridColumnKey(column, i);
        const label = document.createElement("label");
        label.className = "dx-datagrid-picker-item";
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.setAttribute("data-dx-grid-picker-item", key);
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
    const tbody = root.querySelector("[data-dx-datagrid-rows]");
    if (!tbody) return;
    tbody.querySelectorAll("[data-dx-row]").forEach((row) => {
      const cells = row.querySelectorAll("td");
      let running = 0;
      effective.forEach(({ key, column }, i) => {
        const td = cells[i];
        if (!td) return;
        td.classList.toggle("dx-datagrid-cell--frozen", Boolean(column.frozen));
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
    const mode = root.dataset.dxDatagridSelect;
    if (mode !== "single" && mode !== "multiple") return;
    const key = row.dataset.dxRowKey ?? String([...row.parentElement.children].indexOf(row));
    const state = gridState.get(root);
    const wasSelected = state.selected.includes(key);
    let selected = state.selected.filter((k) => k !== key);
    if (toggle && !wasSelected) {
      if (mode === "single") selected = [key];
      else selected.push(key);
    }
    state.selected = selected;
    row.setAttribute("aria-selected", String(selected.includes(key)));
    row.classList.toggle("dx-datagrid-row--selected", selected.includes(key));
    root.dispatchEvent(new CustomEvent("dx:grid-select", { bubbles: true, detail: { keys: selected } }));
  }

  function gridResizeStart(root, handle, e) {
    const key = handle.getAttribute("data-dx-grid-resize");
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
      const col = root.querySelector(`[data-dx-datagrid-cols] col:nth-child(${index + 1})`);
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
    root.querySelectorAll("[data-dx-row]").forEach((row) => {
      if (row.querySelector("[data-dx-grid-command]")) return;
      const td = document.createElement("td");
      td.setAttribute("data-dx-grid-command", "");
      td.className = "dx-datagrid-command-cell";
      if (editing && row.dataset.dxRowKey === state.editKey) {
        td.append(gridButton("Save", "data-dx-grid-row-save"), gridButton("Cancel", "data-dx-grid-row-cancel"));
      } else {
        if (root.hasAttribute("data-dx-datagrid-edit")) td.append(gridButton("Edit", "data-dx-grid-row-edit"));
        if (root.hasAttribute("data-dx-datagrid-delete")) td.append(gridButton("Delete", "data-dx-grid-row-delete"));
      }
      row.append(td);
    });
    void effective;
  }

  function gridButton(text, attr) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "dx-datagrid-command-button";
    button.setAttribute(attr, "");
    button.textContent = text;
    return button;
  }

  function gridStartEdit(root, row) {
    const state = gridState.get(root);
    if (state.editKey != null) return;
    const columns = parseGridColumns(root);
    const values = gridRowValues(row);
    state.editKey = row.dataset.dxRowKey;
    state.edits = { row, original: values, cells: [] };
    const effective = gridEffectiveColumns(state, columns);
    effective.forEach(({ column }) => {
      const td = row.querySelector(`[data-dx-col="${column.property}"]`);
      if (!td || !column.property) return;
      state.edits.cells.push({ td, text: td.textContent, className: td.className });
      td.replaceChildren();
      const input = document.createElement("input");
      input.className = "dx-datagrid-edit-input";
      input.setAttribute("data-dx-grid-edit-input", column.property);
      input.type = column.type === "number" ? "number" : column.type === "boolean" ? "checkbox" : "text";
      if (column.type === "boolean") input.checked = Boolean(values[column.property]);
      else input.value = String(values[column.property] ?? "");
      td.append(input);
    });
    row.classList.add("dx-datagrid-row--editing");
    const command = row.querySelector("[data-dx-grid-command]");
    if (command) command.replaceChildren(gridButton("Save", "data-dx-grid-row-save"), gridButton("Cancel", "data-dx-grid-row-cancel"));
  }

  function gridRestoreRow(root) {
    const state = gridState.get(root);
    if (!state.edits) return;
    state.edits.cells.forEach(({ td, text, className }) => {
      td.replaceChildren(document.createTextNode(text));
      td.className = className;
    });
    state.edits.row.classList.remove("dx-datagrid-row--editing");
    const command = state.edits.row.querySelector("[data-dx-grid-command]");
    if (command) {
      const parts = [];
      if (root.hasAttribute("data-dx-datagrid-edit")) parts.push(gridButton("Edit", "data-dx-grid-row-edit"));
      if (root.hasAttribute("data-dx-datagrid-delete")) parts.push(gridButton("Delete", "data-dx-grid-row-delete"));
      command.replaceChildren(...parts);
    }
    state.editKey = null;
    state.edits = null;
  }

  function gridSaveEdit(root) {
    const state = gridState.get(root);
    if (!state.edits) return;
    const updated = { ...state.edits.original };
    state.edits.row.querySelectorAll("[data-dx-grid-edit-input]").forEach((input) => {
      const property = input.getAttribute("data-dx-grid-edit-input");
      updated[property] = input.type === "checkbox" ? input.checked : input.value;
    });
    root.dispatchEvent(new CustomEvent("dx:grid-row-update", { bubbles: true, detail: { original: state.edits.original, updated } }));
    gridRestoreRow(root);
  }

  function gridDeleteRow(root, row) {
    const values = gridRowValues(row);
    root.dispatchEvent(new CustomEvent("dx:grid-row-delete", { bubbles: true, detail: { row: values } }));
    row.remove();
    gridApplyView(root);
  }

  function gridStartCreate(root) {
    const state = gridState.get(root);
    if (state.editKey != null) return;
    const columns = parseGridColumns(root);
    const tbody = root.querySelector("[data-dx-datagrid-rows]");
    if (!tbody || tbody.querySelector("[data-dx-grid-new-row]")) return;
    state.editKey = "__new__";
    state.edits = { row: null, original: {}, cells: [] };
    const tr = document.createElement("tr");
    tr.setAttribute("data-dx-grid-new-row", "");
    tr.className = "dx-datagrid-row--editing";
    gridEffectiveColumns(state, columns).forEach(({ column }) => {
      const td = document.createElement("td");
      const input = document.createElement("input");
      input.className = "dx-datagrid-edit-input";
      input.setAttribute("data-dx-grid-edit-input", column.property);
      input.type = column.type === "number" ? "number" : column.type === "boolean" ? "checkbox" : "text";
      if (column.type === "boolean") input.checked = false;
      td.append(input);
      tr.append(td);
    });
    if (gridShowCommandColumn(root)) {
      const td = document.createElement("td");
      td.setAttribute("data-dx-grid-command", "");
      td.className = "dx-datagrid-command-cell";
      td.append(gridButton("Save", "data-dx-grid-row-create-save"), gridButton("Cancel", "data-dx-grid-row-create-cancel"));
      tr.append(td);
    }
    tbody.prepend(tr);
  }

  function gridSaveCreate(root) {
    const state = gridState.get(root);
    const newRow = root.querySelector("[data-dx-grid-new-row]");
    if (!newRow) return;
    const row = {};
    newRow.querySelectorAll("[data-dx-grid-edit-input]").forEach((input) => {
      const property = input.getAttribute("data-dx-grid-edit-input");
      row[property] = input.type === "checkbox" ? input.checked : input.value;
    });
    root.dispatchEvent(new CustomEvent("dx:grid-row-create", { bubbles: true, detail: { row } }));
    newRow.remove();
    state.editKey = null;
    state.edits = null;
    gridApplyView(root);
  }

  function gridApplyView(root) {
    const state = gridState.get(root);
    const columns = parseGridColumns(root);
    const rows = [...root.querySelectorAll("[data-dx-row]")];
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
    const tbody = root.querySelector("[data-dx-datagrid-rows]");
    if (tbody) {
      gridEnsureCommandCells(root, columns);
      const fragment = [];
      const newRow = tbody.querySelector("[data-dx-grid-new-row]");
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
          header.className = "dx-datagrid-group-row";
          const td = document.createElement("td");
          td.colSpan = colSpan;
          td.className = "dx-datagrid-group-cell";
          const button = document.createElement("button");
          button.type = "button";
          button.className = "dx-datagrid-group-toggle";
          button.setAttribute("data-dx-grid-group-toggle", key);
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
        const currentOrder = [...tbody.querySelectorAll("[data-dx-row]")];
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
    const empty = root.querySelector("[data-dx-datagrid-empty]");
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
    root.dispatchEvent(new CustomEvent("dx:grid-change", { bubbles: true, detail }));
  }

  on("[data-dx-datagrid]", "click", (root, e) => {
    const sortButton = e.target.closest("[data-dx-grid-sort]");
    if (sortButton) {
      const state = gridState.get(root);
      if (!state) return;
      const property = sortButton.getAttribute("data-dx-grid-sort");
      const current = state.sorts.find((s) => s.property === property);
      const next = current
        ? current.sortOrder === "Ascending"
          ? "Descending"
          : null
        : "Ascending";
      const without = state.sorts.filter((s) => s.property !== property);
      state.sorts = next == null ? without : [...(root.hasAttribute("data-dx-datagrid-multisort") ? without : []), { property, sortOrder: next }];
      renderGridHeader(root, parseGridColumns(root));
      gridApplyView(root);
      root.dispatchEvent(new CustomEvent("dx:grid-sort", { bubbles: true, detail: { property, sortOrder: next } }));
      return;
    }
    const page = e.target.closest("[data-dx-grid-page]");
    if (page) {
      const state = gridState.get(root);
      if (!state) return;
      state.pageNumber = Number(page.getAttribute("data-dx-grid-page"));
      gridApplyView(root);
      root.dispatchEvent(new CustomEvent("dx:grid-page", { bubbles: true, detail: { pageNumber: state.pageNumber } }));
      return;
    }
    const pickerToggle = e.target.closest("[data-dx-grid-picker-toggle]");
    if (pickerToggle) {
      const state = gridState.get(root);
      if (!state) return;
      state.pickerOpen = !state.pickerOpen;
      renderGridPicker(root, parseGridColumns(root));
      return;
    }
    const pickerPanel = e.target.closest("[data-dx-grid-picker-panel]");
    if (pickerPanel && e.target.closest("[data-dx-grid-picker-item]")) {
      return;
    }
    const groupToggle = e.target.closest("[data-dx-grid-group-toggle]");
    if (groupToggle) {
      const state = gridState.get(root);
      if (!state) return;
      const key = groupToggle.getAttribute("data-dx-grid-group-toggle");
      if (state.expanded.has(key)) state.expanded.delete(key);
      else state.expanded.add(key);
      gridApplyView(root);
      return;
    }
    const groupClear = e.target.closest("[data-dx-grid-group-clear]");
    if (groupClear) {
      const state = gridState.get(root);
      if (!state) return;
      state.groupBy = null;
      state.expanded = new Set();
      renderGridHeader(root, parseGridColumns(root));
      renderGridPicker(root, parseGridColumns(root));
      gridApplyView(root);
      root.dispatchEvent(new CustomEvent("dx:grid-group-change", { bubbles: true, detail: { property: null } }));
      return;
    }
    const rowEdit = e.target.closest("[data-dx-grid-row-edit]");
    if (rowEdit) {
      const row = rowEdit.closest("[data-dx-row]");
      if (row) gridStartEdit(root, row);
      return;
    }
    const rowSave = e.target.closest("[data-dx-grid-row-save]");
    if (rowSave) {
      gridSaveEdit(root);
      return;
    }
    const rowCancel = e.target.closest("[data-dx-grid-row-cancel]");
    if (rowCancel) {
      gridRestoreRow(root);
      return;
    }
    const rowDelete = e.target.closest("[data-dx-grid-row-delete]");
    if (rowDelete) {
      const row = rowDelete.closest("[data-dx-row]");
      if (row) gridDeleteRow(root, row);
      return;
    }
    const createSave = e.target.closest("[data-dx-grid-row-create-save]");
    if (createSave) {
      gridSaveCreate(root);
      return;
    }
    const createCancel = e.target.closest("[data-dx-grid-row-create-cancel]");
    if (createCancel) {
      root.querySelector("[data-dx-grid-new-row]")?.remove();
      gridState.get(root).editKey = null;
      gridState.get(root).edits = null;
      gridApplyView(root);
      return;
    }
    const createButton = e.target.closest("[data-dx-grid-row-create]");
    if (createButton) {
      gridStartCreate(root);
      return;
    }
    const row = e.target.closest("[data-dx-row]");
    if (row && !e.target.closest("button, select, input, a, label, [data-dx-grid-resize]")) {
      gridSelectRow(root, row, true);
    }
  });

  on("[data-dx-datagrid]", "mousedown", (root, e) => {
    const resizeHandle = e.target.closest("[data-dx-grid-resize]");
    if (!resizeHandle) return;
    e.preventDefault();
    gridResizeStart(root, resizeHandle, e);
  });

  on("[data-dx-datagrid]", "dragover", (root, e) => {
    if (root.hasAttribute("data-dx-datagrid-reorder") && e.target.closest("[data-dx-grid-col]")) {
      e.preventDefault();
    }
  });

  on("[data-dx-datagrid]", "dragstart", (root, e) => {
    const source = e.target.closest("[data-dx-grid-col]");
    if (!source) return;
    const state = gridState.get(root);
    if (!state) return;
    state.dragKey = source.getAttribute("data-dx-grid-col");
    if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
  });

  on("[data-dx-datagrid]", "drop", (root, e) => {
    const panel = e.target.closest("[data-dx-grid-group-panel]");
    if (panel) {
      e.preventDefault();
      const state = gridState.get(root);
      if (!state || state.dragKey == null || !root.hasAttribute("data-dx-datagrid-groupable")) return;
      const key = state.dragKey;
      state.dragKey = null;
      const column = parseGridColumns(root).find((c, i) => gridColumnKey(c, i) === key);
      if (!column?.property) return;
      state.groupBy = column.property;
      state.expanded = new Set(
        [...root.querySelectorAll("[data-dx-row]")].map((row) => String(gridRowValues(row)[column.property] ?? "")),
      );
      renderGridHeader(root, parseGridColumns(root));
      renderGridPicker(root, parseGridColumns(root));
      gridApplyView(root);
      root.dispatchEvent(new CustomEvent("dx:grid-group-change", { bubbles: true, detail: { property: column.property } }));
      return;
    }
    const target = e.target.closest("[data-dx-grid-col]");
    if (!target) return;
    e.preventDefault();
    const state = gridState.get(root);
    if (!state || state.dragKey == null) return;
    const sourceKey = state.dragKey;
    const targetKey = target.getAttribute("data-dx-grid-col");
    if (sourceKey !== targetKey) {
      const next = state.order.filter((k) => k !== sourceKey);
      next.splice(next.indexOf(targetKey), 0, sourceKey);
      state.order = next;
      renderGridHeader(root, parseGridColumns(root));
      gridApplyView(root);
      root.dispatchEvent(new CustomEvent("dx:grid-column-reorder", { bubbles: true, detail: { from: sourceKey, to: targetKey } }));
    }
  });

  on("[data-dx-datagrid]", "change", (root, e) => {
    const state = gridState.get(root);
    if (!state) return;
    const pickerItem = e.target.closest("[data-dx-grid-picker-item]");
    if (pickerItem) {
      const key = pickerItem.getAttribute("data-dx-grid-picker-item");
      if (pickerItem.checked) state.visible.add(key);
      else state.visible.delete(key);
      renderGridHeader(root, parseGridColumns(root));
      gridApplyView(root);
      root.dispatchEvent(new CustomEvent("dx:grid-column-pick", { bubbles: true, detail: { key, visible: pickerItem.checked } }));
      return;
    }
    const op = e.target.closest("[data-dx-grid-filter-op]");
    const value = e.target.closest("[data-dx-grid-filter-value]");
    const pageSize = e.target.closest("[data-dx-grid-page-size]");
    if (pageSize) {
      state.pageSize = Number(pageSize.value);
      state.pageNumber = 1;
      gridApplyView(root);
      return;
    }
    if (!op && !value) return;
    const property = op
      ? op.getAttribute("data-dx-grid-filter-op")
      : value.getAttribute("data-dx-grid-filter-value");
    const current = state.filters.get(property) ?? {};
    const opSelect = root.querySelector(`[data-dx-grid-filter-op="${property}"]`);
    state.filters.set(property, {
      operator: op ? op.value : (opSelect ? opSelect.value : current.operator),
      value: value ? value.value : current.value,
    });
    state.pageNumber = 1;
    gridApplyView(root);
    root.dispatchEvent(new CustomEvent("dx:grid-filter", { bubbles: true, detail: { property, ...state.filters.get(property) } }));
  });

  function initDataGrid(root) {
    if (gridState.has(root)) return;
    gridState.set(root, defaultGridState(root));
    if (root.hasAttribute("data-dx-datagrid-column-picker")) {
      renderGridPicker(root, parseGridColumns(root));
    }
    renderGridHeader(root, parseGridColumns(root));
    gridApplyView(root);
  }

  document.querySelectorAll("[data-dx-datagrid]").forEach(initDataGrid);

  /* ---------------- DataList ---------------- */

  const datalistState = new WeakMap();

  function initDataList(root) {
    if (datalistState.has(root)) return;
    const size = Number(root.dataset.dxDatalistPagesize ?? "10") || 10;
    datalistState.set(root, { pageNumber: 1, pageSize: size });
    datalistApplyView(root);
  }

  function datalistApplyView(root) {
    const state = datalistState.get(root);
    const items = [...root.querySelectorAll("[data-dx-datalist-item]")];
    const total = items.length;
    const pageCount = Math.max(1, Math.ceil(total / state.pageSize));
    state.pageNumber = Math.min(Math.max(1, state.pageNumber), pageCount);
    const start = (state.pageNumber - 1) * state.pageSize;
    items.forEach((item, i) => {
      item.hidden = i < start || i >= start + state.pageSize;
    });
    const empty = root.querySelector("[data-dx-datalist-empty]");
    if (empty) empty.hidden = total > 0;
    datalistRenderPager(root, { pageNumber: state.pageNumber, pageSize: state.pageSize, pageCount, total });
    root.dispatchEvent(
      new CustomEvent("dx:datalist-change", {
        bubbles: true,
        detail: { pageNumber: state.pageNumber, pageSize: state.pageSize, pageCount, total },
      }),
    );
  }

  function datalistRenderPager(root, view) {
    const container = root.querySelector("[data-dx-datalist-pager]");
    if (!container) return;
    const { pageNumber, pageSize, pageCount, total } = view;
    const summary = document.createElement("span");
    summary.className = "dx-datalist-pager-summary";
    summary.textContent = `Page ${pageNumber} of ${pageCount} (${total} items)`;
    const controls = document.createElement("div");
    controls.className = "dx-datalist-pager-controls";
    const prev = document.createElement("button");
    prev.type = "button";
    prev.className = "dx-datalist-pager-button";
    prev.textContent = "‹";
    prev.setAttribute("aria-label", "Previous page");
    prev.disabled = pageNumber <= 1;
    prev.setAttribute("data-dx-datalist-page", String(pageNumber - 1));
    const max = Number(root.dataset.dxDatalistPagenumbers ?? "5");
    const items = gridPageItems(pageNumber, pageCount, max);
    const next = document.createElement("button");
    next.type = "button";
    next.className = "dx-datalist-pager-button";
    next.textContent = "›";
    next.setAttribute("aria-label", "Next page");
    next.disabled = pageNumber >= pageCount;
    next.setAttribute("data-dx-datalist-page", String(pageNumber + 1));
    controls.append(prev);
    items.forEach((item) => {
      if (item === "ellipsis") {
        const span = document.createElement("span");
        span.className = "dx-datalist-pager-ellipsis";
        span.setAttribute("aria-hidden", "true");
        span.textContent = "…";
        controls.append(span);
        return;
      }
      const button = document.createElement("button");
      button.type = "button";
      button.className = "dx-datalist-pager-button" + (item === pageNumber ? " dx-datalist-pager-button--active" : "");
      button.textContent = String(item);
      if (item === pageNumber) button.setAttribute("aria-current", "page");
      button.setAttribute("data-dx-datalist-page", String(item));
      controls.append(button);
    });
    controls.append(next);
    container.replaceChildren(summary, controls);
    const sizes = root.dataset.dxDatalistPagesizeOptions;
    if (sizes) {
      try {
        const options = JSON.parse(sizes);
        const label = document.createElement("label");
        label.className = "dx-datalist-pager-size";
        label.textContent = "Items per page";
        const select = document.createElement("select");
        select.setAttribute("data-dx-datalist-page-size", "");
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

  on("[data-dx-datalist]", "click", (root, e) => {
    const page = e.target.closest("[data-dx-datalist-page]");
    if (!page) return;
    const state = datalistState.get(root);
    if (!state) return;
    state.pageNumber = Number(page.getAttribute("data-dx-datalist-page"));
    datalistApplyView(root);
    root.dispatchEvent(new CustomEvent("dx:datalist-page", { bubbles: true, detail: { pageNumber: state.pageNumber } }));
  });

  on("[data-dx-datalist]", "change", (root, e) => {
    const select = e.target.closest("[data-dx-datalist-page-size]");
    if (!select) return;
    const state = datalistState.get(root);
    if (!state) return;
    state.pageSize = Number(select.value);
    state.pageNumber = 1;
    datalistApplyView(root);
  });

  document.querySelectorAll("[data-dx-datalist]").forEach(initDataList);

/* ---------------- Datepicker ---------------- */

  // [data-dx-datepicker] is a calendar popup picker. The root carries
  // data-dx-format (yyyy/yy/MM/M/dd/d/HH/H/mm/m/ss/s tokens),
  // data-dx-min/data-dx-max (ISO dates), data-dx-locale (BCP 47),
  // data-dx-show-time (time steppers + OK commit), data-dx-inline
  // (always-visible calendar, no input/trigger) and data-dx-value (ISO
  // date used when there is no input). The behavior renders the weekday
  // header and the 6x7 day grid, drives roving tabindex / aria-selected /
  // aria-disabled, commits on Enter/Space or day click, parses free
  // typing on blur/Enter and dispatches dx:change (detail.value = ISO
  // date, "yyyy-MM-dd" or "yyyy-MM-ddTHH:mm:ss" with time) and dx:invalid
  // when parsing fails. Init is lazy and idempotent (also re-run on
  // htmx:afterSettle); window.dxUikit.datepicker.init(root) forces it.

  function datepickerData(root) {
    let st = root._dxDatepicker;
    if (!st) {
      st = {
        input: root.querySelector("[data-dx-datepicker-input]"),
        trigger: root.querySelector("[data-dx-datepicker-trigger]"),
        clear: root.querySelector("[data-dx-datepicker-clear]"),
        popup: root.querySelector("[data-dx-datepicker-popup]"),
        grid: root.querySelector("[data-dx-datepicker-grid]"),
        weekdays: root.querySelector("[data-dx-datepicker-weekdays]"),
        title: root.querySelector("[data-dx-datepicker-title]"),
        prev: root.querySelector("[data-dx-datepicker-prev]"),
        next: root.querySelector("[data-dx-datepicker-next]"),
        time: root.querySelector("[data-dx-datepicker-time]"),
        footer: root.querySelector("[data-dx-datepicker-footer]"),
        ok: root.querySelector("[data-dx-datepicker-ok]"),
        open: false,
        selected: null,
        focus: null,
        view: null,
      };
      root._dxDatepicker = st;
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
      min: datepickerParseISO(root.getAttribute("data-dx-min")),
      max: datepickerParseISO(root.getAttribute("data-dx-max")),
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
    const locale = root.getAttribute("data-dx-locale") || "en-US";
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
          cell.className = "dx-datepicker-weekday";
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
      cell.className = "dx-datepicker-day";
      if (!inMonth) cell.classList.add("dx-datepicker-day--outside");
      if (selected) cell.classList.add("dx-datepicker-day--selected");
      if (isToday) cell.classList.add("dx-datepicker-day--today");
      cell.setAttribute("role", "gridcell");
      cell.setAttribute("data-dx-datepicker-day", "");
      cell.setAttribute("data-dx-date-value", iso);
      cell.tabIndex = focused ? 0 : -1;
      if (selected) cell.setAttribute("aria-selected", "true");
      if (disabled) cell.setAttribute("aria-disabled", "true");
      cell.textContent = String(day.getDate());
      cells.push(cell);
    }
    st.grid.replaceChildren(...cells);
  }

  function datepickerFocused(root) {
    return root.querySelector("[data-dx-datepicker-day][tabindex='0']");
  }

  function datepickerSyncTime(root) {
    const st = datepickerData(root);
    if (!root.hasAttribute("data-dx-show-time")) return;
    const base = st.selected || st.focus || new Date();
    root.querySelectorAll("[data-dx-datepicker-time-field]").forEach((field) => {
      const kind = field.getAttribute("data-dx-datepicker-time-field");
      field.value = kind === "hours" ? datepickerPad(base.getHours())
        : kind === "minutes" ? datepickerPad(base.getMinutes())
        : datepickerPad(base.getSeconds());
    });
  }

  function datepickerReadTime(root, date) {
    const hours = root.querySelector('[data-dx-datepicker-time-field="hours"]');
    const minutes = root.querySelector('[data-dx-datepicker-time-field="minutes"]');
    const seconds = root.querySelector('[data-dx-datepicker-time-field="seconds"]');
    const out = new Date(date);
    if (hours) out.setHours(numericClamp(Number(hours.value) || 0, 0, 23));
    if (minutes) out.setMinutes(numericClamp(Number(minutes.value) || 0, 0, 59));
    if (seconds) out.setSeconds(numericClamp(Number(seconds.value) || 0, 0, 59));
    return out;
  }

  function datepickerSetOpen(root, open) {
    const st = datepickerData(root);
    if (!st.view) initDatepicker(root);
    const inline = root.hasAttribute("data-dx-inline");
    if (st.open === open) return;
    if (st.trigger) {
      st.trigger.setAttribute("aria-expanded", String(open));
      root.classList.toggle("dx-datepicker--open", open);
    }
    if (st.popup && !inline) st.popup.hidden = !open;
    if (open) {
      if (st.time) st.time.hidden = !root.hasAttribute("data-dx-show-time");
      if (st.footer) st.footer.hidden = !root.hasAttribute("data-dx-show-time");
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
    if (root.hasAttribute("data-dx-show-time")) {
      st.selected = datepickerReadTime(root, st.selected);
    }
    const format = root.getAttribute("data-dx-format") || "yyyy-MM-dd";
    const iso = root.hasAttribute("data-dx-show-time")
      ? datepickerISOFull(st.selected)
      : datepickerISO(st.selected);
    if (st.input) {
      st.input.value = datepickerFormat(st.selected, format);
      st.input.classList.remove("dx-datepicker-input--invalid");
      st.input.removeAttribute("aria-invalid");
    }
    if (st.clear) st.clear.hidden = false;
    datepickerSetOpen(root, false);
    root.dispatchEvent(new CustomEvent("dx:change", { bubbles: true, detail: { value: iso } }));
    st.input?.focus();
  }

  function datepickerSelect(root, day) {
    const st = datepickerData(root);
    if (!st.view) initDatepicker(root);
    st.focus = new Date(day.getFullYear(), day.getMonth(), day.getDate());
    st.selected = new Date(st.focus);
    if (!root.hasAttribute("data-dx-show-time")) {
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
    const format = root.getAttribute("data-dx-format") || "yyyy-MM-dd";
    const parsed = datepickerParse(st.input.value, format);
    const { min, max } = datepickerBounds(root);
    if (!parsed || (min && parsed < min) || (max && parsed > max)) {
      st.input.classList.add("dx-datepicker-input--invalid");
      st.input.setAttribute("aria-invalid", "true");
      root.dispatchEvent(new CustomEvent("dx:invalid", { bubbles: true, detail: { value: st.input.value } }));
      return;
    }
    st.selected = parsed;
    st.focus = new Date(parsed);
    st.view = new Date(parsed.getFullYear(), parsed.getMonth(), 1);
    st.input.value = datepickerFormat(parsed, format);
    st.input.classList.remove("dx-datepicker-input--invalid");
    st.input.removeAttribute("aria-invalid");
    datepickerRender(root);
    root.dispatchEvent(
      new CustomEvent("dx:change", {
        bubbles: true,
        detail: { value: root.hasAttribute("data-dx-show-time") ? datepickerISOFull(parsed) : datepickerISO(parsed) },
      }),
    );
  }

  function datepickerClear(root) {
    const st = datepickerData(root);
    if (!st.view) initDatepicker(root);
    st.selected = null;
    if (st.input) {
      st.input.value = "";
      st.input.classList.remove("dx-datepicker-input--invalid");
      st.input.removeAttribute("aria-invalid");
    }
    if (st.clear) st.clear.hidden = true;
    if (st.trigger) st.trigger.setAttribute("aria-expanded", "false");
    root.classList.remove("dx-datepicker--open");
    if (st.popup && !root.hasAttribute("data-dx-inline")) st.popup.hidden = true;
    st.open = false;
    datepickerRender(root);
    root.dispatchEvent(new CustomEvent("dx:change", { bubbles: true, detail: { value: null } }));
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
    const format = root.getAttribute("data-dx-format") || "yyyy-MM-dd";
    let initial = datepickerParseISO(root.getAttribute("data-dx-value"));
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
    if (root.hasAttribute("data-dx-inline")) {
      if (st.time) st.time.hidden = !root.hasAttribute("data-dx-show-time");
      if (st.footer) st.footer.hidden = !root.hasAttribute("data-dx-show-time");
      if (st.popup) st.popup.hidden = false;
      datepickerSyncTime(root);
      datepickerRender(root);
    }
  }

  on("[data-dx-datepicker-trigger]", "click", (trigger) => {
    if (trigger.disabled) return;
    const root = trigger.closest("[data-dx-datepicker]");
    if (!root) return;
    initDatepicker(root);
    datepickerSetOpen(root, !datepickerData(root).open);
  });

  on("[data-dx-datepicker-clear]", "click", (clear) => {
    if (clear.disabled) return;
    const root = clear.closest("[data-dx-datepicker]");
    if (!root) return;
    datepickerClear(root);
  });

  on("[data-dx-datepicker-prev]", "click", (btn) => {
    const root = btn.closest("[data-dx-datepicker]");
    if (root) datepickerNavMonth(root, -1);
  });

  on("[data-dx-datepicker-next]", "click", (btn) => {
    const root = btn.closest("[data-dx-datepicker]");
    if (root) datepickerNavMonth(root, 1);
  });

  on("[data-dx-datepicker-ok]", "click", (btn) => {
    const root = btn.closest("[data-dx-datepicker]");
    if (root) datepickerCommit(root);
  });

  on("[data-dx-datepicker-day]", "click", (cell) => {
    if (cell.getAttribute("aria-disabled") === "true") return;
    const root = cell.closest("[data-dx-datepicker]");
    if (!root) return;
    const date = datepickerParseISO(cell.getAttribute("data-dx-date-value"));
    if (date) datepickerSelect(root, date);
  });

  on("[data-dx-datepicker-grid]", "keydown", (grid, e) => {
    const root = grid.closest("[data-dx-datepicker]");
    if (!root) return;
    initDatepicker(root);
    const st = datepickerData(root);
    const cell = e.target.closest("[data-dx-datepicker-day]");
    if (!cell) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (cell.getAttribute("aria-disabled") === "true") return;
      const date = datepickerParseISO(cell.getAttribute("data-dx-date-value"));
      if (date) datepickerSelect(root, date);
      return;
    }
    if (cell.getAttribute("aria-disabled") === "true") return;
    const { min, max } = datepickerBounds(root);
    const weekStart = datepickerWeekStart(root.getAttribute("data-dx-locale") || "en-US");
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

  on("[data-dx-datepicker-input]", "keydown", (input, e) => {
    if (input.disabled) return;
    if (e.key === "Enter") {
      e.preventDefault();
      const root = input.closest("[data-dx-datepicker]");
      if (root) datepickerApplyInput(root);
    }
  });

  on("[data-dx-datepicker-input]", "blur", (input) => {
    const root = input.closest("[data-dx-datepicker]");
    if (root) datepickerApplyInput(root);
  });

  on("[data-dx-datepicker-time-field]", "input", (field) => {
    const digits = field.value.replace(/[^0-9]/g, "");
    if (digits !== field.value) field.value = digits;
  });

  on("[data-dx-datepicker-time-field]", "change", (field) => {
    const root = field.closest("[data-dx-datepicker]");
    if (!root) return;
    const max = field.getAttribute("data-dx-datepicker-time-field") === "hours" ? 23 : 59;
    field.value = datepickerPad(numericClamp(Number(field.value) || 0, 0, max));
  });

  on("[data-dx-datepicker-time-field]", "keydown", (field, e) => {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    e.preventDefault();
    const root = field.closest("[data-dx-datepicker]");
    if (!root) return;
    const max = field.getAttribute("data-dx-datepicker-time-field") === "hours" ? 23 : 59;
    const v = (Number(field.value) || 0) + (e.key === "ArrowUp" ? 1 : -1);
    field.value = datepickerPad(numericClamp(v, 0, max));
  });

  on("[data-dx-datepicker-time-step]", "click", (btn) => {
    if (btn.disabled) return;
    const root = btn.closest("[data-dx-datepicker]");
    if (!root) return;
    const field = root.querySelector(
      `[data-dx-datepicker-time-field="${btn.getAttribute("data-dx-datepicker-time-step-field")}"]`,
    );
    if (!field) return;
    const max = field.getAttribute("data-dx-datepicker-time-field") === "hours" ? 23 : 59;
    const v = (Number(field.value) || 0) + Number(btn.getAttribute("data-dx-datepicker-time-step-dir"));
    field.value = datepickerPad(numericClamp(v, 0, max));
  });

  on("[data-dx-datepicker]", "keydown", (root, e) => {
    const st = datepickerData(root);
    if (!st.open) return;
    if (e.key === "Escape" || e.key === "Tab") {
      if (e.key === "Escape") e.preventDefault();
      datepickerSetOpen(root, false);
      st.input?.focus();
    }
  });

  document.querySelectorAll("[data-dx-datepicker]").forEach(initDatepicker);

  /* ---------------- Timespanpicker ---------------- */

  // [data-dx-timespanpicker] is a duration popup with numeric unit
  // steppers (data-dx-unit="days|hours|minutes|seconds", per-unit maxima,
  // data-dx-min/data-dx-max as ISO 8601 durations). The value is staged
  // in the unit fields and committed on OK; closing without confirming
  // (outside click / Escape / Tab) reverts the staged edits. Enter in the
  // input toggles the popup; ArrowUp/Down and Home/End step the focused
  // unit field. Commits fire dx:change (detail.value = ISO duration, e.g.
  // "P1DT2H30M"); failed typing fires dx:invalid. data-dx-format is
  // "d.HH:mm:ss" (days) or "HH:mm:ss"; data-dx-precision rounds the
  // committed value; data-dx-show-days/-hours/-minutes/-seconds pick the
  // visible units; data-dx-inline renders the panel always visible. Init
  // is lazy and idempotent; window.dxUikit.timespanpicker.init(root)
  // forces it.

  function timespanData(root) {
    if (!root._dxTimespanpicker) {
      root._dxTimespanpicker = {
        input: root.querySelector("[data-dx-timespanpicker-input]"),
        trigger: root.querySelector("[data-dx-timespanpicker-trigger]"),
        clear: root.querySelector("[data-dx-timespanpicker-clear]"),
        popup: root.querySelector("[data-dx-timespanpicker-popup]"),
        ok: root.querySelector("[data-dx-timespanpicker-ok]"),
        open: false,
        committed: 0,
        staged: 0,
        ready: false,
      };
    }
    return root._dxTimespanpicker;
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
    return [...root.querySelectorAll("[data-dx-timespanpicker-value]")].map((input) =>
      input.getAttribute("data-dx-unit"),
    );
  }

  function timespanUnitInput(root, unit) {
    return root.querySelector(`[data-dx-timespanpicker-value][data-dx-unit="${unit}"]`);
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
      min: timespanParseISO(root.getAttribute("data-dx-min")),
      max: timespanParseISO(root.getAttribute("data-dx-max")),
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
    const inline = root.hasAttribute("data-dx-inline");
    if (st.open === open) return;
    if (st.trigger) {
      st.trigger.setAttribute("aria-expanded", String(open));
      root.classList.toggle("dx-timespanpicker--open", open);
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
    const precision = root.getAttribute("data-dx-precision") || "second";
    let total = timespanRound(timespanReadStaged(root), precision);
    const { min, max } = timespanBounds(root);
    if (min !== null) total = Math.max(total, min);
    if (max !== null) total = Math.min(total, max);
    st.committed = total;
    if (st.input) {
      st.input.value = timespanFormat(total, root.getAttribute("data-dx-format"));
      st.input.classList.remove("dx-timespanpicker-input--invalid");
      st.input.removeAttribute("aria-invalid");
    }
    if (st.clear) st.clear.hidden = false;
    timespanSync(root, total);
    timespanSetOpen(root, false);
    root.dispatchEvent(new CustomEvent("dx:change", { bubbles: true, detail: { value: timespanToISO(total) } }));
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
    const hasDays = String(root.getAttribute("data-dx-format") || "HH:mm:ss").includes("d");
    const parsed = timespanParse(st.input.value, hasDays);
    if (parsed === null) {
      st.input.classList.add("dx-timespanpicker-input--invalid");
      st.input.setAttribute("aria-invalid", "true");
      root.dispatchEvent(new CustomEvent("dx:invalid", { bubbles: true, detail: { value: st.input.value } }));
      return;
    }
    st.committed = parsed;
    st.staged = parsed;
    st.input.classList.remove("dx-timespanpicker-input--invalid");
    st.input.removeAttribute("aria-invalid");
    root.dispatchEvent(new CustomEvent("dx:change", { bubbles: true, detail: { value: timespanToISO(parsed) } }));
  }

  function timespanClear(root) {
    const st = timespanData(root);
    if (!st.ready) initTimespanpicker(root);
    st.committed = 0;
    st.staged = 0;
    if (st.input) {
      st.input.value = "";
      st.input.classList.remove("dx-timespanpicker-input--invalid");
      st.input.removeAttribute("aria-invalid");
    }
    if (st.clear) st.clear.hidden = true;
    if (st.trigger) st.trigger.setAttribute("aria-expanded", "false");
    root.classList.remove("dx-timespanpicker--open");
    if (st.popup && !root.hasAttribute("data-dx-inline")) st.popup.hidden = true;
    st.open = false;
    root.dispatchEvent(new CustomEvent("dx:change", { bubbles: true, detail: { value: null } }));
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
    if (root.hasAttribute("data-dx-inline")) {
      st.committed = timespanReadStaged(root);
      if (st.input) st.input.value = timespanFormat(st.committed, root.getAttribute("data-dx-format"));
      root.dispatchEvent(new CustomEvent("dx:change", { bubbles: true, detail: { value: timespanToISO(st.committed) } }));
    }
  }

  function initTimespanpicker(root) {
    const st = timespanData(root);
    if (st.ready) return;
    st.ready = true;
    const hasDays = String(root.getAttribute("data-dx-format") || "HH:mm:ss").includes("d");
    let initial = st.input?.value ? timespanParse(st.input.value, hasDays) : null;
    if (initial === null && root.hasAttribute("data-dx-value")) {
      initial = timespanParseISO(root.getAttribute("data-dx-value"));
    }
    st.committed = initial ?? 0;
    st.staged = st.committed;
    if (st.clear) st.clear.hidden = !initial && !(st.input && st.input.value);
    if (root.hasAttribute("data-dx-inline")) {
      if (st.popup) st.popup.hidden = false;
      if (st.ok) st.ok.hidden = true;
      timespanSync(root, st.committed);
    }
  }

  on("[data-dx-timespanpicker-trigger]", "click", (trigger) => {
    if (trigger.disabled) return;
    const root = trigger.closest("[data-dx-timespanpicker]");
    if (!root) return;
    initTimespanpicker(root);
    timespanSetOpen(root, !timespanData(root).open);
  });

  on("[data-dx-timespanpicker-clear]", "click", (clear) => {
    if (clear.disabled) return;
    const root = clear.closest("[data-dx-timespanpicker]");
    if (root) timespanClear(root);
  });

  on("[data-dx-timespanpicker-ok]", "click", (btn) => {
    const root = btn.closest("[data-dx-timespanpicker]");
    if (root) timespanCommit(root);
  });

  on("[data-dx-timespanpicker-step]", "click", (btn) => {
    if (btn.disabled) return;
    const root = btn.closest("[data-dx-timespanpicker]");
    if (!root) return;
    const unit = btn.getAttribute("data-dx-timespanpicker-step-unit");
    const dir = Number(btn.getAttribute("data-dx-timespanpicker-step-dir")) || 0;
    timespanStepUnit(root, unit, dir);
  });

  on("[data-dx-timespanpicker-value]", "input", (input) => {
    const digits = input.value.replace(/[^0-9]/g, "");
    if (digits !== input.value) input.value = digits;
    const root = input.closest("[data-dx-timespanpicker]");
    if (root && root.hasAttribute("data-dx-inline")) {
      const unit = input.getAttribute("data-dx-unit");
      timespanStepUnit(root, unit, 0);
    }
  });

  on("[data-dx-timespanpicker-value]", "change", (input) => {
    const root = input.closest("[data-dx-timespanpicker]");
    if (!root) return;
    const unit = input.getAttribute("data-dx-unit");
    const { lo, hi } = timespanUnitBounds(root, unit);
    input.value = String(numericClamp(Number(input.value) || 0, lo, hi));
  });

  on("[data-dx-timespanpicker-value]", "keydown", (input, e) => {
    const root = input.closest("[data-dx-timespanpicker]");
    if (!root) return;
    const unit = input.getAttribute("data-dx-unit");
    const { lo, hi } = timespanUnitBounds(root, unit);
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const v = (Number(input.value) || 0) + (e.key === "ArrowUp" ? 1 : -1);
      input.value = String(numericClamp(v, lo, hi));
      if (root.hasAttribute("data-dx-inline")) timespanStepUnit(root, unit, 0);
    } else if (e.key === "Home") {
      e.preventDefault();
      input.value = String(lo);
    } else if (e.key === "End") {
      e.preventDefault();
      input.value = String(hi);
    }
  });

  on("[data-dx-timespanpicker-input]", "keydown", (input, e) => {
    if (input.disabled) return;
    if (e.key === "Enter") {
      e.preventDefault();
      const root = input.closest("[data-dx-timespanpicker]");
      if (root) {
        timespanApplyInput(root);
        timespanSetOpen(root, !timespanData(root).open);
      }
    }
  });

  on("[data-dx-timespanpicker-input]", "blur", (input) => {
    const root = input.closest("[data-dx-timespanpicker]");
    if (root) timespanApplyInput(root);
  });

  on("[data-dx-timespanpicker]", "keydown", (root, e) => {
    const st = timespanData(root);
    if (!st.open) return;
    if (e.key === "Escape" || e.key === "Tab") {
      if (e.key === "Escape") e.preventDefault();
      timespanRevert(root);
      timespanSetOpen(root, false);
      st.input?.focus();
    }
  });

  document.querySelectorAll("[data-dx-timespanpicker]").forEach(initTimespanpicker);

  /* ---------------- Colorpicker ---------------- */

  // [data-dx-colorpicker] is an HSV popup picker. The behavior renders
  // the palette swatches from data-dx-palette (JSON hex array; default
  // the Radzen 22-swatch grid), drives the saturation/hue/alpha sliders
  // with pointer + keyboard, keeps hex/R/G/B/A inputs in sync and
  // normalizes the committed color to "rgb(r, g, b)" / "rgba(r, g, b, a)".
  // With data-dx-show-button edits are staged and committed on OK (outside
  // click / Escape revert); otherwise every change commits immediately.
  // Commits fire dx:change (detail.value = the CSS color string). Init is
  // lazy and idempotent; window.dxUikit.colorpicker.init(root) forces it.

  function colorpickerData(root) {
    if (!root._dxColorpicker) {
      root._dxColorpicker = {
        trigger: root.querySelector("[data-dx-colorpicker-trigger]"),
        value: root.querySelector("[data-dx-colorpicker-value]"),
        popup: root.querySelector("[data-dx-colorpicker-popup]"),
        saturation: root.querySelector("[data-dx-colorpicker-saturation]"),
        hue: root.querySelector("[data-dx-colorpicker-hue]"),
        alpha: root.querySelector("[data-dx-colorpicker-alpha]"),
        rgba: root.querySelector("[data-dx-colorpicker-rgba]"),
        palette: root.querySelector("[data-dx-colorpicker-palette]"),
        ok: root.querySelector("[data-dx-colorpicker-ok]"),
        open: false,
        h: 0, s: 0, v: 1, a: 1,
        staged: null,
        baseline: null,
        ready: false,
      };
    }
    return root._dxColorpicker;
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
      const indicator = st.saturation.querySelector(".dx-saturation-indicator");
      if (indicator) {
        indicator.style.left = `${st.s * 100}%`;
        indicator.style.top = `${(1 - st.v) * 100}%`;
      }
    }
    if (st.hue) {
      st.hue.setAttribute("aria-valuenow", String(Math.round(st.h)));
      const indicator = st.hue.querySelector(".dx-hue-indicator");
      if (indicator) indicator.style.left = `${(st.h / 360) * 100}%`;
    }
    if (st.alpha) {
      st.alpha.setAttribute("aria-valuenow", String(Math.round(st.a * 100)));
      st.alpha.style.setProperty("--dx-color-primary", rgb);
      const indicator = st.alpha.querySelector(".dx-alpha-indicator");
      if (indicator) indicator.style.left = `${st.a * 100}%`;
    }
    if (st.rgba) {
      st.rgba.querySelectorAll("[data-dx-colorpicker-rgba-input]").forEach((input) => {
        const channel = input.getAttribute("data-dx-colorpicker-rgba-channel");
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
    if (root.hasAttribute("data-dx-show-button")) colorpickerStage(root);
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
    if (root.hasAttribute("data-dx-show-button")) {
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
    if (root.hasAttribute("data-dx-show-button")) {
      colorpickerSetOpen(root, false);
      st.trigger?.focus();
    }
    root.dispatchEvent(new CustomEvent("dx:change", { bubbles: true, detail: { value } }));
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
    const inline = root.hasAttribute("data-dx-inline");
    if (st.open === open) return;
    if (st.trigger) {
      st.trigger.setAttribute("aria-expanded", String(open));
      root.classList.toggle("dx-colorpicker--open", open);
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
    const raw = root.getAttribute("data-dx-palette");
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
        swatch.className = "dx-colorpicker-swatch";
        swatch.setAttribute("data-dx-colorpicker-swatch", "");
        swatch.setAttribute("data-dx-colorpicker-swatch-value", String(hex).toLowerCase());
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
    const parsed = colorpickerParseColor(root.getAttribute("data-dx-value") || "#2563eb");
    if (!parsed) return;
    const [h, s, v] = colorpickerRgbToHsv(...parsed.rgb);
    st.h = h;
    st.s = s;
    st.v = v;
    st.a = parsed.a;
    colorpickerRenderPalette(root);
    colorpickerRender(root);
    if (root.hasAttribute("data-dx-inline")) {
      if (st.popup) st.popup.hidden = false;
      if (st.ok) st.ok.hidden = true;
    }
  }

  on("[data-dx-colorpicker-trigger]", "click", (trigger) => {
    if (trigger.disabled) return;
    const root = trigger.closest("[data-dx-colorpicker]");
    if (!root) return;
    initColorpicker(root);
    colorpickerSetOpen(root, !colorpickerData(root).open);
  });

  on("[data-dx-colorpicker]", "keydown", (root, e) => {
    const st = colorpickerData(root);
    if (e.key === "Enter" || e.key === " ") {
      const swatch = e.target.closest("[data-dx-colorpicker-swatch]");
      if (swatch) {
        e.preventDefault();
        const rgb = colorpickerHexToRgb(swatch.getAttribute("data-dx-colorpicker-swatch-value"));
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

  on("[data-dx-colorpicker-swatch]", "click", (swatch) => {
    const root = swatch.closest("[data-dx-colorpicker]");
    if (!root) return;
    const st = colorpickerData(root);
    const rgb = colorpickerHexToRgb(swatch.getAttribute("data-dx-colorpicker-swatch-value"));
    if (!rgb) return;
    const [h, s, v] = colorpickerRgbToHsv(...rgb);
    colorpickerSet(root, h, s, v, st.a);
  });

  function colorpickerDragStart(el, e, apply) {
    e.preventDefault();
    el.setPointerCapture?.(e.pointerId);
    const root = el.closest("[data-dx-colorpicker]");
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

  on("[data-dx-colorpicker-saturation]", "pointerdown", (el, e) => {
    colorpickerDragStart(el, e, (ev) => {
      const root = el.closest("[data-dx-colorpicker]");
      const { x, y } = colorpickerPointer(el, ev);
      const st = colorpickerData(root);
      colorpickerSet(root, st.h, x, y, st.a);
    });
  });

  on("[data-dx-colorpicker-hue]", "pointerdown", (el, e) => {
    colorpickerDragStart(el, e, (ev) => {
      const root = el.closest("[data-dx-colorpicker]");
      const { x } = colorpickerPointer(el, ev);
      const st = colorpickerData(root);
      colorpickerSet(root, x * 360, st.s, st.v, st.a);
    });
  });

  on("[data-dx-colorpicker-alpha]", "pointerdown", (el, e) => {
    colorpickerDragStart(el, e, (ev) => {
      const root = el.closest("[data-dx-colorpicker]");
      const { x } = colorpickerPointer(el, ev);
      const st = colorpickerData(root);
      colorpickerSet(root, st.h, st.s, st.v, x);
    });
  });

  on("[data-dx-colorpicker-saturation]", "keydown", (el, e) => {
    const root = el.closest("[data-dx-colorpicker]");
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

  on("[data-dx-colorpicker-hue]", "keydown", (el, e) => {
    const root = el.closest("[data-dx-colorpicker]");
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

  on("[data-dx-colorpicker-alpha]", "keydown", (el, e) => {
    const root = el.closest("[data-dx-colorpicker]");
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

  on("[data-dx-colorpicker-rgba-input]", "change", (input) => {
    const root = input.closest("[data-dx-colorpicker]");
    if (!root) return;
    const st = colorpickerData(root);
    const channel = input.getAttribute("data-dx-colorpicker-rgba-channel");
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

  on("[data-dx-colorpicker-ok]", "click", (btn) => {
    const root = btn.closest("[data-dx-colorpicker]");
    if (root) colorpickerCommit(root);
  });

  document.querySelectorAll("[data-dx-colorpicker]").forEach(initColorpicker);

  /* ---------------- Slider ---------------- */

  // [data-dx-slider] is a range slider without an input box: one handle,
  // or two (data-dx-range) where the track between the handles is filled.
  // data-dx-min/data-dx-max/data-dx-step define the scale,
  // data-dx-orientation="horizontal|vertical" flips the axis and
  // data-dx-value / data-dx-value-min / data-dx-value-max seed the
  // handles. The behavior drives pointer drags (setPointerCapture) and
  // the keyboard (Arrows ±step, Home/End, roving tabindex) and dispatches
  // dx:change with detail.value = number (or {min, max} in range mode).
  // Init is lazy and idempotent; window.dxUikit.slider.init(root) forces
  // it.

  function sliderData(root) {
    if (!root._dxSlider) {
      root._dxSlider = {
        track: root.querySelector("[data-dx-slider-track]"),
        range: root.querySelector("[data-dx-slider-range]"),
        handles: [...root.querySelectorAll("[data-dx-slider-handle]")],
        min: Number(root.getAttribute("data-dx-min")) || 0,
        max: Number(root.getAttribute("data-dx-max")) || 100,
        step: Number(root.getAttribute("data-dx-step")) || 1,
        vertical: root.getAttribute("data-dx-orientation") === "vertical" || root.classList.contains("dx-slider--vertical"),
        rangeMode: root.hasAttribute("data-dx-range") || root.querySelectorAll("[data-dx-slider-handle]").length > 1,
        values: [],
        dragging: -1,
        ready: false,
      };
    }
    return root._dxSlider;
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
        new CustomEvent("dx:change", {
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
      const attr = i === 0 ? (count === 1 ? "data-dx-value" : "data-dx-value-min") : "data-dx-value-max";
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

  on("[data-dx-slider-handle]", "pointerdown", (handle, e) => {
    const root = handle.closest("[data-dx-slider]");
    if (!root || root.hasAttribute("data-dx-disabled")) return;
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
        new CustomEvent("dx:change", {
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

  on("[data-dx-slider-handle]", "keydown", (handle, e) => {
    const root = handle.closest("[data-dx-slider]");
    if (!root || root.hasAttribute("data-dx-disabled")) return;
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

  on("[data-dx-slider-handle]", "focusin", (handle) => {
    const root = handle.closest("[data-dx-slider]");
    if (!root) return;
    const st = sliderData(root);
    initSlider(root);
    st.handles.forEach((h) => {
      h.tabIndex = h === handle ? 0 : -1;
    });
  });

  document.querySelectorAll("[data-dx-slider]").forEach(initSlider);

  /* ---------------- Rating ---------------- */

  // [data-dx-rating] is a star rating rendered as a radiogroup of
  // role="radio" buttons with an optional clear button. The behavior
  // syncs aria-checked, the filled/outline icon swap, aria-posinset/
  // aria-setsize and the roving tabindex, sets the value on click or
  // Arrow/Home/End keys and dispatches dx:change (detail.value = integer
  // 0..data-dx-stars). data-dx-readonly and data-dx-disabled disable
  // interaction. Init is lazy and idempotent;
  // window.dxUikit.rating.init(root) forces it.

  function ratingData(root) {
    if (!root._dxRating) {
      root._dxRating = {
        stars: Number(root.getAttribute("data-dx-stars")) || 5,
        value: 0,
        ready: false,
      };
    }
    return root._dxRating;
  }

  function ratingItems(root) {
    return [...root.querySelectorAll("[data-dx-rating-item]")];
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
      btn.className = "dx-rating-item";
      btn.setAttribute("role", "radio");
      btn.setAttribute("data-dx-rating-item", "");
      btn.setAttribute("data-dx-rating-value", String(i + 1));
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
        filled.classList.add("dx-rating-icon--filled");
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
        empty.classList.add("dx-rating-icon--empty");
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
      const value = Number(item.getAttribute("data-dx-rating-value"));
      const checked = value <= st.value;
      item.setAttribute("aria-checked", String(checked));
      item.classList.toggle("dx-rating-item--filled", checked);
      item.tabIndex = value === st.value ? 0 : -1;
      item.setAttribute("aria-posinset", String(value));
      item.setAttribute("aria-setsize", String(st.stars));
    });
    const clear = root.querySelector("[data-dx-rating-clear]");
    if (clear) clear.tabIndex = st.value === 0 ? 0 : -1;
  }

  function ratingSet(root, value) {
    const st = ratingData(root);
    if (!st.ready) initRating(root);
    const next = numericClamp(Math.round(value), 0, st.stars);
    if (next === st.value) return;
    st.value = next;
    ratingRender(root);
    root.dispatchEvent(new CustomEvent("dx:change", { bubbles: true, detail: { value: next } }));
  }

  function ratingReadonly(root) {
    return root.hasAttribute("data-dx-readonly") || root.hasAttribute("data-dx-disabled");
  }

  function initRating(root) {
    const st = ratingData(root);
    if (st.ready) return;
    st.ready = true;
    st.value = numericClamp(Number(root.getAttribute("data-dx-value")) || 0, 0, st.stars);
    ratingBuild(root);
    ratingRender(root);
    if (root.hasAttribute("data-dx-readonly")) {
      root.setAttribute("aria-readonly", "true");
      root.classList.add("dx-rating--readonly");
    }
    if (root.hasAttribute("data-dx-disabled")) {
      root.classList.add("dx-state-disabled");
      ratingItems(root).forEach((item) => item.setAttribute("aria-disabled", "true"));
      const clear = root.querySelector("[data-dx-rating-clear]");
      if (clear) clear.setAttribute("aria-disabled", "true");
    }
  }

  on("[data-dx-rating-item]", "click", (item) => {
    const root = item.closest("[data-dx-rating]");
    if (!root || ratingReadonly(root) || item.hasAttribute("aria-disabled")) return;
    initRating(root);
    ratingSet(root, Number(item.getAttribute("data-dx-rating-value")));
  });

  on("[data-dx-rating-clear]", "click", (clear) => {
    const root = clear.closest("[data-dx-rating]");
    if (!root || ratingReadonly(root) || clear.hasAttribute("aria-disabled")) return;
    initRating(root);
    ratingSet(root, 0);
  });

  on("[data-dx-rating]", "keydown", (root, e) => {
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
    root.dispatchEvent(new CustomEvent("dx:change", { bubbles: true, detail: { value: next } }));
  });

  document.querySelectorAll("[data-dx-rating]").forEach(initRating);

  /* ---------------- Pager ---------------- */

  // [data-dx-pager] is a nav landmark with first/prev/page/next/last buttons,
  // optional summary (aria-live polite) and page-size select. The behavior
  // derives pageCount from data-dx-count / data-dx-page-size, handles
  // alwaysVisible, computes ellipsis items, wires clicks and keyboard, and
  // dispatches dx:page-change{page, skip, top, pageCount, pageSize} and
  // dx:page-size-change{pageSize}. Init is idempotent via _dxPager;
  // window.dxUikit.pager.init(root) forces it.

  function pagerData(root) {
    if (!root._dxPager) {
      root._dxPager = { ready: false };
    }
    return root._dxPager;
  }

  function pagerPageCount(count, pageSize) {
    return Math.max(1, Math.ceil(count / Math.max(1, pageSize)));
  }

  function pagerFormat(template, page, pageCount, count) {
    return template.replace("{0}", String(page)).replace("{1}", String(pageCount)).replace("{2}", String(count));
  }

  function pagerRender(root) {
    const st = pagerData(root);
    if (!st.ready) return;
    const count = Number(root.getAttribute("data-dx-count")) || 0;
    const pageSize = Number(root.getAttribute("data-dx-page-size")) || 10;
    const pageCount = pagerPageCount(count, pageSize);
    const alwaysVisible = root.hasAttribute("data-dx-always-visible");
    if (!alwaysVisible && pageCount <= 1) {
      root.hidden = true;
      return;
    }
    root.hidden = false;
    const raw = Number(root.getAttribute("data-dx-page")) || 1;
    const current = Math.min(Math.max(1, raw), pageCount);
    root.setAttribute("data-dx-page", String(current));
    // summary
    const summary = root.querySelector("[data-dx-pager-summary]");
    if (summary) {
      const show = root.getAttribute("data-dx-show-paging-summary");
      const visible = show === null || show !== "false";
      summary.hidden = !visible;
      if (visible) {
        const fmt = root.getAttribute("data-dx-paging-summary-format") || "Page {0} of {1} ({2} items)";
        summary.textContent = pagerFormat(fmt, current, pageCount, count);
      }
    }
    // buttons disabled + active
    const first = root.querySelector("[data-dx-pager-first]");
    const prev = root.querySelector("[data-dx-pager-prev]");
    const next = root.querySelector("[data-dx-pager-next]");
    const last = root.querySelector("[data-dx-pager-last]");
    if (first) first.disabled = current <= 1;
    if (prev) prev.disabled = current <= 1;
    if (next) next.disabled = current >= pageCount;
    if (last) last.disabled = current >= pageCount;
    root.querySelectorAll("[data-dx-pager-page]").forEach((btn) => {
      const v = Number(btn.getAttribute("data-dx-page"));
      const active = v === current;
      btn.classList.toggle("dx-pager-button--active", active);
      if (active) btn.setAttribute("aria-current", "page");
      else btn.removeAttribute("aria-current");
    });
    // horizontal align class
    const align = root.getAttribute("data-dx-horizontal-align");
    root.classList.remove("dx-pager--left", "dx-pager--center", "dx-pager--right", "dx-pager--justify");
    if (align === "center") root.classList.add("dx-pager--center");
    else if (align === "right") root.classList.add("dx-pager--right");
    else if (align === "justify") root.classList.add("dx-pager--justify");
    else root.classList.add("dx-pager--left");
  }

  function pagerSetPage(root, page) {
    const count = Number(root.getAttribute("data-dx-count")) || 0;
    const pageSize = Number(root.getAttribute("data-dx-page-size")) || 10;
    const pageCount = pagerPageCount(count, pageSize);
    const next = Math.min(Math.max(1, page), pageCount);
    const current = Number(root.getAttribute("data-dx-page")) || 1;
    if (next === current) return;
    root.setAttribute("data-dx-page", String(next));
    pagerRender(root);
    const skip = (next - 1) * pageSize;
    root.dispatchEvent(new CustomEvent("dx:page-change", { bubbles: true, detail: { page: next, skip, top: pageSize, pageCount, pageSize } }));
  }

  function initPager(root) {
    const st = pagerData(root);
    if (st.ready) {
      pagerRender(root);
      return;
    }
    st.ready = true;
    pagerRender(root);
  }

  on("[data-dx-pager-first]", "click", (btn) => {
    const root = btn.closest("[data-dx-pager]");
    if (!root) return;
    initPager(root);
    if (btn.disabled) return;
    pagerSetPage(root, 1);
  });

  on("[data-dx-pager-prev]", "click", (btn) => {
    const root = btn.closest("[data-dx-pager]");
    if (!root) return;
    initPager(root);
    if (btn.disabled) return;
    const current = Number(root.getAttribute("data-dx-page")) || 1;
    pagerSetPage(root, current - 1);
  });

  on("[data-dx-pager-next]", "click", (btn) => {
    const root = btn.closest("[data-dx-pager]");
    if (!root) return;
    initPager(root);
    if (btn.disabled) return;
    const current = Number(root.getAttribute("data-dx-page")) || 1;
    pagerSetPage(root, current + 1);
  });

  on("[data-dx-pager-last]", "click", (btn) => {
    const root = btn.closest("[data-dx-pager]");
    if (!root) return;
    initPager(root);
    if (btn.disabled) return;
    const count = Number(root.getAttribute("data-dx-count")) || 0;
    const pageSize = Number(root.getAttribute("data-dx-page-size")) || 10;
    const pageCount = pagerPageCount(count, pageSize);
    pagerSetPage(root, pageCount);
  });

  on("[data-dx-pager-page]", "click", (btn) => {
    const root = btn.closest("[data-dx-pager]");
    if (!root) return;
    initPager(root);
    if (btn.disabled) return;
    const page = Number(btn.getAttribute("data-dx-page"));
    pagerSetPage(root, page);
  });

  on("[data-dx-pager-size-select]", "change", (select) => {
    const root = select.closest("[data-dx-pager]");
    if (!root) return;
    initPager(root);
    const pageSize = Number(select.value);
    root.dispatchEvent(new CustomEvent("dx:page-size-change", { bubbles: true, detail: { pageSize } }));
  });

  on("[data-dx-pager-controls]", "keydown", (controls, e) => {
    const buttons = [...controls.querySelectorAll("button[data-dx-pager-page], button[data-dx-pager-first], button[data-dx-pager-prev], button[data-dx-pager-next], button[data-dx-pager-last]")].filter(
      (b) => !b.disabled,
    );
    const idx = buttons.indexOf(document.activeElement);
    if (idx === -1) return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = buttons[idx + 1] ?? buttons[0];
      next?.focus();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prev = buttons[idx - 1] ?? buttons[buttons.length - 1];
      prev?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      buttons[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      buttons[buttons.length - 1]?.focus();
    }
  });

  document.querySelectorAll("[data-dx-pager]").forEach(initPager);

  /* ---------------- Menu ---------------- */

  function menuData(root) {
    if (!root._dxMenu) root._dxMenu = { ready: false };
    return root._dxMenu;
  }

  function menuCloseAll(root) {
    root.querySelectorAll("[data-dx-menu-submenu]").forEach((sm) => (sm.hidden = true));
    root.querySelectorAll("[data-dx-menu-item][aria-haspopup]").forEach((btn) => btn.setAttribute("aria-expanded", "false"));
  }

  function initMenu(root) {
    const st = menuData(root);
    if (st.ready) return;
    st.ready = true;
    menuCloseAll(root);
  }

  on("[data-dx-menu-item]", "click", (btn) => {
    const root = btn.closest("[data-dx-menu]");
    if (!root) return;
    initMenu(root);
    if (btn.hasAttribute("aria-disabled") || btn.disabled) return;
    const hasPopup = btn.getAttribute("aria-haspopup") === "menu";
    if (hasPopup) {
      const expanded = btn.getAttribute("aria-expanded") === "true";
      const submenuId = btn.getAttribute("aria-controls");
      const submenu = submenuId ? root.querySelector(`#${CSS.escape(submenuId)}`) : btn.nextElementSibling;
      if (!submenu || !submenu.hasAttribute("data-dx-menu-submenu")) return;
      // close others
      menuCloseAll(root);
      if (!expanded) {
        btn.setAttribute("aria-expanded", "true");
        submenu.hidden = false;
      }
      return;
    }
    // leaf click
    const text = btn.getAttribute("data-dx-text") || btn.textContent.trim();
    const value = btn.getAttribute("data-dx-value") || undefined;
    const path = btn.getAttribute("data-dx-path") || undefined;
    root.dispatchEvent(new CustomEvent("dx:menu-click", { bubbles: true, detail: { text, value, path } }));
    menuCloseAll(root);
  });

  on("[data-dx-menu-item]", "mouseover", (btn, e) => {
    const root = btn.closest("[data-dx-menu]");
    if (!root || root.getAttribute("data-dx-orientation") === "vertical") return;
    if (btn.getAttribute("aria-haspopup") !== "menu") return;
    if (btn.hasAttribute("aria-disabled") || btn.disabled) return;
    if (e.relatedTarget instanceof Node && btn.contains(e.relatedTarget)) return;
    initMenu(root);
    const submenuId = btn.getAttribute("aria-controls");
    const submenu = submenuId ? root.querySelector(`#${CSS.escape(submenuId)}`) : null;
    if (!submenu) return;
    // close submenus that are neither the hovered item's own nor an ancestor of it
    root.querySelectorAll("[data-dx-menu-submenu]").forEach((sm) => {
      if (sm !== submenu && !sm.contains(btn)) sm.hidden = true;
    });
    root.querySelectorAll("[data-dx-menu-item][aria-haspopup]").forEach((b) => {
      const id = b.getAttribute("aria-controls");
      const sm = id ? root.querySelector(`#${CSS.escape(id)}`) : null;
      const keep = b === btn || (sm && sm.contains(btn));
      b.setAttribute("aria-expanded", String(!!keep));
    });
    btn.setAttribute("aria-expanded", "true");
    submenu.hidden = false;
  });

  on("[data-dx-menu]", "keydown", (root, e) => {
    initMenu(root);
    const items = [...root.querySelectorAll("[data-dx-menu-item]:not([aria-disabled])")].filter((b) => !b.disabled);
    const idx = items.indexOf(document.activeElement);
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = items[idx + 1] ?? items[0];
      next?.focus();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = items[idx - 1] ?? items[items.length - 1];
      prev?.focus();
    } else if (e.key === "ArrowDown") {
      const current = document.activeElement;
      if (current && current.getAttribute("aria-haspopup") === "menu") {
        e.preventDefault();
        const submenuId = current.getAttribute("aria-controls");
        const submenu = submenuId ? root.querySelector(`#${CSS.escape(submenuId)}`) : null;
        if (submenu) {
          current.setAttribute("aria-expanded", "true");
          submenu.hidden = false;
          const first = submenu.querySelector("[data-dx-menu-item]");
          first?.focus();
        }
      } else if (current && current.closest("[data-dx-menu-submenu]")) {
        e.preventDefault();
        const next = items[idx + 1] ?? items[0];
        next?.focus();
      }
    } else if (e.key === "Escape") {
      const trigger = root.querySelector("[data-dx-menu-item][aria-haspopup][aria-expanded='true']");
      menuCloseAll(root);
      if (trigger) trigger.focus();
    }
  });

  document.addEventListener("click", (e) => {
    if (e.target instanceof Element && !e.target.closest("[data-dx-menu]")) {
      document.querySelectorAll("[data-dx-menu]").forEach(menuCloseAll);
    }
  });

  document.querySelectorAll("[data-dx-menu]").forEach(initMenu);

  /* ---------------- PanelMenu ---------------- */

  function panelMenuData(root) {
    if (!root._dxPanelMenu) root._dxPanelMenu = { ready: false };
    return root._dxPanelMenu;
  }

  function initPanelMenu(root) {
    const st = panelMenuData(root);
    if (st.ready) return;
    st.ready = true;
    const multiple = root.hasAttribute("data-dx-multiple");
    if (!multiple) {
      // ensure only first expanded stays open
      const expanded = root.querySelectorAll("[data-dx-panelmenu-item][aria-expanded='true']");
      expanded.forEach((btn, i) => {
        if (i > 0) {
          btn.setAttribute("aria-expanded", "false");
          const id = btn.getAttribute("aria-controls");
          const panel = id ? root.querySelector(`#${CSS.escape(id)}`) : null;
          if (panel) panel.hidden = true;
        }
      });
    }
  }

  on("[data-dx-panelmenu-item]", "click", (btn) => {
    const root = btn.closest("[data-dx-panelmenu]");
    if (!root) return;
    initPanelMenu(root);
    if (btn.hasAttribute("aria-disabled") || btn.disabled) return;
    const hasPopup = btn.getAttribute("aria-haspopup") === "menu" || btn.hasAttribute("aria-controls");
    if (hasPopup) {
      const expanded = btn.getAttribute("aria-expanded") === "true";
      const id = btn.getAttribute("aria-controls");
      const panel = id ? root.querySelector(`#${CSS.escape(id)}`) : null;
      const multiple = root.hasAttribute("data-dx-multiple");
      if (!multiple && !expanded) {
        // collapse others
        root.querySelectorAll("[data-dx-panelmenu-item][aria-expanded='true']").forEach((other) => {
          if (other === btn) return;
          other.setAttribute("aria-expanded", "false");
          const oid = other.getAttribute("aria-controls");
          const opanel = oid ? root.querySelector(`#${CSS.escape(oid)}`) : null;
          if (opanel) opanel.hidden = true;
        });
      }
      btn.setAttribute("aria-expanded", String(!expanded));
      if (panel) panel.hidden = expanded;
      return;
    }
    const text = btn.getAttribute("data-dx-text") || btn.textContent.trim();
    const value = btn.getAttribute("data-dx-value") || undefined;
    const path = btn.getAttribute("data-dx-path") || undefined;
    root.dispatchEvent(new CustomEvent("dx:panelmenu-click", { bubbles: true, detail: { text, value, path } }));
  });

  on("[data-dx-panelmenu]", "keydown", (root, e) => {
    initPanelMenu(root);
    const items = [...root.querySelectorAll("[data-dx-panelmenu-item]:not([aria-disabled])")].filter((b) => !b.disabled);
    const idx = items.indexOf(document.activeElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = items[idx + 1] ?? items[0];
      next?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = items[idx - 1] ?? items[items.length - 1];
      prev?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      items[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      items[items.length - 1]?.focus();
    } else if (e.key === "Escape") {
      const expanded = root.querySelector("[data-dx-panelmenu-item][aria-expanded='true']");
      if (expanded) {
        expanded.setAttribute("aria-expanded", "false");
        const id = expanded.getAttribute("aria-controls");
        const panel = id ? root.querySelector(`#${CSS.escape(id)}`) : null;
        if (panel) panel.hidden = true;
        expanded.focus();
      }
    }
  });

  document.querySelectorAll("[data-dx-panelmenu]").forEach(initPanelMenu);

  /* ---------------- ProfileMenu ---------------- */

  function profileMenuData(root) {
    if (!root._dxProfileMenu) root._dxProfileMenu = { ready: false, open: false };
    return root._dxProfileMenu;
  }

  function profileMenuSetOpen(root, open) {
    const st = profileMenuData(root);
    st.open = open;
    const trigger = root.querySelector("[data-dx-profilemenu-trigger]");
    const menu = root.querySelector("[data-dx-profilemenu-menu]");
    if (trigger) trigger.setAttribute("aria-expanded", String(open));
    if (menu) menu.hidden = !open;
    if (open && menu) {
      const first = menu.querySelector("[data-dx-profilemenu-item]:not([aria-disabled])");
      // do not auto-focus, let user tab
    }
  }

  function initProfileMenu(root) {
    const st = profileMenuData(root);
    if (st.ready) return;
    st.ready = true;
    profileMenuSetOpen(root, false);
  }

  on("[data-dx-profilemenu-trigger]", "click", (btn) => {
    const root = btn.closest("[data-dx-profilemenu]");
    if (!root) return;
    initProfileMenu(root);
    const st = profileMenuData(root);
    profileMenuSetOpen(root, !st.open);
  });

  on("[data-dx-profilemenu-item]", "click", (btn) => {
    const root = btn.closest("[data-dx-profilemenu]");
    if (!root) return;
    initProfileMenu(root);
    if (btn.hasAttribute("aria-disabled") || btn.disabled) return;
    const text = btn.getAttribute("data-dx-text") || btn.textContent.trim();
    const path = btn.getAttribute("data-dx-path") || undefined;
    root.dispatchEvent(new CustomEvent("dx:profilemenu-click", { bubbles: true, detail: { text, path } }));
    profileMenuSetOpen(root, false);
    const trigger = root.querySelector("[data-dx-profilemenu-trigger]");
    trigger?.focus();
  });

  on("[data-dx-profilemenu]", "keydown", (root, e) => {
    initProfileMenu(root);
    const st = profileMenuData(root);
    const menu = root.querySelector("[data-dx-profilemenu-menu]");
    if (!menu || menu.hidden) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        const trigger = document.activeElement;
        if (trigger && trigger.hasAttribute("data-dx-profilemenu-trigger")) {
          e.preventDefault();
          profileMenuSetOpen(root, true);
          const first = menu.querySelector("[data-dx-profilemenu-item]:not([aria-disabled])");
          first?.focus();
        }
      }
      return;
    }
    const items = [...menu.querySelectorAll("[data-dx-profilemenu-item]:not([aria-disabled])")].filter((b) => !b.disabled);
    const idx = items.indexOf(document.activeElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = items[idx + 1] ?? items[0];
      next?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = items[idx - 1] ?? items[items.length - 1];
      prev?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      items[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      items[items.length - 1]?.focus();
    } else if (e.key === "Escape") {
      e.preventDefault();
      profileMenuSetOpen(root, false);
      const trigger = root.querySelector("[data-dx-profilemenu-trigger]");
      trigger?.focus();
    }
  });

  document.addEventListener("click", (e) => {
    if (e.target instanceof Element && !e.target.closest("[data-dx-profilemenu]")) {
      document.querySelectorAll("[data-dx-profilemenu]").forEach((r) => profileMenuSetOpen(r, false));
    }
  });

  document.querySelectorAll("[data-dx-profilemenu]").forEach(initProfileMenu);

  /* ---------------- FabMenu ---------------- */

  function fabMenuData(root) {
    if (!root._dxFabMenu) root._dxFabMenu = { ready: false, open: false };
    return root._dxFabMenu;
  }

  function fabMenuSetOpen(root, open) {
    const st = fabMenuData(root);
    st.open = open;
    const trigger = root.querySelector("[data-dx-fabmenu-trigger]");
    const menu = root.querySelector("[data-dx-fabmenu-menu]");
    if (trigger) trigger.setAttribute("aria-expanded", String(open));
    if (menu) menu.hidden = !open;
  }

  function initFabMenu(root) {
    const st = fabMenuData(root);
    if (st.ready) return;
    st.ready = true;
    fabMenuSetOpen(root, false);
  }

  on("[data-dx-fabmenu-trigger]", "click", (btn) => {
    const root = btn.closest("[data-dx-fabmenu]");
    if (!root) return;
    initFabMenu(root);
    const st = fabMenuData(root);
    fabMenuSetOpen(root, !st.open);
  });

  on("[data-dx-fabmenu-item]", "click", (btn) => {
    const root = btn.closest("[data-dx-fabmenu]");
    if (!root) return;
    initFabMenu(root);
    if (btn.hasAttribute("aria-disabled") || btn.disabled) return;
    const text = btn.getAttribute("data-dx-text") || btn.textContent.trim();
    const value = btn.getAttribute("data-dx-value") || undefined;
    root.dispatchEvent(new CustomEvent("dx:fabmenu-click", { bubbles: true, detail: { text, value } }));
    fabMenuSetOpen(root, false);
  });

  on("[data-dx-fabmenu]", "keydown", (root, e) => {
    initFabMenu(root);
    const st = fabMenuData(root);
    if (e.key === "Escape" && st.open) {
      e.preventDefault();
      fabMenuSetOpen(root, false);
      const trigger = root.querySelector("[data-dx-fabmenu-trigger]");
      trigger?.focus();
    }
  });

  document.addEventListener("click", (e) => {
    if (e.target instanceof Element && !e.target.closest("[data-dx-fabmenu]")) {
      document.querySelectorAll("[data-dx-fabmenu]").forEach((r) => fabMenuSetOpen(r, false));
    }
  });

  document.querySelectorAll("[data-dx-fabmenu]").forEach(initFabMenu);

  /* ---------------- Breadcrumb ---------------- */

  function breadcrumbData(root) {
    if (!root._dxBreadcrumb) root._dxBreadcrumb = { ready: false };
    return root._dxBreadcrumb;
  }

  function initBreadcrumb(root) {
    const st = breadcrumbData(root);
    if (st.ready) return;
    st.ready = true;
  }

  on("[data-dx-breadcrumb-link], [data-dx-breadcrumb-current]", "click", (el) => {
    const root = el.closest("[data-dx-breadcrumb]");
    if (!root) return;
    initBreadcrumb(root);
    if (el.hasAttribute("aria-disabled") || el.hasAttribute("disabled")) {
      el.preventDefault?.();
      return;
    }
    // if it's the current page span without path, do not dispatch
    if (el.hasAttribute("data-dx-breadcrumb-current") && !el.hasAttribute("data-dx-path") && !el.getAttribute("href")) return;
    const text = el.getAttribute("data-dx-text") || el.textContent.trim();
    const path = el.getAttribute("data-dx-path") || el.getAttribute("href") || undefined;
    // allow default link navigation, but also dispatch event
    root.dispatchEvent(new CustomEvent("dx:breadcrumb-click", { bubbles: true, detail: { text, path } }));
  });

  on("[data-dx-breadcrumb]", "keydown", (root, e) => {
    initBreadcrumb(root);
    if (e.key === "Enter" || e.key === " ") {
      const target = e.target;
      if (target instanceof Element && (target.hasAttribute("data-dx-breadcrumb-link") || target.hasAttribute("data-dx-breadcrumb-current"))) {
        if (target.hasAttribute("aria-disabled")) {
          e.preventDefault();
          return;
        }
        // let click handler dispatch
      }
    }
  });

  document.querySelectorAll("[data-dx-breadcrumb]").forEach(initBreadcrumb);

  /* ---------------- Steps ---------------- */

  function stepsData(root) {
    if (!root._dxSteps) root._dxSteps = { ready: false, index: 0, disabled: null };
    return root._dxSteps;
  }

  function stepsItems(root) {
    return [...root.querySelectorAll("[data-dx-steps-item]")];
  }

  function stepsPanels(root) {
    return [...root.querySelectorAll("[data-dx-steps-panel]")];
  }

  function stepsIsLinear(root) {
    return root.hasAttribute("data-dx-linear");
  }

  function stepsConnector(li, completed) {
    const c = li.querySelector(".dx-steps-connector");
    if (c) c.classList.toggle("dx-steps-connector--completed", completed);
  }

  function stepsRender(root) {
    const st = stepsData(root);
    if (!st.ready) return;
    const items = stepsItems(root);
    const panels = stepsPanels(root);
    const linear = stepsIsLinear(root);
    const active = st.index;
    items.forEach((item, i) => {
      const li = item.closest(".dx-steps-item") || item.closest("li") || item.parentElement;
      const isActive = i === active;
      const isCompleted = i < active;
      let isDisabled = st.disabled?.[i] === true;
      if (!isDisabled && item.hasAttribute("data-dx-disabled")) isDisabled = true;
      if (!isDisabled && linear && i > active + 1) isDisabled = true;
      const textDisabled = item.getAttribute("data-dx-text");
      void textDisabled;
      item.classList.toggle("dx-steps-step--active", isActive);
      item.classList.toggle("dx-steps-step--completed", isCompleted);
      item.classList.toggle("dx-steps-step--disabled", isDisabled);
      if (isActive) item.setAttribute("aria-current", "step");
      else item.removeAttribute("aria-current");
      if (isDisabled) {
        item.setAttribute("aria-disabled", "true");
        item.disabled = true;
        item.tabIndex = -1;
      } else {
        item.removeAttribute("aria-disabled");
        item.disabled = false;
        item.tabIndex = 0;
      }
      if (li) stepsConnector(li, isCompleted);
      const circle = item.querySelector(".dx-steps-circle");
      if (circle) {
        const icon = item.getAttribute("data-dx-icon");
        let html = "";
        if (isCompleted) {
          html = '<span class="dx-steps-check" aria-hidden="true">✓</span>';
        } else if (icon) {
          html = `<span class="dx-steps-icon" aria-hidden="true">${icon}</span>`;
        } else {
          html = `<span class="dx-steps-number" aria-hidden="true">${i + 1}</span>`;
        }
        // only update if changed to avoid focus loss
        if (circle.innerHTML.trim() !== html.trim()) circle.innerHTML = html;
      }
    });
    panels.forEach((panel) => {
      const idx = Number(panel.getAttribute("data-dx-index"));
      panel.hidden = idx !== active;
      if (idx === active) panel.removeAttribute("hidden");
      else panel.setAttribute("hidden", "");
    });
    root.setAttribute("data-dx-selected-index", String(active));
  }

  function stepsSetActive(root, index) {
    const st = stepsData(root);
    if (!st.ready) initSteps(root);
    const items = stepsItems(root);
    if (items.length === 0) return;
    const clamped = Math.min(Math.max(0, index), items.length - 1);
    const linear = stepsIsLinear(root);
    if (linear && clamped > st.index + 1) return;
    const target = items[clamped];
    if (!target) return;
    if (target.hasAttribute("aria-disabled") || target.disabled) return;
    if (clamped === st.index) return;
    st.index = clamped;
    stepsRender(root);
    root.dispatchEvent(new CustomEvent("dx:steps-change", { bubbles: true, detail: { index: clamped } }));
  }

  function initSteps(root) {
    const st = stepsData(root);
    const items = stepsItems(root);
    const unchanged =
      st.ready &&
      st.snapshotItems &&
      st.snapshotItems.length === items.length &&
      st.snapshotItems.every((el, i) => el === items[i]);
    if (unchanged) return;
    if (items.length === 0) {
      // Empty at init (content arrives via htmx swap) — stay uninitialized
      // so the post-swap init can snapshot server-authored state.
      st.ready = false;
      st.snapshotItems = null;
      st.disabled = null;
      return;
    }
    const reinit = Boolean(st.ready);
    st.ready = true;
    st.snapshotItems = items;
    const currentIdx = items.findIndex((el) => el.getAttribute("aria-current") === "step");
    let active = NaN;
    if (reinit) {
      // Item list changed (htmx swap): the server cannot update the root's
      // data-dx-selected-index on an inner swap, so prefer its aria-current
      // and fall back to the previous index.
      const fromAttr = Number(root.getAttribute("data-dx-selected-index"));
      active = currentIdx >= 0 ? currentIdx : Number.isFinite(fromAttr) ? fromAttr : 0;
    } else {
      active = Number(root.getAttribute("data-dx-selected-index"));
      if (Number.isNaN(active)) active = NaN;
      if (!Number.isFinite(active) || Number.isNaN(active)) {
        active = currentIdx >= 0 ? currentIdx : 0;
      }
    }
    st.index = Math.min(Math.max(0, active), items.length - 1);
    st.disabled = items.map(
      (el) => el.hasAttribute("aria-disabled") || el.disabled || el.getAttribute("disabled") !== null,
    );
    // ensure linear disables ahead
    stepsRender(root);
  }

  on("[data-dx-steps-item]", "click", (btn) => {
    const root = btn.closest("[data-dx-steps]");
    if (!root) return;
    initSteps(root);
    const st = stepsData(root);
    const items = stepsItems(root);
    const idxAttr = btn.getAttribute("data-dx-index");
    const idx = idxAttr !== null ? Number(idxAttr) : items.indexOf(btn);
    if (Number.isNaN(idx) || idx < 0) return;
    if (btn.hasAttribute("aria-disabled") || btn.disabled) return;
    if (stepsIsLinear(root) && idx > st.index + 1) return;
    stepsSetActive(root, idx);
  });

  on("[data-dx-steps]", "keydown", (root, e) => {
    initSteps(root);
    const st = stepsData(root);
    const items = stepsItems(root).filter((b) => !b.disabled && b.getAttribute("aria-disabled") !== "true");
    const idx = items.indexOf(document.activeElement);
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      if (items.length === 0) return;
      const next = idx === -1 ? 0 : (idx + 1) % items.length;
      items[next]?.focus();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      if (items.length === 0) return;
      const prev = idx === -1 ? items.length - 1 : (idx - 1 + items.length) % items.length;
      items[prev]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      items[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      items[items.length - 1]?.focus();
    } else if (e.key === "Enter" || e.key === " ") {
      const target = e.target;
      if (target instanceof Element && target.hasAttribute("data-dx-steps-item")) {
        e.preventDefault();
        target.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      }
    }
    void st;
  });

  document.querySelectorAll("[data-dx-steps]").forEach(initSteps);

  /* ---------------- Splitter ---------------- */

  function splitterParsePercent(value, fallback) {
    if (value == null || value === "") return fallback;
    const trimmed = String(value).trim();
    if (trimmed.endsWith("%")) {
      const n = parseFloat(trimmed.slice(0, -1));
      return Number.isNaN(n) ? fallback : n;
    }
    if (trimmed.endsWith("px")) {
      const n = parseFloat(trimmed.slice(0, -2));
      return Number.isNaN(n) ? fallback : n;
    }
    const n = parseFloat(trimmed);
    return Number.isNaN(n) ? fallback : n;
  }

  function splitterData(root) {
    if (!root._dxSplitter) root._dxSplitter = { ready: false, sizes: [], collapsed: [], prevSizes: [], dragging: null };
    return root._dxSplitter;
  }

  function splitterPanes(root) {
    return [...root.querySelectorAll("[data-dx-splitter-pane]")];
  }

  function splitterHandles(root) {
    return [...root.querySelectorAll("[data-dx-splitter-handle]")];
  }

  function splitterIsHorizontal(root) {
    const orient = root.getAttribute("data-dx-orientation") || root.getAttribute("data-dx-direction") || "";
    if (orient === "vertical") return false;
    if (orient === "horizontal") return true;
    return !root.classList.contains("dx-splitter--vertical");
  }

  function splitterEmitResize(root, paneIndex, newSize) {
    const detail = { paneIndex, newSize, cancel: false };
    root.dispatchEvent(new CustomEvent("dx:splitter-resize", { bubbles: true, cancelable: true, detail }));
    return !detail.cancel;
  }

  function splitterEmitCollapse(root, paneIndex, collapse) {
    const detail = { paneIndex, collapse, cancel: false };
    root.dispatchEvent(new CustomEvent("dx:splitter-collapse", { bubbles: true, cancelable: true, detail }));
    return !detail.cancel;
  }

  function splitterRender(root) {
    const st = splitterData(root);
    if (!st.ready) return;
    const panes = splitterPanes(root);
    const handles = splitterHandles(root);
    panes.forEach((pane, i) => {
      const isCollapsed = !!st.collapsed[i];
      const size = st.sizes[i] ?? 0;
      pane.style.flexBasis = isCollapsed ? "0%" : `${size}%`;
      pane.style.display = isCollapsed ? "none" : "";
      pane.classList.toggle("dx-splitter-pane--collapsed", isCollapsed);
      if (isCollapsed) pane.setAttribute("data-dx-collapsed", "");
      else pane.removeAttribute("data-dx-collapsed");
      pane.setAttribute("aria-label", pane.getAttribute("aria-label") || `Pane ${i + 1}`);
      const btn = pane.querySelector("[data-dx-splitter-collapse]");
      if (btn) {
        btn.setAttribute("aria-expanded", String(!isCollapsed));
        btn.setAttribute("aria-label", isCollapsed ? `Expand pane ${i + 1}` : `Collapse pane ${i + 1}`);
      }
    });
    // outside collapse buttons (when pane display none, its button is sibling)
    root.querySelectorAll("[data-dx-splitter-collapse]").forEach((btn) => {
      const idx = Number(btn.getAttribute("data-dx-index"));
      if (!Number.isNaN(idx) && st.collapsed[idx] !== undefined) {
        const isCollapsed = !!st.collapsed[idx];
        btn.setAttribute("aria-expanded", String(!isCollapsed));
        btn.setAttribute("aria-label", isCollapsed ? `Expand pane ${idx + 1}` : `Collapse pane ${idx + 1}`);
        // toggle outside class visibility handled via collapsed state of pane
        btn.hidden = false;
        if (panes[idx] && panes[idx].style.display === "none") {
          btn.classList.add("dx-splitter-collapse--outside");
        } else {
          btn.classList.remove("dx-splitter-collapse--outside");
        }
      }
    });
    handles.forEach((handle) => {
      const idx = Number(handle.getAttribute("data-dx-index"));
      const size = st.sizes[idx] ?? 0;
      const pane = panes[idx];
      const min = pane ? splitterParsePercent(pane.getAttribute("data-dx-min"), 0) : 0;
      const max = pane ? splitterParsePercent(pane.getAttribute("data-dx-max"), 100) : 100;
      handle.setAttribute("aria-valuemin", String(min));
      handle.setAttribute("aria-valuemax", String(max));
      handle.setAttribute("aria-valuenow", String(Math.round(size)));
      handle.setAttribute("aria-orientation", splitterIsHorizontal(root) ? "horizontal" : "vertical");
      handle.setAttribute("role", "separator");
      handle.setAttribute("aria-label", handle.getAttribute("aria-label") || `Resize handle ${idx + 1}`);
      const leftCollapsed = !!st.collapsed[idx];
      const rightCollapsed = !!st.collapsed[idx + 1];
      handle.tabIndex = leftCollapsed || rightCollapsed ? -1 : 0;
    });
  }

  function splitterToggleCollapse(root, paneIndex) {
    const st = splitterData(root);
    if (!st.ready) initSplitter(root);
    const panes = splitterPanes(root);
    if (paneIndex < 0 || paneIndex >= panes.length) return;
    const pane = panes[paneIndex];
    const collapsible = pane && pane.hasAttribute("data-dx-collapsible");
    if (!collapsible) {
      // also allow if sibling is collapsible? spec says pane's collapsible flag
      // For handle keyboard, either adjacent may be collapsible — we already choose target pane
      // If not collapsible, still emit but may be ignored
      // check if any pane is collapsible at that index
      if (!pane) return;
    }
    const willCollapse = !st.collapsed[paneIndex];
    if (!splitterEmitCollapse(root, paneIndex, willCollapse)) return;
    if (willCollapse) {
      st.prevSizes = [...st.sizes];
      const size = st.sizes[paneIndex] ?? 0;
      const siblingIndex = paneIndex < st.sizes.length - 1 ? paneIndex + 1 : paneIndex - 1;
      st.collapsed[paneIndex] = true;
      if (siblingIndex >= 0 && siblingIndex < st.sizes.length) {
        st.sizes[siblingIndex] = (st.sizes[siblingIndex] ?? 0) + size;
        st.sizes[paneIndex] = 0;
      } else {
        st.sizes[paneIndex] = 0;
      }
    } else {
      st.collapsed[paneIndex] = false;
      if (st.prevSizes.length === st.sizes.length) {
        st.sizes = [...st.prevSizes];
      } else {
        // fallback distribute equally
        const count = panes.length;
        st.sizes = panes.map(() => 100 / count);
        st.collapsed = panes.map(() => false);
      }
    }
    splitterRender(root);
  }

  function initSplitter(root) {
    const st = splitterData(root);
    if (st.ready) return;
    st.ready = true;
    const panes = splitterPanes(root);
    const count = panes.length;
    st.collapsed = panes.map((p) => p.hasAttribute("data-dx-collapsed"));
    const raw = panes.map((p, i) => {
      const sizeAttr = p.getAttribute("data-dx-size");
      if (sizeAttr) return splitterParsePercent(sizeAttr, 100 / Math.max(1, count));
      const fb = p.style.flexBasis;
      if (fb) return splitterParsePercent(fb, 100 / Math.max(1, count));
      return 100 / Math.max(1, count);
    });
    raw.forEach((s, i) => {
      if (st.collapsed[i]) raw[i] = 0;
    });
    const nonCollapsedSum = raw.reduce((acc, s, i) => acc + (st.collapsed[i] ? 0 : s), 0);
    if (nonCollapsedSum > 0 && Math.abs(nonCollapsedSum - 100) > 0.01) {
      const factor = 100 / nonCollapsedSum;
      raw.forEach((s, i) => {
        if (!st.collapsed[i]) raw[i] = s * factor;
      });
    } else if (nonCollapsedSum === 0 && count > 0) {
      panes.forEach((_, i) => (raw[i] = 100 / count));
      st.collapsed = panes.map(() => false);
    }
    st.sizes = raw;
    st.prevSizes = [...raw];
    splitterRender(root);
  }

  function splitterValueFromPointer(root, handleIndex, clientX, clientY) {
    const st = splitterData(root);
    const container = root;
    const rect = container.getBoundingClientRect();
    let absolute;
    if (splitterIsHorizontal(root)) {
      if (rect.width === 0) return null;
      absolute = ((clientX - rect.left) / rect.width) * 100;
    } else {
      if (rect.height === 0) return null;
      absolute = ((clientY - rect.top) / rect.height) * 100;
    }
    let sumBefore = 0;
    for (let i = 0; i < handleIndex; i++) {
      sumBefore += st.sizes[i] ?? 0;
    }
    return absolute - sumBefore;
  }

  on("[data-dx-splitter-handle]", "pointerdown", (handle, e) => {
    const root = handle.closest("[data-dx-splitter]");
    if (!root) return;
    initSplitter(root);
    const st = splitterData(root);
    const idx = Number(handle.getAttribute("data-dx-index"));
    if (Number.isNaN(idx)) return;
    if (st.collapsed[idx] || st.collapsed[idx + 1]) return;
    e.preventDefault();
    handle.focus();
    if (typeof handle.setPointerCapture === "function") {
      try { handle.setPointerCapture(e.pointerId); } catch {}
    }
    st.dragging = { handleIndex: idx, pointerId: e.pointerId };
    const onMove = (ev) => {
      if (!st.dragging || st.dragging.pointerId !== ev.pointerId) return;
      const leftRaw = splitterValueFromPointer(root, idx, ev.clientX, ev.clientY);
      if (leftRaw == null) return;
      const panes = splitterPanes(root);
      const mins = panes.map((p) => splitterParsePercent(p.getAttribute("data-dx-min"), 0));
      const maxs = panes.map((p) => splitterParsePercent(p.getAttribute("data-dx-max"), 100));
      const oldLeft = st.sizes[idx] ?? 0;
      const oldRight = st.sizes[idx + 1] ?? 0;
      const total = oldLeft + oldRight;
      if (total <= 0) return;
      let newLeft = Math.min(Math.max(leftRaw, mins[idx] ?? 0), maxs[idx] ?? 100);
      let newRight = total - newLeft;
      const rightMin = mins[idx + 1] ?? 0;
      const rightMax = maxs[idx + 1] ?? 100;
      if (newRight < rightMin) {
        newRight = rightMin;
        newLeft = total - newRight;
        if (newLeft < (mins[idx] ?? 0) || newLeft > (maxs[idx] ?? 100)) return;
      } else if (newRight > rightMax) {
        newRight = rightMax;
        newLeft = total - newRight;
        if (newLeft < (mins[idx] ?? 0) || newLeft > (maxs[idx] ?? 100)) return;
      }
      newLeft = Math.min(Math.max(newLeft, mins[idx] ?? 0), maxs[idx] ?? 100);
      newRight = total - newLeft;
      if (!splitterEmitResize(root, idx, newLeft)) return;
      st.sizes[idx] = newLeft;
      st.sizes[idx + 1] = newRight;
      splitterRender(root);
    };
    const onUp = (ev) => {
      if (!st.dragging || st.dragging.pointerId !== ev.pointerId) return;
      st.dragging = null;
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", onUp);
      handle.removeEventListener("pointercancel", onUp);
      try { handle.releasePointerCapture(ev.pointerId); } catch {}
    };
    handle.addEventListener("pointermove", onMove);
    handle.addEventListener("pointerup", onUp);
    handle.addEventListener("pointercancel", onUp);
  });

  on("[data-dx-splitter-collapse]", "click", (btn) => {
    const root = btn.closest("[data-dx-splitter]");
    if (!root) return;
    initSplitter(root);
    const idx = Number(btn.getAttribute("data-dx-index"));
    if (Number.isNaN(idx)) return;
    splitterToggleCollapse(root, idx);
  });

  on("[data-dx-splitter-handle]", "keydown", (handle, e) => {
    const root = handle.closest("[data-dx-splitter]");
    if (!root) return;
    initSplitter(root);
    const st = splitterData(root);
    const idx = Number(handle.getAttribute("data-dx-index"));
    if (Number.isNaN(idx)) return;
    const isHorizontal = splitterIsHorizontal(root);
    const panes = splitterPanes(root);
    const mins = panes.map((p) => splitterParsePercent(p.getAttribute("data-dx-min"), 0));
    const maxs = panes.map((p) => splitterParsePercent(p.getAttribute("data-dx-max"), 100));
    const oldLeft = st.sizes[idx] ?? 0;
    const oldRight = st.sizes[idx + 1] ?? 0;
    const total = oldLeft + oldRight;
    const leftCollapsible = panes[idx]?.hasAttribute("data-dx-collapsible");
    const rightCollapsible = panes[idx + 1]?.hasAttribute("data-dx-collapsible");
    const bothCollapsible = leftCollapsible || rightCollapsible;
    let delta = 0;
    if (isHorizontal) {
      if (e.key === "ArrowLeft") delta = -5;
      else if (e.key === "ArrowRight") delta = 5;
    } else {
      if (e.key === "ArrowUp") delta = -5;
      else if (e.key === "ArrowDown") delta = 5;
    }
    if (e.key === "Home") {
      e.preventDefault();
      let targetLeft = mins[idx] ?? 0;
      let targetRight = total - targetLeft;
      targetRight = Math.min(Math.max(targetRight, mins[idx + 1] ?? 0), maxs[idx + 1] ?? 100);
      targetLeft = total - targetRight;
      targetLeft = Math.min(Math.max(targetLeft, mins[idx] ?? 0), maxs[idx] ?? 100);
      if (!splitterEmitResize(root, idx, targetLeft)) return;
      st.sizes[idx] = targetLeft;
      st.sizes[idx + 1] = targetRight;
      splitterRender(root);
      return;
    }
    if (e.key === "End") {
      e.preventDefault();
      let targetLeft = maxs[idx] ?? 100;
      targetLeft = Math.min(targetLeft, total - (mins[idx + 1] ?? 0));
      let targetRight = total - targetLeft;
      targetRight = Math.min(Math.max(targetRight, mins[idx + 1] ?? 0), maxs[idx + 1] ?? 100);
      targetLeft = total - targetRight;
      targetLeft = Math.min(Math.max(targetLeft, mins[idx] ?? 0), maxs[idx] ?? 100);
      if (!splitterEmitResize(root, idx, targetLeft)) return;
      st.sizes[idx] = targetLeft;
      st.sizes[idx + 1] = targetRight;
      splitterRender(root);
      return;
    }
    if ((e.key === "Enter" || e.key === " ") && bothCollapsible) {
      e.preventDefault();
      const targetIdx = leftCollapsible ? idx : idx + 1;
      splitterToggleCollapse(root, targetIdx);
      return;
    }
    if (delta !== 0) {
      e.preventDefault();
      let newLeft = oldLeft + delta;
      let newRight = total - newLeft;
      const leftMin = mins[idx] ?? 0;
      const leftMax = maxs[idx] ?? 100;
      const rightMin = mins[idx + 1] ?? 0;
      const rightMax = maxs[idx + 1] ?? 100;
      newLeft = Math.min(Math.max(newLeft, leftMin), leftMax);
      newRight = total - newLeft;
      if (newRight < rightMin || newRight > rightMax) {
        newRight = Math.min(Math.max(newRight, rightMin), rightMax);
        newLeft = total - newRight;
        newLeft = Math.min(Math.max(newLeft, leftMin), leftMax);
        newRight = total - newLeft;
      }
      if (!splitterEmitResize(root, idx, newLeft)) return;
      st.sizes[idx] = newLeft;
      st.sizes[idx + 1] = newRight;
      splitterRender(root);
    }
  });

  document.querySelectorAll("[data-dx-splitter]").forEach(initSplitter);

  /* ---------------- Toc ---------------- */

  function tocData(root) {
    if (!root._dxToc) root._dxToc = { ready: false, active: null, observer: null, handler: null };
    return root._dxToc;
  }

  function tocItems(root) {
    return [...root.querySelectorAll("[data-dx-toc-item]")];
  }

  function tocScope(root) {
    const sel = root.getAttribute("data-dx-selector") || root.getAttribute("data-dx-toc-selector") || root.getAttribute("data-dx-scope");
    if (sel) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    return null;
  }

  function tocSetActive(root, selector) {
    const st = tocData(root);
    st.active = selector;
    const items = tocItems(root);
    items.forEach((link) => {
      const sel = link.getAttribute("data-dx-selector") || link.getAttribute("href") || "";
      const normalized = sel.startsWith("#") || sel.startsWith(".") ? sel : `#${sel}`;
      const targetSel = link.getAttribute("data-dx-selector") || link.getAttribute("href");
      const isActive = targetSel === selector || normalized === selector || link.getAttribute("data-dx-selector") === selector;
      // also check if href matches selector
      const href = link.getAttribute("href");
      const isHrefActive = href === selector;
      const active = isActive || isHrefActive;
      if (active) {
        link.setAttribute("aria-current", "location");
        link.classList.add("dx-toc-link--active");
      } else {
        link.removeAttribute("aria-current");
        link.classList.remove("dx-toc-link--active");
      }
    });
  }

  function tocHandleSelect(root, item) {
    const selector = item.getAttribute("data-dx-selector") || item.getAttribute("href") || "";
    const text = item.getAttribute("data-dx-text") || item.textContent.trim();
    tocSetActive(root, selector);
    root.dispatchEvent(new CustomEvent("dx:toc-click", { bubbles: true, detail: { text, selector } }));
    const target = document.querySelector(selector);
    if (target) {
      try {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch {
        target.scrollIntoView();
      }
      const htmlEl = target;
      if (htmlEl instanceof HTMLElement) {
        const needsTab = htmlEl.getAttribute("tabindex") == null && htmlEl.tabIndex === -1;
        if (needsTab || htmlEl.tabIndex < 0) {
          htmlEl.setAttribute("tabindex", "-1");
          htmlEl.focus({ preventScroll: true });
        } else {
          htmlEl.focus({ preventScroll: true });
        }
      }
    }
  }

  function initToc(root) {
    const st = tocData(root);
    if (st.ready) return;
    st.ready = true;
    const items = tocItems(root);
    if (items.length === 0) return;
    let initial = items.find((el) => el.getAttribute("aria-current") === "location");
    const initialSelector = initial ? (initial.getAttribute("data-dx-selector") || initial.getAttribute("href")) : items[0].getAttribute("data-dx-selector") || items[0].getAttribute("href");
    if (initialSelector) tocSetActive(root, initialSelector);

    const scope = tocScope(root);
    const container = scope || window;

    // helper to find active by scroll position
    const updateActiveByScroll = () => {
      let best = null;
      let closestAbove = null;
      let bestTop = Infinity;
      let closestTop = -Infinity;
      const containerTop = scope ? scope.getBoundingClientRect().top : 0;
      for (const item of items) {
        const selector = item.getAttribute("data-dx-selector") || item.getAttribute("href");
        if (!selector) continue;
        const el = document.querySelector(selector);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const top = rect.top - containerTop;
        if (top <= 80) {
          if (top > closestTop) {
            closestTop = top;
            closestAbove = selector;
          }
        } else {
          if (top < bestTop) {
            bestTop = top;
            best = selector;
          }
        }
      }
      const next = closestAbove || best || initialSelector;
      if (next && next !== st.active) {
        tocSetActive(root, next);
      }
    };

    const scrollHandler = () => updateActiveByScroll();
    st.handler = scrollHandler;

    if (typeof IntersectionObserver !== "undefined") {
      const obsOptions = scope
        ? { root: scope, rootMargin: "-20% 0px -70% 0px", threshold: 0 }
        : { root: null, rootMargin: "-20% 0px -70% 0px", threshold: 0 };
      try {
        const observer = new IntersectionObserver((entries) => {
          const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          if (visible[0]) {
            const target = visible[0].target;
            for (const item of items) {
              const selector = item.getAttribute("data-dx-selector") || item.getAttribute("href");
              if (!selector) continue;
              const el = document.querySelector(selector);
              if (el === target) {
                tocSetActive(root, selector);
                return;
              }
              if (selector.startsWith("#") && target.id === selector.slice(1)) {
                tocSetActive(root, selector);
                return;
              }
            }
          } else {
            updateActiveByScroll();
          }
        }, obsOptions);
        st.observer = observer;
        for (const item of items) {
          const selector = item.getAttribute("data-dx-selector") || item.getAttribute("href");
          if (!selector) continue;
          const el = document.querySelector(selector);
          if (el) observer.observe(el);
        }
      } catch {}
    }

    if (container === window) {
      window.addEventListener("scroll", scrollHandler, { passive: true });
      updateActiveByScroll();
    } else if (scope) {
      scope.addEventListener("scroll", scrollHandler, { passive: true });
      updateActiveByScroll();
    }
    // orientation class already via markup, but ensure
    const orient = root.getAttribute("data-dx-orientation") || "vertical";
    root.classList.toggle("dx-toc--vertical", orient === "vertical");
    root.classList.toggle("dx-toc--horizontal", orient === "horizontal");
  }

  on("[data-dx-toc-item]", "click", (link, e) => {
    const root = link.closest("[data-dx-toc]");
    if (!root) return;
    initToc(root);
    e.preventDefault();
    tocHandleSelect(root, link);
  });

  document.querySelectorAll("[data-dx-toc]").forEach(initToc);

  /* ---------------- Carousel ---------------- */

  function carouselData(root) {
    if (!root._dxCarousel) root._dxCarousel = { ready: false, index: 0, timer: null, manualPaused: false, hoverPaused: false };
    return root._dxCarousel;
  }

  function carouselSlides(root) {
    return [...root.querySelectorAll("[data-dx-carousel-item]")];
  }

  function carouselIndicators(root) {
    return [...root.querySelectorAll("[data-dx-carousel-indicator]")];
  }

  function carouselIsAuto(root) {
    return root.hasAttribute("data-dx-auto");
  }

  function carouselInterval(root) {
    const raw = root.getAttribute("data-dx-interval");
    const n = raw ? Number(raw) : 3000;
    return Number.isFinite(n) && n > 0 ? n : 3000;
  }

  function carouselPauseOnHover(root) {
    const val = root.getAttribute("data-dx-pause-on-hover");
    if (val === "false") return false;
    return true;
  }

  function carouselRender(root) {
    const st = carouselData(root);
    if (!st.ready) return;
    const slides = carouselSlides(root);
    const indicators = carouselIndicators(root);
    const total = slides.length;
    const active = total === 0 ? 0 : ((st.index % total) + total) % total;
    st.index = active;
    slides.forEach((slide, i) => {
      const isActive = i === active;
      slide.classList.toggle("dx-carousel-slide--active", isActive);
      if (isActive) {
        slide.removeAttribute("hidden");
        slide.removeAttribute("aria-hidden");
      } else {
        slide.setAttribute("hidden", "");
        slide.setAttribute("aria-hidden", "true");
      }
      slide.setAttribute("aria-label", `Slide ${i + 1} of ${total}`);
      slide.setAttribute("aria-roledescription", "slide");
      slide.setAttribute("role", "group");
    });
    indicators.forEach((btn, i) => {
      const isActive = i === active;
      btn.classList.toggle("dx-carousel-indicator--active", isActive);
      if (isActive) btn.setAttribute("aria-current", "true");
      else btn.removeAttribute("aria-current");
      btn.setAttribute("aria-label", `Go to slide ${i + 1}`);
      btn.tabIndex = 0;
    });
    const pauseBtn = root.querySelector("[data-dx-carousel-pause]");
    if (pauseBtn) {
      pauseBtn.setAttribute("aria-pressed", String(st.manualPaused));
      pauseBtn.setAttribute("aria-label", st.manualPaused ? "Resume" : "Pause");
      pauseBtn.textContent = st.manualPaused ? "▶" : "⏸";
    }
    // handle showArrows / showIndicators via attributes
    const showArrowsAttr = root.getAttribute("data-dx-show-arrows");
    const showIndicatorsAttr = root.getAttribute("data-dx-show-indicators");
    const showArrows = showArrowsAttr === "false" ? false : true;
    const showIndicators = showIndicatorsAttr === "false" ? false : true;
    root.querySelectorAll("[data-dx-carousel-prev], [data-dx-carousel-next]").forEach((el) => {
      el.hidden = !showArrows || total <= 1;
    });
    const indContainer = root.querySelector("[data-dx-carousel-indicators]");
    if (indContainer) indContainer.hidden = !showIndicators || total <= 1;
    // viewport id for aria-controls already set
  }

  function carouselUpdateTimer(root) {
    const st = carouselData(root);
    if (st.timer) {
      clearInterval(st.timer);
      st.timer = null;
    }
    if (!carouselIsAuto(root) || st.manualPaused || st.hoverPaused) return;
    const slides = carouselSlides(root);
    if (slides.length <= 1) return;
    const interval = carouselInterval(root);
    st.timer = setInterval(() => {
      carouselSetIndex(root, st.index + 1);
    }, interval);
  }

  function carouselSetIndex(root, next) {
    const st = carouselData(root);
    if (!st.ready) initCarousel(root);
    const slides = carouselSlides(root);
    if (slides.length === 0) return;
    const clamped = ((next % slides.length) + slides.length) % slides.length;
    if (clamped === st.index) return;
    st.index = clamped;
    carouselRender(root);
    carouselUpdateTimer(root);
    root.dispatchEvent(new CustomEvent("dx:carousel-change", { bubbles: true, detail: { index: clamped } }));
  }

  function carouselPrev(root) {
    const st = carouselData(root);
    carouselSetIndex(root, st.index - 1);
  }

  function carouselNext(root) {
    const st = carouselData(root);
    carouselSetIndex(root, st.index + 1);
  }

  function initCarousel(root) {
    const st = carouselData(root);
    if (st.ready) return;
    st.ready = true;
    const slides = carouselSlides(root);
    if (slides.length === 0) return;
    let idx = Number(root.getAttribute("data-dx-selected-index"));
    if (Number.isNaN(idx) || !Number.isFinite(idx)) {
      const activeIdx = slides.findIndex((s) => s.classList.contains("dx-carousel-slide--active") || !s.hasAttribute("hidden"));
      idx = activeIdx >= 0 ? activeIdx : 0;
    }
    st.index = Math.min(Math.max(0, idx), slides.length - 1);
    st.manualPaused = false;
    st.hoverPaused = false;
    root.setAttribute("role", "region");
    root.setAttribute("aria-roledescription", "carousel");
    if (!root.hasAttribute("aria-label")) root.setAttribute("aria-label", "Carousel");
    if (!root.hasAttribute("tabindex")) root.tabIndex = 0;
    carouselRender(root);
    carouselUpdateTimer(root);
  }

  on("[data-dx-carousel-prev]", "click", (btn) => {
    const root = btn.closest("[data-dx-carousel]");
    if (!root) return;
    initCarousel(root);
    carouselPrev(root);
  });

  on("[data-dx-carousel-next]", "click", (btn) => {
    const root = btn.closest("[data-dx-carousel]");
    if (!root) return;
    initCarousel(root);
    carouselNext(root);
  });

  on("[data-dx-carousel-indicator]", "click", (btn) => {
    const root = btn.closest("[data-dx-carousel]");
    if (!root) return;
    initCarousel(root);
    const idx = Number(btn.getAttribute("data-dx-index"));
    if (!Number.isNaN(idx)) carouselSetIndex(root, idx);
  });

  on("[data-dx-carousel-pause]", "click", (btn) => {
    const root = btn.closest("[data-dx-carousel]");
    if (!root) return;
    initCarousel(root);
    const st = carouselData(root);
    st.manualPaused = !st.manualPaused;
    carouselRender(root);
    carouselUpdateTimer(root);
  });

  on("[data-dx-carousel]", "keydown", (root, e) => {
    initCarousel(root);
    const slides = carouselSlides(root);
    if (slides.length === 0) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      carouselPrev(root);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      carouselNext(root);
    } else if (e.key === "Home") {
      e.preventDefault();
      carouselSetIndex(root, 0);
    } else if (e.key === "End") {
      e.preventDefault();
      carouselSetIndex(root, slides.length - 1);
    }
  });

  on("[data-dx-carousel]", "mouseover", (root, e) => {
    if (e.relatedTarget instanceof Node && root.contains(e.relatedTarget)) return;
    if (!carouselIsAuto(root) || !carouselPauseOnHover(root)) return;
    const st = carouselData(root);
    st.hoverPaused = true;
    carouselUpdateTimer(root);
  });

  on("[data-dx-carousel]", "mouseout", (root, e) => {
    if (e.relatedTarget instanceof Node && root.contains(e.relatedTarget)) return;
    if (!carouselIsAuto(root) || !carouselPauseOnHover(root)) return;
    const st = carouselData(root);
    st.hoverPaused = false;
    carouselUpdateTimer(root);
  });

  on("[data-dx-carousel]", "focusin", (root) => {
    if (!carouselIsAuto(root) || !carouselPauseOnHover(root)) return;
    const st = carouselData(root);
    st.hoverPaused = true;
    carouselUpdateTimer(root);
  });

  on("[data-dx-carousel]", "focusout", (root, e) => {
    if (!carouselIsAuto(root) || !carouselPauseOnHover(root)) return;
    const related = e.relatedTarget;
    if (related instanceof Element && root.contains(related)) return;
    const st = carouselData(root);
    st.hoverPaused = false;
    carouselUpdateTimer(root);
  });

  document.querySelectorAll("[data-dx-carousel]").forEach(initCarousel);

  /* ---------------- Tree ---------------- */

  function treeData(root) {
    if (!root._dxTree) root._dxTree = { ready: false };
    return root._dxTree;
  }

  function initTree(root) {
    const st = treeData(root);
    if (st.ready) return;
    st.ready = true;
  }

  on("[data-dx-tree-caret]", "click", (btn) => {
    const item = btn.closest("[data-dx-tree-item]");
    const root = btn.closest("[data-dx-tree]");
    if (!item || !root) return;
    initTree(root);
    const expanded = item.getAttribute("aria-expanded") === "true";
    const key = item.getAttribute("data-dx-key");
    const children = item.querySelector(":scope > [data-dx-tree-children]");
    if (children) children.hidden = expanded;
    item.setAttribute("aria-expanded", String(!expanded));
    btn.setAttribute("aria-expanded", String(!expanded));
    btn.setAttribute("aria-label", `${!expanded ? "Collapse" : "Expand"} ${item.getAttribute("data-dx-text") || ""}`.trim());
    const detail = { key, text: item.getAttribute("data-dx-text") };
    root.dispatchEvent(new CustomEvent(expanded ? "dx:tree-collapse" : "dx:tree-expand", { bubbles: true, detail }));
  });

  on("[data-dx-tree-item]", "click", (item) => {
    const root = item.closest("[data-dx-tree]");
    if (!root || !item.hasAttribute("data-dx-tree-item")) return;
    initTree(root);
    if (item.hasAttribute("aria-disabled") || item.getAttribute("data-dx-disabled") !== null) return;
    // if click was on caret, already handled
    if (item.querySelector(":scope > [data-dx-tree-caret]") && item.contains(document.activeElement) && document.activeElement.hasAttribute("data-dx-tree-caret")) return;
    const key = item.getAttribute("data-dx-key");
    const text = item.getAttribute("data-dx-text") || item.textContent.trim();
    const selected = item.getAttribute("aria-selected") === "true";
    const mode = root.getAttribute("data-dx-selection-mode") || "single";
    if (mode === "multiple") {
      item.setAttribute("aria-selected", String(!selected));
    } else {
      root.querySelectorAll("[data-dx-tree-item][aria-selected='true']").forEach((el) => el.setAttribute("aria-selected", "false"));
      item.setAttribute("aria-selected", "true");
    }
    root.dispatchEvent(new CustomEvent("dx:tree-select", { bubbles: true, detail: { key, text, selected: !selected } }));
  });

  on("[data-dx-tree]", "keydown", (root, e) => {
    initTree(root);
    const items = [...root.querySelectorAll("[data-dx-tree-item]:not([aria-disabled])")].filter((el) => el.getAttribute("data-dx-disabled") === null);
    const idx = items.indexOf(document.activeElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = items[idx + 1] ?? items[0];
      next?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = items[idx - 1] ?? items[items.length - 1];
      prev?.focus();
    } else if (e.key === "ArrowRight") {
      const cur = document.activeElement;
      if (cur && cur.getAttribute("aria-expanded") === "false") {
        const caret = cur.querySelector("[data-dx-tree-caret]");
        caret?.click();
      } else if (cur) {
        const child = cur.querySelector(":scope > [data-dx-tree-children] [data-dx-tree-item]");
        child?.focus();
      }
    } else if (e.key === "ArrowLeft") {
      const cur = document.activeElement;
      if (cur && cur.getAttribute("aria-expanded") === "true") {
        const caret = cur.querySelector("[data-dx-tree-caret]");
        caret?.click();
      } else {
        const parent = cur?.closest("[data-dx-tree-children]")?.closest("[data-dx-tree-item]");
        parent?.focus();
      }
    } else if (e.key === "Home") {
      e.preventDefault();
      items[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      items[items.length - 1]?.focus();
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      document.activeElement?.click();
    }
  });

  document.querySelectorAll("[data-dx-tree]").forEach(initTree);

  /* ---------------- PickList ---------------- */

  function pickListData(root) {
    if (!root._dxPickList) root._dxPickList = { ready: false };
    return root._dxPickList;
  }

  function pickListSelectedKeys(list) {
    return [...list.querySelectorAll("[data-dx-picklist-item][aria-selected='true']")].map((el) => el.getAttribute("data-dx-key"));
  }

  function initPickList(root) {
    const st = pickListData(root);
    if (st.ready) return;
    st.ready = true;
  }

  function pickListMove(root, direction) {
    const sourceList = root.querySelector('[data-dx-side="source"]');
    const targetList = root.querySelector('[data-dx-side="target"]');
    if (!sourceList || !targetList) return;
    let moved = [];
    let sourceItems = [...sourceList.querySelectorAll("[data-dx-picklist-item]")];
    let targetItems = [...targetList.querySelectorAll("[data-dx-picklist-item]")];
    if (direction === "toTarget") {
      moved = sourceList.querySelectorAll("[data-dx-picklist-item][aria-selected='true']:not([aria-disabled])");
      moved.forEach((el) => targetList.appendChild(el));
    } else if (direction === "toSource") {
      moved = targetList.querySelectorAll("[data-dx-picklist-item][aria-selected='true']:not([aria-disabled])");
      moved.forEach((el) => sourceList.appendChild(el));
    } else if (direction === "allToTarget") {
      moved = sourceList.querySelectorAll("[data-dx-picklist-item]:not([aria-disabled])");
      moved.forEach((el) => targetList.appendChild(el));
    } else if (direction === "allToSource") {
      moved = targetList.querySelectorAll("[data-dx-picklist-item]:not([aria-disabled])");
      moved.forEach((el) => sourceList.appendChild(el));
    } else if (direction === "up" || direction === "down") {
      const list = root.querySelector('[data-dx-side="target"]');
      const selected = [...list.querySelectorAll("[data-dx-picklist-item][aria-selected='true']")];
      if (selected.length === 0) return;
      if (direction === "up") {
        for (const el of selected) {
          const prev = el.previousElementSibling;
          if (prev && !prev.hasAttribute("aria-disabled")) el.parentNode.insertBefore(el, prev);
        }
      } else {
        for (let i = selected.length - 1; i >= 0; i--) {
          const el = selected[i];
          const next = el.nextElementSibling;
          if (next && !next.hasAttribute("aria-disabled")) el.parentNode.insertBefore(next, el);
        }
      }
      moved = selected;
    }
    // clear selection
    root.querySelectorAll("[data-dx-picklist-item][aria-selected='true']").forEach((el) => el.setAttribute("aria-selected", "false"));
    const source = [...sourceList.querySelectorAll("[data-dx-picklist-item]")].map((el) => ({ key: el.getAttribute("data-dx-key"), text: el.getAttribute("data-dx-text") }));
    const target = [...targetList.querySelectorAll("[data-dx-picklist-item]")].map((el) => ({ key: el.getAttribute("data-dx-key"), text: el.getAttribute("data-dx-text") }));
    moved = [...moved].map((el) => ({ key: el.getAttribute("data-dx-key"), text: el.getAttribute("data-dx-text") }));
    root.dispatchEvent(new CustomEvent("dx:picklist-move", { bubbles: true, detail: { source, target, moved, direction } }));
  }

  on("[data-dx-picklist-item]", "click", (item) => {
    const root = item.closest("[data-dx-picklist]");
    if (!root || item.hasAttribute("aria-disabled")) return;
    initPickList(root);
    const selected = item.getAttribute("aria-selected") === "true";
    item.setAttribute("aria-selected", String(!selected));
    item.focus();
  });

  on("[data-dx-picklist-to-target]", "click", (btn) => {
    const root = btn.closest("[data-dx-picklist]");
    if (!root) return;
    initPickList(root);
    pickListMove(root, "toTarget");
  });

  on("[data-dx-picklist-to-source]", "click", (btn) => {
    const root = btn.closest("[data-dx-picklist]");
    if (!root) return;
    initPickList(root);
    pickListMove(root, "toSource");
  });

  on("[data-dx-picklist-all-to-target]", "click", (btn) => {
    const root = btn.closest("[data-dx-picklist]");
    if (!root) return;
    initPickList(root);
    pickListMove(root, "allToTarget");
  });

  on("[data-dx-picklist-all-to-source]", "click", (btn) => {
    const root = btn.closest("[data-dx-picklist]");
    if (!root) return;
    initPickList(root);
    pickListMove(root, "allToSource");
  });

  on("[data-dx-picklist-up]", "click", (btn) => {
    const root = btn.closest("[data-dx-picklist]");
    if (!root) return;
    initPickList(root);
    pickListMove(root, "up");
  });

  on("[data-dx-picklist-down]", "click", (btn) => {
    const root = btn.closest("[data-dx-picklist]");
    if (!root) return;
    initPickList(root);
    pickListMove(root, "down");
  });

  on("[data-dx-picklist]", "keydown", (root, e) => {
    initPickList(root);
    const activeList = document.activeElement?.closest("[data-dx-picklist-list]");
    if (!activeList) return;
    const items = [...activeList.querySelectorAll("[data-dx-picklist-item]:not([aria-disabled])")];
    const idx = items.indexOf(document.activeElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = items[idx + 1] ?? items[0];
      next?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = items[idx - 1] ?? items[items.length - 1];
      prev?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      items[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      items[items.length - 1]?.focus();
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      document.activeElement?.click();
    }
  });

  document.querySelectorAll("[data-dx-picklist]").forEach(initPickList);

  /* ---------------- Scheduler ---------------- */

  function schedulerData(root) {
    if (!root._dxScheduler) root._dxScheduler = { ready: false };
    return root._dxScheduler;
  }
  function initScheduler(root) {
    const st = schedulerData(root);
    if (st.ready) return;
    st.ready = true;
  }
  on("[data-dx-scheduler-prev]", "click", (btn) => {
    const root = btn.closest("[data-dx-scheduler]");
    if (!root) return;
    initScheduler(root);
    root.dispatchEvent(new CustomEvent("dx:scheduler-date-change", { bubbles: true, detail: { dir: -1 } }));
  });
  on("[data-dx-scheduler-next]", "click", (btn) => {
    const root = btn.closest("[data-dx-scheduler]");
    if (!root) return;
    initScheduler(root);
    root.dispatchEvent(new CustomEvent("dx:scheduler-date-change", { bubbles: true, detail: { dir: 1 } }));
  });
  on("[data-dx-scheduler-event]", "click", (el) => {
    const root = el.closest("[data-dx-scheduler]");
    if (!root) return;
    initScheduler(root);
    const id = el.getAttribute("data-dx-id");
    root.dispatchEvent(new CustomEvent("dx:scheduler-event-click", { bubbles: true, detail: { id } }));
  });
  on("[data-dx-scheduler-slot]", "click", (el) => {
    const root = el.closest("[data-dx-scheduler]");
    if (!root) return;
    initScheduler(root);
    root.dispatchEvent(new CustomEvent("dx:scheduler-slot-click", { bubbles: true, detail: {} }));
  });
  document.querySelectorAll("[data-dx-scheduler]").forEach(initScheduler);

  /* ---------------- Gantt ---------------- */

  function ganttData(root) {
    if (!root._dxGantt) root._dxGantt = { ready: false };
    return root._dxGantt;
  }
  function initGantt(root) {
    const st = ganttData(root);
    if (st.ready) return;
    st.ready = true;
  }
  on("[data-dx-gantt-bar]", "click", (el) => {
    const root = el.closest("[data-dx-gantt]");
    if (!root) return;
    initGantt(root);
    const id = el.getAttribute("data-dx-id");
    root.dispatchEvent(new CustomEvent("dx:gantt-task-click", { bubbles: true, detail: { id } }));
  });
  document.querySelectorAll("[data-dx-gantt]").forEach(initGantt);

  /* ---------------- Chart ---------------- */

  function chartData(root) {
    if (!root._dxChart) root._dxChart = { ready: false };
    return root._dxChart;
  }
  function initChart(root) {
    const st = chartData(root);
    if (st.ready) return;
    st.ready = true;
    // htmx chart is server-rendered reference; behavior only wires tooltips + click from data-dx-series JSON if present
    try {
      const raw = root.getAttribute("data-dx-series");
      if (!raw) return;
      JSON.parse(raw);
    } catch {}
  }
  on("[data-dx-chart] [data-dx-chart-click]", "click", (el) => {
    const root = el.closest("[data-dx-chart]");
    if (!root) return;
    initChart(root);
    root.dispatchEvent(new CustomEvent("dx:chart-point-click", { bubbles: true, detail: { seriesTitle: el.getAttribute("data-dx-series-title") || "", category: el.getAttribute("data-dx-category") || "", value: Number(el.getAttribute("data-dx-value") || 0) } }));
  });
  document.querySelectorAll("[data-dx-chart]").forEach(initChart);

  /* ---------------- Pivot ---------------- */

  on("[data-dx-pivot-chip]", "click", (chip) => {
    const root = chip.closest("[data-dx-pivot]");
    if (!root) return;
    root.dispatchEvent(new CustomEvent("dx:pivot-field-remove", {
      bubbles: true,
      detail: { zone: chip.getAttribute("data-dx-zone"), property: chip.getAttribute("data-dx-property") },
    }));
  });

  document.querySelectorAll("[data-dx-pivot]").forEach((root) => { root._dxPivot = { ready: true }; });

  /* ---------------- SecurityCode ---------------- */

  function securityCodeCells(root) {
    const cells = [...root.querySelectorAll("[data-dx-securitycode-cell]")];
    cells.forEach((cell, i) => {
      if (!cell.getAttribute("aria-label")) {
        cell.setAttribute("aria-label", `Digit ${i + 1} of ${cells.length}`);
      }
    });
    return cells;
  }

  function securityCodeReadonly(root) {
    return root.hasAttribute("data-dx-disabled");
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
      new CustomEvent("dx:change", { bubbles: true, detail: { value: securityCodeValue(root) } }),
    );
  }

  function securityCodeAnnounce(root) {
    const live = root.querySelector("[data-dx-securitycode-live]");
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

  on("[data-dx-securitycode-cell]", "input", (cell) => {
    const root = cell.closest("[data-dx-securitycode]");
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

  on("[data-dx-securitycode-cell]", "keydown", (cell, e) => {
    const root = cell.closest("[data-dx-securitycode]");
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

  on("[data-dx-securitycode-cell]", "paste", (cell, e) => {
    const root = cell.closest("[data-dx-securitycode]");
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

  on("[data-dx-securitycode-cell]", "focus", (cell) => {
    const root = cell.closest("[data-dx-securitycode]");
    if (!root || securityCodeReadonly(root)) return;
    cell.select();
  });

  on("[data-dx-securitycode]", "click", (root) => {
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

  document.querySelectorAll("[data-dx-securitycode]").forEach(securityCodeInit);

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
    ctx.lineWidth = Number(canvas.dataset.dxPenWidth) || 2.5;
    ctx.strokeStyle = canvas.dataset.dxPenColor || "#1c1c1c";
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
    const root = canvas.closest("[data-dx-signaturepad]");
    if (!root || canvas.dataset.dxDrawing !== "true") return;
    canvas.dataset.dxDrawing = "false";
    if (canvas.dataset.dxMoved !== "true") return;
    const value = canvas.toDataURL("image/png");
    root.dispatchEvent(new CustomEvent("dx:signature-change", { bubbles: true, detail: { value } }));
  }

  function initSignaturepad(root) {
    const canvas = root.querySelector("[data-dx-signaturepad-canvas]");
    if (!canvas || canvas.dataset.dxReady === "true") return;
    canvas.dataset.dxReady = "true";
    if (root.hasAttribute("data-dx-disabled")) {
      root.classList.add("dx-state-disabled");
      canvas.setAttribute("aria-disabled", "true");
      const clear = root.querySelector("[data-dx-signaturepad-clear]");
      if (clear) clear.disabled = true;
    }
    signatureResize(canvas);

    canvas.addEventListener("pointerdown", (e) => {
      if (root.hasAttribute("data-dx-disabled")) return;
      e.preventDefault();
      if (typeof canvas.setPointerCapture === "function") canvas.setPointerCapture(e.pointerId);
      canvas.dataset.dxDrawing = "true";
      canvas.dataset.dxMoved = "false";
      canvas.dataset.dxLast = JSON.stringify(signaturePoint(canvas, e));
      signatureResize(canvas);
    });

    canvas.addEventListener("pointermove", (e) => {
      if (canvas.dataset.dxDrawing !== "true") return;
      e.preventDefault();
      const ctx = signatureContext(canvas);
      const prev = JSON.parse(canvas.dataset.dxLast);
      const cur = signaturePoint(canvas, e);
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(cur.x, cur.y);
      ctx.stroke();
      canvas.dataset.dxLast = JSON.stringify(cur);
      canvas.dataset.dxMoved = "true";
    });

    const endStroke = (e) => {
      if (canvas.dataset.dxDrawing !== "true") return;
      e.preventDefault();
      canvas.releasePointerCapture?.(e.pointerId);
      signatureStrokeEnd(canvas);
    };
    canvas.addEventListener("pointerup", endStroke);
    canvas.addEventListener("pointercancel", endStroke);
  }

  on("[data-dx-signaturepad-clear]", "click", (button) => {
    const root = button.closest("[data-dx-signaturepad]");
    if (!root || root.hasAttribute("data-dx-disabled")) return;
    const canvas = root.querySelector("[data-dx-signaturepad-canvas]");
    if (!canvas) return;
    signatureResize(canvas);
    const ctx = signatureContext(canvas);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    root.dispatchEvent(new CustomEvent("dx:signature-change", { bubbles: true, detail: { value: "" } }));
  });

  document.querySelectorAll("[data-dx-signaturepad]").forEach(initSignaturepad);

  /* ---------------- Upload ---------------- */

  function uploadParams(root) {
    return {
      url: root.getAttribute("data-dx-upload-url") || "",
      param: root.getAttribute("data-dx-upload-param") || "files",
      auto: root.getAttribute("data-dx-upload-auto") !== "false",
      headers: root.hasAttribute("data-dx-upload-headers") ? JSON.parse(root.getAttribute("data-dx-upload-headers")) : null,
    };
  }

  function uploadAddRow(root, file) {
    const list = root.querySelector("[data-dx-upload-list]");
    if (!list) return;
    const row = document.createElement("li");
    row.className = "dx-upload-row";
    row.dataset.dxUploadRow = "";
    row.dataset.dxUploadState = "pending";
    row.dataset.dxUploadName = file.name;

    const name = document.createElement("span");
    name.className = "dx-upload-name";
    name.textContent = file.name;

    const size = document.createElement("span");
    size.className = "dx-upload-size";
    size.textContent = file.size > 0 ? `${Math.max(1, Math.round(file.size / 1024))} KB` : "0 KB";

    const progress = document.createElement("span");
    progress.className = "dx-upload-progress";
    progress.setAttribute("role", "progressbar");
    progress.setAttribute("aria-valuemin", "0");
    progress.setAttribute("aria-valuemax", "100");
    progress.setAttribute("aria-valuenow", "0");
    const fill = document.createElement("span");
    fill.className = "dx-upload-progress-fill";
    progress.append(fill);

    const status = document.createElement("span");
    status.className = "dx-upload-status";
    status.setAttribute("role", "status");

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "dx-upload-remove";
    remove.dataset.dxUploadRemove = "";
    remove.setAttribute("aria-label", `Remove ${file.name}`);
    remove.textContent = "\u00d7";

    row.append(name, size, progress, status, remove);
    list.appendChild(row);
    return row;
  }

  function uploadProgress(root, row, percent) {
    const progress = row.querySelector(".dx-upload-progress");
    const fill = row.querySelector(".dx-upload-progress-fill");
    if (progress) progress.setAttribute("aria-valuenow", String(percent));
    if (fill) fill.style.width = `${percent}%`;
    row.dataset.dxUploadState = "uploading";
    root.dispatchEvent(new CustomEvent("dx:upload-progress", { bubbles: true, detail: { name: row.dataset.dxUploadName, progress: percent } }));
  }

  function uploadSetState(root, row, state, statusText) {
    row.dataset.dxUploadState = state;
    const status = row.querySelector(".dx-upload-status");
    if (status && statusText !== undefined) status.textContent = statusText;
  }

  function uploadStart(root, row, file) {
    const { url, param, auto, headers } = uploadParams(root);
    if (!url || !auto) return;
    const xhr = new XMLHttpRequest();
    row.dataset.dxXhr = "pending";
    const fd = new FormData();
    fd.append(param, file);

    xhr.upload.addEventListener("progress", (e) => {
      if (!e.lengthComputable) return;
      uploadProgress(root, row, Math.round((e.loaded / e.total) * 100));
    });
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        uploadSetState(root, row, "complete", "Complete");
        root.dispatchEvent(new CustomEvent("dx:upload-complete", { bubbles: true, detail: { name: file.name } }));
      } else {
        uploadFail(root, row, file, `HTTP ${xhr.status}`);
      }
    });
    xhr.addEventListener("error", () => uploadFail(root, row, file, "Network error"));
    xhr.addEventListener("abort", () => {
      if (row.dataset.dxUploadState !== "pending") uploadSetState(root, row, "pending", "Cancelled");
    });
    if (headers) {
      for (const [key, value] of Object.entries(headers)) {
        xhr.setRequestHeader(key, value);
      }
    }
    xhr.open("POST", url);
    xhr.send(fd);
    row.dataset.dxXhr = "active";
    uploadSetState(root, row, "uploading", "Uploading");
  }

  function uploadFail(root, row, file, message) {
    uploadSetState(root, row, "error", "Failed");
    root.dispatchEvent(new CustomEvent("dx:upload-error", { bubbles: true, detail: { name: file.name, message } }));
  }

  on("[data-dx-upload-trigger]", "click", (trigger) => {
    const root = trigger.closest("[data-dx-upload]");
    const input = root?.querySelector("[data-dx-upload-input]");
    if (input) input.click();
  });

  on("[data-dx-upload-input]", "change", (input) => {
    const root = input.closest("[data-dx-upload]");
    if (!root || !input.files) return;
    for (const file of input.files) {
      const row = uploadAddRow(root, file);
      if (row) uploadStart(root, row, file);
    }
    input.value = "";
  });

  on("[data-dx-upload-remove]", "click", (button) => {
    const row = button.closest("[data-dx-upload-row]");
    if (!row) return;
    const root = row.closest("[data-dx-upload]");
    if (root) {
      root.dispatchEvent(new CustomEvent("dx:upload-cancel", { bubbles: true, detail: { name: row.dataset.dxUploadName } }));
    }
    row.remove();
  });

  /* ---------------- DropZone ---------------- */

  function dropzoneDisabled(root) {
    return root.hasAttribute("data-dx-dropzone-disabled");
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
    root.classList.toggle("dx-dropzone--dragging", dragging);
    const caption = root.querySelector("[data-dx-dropzone-caption]");
    if (caption) {
      const base = root.getAttribute("aria-label") || caption.textContent || "Drop files here";
      caption.textContent = dragging ? "Drop to attach" : base.replace(/Drop to attach/, "").trim();
    }
  }

  on("[data-dx-dropzone]", "dragenter", (root, e) => {
    if (dropzoneDisabled(root)) return;
    e.preventDefault();
    dropzoneSetDrag(root, true);
  });

  on("[data-dx-dropzone]", "dragover", (root, e) => {
    if (dropzoneDisabled(root)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    dropzoneSetDrag(root, true);
  });

  on("[data-dx-dropzone]", "dragleave", (root, e) => {
    if (dropzoneDisabled(root)) return;
    if (root.contains(e.relatedTarget)) return;
    dropzoneSetDrag(root, false);
  });

  on("[data-dx-dropzone]", "drop", (root, e) => {
    if (dropzoneDisabled(root)) return;
    e.preventDefault();
    dropzoneSetDrag(root, false);
    const accept = root.getAttribute("data-dx-dropzone-accept") || "";
    const files = [...(e.dataTransfer?.files ?? [])].filter((f) => dropzoneMatches(f, accept));
    root.dispatchEvent(new CustomEvent("dx:dropzone-drop", { bubbles: true, detail: { files } }));
  });

  on("[data-dx-dropzone-browse]", "click", (button) => {
    const root = button.closest("[data-dx-dropzone]");
    if (!root || dropzoneDisabled(root)) return;
    const input = root.querySelector("[data-dx-dropzone-input]");
    if (input) input.click();
  });

  on("[data-dx-dropzone-input]", "change", (input) => {
    const root = input.closest("[data-dx-dropzone]");
    if (!root || !input.files) return;
    root.dispatchEvent(new CustomEvent("dx:dropzone-drop", { bubbles: true, detail: { files: [...input.files] } }));
    input.value = "";
  });

  /* ---------------- Picker popups: outside click ---------------- */

  document.addEventListener("mousedown", (e) => {
    const target = e.target instanceof Element ? e.target : null;
    if (!target) return;
    document.querySelectorAll("[data-dx-datepicker].dx-datepicker--open").forEach((root) => {
      if (!root.contains(target)) datepickerSetOpen(root, false);
    });
    document.querySelectorAll("[data-dx-timespanpicker].dx-timespanpicker--open").forEach((root) => {
      if (!root.contains(target)) {
        timespanRevert(root);
        timespanSetOpen(root, false);
      }
    });
    document.querySelectorAll("[data-dx-colorpicker].dx-colorpicker--open").forEach((root) => {
      if (!root.contains(target)) {
        colorpickerRevert(root);
        colorpickerSetOpen(root, false);
      }
    });
  });

  /* ---------------- Picker re-init on htmx swaps ---------------- */

  document.addEventListener("htmx:afterSettle", () => {
    document.querySelectorAll("[data-dx-datepicker]").forEach(initDatepicker);
    document.querySelectorAll("[data-dx-timespanpicker]").forEach(initTimespanpicker);
    document.querySelectorAll("[data-dx-colorpicker]").forEach(initColorpicker);
    document.querySelectorAll("[data-dx-slider]").forEach(initSlider);
    document.querySelectorAll("[data-dx-rating]").forEach(initRating);
    document.querySelectorAll("[data-dx-pager]").forEach(initPager);
    document.querySelectorAll("[data-dx-menu]").forEach(initMenu);
    document.querySelectorAll("[data-dx-panelmenu]").forEach(initPanelMenu);
    document.querySelectorAll("[data-dx-profilemenu]").forEach(initProfileMenu);
    document.querySelectorAll("[data-dx-fabmenu]").forEach(initFabMenu);
    document.querySelectorAll("[data-dx-breadcrumb]").forEach(initBreadcrumb);
    document.querySelectorAll("[data-dx-steps]").forEach(initSteps);
    document.querySelectorAll("[data-dx-splitter]").forEach(initSplitter);
    document.querySelectorAll("[data-dx-toc]").forEach(initToc);
    document.querySelectorAll("[data-dx-carousel]").forEach(initCarousel);
    document.querySelectorAll("[data-dx-tree]").forEach(initTree);
    document.querySelectorAll("[data-dx-picklist]").forEach(initPickList);
    document.querySelectorAll("[data-dx-scheduler]").forEach(initScheduler);
    document.querySelectorAll("[data-dx-gantt]").forEach(initGantt);
    document.querySelectorAll("[data-dx-chart]").forEach(initChart);
    document.querySelectorAll("[data-dx-pivot]").forEach((root) => {
      if (!root._dxPivot) root._dxPivot = { ready: true };
    });
    document.querySelectorAll("[data-dx-signaturepad]").forEach(initSignaturepad);
    document.querySelectorAll("[data-dx-securitycode]").forEach(securityCodeInit);
  });

  /* ---------------- API ---------------- */

  // Radzen NotificationMessage shape mapped onto the toast options:
  // summary/detail -> title/description, duration -> durationMs.
  function notifyToast(message = {}) {
    showToast({
      tone: message.severity ?? "info",
      title: message.summary,
      description: message.detail,
      durationMs: message.duration,
      click: message.click,
      closeOnClick: message.closeOnClick,
      payload: message.payload,
    });
  }

  function notifyWith(severity) {
    return (summary, detail, options = {}) =>
      notifyToast({ ...options, severity, summary, detail });
  }

  window.dxToast = showToast;
  window.dxToast.notify = notifyToast;
  window.dxToast.notifyInfo = notifyWith("info");
  window.dxToast.notifySuccess = notifyWith("success");
  window.dxToast.notifyWarning = notifyWith("warning");
  window.dxToast.notifyError = notifyWith("danger");
  window.dxUikit = {
    tabs: { activate: activateTab },
    dialog: {
      open: (...args) => window.dxDialog.open(...args),
      openSide: (...args) => window.dxDialog.openSide(...args),
      close: (...args) => window.dxDialog.close(...args),
      closeAll: (...args) => window.dxDialog.closeAll(...args),
      refresh: (...args) => window.dxDialog.refresh(...args),
      alert: (...args) => window.dxDialog.alert(...args),
      confirm: (...args) => window.dxDialog.confirm(...args),
    },
    datafilter: { init: initDataFilter },
    datagrid: { init: initDataGrid },
    datalist: { init: initDataList },
    rangeNav: { init: initRangeNav },
    markdown: { init: initMarkdown },
    contextmenu: {
      open: (...args) => window.dxContextMenu.open(...args),
      close: (...args) => window.dxContextMenu.close(...args),
    },
    popup: {
      open: (...args) => window.dxPopup.open(...args),
      close: (...args) => window.dxPopup.close(...args),
    },
    liveRegion: { init: initLiveRegion },
    mediaQuery: { init: initMediaQuery },
    datepicker: { init: initDatepicker },
    timespanpicker: { init: initTimespanpicker },
    colorpicker: { init: initColorpicker },
    slider: { init: initSlider },
    rating: { init: initRating },
    pager: { init: initPager },
    menu: { init: initMenu },
    panelmenu: { init: initPanelMenu },
    profilemenu: { init: initProfileMenu },
    fabmenu: { init: initFabMenu },
    breadcrumb: { init: initBreadcrumb },
    steps: { init: initSteps },
    splitter: { init: initSplitter },
    toc: { init: initToc },
    carousel: { init: initCarousel },
    tree: { init: initTree },
    picklist: { init: initPickList },
    scheduler: { init: initScheduler },
    gantt: { init: initGantt },
    chart: { init: initChart },
    signaturepad: { init: initSignaturepad },
    securitycode: { init: securityCodeInit },
  };
})();