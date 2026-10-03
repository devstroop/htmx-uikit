import { beforeEach, describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

describe("htmx:afterSettle re-init", () => {
  const settle = () => document.dispatchEvent(new Event("htmx:afterSettle"));

  it("keeps the pivot chip delegation registered exactly once regardless of settle count", () => {
    const root = fixture(`
      <div data-dx-pivot>
        <button data-dx-pivot-chip data-dx-zone="rows" data-dx-property="name">name</button>
      </div>`);
    let fired = 0;
    root.addEventListener("dx:pivot-field-remove", () => {
      fired += 1;
    });
    settle();
    settle();
    settle();
    root.querySelector("[data-dx-pivot-chip]").click();
    expect(fired).toBe(1);
  });

  it("marks a pivot swapped in by htmx as ready without clobbering an existing marker", () => {
    const root = fixture(`<div data-dx-pivot><span>fields</span></div>`);
    expect(root._dxPivot).toBeUndefined();
    settle();
    expect(root._dxPivot).toEqual({ ready: true });
    root._dxPivot.custom = true;
    settle();
    expect(root._dxPivot).toEqual({ ready: true, custom: true });
  });

  it("initializes a signaturepad swapped in by htmx", () => {
    const root = fixture(`
      <div data-dx-signaturepad>
        <canvas data-dx-signaturepad-canvas></canvas>
      </div>`);
    const canvas = root.querySelector("[data-dx-signaturepad-canvas]");
    canvas.getContext = vi.fn(() => ({
      setTransform: vi.fn(),
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
    }));
    canvas.getBoundingClientRect = vi.fn(() => ({ left: 0, top: 0, width: 300, height: 140 }));
    canvas.toDataURL = vi.fn(() => "data:,");
    expect(canvas.dataset.dxReady).toBeUndefined();
    settle();
    expect(canvas.dataset.dxReady).toBe("true");
  });

  it("labels security code cells of a component swapped in by htmx", () => {
    const root = fixture(`
      <div data-dx-securitycode role="group" aria-label="Security code">
        <input data-dx-securitycode-cell /><input data-dx-securitycode-cell />
      </div>`);
    settle();
    const cells = root.querySelectorAll("[data-dx-securitycode-cell]");
    expect(cells[0].getAttribute("aria-label")).toBe("Digit 1 of 2");
    expect(cells[1].getAttribute("aria-label")).toBe("Digit 2 of 2");
  });
});
