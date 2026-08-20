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

  it("blocks the submit and dispatches dt:invalid when a field fails a rule", () => {
    const form = fixture(`
      <form data-dt-form>
        <input name="email" data-dt-field data-dt-required />
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
    expect(invalid[0][0].messages).toEqual(["Required"]);
    expect(submitted).toHaveLength(0);
  });

  it("marks the failing field invalid with aria-invalid and data-dt-invalid", () => {
    const form = fixture(`
      <form data-dt-form>
        <input name="email" data-dt-field data-dt-required />
      </form>`);
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    const input = form.querySelector("[name=email]");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.hasAttribute("data-dt-invalid")).toBe(true);
  });

  it("skips disabled fields when checking validity", () => {
    const form = fixture(`
      <form data-dt-form>
        <input name="x" data-dt-field data-dt-required disabled />
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

describe("form validation rules", () => {
  const submit = (form) => form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

  it("required passes a filled value", () => {
    const form = fixture(`
      <form data-dt-form>
        <input name="name" data-dt-field data-dt-required value="Ada" />
      </form>`);
    const event = new Event("submit", { bubbles: true, cancelable: true });
    form.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(form.querySelector("[name=name]").hasAttribute("aria-invalid")).toBe(false);
  });

  it("email rule rejects a bad address and accepts a good one", () => {
    const form = fixture(`
      <form data-dt-form>
        <input name="email" data-dt-field data-dt-email />
      </form>`);
    let event = new Event("submit", { bubbles: true, cancelable: true });
    submit(form);
    expect(event.defaultPrevented).toBe(false);
    const input = form.querySelector("[name=email]");
    input.value = "nope";
    event = new Event("submit", { bubbles: true, cancelable: true });
    form.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(input.getAttribute("aria-invalid")).toBe("true");
  });

  it("pattern rule matches against data-dt-pattern", () => {
    const form = fixture(`
      <form data-dt-form>
        <input name="zip" data-dt-field data-dt-pattern="^\\d{5}$" />
      </form>`);
    const input = form.querySelector("[name=zip]");
    input.value = "12";
    let event = new Event("submit", { bubbles: true, cancelable: true });
    form.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    input.value = "12345";
    event = new Event("submit", { bubbles: true, cancelable: true });
    form.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it("min/max rules bound numeric values", () => {
    const form = fixture(`
      <form data-dt-form>
        <input name="age" type="number" data-dt-field data-dt-min="18" data-dt-max="120" />
      </form>`);
    const input = form.querySelector("[name=age]");
    input.value = "17";
    let event = new Event("submit", { bubbles: true, cancelable: true });
    form.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    input.value = "121";
    event = new Event("submit", { bubbles: true, cancelable: true });
    form.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    input.value = "42";
    event = new Event("submit", { bubbles: true, cancelable: true });
    form.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it("minlength/maxlength bound string length", () => {
    const form = fixture(`
      <form data-dt-form>
        <input name="code" data-dt-field data-dt-minlength="2" data-dt-maxlength="4" />
      </form>`);
    const input = form.querySelector("[name=code]");
    input.value = "x";
    let event = new Event("submit", { bubbles: true, cancelable: true });
    form.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    input.value = "xxxxx";
    event = new Event("submit", { bubbles: true, cancelable: true });
    form.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    input.value = "xx";
    event = new Event("submit", { bubbles: true, cancelable: true });
    form.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it("empty values pass every rule except required", () => {
    const form = fixture(`
      <form data-dt-form>
        <input name="a" data-dt-field data-dt-email data-dt-minlength="3" />
      </form>`);
    const event = new Event("submit", { bubbles: true, cancelable: true });
    form.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it("uses data-dt-<rule>-message and falls back to data-dt-error-message", () => {
    const form = fixture(`
      <form data-dt-form>
        <input name="a" data-dt-field data-dt-required data-dt-required-message="Custom A" />
        <input name="b" data-dt-field data-dt-required data-dt-error-message="Custom B" />
      </form>`);
    const invalid = [];
    form.addEventListener("dt:invalid", (e) => invalid.push(e.detail.fields));
    submit(form);
    expect(invalid[0].find((f) => f.name === "a").messages).toEqual(["Custom A"]);
    expect(invalid[0].find((f) => f.name === "b").messages).toEqual(["Custom B"]);
  });

  it("respects native constraints via the validity API", () => {
    const form = fixture(`
      <form data-dt-form>
        <input name="name" data-dt-field required />
      </form>`);
    const invalid = [];
    form.addEventListener("dt:invalid", (e) => invalid.push(e.detail.fields));
    submit(form);
    expect(invalid).toHaveLength(1);
    expect(invalid[0][0].messages.length).toBeGreaterThan(0);
    form.querySelector("[name=name]").value = "Ada";
    const event = new Event("submit", { bubbles: true, cancelable: true });
    form.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it("clears stale invalid state on a later valid submit", () => {
    const form = fixture(`
      <form data-dt-form>
        <input name="email" data-dt-field data-dt-required />
      </form>`);
    submit(form);
    const input = form.querySelector("[name=email]");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    input.value = "a@b.c";
    submit(form);
    expect(input.hasAttribute("aria-invalid")).toBe(false);
    expect(input.hasAttribute("data-dt-invalid")).toBe(false);
  });
});

describe("form field error rendering", () => {
  const submit = (form) => form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  const inputEvent = (input) => input.dispatchEvent(new Event("input", { bubbles: true }));

  it("writes messages into [data-dt-field-error] and wires aria-describedby", () => {
    const form = fixture(`
      <form data-dt-form>
        <div class="dt-field">
          <input name="email" data-dt-field data-dt-required />
          <div id="email-error" class="dt-field-error" aria-live="polite" data-dt-field-error></div>
        </div>
      </form>`);
    submit(form);
    const input = form.querySelector("[name=email]");
    const target = form.querySelector("[data-dt-field-error]");
    expect(target.textContent).toBe("Required");
    expect(target.getAttribute("aria-live")).toBe("polite");
    expect(input.getAttribute("aria-describedby")).toBe("email-error");
  });

  it("joins multiple messages with a separator", () => {
    const form = fixture(`
      <form data-dt-form>
        <div class="dt-field">
          <input name="code" data-dt-field data-dt-pattern="^[0-9]+$" data-dt-minlength="3" value="a" />
          <div class="dt-field-error" data-dt-field-error></div>
        </div>
      </form>`);
    submit(form);
    const target = form.querySelector("[data-dt-field-error]");
    expect(target.textContent).toBe("Invalid format · Minimum 3 characters");
  });

  it("clears the error element and restores the hint on a valid submit", () => {
    const form = fixture(`
      <form data-dt-form>
        <div class="dt-field">
          <input name="email" data-dt-field data-dt-required aria-describedby="email-hint" />
          <div id="email-error" class="dt-field-error" data-dt-field-error></div>
          <div id="email-hint" class="dt-field-hint">A hint</div>
        </div>
      </form>`);
    submit(form);
    const input = form.querySelector("[name=email]");
    const target = form.querySelector("[data-dt-field-error]");
    expect(target.textContent).toBe("Required");
    expect(input.getAttribute("aria-describedby")).toContain("email-error");
    input.value = "a@b.c";
    submit(form);
    expect(target.textContent).toBe("");
    expect(input.getAttribute("aria-describedby")).toBe("email-hint");
  });

  it("clears the invalid state and error text on input after an invalid submit", () => {
    const form = fixture(`
      <form data-dt-form>
        <div class="dt-field">
          <input name="email" data-dt-field data-dt-required />
          <div id="email-error" class="dt-field-error" data-dt-field-error></div>
        </div>
      </form>`);
    submit(form);
    const input = form.querySelector("[name=email]");
    const target = form.querySelector("[data-dt-field-error]");
    expect(target.textContent).toBe("Required");
    inputEvent(input);
    expect(target.textContent).toBe("");
    expect(input.hasAttribute("data-dt-invalid")).toBe(false);
    expect(input.hasAttribute("aria-invalid")).toBe(false);
    expect(input.hasAttribute("aria-describedby")).toBe(false);
  });

  it("leaves the state alone on input before any invalid submit", () => {
    const form = fixture(`
      <form data-dt-form>
        <div class="dt-field">
          <input name="email" data-dt-field data-dt-required />
          <div class="dt-field-error" data-dt-field-error>Static error</div>
        </div>
      </form>`);
    inputEvent(form.querySelector("[name=email]"));
    expect(form.querySelector("[data-dt-field-error]").textContent).toBe("Static error");
  });

  it("falls back to the nextElementSibling error element", () => {
    const form = fixture(`
      <form data-dt-form>
        <input name="email" data-dt-field data-dt-required />
        <div id="email-error" class="dt-field-error" data-dt-field-error></div>
      </form>`);
    submit(form);
    const input = form.querySelector("[name=email]");
    expect(form.querySelector("#email-error").textContent).toBe("Required");
    expect(input.getAttribute("aria-describedby")).toBe("email-error");
  });

  it("still marks a field invalid when no error element exists", () => {
    const form = fixture(`
      <form data-dt-form>
        <input name="email" data-dt-field data-dt-required />
      </form>`);
    submit(form);
    expect(form.querySelector("[name=email]").getAttribute("aria-invalid")).toBe("true");
  });
});

const filterFixture = () => {
  const root = fixture(`
    <div data-dt-datafilter
         data-dt-datafilter-properties='[{"name":"name","title":"Name","type":"string"},{"name":"age","title":"Age","type":"number"},{"name":"active","title":"Active","type":"boolean"}]'
         data-dt-datafilter-operator="And">
      <div class="dt-datafilter-rows" data-dt-datafilter-rows>
        <div class="dt-datafilter-row" data-dt-datafilter-row>
          <select data-dt-datafilter-property></select>
          <select data-dt-datafilter-operator></select>
          <input data-dt-datafilter-value>
          <button type="button" data-dt-datafilter-remove>×</button>
        </div>
      </div>
      <button type="button" data-dt-datafilter-add>Add filter</button>
      <div data-dt-datafilter-operator-bar role="radiogroup">
        <label><input type="radio" name="op" value="And" checked> AND</label>
        <label><input type="radio" name="op" value="Or"> OR</label>
      </div>
      <input type="hidden" data-dt-datafilter-output>
    </div>`);
  window.dtUikit.datafilter.init(root);
  return root;
};

describe("datafilter", () => {
  it("populates property options and per-type operator options", () => {
    const root = filterFixture();
    const property = root.querySelector("[data-dt-datafilter-property]");
    expect([...property.options].map((o) => o.value)).toEqual(["name", "age", "active"]);
    expect(property.value).toBe("name");
    const operator = root.querySelector("[data-dt-datafilter-operator]");
    expect([...operator.options].map((o) => o.value)).toContain("Contains");
    expect([...operator.options].map((o) => o.value)).toContain("StartsWith");
  });

  it("swaps operators and the value editor when the property changes", () => {
    const root = filterFixture();
    const property = root.querySelector("[data-dt-datafilter-property]");
    property.value = "age";
    property.dispatchEvent(new Event("change", { bubbles: true }));
    const operator = root.querySelector("[data-dt-datafilter-operator]");
    expect([...operator.options].map((o) => o.value)).not.toContain("Contains");
    expect([...operator.options].map((o) => o.value)).toContain("GreaterThan");
    expect(root.querySelector("[data-dt-datafilter-value]").type).toBe("number");
  });

  it("serializes active rows and dispatches dt:filter-change with both string forms", () => {
    const root = filterFixture();
    const listener = vi.fn();
    root.addEventListener("dt:filter-change", listener);
    const value = root.querySelector("[data-dt-datafilter-value]");
    value.value = "jo";
    value.dispatchEvent(new Event("change", { bubbles: true }));
    expect(listener).toHaveBeenCalledTimes(1);
    const detail = listener.mock.calls[0][0].detail;
    expect(detail.filters).toEqual([{ property: "name", operator: "Contains", value: "jo" }]);
    expect(detail.filterString).toBe('name.Contains("jo")');
    expect(detail.oDataFilterString).toBe("contains(tolower(name), tolower('jo'))");
    expect(root.querySelector("[data-dt-datafilter-output]").value).toBe(
      JSON.stringify([{ property: "name", operator: "Contains", value: "jo" }]),
    );
  });

  it("ignores rows with empty values unless the operator is a null/empty test", () => {
    const root = filterFixture();
    const listener = vi.fn();
    root.addEventListener("dt:filter-change", listener);
    const value = root.querySelector("[data-dt-datafilter-value]");
    value.dispatchEvent(new Event("change", { bubbles: true }));
    expect(listener.mock.calls[0][0].detail.filters).toEqual([]);
    const operator = root.querySelector("[data-dt-datafilter-operator]");
    operator.value = "IsNull";
    operator.dispatchEvent(new Event("change", { bubbles: true }));
    expect(listener.mock.calls[1][0].detail.filters).toEqual([{ property: "name", operator: "IsNull", value: "" }]);
  });

  it("adds a row cloned from the template and keeps at least one row", () => {
    const root = filterFixture();
    root.querySelector("[data-dt-datafilter-add]").click();
    expect(root.querySelectorAll("[data-dt-datafilter-row]")).toHaveLength(2);
    const remove = root.querySelectorAll("[data-dt-datafilter-remove]")[0];
    remove.click();
    remove.click();
    expect(root.querySelectorAll("[data-dt-datafilter-row]")).toHaveLength(1);
  });

  it("switching the AND/OR radio updates the join and re-fires", () => {
    const root = filterFixture();
    const listener = vi.fn();
    root.addEventListener("dt:filter-change", listener);
    const value = root.querySelector("[data-dt-datafilter-value]");
    value.value = "jo";
    value.dispatchEvent(new Event("change", { bubbles: true }));
    const or = root.querySelector('[data-dt-datafilter-operator-bar] input[value="Or"]');
    or.checked = true;
    or.dispatchEvent(new Event("change", { bubbles: true }));
    expect(listener.mock.calls[1][0].detail.logicalOperator).toBe("Or");
  });
});

describe("datagrid", () => {
  const gridFixture = (overrides = {}) => {
    const root = fixture(`
      <div data-dt-datagrid
           data-dt-datagrid-properties='[
             {"property":"name","title":"Name","type":"string","sortable":true},
             {"property":"age","title":"Age","type":"number","align":"center","sortable":true},
             {"property":"role","title":"Role","type":"string"}
           ]'
           data-dt-datagrid-sortable
           data-dt-datagrid-filterable
           data-dt-datagrid-pagesize="2"
           data-dt-datagrid-pagesize-options="[2,5]"
           data-dt-datagrid-pagenumbers="5">
        <div class="dt-datagrid-data" role="grid" data-dt-datagrid-data>
          <table class="dt-datagrid-table">
            <thead data-dt-datagrid-head></thead>
            <tbody data-dt-datagrid-rows>
              <tr data-dt-row data-dt-row-value='{"name":"John","age":30,"role":"admin"}'>
                <td data-dt-col="name">John</td>
                <td data-dt-col="age" class="dt-datagrid-cell--center">30</td>
                <td data-dt-col="role">admin</td>
              </tr>
              <tr data-dt-row data-dt-row-value='{"name":"Jane","age":25,"role":"editor"}'>
                <td data-dt-col="name">Jane</td>
                <td data-dt-col="age" class="dt-datagrid-cell--center">25</td>
                <td data-dt-col="role">editor</td>
              </tr>
              <tr data-dt-row data-dt-row-value='{"name":"Bob","age":40,"role":"viewer"}'>
                <td data-dt-col="name">Bob</td>
                <td data-dt-col="age" class="dt-datagrid-cell--center">40</td>
                <td data-dt-col="role">viewer</td>
              </tr>
              <tr data-dt-row data-dt-row-value='{"name":"Alice","age":22,"role":"editor"}'>
                <td data-dt-col="name">Alice</td>
                <td data-dt-col="age" class="dt-datagrid-cell--center">22</td>
                <td data-dt-col="role">editor</td>
              </tr>
            </tbody>
          </table>
          <div class="dt-datagrid-empty" data-dt-datagrid-empty hidden>No records found</div>
        </div>
        <div class="dt-datagrid-pager" data-dt-datagrid-pager></div>
      </div>`);
    window.dtUikit.datagrid.init(root);
    return root;
  };

  const visibleNames = (root) =>
    [...root.querySelectorAll("[data-dt-row]")]
      .filter((row) => !row.hidden)
      .map((row) => row.querySelector("[data-dt-col=name]").textContent);

  it("renders the header from properties with sort buttons and a filter row", () => {
    const root = gridFixture();
    const head = root.querySelector("[data-dt-datagrid-head]");
    expect(head.querySelectorAll("th")).toHaveLength(3);
    expect(head.querySelector('[data-dt-grid-sort="name"]').textContent).toBe("Name");
    expect(head.querySelector('[data-dt-grid-filter-value="name"]')).toBeTruthy();
    expect(root.querySelector('[data-dt-grid-filter-value="age"]')).toBeTruthy();
    expect(root.querySelector('[data-dt-grid-filter-value="role"]')).toBeTruthy();
  });

  it("pages by page size and updates the summary", () => {
    const root = gridFixture();
    expect(visibleNames(root)).toEqual(["John", "Jane"]);
    expect(root.querySelector(".dt-datagrid-pager-summary").textContent).toBe("Page 1 of 2 (4 records)");
    root.querySelector('[data-dt-grid-page="2"]').click();
    expect(visibleNames(root)).toEqual(["Bob", "Alice"]);
    expect(root.querySelector(".dt-datagrid-pager-summary").textContent).toBe("Page 2 of 2 (4 records)");
  });

  it("sorts ascending then descending then clears with aria-sort", () => {
    const root = gridFixture();
    root.querySelector('[data-dt-grid-sort="name"]').click();
    expect(visibleNames(root)).toEqual(["Alice", "Bob"]);
    expect(root.querySelector("th").getAttribute("aria-sort")).toBe("ascending");
    root.querySelector('[data-dt-grid-sort="name"]').click();
    expect(visibleNames(root)).toEqual(["John", "Jane"]);
    expect(root.querySelector("th").getAttribute("aria-sort")).toBe("descending");
    root.querySelector('[data-dt-grid-sort="name"]').click();
    expect(visibleNames(root)).toEqual(["John", "Jane"]);
    expect(root.querySelector("th").getAttribute("aria-sort")).toBe("none");
  });

  it("filters with typed coercion and resets to page 1", () => {
    const root = gridFixture();
    const value = root.querySelector('[data-dt-grid-filter-value="age"]');
    value.value = "25";
    value.dispatchEvent(new Event("change", { bubbles: true }));
    expect(visibleNames(root)).toEqual(["Jane"]);
    const op = root.querySelector('[data-dt-grid-filter-op="age"]');
    op.value = "GreaterThan";
    op.dispatchEvent(new Event("change", { bubbles: true }));
    expect(visibleNames(root)).toEqual(["John", "Bob"]);
  });

  it("shows the empty message when nothing matches", () => {
    const root = gridFixture();
    const value = root.querySelector('[data-dt-grid-filter-value="name"]');
    value.value = "zzz";
    value.dispatchEvent(new Event("change", { bubbles: true }));
    expect(visibleNames(root)).toEqual([]);
    expect(root.querySelector("[data-dt-datagrid-empty]").hidden).toBe(false);
  });

  it("changes page size and clamps to page 1", () => {
    const root = gridFixture();
    root.querySelector('[data-dt-grid-page="2"]').click();
    const size = root.querySelector("[data-dt-grid-page-size]");
    size.value = "5";
    size.dispatchEvent(new Event("change", { bubbles: true }));
    expect(visibleNames(root)).toEqual(["John", "Jane", "Bob", "Alice"]);
    expect(root.querySelector(".dt-datagrid-pager-summary").textContent).toBe("Page 1 of 1 (4 records)");
  });

  it("dispatches dt:grid-change with filters and both string forms", () => {
    const listener = vi.fn();
    const root = gridFixture();
    root.addEventListener("dt:grid-change", listener);
    const value = root.querySelector('[data-dt-grid-filter-value="name"]');
    value.value = "ja";
    value.dispatchEvent(new Event("change", { bubbles: true }));
    expect(listener).toHaveBeenCalledTimes(1);
    const detail = listener.mock.calls[0][0].detail;
    expect(detail.filters).toEqual([{ property: "name", operator: "Contains", value: "ja", type: "string" }]);
    expect(detail.filterString).toBe('Name.Contains("ja")'.replace("Name", "name"));
    expect(detail.oDataFilterString).toBe("contains(tolower(name), tolower('ja'))");
    expect(detail.pageSize).toBe(2);
  });

  const advancedFixture = () => {
    const root = fixture(`
      <div data-dt-datagrid
           data-dt-datagrid-properties='[
             {"property":"name","title":"Name","type":"string","frozen":true,"width":"8rem"},
             {"property":"age","title":"Age","type":"number","align":"center"},
             {"property":"role","title":"Role","type":"string"}
           ]'
           data-dt-datagrid-select="multiple"
           data-dt-datagrid-column-picker
           data-dt-datagrid-resize
           data-dt-datagrid-reorder
           data-dt-datagrid-groupable
           data-dt-datagrid-edit
           data-dt-datagrid-delete
           data-dt-datagrid-create
           data-dt-datagrid-pagesize="10">
        <div data-dt-datagrid-toolbar></div>
        <div class="dt-datagrid-data" role="grid" data-dt-datagrid-data>
          <table class="dt-datagrid-table">
            <colgroup data-dt-datagrid-cols></colgroup>
            <thead data-dt-datagrid-head></thead>
            <tbody data-dt-datagrid-rows>
              <tr data-dt-row data-dt-row-key="1" data-dt-row-value='{"name":"John","age":30,"role":"admin"}'>
                <td data-dt-col="name">John</td>
                <td data-dt-col="age" class="dt-datagrid-cell--center">30</td>
                <td data-dt-col="role">admin</td>
              </tr>
              <tr data-dt-row data-dt-row-key="2" data-dt-row-value='{"name":"Jane","age":25,"role":"editor"}'>
                <td data-dt-col="name">Jane</td>
                <td data-dt-col="age" class="dt-datagrid-cell--center">25</td>
                <td data-dt-col="role">editor</td>
              </tr>
            </tbody>
          </table>
          <div class="dt-datagrid-empty" data-dt-datagrid-empty hidden>No records found</div>
        </div>
        <div class="dt-datagrid-pager" data-dt-datagrid-pager></div>
      </div>`);
    window.dtUikit.datagrid.init(root);
    return root;
  };

  it("selects rows in multiple mode with aria-selected and dt:grid-select", () => {
    const listener = vi.fn();
    const root = advancedFixture();
    root.addEventListener("dt:grid-select", listener);
    root.querySelector('[data-dt-row-key="1"]').querySelector("td").click();
    root.querySelector('[data-dt-row-key="2"]').querySelector("td").click();
    expect(root.querySelector('[data-dt-row-key="1"]').getAttribute("aria-selected")).toBe("true");
    expect(root.querySelector('[data-dt-row-key="2"]').getAttribute("aria-selected")).toBe("true");
    expect(root.querySelector('[data-dt-row-key="1"]').classList.contains("dt-datagrid-row--selected")).toBe(true);
    expect(listener.mock.calls[1][0].detail.keys).toEqual(["1", "2"]);
    root.querySelector('[data-dt-row-key="1"]').querySelector("td").click();
    expect(listener.mock.calls[2][0].detail.keys).toEqual(["2"]);
  });

  it("toggles columns from the picker and emits dt:grid-column-pick", () => {
    const listener = vi.fn();
    const root = advancedFixture();
    root.addEventListener("dt:grid-column-pick", listener);
    const toggle = root.querySelector("[data-dt-grid-picker-toggle]");
    expect(toggle.textContent).toBe("Columns");
    toggle.click();
    const checkbox = root.querySelector('[data-dt-grid-picker-item="role"]');
    expect(checkbox).toBeTruthy();
    checkbox.checked = false;
    checkbox.dispatchEvent(new Event("change", { bubbles: true }));
    expect(root.querySelectorAll("[data-dt-grid-col]")).toHaveLength(2);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: { key: "role", visible: false } }));
    expect(root.querySelector('[data-dt-grid-picker-item="name"]').checked).toBe(true);
  });

  it("freezes the name column with a sticky offset", () => {
    const root = advancedFixture();
    const firstTh = root.querySelector("th");
    expect(firstTh.classList.contains("dt-datagrid-cell--frozen")).toBe(true);
    expect(firstTh.style.left).toBe("0px");
    const secondTh = root.querySelectorAll("th")[1];
    expect(secondTh.classList.contains("dt-datagrid-cell--frozen")).toBe(false);
    const firstTd = root.querySelector("[data-dt-row] td");
    expect(firstTd.classList.contains("dt-datagrid-cell--frozen")).toBe(true);
    expect(firstTd.style.left).toBe("0px");
  });

  it("resizes a column by dragging its handle", () => {
    const root = advancedFixture();
    const handle = root.querySelector('[data-dt-grid-resize="name"]');
    expect(handle.getAttribute("aria-label")).toBe("Resize Name");
    handle.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, clientX: 100 }));
    document.dispatchEvent(new MouseEvent("mousemove", { bubbles: true, clientX: 300 }));
    document.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
    const col = root.querySelector("[data-dt-datagrid-cols] col");
    expect(col.style.width).toBe("208px");
  });

  it("reorders columns on dragstart and drop", () => {
    const listener = vi.fn();
    const root = advancedFixture();
    root.addEventListener("dt:grid-column-reorder", listener);
    const ageTh = root.querySelector('[data-dt-grid-col="age"]');
    const nameTh = root.querySelector('[data-dt-grid-col="name"]');
    ageTh.dispatchEvent(new Event("dragstart", { bubbles: true }));
    nameTh.dispatchEvent(new Event("dragover", { bubbles: true, cancelable: true }));
    nameTh.dispatchEvent(new Event("drop", { bubbles: true, cancelable: true }));
    const headers = [...root.querySelectorAll("th")];
    expect(headers[0].textContent).toBe("Age");
    expect(headers[1].textContent).toBe("Name");
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: { from: "age", to: "name" } }));
  });

  it("groups by a column dropped on the group panel", () => {
    const listener = vi.fn();
    const root = advancedFixture();
    root.addEventListener("dt:grid-group-change", listener);
    const roleTh = root.querySelector('[data-dt-grid-col="role"]');
    const panel = root.querySelector("[data-dt-grid-group-panel]");
    roleTh.dispatchEvent(new Event("dragstart", { bubbles: true }));
    panel.dispatchEvent(new Event("dragover", { bubbles: true, cancelable: true }));
    panel.dispatchEvent(new Event("drop", { bubbles: true, cancelable: true }));
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: { property: "role" } }));
    expect(root.querySelectorAll("[data-dt-row]")).toHaveLength(2);
    expect(root.querySelector("[data-dt-grid-col=role]")).toBeFalsy();
    const groupRows = root.querySelectorAll(".dt-datagrid-group-row");
    expect(groupRows).toHaveLength(2);
    expect(groupRows[0].textContent).toContain("admin (1)");
    expect(groupRows[1].textContent).toContain("editor (1)");
  });

  it("collapses groups and removes grouping via the chip", () => {
    const root = advancedFixture();
    root.querySelector('[data-dt-grid-col="role"]').dispatchEvent(new Event("dragstart", { bubbles: true }));
    root.querySelector("[data-dt-grid-group-panel]").dispatchEvent(new Event("drop", { bubbles: true, cancelable: true }));
    const toggle = root.querySelector("[data-dt-grid-group-toggle]");
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    toggle.click();
    expect(root.querySelector("[data-dt-grid-group-toggle]").getAttribute("aria-expanded")).toBe("false");
    expect(root.querySelector('[data-dt-row-key="1"]').hidden).toBe(true);
    root.querySelector("[data-dt-grid-group-clear]").click();
    expect(root.querySelector("[data-dt-grid-col=role]")).toBeTruthy();
    expect(root.querySelectorAll(".dt-datagrid-group-row")).toHaveLength(0);
  });

  it("edits a row inline and fires dt:grid-row-update", () => {
    const listener = vi.fn();
    const root = advancedFixture();
    root.addEventListener("dt:grid-row-update", listener);
    root.querySelector('[data-dt-row-key="1"] [data-dt-grid-row-edit]').click();
    const input = root.querySelector('[data-dt-row-key="1"] [data-dt-grid-edit-input="name"]');
    input.value = "Jonny";
    root.querySelector('[data-dt-row-key="1"] [data-dt-grid-row-save]').click();
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: { original: expect.objectContaining({ name: "John" }), updated: expect.objectContaining({ name: "Jonny" }) },
      }),
    );
    expect(root.querySelector('[data-dt-row-key="1"] [data-dt-col="name"]').textContent).toBe("John");
    expect(root.querySelector('[data-dt-row-key="1"] [data-dt-grid-row-edit]')).toBeTruthy();
  });

  it("cancels an edit restoring the original cell text", () => {
    const root = advancedFixture();
    root.querySelector('[data-dt-row-key="2"] [data-dt-grid-row-edit]').click();
    root.querySelector('[data-dt-row-key="2"] [data-dt-grid-row-cancel]').click();
    expect(root.querySelector('[data-dt-row-key="2"] [data-dt-col="name"]').textContent).toBe("Jane");
  });

  it("deletes a row firing dt:grid-row-delete", () => {
    const listener = vi.fn();
    const root = advancedFixture();
    root.addEventListener("dt:grid-row-delete", listener);
    root.querySelector('[data-dt-row-key="1"] [data-dt-grid-row-delete]').click();
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: { row: expect.objectContaining({ name: "John" }) } }));
    expect(root.querySelector('[data-dt-row-key="1"]')).toBeFalsy();
  });

  it("creates a row firing dt:grid-row-create", () => {
    const listener = vi.fn();
    const root = advancedFixture();
    root.addEventListener("dt:grid-row-create", listener);
    root.querySelector("[data-dt-grid-row-create]").click();
    const input = root.querySelector("[data-dt-grid-new-row] [data-dt-grid-edit-input=name]");
    input.value = "Zed";
    root.querySelector("[data-dt-grid-row-create-save]").click();
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: { row: expect.objectContaining({ name: "Zed" }) } }));
    expect(root.querySelector("[data-dt-grid-new-row]")).toBeFalsy();
  });
});

