import { beforeEach, describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

describe("datepicker", () => {
  const datepickerFixture = (attrs = "", value = "") =>
    fixture(`
      <div class="dx-datepicker" data-dx-datepicker ${attrs}>
        <input type="text" data-dx-datepicker-input value="${value}" />
        <button type="button" data-dx-datepicker-trigger aria-expanded="false" aria-controls="dp-popup"></button>
        <button type="button" data-dx-datepicker-clear hidden></button>
        <div class="dx-datepicker-popup" data-dx-datepicker-popup hidden>
          <div class="dx-datepicker-header">
            <button type="button" data-dx-datepicker-prev></button>
            <div data-dx-datepicker-title></div>
            <button type="button" data-dx-datepicker-next></button>
          </div>
          <div data-dx-datepicker-weekdays></div>
          <div class="dx-datepicker-grid" data-dx-datepicker-grid></div>
        </div>
      </div>`);

  it("renders a 42-cell grid with a roving focus cell", () => {
    const root = datepickerFixture('data-dx-format="yyyy-MM-dd" data-dx-value="2026-08-20"');
    root.querySelector("[data-dx-datepicker-trigger]").click();
    const grid = root.querySelector("[data-dx-datepicker-grid]");
    expect(grid.children.length).toBe(42);
    const focused = grid.querySelector('[tabindex="0"]');
    expect(focused).not.toBeNull();
    expect(focused.getAttribute("data-dx-date-value")).toBe("2026-08-20");
    expect(focused.getAttribute("aria-selected")).toBe("true");
  });

  it("highlights today when the grid opens on the current month", () => {
    const root = datepickerFixture('data-dx-format="yyyy-MM-dd"');
    root.querySelector("[data-dx-datepicker-trigger]").click();
    const grid = root.querySelector("[data-dx-datepicker-grid]");
    const today = new Date();
    const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const cell = grid.querySelector(`[data-dx-date-value="${todayISO}"]`);
    expect(cell).not.toBeNull();
    expect(cell.classList.contains("dx-datepicker-day--today")).toBe(true);
  });

  it("opens on trigger click and closes on Escape, refocusing the input", () => {
    const root = datepickerFixture('data-dx-format="yyyy-MM-dd"', "2026-08-20");
    const input = root.querySelector("[data-dx-datepicker-input]");
    const trigger = root.querySelector("[data-dx-datepicker-trigger]");
    const popup = root.querySelector("[data-dx-datepicker-popup]");
    trigger.click();
    expect(popup.hidden).toBe(false);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    root.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    expect(popup.hidden).toBe(true);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(input);
  });

  it("navigates days with arrow keys and selects on Enter", () => {
    const root = datepickerFixture('data-dx-format="yyyy-MM-dd" data-dx-value="2026-08-20"');
    const input = root.querySelector("[data-dx-datepicker-input]");
    const grid = root.querySelector("[data-dx-datepicker-grid]");
    root.querySelector("[data-dx-datepicker-trigger]").click();
    grid.querySelector('[tabindex="0"]').dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true, cancelable: true }));
    expect(grid.querySelector('[tabindex="0"]').getAttribute("data-dx-date-value")).toBe("2026-08-19");
    grid.querySelector('[tabindex="0"]').dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
    expect(input.value).toBe("2026-08-19");
  });

  it("navigates months with PageUp/PageDown", () => {
    const root = datepickerFixture('data-dx-format="yyyy-MM-dd" data-dx-value="2026-08-20"');
    const grid = root.querySelector("[data-dx-datepicker-grid]");
    root.querySelector("[data-dx-datepicker-trigger]").click();
    grid.querySelector('[tabindex="0"]').dispatchEvent(new KeyboardEvent("keydown", { key: "PageUp", bubbles: true, cancelable: true }));
    expect(root.querySelector("[data-dx-datepicker-title]").textContent).toMatch(/September 2026/);
    grid.querySelector('[tabindex="0"]').dispatchEvent(new KeyboardEvent("keydown", { key: "PageDown", shiftKey: true, bubbles: true, cancelable: true }));
    expect(root.querySelector("[data-dx-datepicker-title]").textContent).toMatch(/September 2025/);
  });

  it("disables cells outside min/max bounds", () => {
    const root = datepickerFixture('data-dx-format="yyyy-MM-dd" data-dx-min="2026-08-10" data-dx-max="2026-08-20" data-dx-value="2026-08-15"');
    const grid = root.querySelector("[data-dx-datepicker-grid]");
    root.querySelector("[data-dx-datepicker-trigger]").click();
    expect(grid.querySelector('[data-dx-date-value="2026-08-09"]').getAttribute("aria-disabled")).toBe("true");
    expect(grid.querySelector('[data-dx-date-value="2026-08-21"]').getAttribute("aria-disabled")).toBe("true");
    expect(grid.querySelector('[data-dx-date-value="2026-08-15"]').hasAttribute("aria-disabled")).toBe(false);
  });

  it("parses typing on Enter and fires dx:change with the ISO value", () => {
    const root = datepickerFixture('data-dx-format="yyyy-MM-dd"');
    const input = root.querySelector("[data-dx-datepicker-input]");
    let detail = null;
    root.addEventListener("dx:change", (e) => (detail = e.detail.value));
    input.value = "2026-12-31";
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
    expect(detail).toBe("2026-12-31");
    expect(input.classList.contains("dx-datepicker-input--invalid")).toBe(false);
  });

  it("fires dx:invalid for unparseable input", () => {
    const root = datepickerFixture('data-dx-format="yyyy-MM-dd"');
    const input = root.querySelector("[data-dx-datepicker-input]");
    let invalid = null;
    root.addEventListener("dx:invalid", (e) => (invalid = e.detail.value));
    input.value = "not-a-date";
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
    expect(invalid).toBe("not-a-date");
    expect(input.getAttribute("aria-invalid")).toBe("true");
  });

  it("formats with custom tokens and shows time steppers with OK", () => {
    const root = fixture(`
      <div class="dx-datepicker" data-dx-datepicker data-dx-format="dd.MM.yyyy" data-dx-show-time data-dx-value="2026-08-20">
        <input type="text" data-dx-datepicker-input value="20.08.2026" />
        <button type="button" data-dx-datepicker-trigger></button>
        <div class="dx-datepicker-popup" data-dx-datepicker-popup hidden>
          <div class="dx-datepicker-grid" data-dx-datepicker-grid></div>
          <div class="dx-datepicker-time" data-dx-datepicker-time hidden>
            <input type="text" data-dx-datepicker-time-field="hours" />
            <input type="text" data-dx-datepicker-time-field="minutes" />
            <input type="text" data-dx-datepicker-time-field="seconds" />
          </div>
          <div class="dx-datepicker-footer" data-dx-datepicker-footer hidden>
            <button type="button" data-dx-datepicker-ok></button>
          </div>
        </div>
      </div>`);
    const grid = root.querySelector("[data-dx-datepicker-grid]");
    root.querySelector("[data-dx-datepicker-trigger]").click();
    grid.querySelector('[data-dx-date-value="2026-08-20"]').dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }),
    );
    expect(root.querySelector('[data-dx-datepicker-time-field="hours"]').value).toBe("00");
    const hours = root.querySelector('[data-dx-datepicker-time-field="hours"]');
    hours.value = "14";
    hours.dispatchEvent(new Event("change", { bubbles: true }));
    root.querySelector("[data-dx-datepicker-ok]").click();
    expect(root.querySelector("[data-dx-datepicker-input]").value).toBe("20.08.2026");
  });

  it("clears the value and fires dx:change with null", () => {
    const root = datepickerFixture('data-dx-format="yyyy-MM-dd"', "2026-08-20");
    const clear = root.querySelector("[data-dx-datepicker-clear]");
    let detail = "sentinel";
    root.addEventListener("dx:change", (e) => (detail = e.detail.value));
    clear.click();
    expect(detail).toBe(null);
    expect(root.querySelector("[data-dx-datepicker-input]").value).toBe("");
  });
});
