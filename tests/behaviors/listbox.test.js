import { describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

describe("listbox", () => {
  const singleFixture = (extra = "") =>
    fixture(`
      <div role="listbox" tabindex="0" class="dx-listbox" aria-label="Destination"
        aria-activedescendant="lb1-option-1" data-dx-listbox ${extra}>
        <div role="option" id="lb1-option-1" class="dx-listbox__option dx-listbox__option--selected"
          data-dx-listbox-option data-dx-listbox-value="red" aria-selected="true">Red</div>
        <div role="option" id="lb1-option-2" class="dx-listbox__option"
          data-dx-listbox-option data-dx-listbox-value="green" aria-selected="false">Green</div>
        <div role="option" id="lb1-option-3" class="dx-listbox__option"
          data-dx-listbox-option data-dx-listbox-value="blue" aria-selected="false">Blue</div>
        <div role="option" id="lb1-option-4" class="dx-listbox__option dx-listbox__option--disabled"
          data-dx-listbox-option data-dx-listbox-value="grey" aria-selected="false"
          aria-disabled="true">Grey (unavailable)</div>
      </div>`);

  const multiFixture = () =>
    fixture(`
      <div role="listbox" tabindex="0" class="dx-listbox" aria-label="Languages (multiple)"
        aria-activedescendant="lb2-option-1" data-dx-listbox data-dx-listbox-multiple>
        <div role="option" id="lb2-option-1" class="dx-listbox__option dx-listbox__option--selected"
          data-dx-listbox-option data-dx-listbox-value="en" aria-selected="true">English</div>
        <div role="option" id="lb2-option-2" class="dx-listbox__option"
          data-dx-listbox-option data-dx-listbox-value="es" aria-selected="false">Spanish</div>
        <div role="option" id="lb2-option-3" class="dx-listbox__option dx-listbox__option--selected"
          data-dx-listbox-option data-dx-listbox-value="fr" aria-selected="true">French</div>
      </div>`);

  const key = (el, k) =>
    el.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true }));

  const selected = (root) =>
    [...root.querySelectorAll("[data-dx-listbox-option]")]
      .filter((o) => o.getAttribute("aria-selected") === "true")
      .map((o) => o.getAttribute("data-dx-listbox-value"));

  it("renders a listbox container with option children", () => {
    const root = singleFixture();
    expect(root.getAttribute("role")).toBe("listbox");
    expect(root.tabIndex).toBe(0);
    expect(root.querySelectorAll('[role="option"]')).toHaveLength(4);
    expect(root.getAttribute("aria-activedescendant")).toBe("lb1-option-1");
  });

  it("exposes the aria-label on the container", () => {
    const root = singleFixture();
    expect(root.getAttribute("aria-label")).toBe("Destination");
  });

  it("selects with a click, clears the others and fires dx:listbox-change", () => {
    const root = singleFixture();
    const listener = vi.fn();
    root.addEventListener("dx:listbox-change", listener);
    const green = root.querySelector('[data-dx-listbox-value="green"]');
    green.click();
    expect(green.getAttribute("aria-selected")).toBe("true");
    expect(green.classList.contains("dx-listbox__option--selected")).toBe(true);
    expect(selected(root)).toEqual(["green"]);
    expect(root.getAttribute("aria-activedescendant")).toBe("lb1-option-2");
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: { value: "green" } }));
  });

  it("toggles options independently when multiple", () => {
    const root = multiFixture();
    const listener = vi.fn();
    root.addEventListener("dx:listbox-change", listener);
    const spanish = root.querySelector('[data-dx-listbox-value="es"]');
    spanish.click();
    expect(spanish.getAttribute("aria-selected")).toBe("true");
    expect(selected(root)).toEqual(["en", "es", "fr"]);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: { values: ["en", "es", "fr"] } }));

    root.querySelector('[data-dx-listbox-value="en"]').click();
    expect(selected(root)).toEqual(["es", "fr"]);
    expect(listener).toHaveBeenLastCalledWith(expect.objectContaining({ detail: { values: ["es", "fr"] } }));
  });

  it("reads the selection back from the markup (server re-render is the source of truth)", () => {
    const root = singleFixture();
    root.querySelector('[data-dx-listbox-value="red"]').setAttribute("aria-selected", "false");
    root.querySelector('[data-dx-listbox-value="blue"]').setAttribute("aria-selected", "true");
    const listener = vi.fn();
    root.addEventListener("dx:listbox-change", listener);
    root.querySelector('[data-dx-listbox-value="blue"]').click();
    expect(selected(root)).toEqual([]);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: { value: null } }));
  });

  it("moves the active option with ArrowDown in single mode", () => {
    const root = singleFixture();
    const listener = vi.fn();
    root.addEventListener("dx:listbox-change", listener);
    key(root, "ArrowDown");
    expect(root.getAttribute("aria-activedescendant")).toBe("lb1-option-2");
    expect(
      root.querySelector('[data-dx-listbox-value="green"]').classList.contains("dx-listbox__option--active"),
    ).toBe(true);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: { value: "green" } }));
  });

  it("selects the active option with Enter", () => {
    const root = fixture(`
      <div role="listbox" tabindex="0" class="dx-listbox" aria-label="Destination"
        aria-activedescendant="lb1-option-1" data-dx-listbox>
        <div role="option" id="lb1-option-1" class="dx-listbox__option"
          data-dx-listbox-option data-dx-listbox-value="red" aria-selected="false">Red</div>
        <div role="option" id="lb1-option-2" class="dx-listbox__option"
          data-dx-listbox-option data-dx-listbox-value="green" aria-selected="false">Green</div>
      </div>`);
    const listener = vi.fn();
    root.addEventListener("dx:listbox-change", listener);
    key(root, "Enter");
    expect(root.querySelector('[data-dx-listbox-value="red"]').getAttribute("aria-selected")).toBe("true");
    expect(root.querySelector('[data-dx-listbox-value="green"]').getAttribute("aria-selected")).toBe("false");
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: { value: "red" } }));
  });

  it("toggles the active option with Space without moving it when multiple", () => {
    const root = multiFixture();
    const listener = vi.fn();
    root.addEventListener("dx:listbox-change", listener);
    key(root, " ");
    expect(root.getAttribute("aria-activedescendant")).toBe("lb2-option-1");
    expect(selected(root)).toEqual(["fr"]);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: { values: ["fr"] } }));
  });

  it("skips disabled options with the arrow keys and Home/End", () => {
    const root = singleFixture();
    root.setAttribute("aria-activedescendant", "lb1-option-3");
    key(root, "ArrowDown");
    expect(root.getAttribute("aria-activedescendant")).toBe("lb1-option-1");
    key(root, "End");
    expect(root.getAttribute("aria-activedescendant")).toBe("lb1-option-3");
    expect(root.querySelector('[data-dx-listbox-value="grey"]').getAttribute("aria-disabled")).toBe("true");
  });

  it("ignores clicks on disabled options", () => {
    const root = singleFixture();
    const listener = vi.fn();
    root.addEventListener("dx:listbox-change", listener);
    const grey = root.querySelector('[data-dx-listbox-value="grey"]');
    grey.click();
    expect(grey.getAttribute("aria-selected")).toBe("false");
    expect(listener).not.toHaveBeenCalled();
  });

  it("jumps to the next option starting with the typed letter", () => {
    const root = singleFixture();
    const listener = vi.fn();
    root.addEventListener("dx:listbox-change", listener);
    key(root, "b");
    expect(root.getAttribute("aria-activedescendant")).toBe("lb1-option-3");
    expect(selected(root)).toEqual(["blue"]);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: { value: "blue" } }));
  });
});