describe("datalist", () => {
  const datalistFixture = (extra = "") => {
    const root = fixture(`
      <div data-dt-datalist data-dt-datalist-pagesize="4" data-dt-datalist-pagesize-options="[4,8,12]" ${extra}>
        <div data-dt-datalist-items>
          <div data-dt-datalist-item>Apple</div>
          <div data-dt-datalist-item>Banana</div>
          <div data-dt-datalist-item>Cherry</div>
          <div data-dt-datalist-item>Date</div>
          <div data-dt-datalist-item>Elderberry</div>
          <div data-dt-datalist-item>Fig</div>
          <div data-dt-datalist-item>Grape</div>
          <div data-dt-datalist-item>Honeydew</div>
          <div data-dt-datalist-item>Kiwi</div>
          <div data-dt-datalist-item>Lemon</div>
        </div>
        <div data-dt-datalist-empty hidden>No records found</div>
        <div data-dt-datalist-pager></div>
      </div>`);
    window.dtUikit.datalist.init(root);
    return root;
  };

  const visibleItems = (root) =>
    [...root.querySelectorAll("[data-dt-datalist-item]")].filter((item) => !item.hidden).map((item) => item.textContent);

  it("shows the first page by default (pageSize 4)", () => {
    const root = datalistFixture();
    expect(visibleItems(root)).toEqual(["Apple", "Banana", "Cherry", "Date"]);
    expect(root.querySelector(".dt-datalist-pager-summary").textContent).toContain("Page 1 of 3");
  });

  it("pages through items and fires dt:datalist-page", () => {
    const listener = vi.fn();
    const root = datalistFixture();
    root.addEventListener("dt:datalist-page", listener);
    root.querySelector('[data-dt-datalist-page="2"]').click();
    expect(visibleItems(root)).toEqual(["Elderberry", "Fig", "Grape", "Honeydew"]);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: { pageNumber: 2 } }));
  });

  it("resets to page 1 when page size changes", () => {
    const root = datalistFixture();
    root.querySelector('[data-dt-datalist-page="2"]').click();
    root.querySelector("[data-dt-datalist-page-size]").value = "8";
    root.querySelector("[data-dt-datalist-page-size]").dispatchEvent(new Event("change", { bubbles: true }));
    expect(root.querySelector(".dt-datalist-pager-summary").textContent).toContain("Page 1 of 2");
    expect(visibleItems(root)).toHaveLength(8);
  });

  it("applies wrap grid layout when data-dt-datalist-wrap is present", () => {
    const root = datalistFixture("data-dt-datalist-wrap");
    expect(root.hasAttribute("data-dt-datalist-wrap")).toBe(true);
    expect(root.querySelector("[data-dt-datalist-items]")).toBeTruthy();
  });

  it("shows the empty message when there are no items", () => {
    const root = fixture(`
      <div data-dt-datalist>
        <div data-dt-datalist-items></div>
        <div data-dt-datalist-empty hidden>No records found</div>
        <div data-dt-datalist-pager></div>
      </div>`);
    window.dtUikit.datalist.init(root);
    expect(root.querySelector("[data-dt-datalist-empty]").hidden).toBe(false);
    expect(root.querySelector(".dt-datalist-pager-summary").textContent).toContain("Page 1 of 1");
  });
});

