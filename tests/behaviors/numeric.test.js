import { beforeEach, describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

describe("numeric", () => {
  const numericFixture = (attrs = "") =>
    fixture(`
      <div class="dx-numeric" data-dx-numeric ${attrs}>
        <input type="text" inputmode="decimal" data-dx-numeric-input value="3" />
        <button type="button" data-dx-numeric-up></button>
        <button type="button" data-dx-numeric-down></button>
      </div>`);

  it("steps up/down from the buttons and clamps to min/max", () => {
    const root = numericFixture('data-dx-min="0" data-dx-max="5"');
    const input = root.querySelector("[data-dx-numeric-input]");
    root.querySelector("[data-dx-numeric-up]").click();
    expect(input.value).toBe("4");
    input.value = "5";
    root.querySelector("[data-dx-numeric-up]").click();
    expect(input.value).toBe("5");
    input.value = "0";
    root.querySelector("[data-dx-numeric-down]").click();
    expect(input.value).toBe("0");
  });

  it("steps by data-dx-step, snapping from min", () => {
    const root = numericFixture('data-dx-min="0" data-dx-step="5"');
    const input = root.querySelector("[data-dx-numeric-input]");
    root.querySelector("[data-dx-numeric-up]").click();
    expect(input.value).toBe("5");
    input.value = "3";
    root.querySelector("[data-dx-numeric-up]").click();
    expect(input.value).toBe("5");
  });

  it("supports ArrowUp/ArrowDown with default prevented", () => {
    const root = numericFixture();
    const input = root.querySelector("[data-dx-numeric-input]");
    const up = new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true, cancelable: true });
    input.dispatchEvent(up);
    expect(up.defaultPrevented).toBe(true);
    expect(input.value).toBe("4");
    const down = new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true });
    input.dispatchEvent(down);
    expect(down.defaultPrevented).toBe(true);
    expect(input.value).toBe("3");
  });

  it("strips non-numeric typing", () => {
    const root = numericFixture();
    const input = root.querySelector("[data-dx-numeric-input]");
    input.value = "a1b2c";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    expect(input.value).toBe("12");
  });

  it("clamps and snaps on blur", () => {
    const root = numericFixture('data-dx-min="0" data-dx-max="5"');
    const input = root.querySelector("[data-dx-numeric-input]");
    input.value = "99";
    input.dispatchEvent(new Event("blur", { bubbles: true }));
    expect(input.value).toBe("5");
    input.value = "";
    input.dispatchEvent(new Event("blur", { bubbles: true }));
    expect(input.value).toBe("");
  });
});
