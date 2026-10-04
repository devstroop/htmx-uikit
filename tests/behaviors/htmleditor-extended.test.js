import { describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

function stubExecCommand() {
  const calls = [];
  Object.defineProperty(document, "execCommand", {
    value: vi.fn((command, _showUI, value) => {
      calls.push([command, value]);
      return true;
    }),
    configurable: true,
    writable: true,
  });
  return calls;
}

function richFixture(extra = "") {
  return fixture(`
    <div class="dx-html-editor">
      <div data-dx-htmleditor-toolbar>
        <button type="button" data-dx-htmleditor-tool="bold">B</button>
        <button type="button" data-dx-htmleditor-tool="unorderedList">UL</button>
        <button type="button" data-dx-htmleditor-tool="justifyCenter">C</button>
        <button type="button" data-dx-htmleditor-tool="link">Link</button>
        <button type="button" data-dx-htmleditor-tool="image">Img</button>
        <button type="button" data-dx-htmleditor-tool="table">Tbl</button>
        <button type="button" data-dx-htmleditor-tool="custom:shout">!</button>
        <input type="color" data-dx-htmleditor-color="foreColor" aria-label="Text color" />
        <input type="color" data-dx-htmleditor-color="background" aria-label="Background color" />
        <select data-dx-htmleditor-select="formatBlock" aria-label="Format block">
          <option value="">Format</option>
          <option value="h1">h1</option>
        </select>
        <select data-dx-htmleditor-select="fontSize" aria-label="Font size">
          <option value="">Size</option>
          <option value="4">4</option>
        </select>
      </div>
      <div contenteditable="true" data-dx-htmleditor ${extra}><p>hi</p></div>
    </div>`);
}

function tool(root, name) {
  return root.querySelector(`[data-dx-htmleditor-tool="${name}"]`);
}

function closeDialogs() {
  window.dxDialog.closeAll();
}

describe("html editor extended toolbar", () => {
  it("extended exec tools dispatch their commands", () => {
    const calls = stubExecCommand();
    const root = richFixture();
    for (const name of ["unorderedList", "justifyCenter"]) {
      tool(root, name).dispatchEvent(
        new MouseEvent("click", { bubbles: true })
      );
    }
    expect(calls).toContainEqual(["insertUnorderedList", undefined]);
    expect(calls).toContainEqual(["justifyCenter", undefined]);
    closeDialogs();
  });

  it("color inputs apply foreColor/hiliteColor with the picked value", () => {
    const calls = stubExecCommand();
    const root = richFixture();
    const fore = root.querySelector('[data-dx-htmleditor-color="foreColor"]');
    fore.value = "#ff0000";
    fore.dispatchEvent(new Event("change", { bubbles: true }));
    const back = root.querySelector('[data-dx-htmleditor-color="background"]');
    back.value = "#00ff00";
    back.dispatchEvent(new Event("change", { bubbles: true }));
    expect(calls).toContainEqual(["foreColor", "#ff0000"]);
    expect(
      calls.some(
        ([command, value]) =>
          (command === "hiliteColor" || command === "backColor") &&
          value === "#00ff00"
      )
    ).toBe(true);
    closeDialogs();
  });

  it("selects dispatch block/font/size commands", () => {
    const calls = stubExecCommand();
    const root = richFixture();
    const block = root.querySelector('[data-dx-htmleditor-select="formatBlock"]');
    block.value = "h1";
    block.dispatchEvent(new Event("change", { bubbles: true }));
    const size = root.querySelector('[data-dx-htmleditor-select="fontSize"]');
    size.value = "4";
    size.dispatchEvent(new Event("change", { bubbles: true }));
    expect(
      calls.some(
        ([command, value]) =>
          command === "formatBlock" && (value === "<h1>" || value === "h1")
      )
    ).toBe(true);
    expect(calls).toContainEqual(["fontSize", "4"]);
    closeDialogs();
  });

  it("link dialog inserts then image dialog inserts by URL", async () => {
    stubExecCommand();
    const root = richFixture();
    const dlg = (label) =>
      [...document.querySelectorAll('[role="dialog"], dialog[open]')].find(
        (d) => d.textContent.includes(label)
      );
    tool(root, "link").dispatchEvent(
      new MouseEvent("click", { bubbles: true })
    );
    let dialog = dlg("Insert link");
    expect(dialog).not.toBeUndefined();
    dialog.querySelector('input[aria-label="Link URL"]') ||
      dialog.querySelector('input[type="url"]');
    const url = dialog.querySelector('input[type="url"]');
    url.value = "https://example.com";
    url.dispatchEvent(new Event("input", { bubbles: true }));
    [...dialog.querySelectorAll("button")].find((b) => b.textContent === "Insert").click();
    closeDialogs();
    tool(root, "image").dispatchEvent(
      new MouseEvent("click", { bubbles: true })
    );
    dialog = dlg("Insert image");
    const img = dialog.querySelector('input[type="url"]');
    img.value = "https://example.com/i.png";
    img.dispatchEvent(new Event("input", { bubbles: true }));
    [...dialog.querySelectorAll("button")].find((b) => b.textContent === "Insert").click();
    closeDialogs();
  });

  it("custom tools dispatch dx:htmleditor-tool with an api", () => {
    stubExecCommand();
    const root = richFixture();
    const seen = [];
    root
      .querySelector("[data-dx-htmleditor]")
      .addEventListener("dx:htmleditor-tool", (e) => seen.push(e.detail));
    tool(root, "custom:shout").dispatchEvent(
      new MouseEvent("click", { bubbles: true })
    );
    expect(seen.length).toBe(1);
    expect(seen[0].id).toBe("shout");
    expect(typeof seen[0].api.execCommand).toBe("function");
    seen[0].api.execCommand("bold");
    closeDialogs();
  });

  it("dxHtmlEditor.execute/getHtml drive a host by selector", () => {
    const calls = stubExecCommand();
    const root = richFixture();
    root.querySelector("[data-dx-htmleditor]").id = "ed-host";
    expect(window.dxHtmlEditor.execute("#ed-host", "italic")).toBe(true);
    expect(calls).toContainEqual(["italic", undefined]);
    expect(window.dxHtmlEditor.getHtml("#ed-host")).toBe("<p>hi</p>");
    expect(window.dxHtmlEditor.execute("#missing", "bold")).toBe(false);
    closeDialogs();
  });

  it("image upload posts the file and inserts the returned URL", async () => {
    const calls = stubExecCommand();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url, init) => ({
        ok: true,
        headers: { get: () => "application/json" },
        json: async () => ({ url: "https://cdn.example.com/i.png" }),
      }))
    );
    const root = richFixture('data-dx-htmleditor-upload-url="/upload"');
    tool(root, "image").dispatchEvent(
      new MouseEvent("click", { bubbles: true })
    );
    const dialog = [...document.querySelectorAll('[role="dialog"], dialog[open]')].find(
      (d) => d.textContent.includes("Insert image")
    );
    const fileInput = dialog.querySelector('input[type="file"]');
    expect(fileInput).not.toBeNull();
    const file = new File(["x"], "i.png", { type: "image/png" });
    Object.defineProperty(fileInput, "files", { value: [file] });
    fileInput.dispatchEvent(new Event("change", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));
    // The stubbed execCommand records instead of mutating the DOM.
    expect(calls).toContainEqual([
      "insertImage",
      "https://cdn.example.com/i.png",
    ]);
    closeDialogs();
    vi.unstubAllGlobals();
  });

  it("upload failure dispatches dx:htmleditor-error", async () => {
    stubExecCommand();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status: 500,
        headers: { get: () => "" },
      }))
    );
    const root = richFixture('data-dx-htmleditor-upload-url="/upload"');
    const seen = [];
    root
      .querySelector("[data-dx-htmleditor]")
      .addEventListener("dx:htmleditor-error", (e) => seen.push(e.detail));
    tool(root, "image").dispatchEvent(
      new MouseEvent("click", { bubbles: true })
    );
    const dialog = [...document.querySelectorAll('[role="dialog"], dialog[open]')].find(
      (d) => d.textContent.includes("Insert image")
    );
    const fileInput = dialog.querySelector('input[type="file"]');
    const file = new File(["x"], "i.png", { type: "image/png" });
    Object.defineProperty(fileInput, "files", { value: [file] });
    fileInput.dispatchEvent(new Event("change", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));
    expect(seen.length).toBe(1);
    expect(seen[0].message).toContain("500");
    closeDialogs();
    vi.unstubAllGlobals();
  });

  it("table dialog inserts an RxC table", () => {
    const calls = stubExecCommand();
    const root = richFixture();
    tool(root, "table").dispatchEvent(
      new MouseEvent("click", { bubbles: true })
    );
    const dialog = [...document.querySelectorAll('[role="dialog"], dialog[open]')].find(
      (d) => d.textContent.includes("Insert table")
    );
    expect(dialog).not.toBeUndefined();
    dialog.querySelectorAll('input[type="number"]')[0].value = "3";
    [...dialog.querySelectorAll("button")].find((b) => b.textContent === "Insert").click();
    const inserted = calls.find(([command]) => command === "insertHTML");
    expect(inserted).not.toBeUndefined();
    expect(inserted[1]).toContain("<table>");
    expect(inserted[1].match(/<tr>/g)?.length).toBe(3);
    expect(inserted[1].match(/<td>/g)?.length).toBe(6);
    closeDialogs();
  });
});