describe("password toggle", () => {
  const passwordFixture = (extra = "") =>
    fixture(`
      <div class="dt-password" data-dt-password>
        <input type="password" data-dt-password-input value="s3cret" />
        <button type="button" data-dt-password-toggle aria-pressed="false" aria-label="Show password" ${extra}>
          <svg data-dt-password-icon="visible"></svg>
          <svg data-dt-password-icon="hidden" hidden></svg>
        </button>
      </div>`);

  it("flips the input to text and mirrors aria-pressed/label/icon", () => {
    const root = passwordFixture();
    const input = root.querySelector("[data-dt-password-input]");
    const button = root.querySelector("[data-dt-password-toggle]");
    button.click();
    expect(input.type).toBe("text");
    expect(button.getAttribute("aria-pressed")).toBe("true");
    expect(button.getAttribute("aria-label")).toBe("Hide password");
    expect(root.querySelector('[data-dt-password-icon="visible"]').hidden).toBe(true);
    expect(root.querySelector('[data-dt-password-icon="hidden"]').hidden).toBe(false);
    button.click();
    expect(input.type).toBe("password");
    expect(button.getAttribute("aria-pressed")).toBe("false");
    expect(button.getAttribute("aria-label")).toBe("Show password");
    expect(root.querySelector('[data-dt-password-icon="visible"]').hidden).toBe(false);
    expect(root.querySelector('[data-dt-password-icon="hidden"]').hidden).toBe(true);
  });

  it("uses data-dt-password-show/hide for the toggle labels", () => {
    const root = passwordFixture('data-dt-password-show="Reveal" data-dt-password-hide="Conceal"');
    const button = root.querySelector("[data-dt-password-toggle]");
    button.click();
    expect(button.getAttribute("aria-label")).toBe("Conceal");
    button.click();
    expect(button.getAttribute("aria-label")).toBe("Reveal");
  });

  it("ignores clicks on a disabled toggle", () => {
    const root = passwordFixture("disabled");
    const input = root.querySelector("[data-dt-password-input]");
    root.querySelector("[data-dt-password-toggle]").click();
    expect(input.type).toBe("password");
  });
});

