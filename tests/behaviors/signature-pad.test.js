import { beforeEach, describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

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
    const canvas = root.querySelector("[data-dx-signaturepad-canvas]");
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
      <div class="dx-signaturepad" data-dx-signaturepad ${attrs}>
        <div class="dx-signaturepad-header">
          <span class="dx-signaturepad-label">Signature</span>
          <button class="dx-signaturepad-clear" type="button" data-dx-signaturepad-clear>Clear</button>
        </div>
        <canvas class="dx-signaturepad-canvas" role="img" aria-label="Signature" data-dx-signaturepad-canvas></canvas>
      </div>`);
  }

  it("renders a labeled canvas and a clear button", () => {
    const root = padFixture();
    fixtureCanvas(root);
    window.dxUikit.signaturepad.init(root);
    const canvas = root.querySelector("[data-dx-signaturepad-canvas]");
    expect(canvas.getAttribute("role")).toBe("img");
    expect(canvas.getAttribute("aria-label")).toBe("Signature");
    expect(root.querySelector("[data-dx-signaturepad-clear]")).not.toBeNull();
  });

  it("draws on pointermove and fires dx:signature-change with a data URL on pointerup", () => {
    const root = padFixture();
    const { canvas } = fixtureCanvas(root);
    window.dxUikit.signaturepad.init(root);
    let detail = null;
    root.addEventListener("dx:signature-change", (e) => (detail = e.detail.value));
    canvas.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 1, clientX: 10, clientY: 10 }));
    canvas.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, pointerId: 1, clientX: 50, clientY: 40 }));
    expect(canvas.getContext("2d").moveTo).toHaveBeenCalled();
    canvas.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 1, clientX: 50, clientY: 40 }));
    expect(detail).toBe("data:image/png;base64,abc");
  });

  it("does not fire on an empty tap", () => {
    const root = padFixture();
    const { canvas } = fixtureCanvas(root);
    window.dxUikit.signaturepad.init(root);
    let fired = false;
    root.addEventListener("dx:signature-change", () => (fired = true));
    canvas.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 1, clientX: 10, clientY: 10 }));
    canvas.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 1, clientX: 10, clientY: 10 }));
    expect(fired).toBe(false);
  });

  it("clears the canvas and fires dx:signature-change with an empty string", () => {
    const root = padFixture();
    const { canvas, ctx } = fixtureCanvas(root);
    window.dxUikit.signaturepad.init(root);
    let detail = "x";
    root.addEventListener("dx:signature-change", (e) => (detail = e.detail.value));
    root.querySelector("[data-dx-signaturepad-clear]").click();
    expect(ctx.clearRect).toHaveBeenCalled();
    expect(detail).toBe("");
  });

  it("blocks drawing when disabled", () => {
    const root = padFixture("data-dx-disabled");
    const { canvas } = fixtureCanvas(root);
    window.dxUikit.signaturepad.init(root);
    let fired = false;
    root.addEventListener("dx:signature-change", () => (fired = true));
    canvas.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 1, clientX: 10, clientY: 10 }));
    canvas.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, pointerId: 1, clientX: 50, clientY: 40 }));
    canvas.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 1, clientX: 50, clientY: 40 }));
    expect(fired).toBe(false);
    expect(root.querySelector("[data-dx-signaturepad-clear]").disabled).toBe(true);
  });
});
