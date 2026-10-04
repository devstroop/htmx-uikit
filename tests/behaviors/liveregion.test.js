import { describe, expect, it } from "vitest";
import "../../lib/behaviors.js";

describe("live region", () => {
  it("announce prepares a marked region (role/aria-live) and fills it", () => {
    document.body.innerHTML = "<div data-dx-live-region></div>";
    window.dxLiveRegion.announce("Row added");
    const el = document.querySelector("[data-dx-live-region]");
    expect(el.getAttribute("role")).toBe("status");
    expect(el.getAttribute("aria-live")).toBe("polite");
    expect(el.textContent).toBe("Row added");
  });

  it("announce creates a single region on body and overwrites on repeat", () => {
    document.body.innerHTML = "";
    window.dxLiveRegion.announce("First");
    window.dxLiveRegion.announce("Second");
    const el = document.querySelector("[data-dx-live-region]");
    expect(el).not.toBeNull();
    expect(el.textContent).toBe("Second");
    expect(
      document.querySelectorAll("[data-dx-live-region]").length
    ).toBe(1);
  });

  it("announce targets a caller-supplied container's region when given", () => {
    document.body.innerHTML =
      '<section><div data-dx-live-region></div></section><div data-dx-live-region></div>';
    const scope = document.querySelector("section");
    window.dxLiveRegion.announce("Scoped", scope);
    const inScope = scope.querySelector("[data-dx-live-region]");
    expect(inScope.textContent).toBe("Scoped");
    // The document-level region is untouched.
    expect(document.body.lastElementChild.textContent).toBe("");
  });
});
