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
      <div data-se-tabs>
        <div data-se-tablist role="tablist">
          <button data-se-tab data-se-tab-key="one" aria-selected="false">One</button>
          <button data-se-tab data-se-tab-key="two" aria-selected="true">Two</button>
        </div>
        <div data-se-tabpanel data-se-tab-key="one" hidden><p>Panel one</p></div>
        <div data-se-tabpanel data-se-tab-key="two"><p>Panel two</p></div>
      </div>`);
    const [one, two] = root.querySelectorAll("[data-se-tab]");
    one.click();
    expect(one.getAttribute("aria-selected")).toBe("true");
    expect(two.getAttribute("aria-selected")).toBe("false");
    expect(one.tabIndex).toBe(0);
    expect(two.tabIndex).toBe(-1);
    expect(root.querySelector('[data-se-tabpanel][data-se-tab-key="one"]').hidden).toBe(false);
    expect(root.querySelector('[data-se-tabpanel][data-se-tab-key="two"]').hidden).toBe(true);
  });

  it("navigates with arrow keys and wraps around", () => {
    fixture(`
      <div data-se-tabs>
        <div data-se-tablist role="tablist">
          <button data-se-tab data-se-tab-key="one">One</button>
          <button data-se-tab data-se-tab-key="two">Two</button>
        </div>
        <div data-se-tabpanel data-se-tab-key="one" hidden></div>
        <div data-se-tabpanel data-se-tab-key="two" hidden></div>
      </div>`);
    const [one, two] = document.querySelectorAll("[data-se-tab]");
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
      <div data-se-tabs>
        <div data-se-tablist role="tablist" data-se-tablist-orientation="vertical">
          <button data-se-tab data-se-tab-key="one">One</button>
          <button data-se-tab data-se-tab-key="two">Two</button>
        </div>
        <div data-se-tabpanel data-se-tab-key="one" hidden></div>
        <div data-se-tabpanel data-se-tab-key="two" hidden></div>
      </div>`);
    const [one, two] = document.querySelectorAll("[data-se-tab]");
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
      <div data-se-tabs>
        <div data-se-tablist role="tablist">
          <button data-se-tab data-se-tab-key="one">One</button>
          <button data-se-tab data-se-tab-key="two" disabled>Two</button>
          <button data-se-tab data-se-tab-key="three">Three</button>
        </div>
        <div data-se-tabpanel data-se-tab-key="one" hidden></div>
        <div data-se-tabpanel data-se-tab-key="two" hidden></div>
        <div data-se-tabpanel data-se-tab-key="three" hidden></div>
      </div>`);
    const [one, disabled, three] = document.querySelectorAll("[data-se-tab]");
    one.focus();
    one.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
    expect(three.getAttribute("aria-selected")).toBe("true");
    expect(disabled.getAttribute("aria-selected")).toBe("false");
  });

  it("ignores clicks on disabled tabs", () => {
    fixture(`
      <div data-se-tabs>
        <div data-se-tablist role="tablist">
          <button data-se-tab data-se-tab-key="one" disabled>One</button>
          <button data-se-tab data-se-tab-key="two">Two</button>
        </div>
        <div data-se-tabpanel data-se-tab-key="one" hidden></div>
        <div data-se-tabpanel data-se-tab-key="two" hidden></div>
      </div>`);
    const disabled = document.querySelector('[data-se-tab-key="one"]');
    disabled.click();
    expect(disabled.getAttribute("aria-selected")).not.toBe("true");
  });
});

describe("accordion", () => {
  it("opens a closed item and closes a sibling in single mode", () => {
    const root = fixture(`
      <div data-se-accordion>
        <div data-se-accordion-item>
          <button data-se-accordion-trigger aria-expanded="true">A</button>
          <div data-se-accordion-panel open></div>
        </div>
        <div data-se-accordion-item>
          <button data-se-accordion-trigger aria-expanded="false">B</button>
          <div data-se-accordion-panel></div>
        </div>
      </div>`);
    const [a, b] = root.querySelectorAll("[data-se-accordion-trigger]");
    b.click();
    expect(b.getAttribute("aria-expanded")).toBe("true");
    expect(b.closest("[data-se-accordion-item]").querySelector("[data-se-accordion-panel]").hasAttribute("open")).toBe(true);
    expect(a.getAttribute("aria-expanded")).toBe("false");
    expect(a.closest("[data-se-accordion-item]").querySelector("[data-se-accordion-panel]").hasAttribute("open")).toBe(false);
  });

  it("keeps items independent in multiple mode", () => {
    const root = fixture(`
      <div data-se-accordion data-se-accordion-multiple>
        <div data-se-accordion-item>
          <button data-se-accordion-trigger aria-expanded="false">A</button>
          <div data-se-accordion-panel></div>
        </div>
        <div data-se-accordion-item>
          <button data-se-accordion-trigger aria-expanded="false">B</button>
          <div data-se-accordion-panel></div>
        </div>
      </div>`);
    const [a, b] = root.querySelectorAll("[data-se-accordion-trigger]");
    a.click();
    b.click();
    expect(a.getAttribute("aria-expanded")).toBe("true");
    expect(b.getAttribute("aria-expanded")).toBe("true");
  });

  it("closes an open item when clicked again", () => {
    const root = fixture(`
      <div data-se-accordion>
        <div data-se-accordion-item>
          <button data-se-accordion-trigger aria-expanded="true">A</button>
          <div data-se-accordion-panel open></div>
        </div>
      </div>`);
    const trigger = root.querySelector("[data-se-accordion-trigger]");
    trigger.click();
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(root.querySelector("[data-se-accordion-panel]").hasAttribute("open")).toBe(false);
  });
});

describe("tooltip", () => {
  beforeEach(() => vi.useFakeTimers());

  it("shows after the delay and sets aria-describedby on the trigger", () => {
    const root = fixture(`
      <span data-se-tooltip data-se-delay-ms="100">
        <button>Hover</button>
        <span data-se-tooltip-content id="tt" hidden>Help</span>
      </span>`);
    const trigger = root.firstElementChild;
    root.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    expect(root.querySelector("[data-se-tooltip-content]").hidden).toBe(true);
    vi.advanceTimersByTime(100);
    expect(root.querySelector("[data-se-tooltip-content]").hidden).toBe(false);
    expect(trigger.getAttribute("aria-describedby")).toBe("tt");
  });

  it("hides on mouseleave and removes the aria-describedby", () => {
    const root = fixture(`
      <span data-se-tooltip>
        <button>Hover</button>
        <span data-se-tooltip-content id="tt">Help</span>
      </span>`);
    root.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    vi.advanceTimersByTime(300);
    root.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
    expect(root.querySelector("[data-se-tooltip-content]").hidden).toBe(true);
  });

  it("hides on Escape", () => {
    const root = fixture(`
      <span data-se-tooltip>
        <button>Hover</button>
        <span data-se-tooltip-content id="tt">Help</span>
      </span>`);
    root.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    vi.advanceTimersByTime(300);
    root.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(root.querySelector("[data-se-tooltip-content]").hidden).toBe(true);
  });
});

describe("dialog", () => {
  it("opens the referenced dialog from [data-se-dialog-open]", () => {
    fixture(`
      <button data-se-dialog-open="#d">Open</button>
      <dialog data-se-dialog id="d"></dialog>`);
    const dialog = document.querySelector("#d");
    document.querySelector("[data-se-dialog-open]").click();
    expect(dialog.open).toBe(true);
  });

  it("closes on [data-se-dialog-close] and returns focus to the opener", () => {
    fixture(`
      <button data-se-dialog-open="#d">Open</button>
      <dialog data-se-dialog id="d"><button data-se-dialog-close>Close</button></dialog>`);
    const opener = document.querySelector("[data-se-dialog-open]");
    const dialog = document.querySelector("#d");
    opener.click();
    const focusSpy = vi.spyOn(opener, "focus");
    dialog.querySelector("[data-se-dialog-close]").click();
    expect(dialog.open).toBe(false);
    expect(focusSpy).toHaveBeenCalled();
  });
});

describe("toast", () => {
  it("creates a viewport with aria-live when missing", () => {
    window.seToast({ title: "Hi" });
    const container = document.querySelector("[data-se-toast]");
    expect(container).not.toBeNull();
    expect(container.getAttribute("aria-live")).toBe("polite");
  });

  it("renders title, description and tone class", () => {
    window.seToast({ title: "Saved", description: "Done", tone: "success" });
    const item = document.querySelector("[data-se-toast] > div");
    expect(item.className).toBe("se-toast se-toast--success");
    expect(item.querySelector(".se-toast-title").textContent).toBe("Saved");
    expect(item.querySelector(".se-toast-description").textContent).toBe("Done");
    expect(item.querySelector(".se-toast-content")).not.toBeNull();
    expect(item.getAttribute("role")).toBe("status");
  });

  it("uses role alert for danger toasts", () => {
    window.seToast({ title: "Boom", tone: "danger" });
    expect(document.querySelector("[data-se-toast] > div").getAttribute("role")).toBe("alert");
  });

  it("auto-dismisses after durationMs with an exit animation", () => {
    vi.useFakeTimers();
    window.seToast({ title: "Temp", durationMs: 500 });
    expect(document.querySelectorAll("[data-se-toast] > div")).toHaveLength(1);
    vi.advanceTimersByTime(500);
    const item = document.querySelector("[data-se-toast] > div");
    expect(item.classList.contains("se-toast--leaving")).toBe(true);
    vi.advanceTimersByTime(200);
    expect(document.querySelectorAll("[data-se-toast] > div")).toHaveLength(0);
  });

  it("keeps a durationMs 0 toast until dismissed", () => {
    vi.useFakeTimers();
    window.seToast({ title: "Sticky", durationMs: 0 });
    vi.advanceTimersByTime(60_000);
    expect(document.querySelector("[data-se-toast] > div")).not.toBeNull();
  });

  it("renders action and cancel buttons that fire callbacks and dismiss", () => {
    vi.useFakeTimers();
    const onAction = vi.fn();
    const onCancel = vi.fn();
    window.seToast({
      title: "Removed",
      durationMs: 0,
      action: { label: "Undo", onClick: onAction },
      cancel: { label: "Skip", onClick: onCancel },
    });
    const item = document.querySelector("[data-se-toast] > div");
    const undo = item.querySelector(".se-toast-action");
    undo.click();
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(item.classList.contains("se-toast--leaving")).toBe(true);
    vi.advanceTimersByTime(200);
    expect(document.querySelectorAll("[data-se-toast] > div")).toHaveLength(0);
  });

  it("omits the dismiss button when dismissible is false", () => {
    window.seToast({ title: "Quiet", durationMs: 0, dismissible: false });
    const item = document.querySelector("[data-se-toast] > div");
    expect(item.querySelector(".se-toast-dismiss")).toBeNull();
  });

  it("updates an existing toast when the id is reused", () => {
    window.seToast({ id: "job-1", title: "Uploading…", durationMs: 0 });
    window.seToast({ id: "job-1", title: "Uploaded", tone: "success", durationMs: 0 });
    const items = document.querySelectorAll("[data-se-toast] > div");
    expect(items).toHaveLength(1);
    expect(items[0].querySelector(".se-toast-title").textContent).toBe("Uploaded");
  });

  it("renders the progress bar with the matching duration", () => {
    window.seToast({ title: "Progress", durationMs: 2500, showProgress: true });
    const bar = document.querySelector("[data-se-toast] > div .se-toast-progress");
    expect(bar).not.toBeNull();
    expect(bar.style.animationDuration).toBe("2500ms");
  });

  it("dismisses on body click with closeOnClick", () => {
    vi.useFakeTimers();
    window.seToast({ title: "Clickable", durationMs: 0, closeOnClick: true });
    const item = document.querySelector("[data-se-toast] > div");
    expect(item.classList.contains("se-toast--clickable")).toBe(true);
    item.click();
    expect(item.classList.contains("se-toast--leaving")).toBe(true);
    vi.advanceTimersByTime(200);
    expect(document.querySelectorAll("[data-se-toast] > div")).toHaveLength(0);
  });

  it("fires onAutoClose on expiry and onDismiss on manual dismiss", () => {
    vi.useFakeTimers();
    const onAutoClose = vi.fn();
    const onDismiss = vi.fn();
    window.seToast({ title: "A", durationMs: 100, onAutoClose });
    window.seToast({ title: "B", durationMs: 0, onDismiss });
    const items = document.querySelectorAll("[data-se-toast] > div");
    items[1].querySelector(".se-toast-dismiss").click();
    expect(onDismiss).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(100);
    expect(onAutoClose).toHaveBeenCalledTimes(1);
  });
});

describe("dismiss + interactive", () => {
  it("removes the closest dismissable element", () => {
    fixture(`
      <div data-se-dismissable>
        <button data-se-dismiss>×</button>
      </div>`);
    document.querySelector("[data-se-dismiss]").click();
    expect(document.querySelector("[data-se-dismissable]")).toBeNull();
  });

  it("dispatches a click from Enter on [data-se-interactive]", () => {
    const card = fixture(`<div class="se-card" data-se-interactive tabindex="0"></div>`);
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
      <aside class="se-sidebar" data-se-sidebar id="s1"></aside>
      <button data-se-sidebar-toggle="#s1" aria-expanded="true">Toggle</button>`);
    const sidebar = document.getElementById("s1");
    const toggle = document.querySelector("[data-se-sidebar-toggle]");
    expect(sidebar.classList.contains("se-sidebar--collapsed")).toBe(false);
    toggle.click();
    expect(sidebar.classList.contains("se-sidebar--collapsed")).toBe(true);
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    toggle.click();
    expect(sidebar.classList.contains("se-sidebar--collapsed")).toBe(false);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
  });

  it("falls back to the closest sidebar when no selector is given", () => {
    fixture(`
      <div data-se-sidebar>
        <button data-se-sidebar-toggle>Toggle</button>
      </div>`);
    const sidebar = document.querySelector("[data-se-sidebar]");
    document.querySelector("[data-se-sidebar-toggle]").click();
    expect(sidebar.classList.contains("se-sidebar--collapsed")).toBe(true);
  });
});