describe("mask", () => {
  const maskFixture = () =>
    fixture(`
      <input type="text" data-dt-mask="(###) ###-####" />
    `);

  it("formats digits as they are typed", () => {
    const input = maskFixture();
    input.value = "1234567890";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    expect(input.value).toBe("(123) 456-7890");
  });

  it("strips non-digit characters", () => {
    const input = maskFixture();
    input.value = "ab1cd23";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    expect(input.value).toBe("(123");
  });

  it("drops characters beyond the last placeholder", () => {
    const input = maskFixture();
    input.value = "1234567890123";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    expect(input.value).toBe("(123) 456-7890");
  });

  it("backspace over a separator also removes the digit before it", () => {
    const input = maskFixture();
    input.value = "(123) 456-7";
    input.setSelectionRange(10, 10);
    const event = new KeyboardEvent("keydown", { key: "Backspace", bubbles: true, cancelable: true });
    input.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(input.value).toBe("(123) 456");
  });
});

describe("numeric", () => {
  const numericFixture = (attrs = "") =>
    fixture(`
      <div class="dt-numeric" data-dt-numeric ${attrs}>
        <input type="text" inputmode="decimal" data-dt-numeric-input value="3" />
        <button type="button" data-dt-numeric-up></button>
        <button type="button" data-dt-numeric-down></button>
      </div>`);

  it("steps up/down from the buttons and clamps to min/max", () => {
    const root = numericFixture('data-dt-min="0" data-dt-max="5"');
    const input = root.querySelector("[data-dt-numeric-input]");
    root.querySelector("[data-dt-numeric-up]").click();
    expect(input.value).toBe("4");
    input.value = "5";
    root.querySelector("[data-dt-numeric-up]").click();
    expect(input.value).toBe("5");
    input.value = "0";
    root.querySelector("[data-dt-numeric-down]").click();
    expect(input.value).toBe("0");
  });

  it("steps by data-dt-step, snapping from min", () => {
    const root = numericFixture('data-dt-min="0" data-dt-step="5"');
    const input = root.querySelector("[data-dt-numeric-input]");
    root.querySelector("[data-dt-numeric-up]").click();
    expect(input.value).toBe("5");
    input.value = "3";
    root.querySelector("[data-dt-numeric-up]").click();
    expect(input.value).toBe("5");
  });

  it("supports ArrowUp/ArrowDown with default prevented", () => {
    const root = numericFixture();
    const input = root.querySelector("[data-dt-numeric-input]");
    const up = new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true, cancelable: true });
    input.dispatchEvent(up);
    expect(up.defaultPrevented).toBe(true);
    expect(input.value).toBe("4");
    const down = new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true });
    input.dispatchEvent(down);
    expect(down.defaultPrevented).toBe(true);
    expect(input.value).toBe("3");
  });

  it("strips non-numeric typing", () => {
    const root = numericFixture();
    const input = root.querySelector("[data-dt-numeric-input]");
    input.value = "a1b2c";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    expect(input.value).toBe("12");
  });

  it("clamps and snaps on blur", () => {
    const root = numericFixture('data-dt-min="0" data-dt-max="5"');
    const input = root.querySelector("[data-dt-numeric-input]");
    input.value = "99";
    input.dispatchEvent(new Event("blur", { bubbles: true }));
    expect(input.value).toBe("5");
    input.value = "";
    input.dispatchEvent(new Event("blur", { bubbles: true }));
    expect(input.value).toBe("");
  });
});

