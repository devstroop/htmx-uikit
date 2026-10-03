import { beforeEach, describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

describe("mask", () => {
  const maskFixture = () =>
    fixture(`
      <input type="text" data-dx-mask="(###) ###-####" />
    `);

  it("formats digits as they are typed", () => {
    const input = maskFixture();
    input.value = "1234567890";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    expect(input.value).toBe("(123) 456-7890");
  });

  it("strips non-digit characters", () => {
    const input = maskFixture();
    input.value = "ab1cd23";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    expect(input.value).toBe("(123");
  });

  it("drops characters beyond the last placeholder", () => {
    const input = maskFixture();
    input.value = "1234567890123";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    expect(input.value).toBe("(123) 456-7890");
  });

  it("backspace over a separator also removes the digit before it", () => {
    const input = maskFixture();
    input.value = "(123) 456-7";
    input.setSelectionRange(10, 10);
    const event = new KeyboardEvent("keydown", { key: "Backspace", bubbles: true, cancelable: true });
    input.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(input.value).toBe("(123) 456");
  });
});
