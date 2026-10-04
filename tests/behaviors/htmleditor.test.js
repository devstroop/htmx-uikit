import { describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

function stubExecCommand() {
  const calls = [];
  Object.defineProperty(document, "execCommand", {
    value: vi.fn((command) => {
      calls.push(command);
      return true;
    }),
    configurable: true,
    writable: true,
  });
  return calls;
}

function editorFixture(extra = "") {
  return fixture(`
    <div class="dx-html-editor">
      <div data-dx-htmleditor-toolbar>
        <button type="button" data-dx-htmleditor-tool="bold">B</button>
        <button type="button" data-dx-htmleditor-tool="italic">I</button>
        <button type="button" data-dx-htmleditor-tool="source">S</button>
      </div>
      <div contenteditable="true" data-dx-htmleditor ${extra}><p>hi</p></div>
    </div>`);
}

describe("html editor", () => {
  it("dispatches execCommand for toolbar tools", () => {
    const calls = stubExecCommand();
    const root = editorFixture();
    root
      .querySelector('[data-dx-htmleditor-tool="bold"]')
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    root
      .querySelector('[data-dx-htmleditor-tool="italic"]')
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(calls).toEqual(["bold", "italic"]);
  });

  it("skips silently when execCommand is unavailable", () => {
    const root = editorFixture();
    expect(() =>
      root
        .querySelector('[data-dx-htmleditor-tool="bold"]')
        .dispatchEvent(new MouseEvent("click", { bubbles: true }))
    ).not.toThrow();
  });

  it("emits dx:htmleditor-change with the value on input and tool runs", () => {
    stubExecCommand();
    const root = editorFixture();
    const seen = [];
    root
      .querySelector("[data-dx-htmleditor]")
      .addEventListener("dx:htmleditor-change", (e) => seen.push(e.detail));
    const host = root.querySelector("[data-dx-htmleditor]");
    host.innerHTML = "<p>edited</p>";
    host.dispatchEvent(new Event("input", { bubbles: true }));
    expect(seen.at(-1)).toEqual({ value: "<p>edited</p>" });
    root
      .querySelector('[data-dx-htmleditor-tool="bold"]')
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(seen.at(-1)).toEqual({ value: "<p>edited</p>" });
  });

  it("syncs a configured input target", () => {
    stubExecCommand();
    const root = editorFixture('data-dx-htmleditor-input="#ed-input"');
    const input = document.createElement("input");
    input.id = "ed-input";
    root.appendChild(input);
    const host = root.querySelector("[data-dx-htmleditor]");
    host.innerHTML = "<p>synced</p>";
    host.dispatchEvent(new Event("input", { bubbles: true }));
    expect(input.value).toBe("<p>synced</p>");
  });

  it("source toggle swaps to a textarea mirror and back", () => {
    const root = editorFixture();
    const host = root.querySelector("[data-dx-htmleditor]");
    const tool = root.querySelector('[data-dx-htmleditor-tool="source"]');
    tool.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(host.hidden).toBe(true);
    const area = root.querySelector("textarea[data-dx-htmleditor-source]");
    expect(area).not.toBeNull();
    expect(area.value).toBe("<p>hi</p>");
    area.value = "<p>bye</p>";
    tool.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(host.hidden).toBe(false);
    expect(host.innerHTML).toBe("<p>bye</p>");
  });

  it("ctrl+b/i/u run the matching command", () => {
    const calls = stubExecCommand();
    const root = editorFixture();
    const host = root.querySelector("[data-dx-htmleditor]");
    for (const key of ["b", "u"]) {
      host.dispatchEvent(
        new KeyboardEvent("keydown", {
          key,
          ctrlKey: true,
          bubbles: true,
          cancelable: true,
        })
      );
    }
    expect(calls).toEqual(["bold", "underline"]);
  });
});
