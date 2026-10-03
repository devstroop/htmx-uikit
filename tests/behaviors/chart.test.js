import { describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

describe("chart", () => {
  const click = (el) => el.dispatchEvent(new MouseEvent("click", { bubbles: true }));

  const chartFixture = () => fixture(`
    <div class="dx-chart" data-dx-chart data-dx-width="600" data-dx-height="400"
         data-dx-series='[{"type":"column","title":"Sales","data":[{"month":"Jan","value":10},{"month":"Feb","value":20}],"categoryProperty":"month","valueProperty":"value"}]'
         aria-label="Demo chart" role="img">
      <figure role="img" aria-label="Demo chart">
        <svg width="600" height="400" data-dx-chart-svg>
          <rect data-dx-chart-click data-dx-series-title="Sales" data-dx-category="Jan" data-dx-value="10" x="100" y="200" width="40" height="80"></rect>
          <rect data-dx-chart-click data-dx-series-title="Sales" data-dx-category="Feb" data-dx-value="20" x="160" y="150" width="40" height="130"></rect>
        </svg>
        <div class="dx-chart-tooltip" data-dx-chart-tooltip hidden>Sales: 10</div>
        <table class="dx-chart-a11y-table">
          <caption>Demo chart</caption>
          <thead><tr><th>Series</th><th>Category</th><th>Value</th></tr></thead>
          <tbody><tr><td>Sales</td><td>Jan</td><td>10</td></tr></tbody>
        </table>
      </figure>
    </div>`);

  it("marks the chart ready on init and is idempotent", () => {
    const root = chartFixture();
    window.dxUikit.chart.init(root);
    expect(root._dxChart).toEqual({ ready: true });
    window.dxUikit.chart.init(root);
    expect(root._dxChart).toEqual({ ready: true });
  });

  it("parses a valid data-dx-series JSON attribute on init", () => {
    const root = chartFixture();
    expect(() => window.dxUikit.chart.init(root)).not.toThrow();
    expect(root._dxChart.ready).toBe(true);
  });

  it("tolerates invalid data-dx-series JSON without throwing", () => {
    const root = fixture('<div data-dx-chart data-dx-series="{not json"></div>');
    expect(() => window.dxUikit.chart.init(root)).not.toThrow();
    expect(root._dxChart.ready).toBe(true);
  });

  it("dispatches dx:chart-point-click with series, category and numeric value", () => {
    const root = chartFixture();
    const listener = vi.fn();
    root.addEventListener("dx:chart-point-click", listener);
    click(root.querySelector("[data-dx-chart-svg] rect"));
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { seriesTitle: "Sales", category: "Jan", value: 10 } })
    );
  });

  it("dispatches the value as a number for the second point", () => {
    const root = chartFixture();
    const listener = vi.fn();
    root.addEventListener("dx:chart-point-click", listener);
    click(root.querySelectorAll("[data-dx-chart-click]")[1]);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { seriesTitle: "Sales", category: "Feb", value: 20 } })
    );
  });

  it("defaults missing point attributes to empty series/category and value 0", () => {
    const root = fixture(`
      <div data-dx-chart>
        <svg><rect data-dx-chart-click></rect></svg>
      </div>`);
    const listener = vi.fn();
    root.addEventListener("dx:chart-point-click", listener);
    click(root.querySelector("rect"));
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { seriesTitle: "", category: "", value: 0 } })
    );
  });

  it("does not dispatch for a hit area outside a chart root", () => {
    const root = fixture(`
      <div>
        <svg><rect data-dx-chart-click data-dx-category="Jan" data-dx-value="1"></rect></svg>
      </div>`);
    const listener = vi.fn();
    root.addEventListener("dx:chart-point-click", listener);
    click(root.querySelector("rect"));
    expect(listener).not.toHaveBeenCalled();
  });

  it("keeps the server-rendered figure markup intact after init", () => {
    const root = chartFixture();
    window.dxUikit.chart.init(root);
    expect(root.querySelector("figure").getAttribute("role")).toBe("img");
    expect(root.querySelector(".dx-chart-a11y-table caption").textContent).toBe("Demo chart");
    expect(root.querySelectorAll("[data-dx-chart-click]")).toHaveLength(2);
  });
});
