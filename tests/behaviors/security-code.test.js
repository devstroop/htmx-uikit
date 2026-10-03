import { beforeEach, describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

describe("security code", () => {
  function codeFixture(attrs = "", len = 6) {
    const cells = Array.from({ length: len }, () => '<input class="dx-securitycode-cell" type="text" inputmode="numeric" maxlength="1" data-dx-securitycode-cell />').join("");
    const root = fixture(`<div class="dx-securitycode" data-dx-securitycode ${attrs} role="group" aria-label="Security code"><span class="dx-securitycode-live" data-dx-securitycode-live role="status" aria-live="polite"></span>${cells}</div>`);
    window.dxUikit.securitycode.init(root);
    return root;
  }

  function cells(root) {
    return [...root.querySelectorAll("[data-dx-securitycode-cell]")];
  }

  it("labels every cell with its position", () => {
    const root = codeFixture("", 4);
    expect(root.querySelectorAll("[data-dx-securitycode-cell]").length).toBe(4);
    cells(root).forEach((c, i) => {
      expect(c.getAttribute("aria-label")).toBe(`Digit ${i + 1} of 4`);
    });
  });

  it("fills a digit, advances focus, and dispatches dx:change", () => {
    const root = codeFixture();
    const detail = [];
    root.addEventListener("dx:change", (e) => detail.push(e.detail.value));
    const first = cells(root)[0];
    first.focus();
    first.value = "1";
    first.dispatchEvent(new Event("input", { bubbles: true }));
    expect(cells(root)[0].value).toBe("1");
    expect(document.activeElement).toBe(cells(root)[1]);
    expect(detail).toEqual(["1"]);
  });

  it("backspaces to the previous cell and clears it", () => {
    const root = codeFixture();
    const [c1, c2] = cells(root);
    c1.value = "1";
    c2.value = "2";
    c2.focus();
    c2.dispatchEvent(new KeyboardEvent("keydown", { key: "Backspace", bubbles: true, cancelable: true }));
    expect(c2.value).toBe("");
    c2.dispatchEvent(new KeyboardEvent("keydown", { key: "Backspace", bubbles: true, cancelable: true }));
    expect(c1.value).toBe("");
    expect(document.activeElement).toBe(c1);
  });

  it("navigates with arrows and Home/End", () => {
    const root = codeFixture();
    const cellsList = cells(root);
    cellsList[2].focus();
    cellsList[2].dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(cellsList[3]);
    cellsList[3].dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(cellsList[2]);
    cellsList[2].dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(cellsList[5]);
    cellsList[5].dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(cellsList[0]);
  });

  it("splits a pasted code across cells and announces completion", () => {
    const root = codeFixture("", 6);
    const detail = [];
    root.addEventListener("dx:change", (e) => detail.push(e.detail.value));
    const first = cells(root)[0];
    first.focus();
    first.dispatchEvent(new ClipboardEvent("paste", { bubbles: true, cancelable: true, clipboardData: new DataTransfer() }));
    const dt = new DataTransfer();
    dt.setData("text", "123456");
    first.dispatchEvent(new ClipboardEvent("paste", { bubbles: true, cancelable: true, clipboardData: dt }));
    expect(cells(root).map((c) => c.value).join("")).toBe("123456");
    expect(detail[detail.length - 1]).toBe("123456");
    expect(root.querySelector("[data-dx-securitycode-live]").textContent).toBe("Code complete");
  });

  it("ignores input when disabled", () => {
    const root = codeFixture("data-dx-disabled", 4);
    let fired = false;
    root.addEventListener("dx:change", () => (fired = true));
    const first = cells(root)[0];
    first.value = "9";
    first.dispatchEvent(new Event("input", { bubbles: true }));
    first.dispatchEvent(new KeyboardEvent("keydown", { key: "Backspace", bubbles: true, cancelable: true }));
    expect(first.value).toBe("9");
    expect(fired).toBe(false);
  });
});
