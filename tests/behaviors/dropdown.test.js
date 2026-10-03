import { describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

describe("dropdown", () => {
  const dropdownFixture = (extra = "") =>
    fixture(`
      <div class="dx-dropdown dx-dropdown--md" data-dx-dropdown ${extra}>
        <button type="button" role="combobox" aria-haspopup="listbox" aria-expanded="false"
          aria-controls="dd1-menu" class="dx-dropdown__trigger" data-dx-dropdown-trigger>
          <span class="dx-dropdown__placeholder">Pick a color</span>
          <span class="dx-dropdown__chevron" aria-hidden="true"></span>
        </button>
        <div role="listbox" id="dd1-menu" class="dx-dropdown__menu" data-dx-dropdown-menu hidden>
          <div role="option" id="dd1-option-1" class="dx-dropdown__option"
            data-dx-dropdown-option data-dx-dropdown-value="red" aria-selected="false">Red</div>
          <div role="option" id="dd1-option-2" class="dx-dropdown__option"
            data-dx-dropdown-option data-dx-dropdown-value="green" aria-selected="false">Green</div>
          <div role="option" id="dd1-option-3" class="dx-dropdown__option"
            data-dx-dropdown-option data-dx-dropdown-value="blue" aria-selected="false">Blue</div>
          <div role="option" id="dd1-option-4" class="dx-dropdown__option dx-dropdown__option--disabled"
            data-dx-dropdown-option data-dx-dropdown-value="grey" aria-selected="false"
            aria-disabled="true">Grey (unavailable)</div>
        </div>
      </div>`);

  const key = (el, k) =>
    el.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true }));

  const open = (root) => {
    root.querySelector("[data-dx-dropdown-trigger]").click();
    return root.querySelector("[data-dx-dropdown-menu]");
  };

  it("renders a closed popup with a combobox trigger", () => {
    const root = dropdownFixture();
    const trigger = root.querySelector("[data-dx-dropdown-trigger]");
    const menu = root.querySelector("[data-dx-dropdown-menu]");
    expect(trigger.getAttribute("role")).toBe("combobox");
    expect(trigger.getAttribute("aria-haspopup")).toBe("listbox");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(trigger.getAttribute("aria-controls")).toBe("dd1-menu");
    expect(menu.hidden).toBe(true);
    expect(menu.getAttribute("role")).toBe("listbox");
  });

  it("opens on trigger click and wires aria-expanded/aria-controls", () => {
    const root = dropdownFixture();
    const trigger = root.querySelector("[data-dx-dropdown-trigger]");
    const menu = open(root);
    expect(menu.hidden).toBe(false);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.getAttribute("aria-controls")).toBe(menu.id);
    expect(root.classList.contains("dx-dropdown--open")).toBe(true);
    expect(menu.getAttribute("aria-activedescendant")).toBe("dd1-option-1");
  });

  it("selects by click, fires dx:dropdown-change, closes and reflects the label", () => {
    const root = dropdownFixture();
    const listener = vi.fn();
    root.addEventListener("dx:dropdown-change", listener);
    const trigger = root.querySelector("[data-dx-dropdown-trigger]");
    const menu = open(root);
    menu.querySelector('[data-dx-dropdown-value="green"]').click();
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: { value: "green" } }));
    expect(menu.hidden).toBe(true);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(trigger.textContent).toContain("Green");
    expect(trigger.querySelector(".dx-dropdown__label").classList.contains("dx-dropdown__placeholder")).toBe(false);
    expect(root.querySelector('[data-dx-dropdown-value="green"]').getAttribute("aria-selected")).toBe("true");
    expect(document.activeElement).toBe(trigger);
  });

  it("opens with ArrowDown, moves the active option and selects with Enter", () => {
    const root = dropdownFixture();
    const listener = vi.fn();
    root.addEventListener("dx:dropdown-change", listener);
    const trigger = root.querySelector("[data-dx-dropdown-trigger]");
    const menu = root.querySelector("[data-dx-dropdown-menu]");
    key(root, "ArrowDown");
    expect(menu.hidden).toBe(false);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    key(root, "ArrowDown");
    expect(menu.getAttribute("aria-activedescendant")).toBe("dd1-option-2");
    key(root, "ArrowUp");
    expect(menu.getAttribute("aria-activedescendant")).toBe("dd1-option-1");
    key(root, "End");
    expect(menu.getAttribute("aria-activedescendant")).toBe("dd1-option-3");
    key(root, "Home");
    expect(menu.getAttribute("aria-activedescendant")).toBe("dd1-option-1");
    key(root, "Enter");
    expect(menu.hidden).toBe(true);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: { value: "red" } }));
  });

  it("closes on Escape and returns focus to the trigger", () => {
    const root = dropdownFixture();
    const trigger = root.querySelector("[data-dx-dropdown-trigger]");
    open(root);
    key(root, "Escape");
    expect(root.querySelector("[data-dx-dropdown-menu]").hidden).toBe(true);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(trigger);
  });

  it("closes on an outside mousedown", () => {
    const root = dropdownFixture();
    open(root);
    document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    expect(root.querySelector("[data-dx-dropdown-menu]").hidden).toBe(true);
    expect(root.querySelector("[data-dx-dropdown-trigger]").getAttribute("aria-expanded")).toBe("false");
  });

  it("shows the placeholder until something is selected", () => {
    const root = dropdownFixture();
    const placeholder = root.querySelector(".dx-dropdown__placeholder");
    expect(placeholder.textContent).toBe("Pick a color");
    expect(placeholder.classList.contains("dx-dropdown__label")).toBe(false);
  });

  it("skips disabled options during keyboard navigation and click", () => {
    const root = dropdownFixture();
    const listener = vi.fn();
    root.addEventListener("dx:dropdown-change", listener);
    const menu = open(root);
    key(root, "End");
    expect(menu.getAttribute("aria-activedescendant")).toBe("dd1-option-3");
    const grey = menu.querySelector('[data-dx-dropdown-value="grey"]');
    grey.click();
    expect(listener).not.toHaveBeenCalled();
    expect(menu.hidden).toBe(false);
    expect(grey.getAttribute("aria-selected")).toBe("false");
  });

  it("never opens when the trigger is disabled", () => {
    const root = dropdownFixture();
    const trigger = root.querySelector("[data-dx-dropdown-trigger]");
    trigger.disabled = true;
    trigger.click();
    key(root, "ArrowDown");
    expect(root.querySelector("[data-dx-dropdown-menu]").hidden).toBe(true);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("applies aria-invalid and the invalid class only when invalid", () => {
    const invalid = fixture(`
      <div class="dx-dropdown dx-dropdown--md dx-dropdown--invalid" data-dx-dropdown>
        <button type="button" role="combobox" aria-haspopup="listbox" aria-expanded="false"
          aria-invalid="true" class="dx-dropdown__trigger" data-dx-dropdown-trigger>
          <span class="dx-dropdown__placeholder">Choose</span>
        </button>
        <div role="listbox" class="dx-dropdown__menu" data-dx-dropdown-menu hidden></div>
      </div>`);
    expect(invalid.getAttribute("class")).toContain("dx-dropdown--invalid");
    expect(invalid.querySelector("[data-dx-dropdown-trigger]").getAttribute("aria-invalid")).toBe("true");

    const valid = dropdownFixture();
    expect(valid.getAttribute("class")).not.toContain("dx-dropdown--invalid");
    expect(valid.querySelector("[data-dx-dropdown-trigger]").hasAttribute("aria-invalid")).toBe(false);
  });

  it("keeps the md size class by default and accepts the sm class", () => {
    expect(dropdownFixture().getAttribute("class")).toContain("dx-dropdown--md");
    const sm = fixture(`
      <div class="dx-dropdown dx-dropdown--sm" data-dx-dropdown>
        <button type="button" role="combobox" aria-haspopup="listbox" aria-expanded="false"
          class="dx-dropdown__trigger" data-dx-dropdown-trigger>
          <span class="dx-dropdown__label">Small</span>
        </button>
        <div role="listbox" class="dx-dropdown__menu" data-dx-dropdown-menu hidden></div>
      </div>`);
    expect(sm.getAttribute("class")).toContain("dx-dropdown--sm");
  });
});
