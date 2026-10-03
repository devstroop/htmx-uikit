import { describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

describe("fab-menu", () => {
  const fabFixture = () => {
    const root = fixture(`
      <div class="dx-fabmenu dx-fabmenu--bottom-right" data-dx-fabmenu data-dx-position="bottom-right">
        <div id="fab-menu-1" role="menu" class="dx-fabmenu-menu" data-dx-fabmenu-menu aria-label="Open menu" hidden>
          <div class="dx-fabmenu-item-wrapper" data-dx-fabmenu-item-wrapper>
            <span class="dx-fabmenu-tooltip" aria-hidden="true">Create</span>
            <button type="button" role="menuitem" class="dx-fabmenu-item" data-dx-fabmenu-item data-dx-text="Create" data-dx-value="create" aria-label="Create" tabindex="-1">Create</button>
          </div>
          <div class="dx-fabmenu-item-wrapper" data-dx-fabmenu-item-wrapper>
            <span class="dx-fabmenu-tooltip" aria-hidden="true">Edit</span>
            <button type="button" role="menuitem" class="dx-fabmenu-item" data-dx-fabmenu-item data-dx-text="Edit" data-dx-value="edit" aria-label="Edit" tabindex="-1">Edit</button>
          </div>
          <div class="dx-fabmenu-item-wrapper" data-dx-fabmenu-item-wrapper>
            <span class="dx-fabmenu-tooltip" aria-hidden="true">Export</span>
            <button type="button" role="menuitem" class="dx-fabmenu-item dx-fabmenu-item--disabled" data-dx-fabmenu-item data-dx-text="Export" data-dx-value="export" aria-label="Export" aria-disabled="true" disabled tabindex="-1">Export</button>
          </div>
        </div>
        <button type="button" class="dx-fabmenu-main" data-dx-fabmenu-trigger aria-haspopup="menu" aria-expanded="false" aria-controls="fab-menu-1" aria-label="Open menu">
          <span class="dx-fabmenu-main-icon" aria-hidden="true">+</span>
        </button>
      </div>`);
    window.dxUikit.fabmenu.init(root);
    return root;
  };

  it("toggles the menu on the main button click", () => {
    const root = fabFixture();
    const trigger = root.querySelector("[data-dx-fabmenu-trigger]");
    const menu = root.querySelector("[data-dx-fabmenu-menu]");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(menu.hidden).toBe(true);
    trigger.click();
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(menu.hidden).toBe(false);
    trigger.click();
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(menu.hidden).toBe(true);
  });

  it("dispatches dx:fabmenu-click with text and value and closes", () => {
    const root = fabFixture();
    const listener = vi.fn();
    root.addEventListener("dx:fabmenu-click", listener);
    const trigger = root.querySelector("[data-dx-fabmenu-trigger]");
    trigger.click();
    root.querySelector('[data-dx-text="Edit"]').click();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].detail).toEqual({ text: "Edit", value: "edit" });
    expect(root.querySelector("[data-dx-fabmenu-menu]").hidden).toBe(true);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("ignores clicks on disabled items", () => {
    const root = fabFixture();
    const listener = vi.fn();
    root.addEventListener("dx:fabmenu-click", listener);
    root.querySelector("[data-dx-fabmenu-trigger]").click();
    root.querySelector('[data-dx-text="Export"]').click();
    expect(listener).not.toHaveBeenCalled();
    expect(root.querySelector("[data-dx-fabmenu-menu]").hidden).toBe(false);
  });

  it("closes with Escape and returns focus to the trigger", () => {
    const root = fabFixture();
    const trigger = root.querySelector("[data-dx-fabmenu-trigger]");
    trigger.click();
    const item = root.querySelector('[data-dx-text="Create"]');
    item.focus();
    item.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    expect(root.querySelector("[data-dx-fabmenu-menu]").hidden).toBe(true);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(trigger);
  });

  it("ignores Escape while the menu is closed", () => {
    const root = fabFixture();
    const trigger = root.querySelector("[data-dx-fabmenu-trigger]");
    trigger.focus();
    trigger.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(trigger);
  });

  it("closes when clicking outside the menu", () => {
    const root = fabFixture();
    root.querySelector("[data-dx-fabmenu-trigger]").click();
    document.body.insertAdjacentHTML("beforeend", '<button id="outside">outside</button>');
    document.querySelector("#outside").click();
    expect(root.querySelector("[data-dx-fabmenu-menu]").hidden).toBe(true);
    expect(root.querySelector("[data-dx-fabmenu-trigger]").getAttribute("aria-expanded")).toBe("false");
  });

  it("wires ARIA on the trigger, menu and items", () => {
    const root = fabFixture();
    const trigger = root.querySelector("[data-dx-fabmenu-trigger]");
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    expect(trigger.getAttribute("aria-controls")).toBe("fab-menu-1");
    expect(trigger.getAttribute("aria-label")).toBe("Open menu");
    const menu = root.querySelector("#fab-menu-1");
    expect(menu.getAttribute("role")).toBe("menu");
    menu.querySelectorAll("[data-dx-fabmenu-item]").forEach((item) => {
      expect(item.getAttribute("role")).toBe("menuitem");
      expect(item.getAttribute("aria-label")).toBeTruthy();
    });
    expect(root.querySelector('[data-dx-text="Export"]').getAttribute("aria-disabled")).toBe("true");
  });
});
