import { beforeEach, describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

describe("dismiss + interactive", () => {
  it("removes the closest dismissable element", () => {
    fixture(`
      <div data-dx-dismissable>
        <button data-dx-dismiss>×</button>
      </div>`);
    document.querySelector("[data-dx-dismiss]").click();
    expect(document.querySelector("[data-dx-dismissable]")).toBeNull();
  });

  it("dispatches a click from Enter on [data-dx-interactive]", () => {
    const card = fixture(`<div class="dx-card" data-dx-interactive tabindex="0"></div>`);
    const clickSpy = vi.spyOn(card, "click");
    card.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(clickSpy).toHaveBeenCalledTimes(1);
    card.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    expect(clickSpy).toHaveBeenCalledTimes(2);
  });
});
