import { describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

describe("steps", () => {
  const stepsFixture = (attrs = "", body = defaultSteps) => {
    const root = fixture(`
      <nav class="dx-steps" data-dx-steps ${attrs} aria-label="Steps">
        <ol class="dx-steps-list" role="list" data-dx-steps-list>
          ${body}
        </ol>
        <div class="dx-steps-panels" data-dx-steps-panels>
          <div class="dx-steps-panel" role="tabpanel" data-dx-steps-panel data-dx-index="0">Details content</div>
          <div class="dx-steps-panel" role="tabpanel" data-dx-steps-panel data-dx-index="1" hidden>Payment content</div>
          <div class="dx-steps-panel" role="tabpanel" data-dx-steps-panel data-dx-index="2" hidden>Confirm content</div>
        </div>
      </nav>`);
    window.dxUikit.steps.init(root);
    return root;
  };

  const defaultSteps = `
    <li role="listitem" class="dx-steps-item">
      <button type="button" class="dx-steps-step dx-steps-step--active" data-dx-steps-item data-dx-index="0" data-dx-text="Details" aria-current="step" tabindex="0">
        <span class="dx-steps-circle" aria-hidden="true"><span class="dx-steps-number">1</span></span>
        <span class="dx-steps-text">Details</span>
      </button>
    </li>
    <li role="listitem" class="dx-steps-item">
      <span class="dx-steps-connector" aria-hidden="true"></span>
      <button type="button" class="dx-steps-step" data-dx-steps-item data-dx-index="1" data-dx-text="Payment" tabindex="0">
        <span class="dx-steps-circle" aria-hidden="true"><span class="dx-steps-number">2</span></span>
        <span class="dx-steps-text">Payment</span>
      </button>
    </li>
    <li role="listitem" class="dx-steps-item">
      <span class="dx-steps-connector" aria-hidden="true"></span>
      <button type="button" class="dx-steps-step" data-dx-steps-item data-dx-index="2" data-dx-text="Confirm" tabindex="0">
        <span class="dx-steps-circle" aria-hidden="true"><span class="dx-steps-number">3</span></span>
        <span class="dx-steps-text">Confirm</span>
      </button>
    </li>`;

  const items = (root) => [...root.querySelectorAll("[data-dx-steps-item]")];
  const panels = (root) => [...root.querySelectorAll("[data-dx-steps-panel]")];

  it("activates a step on click, moves aria-current and shows its panel", () => {
    const root = stepsFixture("data-dx-selected-index=\"0\"");
    const listener = vi.fn();
    root.addEventListener("dx:steps-change", listener);
    const [details, , confirm] = items(root);
    confirm.click();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].detail).toEqual({ index: 2 });
    expect(details.hasAttribute("aria-current")).toBe(false);
    expect(confirm.getAttribute("aria-current")).toBe("step");
    expect(details.classList.contains("dx-steps-step--completed")).toBe(true);
    expect(details.querySelector(".dx-steps-check").getAttribute("aria-hidden")).toBe("true");
    expect(root.getAttribute("data-dx-selected-index")).toBe("2");
    const [p0, p1, p2] = panels(root);
    expect(p0.hidden).toBe(true);
    expect(p1.hidden).toBe(true);
    expect(p2.hidden).toBe(false);
  });

  it("does not dispatch when the active step is clicked again", () => {
    const root = stepsFixture("data-dx-selected-index=\"0\"");
    const listener = vi.fn();
    root.addEventListener("dx:steps-change", listener);
    items(root)[0].click();
    expect(listener).not.toHaveBeenCalled();
    expect(items(root)[0].getAttribute("aria-current")).toBe("step");
  });

  it("ignores clicks on disabled steps", () => {
    const body = `
      <li role="listitem" class="dx-steps-item">
        <button type="button" class="dx-steps-step" data-dx-steps-item data-dx-index="0" data-dx-text="Details" tabindex="0"><span class="dx-steps-circle" aria-hidden="true"><span class="dx-steps-number">1</span></span></button>
      </li>
      <li role="listitem" class="dx-steps-item">
        <span class="dx-steps-connector" aria-hidden="true"></span>
        <button type="button" class="dx-steps-step" data-dx-steps-item data-dx-index="1" data-dx-text="Payment" aria-disabled="true" disabled tabindex="-1"><span class="dx-steps-circle" aria-hidden="true"><span class="dx-steps-number">2</span></span></button>
      </li>
      <li role="listitem" class="dx-steps-item">
        <span class="dx-steps-connector" aria-hidden="true"></span>
        <button type="button" class="dx-steps-step" data-dx-steps-item data-dx-index="2" data-dx-text="Confirm" tabindex="0"><span class="dx-steps-circle" aria-hidden="true"><span class="dx-steps-number">3</span></span></button>
      </li>`;
    const root = stepsFixture("data-dx-selected-index=\"0\"", body);
    const listener = vi.fn();
    root.addEventListener("dx:steps-change", listener);
    const payment = items(root)[1];
    expect(payment.getAttribute("aria-disabled")).toBe("true");
    expect(payment.disabled).toBe(true);
    expect(payment.tabIndex).toBe(-1);
    payment.click();
    expect(listener).not.toHaveBeenCalled();
    expect(items(root)[0].getAttribute("aria-current")).toBe("step");
  });

  it("starts at data-dx-selected-index and marks only that step current", () => {
    const root = stepsFixture("data-dx-selected-index=\"2\"");
    const list = items(root);
    expect(list[2].getAttribute("aria-current")).toBe("step");
    expect(list[0].hasAttribute("aria-disabled")).toBe(false);
    expect(list[0].classList.contains("dx-steps-step--completed")).toBe(true);
    expect(list[1].classList.contains("dx-steps-step--completed")).toBe(true);
    expect(panels(root).map((p) => p.hidden)).toEqual([true, true, false]);
  });

  it("blocks skipping ahead in linear mode but allows the next step", () => {
    const root = stepsFixture('data-dx-linear data-dx-selected-index="0"');
    const listener = vi.fn();
    root.addEventListener("dx:steps-change", listener);
    const [details, payment, confirm] = items(root);
    expect(payment.getAttribute("aria-disabled")).toBeNull();
    expect(payment.disabled).toBe(false);
    expect(confirm.getAttribute("aria-disabled")).toBe("true");
    expect(confirm.tabIndex).toBe(-1);
    confirm.click();
    expect(listener).not.toHaveBeenCalled();
    expect(details.getAttribute("aria-current")).toBe("step");
    payment.click();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].detail).toEqual({ index: 1 });
    expect(payment.getAttribute("aria-current")).toBe("step");
    expect(details.classList.contains("dx-steps-step--completed")).toBe(true);
    expect(details.querySelector(".dx-steps-check")).toBeTruthy();
  });

  it("moves focus with arrows and Home/End", () => {
    const root = stepsFixture("data-dx-selected-index=\"0\"");
    const [details, payment, confirm] = items(root);
    details.focus();
    details.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(payment);
    payment.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(details);
    details.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(confirm);
    confirm.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(details);
    details.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(payment);
  });

  it("activates the focused step with Enter", () => {
    const root = stepsFixture("data-dx-selected-index=\"0\"");
    const listener = vi.fn();
    root.addEventListener("dx:steps-change", listener);
    const payment = items(root)[1];
    payment.focus();
    payment.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].detail).toEqual({ index: 1 });
    expect(payment.getAttribute("aria-current")).toBe("step");
  });

  it("wires ARIA: landmark, list roles and step state", () => {
    const root = stepsFixture("data-dx-selected-index=\"0\"");
    expect(root.tagName).toBe("NAV");
    expect(root.getAttribute("aria-label")).toBe("Steps");
    expect(root.querySelector('[role="list"]')).toBeTruthy();
    root.querySelectorAll('[role="listitem"]').forEach((li) => expect(li.tagName).toBe("LI"));
    const current = items(root).filter((item) => item.getAttribute("aria-current") === "step");
    expect(current).toHaveLength(1);
    expect(current[0].getAttribute("data-dx-text")).toBe("Details");
    root.querySelectorAll(".dx-steps-connector").forEach((c) => expect(c.getAttribute("aria-hidden")).toBe("true"));
    expect(root.getAttribute("data-dx-selected-index")).toBe("0");
  });

  it("initializes correctly when content arrives after an empty container", () => {
    const root = fixture(`
      <nav class="dx-steps" data-dx-steps aria-label="Steps">
        <ol class="dx-steps-list" role="list" data-dx-steps-list></ol>
      </nav>`);
    document.dispatchEvent(new Event("htmx:afterSettle"));
    root.innerHTML = `
      <ol class="dx-steps-list" role="list" data-dx-steps-list>
        <li role="listitem" class="dx-steps-item">
          <button type="button" class="dx-steps-step" data-dx-steps-item data-dx-index="0" data-dx-text="Details" tabindex="0"><span class="dx-steps-circle" aria-hidden="true"><span class="dx-steps-number">1</span></span></button>
        </li>
        <li role="listitem" class="dx-steps-item">
          <span class="dx-steps-connector" aria-hidden="true"></span>
          <button type="button" class="dx-steps-step" data-dx-steps-item data-dx-index="1" data-dx-text="Payment" aria-disabled="true" disabled tabindex="-1"><span class="dx-steps-circle" aria-hidden="true"><span class="dx-steps-number">2</span></span></button>
        </li>
        <li role="listitem" class="dx-steps-item">
          <span class="dx-steps-connector" aria-hidden="true"></span>
          <button type="button" class="dx-steps-step" data-dx-steps-item data-dx-index="2" data-dx-text="Confirm" tabindex="0"><span class="dx-steps-circle" aria-hidden="true"><span class="dx-steps-number">3</span></span></button>
        </li>
      </ol>
      <div class="dx-steps-panels" data-dx-steps-panels>
        <div class="dx-steps-panel" role="tabpanel" data-dx-steps-panel data-dx-index="0">Details content</div>
        <div class="dx-steps-panel" role="tabpanel" data-dx-steps-panel data-dx-index="1" hidden>Payment content</div>
        <div class="dx-steps-panel" role="tabpanel" data-dx-steps-panel data-dx-index="2" hidden>Confirm content</div>
      </div>`;
    document.dispatchEvent(new Event("htmx:afterSettle"));
    const listener = vi.fn();
    root.addEventListener("dx:steps-change", listener);
    const [details, payment, confirm] = items(root);
    expect(details.classList.contains("dx-steps-step--active")).toBe(true);
    expect(details.getAttribute("aria-current")).toBe("step");
    payment.click();
    expect(listener).not.toHaveBeenCalled();
    confirm.click();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(payment.getAttribute("aria-disabled")).toBe("true");
    expect(payment.disabled).toBe(true);
  });

  it("re-snapshots server disabled state and honors aria-current after a content swap", () => {
    const root = stepsFixture("data-dx-selected-index=\"0\"");
    const listener = vi.fn();
    root.addEventListener("dx:steps-change", listener);
    items(root)[2].click();
    expect(listener).toHaveBeenCalledTimes(1);
    root.querySelector("[data-dx-steps-list]").innerHTML = `
      <li role="listitem" class="dx-steps-item">
        <button type="button" class="dx-steps-step" data-dx-steps-item data-dx-index="0" data-dx-text="Details" aria-current="step" tabindex="0"><span class="dx-steps-circle" aria-hidden="true"><span class="dx-steps-number">1</span></span></button>
      </li>
      <li role="listitem" class="dx-steps-item">
        <span class="dx-steps-connector" aria-hidden="true"></span>
        <button type="button" class="dx-steps-step" data-dx-steps-item data-dx-index="1" data-dx-text="Payment" aria-disabled="true" disabled tabindex="-1"><span class="dx-steps-circle" aria-hidden="true"><span class="dx-steps-number">2</span></span></button>
      </li>
      <li role="listitem" class="dx-steps-item">
        <span class="dx-steps-connector" aria-hidden="true"></span>
        <button type="button" class="dx-steps-step" data-dx-steps-item data-dx-index="2" data-dx-text="Confirm" tabindex="0"><span class="dx-steps-circle" aria-hidden="true"><span class="dx-steps-number">3</span></span></button>
      </li>`;
    document.dispatchEvent(new Event("htmx:afterSettle"));
    const [details, payment] = items(root);
    expect(details.getAttribute("aria-current")).toBe("step");
    expect(root.getAttribute("data-dx-selected-index")).toBe("0");
    expect(payment.getAttribute("aria-disabled")).toBe("true");
    details.click();
    expect(payment.getAttribute("aria-disabled")).toBe("true");
    expect(payment.disabled).toBe(true);
    payment.click();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(details.getAttribute("aria-current")).toBe("step");
  });
});
