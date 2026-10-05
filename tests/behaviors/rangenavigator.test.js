import { describe, expect, it } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

function navFixture(attrs = 'data-dx-range-navigator="0 100" data-dx-range-start="20" data-dx-range-end="80"') {
  return fixture(`
    <div class="dx-range-navigator" ${attrs} role="group" aria-label="Range navigator">
      <div class="dx-range-track" data-dx-range-track>
        <div class="dx-range-window" data-dx-range-window></div>
        <div class="dx-range-handle" data-dx-range-handle="start" role="slider" tabindex="0" aria-label="Window start" aria-valuemin="0" aria-valuemax="100" aria-valuenow="20"></div>
        <div class="dx-range-handle" data-dx-range-handle="end" role="slider" tabindex="0" aria-label="Window end" aria-valuemin="0" aria-valuemax="100" aria-valuenow="80"></div>
      </div>
    </div>`);
}

function handles(root) {
  return {
    start: root.querySelector('[data-dx-range-handle="start"]'),
    end: root.querySelector('[data-dx-range-handle="end"]'),
  };
}

describe("range navigator", () => {
  it("seeds from attributes and paints the window", () => {
    const root = navFixture();
    window.dxUikit.rangeNav.init(root);
    expect(root.getAttribute("data-dx-range-start")).toBe("20");
    expect(root.getAttribute("data-dx-range-end")).toBe("80");
    const win = root.querySelector("[data-dx-range-window]");
    expect(win.style.left).toBe("20%");
    expect(win.style.width).toBe("60%");
  });

  it("defaults to the full domain without seed attributes", () => {
    const root = navFixture('data-dx-range-navigator="0 100"');
    root.removeAttribute("data-dx-range-start");
    root.removeAttribute("data-dx-range-end");
    window.dxUikit.rangeNav.init(root);
    expect(root.getAttribute("data-dx-range-start")).toBe("0");
    expect(root.getAttribute("data-dx-range-end")).toBe("100");
  });

  it("arrow keys move the focused handle and fire dx:range-change", () => {
    const root = navFixture();
    window.dxUikit.rangeNav.init(root);
    const seen = [];
    root.addEventListener("dx:range-change", (e) => seen.push(e.detail));
    const { start } = handles(root);
    start.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true })
    );
    expect(root.getAttribute("data-dx-range-start")).toBe("21");
    expect(seen.at(-1)).toEqual({ start: 21, end: 80 });
  });

  it("clamps the window to the domain", () => {
    const root = navFixture();
    window.dxUikit.rangeNav.init(root);
    const { end } = handles(root);
    for (let i = 0; i < 30; i++) {
      end.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true })
      );
    }
    expect(Number(root.getAttribute("data-dx-range-end"))).toBeLessThanOrEqual(100);
    expect(Number(root.getAttribute("data-dx-range-start"))).toBeLessThanOrEqual(
      Number(root.getAttribute("data-dx-range-end"))
    );
  });

  it("dxRangeNav.commit writes and notifies", () => {
    const root = navFixture();
    const seen = [];
    root.addEventListener("dx:range-change", (e) => seen.push(e.detail));
    window.dxRangeNav.commit(root, 10, 90);
    expect(root.getAttribute("data-dx-range-start")).toBe("10");
    expect(seen).toEqual([{ start: 10, end: 90 }]);
    expect(window.dxRangeNav.commit("#missing", 1, 2)).toBeNull();
  });
});
