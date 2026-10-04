import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

// jsdom here ships no Storage: install a deterministic in-memory one so
// persistence round-trips are covered the same way in every engine.
function memStorage() {
  const map = new Map();
  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    key(index) {
      return [...map.keys()][index] ?? null;
    },
    removeItem(key) {
      map.delete(key);
    },
    setItem(key, value) {
      map.set(key, String(value));
    },
  };
}

beforeEach(() => {
  vi.stubGlobal("localStorage", memStorage());
});

function store() {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}

function reset() {
  window.dxTheme.__resetForTests();
  store()?.clear();
  document.documentElement.removeAttribute("data-palette");
  document.documentElement.removeAttribute("data-theme");
  document.body.innerHTML = "";
}

afterEach(() => {
  reset();
  vi.unstubAllGlobals();
});

describe("theme service", () => {
  it("starts unset and applies theme + appearance with persistence", () => {
    reset();
    expect(window.dxTheme.getTheme()).toBeNull();
    expect(window.dxTheme.getAppearance()).toBeNull();

    window.dxTheme.setTheme("github");
    expect(document.documentElement.getAttribute("data-palette")).toBe(
      "github"
    );
    expect(store()?.getItem("dx-palette")).toBe("github");

    window.dxTheme.setAppearance("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(store()?.getItem("dx-theme")).toBe("dark");
  });

  it("clears attributes and storage on null", () => {
    reset();
    window.dxTheme.setTheme("github");
    window.dxTheme.setAppearance("dark");
    window.dxTheme.setTheme(null);
    window.dxTheme.setAppearance(null);
    expect(document.documentElement.hasAttribute("data-palette")).toBe(false);
    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
    expect(store()?.getItem("dx-palette") ?? null).toBeNull();
    expect(store()?.getItem("dx-theme") ?? null).toBeNull();
  });

  it("notifies subscribers on change and stops after unsubscribe", () => {
    reset();
    const seen = [];
    const off = window.dxTheme.subscribe((s) =>
      seen.push(`${s.theme}/${s.appearance}`)
    );
    window.dxTheme.setTheme("fluent");
    window.dxTheme.setAppearance("light");
    off();
    window.dxTheme.setTheme("github");
    expect(seen).toEqual(["fluent/null", "fluent/light"]);
  });

  it("reads an explicitly applied attribute over storage", () => {
    reset();
    store()?.setItem("dx-palette", "github");
    document.documentElement.setAttribute("data-palette", "fluent");
    expect(window.dxTheme.getTheme()).toBe("fluent");
  });

  it("needs no host markup (attribute-free behavior)", () => {
    reset();
    fixture("<main><p>page</p></main>");
    window.dxTheme.setAppearance("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });
});
