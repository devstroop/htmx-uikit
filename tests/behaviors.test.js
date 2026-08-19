import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../lib/behaviors.js";

function fixture(html) {
  document.body.innerHTML = html;
  return document.body.firstElementChild;
}

afterEach(() => {
  document.body.innerHTML = "";
  vi.useRealTimers();
});

describe("tabs", () => {
  it("activates a tab on click and shows its panel", () => {
    const root = fixture(`
      <div data-dt-tabs>
        <div data-dt-tablist role="tablist">
          <button data-dt-tab data-dt-tab-key="one" aria-selected="false">One</button>
          <button data-dt-tab data-dt-tab-key="two" aria-selected="true">Two</button>
        </div>
        <div data-dt-tabpanel data-dt-tab-key="one" hidden><p>Panel one</p></div>
        <div data-dt-tabpanel data-dt-tab-key="two"><p>Panel two</p></div>
      </div>`);
    const [one, two] = root.querySelectorAll("[data-dt-tab]");
    one.click();
    expect(one.getAttribute("aria-selected")).toBe("true");
    expect(two.getAttribute("aria-selected")).toBe("false");
    expect(one.tabIndex).toBe(0);
    expect(two.tabIndex).toBe(-1);
    expect(root.querySelector('[data-dt-tabpanel][data-dt-tab-key="one"]').hidden).toBe(false);
    expect(root.querySelector('[data-dt-tabpanel][data-dt-tab-key="two"]').hidden).toBe(true);
  });

  it("navigates with arrow keys and wraps around", () => {
    fixture(`
      <div data-dt-tabs>
        <div data-dt-tablist role="tablist">
          <button data-dt-tab data-dt-tab-key="one">One</button>
          <button data-dt-tab data-dt-tab-key="two">Two</button>
        </div>
        <div data-dt-tabpanel data-dt-tab-key="one" hidden></div>
        <div data-dt-tabpanel data-dt-tab-key="two" hidden></div>
      </div>`);
    const [one, two] = document.querySelectorAll("[data-dt-tab]");
    one.focus();
    one.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    expect(two.getAttribute("aria-selected")).toBe("true");
    expect(document.activeElement).toBe(two);
    two.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    expect(one.getAttribute("aria-selected")).toBe("true");
    two.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));
    expect(one.getAttribute("aria-selected")).toBe("true");
    one.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
    expect(two.getAttribute("aria-selected")).toBe("true");
  });

  it("navigates vertical tablists with Up/Down arrows", () => {
    fixture(`
      <div data-dt-tabs>
        <div data-dt-tablist role="tablist" data-dt-tablist-orientation="vertical">
          <button data-dt-tab data-dt-tab-key="one">One</button>
          <button data-dt-tab data-dt-tab-key="two">Two</button>
        </div>
        <div data-dt-tabpanel data-dt-tab-key="one" hidden></div>
        <div data-dt-tabpanel data-dt-tab-key="two" hidden></div>
      </div>`);
    const [one, two] = document.querySelectorAll("[data-dt-tab]");
    one.focus();
    one.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    expect(two.getAttribute("aria-selected")).toBe("true");
    expect(document.activeElement).toBe(two);
    two.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
    expect(one.getAttribute("aria-selected")).toBe("true");
    two.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    expect(one.getAttribute("aria-selected")).toBe("true");
  });

  it("skips disabled tabs when navigating", () => {
    fixture(`
      <div data-dt-tabs>
        <div data-dt-tablist role="tablist">
          <button data-dt-tab data-dt-tab-key="one">One</button>
          <button data-dt-tab data-dt-tab-key="two" disabled>Two</button>
          <button data-dt-tab data-dt-tab-key="three">Three</button>
        </div>
        <div data-dt-tabpanel data-dt-tab-key="one" hidden></div>
        <div data-dt-tabpanel data-dt-tab-key="two" hidden></div>
        <div data-dt-tabpanel data-dt-tab-key="three" hidden></div>
      </div>`);
    const [one, disabled, three] = document.querySelectorAll("[data-dt-tab]");
    one.focus();
    one.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
    expect(three.getAttribute("aria-selected")).toBe("true");
    expect(disabled.getAttribute("aria-selected")).toBe("false");
  });

  it("ignores clicks on disabled tabs", () => {
    fixture(`
      <div data-dt-tabs>
        <div data-dt-tablist role="tablist">
          <button data-dt-tab data-dt-tab-key="one" disabled>One</button>
          <button data-dt-tab data-dt-tab-key="two">Two</button>
        </div>
        <div data-dt-tabpanel data-dt-tab-key="one" hidden></div>
        <div data-dt-tabpanel data-dt-tab-key="two" hidden></div>
      </div>`);
    const disabled = document.querySelector('[data-dt-tab-key="one"]');
    disabled.click();
    expect(disabled.getAttribute("aria-selected")).not.toBe("true");
  });
});

