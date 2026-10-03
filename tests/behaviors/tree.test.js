import { describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

describe("tree", () => {
  const treeFixture = (mode = "single") => {
    const root = fixture(`
      <div class="dx-tree" data-dx-tree data-dx-selection-mode="${mode}" role="tree" aria-label="Tree" aria-multiselectable="${mode === "multiple"}">
        <div class="dx-tree-children" role="group" data-dx-tree-children>
          <div class="dx-tree-item" role="treeitem" data-dx-tree-item data-dx-key="1" data-dx-text="Documents" aria-level="1" aria-setsize="2" aria-posinset="1" aria-expanded="true" aria-selected="false" tabindex="0">
            <button type="button" class="dx-tree-caret" data-dx-tree-caret aria-label="Collapse Documents" aria-expanded="true">v</button>
            <span class="dx-tree-label">Documents</span>
            <div class="dx-tree-children" role="group" data-dx-tree-children>
              <div class="dx-tree-item" role="treeitem" data-dx-tree-item data-dx-key="1-1" data-dx-text="Resume.pdf" aria-level="2" aria-setsize="2" aria-posinset="1" aria-selected="false" tabindex="-1">
                <span class="dx-tree-label">Resume.pdf</span>
              </div>
              <div class="dx-tree-item" role="treeitem" data-dx-tree-item data-dx-key="1-2" data-dx-text="Cover.pdf" aria-level="2" aria-setsize="2" aria-posinset="2" aria-selected="false" tabindex="-1">
                <span class="dx-tree-label">Cover.pdf</span>
              </div>
            </div>
          </div>
          <div class="dx-tree-item" role="treeitem" data-dx-tree-item data-dx-key="2" data-dx-text="Pictures" aria-level="1" aria-setsize="2" aria-posinset="2" aria-expanded="false" aria-selected="false" tabindex="-1">
            <button type="button" class="dx-tree-caret" data-dx-tree-caret aria-label="Expand Pictures" aria-expanded="false">&gt;</button>
            <span class="dx-tree-label">Pictures</span>
          </div>
        </div>
      </div>`);
    window.dxUikit.tree.init(root);
    return root;
  };

  const items = (root) => [...root.querySelectorAll("[data-dx-tree-item]")];
  const keydown = (el, key) => el.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));

  it("marks the tree ready on init and is idempotent", () => {
    const root = treeFixture();
    expect(root._dxTree).toEqual({ ready: true });
    window.dxUikit.tree.init(root);
    expect(root._dxTree).toEqual({ ready: true });
  });

  it("collapses an expanded node via the caret and fires dx:tree-collapse", () => {
    const root = treeFixture();
    const listener = vi.fn();
    root.addEventListener("dx:tree-collapse", listener);
    const docs = items(root)[0];
    const caret = docs.querySelector("[data-dx-tree-caret]");
    caret.focus();
    caret.click();
    expect(docs.getAttribute("aria-expanded")).toBe("false");
    expect(caret.getAttribute("aria-expanded")).toBe("false");
    expect(caret.getAttribute("aria-label")).toBe("Expand Documents");
    expect(docs.querySelector(":scope > [data-dx-tree-children]").hidden).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: { key: "1", text: "Documents" } }));
  });

  it("expands a collapsed node via the caret and fires dx:tree-expand", () => {
    const root = treeFixture();
    const listener = vi.fn();
    root.addEventListener("dx:tree-expand", listener);
    const pictures = items(root)[3];
    const caret = pictures.querySelector("[data-dx-tree-caret]");
    caret.focus();
    caret.click();
    expect(pictures.getAttribute("aria-expanded")).toBe("true");
    expect(caret.getAttribute("aria-expanded")).toBe("true");
    expect(caret.getAttribute("aria-label")).toBe("Collapse Pictures");
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: { key: "2", text: "Pictures" } }));
  });

  it("selects a node on click and fires dx:tree-select", () => {
    const root = treeFixture();
    const listener = vi.fn();
    root.addEventListener("dx:tree-select", listener);
    items(root)[3].click();
    expect(items(root)[3].getAttribute("aria-selected")).toBe("true");
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { key: "2", text: "Pictures", selected: true } })
    );
  });

  it("single mode clears the previous selection", () => {
    const root = treeFixture();
    items(root)[0].click();
    items(root)[3].click();
    expect(items(root)[0].getAttribute("aria-selected")).toBe("false");
    expect(items(root)[3].getAttribute("aria-selected")).toBe("true");
  });

  it("ignores clicks on disabled nodes", () => {
    const root = treeFixture();
    const listener = vi.fn();
    root.addEventListener("dx:tree-select", listener);
    const first = items(root)[0];
    first.setAttribute("aria-disabled", "true");
    first.click();
    expect(first.getAttribute("aria-selected")).toBe("false");
    const second = items(root)[1];
    second.setAttribute("data-dx-disabled", "");
    second.click();
    expect(second.getAttribute("aria-selected")).toBe("false");
    expect(listener).not.toHaveBeenCalled();
  });

  it("multiple mode toggles selection without clearing other nodes", () => {
    const root = treeFixture("multiple");
    const listener = vi.fn();
    root.addEventListener("dx:tree-select", listener);
    items(root)[0].click();
    items(root)[3].click();
    expect(items(root)[0].getAttribute("aria-selected")).toBe("true");
    expect(items(root)[3].getAttribute("aria-selected")).toBe("true");
    items(root)[3].click();
    expect(items(root)[3].getAttribute("aria-selected")).toBe("false");
    expect(items(root)[0].getAttribute("aria-selected")).toBe("true");
    expect(listener).toHaveBeenLastCalledWith(
      expect.objectContaining({ detail: { key: "2", text: "Pictures", selected: false } })
    );
  });

  it("moves focus with ArrowDown/ArrowUp and wraps", () => {
    const root = treeFixture();
    items(root)[0].focus();
    keydown(items(root)[0], "ArrowDown");
    expect(document.activeElement).toBe(items(root)[1]);
    keydown(items(root)[1], "ArrowDown");
    expect(document.activeElement).toBe(items(root)[2]);
    items(root)[0].focus();
    keydown(items(root)[0], "ArrowUp");
    expect(document.activeElement).toBe(items(root)[3]);
    keydown(items(root)[3], "ArrowDown");
    expect(document.activeElement).toBe(items(root)[0]);
  });

  it("Home and End jump to the first and last node", () => {
    const root = treeFixture();
    items(root)[2].focus();
    keydown(items(root)[2], "Home");
    expect(document.activeElement).toBe(items(root)[0]);
    keydown(items(root)[0], "End");
    expect(document.activeElement).toBe(items(root)[3]);
  });

  it("ArrowRight expands a collapsed node and moves into children when expanded", () => {
    const root = treeFixture();
    const expand = vi.fn();
    root.addEventListener("dx:tree-expand", expand);
    const pictures = items(root)[3];
    pictures.focus();
    keydown(pictures, "ArrowRight");
    expect(pictures.getAttribute("aria-expanded")).toBe("true");
    expect(expand).toHaveBeenCalledWith(expect.objectContaining({ detail: { key: "2", text: "Pictures" } }));

    const docs = items(root)[0];
    docs.focus();
    keydown(docs, "ArrowRight");
    expect(document.activeElement).toBe(items(root)[1]);
  });

  it("ArrowLeft collapses an expanded node", () => {
    const root = treeFixture();
    const collapse = vi.fn();
    root.addEventListener("dx:tree-collapse", collapse);
    const docs = items(root)[0];
    docs.focus();
    keydown(docs, "ArrowLeft");
    expect(docs.getAttribute("aria-expanded")).toBe("false");
    expect(docs.querySelector(":scope > [data-dx-tree-children]").hidden).toBe(true);
    expect(collapse).toHaveBeenCalledWith(expect.objectContaining({ detail: { key: "1", text: "Documents" } }));
  });

  it("ArrowLeft on a collapsed leaf moves focus to its parent", () => {
    const root = treeFixture();
    items(root)[1].focus();
    keydown(items(root)[1], "ArrowLeft");
    expect(document.activeElement).toBe(items(root)[0]);
  });

  it("Enter and Space select the focused node", () => {
    const root = treeFixture();
    const listener = vi.fn();
    root.addEventListener("dx:tree-select", listener);
    items(root)[3].focus();
    keydown(items(root)[3], "Enter");
    expect(items(root)[3].getAttribute("aria-selected")).toBe("true");
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { key: "2", text: "Pictures", selected: true } })
    );
    items(root)[1].focus();
    keydown(items(root)[1], " ");
    expect(items(root)[1].getAttribute("aria-selected")).toBe("true");
  });
});
