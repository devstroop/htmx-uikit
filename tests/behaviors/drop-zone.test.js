import { beforeEach, describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

describe("drop zone", () => {
  function dropFixture(attrs = "") {
    return fixture(`
      <div class="dx-dropzone" data-dx-dropzone ${attrs} role="region" aria-label="Drop files here">
        <p class="dx-dropzone-caption" data-dx-dropzone-caption>Drop files here</p>
        <button class="dx-dropzone-browse" type="button" data-dx-dropzone-browse>Browse</button>
        <input class="dx-dropzone-input" type="file" hidden data-dx-dropzone-input />
      </div>`);
  }

  function dropEvent(files) {
    const dt = new DataTransfer();
    for (const f of files) dt.items.add(f);
    return new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: dt });
  }

  it("flips the dragging visual on dragenter and back on dragleave", () => {
    const root = dropFixture();
    root.dispatchEvent(new DragEvent("dragenter", { bubbles: true, cancelable: true }));
    expect(root.classList.contains("dx-dropzone--dragging")).toBe(true);
    root.dispatchEvent(new DragEvent("dragleave", { bubbles: true, cancelable: true }));
    expect(root.classList.contains("dx-dropzone--dragging")).toBe(false);
  });

  it("fires dx:dropzone-drop with the FileList on drop", () => {
    const root = dropFixture();
    let files = null;
    root.addEventListener("dx:dropzone-drop", (e) => (files = e.detail.files));
    root.dispatchEvent(dropEvent([new File(["x"], "a.txt", { type: "text/plain" })]));
    expect(files.length).toBe(1);
    expect(files[0].name).toBe("a.txt");
    expect(root.classList.contains("dx-dropzone--dragging")).toBe(false);
  });

  it("filters files by accept", () => {
    const root = dropFixture('data-dx-dropzone-accept="image/*"');
    let files = null;
    root.addEventListener("dx:dropzone-drop", (e) => (files = e.detail.files));
    root.dispatchEvent(
      dropEvent([
        new File(["x"], "photo.png", { type: "image/png" }),
        new File(["x"], "doc.pdf", { type: "application/pdf" }),
      ]),
    );
    expect(files.length).toBe(1);
    expect(files[0].name).toBe("photo.png");
  });

  it("opens the picker via the browse button and fires drop on selection", () => {
    const root = dropFixture();
    const input = root.querySelector("[data-dx-dropzone-input]");
    input.click = vi.fn();
    root.querySelector("[data-dx-dropzone-browse]").click();
    expect(input.click).toHaveBeenCalled();
    const file = new File(["x"], "b.txt", { type: "text/plain" });
    Object.defineProperty(input, "files", { value: [file], configurable: true });
    let files = null;
    root.addEventListener("dx:dropzone-drop", (e) => (files = e.detail.files));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    expect(files[0].name).toBe("b.txt");
  });

  it("ignores drag events when disabled", () => {
    const root = dropFixture("data-dx-dropzone-disabled");
    root.dispatchEvent(new DragEvent("dragenter", { bubbles: true, cancelable: true }));
    expect(root.classList.contains("dx-dropzone--dragging")).toBe(false);
  });
});