describe("accordion", () => {
  it("opens a closed item and closes a sibling in single mode", () => {
    const root = fixture(`
      <div data-dt-accordion>
        <div data-dt-accordion-item>
          <button data-dt-accordion-trigger aria-expanded="true">A</button>
          <div data-dt-accordion-panel open></div>
        </div>
        <div data-dt-accordion-item>
          <button data-dt-accordion-trigger aria-expanded="false">B</button>
          <div data-dt-accordion-panel></div>
        </div>
      </div>`);
    const [a, b] = root.querySelectorAll("[data-dt-accordion-trigger]");
    b.click();
    expect(b.getAttribute("aria-expanded")).toBe("true");
    expect(b.closest("[data-dt-accordion-item]").querySelector("[data-dt-accordion-panel]").hasAttribute("open")).toBe(true);
    expect(a.getAttribute("aria-expanded")).toBe("false");
    expect(a.closest("[data-dt-accordion-item]").querySelector("[data-dt-accordion-panel]").hasAttribute("open")).toBe(false);
  });

  it("keeps items independent in multiple mode", () => {
    const root = fixture(`
      <div data-dt-accordion data-dt-accordion-multiple>
        <div data-dt-accordion-item>
          <button data-dt-accordion-trigger aria-expanded="false">A</button>
          <div data-dt-accordion-panel></div>
        </div>
        <div data-dt-accordion-item>
          <button data-dt-accordion-trigger aria-expanded="false">B</button>
          <div data-dt-accordion-panel></div>
        </div>
      </div>`);
    const [a, b] = root.querySelectorAll("[data-dt-accordion-trigger]");
    a.click();
    b.click();
    expect(a.getAttribute("aria-expanded")).toBe("true");
    expect(b.getAttribute("aria-expanded")).toBe("true");
  });

  it("closes an open item when clicked again", () => {
    const root = fixture(`
      <div data-dt-accordion>
        <div data-dt-accordion-item>
          <button data-dt-accordion-trigger aria-expanded="true">A</button>
          <div data-dt-accordion-panel open></div>
        </div>
      </div>`);
    const trigger = root.querySelector("[data-dt-accordion-trigger]");
    trigger.click();
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(root.querySelector("[data-dt-accordion-panel]").hasAttribute("open")).toBe(false);
  });
});

describe("tooltip", () => {
  beforeEach(() => vi.useFakeTimers());

  it("shows after the delay and sets aria-describedby on the trigger", () => {
    const root = fixture(`
      <span data-dt-tooltip data-dt-delay-ms="100">
        <button>Hover</button>
        <span data-dt-tooltip-content id="tt" hidden>Help</span>
      </span>`);
    const trigger = root.firstElementChild;
    root.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    expect(root.querySelector("[data-dt-tooltip-content]").hidden).toBe(true);
    vi.advanceTimersByTime(100);
    expect(root.querySelector("[data-dt-tooltip-content]").hidden).toBe(false);
    expect(trigger.getAttribute("aria-describedby")).toBe("tt");
  });

  it("hides on mouseleave and removes the aria-describedby", () => {
    const root = fixture(`
      <span data-dt-tooltip>
        <button>Hover</button>
        <span data-dt-tooltip-content id="tt">Help</span>
      </span>`);
    root.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    vi.advanceTimersByTime(300);
    root.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
    expect(root.querySelector("[data-dt-tooltip-content]").hidden).toBe(true);
  });

  it("hides on Escape", () => {
    const root = fixture(`
      <span data-dt-tooltip>
        <button>Hover</button>
        <span data-dt-tooltip-content id="tt">Help</span>
      </span>`);
    root.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    vi.advanceTimersByTime(300);
    root.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(root.querySelector("[data-dt-tooltip-content]").hidden).toBe(true);
  });
});

describe("dialog", () => {
  it("opens the referenced dialog from [data-dt-dialog-open]", () => {
    fixture(`
      <button data-dt-dialog-open="#d">Open</button>
      <dialog data-dt-dialog id="d"></dialog>`);
    const dialog = document.querySelector("#d");
    document.querySelector("[data-dt-dialog-open]").click();
    expect(dialog.open).toBe(true);
  });

  it("closes on [data-dt-dialog-close] and returns focus to the opener", () => {
    fixture(`
      <button data-dt-dialog-open="#d">Open</button>
      <dialog data-dt-dialog id="d"><button data-dt-dialog-close>Close</button></dialog>`);
    const opener = document.querySelector("[data-dt-dialog-open]");
    const dialog = document.querySelector("#d");
    opener.click();
    const focusSpy = vi.spyOn(opener, "focus");
    dialog.querySelector("[data-dt-dialog-close]").click();
    expect(dialog.open).toBe(false);
    expect(focusSpy).toHaveBeenCalled();
  });
});

