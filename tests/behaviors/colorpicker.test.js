import { beforeEach, describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

describe("colorpicker", () => {
  const colorpickerFixture = (attrs = "") =>
    fixture(`
      <div class="dx-colorpicker" data-dx-colorpicker ${attrs}>
        <button type="button" class="dx-colorpicker-trigger" data-dx-colorpicker-trigger>
          <span class="dx-colorpicker-value" data-dx-colorpicker-value></span>
        </button>
        <div class="dx-colorpicker-popup" data-dx-colorpicker-popup hidden>
          <div class="dx-saturation-picker" data-dx-colorpicker-saturation tabindex="0">
            <span class="dx-saturation-indicator"></span>
          </div>
          <div class="dx-hue-picker" data-dx-colorpicker-hue tabindex="0">
            <span class="dx-hue-indicator"></span>
          </div>
          <div class="dx-alpha-picker" data-dx-colorpicker-alpha tabindex="0">
            <span class="dx-alpha-indicator"></span>
          </div>
          <div class="dx-colorpicker-rgba" data-dx-colorpicker-rgba>
            <input type="text" data-dx-colorpicker-rgba-input data-dx-colorpicker-rgba-channel="hex" />
            <input type="text" data-dx-colorpicker-rgba-input data-dx-colorpicker-rgba-channel="r" />
            <input type="text" data-dx-colorpicker-rgba-input data-dx-colorpicker-rgba-channel="g" />
            <input type="text" data-dx-colorpicker-rgba-input data-dx-colorpicker-rgba-channel="b" />
            <input type="text" data-dx-colorpicker-rgba-input data-dx-colorpicker-rgba-channel="a" />
          </div>
          <div class="dx-colorpicker-palette" data-dx-colorpicker-palette></div>
          <button type="button" data-dx-colorpicker-ok></button>
        </div>
      </div>`);

  const rgbInput = (root, ch) => root.querySelector(`[data-dx-colorpicker-rgba-input][data-dx-colorpicker-rgba-channel="${ch}"]`);

  it("renders the default 22-swatch palette from data-dx-palette", () => {
    const root = colorpickerFixture('data-dx-value="#ff2800"');
    window.dxUikit.colorpicker.init(root);
    const swatches = root.querySelectorAll("[data-dx-colorpicker-swatch]");
    expect(swatches.length).toBe(22);
    expect(swatches[0].getAttribute("aria-label")).toBe("#ff2800");
    expect(swatches[0].style.backgroundColor).toBe("rgb(255, 40, 0)");
  });

  it("normalizes the initial value to rgb() and commits live without a button", () => {
    const root = colorpickerFixture('data-dx-value="#ff2800"');
    window.dxUikit.colorpicker.init(root);
    let detail = null;
    root.addEventListener("dx:change", (e) => (detail = e.detail.value));
    const swatch = root.querySelector('[data-dx-colorpicker-swatch-value="#0433ff"]');
    swatch.click();
    expect(detail).toBe("rgb(4, 51, 255)");
    expect(root.querySelector("[data-dx-colorpicker-value]").style.backgroundColor).toBe("rgb(4, 51, 255)");
  });

  it("stages edits with the OK button and reverts on Escape", () => {
    const root = colorpickerFixture('data-dx-value="#ff2800" data-dx-show-button');
    let detail = "sentinel";
    root.addEventListener("dx:change", (e) => (detail = e.detail.value));
    root.querySelector("[data-dx-colorpicker-trigger]").click();
    const swatch = root.querySelector('[data-dx-colorpicker-swatch-value="#00fdff"]');
    swatch.click();
    expect(detail).toBe("sentinel");
    root.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    expect(root.querySelector("[data-dx-colorpicker-popup]").hidden).toBe(true);
    expect(root.querySelector("[data-dx-colorpicker-value]").style.backgroundColor).toBe("rgb(255, 40, 0)");
  });

  it("commits the staged color on OK", () => {
    const root = colorpickerFixture('data-dx-value="#ff2800" data-dx-show-button');
    let detail = null;
    root.addEventListener("dx:change", (e) => (detail = e.detail.value));
    root.querySelector("[data-dx-colorpicker-trigger]").click();
    root.querySelector('[data-dx-colorpicker-swatch-value="#02f900"]').click();
    root.querySelector("[data-dx-colorpicker-ok]").click();
    expect(detail).toBe("rgb(2, 249, 0)");
    expect(root.querySelector("[data-dx-colorpicker-popup]").hidden).toBe(true);
  });

  it("adjusts hue with arrows and keeps inputs in sync", () => {
    const root = colorpickerFixture('data-dx-value="#ff2800"');
    window.dxUikit.colorpicker.init(root);
    const hue = root.querySelector("[data-dx-colorpicker-hue]");
    hue.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true, cancelable: true }));
    expect(rgbInput(root, "hex").value).not.toBe("#ff2800");
    expect(rgbInput(root, "a").value).toBe("100");
  });

  it("commits rgba with an alpha channel when alpha < 1", () => {
    const root = colorpickerFixture('data-dx-value="#ff2800"');
    window.dxUikit.colorpicker.init(root);
    let detail = null;
    root.addEventListener("dx:change", (e) => (detail = e.detail.value));
    const alpha = root.querySelector("[data-dx-colorpicker-alpha]");
    alpha.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true, cancelable: true }));
    alpha.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true, cancelable: true }));
    expect(detail).toMatch(/^rgba\(255, 40, 0, 0\.\d+\)$/);
  });

  it("parses a hex typed into the hex field", () => {
    const root = colorpickerFixture('data-dx-value="#ff2800"');
    window.dxUikit.colorpicker.init(root);
    const hex = rgbInput(root, "hex");
    hex.value = "#0433ff";
    hex.dispatchEvent(new Event("change", { bubbles: true }));
    expect(rgbInput(root, "r").value).toBe("4");
    expect(rgbInput(root, "b").value).toBe("255");
  });
});
