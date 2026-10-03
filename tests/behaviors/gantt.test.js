import { describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

describe("gantt", () => {
  const ganttFixture = () => {
    const root = fixture(`
      <div class="dx-gantt" data-dx-gantt role="grid" aria-label="Gantt" aria-rowcount="2">
        <div class="dx-gantt-header" role="row">
          <div class="dx-gantt-header-cell" role="columnheader">Task</div>
          <div class="dx-gantt-header-cell" role="columnheader">Timeline</div>
        </div>
        <div class="dx-gantt-row" role="row" data-dx-gantt-row aria-selected="false">
          <div class="dx-gantt-cell" role="gridcell">Task 1</div>
          <div class="dx-gantt-cell" role="gridcell">
            <div class="dx-gantt-bar" role="button" data-dx-gantt-bar data-dx-id="1" aria-label="Task 1 2024-01-01 - 2024-01-05" aria-pressed="false" tabindex="0">
              <div class="dx-gantt-progress" style="width:50%"></div>
            </div>
          </div>
        </div>
        <div class="dx-gantt-row" role="row" data-dx-gantt-row aria-selected="false">
          <div class="dx-gantt-cell" role="gridcell">Task 2</div>
          <div class="dx-gantt-cell" role="gridcell">
            <div class="dx-gantt-bar" role="button" data-dx-gantt-bar data-dx-id="2" aria-label="Task 2 2024-01-06 - 2024-01-10" aria-pressed="false" tabindex="0">
              <div class="dx-gantt-progress" style="width:0%"></div>
            </div>
          </div>
        </div>
      </div>`);
    window.dxUikit.gantt.init(root);
    return root;
  };

  it("marks the gantt ready on init and is idempotent", () => {
    const root = ganttFixture();
    expect(root._dxGantt).toEqual({ ready: true });
    window.dxUikit.gantt.init(root);
    expect(root._dxGantt).toEqual({ ready: true });
  });

  it("fires dx:gantt-task-click with the task id", () => {
    const root = ganttFixture();
    const listener = vi.fn();
    root.addEventListener("dx:gantt-task-click", listener);
    root.querySelector("[data-dx-gantt-bar]").click();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: { id: "1" } }));
  });

  it("reports the id of the clicked task bar", () => {
    const root = ganttFixture();
    const listener = vi.fn();
    root.addEventListener("dx:gantt-task-click", listener);
    root.querySelectorAll("[data-dx-gantt-bar]")[1].click();
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: { id: "2" } }));
  });

  it("does not fire a task click for clicks outside a task bar", () => {
    const root = ganttFixture();
    const listener = vi.fn();
    root.addEventListener("dx:gantt-task-click", listener);
    root.querySelector("[data-dx-gantt-row]").click();
    expect(listener).not.toHaveBeenCalled();
  });

  it("keeps the row and bar a11y contract from the markup", () => {
    const root = ganttFixture();
    expect(root.getAttribute("role")).toBe("grid");
    expect(root.getAttribute("aria-rowcount")).toBe("2");
    const rows = root.querySelectorAll("[data-dx-gantt-row]");
    expect(rows).toHaveLength(2);
    expect(rows[0].getAttribute("role")).toBe("row");
    expect(rows[0].getAttribute("aria-selected")).toBe("false");
    const bar = root.querySelector("[data-dx-gantt-bar]");
    expect(bar.getAttribute("role")).toBe("button");
    expect(bar.getAttribute("aria-label")).toContain("Task 1");
    expect(bar.getAttribute("tabindex")).toBe("0");
  });
});
