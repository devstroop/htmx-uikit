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

  it("mask click collapses an open drawer, hides the mask, and flips the trigger", () => {
    fixture(`
      <aside class="dx-sidebar" data-dx-sidebar id="s1"></aside>
      <button data-dx-sidebar-toggle="#s1" aria-controls="s1" aria-expanded="true">Toggle</button>
      <div data-dx-sidebar-mask="#s1"></div>`);
    const mask = document.querySelector("[data-dx-sidebar-mask]");
    mask.click();
    expect(document.getElementById("s1").classList.contains("dx-sidebar--collapsed")).toBe(true);
    expect(mask.classList.contains("dx-layout-mask--hidden")).toBe(true);
    expect(document.querySelector("[data-dx-sidebar-toggle]").getAttribute("aria-expanded")).toBe("false");
  });

  it("escape closes visible overlay masks", () => {
    fixture(`
      <aside class="dx-sidebar" data-dx-sidebar id="s1"></aside>
      <div data-dx-sidebar-mask="#s1"></div>`);
    const mask = document.querySelector("[data-dx-sidebar-mask]");
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(document.getElementById("s1").classList.contains("dx-sidebar--collapsed")).toBe(true);
    expect(mask.classList.contains("dx-layout-mask--hidden")).toBe(true);
  });

  it("mask click with no matching target is a no-op", () => {
    fixture(`<div data-dx-sidebar-mask="#nope"></div>`);
    const mask = document.querySelector("[data-dx-sidebar-mask]");
    expect(() => mask.click()).not.toThrow();
    expect(mask.classList.contains("dx-layout-mask--hidden")).toBe(false);
  });
});
