import { beforeEach, describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

describe("timespanpicker", () => {
  const timespanFixture = (attrs = "", value = "") =>
    fixture(`
      <div class="dx-timespanpicker" data-dx-timespanpicker ${attrs}>
        <input type="text" data-dx-timespanpicker-input value="${value}" />
        <button type="button" data-dx-timespanpicker-trigger></button>
        <div class="dx-timespanpicker-popup" data-dx-timespanpicker-popup hidden>
          <div class="dx-timespanpicker-units">
            <div class="dx-timespanpicker-unit">
              <button type="button" data-dx-timespanpicker-step data-dx-timespanpicker-step-unit="days" data-dx-timespanpicker-step-dir="1"></button>
              <input type="text" data-dx-timespanpicker-value data-dx-unit="days" />
              <button type="button" data-dx-timespanpicker-step data-dx-timespanpicker-step-unit="days" data-dx-timespanpicker-step-dir="-1"></button>
            </div>
            <div class="dx-timespanpicker-unit">
              <button type="button" data-dx-timespanpicker-step data-dx-timespanpicker-step-unit="hours" data-dx-timespanpicker-step-dir="1"></button>
              <input type="text" data-dx-timespanpicker-value data-dx-unit="hours" />
              <button type="button" data-dx-timespanpicker-step data-dx-timespanpicker-step-unit="hours" data-dx-timespanpicker-step-dir="-1"></button>
            </div>
            <div class="dx-timespanpicker-unit">
              <button type="button" data-dx-timespanpicker-step data-dx-timespanpicker-step-unit="minutes" data-dx-timespanpicker-step-dir="1"></button>
              <input type="text" data-dx-timespanpicker-value data-dx-unit="minutes" />
              <button type="button" data-dx-timespanpicker-step data-dx-timespanpicker-step-unit="minutes" data-dx-timespanpicker-step-dir="-1"></button>
            </div>
            <div class="dx-timespanpicker-unit">
              <button type="button" data-dx-timespanpicker-step data-dx-timespanpicker-step-unit="seconds" data-dx-timespanpicker-step-dir="1"></button>
              <input type="text" data-dx-timespanpicker-value data-dx-unit="seconds" />
              <button type="button" data-dx-timespanpicker-step data-dx-timespanpicker-step-unit="seconds" data-dx-timespanpicker-step-dir="-1"></button>
            </div>
          </div>
          <div class="dx-timespanpicker-footer" data-dx-timespanpicker-footer>
            <button type="button" data-dx-timespanpicker-ok></button>
          </div>
        </div>
      </div>`);

  const unit = (root, name) => root.querySelector(`[data-dx-timespanpicker-value][data-dx-unit="${name}"]`);

  it("stages unit edits and commits on OK with the ISO duration", () => {
    const root = timespanFixture('data-dx-format="d.HH:mm:ss"', "1.02:30:00");
    const input = root.querySelector("[data-dx-timespanpicker-input]");
    let detail = null;
    root.addEventListener("dx:change", (e) => (detail = e.detail.value));
    root.querySelector("[data-dx-timespanpicker-trigger]").click();
    expect(unit(root, "days").value).toBe("1");
    expect(unit(root, "hours").value).toBe("2");
    expect(unit(root, "minutes").value).toBe("30");
    unit(root, "minutes").value = "45";
    root.querySelector("[data-dx-timespanpicker-ok]").click();
    expect(input.value).toBe("1.02:45:00");
    expect(detail).toBe("P1DT2H45M");
  });

  it("reverts staged edits when closed without confirming", () => {
    const root = timespanFixture('data-dx-format="d.HH:mm:ss"', "1.02:30:00");
    root.querySelector("[data-dx-timespanpicker-trigger]").click();
    unit(root, "hours").value = "9";
    root.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    expect(root.querySelector("[data-dx-timespanpicker-popup]").hidden).toBe(true);
    root.querySelector("[data-dx-timespanpicker-trigger]").click();
    expect(unit(root, "hours").value).toBe("2");
  });

  it("clamps units to per-unit maxima and min/max bounds", () => {
    const root = timespanFixture('data-dx-format="d.HH:mm:ss" data-dx-min="PT30M" data-dx-max="PT12H"');
    root.querySelector("[data-dx-timespanpicker-trigger]").click();
    const hours = unit(root, "hours");
    hours.value = "9";
    hours.dispatchEvent(new Event("change", { bubbles: true }));
    expect(hours.value).toBe("9");
    hours.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true, cancelable: true }));
    expect(hours.value).toBe("0");
    hours.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true, cancelable: true }));
    expect(hours.value).toBe("12");
  });

  it("steps units with the chevron buttons", () => {
    const root = timespanFixture('data-dx-format="d.HH:mm:ss"', "0.00:00:00");
    root.querySelector("[data-dx-timespanpicker-trigger]").click();
    root.querySelector('[data-dx-timespanpicker-step][data-dx-timespanpicker-step-unit="seconds"][data-dx-timespanpicker-step-dir="1"]').click();
    expect(unit(root, "seconds").value).toBe("1");
  });

  it("parses typed input and fires dx:invalid on garbage", () => {
    const root = timespanFixture('data-dx-format="HH:mm:ss"');
    const input = root.querySelector("[data-dx-timespanpicker-input]");
    let detail = null;
    root.addEventListener("dx:change", (e) => (detail = e.detail.value));
    input.value = "12:30:00";
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
    expect(detail).toBe("PT12H30M");
    input.value = "99:99:99";
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
    expect(input.getAttribute("aria-invalid")).toBe("true");
  });

  it("rounds to data-dx-precision on commit", () => {
    const root = timespanFixture('data-dx-format="HH:mm:ss" data-dx-precision="minute"');
    root.querySelector("[data-dx-timespanpicker-trigger]").click();
    unit(root, "hours").value = "1";
    unit(root, "minutes").value = "2";
    unit(root, "seconds").value = "45";
    root.querySelector("[data-dx-timespanpicker-ok]").click();
    expect(root.querySelector("[data-dx-timespanpicker-input]").value).toBe("01:03:00");
  });
});
