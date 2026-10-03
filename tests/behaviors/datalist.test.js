import { beforeEach, describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

describe("datalist", () => {
  const datalistFixture = (extra = "") => {
    const root = fixture(`
      <div data-dx-datalist data-dx-datalist-pagesize="4" data-dx-datalist-pagesize-options="[4,8,12]" ${extra}>
        <div data-dx-datalist-items>
          <div data-dx-datalist-item>Apple</div>
          <div data-dx-datalist-item>Banana</div>
          <div data-dx-datalist-item>Cherry</div>
          <div data-dx-datalist-item>Date</div>
          <div data-dx-datalist-item>Elderberry</div>
          <div data-dx-datalist-item>Fig</div>
          <div data-dx-datalist-item>Grape</div>
          <div data-dx-datalist-item>Honeydew</div>
          <div data-dx-datalist-item>Kiwi</div>
          <div data-dx-datalist-item>Lemon</div>
        </div>
        <div data-dx-datalist-empty hidden>No records found</div>
        <div data-dx-datalist-pager></div>
      </div>`);
    window.dxUikit.datalist.init(root);
    return root;
  };

  const visibleItems = (root) =>
    [...root.querySelectorAll("[data-dx-datalist-item]")].filter((item) => !item.hidden).map((item) => item.textContent);

  it("shows the first page by default (pageSize 4)", () => {
    const root = datalistFixture();
    expect(visibleItems(root)).toEqual(["Apple", "Banana", "Cherry", "Date"]);
    expect(root.querySelector(".dx-datalist-pager-summary").textContent).toContain("Page 1 of 3");
  });

  it("pages through items and fires dx:datalist-page", () => {
    const listener = vi.fn();
    const root = datalistFixture();
    root.addEventListener("dx:datalist-page", listener);
    root.querySelector('[data-dx-datalist-page="2"]').click();
    expect(visibleItems(root)).toEqual(["Elderberry", "Fig", "Grape", "Honeydew"]);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: { pageNumber: 2 } }));
  });

  it("resets to page 1 when page size changes", () => {
    const root = datalistFixture();
    root.querySelector('[data-dx-datalist-page="2"]').click();
    root.querySelector("[data-dx-datalist-page-size]").value = "8";
    root.querySelector("[data-dx-datalist-page-size]").dispatchEvent(new Event("change", { bubbles: true }));
    expect(root.querySelector(".dx-datalist-pager-summary").textContent).toContain("Page 1 of 2");
    expect(visibleItems(root)).toHaveLength(8);
  });

  it("applies wrap grid layout when data-dx-datalist-wrap is present", () => {
    const root = datalistFixture("data-dx-datalist-wrap");
    expect(root.hasAttribute("data-dx-datalist-wrap")).toBe(true);
    expect(root.querySelector("[data-dx-datalist-items]")).toBeTruthy();
  });

  it("shows the empty message when there are no items", () => {
    const root = fixture(`
      <div data-dx-datalist>
        <div data-dx-datalist-items></div>
        <div data-dx-datalist-empty hidden>No records found</div>
        <div data-dx-datalist-pager></div>
      </div>`);
    window.dxUikit.datalist.init(root);
    expect(root.querySelector("[data-dx-datalist-empty]").hidden).toBe(false);
    expect(root.querySelector(".dx-datalist-pager-summary").textContent).toContain("Page 1 of 1");
  });
});
