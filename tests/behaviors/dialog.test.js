import { beforeEach, describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

describe("dialog", () => {
  it("opens the referenced dialog from [data-dx-dialog-open]", () => {
    fixture(`
      <button data-dx-dialog-open="#d">Open</button>
      <dialog data-dx-dialog id="d"></dialog>`);
    const dialog = document.querySelector("#d");
    document.querySelector("[data-dx-dialog-open]").click();
    expect(dialog.open).toBe(true);
  });

  it("closes on [data-dx-dialog-close] and returns focus to the opener", () => {
    fixture(`
      <button data-dx-dialog-open="#d">Open</button>
      <dialog data-dx-dialog id="d"><button data-dx-dialog-close>Close</button></dialog>`);
    const opener = document.querySelector("[data-dx-dialog-open]");
    const dialog = document.querySelector("#d");
    opener.click();
    const focusSpy = vi.spyOn(opener, "focus");
    dialog.querySelector("[data-dx-dialog-close]").click();
    expect(dialog.open).toBe(false);
    expect(focusSpy).toHaveBeenCalled();
  });
});
