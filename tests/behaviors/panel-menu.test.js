import { describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

describe("panel-menu", () => {
  const panelFixture = (attrs = "", body = defaultBody) => {
    const root = fixture(`
      <nav class="dx-panelmenu" data-dx-panelmenu ${attrs} aria-label="Panel menu">
        <div class="dx-panelmenu-list" role="presentation" data-dx-panelmenu-list>
          ${body}
        </div>
      </nav>`);
    window.dxUikit.panelmenu.init(root);
    return root;
  };

  const defaultBody = `
    <div data-dx-panelmenu-item-wrapper>
      <button type="button" class="dx-panelmenu-trigger" data-dx-panelmenu-trigger data-dx-panelmenu-item data-dx-text="Dashboard" data-dx-value="dashboard" tabindex="0"><span class="dx-panelmenu-text">Dashboard</span></button>
    </div>
    <div data-dx-panelmenu-item-wrapper>
      <button type="button" class="dx-panelmenu-trigger" data-dx-panelmenu-trigger data-dx-panelmenu-item data-dx-text="Reports" data-dx-value="reports" aria-haspopup="menu" aria-expanded="false" aria-controls="pm-submenu-1" tabindex="0"><span class="dx-panelmenu-text">Reports</span><span class="dx-panelmenu-caret" aria-hidden="true">▾</span></button>
      <div id="pm-submenu-1" role="menu" class="dx-panelmenu-submenu" data-dx-panelmenu-submenu hidden>
        <div role="menuitem" class="dx-panelmenu-submenu-item" data-dx-panelmenu-item data-dx-text="Monthly" data-dx-value="monthly" tabindex="-1">Monthly</div>
        <div role="menuitem" class="dx-panelmenu-submenu-item" data-dx-panelmenu-item data-dx-text="Annual" data-dx-value="annual" tabindex="-1">Annual</div>
        <div role="menuitem" class="dx-panelmenu-submenu-item" data-dx-panelmenu-item data-dx-text="Custom" data-dx-value="custom" aria-disabled="true" tabindex="-1">Custom</div>
      </div>
    </div>
    <div data-dx-panelmenu-item-wrapper>
      <button type="button" class="dx-panelmenu-trigger" data-dx-panelmenu-trigger data-dx-panelmenu-item data-dx-text="Settings" data-dx-value="settings" aria-haspopup="menu" aria-expanded="false" aria-controls="pm-submenu-2" tabindex="0"><span class="dx-panelmenu-text">Settings</span><span class="dx-panelmenu-caret" aria-hidden="true">▾</span></button>
      <div id="pm-submenu-2" role="menu" class="dx-panelmenu-submenu" data-dx-panelmenu-submenu hidden>
        <div role="menuitem" class="dx-panelmenu-submenu-item" data-dx-panelmenu-item data-dx-text="General" data-dx-value="general" tabindex="-1">General</div>
        <div role="menuitem" class="dx-panelmenu-submenu-item" data-dx-panelmenu-item data-dx-text="Security" data-dx-value="security" tabindex="-1">Security</div>
      </div>
    </div>`;

  it("expands and collapses a group on trigger click", () => {
    const root = panelFixture();
    const trigger = root.querySelector('[data-dx-text="Reports"]');
    const panel = root.querySelector("#pm-submenu-1");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(panel.hidden).toBe(true);
    trigger.click();
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(panel.hidden).toBe(false);
    trigger.click();
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(panel.hidden).toBe(true);
  });

  it("collapses the other root when opening a new one (single-expand)", () => {
    const root = panelFixture();
    const reports = root.querySelector('[data-dx-text="Reports"]');
    const settings = root.querySelector('[data-dx-text="Settings"]');
    reports.click();
    settings.click();
    expect(reports.getAttribute("aria-expanded")).toBe("false");
    expect(root.querySelector("#pm-submenu-1").hidden).toBe(true);
    expect(settings.getAttribute("aria-expanded")).toBe("true");
    expect(root.querySelector("#pm-submenu-2").hidden).toBe(false);
  });

  it("keeps both roots open when data-dx-multiple is set", () => {
    const root = panelFixture("data-dx-multiple");
    root.querySelector('[data-dx-text="Reports"]').click();
    root.querySelector('[data-dx-text="Settings"]').click();
    expect(root.querySelector('[data-dx-text="Reports"]').getAttribute("aria-expanded")).toBe("true");
    expect(root.querySelector('[data-dx-text="Settings"]').getAttribute("aria-expanded")).toBe("true");
    expect(root.querySelector("#pm-submenu-1").hidden).toBe(false);
    expect(root.querySelector("#pm-submenu-2").hidden).toBe(false);
  });

  it("dispatches dx:panelmenu-click with text, value and path on leaf activation", () => {
    const root = panelFixture();
    const listener = vi.fn();
    root.addEventListener("dx:panelmenu-click", listener);
    root.querySelector('[data-dx-text="Reports"]').click();
    root.querySelector('[data-dx-text="Monthly"]').click();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].detail).toEqual({ text: "Monthly", value: "monthly" });
    root.querySelector('[data-dx-text="Dashboard"]').click();
    expect(listener.mock.calls[1][0].detail).toEqual({ text: "Dashboard", value: "dashboard" });
  });

  it("ignores clicks on disabled items", () => {
    const root = panelFixture();
    const listener = vi.fn();
    root.addEventListener("dx:panelmenu-click", listener);
    root.querySelector('[data-dx-text="Reports"]').click();
    root.querySelector('[data-dx-text="Custom"]').click();
    expect(listener).not.toHaveBeenCalled();
    expect(root.querySelector('[data-dx-text="Reports"]').getAttribute("aria-expanded")).toBe("true");
  });

  it("moves focus with ArrowUp/ArrowDown and Home/End, skipping disabled items", () => {
    const root = fixture(`
      <nav data-dx-panelmenu aria-label="Panel menu">
        <button type="button" data-dx-panelmenu-item data-dx-text="Dashboard" tabindex="0">Dashboard</button>
        <button type="button" data-dx-panelmenu-item data-dx-text="Reports" aria-disabled="true" disabled tabindex="-1">Reports</button>
        <button type="button" data-dx-panelmenu-item data-dx-text="Settings" tabindex="0">Settings</button>
      </nav>`);
    window.dxUikit.panelmenu.init(root);
    const dashboard = root.querySelector('[data-dx-text="Dashboard"]');
    const settings = root.querySelector('[data-dx-text="Settings"]');
    dashboard.focus();
    dashboard.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(settings);
    root.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(dashboard);
    root.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(settings);
    root.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(dashboard);
    root.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(settings);
  });

  it("moves focus into an open submenu with ArrowDown, skipping disabled children", () => {
    const root = panelFixture();
    const reports = root.querySelector('[data-dx-text="Reports"]');
    reports.click();
    reports.focus();
    reports.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(root.querySelector('[data-dx-text="Monthly"]'));
    root.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(root.querySelector('[data-dx-text="Annual"]'));
    root.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(root.querySelector('[data-dx-text="Monthly"]'));
  });

  it("collapses the expanded root with Escape and returns focus to it", () => {
    const root = panelFixture();
    const reports = root.querySelector('[data-dx-text="Reports"]');
    const panel = root.querySelector("#pm-submenu-1");
    reports.click();
    expect(panel.hidden).toBe(false);
    root.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    expect(reports.getAttribute("aria-expanded")).toBe("false");
    expect(panel.hidden).toBe(true);
    expect(document.activeElement).toBe(reports);
  });

  it("keeps only the first root expanded when the markup has several open", () => {
    const body = `
      <div data-dx-panelmenu-item-wrapper>
        <button type="button" data-dx-panelmenu-item data-dx-text="Projects" aria-haspopup="menu" aria-expanded="true" aria-controls="pm-open-0" tabindex="0">Projects</button>
        <div id="pm-open-0" role="menu" data-dx-panelmenu-submenu>
          <div role="menuitem" data-dx-panelmenu-item data-dx-text="Active" tabindex="-1">Active</div>
        </div>
      </div>
      <div data-dx-panelmenu-item-wrapper>
        <button type="button" data-dx-panelmenu-item data-dx-text="Team" aria-haspopup="menu" aria-expanded="true" aria-controls="pm-open-1" tabindex="0">Team</button>
        <div id="pm-open-1" role="menu" data-dx-panelmenu-submenu>
          <div role="menuitem" data-dx-panelmenu-item data-dx-text="Members" tabindex="-1">Members</div>
        </div>
      </div>`;
    const root = panelFixture("", body);
    expect(root.querySelector('[data-dx-text="Projects"]').getAttribute("aria-expanded")).toBe("true");
    expect(root.querySelector("#pm-open-0").hidden).toBe(false);
    expect(root.querySelector('[data-dx-text="Team"]').getAttribute("aria-expanded")).toBe("false");
    expect(root.querySelector("#pm-open-1").hidden).toBe(true);
  });

  it("wires ARIA on the nav, triggers and submenus", () => {
    const root = panelFixture();
    expect(root.getAttribute("aria-label")).toBe("Panel menu");
    const trigger = root.querySelector('[data-dx-text="Reports"]');
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    expect(trigger.getAttribute("aria-controls")).toBe("pm-submenu-1");
    const panel = root.querySelector("#pm-submenu-1");
    expect(panel.getAttribute("role")).toBe("menu");
    panel.querySelectorAll("[data-dx-panelmenu-item]").forEach((item) => {
      expect(item.getAttribute("role")).toBe("menuitem");
    });
    expect(root.querySelector('[data-dx-text="Dashboard"]').hasAttribute("aria-expanded")).toBe(false);
  });
});
