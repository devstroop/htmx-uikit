import { describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

describe("scheduler", () => {
  const schedulerFixture = (wrap = false) => {
    const markup = `
      <div class="dx-scheduler" data-dx-scheduler data-dx-view="week" role="group" aria-label="Scheduler">
        <div class="dx-scheduler-header">
          <button type="button" data-dx-scheduler-prev aria-label="Previous">&lsaquo;</button>
          <span class="dx-scheduler-title">Jan 15, 2024</span>
          <button type="button" data-dx-scheduler-next aria-label="Next">&rsaquo;</button>
        </div>
        <div class="dx-scheduler-grid" role="presentation">
          <div class="dx-scheduler-day" data-dx-scheduler-day tabindex="0">
            <div class="dx-scheduler-day-header">Mon Jan 15</div>
            <div class="dx-scheduler-slot" data-dx-scheduler-slot tabindex="-1"></div>
            <button type="button" data-dx-scheduler-event data-dx-id="1" aria-label="Meeting 10:00 - 11:00">Meeting</button>
          </div>
          <div class="dx-scheduler-day" data-dx-scheduler-day tabindex="0">
            <div class="dx-scheduler-day-header">Tue Jan 16</div>
            <div class="dx-scheduler-slot" data-dx-scheduler-slot tabindex="-1"></div>
          </div>
        </div>
      </div>`;
    const host = fixture(wrap ? `<div id="host">${markup}</div>` : markup);
    const root = wrap ? host.querySelector("[data-dx-scheduler]") : host;
    window.dxUikit.scheduler.init(root);
    return root;
  };

  it("marks the scheduler ready on init and is idempotent", () => {
    const root = schedulerFixture();
    expect(root._dxScheduler).toEqual({ ready: true });
    window.dxUikit.scheduler.init(root);
    expect(root._dxScheduler).toEqual({ ready: true });
  });

  it("fires dx:scheduler-date-change with dir -1 on previous", () => {
    const root = schedulerFixture();
    const listener = vi.fn();
    root.addEventListener("dx:scheduler-date-change", listener);
    root.querySelector("[data-dx-scheduler-prev]").click();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: { dir: -1 } }));
  });

  it("fires dx:scheduler-date-change with dir 1 on next", () => {
    const root = schedulerFixture();
    const listener = vi.fn();
    root.addEventListener("dx:scheduler-date-change", listener);
    root.querySelector("[data-dx-scheduler-next]").click();
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: { dir: 1 } }));
  });

  it("fires dx:scheduler-event-click with the event id", () => {
    const root = schedulerFixture();
    const listener = vi.fn();
    root.addEventListener("dx:scheduler-event-click", listener);
    root.querySelector("[data-dx-scheduler-event]").click();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: { id: "1" } }));
  });

  it("fires dx:scheduler-slot-click for empty slots", () => {
    const root = schedulerFixture();
    const listener = vi.fn();
    root.addEventListener("dx:scheduler-slot-click", listener);
    root.querySelectorAll("[data-dx-scheduler-slot]")[1].click();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: {} }));
  });

  it("does not fire a slot click when an event is clicked", () => {
    const root = schedulerFixture();
    const slots = vi.fn();
    const events = vi.fn();
    root.addEventListener("dx:scheduler-slot-click", slots);
    root.addEventListener("dx:scheduler-event-click", events);
    root.querySelector("[data-dx-scheduler-event]").click();
    expect(events).toHaveBeenCalledTimes(1);
    expect(slots).not.toHaveBeenCalled();
  });

  it("bubbles an event click to listeners above the scheduler root", () => {
    const root = schedulerFixture(true);
    const listener = vi.fn();
    root.parentElement.addEventListener("dx:scheduler-event-click", listener);
    root.querySelector("[data-dx-scheduler-event]").click();
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: { id: "1" } }));
  });
});
