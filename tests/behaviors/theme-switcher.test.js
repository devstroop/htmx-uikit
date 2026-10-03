import { beforeEach, describe, expect, it } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

describe("theme-switcher", () => {
  const switchFixture = () =>
    fixture(`
      <label class="dx-theme-switcher">
        <span>Dark mode</span>
        <input type="checkbox" data-dx-theme-switch />
      </label>`).querySelector("[data-dx-theme-switch]");

  const settle = () => document.dispatchEvent(new Event("htmx:afterSettle"));

  const change = (input) => input.dispatchEvent(new Event("change", { bubbles: true }));

  beforeEach(() => {
    document.documentElement.removeAttribute("data-theme");
  });

  it("starts in light mode with the switch unchecked", () => {
    document.documentElement.dataset.theme = "light";
    const input = switchFixture();
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(input.checked).toBe(false);
  });

  it("sets data-theme=dark when the switch is checked", () => {
    const input = switchFixture();
    input.checked = true;
    change(input);
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("sets data-theme=light when the switch is unchecked", () => {
    document.documentElement.dataset.theme = "dark";
    const input = switchFixture();
    settle();
    expect(input.checked).toBe(true);
    input.checked = false;
    change(input);
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("reads an existing dark theme into the switch on settle", () => {
    document.documentElement.dataset.theme = "dark";
    const input = switchFixture();
    expect(input.checked).toBe(false);
    settle();
    expect(input.checked).toBe(true);
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("flips the theme through native checkbox activation", () => {
    const input = switchFixture();
    expect(input.type).toBe("checkbox");
    input.click();
    expect(input.checked).toBe(true);
    expect(document.documentElement.dataset.theme).toBe("dark");
    input.click();
    expect(input.checked).toBe(false);
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("keeps focus on the control across the flip", () => {
    const input = switchFixture();
    input.focus();
    input.checked = true;
    change(input);
    expect(document.activeElement).toBe(input);
    expect(input.checked).toBe(true);
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("exposes every flip on <html> for consumers (onChange equivalent)", async () => {
    const input = switchFixture();
    const seen = [];
    const observer = new MutationObserver(() => {
      seen.push(document.documentElement.dataset.theme);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    input.checked = true;
    change(input);
    await new Promise((resolve) => setTimeout(resolve, 0));
    input.checked = false;
    change(input);
    await new Promise((resolve) => setTimeout(resolve, 0));
    observer.disconnect();
    expect(seen).toEqual(["dark", "light"]);
  });
});
