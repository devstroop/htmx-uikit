import { describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

function panel() {
  return document.querySelector(".dx-popup");
}

describe("popup", () => {
  it("open builds a labelled panel against the anchor", () => {
    fixture('<button type="button" id="anchor">Open</button>');
    const anchor = document.querySelector("#anchor");
    const close = window.dxPopup.open(anchor, "<p>panel body</p>");
    const el = panel();
    expect(el).not.toBeNull();
    expect(el.getAttribute("role")).toBe("dialog");
    expect(el.getAttribute("aria-label")).toBe("Popup");
    expect(el.textContent).toContain("panel body");
    expect(el.style.position).toBe("fixed");
    expect(window.dxPopup.isOpen).toBe(true);
    expect(typeof close).toBe("function");
    close();
    expect(window.dxPopup.isOpen).toBe(false);
  });

  it("accepts a selector anchor and fires open/close events", () => {
    const seen = [];
    fixture('<button type="button" id="anchor">Open</button>');
    window.dxPopup.open("#anchor", "hi", {
      onOpen: () => seen.push("open"),
      onClose: () => seen.push("close"),
    });
    expect(panel()).not.toBeNull();
    expect(seen).toEqual(["open"]);
    window.dxPopup.close();
    expect(seen).toEqual(["open", "close"]);
  });

  it("returns null for a missing anchor", () => {
    expect(window.dxPopup.open("#nope", "hi")).toBeNull();
    expect(window.dxPopup.isOpen).toBe(false);
  });

  it("Escape closes and restores focus to the invoker", () => {
    fixture('<button type="button" id="anchor">Open</button>');
    const anchor = document.querySelector("#anchor");
    anchor.focus();
    window.dxPopup.open(anchor, "hi");
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })
    );
    expect(window.dxPopup.isOpen).toBe(false);
    expect(document.activeElement).toBe(anchor);
  });

  it("outside pointerdown closes without restoring focus", () => {
    fixture('<button type="button" id="anchor">Open</button>');
    document.querySelector("#anchor").focus();
    const opened = [];
    window.dxPopup.open("#anchor", "hi", {
      onOpen: () => opened.push(true),
    });
    expect(opened).toEqual([true]);
    document.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    expect(window.dxPopup.isOpen).toBe(false);
  });

  it("trigger attribute opens against itself", () => {
    fixture(
      `<button type="button" data-dx-popup="#tpl">Open</button><div id="tpl" hidden><p>tpl body</p></div>`
    );
    const trigger = document.querySelector("[data-dx-popup]");
    trigger.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    expect(panel()).not.toBeNull();
    expect(panel().textContent).toContain("tpl body");
    window.dxPopup.close();
  });

  it("inline html trigger opens with the given markup", () => {
    fixture(
      `<button type="button" data-dx-popup-html="<p>inline</p>">Open</button>`
    );
    document
      .querySelector("[data-dx-popup-html]")
      .dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    expect(panel().textContent).toContain("inline");
    window.dxPopup.close();
  });

  it("applies width/height/className options", () => {
    fixture('<button type="button" id="anchor">Open</button>');
    window.dxPopup.open("#anchor", "hi", {
      width: 320,
      height: "50vh",
      cssClass: "extra one",
    });
    const el = panel();
    expect(el.style.width).toBe("320px");
    expect(el.style.height).toBe("50vh");
    expect(el.classList.contains("extra")).toBe(true);
    window.dxPopup.close();
  });
});
