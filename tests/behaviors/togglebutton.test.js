import { describe, expect, it } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

describe("togglebutton", () => {
  const buttonFixture = (extra = "") =>
    fixture(`
      <button type="button" class="dx-togglebutton dx-togglebutton--md" data-dx-togglebutton ${extra}>
        Bold
      </button>`);

  it("renders a native button whose accessible name is its text", () => {
    const btn = buttonFixture();
    expect(btn.tagName).toBe("BUTTON");
    expect(btn.getAttribute("type")).toBe("button");
    expect(btn.textContent.trim()).toBe("Bold");
    expect(btn.disabled).toBe(false);
  });

  it("starts unpressed", () => {
    const btn = buttonFixture();
    expect(btn.getAttribute("aria-pressed")).not.toBe("true");
    expect(btn.classList.contains("dx-togglebutton--pressed")).toBe(false);
  });

  it("toggles aria-pressed and the pressed class on click", () => {
    const btn = buttonFixture();
    btn.click();
    expect(btn.getAttribute("aria-pressed")).toBe("true");
    expect(btn.classList.contains("dx-togglebutton--pressed")).toBe(true);
    btn.click();
    expect(btn.getAttribute("aria-pressed")).toBe("false");
    expect(btn.classList.contains("dx-togglebutton--pressed")).toBe(false);
  });

  it("starts pressed when the markup ships aria-pressed", () => {
    const btn = fixture(`
      <button type="button" class="dx-togglebutton dx-togglebutton--md dx-togglebutton--pressed"
        aria-pressed="true" data-dx-togglebutton>Italic</button>`);
    expect(btn.getAttribute("aria-pressed")).toBe("true");
    btn.click();
    expect(btn.getAttribute("aria-pressed")).toBe("false");
    expect(btn.classList.contains("dx-togglebutton--pressed")).toBe(false);
  });

  it("does not toggle when disabled", () => {
    const btn = buttonFixture("disabled");
    btn.click();
    expect(btn.getAttribute("aria-pressed")).not.toBe("true");
    expect(btn.classList.contains("dx-togglebutton--pressed")).toBe(false);
  });

  it("keeps the md size class by default and accepts the sm class", () => {
    expect(buttonFixture().classList.contains("dx-togglebutton--md")).toBe(true);
    const sm = fixture(
      `<button type="button" class="dx-togglebutton dx-togglebutton--sm" data-dx-togglebutton>Small</button>`,
    );
    expect(sm.classList.contains("dx-togglebutton--sm")).toBe(true);
    expect(sm.classList.contains("dx-togglebutton--md")).toBe(false);
  });
});
