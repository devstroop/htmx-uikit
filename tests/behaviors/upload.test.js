import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

describe("upload", () => {
  function uploadFixture(attrs = "") {
    return fixture(`
      <div class="dx-upload" data-dx-upload data-dx-upload-url="/api/files" ${attrs}>
        <button class="dx-upload-trigger" type="button" data-dx-upload-trigger>Upload</button>
        <input class="dx-upload-input" type="file" hidden data-dx-upload-input />
        <ul class="dx-upload-list" data-dx-upload-list></ul>
      </div>`);
  }

  function mockXhr() {
    const xhr = {
      upload: { addEventListener: vi.fn() },
      addEventListener: vi.fn(),
      setRequestHeader: vi.fn(),
      open: vi.fn(),
      send: vi.fn(),
      status: 200,
    };
    const MockXHR = vi.fn(function () {
      return xhr;
    });
    vi.stubGlobal("XMLHttpRequest", MockXHR);
    return xhr;
  }

  function selectFile(root, name, size = 1024, type = "") {
    const input = root.querySelector("[data-dx-upload-input]");
    const file = new File([new Uint8Array(size)], name, { type });
    Object.defineProperty(input, "files", { value: [file], configurable: true });
    input.dispatchEvent(new Event("change", { bubbles: true }));
    return file;
  }

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("opens the picker when the trigger is clicked", () => {
    const root = uploadFixture();
    const input = root.querySelector("[data-dx-upload-input]");
    input.click = vi.fn();
    root.querySelector("[data-dx-upload-trigger]").click();
    expect(input.click).toHaveBeenCalled();
  });

  it("adds a row per selected file and auto-uploads", () => {
    const root = uploadFixture('data-dx-upload-auto="true"');
    mockXhr();
    selectFile(root, "report.pdf", 2048);
    const row = root.querySelector("[data-dx-upload-row]");
    expect(row).not.toBeNull();
    expect(row.querySelector(".dx-upload-name").textContent).toBe("report.pdf");
    expect(row.querySelector(".dx-upload-size").textContent).toBe("2 KB");
  });

  it("fires progress and complete events during an upload", () => {
    const root = uploadFixture('data-dx-upload-auto="true"');
    const xhr = mockXhr();
    const progress = [];
    const complete = [];
    root.addEventListener("dx:upload-progress", (e) => progress.push(e.detail.progress));
    root.addEventListener("dx:upload-complete", (e) => complete.push(e.detail.name));
    selectFile(root, "a.txt", 1024);
    const progressCb = xhr.upload.addEventListener.mock.calls.find((c) => c[0] === "progress")[1];
    const loadCb = xhr.addEventListener.mock.calls.find((c) => c[0] === "load")[1];
    progressCb({ lengthComputable: true, loaded: 512, total: 1024 });
    expect(progress).toEqual([50]);
    loadCb();
    expect(complete).toEqual(["a.txt"]);
    expect(root.querySelector(".dx-upload-row").dataset.dxUploadState).toBe("complete");
  });

  it("fires the error event on a failed request", () => {
    const root = uploadFixture('data-dx-upload-auto="true"');
    const xhr = mockXhr();
    const errors = [];
    root.addEventListener("dx:upload-error", (e) => errors.push(e.detail.message));
    selectFile(root, "b.txt", 1024);
    const loadCb = xhr.addEventListener.mock.calls.find((c) => c[0] === "load")[1];
    xhr.status = 500;
    loadCb();
    expect(errors).toEqual(["HTTP 500"]);
    expect(root.querySelector(".dx-upload-row").dataset.dxUploadState).toBe("error");
  });

  it("removes a row and dispatches the cancel event", () => {
    const root = uploadFixture('data-dx-upload-auto="false"');
    mockXhr();
    let cancelled = null;
    root.addEventListener("dx:upload-cancel", (e) => (cancelled = e.detail.name));
    selectFile(root, "c.txt", 1024);
    const remove = root.querySelector("[data-dx-upload-remove]");
    expect(remove.getAttribute("aria-label")).toBe("Remove c.txt");
    remove.click();
    expect(root.querySelectorAll("[data-dx-upload-row]").length).toBe(0);
    expect(cancelled).toBe("c.txt");
  });

  it("sends the files field with the parameter name", () => {
    const root = uploadFixture('data-dx-upload-auto="true" data-dx-upload-param="attachment"');
    const xhr = mockXhr();
    selectFile(root, "d.txt", 1024);
    const fd = xhr.send.mock.calls[0][0];
    expect(fd.get("attachment")).toBeInstanceOf(File);
  });
});
