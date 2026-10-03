import { describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

describe("menu", () => {
  const menuFixture = (attrs = "") => {
    const root = fixture(`
      <nav class="dx-menu" data-dx-menu ${attrs} aria-label="Menu">
        <div class="dx-menu-menubar" role="menubar" aria-label="Menu" data-dx-menu-menubar>
          <div class="dx-menu-item-wrapper">
            <button type="button" role="menuitem" class="dx-menu-item" data-dx-menu-item data-dx-text="Home" data-dx-value="home" data-dx-path="/" aria-current="page" tabindex="0"><span class="dx-menu-text">Home</span></button>
          </div>
          <div class="dx-menu-item-wrapper">
            <button type="button" role="menuitem" class="dx-menu-item" data-dx-menu-item data-dx-text="Products" data-dx-value="products" aria-haspopup="menu" aria-expanded="false" aria-controls="menu-submenu-1" tabindex="0"><span class="dx-menu-text">Products</span><span class="dx-menu-caret" aria-hidden="true">▾</span></button>
            <div id="menu-submenu-1" role="menu" class="dx-menu-submenu" data-dx-menu-submenu aria-label="Products" hidden>
              <button type="button" role="menuitem" class="dx-menu-submenu-item" data-dx-menu-item data-dx-text="Laptops" data-dx-value="laptops" data-dx-path="/products/laptops" tabindex="-1">Laptops</button>
              <button type="button" role="menuitem" class="dx-menu-submenu-item" data-dx-menu-item data-dx-text="Phones" data-dx-value="phones" data-dx-path="/products/phones" tabindex="-1">Phones</button>
            </div>
          </div>
          <div class="dx-menu-item-wrapper">
            <button type="button" role="menuitem" class="dx-menu-item" data-dx-menu-item data-dx-text="About" data-dx-value="about" data-dx-path="/about" tabindex="0"><span class="dx-menu-text">About</span></button>
          </div>
          <div class="dx-menu-item-wrapper">
            <button type="button" role="menuitem" class="dx-menu-item" data-dx-menu-item data-dx-text="Settings" data-dx-value="settings" aria-disabled="true" disabled tabindex="-1"><span class="dx-menu-text">Settings</span></button>
          </div>
        </div>
      </nav>`);
    window.dxUikit.menu.init(root);
    return root;
  };

  const flatMenuFixture = () => {
    const root = fixture(`
      <nav data-dx-menu aria-label="Menu">
        <div role="menubar" data-dx-menu-menubar>
          <button type="button" role="menuitem" data-dx-menu-item data-dx-text="One">One</button>
          <button type="button" role="menuitem" data-dx-menu-item data-dx-text="Two" aria-disabled="true" disabled>Two</button>
          <button type="button" role="menuitem" data-dx-menu-item data-dx-text="Three">Three</button>
        </div>
      </nav>`);
    window.dxUikit.menu.init(root);
    return root;
  };

  it("dispatches dx:menu-click with text, value and path on leaf activation", () => {
    const root = menuFixture();
    const listener = vi.fn();
    root.addEventListener("dx:menu-click", listener);
    root.querySelector('[data-dx-text="Home"] .dx-menu-text').click();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].detail).toEqual({ text: "Home", value: "home", path: "/" });
  });

  it("toggles aria-expanded and the submenu on trigger click", () => {
    const root = menuFixture();
    const trigger = root.querySelector('[data-dx-text="Products"]');
    const submenu = root.querySelector("#menu-submenu-1");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(submenu.hidden).toBe(true);
    trigger.click();
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(submenu.hidden).toBe(false);
    trigger.click();
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(submenu.hidden).toBe(true);
  });

  it("keeps only one submenu open at a time", () => {
    const root = fixture(`
      <nav data-dx-menu aria-label="Menu">
        <div role="menubar" data-dx-menu-menubar>
          <button type="button" role="menuitem" data-dx-menu-item data-dx-text="Products" aria-haspopup="menu" aria-expanded="false" aria-controls="sub-products" tabindex="0">Products</button>
          <div id="sub-products" role="menu" data-dx-menu-submenu hidden>
            <button type="button" role="menuitem" data-dx-menu-item data-dx-text="Laptops" tabindex="-1">Laptops</button>
          </div>
          <button type="button" role="menuitem" data-dx-menu-item data-dx-text="Services" aria-haspopup="menu" aria-expanded="false" aria-controls="sub-services" tabindex="0">Services</button>
          <div id="sub-services" role="menu" data-dx-menu-submenu hidden>
            <button type="button" role="menuitem" data-dx-menu-item data-dx-text="Hosting" tabindex="-1">Hosting</button>
          </div>
        </div>
      </nav>`);
    window.dxUikit.menu.init(root);
    const products = root.querySelector('[data-dx-text="Products"]');
    const services = root.querySelector('[data-dx-text="Services"]');
    products.click();
    services.click();
    expect(products.getAttribute("aria-expanded")).toBe("false");
    expect(root.querySelector("#sub-products").hidden).toBe(true);
    expect(services.getAttribute("aria-expanded")).toBe("true");
    expect(root.querySelector("#sub-services").hidden).toBe(false);
  });

  it("opens the submenu on hover for horizontal menus but not vertical ones", () => {
    const horizontal = menuFixture();
    const hTrigger = horizontal.querySelector('[data-dx-text="Products"]');
    hTrigger.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    expect(hTrigger.getAttribute("aria-expanded")).toBe("true");
    expect(horizontal.querySelector("#menu-submenu-1").hidden).toBe(false);

    const vertical = menuFixture('data-dx-orientation="vertical"');
    const vTrigger = vertical.querySelector('[data-dx-text="Products"]');
    vTrigger.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    expect(vTrigger.getAttribute("aria-expanded")).toBe("false");
    expect(vertical.querySelector("#menu-submenu-1").hidden).toBe(true);
  });

  it("moves focus with ArrowLeft/ArrowRight and skips disabled items", () => {
    const root = flatMenuFixture();
    const [one, , three] = root.querySelectorAll("[data-dx-menu-item]");
    one.focus();
    one.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(three);
    three.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(one);
    one.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(three);
    three.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(one);
  });

  it("opens the submenu with ArrowDown and closes it with Escape", () => {
    const root = menuFixture();
    const trigger = root.querySelector('[data-dx-text="Products"]');
    const submenu = root.querySelector("#menu-submenu-1");
    const laptops = root.querySelector('[data-dx-text="Laptops"]');
    const phones = root.querySelector('[data-dx-text="Phones"]');
    trigger.focus();
    trigger.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true }));
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(submenu.hidden).toBe(false);
    expect(document.activeElement).toBe(laptops);
    laptops.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(phones);
    phones.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    expect(submenu.hidden).toBe(true);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("ignores clicks on disabled items", () => {
    const root = menuFixture();
    const listener = vi.fn();
    root.addEventListener("dx:menu-click", listener);
    root.querySelector('[data-dx-text="Settings"]').click();
    expect(listener).not.toHaveBeenCalled();
  });

  it("closes open submenus when clicking outside the menu", () => {
    const root = menuFixture();
    const trigger = root.querySelector('[data-dx-text="Products"]');
    const submenu = root.querySelector("#menu-submenu-1");
    trigger.click();
    expect(submenu.hidden).toBe(false);
    document.body.insertAdjacentHTML("beforeend", '<button id="outside">outside</button>');
    document.querySelector("#outside").click();
    expect(submenu.hidden).toBe(true);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("wires ARIA roles, controls and current-page state", () => {
    const root = menuFixture();
    expect(root.getAttribute("aria-label")).toBe("Menu");
    expect(root.querySelector('[role="menubar"]')).toBeTruthy();
    const items = root.querySelectorAll("[data-dx-menu-item]");
    items.forEach((item) => expect(item.getAttribute("role")).toBe("menuitem"));
    const trigger = root.querySelector('[data-dx-text="Products"]');
    expect(trigger.getAttribute("aria-controls")).toBe("menu-submenu-1");
    const submenu = root.querySelector("#menu-submenu-1");
    expect(submenu.getAttribute("role")).toBe("menu");
    expect(submenu.getAttribute("aria-label")).toBe("Products");
    expect(root.querySelector('[data-dx-text="Home"]').getAttribute("aria-current")).toBe("page");
    const disabled = root.querySelector('[data-dx-text="Settings"]');
    expect(disabled.getAttribute("aria-disabled")).toBe("true");
    expect(disabled.tabIndex).toBe(-1);
  });
});