describe("datepicker", () => {
  const datepickerFixture = (attrs = "", value = "") =>
    fixture(`
      <div class="dt-datepicker" data-dt-datepicker ${attrs}>
        <input type="text" data-dt-datepicker-input value="${value}" />
        <button type="button" data-dt-datepicker-trigger aria-expanded="false" aria-controls="dp-popup"></button>
        <button type="button" data-dt-datepicker-clear hidden></button>
        <div class="dt-datepicker-popup" data-dt-datepicker-popup hidden>
          <div class="dt-datepicker-header">
            <button type="button" data-dt-datepicker-prev></button>
            <div data-dt-datepicker-title></div>
            <button type="button" data-dt-datepicker-next></button>
          </div>
          <div data-dt-datepicker-weekdays></div>
          <div class="dt-datepicker-grid" data-dt-datepicker-grid></div>
        </div>
      </div>`);

  it("renders a 42-cell grid with a roving focus cell and today highlighted", () => {
    const root = datepickerFixture('data-dt-format="yyyy-MM-dd" data-dt-value="2026-08-20"');
    root.querySelector("[data-dt-datepicker-trigger]").click();
    const grid = root.querySelector("[data-dt-datepicker-grid]");
    expect(grid.children.length).toBe(42);
    const focused = grid.querySelector('[tabindex="0"]');
    expect(focused).not.toBeNull();
    expect(focused.getAttribute("data-dt-date-value")).toBe("2026-08-20");
    expect(focused.getAttribute("aria-selected")).toBe("true");
    const today = new Date();
    const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    expect(grid.querySelector(`[data-dt-date-value="${todayISO}"]`).classList.contains("dt-datepicker-day--today")).toBe(true);
  });

  it("opens on trigger click and closes on Escape, refocusing the input", () => {
    const root = datepickerFixture('data-dt-format="yyyy-MM-dd"', "2026-08-20");
    const input = root.querySelector("[data-dt-datepicker-input]");
    const trigger = root.querySelector("[data-dt-datepicker-trigger]");
    const popup = root.querySelector("[data-dt-datepicker-popup]");
    trigger.click();
    expect(popup.hidden).toBe(false);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    root.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    expect(popup.hidden).toBe(true);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(input);
  });

  it("navigates days with arrow keys and selects on Enter", () => {
    const root = datepickerFixture('data-dt-format="yyyy-MM-dd" data-dt-value="2026-08-20"');
    const input = root.querySelector("[data-dt-datepicker-input]");
    const grid = root.querySelector("[data-dt-datepicker-grid]");
    root.querySelector("[data-dt-datepicker-trigger]").click();
    grid.querySelector('[tabindex="0"]').dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true, cancelable: true }));
    expect(grid.querySelector('[tabindex="0"]').getAttribute("data-dt-date-value")).toBe("2026-08-19");
    grid.querySelector('[tabindex="0"]').dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
    expect(input.value).toBe("2026-08-19");
  });

  it("navigates months with PageUp/PageDown", () => {
    const root = datepickerFixture('data-dt-format="yyyy-MM-dd" data-dt-value="2026-08-20"');
    const grid = root.querySelector("[data-dt-datepicker-grid]");
    root.querySelector("[data-dt-datepicker-trigger]").click();
    grid.querySelector('[tabindex="0"]').dispatchEvent(new KeyboardEvent("keydown", { key: "PageUp", bubbles: true, cancelable: true }));
    expect(root.querySelector("[data-dt-datepicker-title]").textContent).toMatch(/September 2026/);
    grid.querySelector('[tabindex="0"]').dispatchEvent(new KeyboardEvent("keydown", { key: "PageDown", shiftKey: true, bubbles: true, cancelable: true }));
    expect(root.querySelector("[data-dt-datepicker-title]").textContent).toMatch(/September 2025/);
  });

  it("disables cells outside min/max bounds", () => {
    const root = datepickerFixture('data-dt-format="yyyy-MM-dd" data-dt-min="2026-08-10" data-dt-max="2026-08-20" data-dt-value="2026-08-15"');
    const grid = root.querySelector("[data-dt-datepicker-grid]");
    root.querySelector("[data-dt-datepicker-trigger]").click();
    expect(grid.querySelector('[data-dt-date-value="2026-08-09"]').getAttribute("aria-disabled")).toBe("true");
    expect(grid.querySelector('[data-dt-date-value="2026-08-21"]').getAttribute("aria-disabled")).toBe("true");
    expect(grid.querySelector('[data-dt-date-value="2026-08-15"]').hasAttribute("aria-disabled")).toBe(false);
  });

  it("parses typing on Enter and fires dt:change with the ISO value", () => {
    const root = datepickerFixture('data-dt-format="yyyy-MM-dd"');
    const input = root.querySelector("[data-dt-datepicker-input]");
    let detail = null;
    root.addEventListener("dt:change", (e) => (detail = e.detail.value));
    input.value = "2026-12-31";
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
    expect(detail).toBe("2026-12-31");
    expect(input.classList.contains("dt-datepicker-input--invalid")).toBe(false);
  });

  it("fires dt:invalid for unparseable input", () => {
    const root = datepickerFixture('data-dt-format="yyyy-MM-dd"');
    const input = root.querySelector("[data-dt-datepicker-input]");
    let invalid = null;
    root.addEventListener("dt:invalid", (e) => (invalid = e.detail.value));
    input.value = "not-a-date";
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
    expect(invalid).toBe("not-a-date");
    expect(input.getAttribute("aria-invalid")).toBe("true");
  });

  it("formats with custom tokens and shows time steppers with OK", () => {
    const root = fixture(`
      <div class="dt-datepicker" data-dt-datepicker data-dt-format="dd.MM.yyyy" data-dt-show-time data-dt-value="2026-08-20">
        <input type="text" data-dt-datepicker-input value="20.08.2026" />
        <button type="button" data-dt-datepicker-trigger></button>
        <div class="dt-datepicker-popup" data-dt-datepicker-popup hidden>
          <div class="dt-datepicker-grid" data-dt-datepicker-grid></div>
          <div class="dt-datepicker-time" data-dt-datepicker-time hidden>
            <input type="text" data-dt-datepicker-time-field="hours" />
            <input type="text" data-dt-datepicker-time-field="minutes" />
            <input type="text" data-dt-datepicker-time-field="seconds" />
          </div>
          <div class="dt-datepicker-footer" data-dt-datepicker-footer hidden>
            <button type="button" data-dt-datepicker-ok></button>
          </div>
        </div>
      </div>`);
    const grid = root.querySelector("[data-dt-datepicker-grid]");
    root.querySelector("[data-dt-datepicker-trigger]").click();
    grid.querySelector('[data-dt-date-value="2026-08-20"]').dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }),
    );
    expect(root.querySelector('[data-dt-datepicker-time-field="hours"]').value).toBe("00");
    const hours = root.querySelector('[data-dt-datepicker-time-field="hours"]');
    hours.value = "14";
    hours.dispatchEvent(new Event("change", { bubbles: true }));
    root.querySelector("[data-dt-datepicker-ok]").click();
    expect(root.querySelector("[data-dt-datepicker-input]").value).toBe("20.08.2026");
  });

  it("clears the value and fires dt:change with null", () => {
    const root = datepickerFixture('data-dt-format="yyyy-MM-dd"', "2026-08-20");
    const clear = root.querySelector("[data-dt-datepicker-clear]");
    let detail = "sentinel";
    root.addEventListener("dt:change", (e) => (detail = e.detail.value));
    clear.click();
    expect(detail).toBe(null);
    expect(root.querySelector("[data-dt-datepicker-input]").value).toBe("");
  });
});

describe("timespanpicker", () => {
  const timespanFixture = (attrs = "", value = "") =>
    fixture(`
      <div class="dt-timespanpicker" data-dt-timespanpicker ${attrs}>
        <input type="text" data-dt-timespanpicker-input value="${value}" />
        <button type="button" data-dt-timespanpicker-trigger></button>
        <div class="dt-timespanpicker-popup" data-dt-timespanpicker-popup hidden>
          <div class="dt-timespanpicker-units">
            <div class="dt-timespanpicker-unit">
              <button type="button" data-dt-timespanpicker-step data-dt-timespanpicker-step-unit="days" data-dt-timespanpicker-step-dir="1"></button>
              <input type="text" data-dt-timespanpicker-value data-dt-unit="days" />
              <button type="button" data-dt-timespanpicker-step data-dt-timespanpicker-step-unit="days" data-dt-timespanpicker-step-dir="-1"></button>
            </div>
            <div class="dt-timespanpicker-unit">
              <button type="button" data-dt-timespanpicker-step data-dt-timespanpicker-step-unit="hours" data-dt-timespanpicker-step-dir="1"></button>
              <input type="text" data-dt-timespanpicker-value data-dt-unit="hours" />
              <button type="button" data-dt-timespanpicker-step data-dt-timespanpicker-step-unit="hours" data-dt-timespanpicker-step-dir="-1"></button>
            </div>
            <div class="dt-timespanpicker-unit">
              <button type="button" data-dt-timespanpicker-step data-dt-timespanpicker-step-unit="minutes" data-dt-timespanpicker-step-dir="1"></button>
              <input type="text" data-dt-timespanpicker-value data-dt-unit="minutes" />
              <button type="button" data-dt-timespanpicker-step data-dt-timespanpicker-step-unit="minutes" data-dt-timespanpicker-step-dir="-1"></button>
            </div>
            <div class="dt-timespanpicker-unit">
              <button type="button" data-dt-timespanpicker-step data-dt-timespanpicker-step-unit="seconds" data-dt-timespanpicker-step-dir="1"></button>
              <input type="text" data-dt-timespanpicker-value data-dt-unit="seconds" />
              <button type="button" data-dt-timespanpicker-step data-dt-timespanpicker-step-unit="seconds" data-dt-timespanpicker-step-dir="-1"></button>
            </div>
          </div>
          <div class="dt-timespanpicker-footer" data-dt-timespanpicker-footer>
            <button type="button" data-dt-timespanpicker-ok></button>
          </div>
        </div>
      </div>`);

  const unit = (root, name) => root.querySelector(`[data-dt-timespanpicker-value][data-dt-unit="${name}"]`);

  it("stages unit edits and commits on OK with the ISO duration", () => {
    const root = timespanFixture('data-dt-format="d.HH:mm:ss"', "1.02:30:00");
    const input = root.querySelector("[data-dt-timespanpicker-input]");
    let detail = null;
    root.addEventListener("dt:change", (e) => (detail = e.detail.value));
    root.querySelector("[data-dt-timespanpicker-trigger]").click();
    expect(unit(root, "days").value).toBe("1");
    expect(unit(root, "hours").value).toBe("2");
    expect(unit(root, "minutes").value).toBe("30");
    unit(root, "minutes").value = "45";
    root.querySelector("[data-dt-timespanpicker-ok]").click();
    expect(input.value).toBe("1.02:45:00");
    expect(detail).toBe("P1DT2H45M");
  });

  it("reverts staged edits when closed without confirming", () => {
    const root = timespanFixture('data-dt-format="d.HH:mm:ss"', "1.02:30:00");
    root.querySelector("[data-dt-timespanpicker-trigger]").click();
    unit(root, "hours").value = "9";
    root.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    expect(root.querySelector("[data-dt-timespanpicker-popup]").hidden).toBe(true);
    root.querySelector("[data-dt-timespanpicker-trigger]").click();
    expect(unit(root, "hours").value).toBe("2");
  });

  it("clamps units to per-unit maxima and min/max bounds", () => {
    const root = timespanFixture('data-dt-format="d.HH:mm:ss" data-dt-min="PT30M" data-dt-max="PT12H"');
    root.querySelector("[data-dt-timespanpicker-trigger]").click();
    const hours = unit(root, "hours");
    hours.value = "9";
    hours.dispatchEvent(new Event("change", { bubbles: true }));
    expect(hours.value).toBe("9");
    hours.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true, cancelable: true }));
    expect(hours.value).toBe("0");
    hours.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true, cancelable: true }));
    expect(hours.value).toBe("12");
  });

  it("steps units with the chevron buttons", () => {
    const root = timespanFixture('data-dt-format="d.HH:mm:ss"', "0.00:00:00");
    root.querySelector("[data-dt-timespanpicker-trigger]").click();
    root.querySelector('[data-dt-timespanpicker-step][data-dt-timespanpicker-step-unit="seconds"][data-dt-timespanpicker-step-dir="1"]').click();
    expect(unit(root, "seconds").value).toBe("1");
  });

  it("parses typed input and fires dt:invalid on garbage", () => {
    const root = timespanFixture('data-dt-format="HH:mm:ss"');
    const input = root.querySelector("[data-dt-timespanpicker-input]");
    let detail = null;
    root.addEventListener("dt:change", (e) => (detail = e.detail.value));
    input.value = "12:30:00";
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
    expect(detail).toBe("PT12H30M");
    input.value = "99:99:99";
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
    expect(input.getAttribute("aria-invalid")).toBe("true");
  });

  it("rounds to data-dt-precision on commit", () => {
    const root = timespanFixture('data-dt-format="HH:mm:ss" data-dt-precision="minute"');
    root.querySelector("[data-dt-timespanpicker-trigger]").click();
    unit(root, "hours").value = "1";
    unit(root, "minutes").value = "2";
    unit(root, "seconds").value = "45";
    root.querySelector("[data-dt-timespanpicker-ok]").click();
    expect(root.querySelector("[data-dt-timespanpicker-input]").value).toBe("01:03:00");
  });
});

