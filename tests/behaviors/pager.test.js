import { describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

describe("pager", () => {
  const pagerFixture = (attrs = "", controls = true) => {
    const root = fixture(`
      <nav class="dx-pager dx-pager--left" data-dx-pager ${attrs} aria-label="Pagination">
        <span class="dx-pager-summary" data-dx-pager-summary role="status" aria-live="polite">Page 1 of 4 (35 items)</span>
        ${
          controls
            ? `<div class="dx-pager-controls" data-dx-pager-controls role="group" aria-label="Pagination">
            <button type="button" class="dx-pager-button" data-dx-pager-first aria-label="First page" title="First page">«</button>
            <button type="button" class="dx-pager-button" data-dx-pager-prev aria-label="Previous page" title="Previous page">‹</button>
            <button type="button" class="dx-pager-button" data-dx-pager-page data-dx-page="1" aria-label="Page 1" title="Page 1">1</button>
            <button type="button" class="dx-pager-button" data-dx-pager-page data-dx-page="2" aria-label="Page 2" title="Page 2">2</button>
            <button type="button" class="dx-pager-button" data-dx-pager-page data-dx-page="3" aria-label="Page 3" title="Page 3">3</button>
            <button type="button" class="dx-pager-button" data-dx-pager-page data-dx-page="4" aria-label="Page 4" title="Page 4">4</button>
            <button type="button" class="dx-pager-button" data-dx-pager-next aria-label="Next page" title="Next page">›</button>
            <button type="button" class="dx-pager-button" data-dx-pager-last aria-label="Last page" title="Last page">»</button>
          </div>
          <label class="dx-pager-size" data-dx-pager-size>Items per page
            <select data-dx-pager-size-select aria-label="Items per page">
              <option value="10" selected>10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </label>`
            : ""
        }
      </nav>`);
    window.dxUikit.pager.init(root);
    return root;
  };

  const key = (el, k) =>
    el.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true }));

  const pageButton = (root, page) =>
    root.querySelector(`[data-dx-pager-page][data-dx-page="${page}"]`);

  it("renders a labelled nav landmark with a polite summary region", () => {
    const root = pagerFixture('data-dx-count="35" data-dx-page-size="10" data-dx-page="1"');
    expect(root.tagName).toBe("NAV");
    expect(root.getAttribute("aria-label")).toBe("Pagination");
    const summary = root.querySelector("[data-dx-pager-summary]");
    expect(summary.getAttribute("aria-live")).toBe("polite");
    expect(summary.textContent).toBe("Page 1 of 4 (35 items)");
  });

  it("marks the active page with aria-current and clamps the boundary buttons", () => {
    const root = pagerFixture('data-dx-count="35" data-dx-page-size="10" data-dx-page="1"');
    expect(pageButton(root, 1).getAttribute("aria-current")).toBe("page");
    expect(pageButton(root, 2).hasAttribute("aria-current")).toBe(false);
    expect(root.querySelector("[data-dx-pager-first]").disabled).toBe(true);
    expect(root.querySelector("[data-dx-pager-prev]").disabled).toBe(true);
    expect(root.querySelector("[data-dx-pager-next]").disabled).toBe(false);
    expect(root.querySelector("[data-dx-pager-last]").disabled).toBe(false);
  });

  it("fires dx:page-change with skip/top and moves aria-current", () => {
    const root = pagerFixture('data-dx-count="35" data-dx-page-size="10" data-dx-page="1"');
    const listener = vi.fn();
    root.addEventListener("dx:page-change", listener);
    pageButton(root, 3).click();
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: { page: 3, skip: 20, top: 10, pageCount: 4, pageSize: 10 },
      }),
    );
    expect(root.getAttribute("data-dx-page")).toBe("3");
    expect(pageButton(root, 3).getAttribute("aria-current")).toBe("page");
    expect(pageButton(root, 1).hasAttribute("aria-current")).toBe(false);
    expect(root.querySelector("[data-dx-pager-summary]").textContent).toBe("Page 3 of 4 (35 items)");
    expect(root.querySelector("[data-dx-pager-prev]").disabled).toBe(false);
    expect(root.querySelector("[data-dx-pager-first]").disabled).toBe(false);
  });

  it("pages with next/prev/first/last and ignores clicks at the boundaries", () => {
    const root = pagerFixture('data-dx-count="35" data-dx-page-size="10" data-dx-page="1"');
    const listener = vi.fn();
    root.addEventListener("dx:page-change", listener);

    root.querySelector("[data-dx-pager-first]").click();
    expect(listener).not.toHaveBeenCalled();

    root.querySelector("[data-dx-pager-next]").click();
    expect(listener).toHaveBeenLastCalledWith(
      expect.objectContaining({ detail: expect.objectContaining({ page: 2, skip: 10 }) }),
    );

    root.querySelector("[data-dx-pager-last]").click();
    expect(listener).toHaveBeenLastCalledWith(
      expect.objectContaining({ detail: expect.objectContaining({ page: 4, skip: 30 }) }),
    );
    expect(root.querySelector("[data-dx-pager-next]").disabled).toBe(true);
    expect(root.querySelector("[data-dx-pager-last]").disabled).toBe(true);

    root.querySelector("[data-dx-pager-next]").click();
    expect(listener).toHaveBeenCalledTimes(2);

    root.querySelector("[data-dx-pager-prev]").click();
    expect(listener).toHaveBeenLastCalledWith(
      expect.objectContaining({ detail: expect.objectContaining({ page: 3, skip: 20 }) }),
    );
  });

  it("clamps an out-of-range current page", () => {
    const root = pagerFixture('data-dx-count="35" data-dx-page-size="10" data-dx-page="99"');
    expect(root.getAttribute("data-dx-page")).toBe("4");
    expect(root.querySelector("[data-dx-pager-summary]").textContent).toBe("Page 4 of 4 (35 items)");
    expect(root.querySelector("[data-dx-pager-next]").disabled).toBe(true);
  });

  it("hides itself for a single page unless always visible", () => {
    const hidden = pagerFixture('data-dx-count="5" data-dx-page-size="10" data-dx-page="1"');
    expect(hidden.hidden).toBe(true);

    const always = pagerFixture('data-dx-count="5" data-dx-page-size="10" data-dx-page="1" data-dx-always-visible');
    expect(always.hidden).toBe(false);
    expect(always.querySelector("[data-dx-pager-summary]").textContent).toBe("Page 1 of 1 (5 items)");
  });

  it("fires dx:page-size-change from the page-size select", () => {
    const root = pagerFixture('data-dx-count="35" data-dx-page-size="10" data-dx-page="1"');
    const listener = vi.fn();
    root.addEventListener("dx:page-size-change", listener);
    const select = root.querySelector("[data-dx-pager-size-select]");
    select.value = "20";
    select.dispatchEvent(new Event("change", { bubbles: true }));
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: { pageSize: 20 } }));
  });

  it("moves focus between control buttons with arrows, Home and End", () => {
    const root = pagerFixture('data-dx-count="35" data-dx-page-size="10" data-dx-page="1"');
    const controls = root.querySelector("[data-dx-pager-controls]");
    const first = root.querySelector("[data-dx-pager-first]");

    pageButton(root, 2).focus();
    key(controls, "ArrowRight");
    expect(document.activeElement).toBe(pageButton(root, 3));
    key(controls, "ArrowLeft");
    expect(document.activeElement).toBe(pageButton(root, 2));
    key(controls, "End");
    expect(document.activeElement).toBe(root.querySelector("[data-dx-pager-last]"));
    key(controls, "Home");
    expect(document.activeElement).toBe(pageButton(root, 1));
    expect(first.disabled).toBe(true);
  });

  it("hides the summary when data-dx-show-paging-summary is false", () => {
    const root = pagerFixture(
      'data-dx-count="35" data-dx-page-size="10" data-dx-page="1" data-dx-show-paging-summary="false"',
    );
    expect(root.querySelector("[data-dx-pager-summary]").hidden).toBe(true);
  });

  it("honours a custom paging summary format", () => {
    const root = pagerFixture(
      'data-dx-count="35" data-dx-page-size="10" data-dx-page="2" data-dx-paging-summary-format="Seite {0} von {1}"',
    );
    expect(root.querySelector("[data-dx-pager-summary]").textContent).toBe("Seite 2 von 4");
  });

  it("applies the horizontal alignment class", () => {
    expect(pagerFixture('data-dx-count="35" data-dx-page="1"').classList.contains("dx-pager--left")).toBe(true);
    expect(
      pagerFixture('data-dx-count="35" data-dx-page="1" data-dx-horizontal-align="center"').classList.contains(
        "dx-pager--center",
      ),
    ).toBe(true);
    expect(
      pagerFixture('data-dx-count="35" data-dx-page="1" data-dx-horizontal-align="justify"').classList.contains(
        "dx-pager--justify",
      ),
    ).toBe(true);
  });

  it("keeps ellipsis separators out of the accessibility tree", () => {
    const root = fixture(`
      <nav class="dx-pager" data-dx-pager data-dx-count="1000" data-dx-page-size="10" data-dx-page="5" aria-label="Pagination">
        <div class="dx-pager-controls" data-dx-pager-controls role="group" aria-label="Pagination">
          <button type="button" class="dx-pager-button" data-dx-pager-page data-dx-page="1">1</button>
          <span class="dx-pager-ellipsis" aria-hidden="true">…</span>
          <button type="button" class="dx-pager-button" data-dx-pager-page data-dx-page="100">100</button>
        </div>
      </nav>`);
    window.dxUikit.pager.init(root);
    const ellipsis = root.querySelector(".dx-pager-ellipsis");
    expect(ellipsis.getAttribute("aria-hidden")).toBe("true");
    expect(ellipsis.hasAttribute("tabindex")).toBe(false);
    expect(root.hidden).toBe(false);
  });
});
