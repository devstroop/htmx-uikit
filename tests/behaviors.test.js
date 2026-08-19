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
