import { beforeEach, describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

describe("toc", () => {
  const scrollSpy = vi.fn();

  beforeEach(() => {
    scrollSpy.mockClear();
    Element.prototype.scrollIntoView = scrollSpy;
  });

  const tocLink = (text, selector, extra = "") =>
    `<li class="dx-toc-item" role="listitem">
      <a href="${selector}" class="dx-toc-link" data-dx-toc-item data-dx-text="${text}" ${extra}>${text}</a>
    </li>`;

  const tocFixture = (attrs = 'data-dx-orientation="vertical"', links) => {
    const root = fixture(`
      <nav class="dx-toc" data-dx-toc ${attrs} aria-label="Table of contents">
        <ol class="dx-toc-list" role="list" data-dx-toc-list>
          ${links}
        </ol>
      </nav>`);
    window.dxUikit.toc.init(root);
    return root;
  };

  const defaultLinks = `
    <li class="dx-toc-item" role="listitem">
      <a href="#introduction" class="dx-toc-link" data-dx-toc-item data-dx-text="Introduction" data-dx-selector="#introduction">Introduction</a>
    </li>
    <li class="dx-toc-item" role="listitem">
      <a href="#installation" class="dx-toc-link" data-dx-toc-item data-dx-text="Installation" data-dx-selector="#installation">Installation</a>
    </li>
    <li class="dx-toc-item" role="listitem">
      <a href="#usage" class="dx-toc-link" data-dx-toc-item data-dx-text="Usage" data-dx-selector="#usage">Usage</a>
    </li>`;

  const withTargets = () => {
    document.body.insertAdjacentHTML(
      "beforeend",
      '<div id="introduction"></div><div id="installation"></div><div id="usage"></div>'
    );
  };

  it("marks the first item active when none is marked in the markup", () => {
    const root = tocFixture('data-dx-orientation="vertical"', defaultLinks);
    const links = root.querySelectorAll("[data-dx-toc-item]");
    expect(links[0].getAttribute("aria-current")).toBe("location");
    expect(links[0].classList.contains("dx-toc-link--active")).toBe(true);
    expect(links[1].hasAttribute("aria-current")).toBe(false);
    expect(links[2].hasAttribute("aria-current")).toBe(false);
  });

  it("keeps the item marked in the markup active on init", () => {
    const links = defaultLinks.replace(
      'data-dx-selector="#installation"',
      'data-dx-selector="#installation" aria-current="location"'
    );
    const root = tocFixture('data-dx-orientation="vertical"', links);
    const items = root.querySelectorAll("[data-dx-toc-item]");
    expect(items[1].getAttribute("aria-current")).toBe("location");
    expect(items[1].classList.contains("dx-toc-link--active")).toBe(true);
    expect(items[0].hasAttribute("aria-current")).toBe(false);
    expect(items[2].hasAttribute("aria-current")).toBe(false);
  });

  it("applies orientation classes", () => {
    const vertical = tocFixture('data-dx-orientation="vertical"', defaultLinks);
    expect(vertical.classList.contains("dx-toc--vertical")).toBe(true);
    expect(vertical.classList.contains("dx-toc--horizontal")).toBe(false);
    const horizontal = tocFixture('data-dx-orientation="horizontal"', defaultLinks);
    expect(horizontal.classList.contains("dx-toc--horizontal")).toBe(true);
    expect(horizontal.classList.contains("dx-toc--vertical")).toBe(false);
  });

  it("activates the clicked item, dispatches dx:toc-click, scrolls and focuses the target", () => {
    const root = tocFixture('data-dx-orientation="vertical"', defaultLinks);
    withTargets();
    const listener = vi.fn();
    root.addEventListener("dx:toc-click", listener);
    const link = root.querySelectorAll("[data-dx-toc-item]")[1];
    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    link.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].detail).toEqual({ text: "Installation", selector: "#installation" });
    expect(link.getAttribute("aria-current")).toBe("location");
    expect(link.classList.contains("dx-toc-link--active")).toBe(true);
    const other = root.querySelectorAll("[data-dx-toc-item]")[0];
    expect(other.hasAttribute("aria-current")).toBe(false);
    expect(scrollSpy).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
    const target = document.querySelector("#installation");
    expect(target.getAttribute("tabindex")).toBe("-1");
    expect(document.activeElement).toBe(target);
  });

  it("falls back to href when data-dx-selector is missing", () => {
    const links = `
      <li class="dx-toc-item" role="listitem">
        <a href="#introduction" class="dx-toc-link" data-dx-toc-item data-dx-text="Introduction" aria-current="location">Introduction</a>
      </li>
      <li class="dx-toc-item" role="listitem">
        <a href="#usage" class="dx-toc-link" data-dx-toc-item data-dx-text="Usage">Usage</a>
      </li>`;
    const root = tocFixture('data-dx-orientation="vertical"', links);
    withTargets();
    const listener = vi.fn();
    root.addEventListener("dx:toc-click", listener);
    const link = root.querySelectorAll("[data-dx-toc-item]")[1];
    link.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    expect(listener.mock.calls[0][0].detail).toEqual({ text: "Usage", selector: "#usage" });
    expect(link.getAttribute("aria-current")).toBe("location");
    expect(document.activeElement).toBe(document.querySelector("#usage"));
  });

  it("updates the active item while scrolling", () => {
    const root = tocFixture('data-dx-orientation="vertical"', defaultLinks);
    withTargets();
    document.querySelector("#introduction").getBoundingClientRect = () => ({ top: 200, left: 0, right: 0, bottom: 0, width: 0, height: 0 });
    document.querySelector("#installation").getBoundingClientRect = () => ({ top: 50, left: 0, right: 0, bottom: 0, width: 0, height: 0 });
    document.querySelector("#usage").getBoundingClientRect = () => ({ top: 400, left: 0, right: 0, bottom: 0, width: 0, height: 0 });
    const links = root.querySelectorAll("[data-dx-toc-item]");
    expect(links[0].getAttribute("aria-current")).toBe("location");
    window.dispatchEvent(new Event("scroll"));
    expect(links[1].getAttribute("aria-current")).toBe("location");
    expect(links[1].classList.contains("dx-toc-link--active")).toBe(true);
    expect(links[0].hasAttribute("aria-current")).toBe(false);
  });

  it("wires ARIA: landmark label, list structure and active location", () => {
    const root = tocFixture('data-dx-orientation="vertical"', defaultLinks);
    expect(root.tagName).toBe("NAV");
    expect(root.getAttribute("aria-label")).toBe("Table of contents");
    expect(root.querySelector("ol")).toBeTruthy();
    root.querySelectorAll(".dx-toc-item").forEach((li) => expect(li.getAttribute("role")).toBe("listitem"));
    const active = root.querySelectorAll("[data-dx-toc-item]");
    expect([...active].filter((a) => a.getAttribute("aria-current") === "location")).toHaveLength(1);
  });
});
