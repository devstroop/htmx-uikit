import { beforeEach, describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

const filterFixture = () => {
  const root = fixture(`
    <div data-dx-datafilter
         data-dx-datafilter-properties='[{"name":"name","title":"Name","type":"string"},{"name":"age","title":"Age","type":"number"},{"name":"active","title":"Active","type":"boolean"}]'
         data-dx-datafilter-operator="And">
      <div class="dx-datafilter-rows" data-dx-datafilter-rows>
        <div class="dx-datafilter-row" data-dx-datafilter-row>
          <select data-dx-datafilter-property></select>
          <select data-dx-datafilter-operator></select>
          <input data-dx-datafilter-value>
          <button type="button" data-dx-datafilter-remove>×</button>
        </div>
      </div>
      <button type="button" data-dx-datafilter-add>Add filter</button>
      <div data-dx-datafilter-operator-bar role="radiogroup">
        <label><input type="radio" name="op" value="And" checked> AND</label>
        <label><input type="radio" name="op" value="Or"> OR</label>
      </div>
      <input type="hidden" data-dx-datafilter-output>
    </div>`);
  window.dxUikit.datafilter.init(root);
  return root;
};

describe("datafilter", () => {
  it("populates property options and per-type operator options", () => {
    const root = filterFixture();
    const property = root.querySelector("[data-dx-datafilter-property]");
    expect([...property.options].map((o) => o.value)).toEqual(["name", "age", "active"]);
    expect(property.value).toBe("name");
    const operator = root.querySelector("[data-dx-datafilter-operator]");
    expect([...operator.options].map((o) => o.value)).toContain("Contains");
    expect([...operator.options].map((o) => o.value)).toContain("StartsWith");
  });

  it("swaps operators and the value editor when the property changes", () => {
    const root = filterFixture();
    const property = root.querySelector("[data-dx-datafilter-property]");
    property.value = "age";
    property.dispatchEvent(new Event("change", { bubbles: true }));
    const operator = root.querySelector("[data-dx-datafilter-operator]");
    expect([...operator.options].map((o) => o.value)).not.toContain("Contains");
    expect([...operator.options].map((o) => o.value)).toContain("GreaterThan");
    expect(root.querySelector("[data-dx-datafilter-value]").type).toBe("number");
  });

  it("serializes active rows and dispatches dx:filter-change with both string forms", () => {
    const root = filterFixture();
    const listener = vi.fn();
    root.addEventListener("dx:filter-change", listener);
    const value = root.querySelector("[data-dx-datafilter-value]");
    value.value = "jo";
    value.dispatchEvent(new Event("change", { bubbles: true }));
    expect(listener).toHaveBeenCalledTimes(1);
    const detail = listener.mock.calls[0][0].detail;
    expect(detail.filters).toEqual([{ property: "name", operator: "Contains", value: "jo" }]);
    expect(detail.filterString).toBe('name.Contains("jo")');
    expect(detail.oDataFilterString).toBe("contains(tolower(name), tolower('jo'))");
    expect(root.querySelector("[data-dx-datafilter-output]").value).toBe(
      JSON.stringify([{ property: "name", operator: "Contains", value: "jo" }]),
    );
  });

  it("ignores rows with empty values unless the operator is a null/empty test", () => {
    const root = filterFixture();
    const listener = vi.fn();
    root.addEventListener("dx:filter-change", listener);
    const value = root.querySelector("[data-dx-datafilter-value]");
    value.dispatchEvent(new Event("change", { bubbles: true }));
    expect(listener.mock.calls[0][0].detail.filters).toEqual([]);
    const operator = root.querySelector("[data-dx-datafilter-operator]");
    operator.value = "IsNull";
    operator.dispatchEvent(new Event("change", { bubbles: true }));
    expect(listener.mock.calls[1][0].detail.filters).toEqual([{ property: "name", operator: "IsNull", value: "" }]);
  });

  it("adds a row cloned from the template and keeps at least one row", () => {
    const root = filterFixture();
    root.querySelector("[data-dx-datafilter-add]").click();
    expect(root.querySelectorAll("[data-dx-datafilter-row]")).toHaveLength(2);
    const remove = root.querySelectorAll("[data-dx-datafilter-remove]")[0];
    remove.click();
    remove.click();
    expect(root.querySelectorAll("[data-dx-datafilter-row]")).toHaveLength(1);
  });

  it("switching the AND/OR radio updates the join and re-fires", () => {
    const root = filterFixture();
    const listener = vi.fn();
    root.addEventListener("dx:filter-change", listener);
    const value = root.querySelector("[data-dx-datafilter-value]");
    value.value = "jo";
    value.dispatchEvent(new Event("change", { bubbles: true }));
    const or = root.querySelector('[data-dx-datafilter-operator-bar] input[value="Or"]');
    or.checked = true;
    or.dispatchEvent(new Event("change", { bubbles: true }));
    expect(listener.mock.calls[1][0].detail.logicalOperator).toBe("Or");
  });
});
