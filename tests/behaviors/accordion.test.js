import { beforeEach, describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

describe("accordion", () => {
  it("opens a closed item and closes a sibling in single mode", () => {
    const root = fixture(`
      <div data-dx-accordion>
        <div data-dx-accordion-item>
          <button data-dx-accordion-trigger aria-expanded="true">A</button>
          <div data-dx-accordion-panel open></div>
        </div>
        <div data-dx-accordion-item>
          <button data-dx-accordion-trigger aria-expanded="false">B</button>
          <div data-dx-accordion-panel></div>
        </div>
      </div>`);
    const [a, b] = root.querySelectorAll("[data-dx-accordion-trigger]");
    b.click();
    expect(b.getAttribute("aria-expanded")).toBe("true");
    expect(b.closest("[data-dx-accordion-item]").querySelector("[data-dx-accordion-panel]").hasAttribute("open")).toBe(true);
    expect(a.getAttribute("aria-expanded")).toBe("false");
    expect(a.closest("[data-dx-accordion-item]").querySelector("[data-dx-accordion-panel]").hasAttribute("open")).toBe(false);
  });

  it("keeps items independent in multiple mode", () => {
    const root = fixture(`
      <div data-dx-accordion data-dx-accordion-multiple>
        <div data-dx-accordion-item>
          <button data-dx-accordion-trigger aria-expanded="false">A</button>
          <div data-dx-accordion-panel></div>
        </div>
        <div data-dx-accordion-item>
          <button data-dx-accordion-trigger aria-expanded="false">B</button>
          <div data-dx-accordion-panel></div>
        </div>
      </div>`);
    const [a, b] = root.querySelectorAll("[data-dx-accordion-trigger]");
    a.click();
    b.click();
    expect(a.getAttribute("aria-expanded")).toBe("true");
    expect(b.getAttribute("aria-expanded")).toBe("true");
  });

  it("closes an open item when clicked again", () => {
    const root = fixture(`
      <div data-dx-accordion>
        <div data-dx-accordion-item>
          <button data-dx-accordion-trigger aria-expanded="true">A</button>
          <div data-dx-accordion-panel open></div>
        </div>
      </div>`);
    const trigger = root.querySelector("[data-dx-accordion-trigger]");
    trigger.click();
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(root.querySelector("[data-dx-accordion-panel]").hasAttribute("open")).toBe(false);
  });
});
