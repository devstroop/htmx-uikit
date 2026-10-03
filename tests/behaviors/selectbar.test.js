import { describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

describe("selectbar", () => {
  const selectbarFixture = (extra = "") =>
    fixture(`
      <div role="group" class="dx-selectbar dx-selectbar--md" aria-label="Alignment" data-dx-selectbar ${extra}>
        <button type="button" class="dx-selectbar__option dx-selectbar__option--selected"
          aria-pressed="true" data-dx-selectbar-option data-dx-selectbar-value="left">Left</button>
        <button type="button" class="dx-selectbar__option" aria-pressed="false"
          data-dx-selectbar-option data-dx-selectbar-value="center">Center</button>
        <button type="button" class="dx-selectbar__option" aria-pressed="false"
          data-dx-selectbar-option data-dx-selectbar-value="right">Right</button>
      </div>`);

  const pressed = (root) =>
    [...root.querySelectorAll("[data-dx-selectbar-option]")]
      .filter((b) => b.getAttribute("aria-pressed") === "true")
      .map((b) => b.getAttribute("data-dx-selectbar-value"));

  it("renders a group with an accessible name", () => {
    const root = selectbarFixture();
    expect(root.getAttribute("role")).toBe("group");
    expect(root.getAttribute("aria-label")).toBe("Alignment");
  });

  it("renders one button per option with its label", () => {
    const root = selectbarFixture();
    const buttons = [...root.querySelectorAll("[data-dx-selectbar-option]")];
    expect(buttons).toHaveLength(3);
    expect(buttons.map((b) => b.textContent.trim())).toEqual(["Left", "Center", "Right"]);
    expect(buttons.map((b) => b.getAttribute("data-dx-selectbar-value"))).toEqual([
      "left",
      "center",
      "right",
    ]);
    expect(buttons.every((b) => b.tagName === "BUTTON" && b.getAttribute("type") === "button")).toBe(true);
  });

  it("presses the first option by default", () => {
    const root = selectbarFixture();
    expect(pressed(root)).toEqual(["left"]);
    expect(root.querySelector('[data-dx-selectbar-value="left"]').classList.contains(
      "dx-selectbar__option--selected",
    )).toBe(true);
    expect(root.querySelectorAll('[aria-pressed="true"]')).toHaveLength(1);
  });

  it("selects on click, clears the others and fires dx:selectbar-change", () => {
    const root = selectbarFixture();
    const listener = vi.fn();
    root.addEventListener("dx:selectbar-change", listener);
    root.querySelector('[data-dx-selectbar-value="right"]').click();
    expect(pressed(root)).toEqual(["right"]);
    expect(root.querySelector('[data-dx-selectbar-value="right"]').classList.contains(
      "dx-selectbar__option--selected",
    )).toBe(true);
    expect(root.querySelector('[data-dx-selectbar-value="left"]').classList.contains(
      "dx-selectbar__option--selected",
    )).toBe(false);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: { value: "right" } }));
  });

  it("keeps every option tabbable so Tab walks the bar", () => {
    const root = selectbarFixture();
    const buttons = [...root.querySelectorAll("[data-dx-selectbar-option]")];
    expect(buttons.every((b) => b.tabIndex === 0)).toBe(true);
  });

  it("does not select a disabled option", () => {
    const root = fixture(`
      <div role="group" class="dx-selectbar dx-selectbar--md" aria-label="Density" data-dx-selectbar>
        <button type="button" class="dx-selectbar__option dx-selectbar__option--selected"
          aria-pressed="true" data-dx-selectbar-option data-dx-selectbar-value="compact">Compact</button>
        <button type="button" class="dx-selectbar__option" aria-pressed="false" disabled
          data-dx-selectbar-option data-dx-selectbar-value="comfortable">Comfortable</button>
        <button type="button" class="dx-selectbar__option" aria-pressed="false"
          data-dx-selectbar-option data-dx-selectbar-value="spacious">Spacious</button>
      </div>`);
    const listener = vi.fn();
    root.addEventListener("dx:selectbar-change", listener);
    const disabled = root.querySelector('[data-dx-selectbar-value="comfortable"]');
    expect(disabled.disabled).toBe(true);
    disabled.click();
    expect(pressed(root)).toEqual(["compact"]);
    expect(listener).not.toHaveBeenCalled();
  });

  it("keeps the md size class by default and accepts the sm class", () => {
    expect(selectbarFixture().classList.contains("dx-selectbar--md")).toBe(true);
    const sm = fixture(`
      <div role="group" class="dx-selectbar dx-selectbar--sm" aria-label="Zoom" data-dx-selectbar>
        <button type="button" class="dx-selectbar__option" aria-pressed="true"
          data-dx-selectbar-option data-dx-selectbar-value="50">50%</button>
      </div>`);
    expect(sm.classList.contains("dx-selectbar--sm")).toBe(true);
    expect(sm.classList.contains("dx-selectbar--md")).toBe(false);
  });
});
