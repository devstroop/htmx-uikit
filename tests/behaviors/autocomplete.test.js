import { describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

describe("autocomplete", () => {
  const autocompleteFixture = (extra = "") =>
    fixture(`
      <div class="dx-autocomplete dx-autocomplete--md" data-dx-autocomplete ${extra}>
        <div class="dx-autocomplete__wrap">
          <input type="text" role="combobox" aria-autocomplete="list" aria-expanded="false"
            aria-controls="ac1-menu" aria-label="Pick a fruit" class="dx-autocomplete__input"
            placeholder="Type to filter…" autocomplete="off" data-dx-autocomplete-input />
          <button type="button" class="dx-autocomplete__clear" aria-label="Clear"
            data-dx-autocomplete-clear hidden>×</button>
        </div>
        <div role="listbox" id="ac1-menu" class="dx-autocomplete__menu" data-dx-autocomplete-menu hidden>
          <div role="option" id="ac1-option-1" class="dx-autocomplete__option"
            data-dx-autocomplete-option data-dx-autocomplete-value="apple"
            data-dx-autocomplete-label="Apple" hidden>Apple</div>
          <div role="option" id="ac1-option-2" class="dx-autocomplete__option"
            data-dx-autocomplete-option data-dx-autocomplete-value="banana"
            data-dx-autocomplete-label="Banana" hidden>Banana</div>
          <div role="option" id="ac1-option-3" class="dx-autocomplete__option"
            data-dx-autocomplete-option data-dx-autocomplete-value="cherry"
            data-dx-autocomplete-label="Cherry" hidden>Cherry</div>
          <div role="option" id="ac1-option-4" class="dx-autocomplete__option dx-autocomplete__option--disabled"
            data-dx-autocomplete-option data-dx-autocomplete-value="durian"
            data-dx-autocomplete-label="Durian" aria-disabled="true" hidden>Durian (unavailable)</div>
          <div class="dx-autocomplete__empty" data-dx-autocomplete-empty hidden>No matches</div>
        </div>
      </div>`);

  const captureErrors = () => {
    const errors = [];
    const listener = (e) => errors.push(e.error ?? e.message ?? e);
    window.addEventListener("error", listener);
    return { errors, stop: () => window.removeEventListener("error", listener) };
  };

  const type = (input, value) => {
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
  };

  it("renders the combobox input with a closed popup", () => {
    const root = autocompleteFixture();
    const input = root.querySelector("[data-dx-autocomplete-input]");
    const menu = root.querySelector("[data-dx-autocomplete-menu]");
    expect(input.getAttribute("role")).toBe("combobox");
    expect(input.getAttribute("aria-autocomplete")).toBe("list");
    expect(input.getAttribute("aria-expanded")).toBe("false");
    expect(input.getAttribute("aria-controls")).toBe("ac1-menu");
    expect(menu.hidden).toBe(true);
    expect(menu.getAttribute("role")).toBe("listbox");
    expect(root.querySelectorAll('[role="option"]')).toHaveLength(4);
    expect(root.querySelector("[data-dx-autocomplete-clear]").hidden).toBe(true);
  });

  it("never opens the popup when the input is disabled", () => {
    const root = autocompleteFixture();
    const input = root.querySelector("[data-dx-autocomplete-input]");
    input.disabled = true;
    const { errors, stop } = captureErrors();
    type(input, "app");
    stop();
    expect(errors).toEqual([]);
    expect(root.querySelector("[data-dx-autocomplete-menu]").hidden).toBe(true);
    expect(input.getAttribute("aria-expanded")).toBe("false");
  });

  it("applies aria-invalid and the invalid class only when invalid", () => {
    const invalid = fixture(`
      <div class="dx-autocomplete dx-autocomplete--md dx-autocomplete--invalid" data-dx-autocomplete>
        <input type="text" role="combobox" aria-autocomplete="list" aria-expanded="false"
          aria-invalid="true" class="dx-autocomplete__input" data-dx-autocomplete-input />
        <div role="listbox" class="dx-autocomplete__menu" data-dx-autocomplete-menu hidden></div>
      </div>`);
    expect(invalid.classList.contains("dx-autocomplete--invalid")).toBe(true);
    expect(invalid.querySelector("input").getAttribute("aria-invalid")).toBe("true");

    const valid = autocompleteFixture();
    expect(valid.classList.contains("dx-autocomplete--invalid")).toBe(false);
    expect(valid.querySelector("input").hasAttribute("aria-invalid")).toBe(false);
  });

  it("keeps the md size class by default and accepts the sm class", () => {
    expect(autocompleteFixture().classList.contains("dx-autocomplete--md")).toBe(true);
    const sm = fixture(`
      <div class="dx-autocomplete dx-autocomplete--sm" data-dx-autocomplete>
        <input type="text" role="combobox" aria-autocomplete="list" aria-expanded="false"
          class="dx-autocomplete__input" data-dx-autocomplete-input />
        <div role="listbox" class="dx-autocomplete__menu" data-dx-autocomplete-menu hidden></div>
      </div>`);
    expect(sm.classList.contains("dx-autocomplete--sm")).toBe(true);
    expect(sm.classList.contains("dx-autocomplete--md")).toBe(false);
  });

  it("filters the option list while typing", () => {
    const root = autocompleteFixture();
    const input = root.querySelector("[data-dx-autocomplete-input]");
    type(input, "an");
    const visible = [...root.querySelectorAll("[data-dx-autocomplete-option]")].filter((o) => !o.hidden);
    expect(visible.map((o) => o.getAttribute("data-dx-autocomplete-label"))).toEqual(["Banana"]);
    expect(root.querySelector("[data-dx-autocomplete-menu]").hidden).toBe(false);
    expect(input.getAttribute("aria-expanded")).toBe("true");
  });

  it("selects an option by click and fires dx:autocomplete-select", () => {
    const root = autocompleteFixture();
    const listener = vi.fn();
    root.addEventListener("dx:autocomplete-select", listener);
    const input = root.querySelector("[data-dx-autocomplete-input]");
    type(input, "ch");
    root.querySelector('[data-dx-autocomplete-value="cherry"]').click();
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { value: "cherry", label: "Cherry" } }),
    );
    expect(input.value).toBe("Cherry");
    expect(root.querySelector("[data-dx-autocomplete-menu]").hidden).toBe(true);
  });

  it("moves aria-activedescendant with the arrow keys and Enter selects", () => {
    const root = autocompleteFixture();
    const listener = vi.fn();
    root.addEventListener("dx:autocomplete-select", listener);
    const input = root.querySelector("[data-dx-autocomplete-input]");
    input.focus();
    type(input, "a");
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true }));
    expect(input.getAttribute("aria-activedescendant")).toBe("ac1-option-1");
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true }));
    expect(input.getAttribute("aria-activedescendant")).toBe("ac1-option-2");
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { value: "banana", label: "Banana" } }),
    );
    expect(input.value).toBe("Banana");
    expect(root.querySelector("[data-dx-autocomplete-menu]").hidden).toBe(true);

    type(input, "a");
    expect(root.querySelector("[data-dx-autocomplete-menu]").hidden).toBe(false);
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    expect(root.querySelector("[data-dx-autocomplete-menu]").hidden).toBe(true);
    expect(input.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(input);
  });

  it("clears the input and reopens the full list from the clear affordance", () => {
    const root = autocompleteFixture();
    const input = root.querySelector("[data-dx-autocomplete-input]");
    type(input, "ap");
    root.querySelector("[data-dx-autocomplete-clear]").click();
    expect(input.value).toBe("");
    expect(root.querySelector("[data-dx-autocomplete-menu]").hidden).toBe(false);
    expect(document.activeElement).toBe(input);
  });

  it("renders the empty message when nothing matches", () => {
    const root = autocompleteFixture();
    const input = root.querySelector("[data-dx-autocomplete-input]");
    type(input, "zzz");
    expect(root.querySelector("[data-dx-autocomplete-empty]").hidden).toBe(false);
    expect(root.querySelector("[data-dx-autocomplete-menu]").hidden).toBe(false);
  });
});
