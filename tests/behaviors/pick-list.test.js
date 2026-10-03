import { describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

describe("pick-list", () => {
  const pickListFixture = () => {
    const root = fixture(`
      <div class="dx-picklist" data-dx-picklist aria-label="PickList">
        <div class="dx-picklist-panel" data-dx-picklist-source>
          <div class="dx-picklist-list" role="listbox" aria-label="Source" aria-multiselectable="true" data-dx-picklist-list data-dx-side="source">
            <div class="dx-picklist-item" role="option" data-dx-picklist-item data-dx-key="1" data-dx-text="Apple" aria-selected="false" tabindex="0">Apple</div>
            <div class="dx-picklist-item" role="option" data-dx-picklist-item data-dx-key="2" data-dx-text="Banana" aria-selected="false" tabindex="-1">Banana</div>
            <div class="dx-picklist-item dx-picklist-item--disabled" role="option" data-dx-picklist-item data-dx-key="3" data-dx-text="Cherry" aria-selected="false" aria-disabled="true" tabindex="-1">Cherry (disabled)</div>
          </div>
        </div>
        <div class="dx-picklist-controls" data-dx-picklist-controls>
          <button type="button" data-dx-picklist-to-target aria-label="Move selected to target">&rsaquo;</button>
          <button type="button" data-dx-picklist-to-source aria-label="Move selected to source">&lsaquo;</button>
          <button type="button" data-dx-picklist-all-to-target aria-label="Move all to target">&raquo;</button>
          <button type="button" data-dx-picklist-all-to-source aria-label="Move all to source">&laquo;</button>
          <button type="button" data-dx-picklist-up aria-label="Move up">&uarr;</button>
          <button type="button" data-dx-picklist-down aria-label="Move down">&darr;</button>
        </div>
        <div class="dx-picklist-panel" data-dx-picklist-target>
          <div class="dx-picklist-list" role="listbox" aria-label="Target" aria-multiselectable="true" data-dx-picklist-list data-dx-side="target">
            <div class="dx-picklist-item" role="option" data-dx-picklist-item data-dx-key="4" data-dx-text="Date" aria-selected="false" tabindex="-1">Date</div>
            <div class="dx-picklist-item" role="option" data-dx-picklist-item data-dx-key="5" data-dx-text="Elder" aria-selected="false" tabindex="-1">Elder</div>
            <div class="dx-picklist-item" role="option" data-dx-picklist-item data-dx-key="6" data-dx-text="Fig" aria-selected="false" tabindex="-1">Fig</div>
          </div>
        </div>
      </div>`);
    window.dxUikit.picklist.init(root);
    return root;
  };

  const source = (root) => root.querySelector('[data-dx-side="source"]');
  const target = (root) => root.querySelector('[data-dx-side="target"]');
  const keys = (list) => [...list.querySelectorAll("[data-dx-picklist-item]")].map((el) => el.getAttribute("data-dx-key"));
  const item = (list, key) => list.querySelector(`[data-dx-key="${key}"]`);
  const keydown = (el, key) => el.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));

  it("marks the pick list ready on init and is idempotent", () => {
    const root = pickListFixture();
    expect(root._dxPickList).toEqual({ ready: true });
    window.dxUikit.picklist.init(root);
    expect(root._dxPickList).toEqual({ ready: true });
  });

  it("toggles selection and focuses the item on click", () => {
    const root = pickListFixture();
    const first = item(source(root), "1");
    first.click();
    expect(first.getAttribute("aria-selected")).toBe("true");
    expect(document.activeElement).toBe(first);
    first.click();
    expect(first.getAttribute("aria-selected")).toBe("false");
  });

  it("ignores clicks on aria-disabled items", () => {
    const root = pickListFixture();
    const disabled = item(source(root), "3");
    disabled.click();
    expect(disabled.getAttribute("aria-selected")).toBe("false");
  });

  it("moves selected items to target and fires dx:picklist-move", () => {
    const root = pickListFixture();
    const listener = vi.fn();
    root.addEventListener("dx:picklist-move", listener);
    item(source(root), "1").click();
    item(source(root), "2").click();
    root.querySelector("[data-dx-picklist-to-target]").click();
    expect(keys(source(root))).toEqual(["3"]);
    expect(keys(target(root))).toEqual(["4", "5", "6", "1", "2"]);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          source: [{ key: "3", text: "Cherry" }],
          target: [
            { key: "4", text: "Date" },
            { key: "5", text: "Elder" },
            { key: "6", text: "Fig" },
            { key: "1", text: "Apple" },
            { key: "2", text: "Banana" },
          ],
          moved: [
            { key: "1", text: "Apple" },
            { key: "2", text: "Banana" },
          ],
          direction: "toTarget",
        },
      })
    );
    expect(item(source(root), "3").getAttribute("aria-selected")).toBe("false");
  });

  it("moves selected items back to source", () => {
    const root = pickListFixture();
    const listener = vi.fn();
    root.addEventListener("dx:picklist-move", listener);
    item(target(root), "4").click();
    root.querySelector("[data-dx-picklist-to-source]").click();
    expect(keys(target(root))).toEqual(["5", "6"]);
    expect(keys(source(root))).toEqual(["1", "2", "3", "4"]);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ detail: expect.objectContaining({ direction: "toSource", moved: [{ key: "4", text: "Date" }] }) })
    );
  });

  it("moves all non-disabled items to target", () => {
    const root = pickListFixture();
    const listener = vi.fn();
    root.addEventListener("dx:picklist-move", listener);
    root.querySelector("[data-dx-picklist-all-to-target]").click();
    expect(keys(source(root))).toEqual(["3"]);
    expect(keys(target(root))).toEqual(["4", "5", "6", "1", "2"]);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ detail: expect.objectContaining({ direction: "allToTarget", moved: [{ key: "1", text: "Apple" }, { key: "2", text: "Banana" }] }) })
    );
  });

  it("moves all target items back to source, skipping disabled source items", () => {
    const root = pickListFixture();
    root.querySelector("[data-dx-picklist-all-to-source]").click();
    expect(keys(source(root))).toEqual(["1", "2", "3", "4", "5", "6"]);
    expect(keys(target(root))).toEqual([]);
  });

  it("reorders the selected target item upward and fires dx:picklist-move", () => {
    const root = pickListFixture();
    const listener = vi.fn();
    root.addEventListener("dx:picklist-move", listener);
    item(target(root), "5").click();
    root.querySelector("[data-dx-picklist-up]").click();
    expect(keys(target(root))).toEqual(["5", "4", "6"]);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ detail: expect.objectContaining({ direction: "up", moved: [{ key: "5", text: "Elder" }] }) })
    );
    expect(item(target(root), "5").getAttribute("aria-selected")).toBe("false");
  });

  it("reorders the selected target item downward", () => {
    const root = pickListFixture();
    const listener = vi.fn();
    root.addEventListener("dx:picklist-move", listener);
    item(target(root), "4").click();
    root.querySelector("[data-dx-picklist-down]").click();
    expect(keys(target(root))).toEqual(["5", "4", "6"]);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ detail: expect.objectContaining({ direction: "down", moved: [{ key: "4", text: "Date" }] }) })
    );
  });

  it("does not dispatch a move when reordering with no selection", () => {
    const root = pickListFixture();
    const listener = vi.fn();
    root.addEventListener("dx:picklist-move", listener);
    root.querySelector("[data-dx-picklist-up]").click();
    root.querySelector("[data-dx-picklist-down]").click();
    expect(listener).not.toHaveBeenCalled();
    expect(keys(target(root))).toEqual(["4", "5", "6"]);
  });

  it("moves focus inside a list with Arrow keys, Home and End", () => {
    const root = pickListFixture();
    item(source(root), "1").focus();
    keydown(item(source(root), "1"), "End");
    expect(document.activeElement).toBe(item(source(root), "2"));
    keydown(item(source(root), "2"), "ArrowUp");
    expect(document.activeElement).toBe(item(source(root), "1"));
    keydown(item(source(root), "1"), "Home");
    expect(document.activeElement).toBe(item(source(root), "1"));
    keydown(item(source(root), "1"), "ArrowUp");
    expect(document.activeElement).toBe(item(source(root), "2"));
    keydown(item(source(root), "2"), "ArrowDown");
    expect(document.activeElement).toBe(item(source(root), "1"));
  });

  it("toggles selection with Enter and Space on the focused option", () => {
    const root = pickListFixture();
    item(source(root), "1").focus();
    keydown(item(source(root), "1"), "Enter");
    expect(item(source(root), "1").getAttribute("aria-selected")).toBe("true");
    item(source(root), "2").focus();
    keydown(item(source(root), "2"), " ");
    expect(item(source(root), "2").getAttribute("aria-selected")).toBe("true");
    expect(item(source(root), "1").getAttribute("aria-selected")).toBe("true");
  });
});
