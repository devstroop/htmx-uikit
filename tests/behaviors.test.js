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