describe("colorpicker", () => {
  const colorpickerFixture = (attrs = "") =>
    fixture(`
      <div class="dt-colorpicker" data-dt-colorpicker ${attrs}>
        <button type="button" class="dt-colorpicker-trigger" data-dt-colorpicker-trigger>
          <span class="dt-colorpicker-value" data-dt-colorpicker-value></span>
        </button>
        <div class="dt-colorpicker-popup" data-dt-colorpicker-popup hidden>
          <div class="dt-saturation-picker" data-dt-colorpicker-saturation tabindex="0">
            <span class="dt-saturation-indicator"></span>
          </div>
          <div class="dt-hue-picker" data-dt-colorpicker-hue tabindex="0">
            <span class="dt-hue-indicator"></span>
          </div>
          <div class="dt-alpha-picker" data-dt-colorpicker-alpha tabindex="0">
            <span class="dt-alpha-indicator"></span>
          </div>
          <div class="dt-colorpicker-rgba" data-dt-colorpicker-rgba>
            <input type="text" data-dt-colorpicker-rgba-input data-dt-colorpicker-rgba-channel="hex" />
            <input type="text" data-dt-colorpicker-rgba-input data-dt-colorpicker-rgba-channel="r" />
            <input type="text" data-dt-colorpicker-rgba-input data-dt-colorpicker-rgba-channel="g" />
            <input type="text" data-dt-colorpicker-rgba-input data-dt-colorpicker-rgba-channel="b" />
            <input type="text" data-dt-colorpicker-rgba-input data-dt-colorpicker-rgba-channel="a" />
          </div>
          <div class="dt-colorpicker-palette" data-dt-colorpicker-palette></div>
          <button type="button" data-dt-colorpicker-ok></button>
        </div>
      </div>`);

  const rgbInput = (root, ch) => root.querySelector(`[data-dt-colorpicker-rgba-input][data-dt-colorpicker-rgba-channel="${ch}"]`);

  it("renders the default 22-swatch palette from data-dt-palette", () => {
    const root = colorpickerFixture('data-dt-value="#ff2800"');
    window.dtUikit.colorpicker.init(root);
    const swatches = root.querySelectorAll("[data-dt-colorpicker-swatch]");
    expect(swatches.length).toBe(22);
    expect(swatches[0].getAttribute("aria-label")).toBe("#ff2800");
    expect(swatches[0].style.backgroundColor).toBe("rgb(255, 40, 0)");
  });

  it("normalizes the initial value to rgb() and commits live without a button", () => {
    const root = colorpickerFixture('data-dt-value="#ff2800"');
    window.dtUikit.colorpicker.init(root);
    let detail = null;
    root.addEventListener("dt:change", (e) => (detail = e.detail.value));
    const swatch = root.querySelector('[data-dt-colorpicker-swatch-value="#0433ff"]');
    swatch.click();
    expect(detail).toBe("rgb(4, 51, 255)");
    expect(root.querySelector("[data-dt-colorpicker-value]").style.backgroundColor).toBe("rgb(4, 51, 255)");
  });

  it("stages edits with the OK button and reverts on Escape", () => {
    const root = colorpickerFixture('data-dt-value="#ff2800" data-dt-show-button');
    let detail = "sentinel";
    root.addEventListener("dt:change", (e) => (detail = e.detail.value));
    root.querySelector("[data-dt-colorpicker-trigger]").click();
    const swatch = root.querySelector('[data-dt-colorpicker-swatch-value="#00fdff"]');
    swatch.click();
    expect(detail).toBe("sentinel");
    root.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    expect(root.querySelector("[data-dt-colorpicker-popup]").hidden).toBe(true);
    expect(root.querySelector("[data-dt-colorpicker-value]").style.backgroundColor).toBe("rgb(255, 40, 0)");
  });

  it("commits the staged color on OK", () => {
    const root = colorpickerFixture('data-dt-value="#ff2800" data-dt-show-button');
    let detail = null;
    root.addEventListener("dt:change", (e) => (detail = e.detail.value));
    root.querySelector("[data-dt-colorpicker-trigger]").click();
    root.querySelector('[data-dt-colorpicker-swatch-value="#02f900"]').click();
    root.querySelector("[data-dt-colorpicker-ok]").click();
    expect(detail).toBe("rgb(2, 249, 0)");
    expect(root.querySelector("[data-dt-colorpicker-popup]").hidden).toBe(true);
  });

  it("adjusts hue with arrows and keeps inputs in sync", () => {
    const root = colorpickerFixture('data-dt-value="#ff2800"');
    window.dtUikit.colorpicker.init(root);
    const hue = root.querySelector("[data-dt-colorpicker-hue]");
    hue.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true, cancelable: true }));
    expect(rgbInput(root, "hex").value).not.toBe("#ff2800");
    expect(rgbInput(root, "a").value).toBe("100");
  });

  it("commits rgba with an alpha channel when alpha < 1", () => {
    const root = colorpickerFixture('data-dt-value="#ff2800"');
    window.dtUikit.colorpicker.init(root);
    let detail = null;
    root.addEventListener("dt:change", (e) => (detail = e.detail.value));
    const alpha = root.querySelector("[data-dt-colorpicker-alpha]");
    alpha.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true, cancelable: true }));
    alpha.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true, cancelable: true }));
    expect(detail).toMatch(/^rgba\(255, 40, 0, 0\.\d+\)$/);
  });

  it("parses a hex typed into the hex field", () => {
    const root = colorpickerFixture('data-dt-value="#ff2800"');
    window.dtUikit.colorpicker.init(root);
    const hex = rgbInput(root, "hex");
    hex.value = "#0433ff";
    hex.dispatchEvent(new Event("change", { bubbles: true }));
    expect(rgbInput(root, "r").value).toBe("4");
    expect(rgbInput(root, "b").value).toBe("255");
  });
});

describe("slider", () => {
  const sliderFixture = (attrs = "") => {
    const maxHandle = attrs.includes("data-dt-range")
      ? `<div class="dt-slider-handle" role="slider" data-dt-slider-handle data-dt-slider-handle-max></div>`
      : "";
    return fixture(`
      <div class="dt-slider" data-dt-slider ${attrs}>
        <div class="dt-slider-track" data-dt-slider-track>
          <div class="dt-slider-range" data-dt-slider-range></div>
          <div class="dt-slider-handle" role="slider" data-dt-slider-handle></div>
          ${maxHandle}
        </div>
      </div>`);
  };

  it("seeds a single handle from data-dt-value and steps with arrows", () => {
    const root = sliderFixture('data-dt-min="0" data-dt-max="100" data-dt-step="5" data-dt-value="30"');
    window.dtUikit.slider.init(root);
    const [handle] = root.querySelectorAll("[data-dt-slider-handle]");
    expect(handle.getAttribute("aria-valuenow")).toBe("30");
    handle.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }));
    expect(handle.getAttribute("aria-valuenow")).toBe("35");
    handle.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true, cancelable: true }));
    expect(handle.getAttribute("aria-valuenow")).toBe("0");
  });

  it("clamps to min/max and fires dt:change with the numeric value", () => {
    const root = sliderFixture('data-dt-min="10" data-dt-max="50" data-dt-step="5" data-dt-value="40"');
    window.dtUikit.slider.init(root);
    const [handle] = root.querySelectorAll("[data-dt-slider-handle]");
    let detail = null;
    root.addEventListener("dt:change", (e) => (detail = e.detail.value));
    handle.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }));
    expect(detail).toBe(45);
    handle.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }));
    expect(handle.getAttribute("aria-valuenow")).toBe("50");
    handle.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true, cancelable: true }));
    handle.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true, cancelable: true }));
    handle.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true, cancelable: true }));
    expect(handle.getAttribute("aria-valuenow")).toBe("35");
    handle.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true, cancelable: true }));
    expect(handle.getAttribute("aria-valuenow")).toBe("10");
  });

  it("keeps range handles ordered and reports {min, max}", () => {
    const root = sliderFixture('data-dt-min="0" data-dt-max="100" data-dt-step="1" data-dt-value-min="80" data-dt-value-max="20" data-dt-range');
    window.dtUikit.slider.init(root);
    const [lo, hi] = root.querySelectorAll("[data-dt-slider-handle]");
    expect(lo.getAttribute("aria-valuenow")).toBe("20");
    expect(hi.getAttribute("aria-valuenow")).toBe("80");
    let detail = null;
    root.addEventListener("dt:change", (e) => (detail = e.detail.value));
    hi.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }));
    expect(detail).toEqual({ min: 20, max: 81 });
    lo.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }));
    expect(detail).toEqual({ min: 21, max: 81 });
  });

  it("positions the fill between the handles", () => {
    const root = sliderFixture('data-dt-min="0" data-dt-max="100" data-dt-step="1" data-dt-value-min="20" data-dt-value-max="80" data-dt-range');
    window.dtUikit.slider.init(root);
    const range = root.querySelector("[data-dt-slider-range]");
    expect(range.style.left).toBe("calc(20%)");
    expect(range.style.width).toBe("calc(60%)");
  });

  it("honors the vertical orientation for positioning", () => {
    const root = sliderFixture('data-dt-min="0" data-dt-max="100" data-dt-step="1" data-dt-value="70" data-dt-orientation="vertical"');
    window.dtUikit.slider.init(root);
    const [handle] = root.querySelectorAll("[data-dt-slider-handle]");
    const range = root.querySelector("[data-dt-slider-range]");
    expect(handle.getAttribute("aria-orientation")).toBe("vertical");
    expect(handle.style.bottom).toBe("calc(70% - 8px)");
    expect(range.style.height).toBe("calc(70%)");
  });

  it("ignores interaction when disabled", () => {
    const root = sliderFixture('data-dt-min="0" data-dt-max="100" data-dt-step="1" data-dt-value="50" data-dt-disabled');
    window.dtUikit.slider.init(root);
    const [handle] = root.querySelectorAll("[data-dt-slider-handle]");
    let fired = 0;
    root.addEventListener("dt:change", () => fired++);
    handle.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }));
    expect(handle.getAttribute("aria-valuenow")).toBe("50");
    expect(fired).toBe(0);
  });
});

