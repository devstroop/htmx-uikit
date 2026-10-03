import { beforeEach, describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

describe("slider", () => {
  const sliderFixture = (attrs = "") => {
    const maxHandle = attrs.includes("data-dx-range")
      ? `<div class="dx-slider-handle" role="slider" data-dx-slider-handle data-dx-slider-handle-max></div>`
      : "";
    return fixture(`
      <div class="dx-slider" data-dx-slider ${attrs}>
        <div class="dx-slider-track" data-dx-slider-track>
          <div class="dx-slider-range" data-dx-slider-range></div>
          <div class="dx-slider-handle" role="slider" data-dx-slider-handle></div>
          ${maxHandle}
        </div>
      </div>`);
  };

  it("seeds a single handle from data-dx-value and steps with arrows", () => {
    const root = sliderFixture('data-dx-min="0" data-dx-max="100" data-dx-step="5" data-dx-value="30"');
    window.dxUikit.slider.init(root);
    const [handle] = root.querySelectorAll("[data-dx-slider-handle]");
    expect(handle.getAttribute("aria-valuenow")).toBe("30");
    handle.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }));
    expect(handle.getAttribute("aria-valuenow")).toBe("35");
    handle.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true, cancelable: true }));
    expect(handle.getAttribute("aria-valuenow")).toBe("0");
  });

  it("clamps to min/max and fires dx:change with the numeric value", () => {
    const root = sliderFixture('data-dx-min="10" data-dx-max="50" data-dx-step="5" data-dx-value="40"');
    window.dxUikit.slider.init(root);
    const [handle] = root.querySelectorAll("[data-dx-slider-handle]");
    let detail = null;
    root.addEventListener("dx:change", (e) => (detail = e.detail.value));
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
    const root = sliderFixture('data-dx-min="0" data-dx-max="100" data-dx-step="1" data-dx-value-min="80" data-dx-value-max="20" data-dx-range');
    window.dxUikit.slider.init(root);
    const [lo, hi] = root.querySelectorAll("[data-dx-slider-handle]");
    expect(lo.getAttribute("aria-valuenow")).toBe("20");
    expect(hi.getAttribute("aria-valuenow")).toBe("80");
    let detail = null;
    root.addEventListener("dx:change", (e) => (detail = e.detail.value));
    hi.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }));
    expect(detail).toEqual({ min: 20, max: 81 });
    lo.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }));
    expect(detail).toEqual({ min: 21, max: 81 });
  });

  it("positions the fill between the handles", () => {
    const root = sliderFixture('data-dx-min="0" data-dx-max="100" data-dx-step="1" data-dx-value-min="20" data-dx-value-max="80" data-dx-range');
    window.dxUikit.slider.init(root);
    const range = root.querySelector("[data-dx-slider-range]");
    expect(range.style.left).toBe("calc(20%)");
    expect(range.style.width).toBe("calc(60%)");
  });

  it("honors the vertical orientation for positioning", () => {
    const root = sliderFixture('data-dx-min="0" data-dx-max="100" data-dx-step="1" data-dx-value="70" data-dx-orientation="vertical"');
    window.dxUikit.slider.init(root);
    const [handle] = root.querySelectorAll("[data-dx-slider-handle]");
    const range = root.querySelector("[data-dx-slider-range]");
    expect(handle.getAttribute("aria-orientation")).toBe("vertical");
    expect(handle.style.bottom).toBe("calc(70% - 8px)");
    expect(range.style.height).toBe("calc(70%)");
  });

  it("ignores interaction when disabled", () => {
    const root = sliderFixture('data-dx-min="0" data-dx-max="100" data-dx-step="1" data-dx-value="50" data-dx-disabled');
    window.dxUikit.slider.init(root);
    const [handle] = root.querySelectorAll("[data-dx-slider-handle]");
    let fired = 0;
    root.addEventListener("dx:change", () => fired++);
    handle.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }));
    expect(handle.getAttribute("aria-valuenow")).toBe("50");
    expect(fired).toBe(0);
  });
});
