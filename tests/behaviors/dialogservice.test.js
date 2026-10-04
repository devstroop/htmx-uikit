import { afterEach, describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

function host() {
  return document.querySelector("dialog[data-dx-dialog-service]");
}

afterEach(() => {
  window.dxDialog.closeAll();
  vi.unstubAllGlobals();
});

describe("dialog service", () => {
  it("open renders a host with title and content", async () => {
    const done = window.dxDialog.open({
      title: "Custom",
      content: "<p>arbitrary body</p>",
    });
    expect(host()).not.toBeNull();
    expect(host().querySelector(".dx-dialog-title").textContent).toBe(
      "Custom"
    );
    expect(host().querySelector(".dx-dialog-body").textContent).toContain(
      "arbitrary body"
    );
    window.dxDialog.close();
    await expect(done).resolves.toBeUndefined();
    expect(host()).not.toBeNull();
  });

  it("close(result) resolves the open promise and fires dx:close", async () => {
    const seen = [];
    const done = window.dxDialog.open({ title: "Pick" });
    host().addEventListener("dx:close", (e) => seen.push(e.detail));
    window.dxDialog.close("picked");
    await expect(done).resolves.toBe("picked");
    expect(seen).toEqual([{ result: "picked" }]);
  });

  it("closeAll empties the queue and settles every promise", async () => {
    const results = [];
    const a = window.dxDialog.open({ title: "One" });
    const b = window.dxDialog.open({ title: "Two" });
    void a.then((r) => results.push(r));
    void b.then((r) => results.push(r));
    window.dxDialog.closeAll();
    await a;
    await b;
    expect(results).toEqual([undefined, undefined]);
    expect(
      document.querySelectorAll("dialog[data-dx-dialog-service]").length
    ).toBe(2);
  });

  it("alert resolves on the OK button", async () => {
    const done = window.dxDialog.alert({ message: "Saved." });
    expect(host().textContent).toContain("Saved.");
    host().querySelector(".dx-dialog-footer button").click();
    await expect(done).resolves.toBeUndefined();
  });

  it("confirm resolves true/false on its buttons", async () => {
    const yes = window.dxDialog.confirm({ message: "Delete?" });
    const buttons = host().querySelectorAll(".dx-dialog-footer button");
    expect(buttons.length).toBe(2);
    buttons[1].click();
    await expect(yes).resolves.toBe(true);

    const no = window.dxDialog.confirm({ message: "Delete?" });
    document
      .querySelectorAll("dialog[data-dx-dialog-service]")[1]
      .querySelector(".dx-dialog-footer button")
      .click();
    await expect(no).resolves.toBe(false);
  });

  it("fetch fragment urls into the body", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ text: async () => "<p>server fragment</p>" }))
    );
    fixture("<main><p>page</p></main>");
    const done = window.dxDialog.open({ title: "Remote", url: "/frag" });
    await new Promise((r) => setTimeout(r, 0));
    expect(host().querySelector(".dx-dialog-body").textContent).toContain(
      "server fragment"
    );
    window.dxDialog.close();
    await done;
  });

  it("openSide docks the panel and keeps the service contract", async () => {
    const done = window.dxDialog.openSide({
      position: "right",
      title: "Rail",
      content: "side content",
    });
    expect(host().classList.contains("dx-dialog--side-right")).toBe(true);
    expect(host().textContent).toContain("side content");
    window.dxDialog.close("done");
    await expect(done).resolves.toBe("done");
  });

  it("refresh replaces the top body content", () => {
    window.dxDialog.open({ title: "R", content: "old" });
    const el = window.dxDialog.refresh("new");
    expect(el.querySelector(".dx-dialog-body").textContent).toBe("new");
    expect(window.dxDialog.refresh()).toBe(el);
    window.dxDialog.closeAll();
  });

  it("cancel (ESC) settles instead of closing silently", async () => {
    const done = window.dxDialog.open({ title: "Esc" });
    const el = host();
    el.dispatchEvent(new Event("cancel", { cancelable: true }));
    await expect(done).resolves.toBeUndefined();
  });
});
