import { describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

describe("splitbutton", () => {
  const splitbuttonFixture = (extra = "") =>
    fixture(`
      <div class="dx-splitbutton dx-splitbutton--md" data-dx-splitbutton ${extra}>
        <button type="button" class="dx-splitbutton__action" data-dx-splitbutton-action>Save</button>
        <button type="button" class="dx-splitbutton__caret" aria-label="More actions"
          aria-haspopup="menu" aria-expanded="false" aria-controls="sb1-menu"
          data-dx-splitbutton-caret>▾</button>
        <div role="menu" id="sb1-menu" class="dx-splitbutton__menu" aria-activedescendant="sb1-item-1"
          data-dx-splitbutton-menu hidden>
          <div role="menuitem" id="sb1-item-1" class="dx-splitbutton__item"
            data-dx-splitbutton-item data-dx-splitbutton-action="save-as">Save as…</div>
          <div role="menuitem" id="sb1-item-2" class="dx-splitbutton__item"
            data-dx-splitbutton-item data-dx-splitbutton-action="duplicate">Duplicate</div>
          <div role="menuitem" id="sb1-item-3" class="dx-splitbutton__item dx-splitbutton__item--disabled"
            data-dx-splitbutton-item data-dx-splitbutton-action="archive"
            aria-disabled="true">Archive (unavailable)</div>
          <div role="menuitem" id="sb1-item-4" class="dx-splitbutton__item dx-splitbutton__item--danger"
            data-dx-splitbutton-item data-dx-splitbutton-action="delete"
            data-dx-splitbutton-danger>Delete</div>
        </div>
      </div>`);

  const key = (el, k) =>
    el.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true }));

  const parts = (root) => ({
    action: root.querySelector("[data-dx-splitbutton-action].dx-splitbutton__action"),
    caret: root.querySelector("[data-dx-splitbutton-caret]"),
    menu: root.querySelector("[data-dx-splitbutton-menu]"),
  });

  it("renders the primary button and a caret with menu wiring", () => {
    const root = splitbuttonFixture();
    const { action, caret, menu } = parts(root);
    expect(root.querySelectorAll("button")).toHaveLength(2);
    expect(action.textContent).toContain("Save");
    expect(caret.getAttribute("aria-haspopup")).toBe("menu");
    expect(caret.getAttribute("aria-expanded")).toBe("false");
    expect(caret.getAttribute("aria-controls")).toBe(menu.id);
    expect(menu.hidden).toBe(true);
    expect(menu.getAttribute("role")).toBe("menu");
    expect(root.querySelectorAll('[role="menuitem"]')).toHaveLength(4);
  });

  it("opens the menu on caret click", () => {
    const root = splitbuttonFixture();
    const { caret, menu } = parts(root);
    caret.click();
    expect(menu.hidden).toBe(false);
    expect(caret.getAttribute("aria-expanded")).toBe("true");
    expect(menu.getAttribute("aria-activedescendant")).toBe("sb1-item-1");
  });

  it("keeps the menu closed when the primary button is clicked", () => {
    const root = splitbuttonFixture();
    const listener = vi.fn();
    root.addEventListener("dx:splitbutton-activate", listener);
    const { action, menu } = parts(root);
    action.click();
    expect(menu.hidden).toBe(true);
    expect(listener).not.toHaveBeenCalled();
  });

  it("activates an item on click, fires dx:splitbutton-activate and closes", () => {
    const root = splitbuttonFixture();
    const listener = vi.fn();
    root.addEventListener("dx:splitbutton-activate", listener);
    const { caret, menu } = parts(root);
    caret.click();
    menu.querySelector('[data-dx-splitbutton-action="duplicate"]').click();
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: { key: "duplicate" } }));
    expect(menu.hidden).toBe(true);
    expect(caret.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(caret);
  });

  it("opens with ArrowDown and navigates with arrows, Enter activates", () => {
    const root = splitbuttonFixture();
    const listener = vi.fn();
    root.addEventListener("dx:splitbutton-activate", listener);
    const { caret, menu } = parts(root);
    key(root, "ArrowDown");
    expect(menu.hidden).toBe(false);
    expect(caret.getAttribute("aria-expanded")).toBe("true");
    key(root, "ArrowDown");
    expect(menu.getAttribute("aria-activedescendant")).toBe("sb1-item-2");
    key(root, "ArrowUp");
    expect(menu.getAttribute("aria-activedescendant")).toBe("sb1-item-1");
    key(root, "End");
    expect(menu.getAttribute("aria-activedescendant")).toBe("sb1-item-4");
    key(root, "Home");
    expect(menu.getAttribute("aria-activedescendant")).toBe("sb1-item-1");
    key(root, "Enter");
    expect(menu.hidden).toBe(true);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: { key: "save-as" } }));
    expect(document.activeElement).toBe(caret);
  });

  it("closes on Escape and returns focus to the caret", () => {
    const root = splitbuttonFixture();
    const { caret, menu } = parts(root);
    caret.click();
    key(root, "Escape");
    expect(menu.hidden).toBe(true);
    expect(caret.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(caret);
  });

  it("skips disabled items during navigation and click", () => {
    const root = splitbuttonFixture();
    const listener = vi.fn();
    root.addEventListener("dx:splitbutton-activate", listener);
    const { caret, menu } = parts(root);
    caret.click();
    key(root, "End");
    expect(menu.getAttribute("aria-activedescendant")).toBe("sb1-item-4");
    const archive = menu.querySelector('[data-dx-splitbutton-action="archive"]');
    expect(archive.getAttribute("aria-disabled")).toBe("true");
    archive.click();
    expect(listener).not.toHaveBeenCalled();
    expect(menu.hidden).toBe(false);
  });

  it("closes the menu on an outside mousedown", () => {
    const root = splitbuttonFixture();
    const { caret, menu } = parts(root);
    caret.click();
    document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    expect(menu.hidden).toBe(true);
    expect(caret.getAttribute("aria-expanded")).toBe("false");
  });

  it("never opens the menu when the control is disabled", () => {
    const root = splitbuttonFixture();
    const { action, caret, menu } = parts(root);
    action.disabled = true;
    caret.disabled = true;
    caret.click();
    key(root, "ArrowDown");
    expect(menu.hidden).toBe(true);
    expect(caret.getAttribute("aria-expanded")).toBe("false");
  });

  it("marks the danger item with the danger class", () => {
    const root = splitbuttonFixture();
    const danger = root.querySelector('[data-dx-splitbutton-action="delete"]');
    expect(danger.classList.contains("dx-splitbutton__item--danger")).toBe(true);
    expect(danger.hasAttribute("data-dx-splitbutton-danger")).toBe(true);
  });

  it("keeps the md size class by default and accepts the sm class", () => {
    expect(splitbuttonFixture().getAttribute("class")).toContain("dx-splitbutton--md");
    const sm = fixture(`
      <div class="dx-splitbutton dx-splitbutton--sm" data-dx-splitbutton>
        <button type="button" class="dx-splitbutton__action" data-dx-splitbutton-action>Share</button>
        <button type="button" class="dx-splitbutton__caret" aria-haspopup="menu" aria-expanded="false"
          data-dx-splitbutton-caret>▾</button>
        <div role="menu" class="dx-splitbutton__menu" data-dx-splitbutton-menu hidden>
          <div role="menuitem" class="dx-splitbutton__item" data-dx-splitbutton-item
            data-dx-splitbutton-action="link">Copy link</div>
        </div>
      </div>`);
    expect(sm.getAttribute("class")).toContain("dx-splitbutton--sm");
  });
});