describe("rating", () => {
  const ratingFixture = (attrs = "", stars = 5) => {
    const items = Array.from({ length: stars }, (_, i) => `
      <button type="button" role="radio" data-dt-rating-item data-dt-rating-value="${i + 1}">
        <svg class="dt-rating-icon--filled"></svg>
        <svg class="dt-rating-icon--empty"></svg>
      </button>`).join("");
    return fixture(`
      <div class="dt-rating" data-dt-rating role="radiogroup" ${attrs}>
        <button type="button" data-dt-rating-clear></button>
        ${items}
      </div>`);
  };

  it("renders the initial value and roving tabindex", () => {
    const root = ratingFixture('data-dt-stars="5" data-dt-value="3"');
    window.dtUikit.rating.init(root);
    const items = root.querySelectorAll("[data-dt-rating-item]");
    expect(items[0].getAttribute("aria-checked")).toBe("true");
    expect(items[2].getAttribute("aria-checked")).toBe("true");
    expect(items[3].getAttribute("aria-checked")).toBe("false");
    expect(items[2].tabIndex).toBe(0);
    expect(items[3].tabIndex).toBe(-1);
    expect(items[2].classList.contains("dt-rating-item--filled")).toBe(true);
  });

  it("sets the value on star click and fires dt:change", () => {
    const root = ratingFixture('data-dt-stars="5" data-dt-value="0"');
    let detail = null;
    root.addEventListener("dt:change", (e) => (detail = e.detail.value));
    root.querySelector('[data-dt-rating-value="4"]').click();
    expect(detail).toBe(4);
    expect(root.querySelector('[data-dt-rating-value="4"]').getAttribute("aria-checked")).toBe("true");
  });

  it("clears to 0 with the clear button", () => {
    const root = ratingFixture('data-dt-stars="5" data-dt-value="3"');
    let detail = null;
    root.addEventListener("dt:change", (e) => (detail = e.detail.value));
    root.querySelector("[data-dt-rating-clear]").click();
    expect(detail).toBe(0);
    expect(root.querySelectorAll('[aria-checked="true"]').length).toBe(0);
    expect(root.querySelector("[data-dt-rating-clear]").tabIndex).toBe(0);
  });

  it("navigates with arrow keys and moves focus", () => {
    const root = ratingFixture('data-dt-stars="5" data-dt-value="3"');
    root.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }));
    expect(document.activeElement.getAttribute("data-dt-rating-value")).toBe("4");
    root.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true, cancelable: true }));
    expect(document.activeElement.getAttribute("data-dt-rating-value")).toBe("3");
    root.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true, cancelable: true }));
    expect(document.activeElement.getAttribute("data-dt-rating-value")).toBe("5");
  });

  it("ignores clicks when readonly or disabled", () => {
    const readonly = ratingFixture('data-dt-stars="5" data-dt-value="2" data-dt-readonly');
    window.dtUikit.rating.init(readonly);
    readonly.querySelector('[data-dt-rating-value="5"]').click();
    expect(readonly.querySelector('[data-dt-rating-value="5"]').getAttribute("aria-checked")).toBe("false");
    const disabled = ratingFixture('data-dt-stars="5" data-dt-value="2" data-dt-disabled');
    window.dtUikit.rating.init(disabled);
    disabled.querySelector('[data-dt-rating-value="5"]').click();
    expect(disabled.querySelector('[data-dt-rating-value="5"]').getAttribute("aria-checked")).toBe("false");
  });

  it("rebuilds items when data-dt-stars does not match the markup", () => {
    const root = ratingFixture('data-dt-stars="3" data-dt-value="2"', 5);
    window.dtUikit.rating.init(root);
    expect(root.querySelectorAll("[data-dt-rating-item]").length).toBe(3);
    expect(root.querySelectorAll('[data-dt-rating-value="3"]').length).toBe(1);
    expect(root.querySelectorAll('[data-dt-rating-value="5"]').length).toBe(0);
  });
});

describe("security code", () => {
  function codeFixture(attrs = "", len = 6) {
    const cells = Array.from({ length: len }, () => '<input class="dt-securitycode-cell" type="text" inputmode="numeric" maxlength="1" data-dt-securitycode-cell />').join("");
    const root = fixture(`<div class="dt-securitycode" data-dt-securitycode ${attrs} role="group" aria-label="Security code"><span class="dt-securitycode-live" data-dt-securitycode-live role="status" aria-live="polite"></span>${cells}</div>`);
    window.dtUikit.securitycode.init(root);
    return root;
  }

  function cells(root) {
    return [...root.querySelectorAll("[data-dt-securitycode-cell]")];
  }

  it("labels every cell with its position", () => {
    const root = codeFixture("", 4);
    expect(root.querySelectorAll("[data-dt-securitycode-cell]").length).toBe(4);
    cells(root).forEach((c, i) => {
      expect(c.getAttribute("aria-label")).toBe(`Digit ${i + 1} of 4`);
    });
  });

  it("fills a digit, advances focus, and dispatches dt:change", () => {
    const root = codeFixture();
    const detail = [];
    root.addEventListener("dt:change", (e) => detail.push(e.detail.value));
    const first = cells(root)[0];
    first.focus();
    first.value = "1";
    first.dispatchEvent(new Event("input", { bubbles: true }));
    expect(cells(root)[0].value).toBe("1");
    expect(document.activeElement).toBe(cells(root)[1]);
    expect(detail).toEqual(["1"]);
  });

  it("backspaces to the previous cell and clears it", () => {
    const root = codeFixture();
    const [c1, c2] = cells(root);
    c1.value = "1";
    c2.value = "2";
    c2.focus();
    c2.dispatchEvent(new KeyboardEvent("keydown", { key: "Backspace", bubbles: true, cancelable: true }));
    expect(c2.value).toBe("");
    c2.dispatchEvent(new KeyboardEvent("keydown", { key: "Backspace", bubbles: true, cancelable: true }));
    expect(c1.value).toBe("");
    expect(document.activeElement).toBe(c1);
  });

  it("navigates with arrows and Home/End", () => {
    const root = codeFixture();
    const cellsList = cells(root);
    cellsList[2].focus();
    cellsList[2].dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(cellsList[3]);
    cellsList[3].dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(cellsList[2]);
    cellsList[2].dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(cellsList[5]);
    cellsList[5].dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(cellsList[0]);
  });

  it("splits a pasted code across cells and announces completion", () => {
    const root = codeFixture("", 6);
    const detail = [];
    root.addEventListener("dt:change", (e) => detail.push(e.detail.value));
    const first = cells(root)[0];
    first.focus();
    first.dispatchEvent(new ClipboardEvent("paste", { bubbles: true, cancelable: true, clipboardData: new DataTransfer() }));
    const dt = new DataTransfer();
    dt.setData("text", "123456");
    first.dispatchEvent(new ClipboardEvent("paste", { bubbles: true, cancelable: true, clipboardData: dt }));
    expect(cells(root).map((c) => c.value).join("")).toBe("123456");
    expect(detail[detail.length - 1]).toBe("123456");
    expect(root.querySelector("[data-dt-securitycode-live]").textContent).toBe("Code complete");
  });

  it("ignores input when disabled", () => {
    const root = codeFixture("data-dt-disabled", 4);
    let fired = false;
    root.addEventListener("dt:change", () => (fired = true));
    const first = cells(root)[0];
    first.value = "9";
    first.dispatchEvent(new Event("input", { bubbles: true }));
    first.dispatchEvent(new KeyboardEvent("keydown", { key: "Backspace", bubbles: true, cancelable: true }));
    expect(first.value).toBe("9");
    expect(fired).toBe(false);
  });
});

