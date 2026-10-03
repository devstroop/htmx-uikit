import { beforeEach, describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

describe("tabs", () => {
  it("activates a tab on click and shows its panel", () => {
    const root = fixture(`
      <div data-dx-tabs>
        <div data-dx-tablist role="tablist">
          <button data-dx-tab data-dx-tab-key="one" aria-selected="false">One</button>
          <button data-dx-tab data-dx-tab-key="two" aria-selected="true">Two</button>
        </div>
        <div data-dx-tabpanel data-dx-tab-key="one" hidden><p>Panel one</p></div>
        <div data-dx-tabpanel data-dx-tab-key="two"><p>Panel two</p></div>
      </div>`);
    const [one, two] = root.querySelectorAll("[data-dx-tab]");
    one.click();
    expect(one.getAttribute("aria-selected")).toBe("true");
    expect(two.getAttribute("aria-selected")).toBe("false");
    expect(one.tabIndex).toBe(0);
    expect(two.tabIndex).toBe(-1);
    expect(root.querySelector('[data-dx-tabpanel][data-dx-tab-key="one"]').hidden).toBe(false);
    expect(root.querySelector('[data-dx-tabpanel][data-dx-tab-key="two"]').hidden).toBe(true);
  });

  it("navigates with arrow keys and wraps around", () => {
    fixture(`
      <div data-dx-tabs>
        <div data-dx-tablist role="tablist">
          <button data-dx-tab data-dx-tab-key="one">One</button>
          <button data-dx-tab data-dx-tab-key="two">Two</button>
        </div>
        <div data-dx-tabpanel data-dx-tab-key="one" hidden></div>
        <div data-dx-tabpanel data-dx-tab-key="two" hidden></div>
      </div>`);
    const [one, two] = document.querySelectorAll("[data-dx-tab]");
    one.focus();
    one.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    expect(two.getAttribute("aria-selected")).toBe("true");
    expect(document.activeElement).toBe(two);
    two.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    expect(one.getAttribute("aria-selected")).toBe("true");
    two.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));
    expect(one.getAttribute("aria-selected")).toBe("true");
    one.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
    expect(two.getAttribute("aria-selected")).toBe("true");
  });

  it("navigates vertical tablists with Up/Down arrows", () => {
    fixture(`
      <div data-dx-tabs>
        <div data-dx-tablist role="tablist" data-dx-tablist-orientation="vertical">
          <button data-dx-tab data-dx-tab-key="one">One</button>
          <button data-dx-tab data-dx-tab-key="two">Two</button>
        </div>
        <div data-dx-tabpanel data-dx-tab-key="one" hidden></div>
        <div data-dx-tabpanel data-dx-tab-key="two" hidden></div>
      </div>`);
    const [one, two] = document.querySelectorAll("[data-dx-tab]");
    one.focus();
    one.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    expect(two.getAttribute("aria-selected")).toBe("true");
    expect(document.activeElement).toBe(two);
    two.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
    expect(one.getAttribute("aria-selected")).toBe("true");
    two.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    expect(one.getAttribute("aria-selected")).toBe("true");
  });

  it("skips disabled tabs when navigating", () => {
    fixture(`
      <div data-dx-tabs>
        <div data-dx-tablist role="tablist">
          <button data-dx-tab data-dx-tab-key="one">One</button>
          <button data-dx-tab data-dx-tab-key="two" disabled>Two</button>
          <button data-dx-tab data-dx-tab-key="three">Three</button>
        </div>
        <div data-dx-tabpanel data-dx-tab-key="one" hidden></div>
        <div data-dx-tabpanel data-dx-tab-key="two" hidden></div>
        <div data-dx-tabpanel data-dx-tab-key="three" hidden></div>
      </div>`);
    const [one, disabled, three] = document.querySelectorAll("[data-dx-tab]");
    one.focus();
    one.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
    expect(three.getAttribute("aria-selected")).toBe("true");
    expect(disabled.getAttribute("aria-selected")).toBe("false");
  });

  it("ignores clicks on disabled tabs", () => {
    fixture(`
      <div data-dx-tabs>
        <div data-dx-tablist role="tablist">
          <button data-dx-tab data-dx-tab-key="one" disabled>One</button>
          <button data-dx-tab data-dx-tab-key="two">Two</button>
        </div>
        <div data-dx-tabpanel data-dx-tab-key="one" hidden></div>
        <div data-dx-tabpanel data-dx-tab-key="two" hidden></div>
      </div>`);
    const disabled = document.querySelector('[data-dx-tab-key="one"]');
    disabled.click();
    expect(disabled.getAttribute("aria-selected")).not.toBe("true");
  });
});
