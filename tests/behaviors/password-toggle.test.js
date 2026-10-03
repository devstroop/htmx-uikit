import { beforeEach, describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

describe("password toggle", () => {
  const passwordFixture = (extra = "") =>
    fixture(`
      <div class="dx-password" data-dx-password>
        <input type="password" data-dx-password-input value="s3cret" />
        <button type="button" data-dx-password-toggle aria-pressed="false" aria-label="Show password" ${extra}>
          <svg data-dx-password-icon="visible"></svg>
          <svg data-dx-password-icon="hidden" hidden></svg>
        </button>
      </div>`);

  it("flips the input to text and mirrors aria-pressed/label/icon", () => {
    const root = passwordFixture();
    const input = root.querySelector("[data-dx-password-input]");
    const button = root.querySelector("[data-dx-password-toggle]");
    button.click();
    expect(input.type).toBe("text");
    expect(button.getAttribute("aria-pressed")).toBe("true");
    expect(button.getAttribute("aria-label")).toBe("Hide password");
    expect(root.querySelector('[data-dx-password-icon="visible"]').hidden).toBe(true);
    expect(root.querySelector('[data-dx-password-icon="hidden"]').hidden).toBe(false);
    button.click();
    expect(input.type).toBe("password");
    expect(button.getAttribute("aria-pressed")).toBe("false");
    expect(button.getAttribute("aria-label")).toBe("Show password");
    expect(root.querySelector('[data-dx-password-icon="visible"]').hidden).toBe(false);
    expect(root.querySelector('[data-dx-password-icon="hidden"]').hidden).toBe(true);
  });

  it("uses data-dx-password-show/hide for the toggle labels", () => {
    const root = passwordFixture('data-dx-password-show="Reveal" data-dx-password-hide="Conceal"');
    const button = root.querySelector("[data-dx-password-toggle]");
    button.click();
    expect(button.getAttribute("aria-label")).toBe("Conceal");
    button.click();
    expect(button.getAttribute("aria-label")).toBe("Reveal");
  });

  it("ignores clicks on a disabled toggle", () => {
    const root = passwordFixture("disabled");
    const input = root.querySelector("[data-dx-password-input]");
    root.querySelector("[data-dx-password-toggle]").click();
    expect(input.type).toBe("password");
  });
});
