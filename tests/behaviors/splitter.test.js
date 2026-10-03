import { describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

describe("splitter", () => {
  const splitterFixture = ({ orientation = "horizontal", collapseButton = true } = {}) => {
    const vertical = orientation === "vertical";
    const first = vertical ? { size: "40%", min: "10%", max: "70%" } : { size: "50%", min: "20%", max: "80%" };
    const second = vertical ? { size: "60%", min: "10%", max: "90%" } : { size: "50%", min: "20%", max: "80%" };
    const root = fixture(`
      <div class="dx-splitter dx-splitter--${orientation}" data-dx-splitter data-dx-orientation="${orientation}" aria-label="Splitter">
        <div class="dx-splitter-pane" role="group" data-dx-splitter-pane data-dx-index="0"
             data-dx-size="${first.size}" data-dx-min="${first.min}" data-dx-max="${first.max}" data-dx-collapsible
             style="flex-basis: ${first.size}">
          <div class="dx-splitter-content">Pane 1 content</div>
          ${collapseButton ? '<button type="button" data-dx-splitter-collapse data-dx-index="0" aria-label="Collapse pane 1" aria-expanded="true">x</button>' : ""}
        </div>
        <div class="dx-splitter-handle" data-dx-splitter-handle data-dx-index="0" tabindex="0">
          <span class="dx-splitter-grip" aria-hidden="true"></span>
        </div>
        <div class="dx-splitter-pane" role="group" data-dx-splitter-pane data-dx-index="1"
             data-dx-size="${second.size}" data-dx-min="${second.min}" data-dx-max="${second.max}"
             style="flex-basis: ${second.size}">
          <div class="dx-splitter-content">Pane 2 content</div>
        </div>
      </div>`);
    window.dxUikit.splitter.init(root);
    return root;
  };

  const panes = (root) => [...root.querySelectorAll("[data-dx-splitter-pane]")];
  const handle = (root) => root.querySelector("[data-dx-splitter-handle]");
  const keydown = (el, key) => el.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));

  it("renders pane sizes and separator semantics on init", () => {
    const root = splitterFixture();
    expect(root._dxSplitter.ready).toBe(true);
    expect(panes(root)[0].style.flexBasis).toBe("50%");
    expect(panes(root)[1].style.flexBasis).toBe("50%");
    expect(panes(root)[0].getAttribute("aria-label")).toBe("Pane 1");
    expect(panes(root)[1].getAttribute("aria-label")).toBe("Pane 2");
    const sep = handle(root);
    expect(sep.getAttribute("role")).toBe("separator");
    expect(sep.getAttribute("aria-orientation")).toBe("horizontal");
    expect(sep.getAttribute("aria-valuemin")).toBe("20");
    expect(sep.getAttribute("aria-valuemax")).toBe("80");
    expect(sep.getAttribute("aria-valuenow")).toBe("50");
    expect(sep.getAttribute("aria-label")).toBe("Resize handle 1");
    expect(sep.tabIndex).toBe(0);
  });

  it("is idempotent on re-init", () => {
    const root = splitterFixture();
    panes(root)[0].style.flexBasis = "35%";
    window.dxUikit.splitter.init(root);
    expect(panes(root)[0].style.flexBasis).toBe("35%");
  });

  it("resizes by 5% with arrow keys and fires dx:splitter-resize", () => {
    const root = splitterFixture();
    const listener = vi.fn();
    root.addEventListener("dx:splitter-resize", listener);
    keydown(handle(root), "ArrowRight");
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { paneIndex: 0, newSize: 55, cancel: false } })
    );
    expect(panes(root)[0].style.flexBasis).toBe("55%");
    expect(panes(root)[1].style.flexBasis).toBe("45%");
    expect(handle(root).getAttribute("aria-valuenow")).toBe("55");
    keydown(handle(root), "ArrowLeft");
    expect(handle(root).getAttribute("aria-valuenow")).toBe("50");
    expect(panes(root)[0].style.flexBasis).toBe("50%");
  });

  it("clamps arrow resizing to the pane min and max", () => {
    const root = splitterFixture();
    const listener = vi.fn();
    root.addEventListener("dx:splitter-resize", listener);
    for (let i = 0; i < 20; i++) keydown(handle(root), "ArrowRight");
    expect(handle(root).getAttribute("aria-valuenow")).toBe("80");
    for (let i = 0; i < 20; i++) keydown(handle(root), "ArrowLeft");
    expect(handle(root).getAttribute("aria-valuenow")).toBe("20");
    expect(listener).toHaveBeenCalled();
  });

  it("jumps to min and max with Home and End", () => {
    const root = splitterFixture();
    const listener = vi.fn();
    root.addEventListener("dx:splitter-resize", listener);
    keydown(handle(root), "End");
    expect(listener).toHaveBeenLastCalledWith(
      expect.objectContaining({ detail: { paneIndex: 0, newSize: 80, cancel: false } })
    );
    expect(handle(root).getAttribute("aria-valuenow")).toBe("80");
    keydown(handle(root), "Home");
    expect(listener).toHaveBeenLastCalledWith(
      expect.objectContaining({ detail: { paneIndex: 0, newSize: 20, cancel: false } })
    );
    expect(handle(root).getAttribute("aria-valuenow")).toBe("20");
  });

  it("lets a dx:splitter-resize listener cancel the resize", () => {
    const root = splitterFixture();
    root.addEventListener("dx:splitter-resize", (e) => {
      e.detail.cancel = true;
    });
    keydown(handle(root), "ArrowRight");
    expect(handle(root).getAttribute("aria-valuenow")).toBe("50");
    expect(panes(root)[0].style.flexBasis).toBe("50%");
  });

  it("collapses a pane from its collapse button and fires dx:splitter-collapse", () => {
    const root = splitterFixture();
    const listener = vi.fn();
    root.addEventListener("dx:splitter-collapse", listener);
    const collapseBtn = root.querySelector("[data-dx-splitter-collapse]");
    collapseBtn.click();
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { paneIndex: 0, collapse: true, cancel: false } })
    );
    expect(panes(root)[0].style.display).toBe("none");
    expect(panes(root)[0].hasAttribute("data-dx-collapsed")).toBe(true);
    expect(panes(root)[0].classList.contains("dx-splitter-pane--collapsed")).toBe(true);
    expect(panes(root)[1].style.flexBasis).toBe("100%");
    expect(collapseBtn.getAttribute("aria-expanded")).toBe("false");
    expect(collapseBtn.getAttribute("aria-label")).toBe("Expand pane 1");
    expect(handle(root).getAttribute("aria-valuenow")).toBe("0");
    expect(handle(root).tabIndex).toBe(-1);
  });

  it("restores the previous sizes when expanding again", () => {
    const root = splitterFixture();
    const collapseBtn = root.querySelector("[data-dx-splitter-collapse]");
    collapseBtn.click();
    collapseBtn.click();
    expect(panes(root)[0].style.display).toBe("");
    expect(panes(root)[0].hasAttribute("data-dx-collapsed")).toBe(false);
    expect(panes(root)[0].style.flexBasis).toBe("50%");
    expect(panes(root)[1].style.flexBasis).toBe("50%");
    expect(collapseBtn.getAttribute("aria-expanded")).toBe("true");
    expect(collapseBtn.getAttribute("aria-label")).toBe("Collapse pane 1");
    expect(handle(root).tabIndex).toBe(0);
  });

  it("lets a dx:splitter-collapse listener cancel the toggle", () => {
    const root = splitterFixture();
    root.addEventListener("dx:splitter-collapse", (e) => {
      e.detail.cancel = true;
    });
    root.querySelector("[data-dx-splitter-collapse]").click();
    expect(panes(root)[0].style.display).toBe("");
    expect(panes(root)[0].style.flexBasis).toBe("50%");
    expect(handle(root).getAttribute("aria-valuenow")).toBe("50");
  });

  it("toggles collapse from the handle with Enter when a pane is collapsible", () => {
    const root = splitterFixture();
    const listener = vi.fn();
    root.addEventListener("dx:splitter-collapse", listener);
    keydown(handle(root), "Enter");
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { paneIndex: 0, collapse: true, cancel: false } })
    );
    expect(panes(root)[0].style.display).toBe("none");
    keydown(handle(root), "Enter");
    expect(listener).toHaveBeenLastCalledWith(
      expect.objectContaining({ detail: { paneIndex: 0, collapse: false, cancel: false } })
    );
    expect(panes(root)[0].style.display).toBe("");
  });

  it("uses vertical keyboard orientation for a vertical splitter", () => {
    const root = splitterFixture({ orientation: "vertical" });
    const listener = vi.fn();
    root.addEventListener("dx:splitter-resize", listener);
    expect(handle(root).getAttribute("aria-orientation")).toBe("vertical");
    keydown(handle(root), "ArrowDown");
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { paneIndex: 0, newSize: 45, cancel: false } })
    );
    expect(panes(root)[0].style.flexBasis).toBe("45%");
    keydown(handle(root), "ArrowUp");
    expect(handle(root).getAttribute("aria-valuenow")).toBe("40");
  });

  it("resizes while dragging the handle with pointer events", () => {
    const root = splitterFixture();
    root.getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 100, right: 200, bottom: 100 });
    const listener = vi.fn();
    root.addEventListener("dx:splitter-resize", listener);
    const sep = handle(root);
    sep.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true, clientX: 100, clientY: 50 }));
    sep.dispatchEvent(new MouseEvent("pointermove", { bubbles: true, clientX: 140, clientY: 50 }));
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { paneIndex: 0, newSize: 70, cancel: false } })
    );
    expect(panes(root)[0].style.flexBasis).toBe("70%");
    expect(panes(root)[1].style.flexBasis).toBe("30%");
    sep.dispatchEvent(new MouseEvent("pointerup", { bubbles: true, clientX: 140, clientY: 50 }));
    sep.dispatchEvent(new MouseEvent("pointermove", { bubbles: true, clientX: 190, clientY: 50 }));
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