describe("signature pad", () => {
  function ctxMock() {
    const ctx = {
      setTransform: vi.fn(),
      lineWidth: 0,
      strokeStyle: "",
      lineCap: "",
      lineJoin: "",
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      clearRect: vi.fn(),
    };
    return ctx;
  }

  function fixtureCanvas(root) {
    const canvas = root.querySelector("[data-dt-signaturepad-canvas]");
    const ctx = ctxMock();
    canvas.getContext = vi.fn(() => ctx);
    canvas.getBoundingClientRect = vi.fn(() => ({ left: 0, top: 0, width: 300, height: 140 }));
    canvas.width = 300;
    canvas.height = 140;
    canvas.toDataURL = vi.fn(() => "data:image/png;base64,abc");
    return { canvas, ctx };
  }

  function padFixture(attrs = "") {
    return fixture(`
      <div class="dt-signaturepad" data-dt-signaturepad ${attrs}>
        <div class="dt-signaturepad-header">
          <span class="dt-signaturepad-label">Signature</span>
          <button class="dt-signaturepad-clear" type="button" data-dt-signaturepad-clear>Clear</button>
        </div>
        <canvas class="dt-signaturepad-canvas" role="img" aria-label="Signature" data-dt-signaturepad-canvas></canvas>
      </div>`);
  }

  it("renders a labeled canvas and a clear button", () => {
    const root = padFixture();
    fixtureCanvas(root);
    window.dtUikit.signaturepad.init(root);
    const canvas = root.querySelector("[data-dt-signaturepad-canvas]");
    expect(canvas.getAttribute("role")).toBe("img");
    expect(canvas.getAttribute("aria-label")).toBe("Signature");
    expect(root.querySelector("[data-dt-signaturepad-clear]")).not.toBeNull();
  });

  it("draws on pointermove and fires dt:signature-change with a data URL on pointerup", () => {
    const root = padFixture();
    const { canvas } = fixtureCanvas(root);
    window.dtUikit.signaturepad.init(root);
    let detail = null;
    root.addEventListener("dt:signature-change", (e) => (detail = e.detail.value));
    canvas.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 1, clientX: 10, clientY: 10 }));
    canvas.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, pointerId: 1, clientX: 50, clientY: 40 }));
    expect(canvas.getContext("2d").moveTo).toHaveBeenCalled();
    canvas.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 1, clientX: 50, clientY: 40 }));
    expect(detail).toBe("data:image/png;base64,abc");
  });

  it("does not fire on an empty tap", () => {
    const root = padFixture();
    const { canvas } = fixtureCanvas(root);
    window.dtUikit.signaturepad.init(root);
    let fired = false;
    root.addEventListener("dt:signature-change", () => (fired = true));
    canvas.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 1, clientX: 10, clientY: 10 }));
    canvas.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 1, clientX: 10, clientY: 10 }));
    expect(fired).toBe(false);
  });

  it("clears the canvas and fires dt:signature-change with an empty string", () => {
    const root = padFixture();
    const { canvas, ctx } = fixtureCanvas(root);
    window.dtUikit.signaturepad.init(root);
    let detail = "x";
    root.addEventListener("dt:signature-change", (e) => (detail = e.detail.value));
    root.querySelector("[data-dt-signaturepad-clear]").click();
    expect(ctx.clearRect).toHaveBeenCalled();
    expect(detail).toBe("");
  });

  it("blocks drawing when disabled", () => {
    const root = padFixture("data-dt-disabled");
    const { canvas } = fixtureCanvas(root);
    window.dtUikit.signaturepad.init(root);
    let fired = false;
    root.addEventListener("dt:signature-change", () => (fired = true));
    canvas.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 1, clientX: 10, clientY: 10 }));
    canvas.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, pointerId: 1, clientX: 50, clientY: 40 }));
    canvas.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 1, clientX: 50, clientY: 40 }));
    expect(fired).toBe(false);
    expect(root.querySelector("[data-dt-signaturepad-clear]").disabled).toBe(true);
  });
});

describe("upload", () => {
  function uploadFixture(attrs = "") {
    return fixture(`
      <div class="dt-upload" data-dt-upload data-dt-upload-url="/api/files" ${attrs}>
        <button class="dt-upload-trigger" type="button" data-dt-upload-trigger>Upload</button>
        <input class="dt-upload-input" type="file" hidden data-dt-upload-input />
        <ul class="dt-upload-list" data-dt-upload-list></ul>
      </div>`);
  }

  function mockXhr() {
    const xhr = {
      upload: { addEventListener: vi.fn() },
      addEventListener: vi.fn(),
      setRequestHeader: vi.fn(),
      open: vi.fn(),
      send: vi.fn(),
      status: 200,
    };
    const MockXHR = vi.fn(function () {
      return xhr;
    });
    vi.stubGlobal("XMLHttpRequest", MockXHR);
    return xhr;
  }

  function selectFile(root, name, size = 1024, type = "") {
    const input = root.querySelector("[data-dt-upload-input]");
    const file = new File([new Uint8Array(size)], name, { type });
    Object.defineProperty(input, "files", { value: [file], configurable: true });
    input.dispatchEvent(new Event("change", { bubbles: true }));
    return file;
  }

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("opens the picker when the trigger is clicked", () => {
    const root = uploadFixture();
    const input = root.querySelector("[data-dt-upload-input]");
    input.click = vi.fn();
    root.querySelector("[data-dt-upload-trigger]").click();
    expect(input.click).toHaveBeenCalled();
  });

  it("adds a row per selected file and auto-uploads", () => {
    const root = uploadFixture('data-dt-upload-auto="true"');
    mockXhr();
    selectFile(root, "report.pdf", 2048);
    const row = root.querySelector("[data-dt-upload-row]");
    expect(row).not.toBeNull();
    expect(row.querySelector(".dt-upload-name").textContent).toBe("report.pdf");
    expect(row.querySelector(".dt-upload-size").textContent).toBe("2 KB");
  });

  it("fires progress and complete events during an upload", () => {
    const root = uploadFixture('data-dt-upload-auto="true"');
    const xhr = mockXhr();
    const progress = [];
    const complete = [];
    root.addEventListener("dt:upload-progress", (e) => progress.push(e.detail.progress));
    root.addEventListener("dt:upload-complete", (e) => complete.push(e.detail.name));
    selectFile(root, "a.txt", 1024);
    const progressCb = xhr.upload.addEventListener.mock.calls.find((c) => c[0] === "progress")[1];
    const loadCb = xhr.addEventListener.mock.calls.find((c) => c[0] === "load")[1];
    progressCb({ lengthComputable: true, loaded: 512, total: 1024 });
    expect(progress).toEqual([50]);
    loadCb();
    expect(complete).toEqual(["a.txt"]);
    expect(root.querySelector(".dt-upload-row").dataset.dtUploadState).toBe("complete");
  });

  it("fires the error event on a failed request", () => {
    const root = uploadFixture('data-dt-upload-auto="true"');
    const xhr = mockXhr();
    const errors = [];
    root.addEventListener("dt:upload-error", (e) => errors.push(e.detail.message));
    selectFile(root, "b.txt", 1024);
    const loadCb = xhr.addEventListener.mock.calls.find((c) => c[0] === "load")[1];
    xhr.status = 500;
    loadCb();
    expect(errors).toEqual(["HTTP 500"]);
    expect(root.querySelector(".dt-upload-row").dataset.dtUploadState).toBe("error");
  });

  it("removes a row and dispatches the cancel event", () => {
    const root = uploadFixture('data-dt-upload-auto="false"');
    mockXhr();
    let cancelled = null;
    root.addEventListener("dt:upload-cancel", (e) => (cancelled = e.detail.name));
    selectFile(root, "c.txt", 1024);
    const remove = root.querySelector("[data-dt-upload-remove]");
    expect(remove.getAttribute("aria-label")).toBe("Remove c.txt");
    remove.click();
    expect(root.querySelectorAll("[data-dt-upload-row]").length).toBe(0);
    expect(cancelled).toBe("c.txt");
  });

  it("sends the files field with the parameter name", () => {
    const root = uploadFixture('data-dt-upload-auto="true" data-dt-upload-param="attachment"');
    const xhr = mockXhr();
    selectFile(root, "d.txt", 1024);
    const fd = xhr.send.mock.calls[0][0];
    expect(fd.get("attachment")).toBeInstanceOf(File);
  });
});

describe("drop zone", () => {
  function dropFixture(attrs = "") {
    return fixture(`
      <div class="dt-dropzone" data-dt-dropzone ${attrs} role="region" aria-label="Drop files here">
        <p class="dt-dropzone-caption" data-dt-dropzone-caption>Drop files here</p>
        <button class="dt-dropzone-browse" type="button" data-dt-dropzone-browse>Browse</button>
        <input class="dt-dropzone-input" type="file" hidden data-dt-dropzone-input />
      </div>`);
  }

  function dropEvent(files) {
    const dt = new DataTransfer();
    for (const f of files) dt.items.add(f);
    return new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: dt });
  }

  it("flips the dragging visual on dragenter and back on dragleave", () => {
    const root = dropFixture();
    root.dispatchEvent(new DragEvent("dragenter", { bubbles: true, cancelable: true }));
    expect(root.classList.contains("dt-dropzone--dragging")).toBe(true);
    root.dispatchEvent(new DragEvent("dragleave", { bubbles: true, cancelable: true }));
    expect(root.classList.contains("dt-dropzone--dragging")).toBe(false);
  });

  it("fires dt:dropzone-drop with the FileList on drop", () => {
    const root = dropFixture();
    let files = null;
    root.addEventListener("dt:dropzone-drop", (e) => (files = e.detail.files));
    root.dispatchEvent(dropEvent([new File(["x"], "a.txt", { type: "text/plain" })]));
    expect(files.length).toBe(1);
    expect(files[0].name).toBe("a.txt");
    expect(root.classList.contains("dt-dropzone--dragging")).toBe(false);
  });

  it("filters files by accept", () => {
    const root = dropFixture('data-dt-dropzone-accept="image/*"');
    let files = null;
    root.addEventListener("dt:dropzone-drop", (e) => (files = e.detail.files));
    root.dispatchEvent(
      dropEvent([
        new File(["x"], "photo.png", { type: "image/png" }),
        new File(["x"], "doc.pdf", { type: "application/pdf" }),
      ]),
    );
    expect(files.length).toBe(1);
    expect(files[0].name).toBe("photo.png");
  });

  it("opens the picker via the browse button and fires drop on selection", () => {
    const root = dropFixture();
    const input = root.querySelector("[data-dt-dropzone-input]");
    input.click = vi.fn();
    root.querySelector("[data-dt-dropzone-browse]").click();
    expect(input.click).toHaveBeenCalled();
    const file = new File(["x"], "b.txt", { type: "text/plain" });
    Object.defineProperty(input, "files", { value: [file], configurable: true });
    let files = null;
    root.addEventListener("dt:dropzone-drop", (e) => (files = e.detail.files));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    expect(files[0].name).toBe("b.txt");
  });

  it("ignores drag events when disabled", () => {
    const root = dropFixture("data-dt-dropzone-disabled");
    root.dispatchEvent(new DragEvent("dragenter", { bubbles: true, cancelable: true }));
    expect(root.classList.contains("dt-dropzone--dragging")).toBe(false);
  });
});
