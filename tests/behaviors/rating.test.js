import { beforeEach, describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

describe("rating", () => {
  const ratingFixture = (attrs = "", stars = 5) => {
    const items = Array.from({ length: stars }, (_, i) => `
      <button type="button" role="radio" data-dx-rating-item data-dx-rating-value="${i + 1}">
        <svg class="dx-rating-icon--filled"></svg>
        <svg class="dx-rating-icon--empty"></svg>
      </button>`).join("");
    return fixture(`
      <div class="dx-rating" data-dx-rating role="radiogroup" ${attrs}>
        <button type="button" data-dx-rating-clear></button>
        ${items}
      </div>`);
  };

  it("renders the initial value and roving tabindex", () => {
    const root = ratingFixture('data-dx-stars="5" data-dx-value="3"');
    window.dxUikit.rating.init(root);
    const items = root.querySelectorAll("[data-dx-rating-item]");
    expect(items[0].getAttribute("aria-checked")).toBe("true");
    expect(items[2].getAttribute("aria-checked")).toBe("true");
    expect(items[3].getAttribute("aria-checked")).toBe("false");
    expect(items[2].tabIndex).toBe(0);
    expect(items[3].tabIndex).toBe(-1);
    expect(items[2].classList.contains("dx-rating-item--filled")).toBe(true);
  });

  it("sets the value on star click and fires dx:change", () => {
    const root = ratingFixture('data-dx-stars="5" data-dx-value="0"');
    let detail = null;
    root.addEventListener("dx:change", (e) => (detail = e.detail.value));
    root.querySelector('[data-dx-rating-value="4"]').click();
    expect(detail).toBe(4);
    expect(root.querySelector('[data-dx-rating-value="4"]').getAttribute("aria-checked")).toBe("true");
  });

  it("clears to 0 with the clear button", () => {
    const root = ratingFixture('data-dx-stars="5" data-dx-value="3"');
    let detail = null;
    root.addEventListener("dx:change", (e) => (detail = e.detail.value));
    root.querySelector("[data-dx-rating-clear]").click();
    expect(detail).toBe(0);
    expect(root.querySelectorAll('[aria-checked="true"]').length).toBe(0);
    expect(root.querySelector("[data-dx-rating-clear]").tabIndex).toBe(0);
  });

  it("navigates with arrow keys and moves focus", () => {
    const root = ratingFixture('data-dx-stars="5" data-dx-value="3"');
    root.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }));
    expect(document.activeElement.getAttribute("data-dx-rating-value")).toBe("4");
    root.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true, cancelable: true }));
    expect(document.activeElement.getAttribute("data-dx-rating-value")).toBe("3");
    root.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true, cancelable: true }));
    expect(document.activeElement.getAttribute("data-dx-rating-value")).toBe("5");
  });

  it("ignores clicks when readonly or disabled", () => {
    const readonly = ratingFixture('data-dx-stars="5" data-dx-value="2" data-dx-readonly');
    window.dxUikit.rating.init(readonly);
    readonly.querySelector('[data-dx-rating-value="5"]').click();
    expect(readonly.querySelector('[data-dx-rating-value="5"]').getAttribute("aria-checked")).toBe("false");
    const disabled = ratingFixture('data-dx-stars="5" data-dx-value="2" data-dx-disabled');
    window.dxUikit.rating.init(disabled);
    disabled.querySelector('[data-dx-rating-value="5"]').click();
    expect(disabled.querySelector('[data-dx-rating-value="5"]').getAttribute("aria-checked")).toBe("false");
  });

  it("rebuilds items when data-dx-stars does not match the markup", () => {
    const root = ratingFixture('data-dx-stars="3" data-dx-value="2"', 5);
    window.dxUikit.rating.init(root);
    expect(root.querySelectorAll("[data-dx-rating-item]").length).toBe(3);
    expect(root.querySelectorAll('[data-dx-rating-value="3"]').length).toBe(1);
    expect(root.querySelectorAll('[data-dx-rating-value="5"]').length).toBe(0);
  });
});
