import { describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

describe("pivot", () => {
  const pivotFixture = () => fixture(`
    <div class="dx-pivot" data-dx-pivot>
      <div class="dx-pivot-fields" data-dx-pivot-fields>
        <button type="button" class="dx-pivot-chip" data-dx-pivot-chip data-dx-zone="row" data-dx-property="region" aria-label="Remove row field Region">Region</button>
        <button type="button" class="dx-pivot-chip" data-dx-pivot-chip data-dx-zone="col" data-dx-property="product" aria-label="Remove col field Product">Product</button>
        <button type="button" class="dx-pivot-chip" data-dx-pivot-chip data-dx-zone="agg" data-dx-property="amount" aria-label="Remove agg field amount (Sum)">amount (Sum)</button>
      </div>
      <table class="dx-pivot-table" role="grid" aria-label="Pivot table">
        <thead>
          <tr><th scope="col">Region</th><th scope="col">A</th><th scope="col">B</th><th scope="col">Total</th></tr>
        </thead>
        <tbody>
          <tr><th scope="row">East</th><td>10</td><td>20</td><td>30</td></tr>
          <tr class="dx-pivot-total-row"><th scope="row">Total</th><td>10</td><td>20</td><td>30</td></tr>
        </tbody>
      </table>
    </div>`);

  it("dispatches dx:pivot-field-remove with the chip zone and property", () => {
    const root = pivotFixture();
    const listener = vi.fn();
    root.addEventListener("dx:pivot-field-remove", listener);
    root.querySelector('[data-dx-property="region"]').click();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { zone: "row", property: "region" } })
    );
  });

  it("reports the zone of each chip type", () => {
    const root = pivotFixture();
    const listener = vi.fn();
    root.addEventListener("dx:pivot-field-remove", listener);
    root.querySelector('[data-dx-zone="col"]').click();
    root.querySelector('[data-dx-zone="agg"]').click();
    expect(listener.mock.calls.map((call) => call[0].detail)).toEqual([
      { zone: "col", property: "product" },
      { zone: "agg", property: "amount" },
    ]);
  });

  it("bubbles the removal event from a chip to an ancestor listener", () => {
    const outer = fixture(`<section><div data-dx-pivot>
      <button type="button" data-dx-pivot-chip data-dx-zone="row" data-dx-property="city">City</button>
    </div></section>`);
    const root = outer.querySelector("[data-dx-pivot]");
    const listener = vi.fn();
    outer.addEventListener("dx:pivot-field-remove", listener);
    root.querySelector("[data-dx-pivot-chip]").click();
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { zone: "row", property: "city" } })
    );
  });

  it("leaves chip removal to the server swap: the chip stays in the DOM", () => {
    const root = pivotFixture();
    const chip = root.querySelector('[data-dx-property="region"]');
    chip.click();
    expect(root.querySelectorAll("[data-dx-pivot-chip]")).toHaveLength(3);
    expect(chip.isConnected).toBe(true);
  });

  it("keeps the grid and chip a11y contract from the markup", () => {
    const root = pivotFixture();
    const table = root.querySelector("table");
    expect(table.getAttribute("role")).toBe("grid");
    expect(table.getAttribute("aria-label")).toBe("Pivot table");
    expect(table.querySelectorAll('th[scope="col"]')).toHaveLength(4);
    root.querySelectorAll("[data-dx-pivot-chip]").forEach((chip) => {
      expect(chip.tagName).toBe("BUTTON");
      expect(chip.getAttribute("aria-label")).toMatch(/^Remove/);
    });
  });
});
