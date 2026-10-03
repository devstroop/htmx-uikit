import { describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

describe("breadcrumb", () => {
  const breadcrumbFixture = () => {
    const root = fixture(`
      <nav class="dx-breadcrumb" data-dx-breadcrumb aria-label="Breadcrumb">
        <ol class="dx-breadcrumb-list" data-dx-breadcrumb-list>
          <li class="dx-breadcrumb-item">
            <a href="/" class="dx-breadcrumb-link" data-dx-breadcrumb-link data-dx-text="Home" data-dx-path="/">Home</a>
            <span class="dx-breadcrumb-separator" aria-hidden="true">/</span>
          </li>
          <li class="dx-breadcrumb-item">
            <span class="dx-breadcrumb-link dx-breadcrumb-link--disabled" data-dx-breadcrumb-link data-dx-text="Reports" aria-disabled="true" tabindex="-1">Reports</span>
            <span class="dx-breadcrumb-separator" aria-hidden="true">/</span>
          </li>
          <li class="dx-breadcrumb-item">
            <a href="/products" class="dx-breadcrumb-link" data-dx-breadcrumb-link data-dx-text="Products" data-dx-path="/products">Products</a>
            <span class="dx-breadcrumb-separator" aria-hidden="true">/</span>
          </li>
          <li class="dx-breadcrumb-item">
            <span class="dx-breadcrumb-current" data-dx-breadcrumb-current data-dx-text="Laptops" aria-current="page">Laptops</span>
          </li>
        </ol>
      </nav>`);
    window.dxUikit.breadcrumb.init(root);
    return root;
  };

  const quietNav = (link) => link.addEventListener("click", (e) => e.preventDefault());

  it("dispatches dx:breadcrumb-click with text and path when a link is activated", () => {
    const root = breadcrumbFixture();
    const listener = vi.fn();
    root.addEventListener("dx:breadcrumb-click", listener);
    const link = root.querySelector('[data-dx-text="Products"]');
    quietNav(link);
    link.click();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].detail).toEqual({ text: "Products", path: "/products" });
  });

  it("does not dispatch for the current page item without a path", () => {
    const root = breadcrumbFixture();
    const listener = vi.fn();
    root.addEventListener("dx:breadcrumb-click", listener);
    root.querySelector("[data-dx-breadcrumb-current]").click();
    expect(listener).not.toHaveBeenCalled();
  });

  it("does not dispatch for disabled items", () => {
    const root = breadcrumbFixture();
    const listener = vi.fn();
    root.addEventListener("dx:breadcrumb-click", listener);
    root.querySelector('[data-dx-text="Reports"]').click();
    expect(listener).not.toHaveBeenCalled();
  });

  it("blocks Enter/Space activation on disabled items but allows enabled ones", () => {
    const root = breadcrumbFixture();
    const disabled = root.querySelector('[data-dx-text="Reports"]');
    const blocked = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
    disabled.dispatchEvent(blocked);
    expect(blocked.defaultPrevented).toBe(true);
    const enabled = root.querySelector('[data-dx-text="Home"]');
    const allowed = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
    enabled.dispatchEvent(allowed);
    expect(allowed.defaultPrevented).toBe(false);
    const space = new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true });
    disabled.dispatchEvent(space);
    expect(space.defaultPrevented).toBe(true);
  });

  it("wires ARIA: landmark label, aria-current, hidden separators and disabled item", () => {
    const root = breadcrumbFixture();
    expect(root.tagName).toBe("NAV");
    expect(root.getAttribute("aria-label")).toBe("Breadcrumb");
    expect(root.querySelector("ol")).toBeTruthy();
    const separators = root.querySelectorAll(".dx-breadcrumb-separator");
    expect(separators.length).toBeGreaterThan(0);
    separators.forEach((sep) => expect(sep.getAttribute("aria-hidden")).toBe("true"));
    const current = root.querySelector("[data-dx-breadcrumb-current]");
    expect(current.getAttribute("aria-current")).toBe("page");
    expect(current.tagName).toBe("SPAN");
    const disabled = root.querySelector('[data-dx-text="Reports"]');
    expect(disabled.getAttribute("aria-disabled")).toBe("true");
    expect(disabled.tabIndex).toBe(-1);
    root.querySelectorAll("[data-dx-breadcrumb-link]").forEach((link) => {
      if (link.tagName === "A") expect(link.getAttribute("href")).toBeTruthy();
    });
  });
});
