import { beforeAll } from "vitest";

class SimpleDataTransfer {
  constructor() {
    this.items = { add: (file) => this._files.push(file), length: 0 };
    this._files = [];
    this._data = {};
    this.items.add = (file) => {
      this._files.push(file);
      this.items.length = this._files.length;
    };
    this.files = this._files;
  }
  getData(type) {
    return this._data[type] ?? "";
  }
  setData(type, value) {
    this._data[type] = value;
  }
}

beforeAll(() => {
  if (typeof HTMLDialogElement.prototype.showModal !== "function") {
    HTMLDialogElement.prototype.showModal = function () {
      this.open = true;
    };
  }
  if (typeof HTMLDialogElement.prototype.close !== "function") {
    HTMLDialogElement.prototype.close = function () {
      this.open = false;
      this.dispatchEvent(new Event("close"));
    };
  }
  if (typeof window.DataTransfer === "undefined") {
    window.DataTransfer = SimpleDataTransfer;
  }
  if (typeof window.DragEvent === "undefined") {
    window.DragEvent = class extends MouseEvent {
      constructor(type, init = {}) {
        super(type, init);
        this.dataTransfer = init.dataTransfer ?? null;
      }
    };
  }
  if (typeof window.ClipboardEvent === "undefined") {
    window.ClipboardEvent = class extends Event {
      constructor(type, init = {}) {
        super(type, init);
        this.clipboardData = init.clipboardData ?? null;
      }
    };
  }
});