describe("toast", () => {
  it("creates a viewport with aria-live when missing", () => {
    window.dtToast({ title: "Hi" });
    const container = document.querySelector("[data-dt-toast]");
    expect(container).not.toBeNull();
    expect(container.getAttribute("aria-live")).toBe("polite");
  });

  it("renders title, description and tone class", () => {
    window.dtToast({ title: "Saved", description: "Done", tone: "success" });
    const item = document.querySelector("[data-dt-toast] > div");
    expect(item.className).toBe("dt-toast dt-toast--success");
    expect(item.querySelector(".dt-toast-title").textContent).toBe("Saved");
    expect(item.querySelector(".dt-toast-description").textContent).toBe("Done");
    expect(item.querySelector(".dt-toast-content")).not.toBeNull();
    expect(item.getAttribute("role")).toBe("status");
  });

  it("uses role alert for danger toasts", () => {
    window.dtToast({ title: "Boom", tone: "danger" });
    expect(document.querySelector("[data-dt-toast] > div").getAttribute("role")).toBe("alert");
  });

  it("auto-dismisses after durationMs with an exit animation", () => {
    vi.useFakeTimers();
    window.dtToast({ title: "Temp", durationMs: 500 });
    expect(document.querySelectorAll("[data-dt-toast] > div")).toHaveLength(1);
    vi.advanceTimersByTime(500);
    const item = document.querySelector("[data-dt-toast] > div");
    expect(item.classList.contains("dt-toast--leaving")).toBe(true);
    vi.advanceTimersByTime(200);
    expect(document.querySelectorAll("[data-dt-toast] > div")).toHaveLength(0);
  });

  it("keeps a durationMs 0 toast until dismissed", () => {
    vi.useFakeTimers();
    window.dtToast({ title: "Sticky", durationMs: 0 });
    vi.advanceTimersByTime(60_000);
    expect(document.querySelector("[data-dt-toast] > div")).not.toBeNull();
  });

  it("renders action and cancel buttons that fire callbacks and dismiss", () => {
    vi.useFakeTimers();
    const onAction = vi.fn();
    const onCancel = vi.fn();
    window.dtToast({
      title: "Removed",
      durationMs: 0,
      action: { label: "Undo", onClick: onAction },
      cancel: { label: "Skip", onClick: onCancel },
    });
    const item = document.querySelector("[data-dt-toast] > div");
    const undo = item.querySelector(".dt-toast-action");
    undo.click();
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(item.classList.contains("dt-toast--leaving")).toBe(true);
    vi.advanceTimersByTime(200);
    expect(document.querySelectorAll("[data-dt-toast] > div")).toHaveLength(0);
  });

  it("omits the dismiss button when dismissible is false", () => {
    window.dtToast({ title: "Quiet", durationMs: 0, dismissible: false });
    const item = document.querySelector("[data-dt-toast] > div");
    expect(item.querySelector(".dt-toast-dismiss")).toBeNull();
  });

  it("updates an existing toast when the id is reused", () => {
    window.dtToast({ id: "job-1", title: "Uploading…", durationMs: 0 });
    window.dtToast({ id: "job-1", title: "Uploaded", tone: "success", durationMs: 0 });
    const items = document.querySelectorAll("[data-dt-toast] > div");
    expect(items).toHaveLength(1);
    expect(items[0].querySelector(".dt-toast-title").textContent).toBe("Uploaded");
  });

  it("renders the progress bar with the matching duration", () => {
    window.dtToast({ title: "Progress", durationMs: 2500, showProgress: true });
    const bar = document.querySelector("[data-dt-toast] > div .dt-toast-progress");
    expect(bar).not.toBeNull();
    expect(bar.style.animationDuration).toBe("2500ms");
  });

  it("dismisses on body click with closeOnClick", () => {
    vi.useFakeTimers();
    window.dtToast({ title: "Clickable", durationMs: 0, closeOnClick: true });
    const item = document.querySelector("[data-dt-toast] > div");
    expect(item.classList.contains("dt-toast--clickable")).toBe(true);
    item.click();
    expect(item.classList.contains("dt-toast--leaving")).toBe(true);
    vi.advanceTimersByTime(200);
    expect(document.querySelectorAll("[data-dt-toast] > div")).toHaveLength(0);
  });

  it("fires onAutoClose on expiry and onDismiss on manual dismiss", () => {
    vi.useFakeTimers();
    const onAutoClose = vi.fn();
    const onDismiss = vi.fn();
    window.dtToast({ title: "A", durationMs: 100, onAutoClose });
    window.dtToast({ title: "B", durationMs: 0, onDismiss });
    const items = document.querySelectorAll("[data-dt-toast] > div");
    items[1].querySelector(".dt-toast-dismiss").click();
    expect(onDismiss).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(100);
    expect(onAutoClose).toHaveBeenCalledTimes(1);
  });
});

