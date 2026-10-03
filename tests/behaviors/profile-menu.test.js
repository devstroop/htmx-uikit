import { describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

describe("profile-menu", () => {
  const profileFixture = () => {
    const root = fixture(`
      <div class="dx-profilemenu" data-dx-profilemenu>
        <nav aria-label="Profile menu">
          <button type="button" class="dx-profilemenu-trigger" data-dx-profilemenu-trigger aria-haspopup="menu" aria-expanded="false" aria-controls="pm-menu-1" aria-label="Profile menu">
            <span class="dx-profilemenu-trigger-content">
              <span class="dx-profilemenu-avatar" aria-hidden="true">JD</span>
              <span>jane.doe@example.com</span>
            </span>
          </button>
          <div id="pm-menu-1" role="menu" class="dx-profilemenu-menu" data-dx-profilemenu-menu aria-label="Profile menu" hidden>
            <div role="menuitem" class="dx-profilemenu-item" data-dx-profilemenu-item data-dx-text="My profile" data-dx-path="/profile" tabindex="-1">My profile</div>
            <div role="menuitem" class="dx-profilemenu-item" data-dx-profilemenu-item data-dx-text="Settings" data-dx-path="/settings" tabindex="-1">Settings</div>
            <div role="menuitem" class="dx-profilemenu-item" data-dx-profilemenu-item data-dx-text="Admin" aria-disabled="true" tabindex="-1">Admin</div>
            <div role="menuitem" class="dx-profilemenu-item" data-dx-profilemenu-item data-dx-text="Sign out" data-dx-path="/logout" tabindex="-1">Sign out</div>
          </div>
        </nav>
      </div>`);
    window.dxUikit.profilemenu.init(root);
    return root;
  };

  it("toggles the dropdown on trigger click", () => {
    const root = profileFixture();
    const trigger = root.querySelector("[data-dx-profilemenu-trigger]");
    const menu = root.querySelector("[data-dx-profilemenu-menu]");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(menu.hidden).toBe(true);
    trigger.click();
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(menu.hidden).toBe(false);
    trigger.click();
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(menu.hidden).toBe(true);
  });

  it("dispatches dx:profilemenu-click, closes and refocuses the trigger", () => {
    const root = profileFixture();
    const listener = vi.fn();
    root.addEventListener("dx:profilemenu-click", listener);
    const trigger = root.querySelector("[data-dx-profilemenu-trigger]");
    trigger.click();
    root.querySelector('[data-dx-text="My profile"]').click();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].detail).toEqual({ text: "My profile", path: "/profile" });
    expect(root.querySelector("[data-dx-profilemenu-menu]").hidden).toBe(true);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(trigger);
  });

  it("ignores clicks on disabled items and keeps the menu open", () => {
    const root = profileFixture();
    const listener = vi.fn();
    root.addEventListener("dx:profilemenu-click", listener);
    root.querySelector("[data-dx-profilemenu-trigger]").click();
    root.querySelector('[data-dx-text="Admin"]').click();
    expect(listener).not.toHaveBeenCalled();
    expect(root.querySelector("[data-dx-profilemenu-menu]").hidden).toBe(false);
  });

  it("opens with ArrowDown from the trigger and focuses the first item", () => {
    const root = profileFixture();
    const trigger = root.querySelector("[data-dx-profilemenu-trigger]");
    trigger.focus();
    trigger.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true }));
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(root.querySelector("[data-dx-profilemenu-menu]").hidden).toBe(false);
    expect(document.activeElement).toBe(root.querySelector('[data-dx-text="My profile"]'));
  });

  it("opens with Enter or Space while closed", () => {
    const root = profileFixture();
    const trigger = root.querySelector("[data-dx-profilemenu-trigger]");
    trigger.focus();
    const enter = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
    trigger.dispatchEvent(enter);
    expect(enter.defaultPrevented).toBe(true);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    trigger.click();
    trigger.focus();
    const space = new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true });
    trigger.dispatchEvent(space);
    expect(space.defaultPrevented).toBe(true);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
  });

  it("moves focus with ArrowUp/ArrowDown, Home and End", () => {
    const root = profileFixture();
    const trigger = root.querySelector("[data-dx-profilemenu-trigger]");
    trigger.click();
    const first = root.querySelector('[data-dx-text="My profile"]');
    const last = root.querySelector('[data-dx-text="Sign out"]');
    first.focus();
    first.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(root.querySelector('[data-dx-text="Settings"]'));
    root.querySelector('[data-dx-text="Settings"]').dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(last);
    last.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(first);
    first.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(last);
  });

  it("closes with Escape and returns focus to the trigger", () => {
    const root = profileFixture();
    const trigger = root.querySelector("[data-dx-profilemenu-trigger]");
    trigger.click();
    const first = root.querySelector('[data-dx-text="My profile"]');
    first.focus();
    first.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    expect(root.querySelector("[data-dx-profilemenu-menu]").hidden).toBe(true);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(trigger);
  });

  it("closes when clicking outside the menu", () => {
    const root = profileFixture();
    const trigger = root.querySelector("[data-dx-profilemenu-trigger]");
    trigger.click();
    document.body.insertAdjacentHTML("beforeend", '<button id="outside">outside</button>');
    document.querySelector("#outside").click();
    expect(root.querySelector("[data-dx-profilemenu-menu]").hidden).toBe(true);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("wires ARIA on the trigger, menu and items", () => {
    const root = profileFixture();
    const trigger = root.querySelector("[data-dx-profilemenu-trigger]");
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    expect(trigger.getAttribute("aria-controls")).toBe("pm-menu-1");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    const menu = root.querySelector("#pm-menu-1");
    expect(menu.getAttribute("role")).toBe("menu");
    expect(menu.hidden).toBe(true);
    menu.querySelectorAll("[data-dx-profilemenu-item]").forEach((item) => {
      expect(item.getAttribute("role")).toBe("menuitem");
    });
    expect(menu.querySelector('[data-dx-text="Admin"]').getAttribute("aria-disabled")).toBe("true");
  });
});
