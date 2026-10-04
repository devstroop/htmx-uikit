import { beforeEach, describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

function stubMatchMedia(matches) {
  const listeners = new Set();
  const list = {
    matches,
    media: "",
    addEventListener: vi.fn((_type, fn) => listeners.add(fn)),
    removeEventListener: vi.fn((_type, fn) => listeners.delete(fn)),
    addListener: vi.fn((fn) => listeners.add(fn)),
    removeListener: vi.fn((fn) => listeners.delete(fn)),
    dispatch(next) {
      list.matches = next;
      listeners.forEach((fn) => fn({ matches: next }));
    },
  };
  vi.stubGlobal("matchMedia", vi.fn(() => list));
  return list;
}

describe("media query", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows the element when the query matches", () => {
    stubMatchMedia(true);
    const root = fixture(
      '<div data-dx-media-query="(min-width: 768px)">content</div>'
    );
    document.querySelectorAll("[data-dx-media-query]").forEach((el) => {
      window.dxUikit.mediaQuery.init(el);
    });
    expect(root.hasAttribute("hidden")).toBe(false);
  });

  it("hides the element when the query does not match", () => {
    stubMatchMedia(false);
    const root = fixture(
      '<div data-dx-media-query="(min-width: 768px)">content</div>'
    );
    document.querySelectorAll("[data-dx-media-query]").forEach((el) => {
      window.dxUikit.mediaQuery.init(el);
    });
    expect(root.getAttribute("hidden")).toBe("");
  });

  it("re-evaluates on change and dispatches dx:media-change", () => {
    const list = stubMatchMedia(false);
    const root = fixture(
      '<div data-dx-media-query="(min-width: 768px)">content</div>'
    );
    const seen = [];
    root.addEventListener("dx:media-change", (e) => seen.push(e.detail));
    document.querySelectorAll("[data-dx-media-query]").forEach((el) => {
      window.dxUikit.mediaQuery.init(el);
    });
    expect(root.hasAttribute("hidden")).toBe(true);
    list.dispatch(true);
    expect(root.hasAttribute("hidden")).toBe(false);
    expect(seen.at(-1)).toEqual({
      query: "(min-width: 768px)",
      matches: true,
    });
  });

  it("leaves the element alone when matchMedia is unavailable", () => {
    vi.stubGlobal("matchMedia", undefined);
    const root = fixture(
      '<div data-dx-media-query="(min-width: 768px)">content</div>'
    );
    document.querySelectorAll("[data-dx-media-query]").forEach((el) => {
      window.dxUikit.mediaQuery.init(el);
    });
    expect(root.hasAttribute("hidden")).toBe(false);
  });

  it("binds each element only once across repeated inits", () => {
    const list = stubMatchMedia(true);
    const root = fixture(
      '<div data-dx-media-query="(min-width: 768px)">content</div>'
    );
    const seen = [];
    root.addEventListener("dx:media-change", (e) => seen.push(e.detail));
    for (let i = 0; i < 3; i++) {
      document.querySelectorAll("[data-dx-media-query]").forEach((el) => {
        window.dxUikit.mediaQuery.init(el);
      });
    }
    list.dispatch(true);
    // one dispatch from the first init + one from the change: the two
    // repeated inits bound nothing extra.
    expect(seen.length).toBe(2);
    expect(seen.every((d) => d.matches === true)).toBe(true);
  });
});