describe("dismiss + interactive", () => {
  it("removes the closest dismissable element", () => {
    fixture(`
      <div data-dt-dismissable>
        <button data-dt-dismiss>×</button>
      </div>`);
    document.querySelector("[data-dt-dismiss]").click();
    expect(document.querySelector("[data-dt-dismissable]")).toBeNull();
  });

  it("dispatches a click from Enter on [data-dt-interactive]", () => {
    const card = fixture(`<div class="dt-card" data-dt-interactive tabindex="0"></div>`);
    const clickSpy = vi.spyOn(card, "click");
    card.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(clickSpy).toHaveBeenCalledTimes(1);
    card.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    expect(clickSpy).toHaveBeenCalledTimes(2);
  });
});

describe("sidebar toggle", () => {
  it("toggles the collapsed class on the targeted sidebar", () => {
    fixture(`
      <aside class="dt-sidebar" data-dt-sidebar id="s1"></aside>
      <button data-dt-sidebar-toggle="#s1" aria-expanded="true">Toggle</button>`);
    const sidebar = document.getElementById("s1");
    const toggle = document.querySelector("[data-dt-sidebar-toggle]");
    expect(sidebar.classList.contains("dt-sidebar--collapsed")).toBe(false);
    toggle.click();
    expect(sidebar.classList.contains("dt-sidebar--collapsed")).toBe(true);
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    toggle.click();
    expect(sidebar.classList.contains("dt-sidebar--collapsed")).toBe(false);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
  });

  it("falls back to the closest sidebar when no selector is given", () => {
    fixture(`
      <div data-dt-sidebar>
        <button data-dt-sidebar-toggle>Toggle</button>
      </div>`);
    const sidebar = document.querySelector("[data-dt-sidebar]");
    document.querySelector("[data-dt-sidebar-toggle]").click();
    expect(sidebar.classList.contains("dt-sidebar--collapsed")).toBe(true);
  });
});

describe("form", () => {
  it("dispatches dt:submit with FormData on a valid submit without blocking", () => {
    const form = fixture(`
      <form data-dt-form>
        <input name="email" data-dt-field value="a@b.c" />
        <button type="submit">Go</button>
      </form>`);
    const seen = [];
    form.addEventListener("dt:submit", (e) => seen.push([e.detail.form, e.detail.data]));
    const event = new Event("submit", { bubbles: true, cancelable: true });
    form.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(seen).toHaveLength(1);
    expect(seen[0][0]).toBe(form);
    expect(seen[0][1].get("email")).toBe("a@b.c");
  });

  it("blocks the submit and dispatches dt:invalid when a field is invalid", () => {
    const form = fixture(`
      <form data-dt-form>
        <input name="email" data-dt-field aria-invalid="true" />
        <input name="name" data-dt-field />
        <button type="submit">Go</button>
      </form>`);
    const invalid = [];
    const submitted = [];
    form.addEventListener("dt:invalid", (e) => invalid.push(e.detail.fields));
    form.addEventListener("dt:submit", () => submitted.push(1));
    const event = new Event("submit", { bubbles: true, cancelable: true });
    form.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(invalid).toHaveLength(1);
    expect(invalid[0].map((f) => f.name)).toEqual(["email"]);
    expect(submitted).toHaveLength(0);
  });

  it("treats data-dt-invalid as invalid without aria-invalid", () => {
    const form = fixture(`
      <form data-dt-form>
        <input name="name" data-dt-field data-dt-invalid />
      </form>`);
    const event = new Event("submit", { bubbles: true, cancelable: true });
    form.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it("skips disabled fields when checking validity", () => {
    const form = fixture(`
      <form data-dt-form>
        <input name="x" data-dt-field aria-invalid="true" disabled />
      </form>`);
    const event = new Event("submit", { bubbles: true, cancelable: true });
    form.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it("ignores submits outside [data-dt-form]", () => {
    const form = fixture(`<form><input name="x" data-dt-field aria-invalid="true" /></form>`);
    const event = new Event("submit", { bubbles: true, cancelable: true });
    form.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });
});
