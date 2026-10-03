import { beforeEach, describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

describe("sidebar toggle", () => {
  it("toggles the collapsed class on the targeted sidebar", () => {
    fixture(`
      <aside class="dx-sidebar" data-dx-sidebar id="s1"></aside>
      <button data-dx-sidebar-toggle="#s1" aria-expanded="true">Toggle</button>`);
    const sidebar = document.getElementById("s1");
    const toggle = document.querySelector("[data-dx-sidebar-toggle]");
    expect(sidebar.classList.contains("dx-sidebar--collapsed")).toBe(false);
    toggle.click();
    expect(sidebar.classList.contains("dx-sidebar--collapsed")).toBe(true);
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    toggle.click();
    expect(sidebar.classList.contains("dx-sidebar--collapsed")).toBe(false);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
  });

  it("falls back to the closest sidebar when no selector is given", () => {
    fixture(`
      <div data-dx-sidebar>
        <button data-dx-sidebar-toggle>Toggle</button>
      </div>`);
    const sidebar = document.querySelector("[data-dx-sidebar]");
    document.querySelector("[data-dx-sidebar-toggle]").click();
    expect(sidebar.classList.contains("dx-sidebar--collapsed")).toBe(true);
  });
});
