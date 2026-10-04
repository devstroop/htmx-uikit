import { describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

const ITEMS = [
  { text: "Cut", value: "cut" },
  { text: "Copy", value: "copy" },
  { text: "Paste", value: "paste", disabled: true },
];

function popup() {
  return document.querySelector(".dx-contextmenu-popup");
}

function key(name, extra = {}) {
  return new KeyboardEvent("keydown", { key: name, bubbles: true, cancelable: true, ...extra });
}

describe("context menu", () => {
  it("open builds a labelled menu and focuses the first item", () => {
    window.dxContextMenu.open(120, 80, { items: ITEMS });
    const menu = popup();
    expect(menu).not.toBeNull();
    expect(menu.getAttribute("role")).toBe("menu");
    expect(menu.getAttribute("aria-label")).toBe("Context menu");
    expect(menu.querySelectorAll('[role="menuitem"]').length).toBe(3);
    expect(document.activeElement?.textContent).toBe("Cut");
    expect(window.dxContextMenu.isOpen).toBe(true);
  });

  it("arrows cycle and skip disabled, Enter activates and closes", () => {
    const onClick = vi.fn();
    window.dxContextMenu.open(120, 80, { items: ITEMS, onClick });
    const selected = [];
    popup().addEventListener("dx:contextmenu-select", (e) =>
      selected.push(e.detail)
    );
    document.dispatchEvent(key("ArrowDown"));
    expect(document.activeElement?.textContent).toBe("Copy");
    document.dispatchEvent(key("ArrowDown"));
    // Paste is disabled: wrap lands back on Cut.
    expect(document.activeElement?.textContent).toBe("Cut");
    document.dispatchEvent(key("ArrowUp"));
    expect(document.activeElement?.textContent).toBe("Copy");
    document.dispatchEvent(key("Enter"));
    expect(onClick).toHaveBeenCalledWith({ value: "copy", text: "Copy" });
    expect(selected).toEqual([{ value: "copy", text: "Copy" }]);
    expect(window.dxContextMenu.isOpen).toBe(false);
  });

  it("Escape closes and restores focus to the invoker", () => {
    fixture(
      '<button type="button" id="invoker">Right-click me</button>'
    );
    const invoker = document.querySelector("#invoker");
    invoker.focus();
    window.dxContextMenu.open(10, 10, { items: ITEMS });
    document.dispatchEvent(key("Escape"));
    expect(window.dxContextMenu.isOpen).toBe(false);
    expect(document.activeElement).toBe(invoker);
  });

  it("outside pointerdown closes without restoring focus", () => {
    fixture('<button type="button" id="invoker">X</button>');
    document.querySelector("#invoker").focus();
    window.dxContextMenu.open(10, 10, { items: ITEMS });
    document.dispatchEvent(
      new PointerEvent("pointerdown", { bubbles: true })
    );
    expect(window.dxContextMenu.isOpen).toBe(false);
  });

  it("menu selector clones the referenced element", () => {
    fixture(
      `<div data-dx-contextmenu-menu="#tpl">area</div><div id="tpl" hidden><p>tpl body</p></div>`
    );
    const trigger = document.querySelector("[data-dx-contextmenu-menu]");
    trigger.dispatchEvent(
      new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
        clientX: 40,
        clientY: 30,
      })
    );
    expect(popup().textContent).toContain("tpl body");
    window.dxContextMenu.close();
  });

  it("content mode renders arbitrary markup", () => {
    window.dxContextMenu.open(10, 10, { content: "<p>custom</p>" });
    expect(popup().textContent).toContain("custom");
    expect(popup().querySelectorAll('[role="menuitem"]').length).toBe(0);
    window.dxContextMenu.close();
  });

  it("trigger attribute opens at the cursor with parsed items", () => {
    fixture(
      `<div data-dx-contextmenu='[{"text": "Cut", "value": "cut"}]'>area</div>`
    );
    const trigger = document.querySelector("[data-dx-contextmenu]");
    trigger.dispatchEvent(
      new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
        clientX: 300,
        clientY: 200,
      })
    );
    const menu = popup();
    expect(menu).not.toBeNull();
    expect(menu.querySelector('[role="menuitem"]').textContent).toBe("Cut");
  });
});
