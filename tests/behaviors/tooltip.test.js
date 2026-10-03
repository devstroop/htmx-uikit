import { beforeEach, describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

describe("tooltip", () => {
  beforeEach(() => vi.useFakeTimers());

  it("shows after the delay and sets aria-describedby on the trigger", () => {
    const root = fixture(`
      <span data-dx-tooltip data-dx-delay-ms="100">
        <button>Hover</button>
        <span data-dx-tooltip-content id="tt" hidden>Help</span>
      </span>`);
    const trigger = root.firstElementChild;
    root.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    expect(root.querySelector("[data-dx-tooltip-content]").hidden).toBe(true);
    vi.advanceTimersByTime(100);
    expect(root.querySelector("[data-dx-tooltip-content]").hidden).toBe(false);
    expect(trigger.getAttribute("aria-describedby")).toBe("tt");
  });

  it("hides on mouseout and removes the aria-describedby", () => {
    const root = fixture(`
      <span data-dx-tooltip>
        <button>Hover</button>
        <span data-dx-tooltip-content id="tt">Help</span>
      </span>`);
    root.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    vi.advanceTimersByTime(300);
    root.dispatchEvent(new MouseEvent("mouseout", { bubbles: true }));
    expect(root.querySelector("[data-dx-tooltip-content]").hidden).toBe(true);
  });

  it("hides on Escape", () => {
    const root = fixture(`
      <span data-dx-tooltip>
        <button>Hover</button>
        <span data-dx-tooltip-content id="tt">Help</span>
      </span>`);
    root.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    vi.advanceTimersByTime(300);
    root.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(root.querySelector("[data-dx-tooltip-content]").hidden).toBe(true);
  });
});
