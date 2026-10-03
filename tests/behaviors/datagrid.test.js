import { beforeEach, describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

describe("datagrid", () => {
  const gridFixture = (overrides = {}) => {
    const root = fixture(`
      <div data-dx-datagrid
           data-dx-datagrid-properties='[
             {"property":"name","title":"Name","type":"string","sortable":true},
             {"property":"age","title":"Age","type":"number","align":"center","sortable":true},
             {"property":"role","title":"Role","type":"string"}
           ]'
           data-dx-datagrid-sortable
           data-dx-datagrid-filterable
           data-dx-datagrid-pagesize="2"
           data-dx-datagrid-pagesize-options="[2,5]"
           data-dx-datagrid-pagenumbers="5">
        <div class="dx-datagrid-data" role="grid" data-dx-datagrid-data>
          <table class="dx-datagrid-table">
            <thead data-dx-datagrid-head></thead>
            <tbody data-dx-datagrid-rows>
              <tr data-dx-row data-dx-row-value='{"name":"John","age":30,"role":"admin"}'>
                <td data-dx-col="name">John</td>
                <td data-dx-col="age" class="dx-datagrid-cell--center">30</td>
                <td data-dx-col="role">admin</td>
              </tr>
              <tr data-dx-row data-dx-row-value='{"name":"Jane","age":25,"role":"editor"}'>
                <td data-dx-col="name">Jane</td>
                <td data-dx-col="age" class="dx-datagrid-cell--center">25</td>
                <td data-dx-col="role">editor</td>
              </tr>
              <tr data-dx-row data-dx-row-value='{"name":"Bob","age":40,"role":"viewer"}'>
                <td data-dx-col="name">Bob</td>
                <td data-dx-col="age" class="dx-datagrid-cell--center">40</td>
                <td data-dx-col="role">viewer</td>
              </tr>
              <tr data-dx-row data-dx-row-value='{"name":"Alice","age":22,"role":"editor"}'>
                <td data-dx-col="name">Alice</td>
                <td data-dx-col="age" class="dx-datagrid-cell--center">22</td>
                <td data-dx-col="role">editor</td>
              </tr>
            </tbody>
          </table>
          <div class="dx-datagrid-empty" data-dx-datagrid-empty hidden>No records found</div>
        </div>
        <div class="dx-datagrid-pager" data-dx-datagrid-pager></div>
      </div>`);
    window.dxUikit.datagrid.init(root);
    return root;
  };

  const visibleNames = (root) =>
    [...root.querySelectorAll("[data-dx-row]")]
      .filter((row) => !row.hidden)
      .map((row) => row.querySelector("[data-dx-col=name]").textContent);

  it("renders the header from properties with sort buttons and a filter row", () => {
    const root = gridFixture();
    const head = root.querySelector("[data-dx-datagrid-head]");
    expect(head.querySelectorAll("th")).toHaveLength(3);
    expect(head.querySelector('[data-dx-grid-sort="name"]').textContent).toBe("Name");
    expect(head.querySelector('[data-dx-grid-filter-value="name"]')).toBeTruthy();
    expect(root.querySelector('[data-dx-grid-filter-value="age"]')).toBeTruthy();
    expect(root.querySelector('[data-dx-grid-filter-value="role"]')).toBeTruthy();
  });

  it("pages by page size and updates the summary", () => {
    const root = gridFixture();
    expect(visibleNames(root)).toEqual(["John", "Jane"]);
    expect(root.querySelector(".dx-datagrid-pager-summary").textContent).toBe("Page 1 of 2 (4 records)");
    root.querySelector('[data-dx-grid-page="2"]').click();
    expect(visibleNames(root)).toEqual(["Bob", "Alice"]);
    expect(root.querySelector(".dx-datagrid-pager-summary").textContent).toBe("Page 2 of 2 (4 records)");
  });

  it("sorts ascending then descending then clears with aria-sort", () => {
    const root = gridFixture();
    root.querySelector('[data-dx-grid-sort="name"]').click();
    expect(visibleNames(root)).toEqual(["Alice", "Bob"]);
    expect(root.querySelector("th").getAttribute("aria-sort")).toBe("ascending");
    root.querySelector('[data-dx-grid-sort="name"]').click();
    expect(visibleNames(root)).toEqual(["John", "Jane"]);
    expect(root.querySelector("th").getAttribute("aria-sort")).toBe("descending");
    root.querySelector('[data-dx-grid-sort="name"]').click();
    expect(visibleNames(root)).toEqual(["John", "Jane"]);
    expect(root.querySelector("th").getAttribute("aria-sort")).toBe("none");
  });

  it("filters with typed coercion and resets to page 1", () => {
    const root = gridFixture();
    const value = root.querySelector('[data-dx-grid-filter-value="age"]');
    value.value = "25";
    value.dispatchEvent(new Event("change", { bubbles: true }));
    expect(visibleNames(root)).toEqual(["Jane"]);
    const op = root.querySelector('[data-dx-grid-filter-op="age"]');
    op.value = "GreaterThan";
    op.dispatchEvent(new Event("change", { bubbles: true }));
    expect(visibleNames(root)).toEqual(["John", "Bob"]);
  });

  it("shows the empty message when nothing matches", () => {
    const root = gridFixture();
    const value = root.querySelector('[data-dx-grid-filter-value="name"]');
    value.value = "zzz";
    value.dispatchEvent(new Event("change", { bubbles: true }));
    expect(visibleNames(root)).toEqual([]);
    expect(root.querySelector("[data-dx-datagrid-empty]").hidden).toBe(false);
  });

  it("changes page size and clamps to page 1", () => {
    const root = gridFixture();
    root.querySelector('[data-dx-grid-page="2"]').click();
    const size = root.querySelector("[data-dx-grid-page-size]");
    size.value = "5";
    size.dispatchEvent(new Event("change", { bubbles: true }));
    expect(visibleNames(root)).toEqual(["John", "Jane", "Bob", "Alice"]);
    expect(root.querySelector(".dx-datagrid-pager-summary").textContent).toBe("Page 1 of 1 (4 records)");
  });

  it("dispatches dx:grid-change with filters and both string forms", () => {
    const listener = vi.fn();
    const root = gridFixture();
    root.addEventListener("dx:grid-change", listener);
    const value = root.querySelector('[data-dx-grid-filter-value="name"]');
    value.value = "ja";
    value.dispatchEvent(new Event("change", { bubbles: true }));
    expect(listener).toHaveBeenCalledTimes(1);
    const detail = listener.mock.calls[0][0].detail;
    expect(detail.filters).toEqual([{ property: "name", operator: "Contains", value: "ja", type: "string" }]);
    expect(detail.filterString).toBe('Name.Contains("ja")'.replace("Name", "name"));
    expect(detail.oDataFilterString).toBe("contains(tolower(name), tolower('ja'))");
    expect(detail.pageSize).toBe(2);
  });

  const advancedFixture = () => {
    const root = fixture(`
      <div data-dx-datagrid
           data-dx-datagrid-properties='[
             {"property":"name","title":"Name","type":"string","frozen":true,"width":"8rem"},
             {"property":"age","title":"Age","type":"number","align":"center"},
             {"property":"role","title":"Role","type":"string"}
           ]'
           data-dx-datagrid-select="multiple"
           data-dx-datagrid-column-picker
           data-dx-datagrid-resize
           data-dx-datagrid-reorder
           data-dx-datagrid-groupable
           data-dx-datagrid-edit
           data-dx-datagrid-delete
           data-dx-datagrid-create
           data-dx-datagrid-pagesize="10">
        <div data-dx-datagrid-toolbar></div>
        <div class="dx-datagrid-data" role="grid" data-dx-datagrid-data>
          <table class="dx-datagrid-table">
            <colgroup data-dx-datagrid-cols></colgroup>
            <thead data-dx-datagrid-head></thead>
            <tbody data-dx-datagrid-rows>
              <tr data-dx-row data-dx-row-key="1" data-dx-row-value='{"name":"John","age":30,"role":"admin"}'>
                <td data-dx-col="name">John</td>
                <td data-dx-col="age" class="dx-datagrid-cell--center">30</td>
                <td data-dx-col="role">admin</td>
              </tr>
              <tr data-dx-row data-dx-row-key="2" data-dx-row-value='{"name":"Jane","age":25,"role":"editor"}'>
                <td data-dx-col="name">Jane</td>
                <td data-dx-col="age" class="dx-datagrid-cell--center">25</td>
                <td data-dx-col="role">editor</td>
              </tr>
            </tbody>
          </table>
          <div class="dx-datagrid-empty" data-dx-datagrid-empty hidden>No records found</div>
        </div>
        <div class="dx-datagrid-pager" data-dx-datagrid-pager></div>
      </div>`);
    window.dxUikit.datagrid.init(root);
    return root;
  };

  it("selects rows in multiple mode with aria-selected and dx:grid-select", () => {
    const listener = vi.fn();
    const root = advancedFixture();
    root.addEventListener("dx:grid-select", listener);
    root.querySelector('[data-dx-row-key="1"]').querySelector("td").click();
    root.querySelector('[data-dx-row-key="2"]').querySelector("td").click();
    expect(root.querySelector('[data-dx-row-key="1"]').getAttribute("aria-selected")).toBe("true");
    expect(root.querySelector('[data-dx-row-key="2"]').getAttribute("aria-selected")).toBe("true");
    expect(root.querySelector('[data-dx-row-key="1"]').classList.contains("dx-datagrid-row--selected")).toBe(true);
    expect(listener.mock.calls[1][0].detail.keys).toEqual(["1", "2"]);
    root.querySelector('[data-dx-row-key="1"]').querySelector("td").click();
    expect(listener.mock.calls[2][0].detail.keys).toEqual(["2"]);
  });

  it("toggles columns from the picker and emits dx:grid-column-pick", () => {
    const listener = vi.fn();
    const root = advancedFixture();
    root.addEventListener("dx:grid-column-pick", listener);
    const toggle = root.querySelector("[data-dx-grid-picker-toggle]");
    expect(toggle.textContent).toBe("Columns");
    toggle.click();
    const checkbox = root.querySelector('[data-dx-grid-picker-item="role"]');
    expect(checkbox).toBeTruthy();
    checkbox.checked = false;
    checkbox.dispatchEvent(new Event("change", { bubbles: true }));
    expect(root.querySelectorAll("[data-dx-grid-col]")).toHaveLength(2);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: { key: "role", visible: false } }));
    expect(root.querySelector('[data-dx-grid-picker-item="name"]').checked).toBe(true);
  });

  it("freezes the name column with a sticky offset", () => {
    const root = advancedFixture();
    const firstTh = root.querySelector("th");
    expect(firstTh.classList.contains("dx-datagrid-cell--frozen")).toBe(true);
    expect(firstTh.style.left).toBe("0px");
    const secondTh = root.querySelectorAll("th")[1];
    expect(secondTh.classList.contains("dx-datagrid-cell--frozen")).toBe(false);
    const firstTd = root.querySelector("[data-dx-row] td");
    expect(firstTd.classList.contains("dx-datagrid-cell--frozen")).toBe(true);
    expect(firstTd.style.left).toBe("0px");
  });

  it("resizes a column by dragging its handle", () => {
    const root = advancedFixture();
    const handle = root.querySelector('[data-dx-grid-resize="name"]');
    expect(handle.getAttribute("aria-label")).toBe("Resize Name");
    handle.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, clientX: 100 }));
    document.dispatchEvent(new MouseEvent("mousemove", { bubbles: true, clientX: 300 }));
    document.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
    const col = root.querySelector("[data-dx-datagrid-cols] col");
    expect(col.style.width).toBe("208px");
  });

  it("reorders columns on dragstart and drop", () => {
    const listener = vi.fn();
    const root = advancedFixture();
    root.addEventListener("dx:grid-column-reorder", listener);
    const ageTh = root.querySelector('[data-dx-grid-col="age"]');
    const nameTh = root.querySelector('[data-dx-grid-col="name"]');
    ageTh.dispatchEvent(new Event("dragstart", { bubbles: true }));
    nameTh.dispatchEvent(new Event("dragover", { bubbles: true, cancelable: true }));
    nameTh.dispatchEvent(new Event("drop", { bubbles: true, cancelable: true }));
    const headers = [...root.querySelectorAll("th")];
    expect(headers[0].textContent).toBe("Age");
    expect(headers[1].textContent).toBe("Name");
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: { from: "age", to: "name" } }));
  });

  it("groups by a column dropped on the group panel", () => {
    const listener = vi.fn();
    const root = advancedFixture();
    root.addEventListener("dx:grid-group-change", listener);
    const roleTh = root.querySelector('[data-dx-grid-col="role"]');
    const panel = root.querySelector("[data-dx-grid-group-panel]");
    roleTh.dispatchEvent(new Event("dragstart", { bubbles: true }));
    panel.dispatchEvent(new Event("dragover", { bubbles: true, cancelable: true }));
    panel.dispatchEvent(new Event("drop", { bubbles: true, cancelable: true }));
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: { property: "role" } }));
    expect(root.querySelectorAll("[data-dx-row]")).toHaveLength(2);
    expect(root.querySelector("[data-dx-grid-col=role]")).toBeFalsy();
    const groupRows = root.querySelectorAll(".dx-datagrid-group-row");
    expect(groupRows).toHaveLength(2);
    expect(groupRows[0].textContent).toContain("admin (1)");
    expect(groupRows[1].textContent).toContain("editor (1)");
  });

  it("collapses groups and removes grouping via the chip", () => {
    const root = advancedFixture();
    root.querySelector('[data-dx-grid-col="role"]').dispatchEvent(new Event("dragstart", { bubbles: true }));
    root.querySelector("[data-dx-grid-group-panel]").dispatchEvent(new Event("drop", { bubbles: true, cancelable: true }));
    const toggle = root.querySelector("[data-dx-grid-group-toggle]");
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    toggle.click();
    expect(root.querySelector("[data-dx-grid-group-toggle]").getAttribute("aria-expanded")).toBe("false");
    expect(root.querySelector('[data-dx-row-key="1"]').hidden).toBe(true);
    root.querySelector("[data-dx-grid-group-clear]").click();
    expect(root.querySelector("[data-dx-grid-col=role]")).toBeTruthy();
    expect(root.querySelectorAll(".dx-datagrid-group-row")).toHaveLength(0);
  });

  it("edits a row inline and fires dx:grid-row-update", () => {
    const listener = vi.fn();
    const root = advancedFixture();
    root.addEventListener("dx:grid-row-update", listener);
    root.querySelector('[data-dx-row-key="1"] [data-dx-grid-row-edit]').click();
    const input = root.querySelector('[data-dx-row-key="1"] [data-dx-grid-edit-input="name"]');
    input.value = "Jonny";
    root.querySelector('[data-dx-row-key="1"] [data-dx-grid-row-save]').click();
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: { original: expect.objectContaining({ name: "John" }), updated: expect.objectContaining({ name: "Jonny" }) },
      }),
    );
    expect(root.querySelector('[data-dx-row-key="1"] [data-dx-col="name"]').textContent).toBe("John");
    expect(root.querySelector('[data-dx-row-key="1"] [data-dx-grid-row-edit]')).toBeTruthy();
  });

  it("cancels an edit restoring the original cell text", () => {
    const root = advancedFixture();
    root.querySelector('[data-dx-row-key="2"] [data-dx-grid-row-edit]').click();
    root.querySelector('[data-dx-row-key="2"] [data-dx-grid-row-cancel]').click();
    expect(root.querySelector('[data-dx-row-key="2"] [data-dx-col="name"]').textContent).toBe("Jane");
  });

  it("deletes a row firing dx:grid-row-delete", () => {
    const listener = vi.fn();
    const root = advancedFixture();
    root.addEventListener("dx:grid-row-delete", listener);
    root.querySelector('[data-dx-row-key="1"] [data-dx-grid-row-delete]').click();
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: { row: expect.objectContaining({ name: "John" }) } }));
    expect(root.querySelector('[data-dx-row-key="1"]')).toBeFalsy();
  });

  it("creates a row firing dx:grid-row-create", () => {
    const listener = vi.fn();
    const root = advancedFixture();
    root.addEventListener("dx:grid-row-create", listener);
    root.querySelector("[data-dx-grid-row-create]").click();
    const input = root.querySelector("[data-dx-grid-new-row] [data-dx-grid-edit-input=name]");
    input.value = "Zed";
    root.querySelector("[data-dx-grid-row-create-save]").click();
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: { row: expect.objectContaining({ name: "Zed" }) } }));
    expect(root.querySelector("[data-dx-grid-new-row]")).toBeFalsy();
  });
});
