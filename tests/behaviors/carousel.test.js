import { describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

describe("carousel", () => {
  const carouselFixture = ({ slides = 3, auto = false, interval, selectedIndex = 0, showArrows, showIndicators, pauseOnHover, label } = {}) => {
    const attrs = [
      'class="dx-carousel"',
      "data-dx-carousel",
      `data-dx-selected-index="${selectedIndex}"`,
      auto ? "data-dx-auto" : "",
      interval != null ? `data-dx-interval="${interval}"` : "",
      showArrows === false ? 'data-dx-show-arrows="false"' : "",
      showIndicators === false ? 'data-dx-show-indicators="false"' : "",
      pauseOnHover === false ? 'data-dx-pause-on-hover="false"' : "",
      label ? `aria-label="${label}"` : "",
    ]
      .filter(Boolean)
      .join(" ");
    const slideMarkup = Array.from(
      { length: slides },
      (_, i) => `
        <div class="dx-carousel-slide${i === 0 ? " dx-carousel-slide--active" : ""}" role="group"
             aria-roledescription="slide" aria-label="Slide ${i + 1} of ${slides}"
             data-dx-carousel-item data-dx-index="${i}"${i === 0 ? "" : ' aria-hidden="true" hidden'}>Slide ${i + 1}</div>`
    ).join("");
    const indicatorMarkup = Array.from(
      { length: slides },
      (_, i) => `
        <button type="button" data-dx-carousel-indicator data-dx-index="${i}"
                aria-label="Go to slide ${i + 1}"${i === 0 ? ' aria-current="true"' : ""}></button>`
    ).join("");
    const root = fixture(`
      <div ${attrs}>
        <div class="dx-carousel-viewport" data-dx-carousel-viewport id="carousel-viewport">${slideMarkup}</div>
        <button type="button" data-dx-carousel-prev aria-label="Previous slide" aria-controls="carousel-viewport">&lsaquo;</button>
        <button type="button" data-dx-carousel-next aria-label="Next slide" aria-controls="carousel-viewport">&rsaquo;</button>
        ${auto ? '<button type="button" data-dx-carousel-pause aria-pressed="false" aria-label="Pause">||</button>' : ""}
        <div class="dx-carousel-indicators" role="group" aria-label="Slide indicators" data-dx-carousel-indicators>${indicatorMarkup}</div>
      </div>`);
    window.dxUikit.carousel.init(root);
    return root;
  };

  const slides = (root) => [...root.querySelectorAll("[data-dx-carousel-item]")];
  const indicators = (root) => [...root.querySelectorAll("[data-dx-carousel-indicator]")];
  const keydown = (root, key) => root.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));

  it("sets region semantics and the active slide on init", () => {
    const root = carouselFixture();
    expect(root.getAttribute("role")).toBe("region");
    expect(root.getAttribute("aria-roledescription")).toBe("carousel");
    expect(root.getAttribute("aria-label")).toBe("Carousel");
    expect(root.tabIndex).toBe(0);
    expect(root._dxCarousel.ready).toBe(true);
    expect(slides(root)[0].hasAttribute("hidden")).toBe(false);
    expect(slides(root)[0].getAttribute("aria-label")).toBe("Slide 1 of 3");
    expect(slides(root)[0].getAttribute("aria-roledescription")).toBe("slide");
    expect(slides(root)[1].getAttribute("hidden")).toBe("");
    expect(slides(root)[1].getAttribute("aria-hidden")).toBe("true");
    expect(indicators(root)[0].getAttribute("aria-current")).toBe("true");
    expect(indicators(root)[1].hasAttribute("aria-current")).toBe(false);
  });

  it("keeps an explicit aria-label instead of the default", () => {
    const root = carouselFixture({ label: "Featured" });
    expect(root.getAttribute("aria-label")).toBe("Featured");
  });

  it("starts at data-dx-selected-index", () => {
    const root = carouselFixture({ selectedIndex: 2 });
    expect(slides(root)[2].hasAttribute("hidden")).toBe(false);
    expect(slides(root)[0].getAttribute("hidden")).toBe("");
    expect(indicators(root)[2].getAttribute("aria-current")).toBe("true");
    expect(indicators(root)[0].hasAttribute("aria-current")).toBe(false);
  });

  it("advances on next and fires dx:carousel-change", () => {
    const root = carouselFixture();
    const listener = vi.fn();
    root.addEventListener("dx:carousel-change", listener);
    root.querySelector("[data-dx-carousel-next]").click();
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: { index: 1 } }));
    expect(slides(root)[1].hasAttribute("hidden")).toBe(false);
    expect(slides(root)[0].getAttribute("hidden")).toBe("");
    expect(indicators(root)[1].getAttribute("aria-current")).toBe("true");
    expect(indicators(root)[0].hasAttribute("aria-current")).toBe(false);
  });

  it("wraps from the first slide backwards and from the last slide forwards", () => {
    const root = carouselFixture();
    const listener = vi.fn();
    root.addEventListener("dx:carousel-change", listener);
    root.querySelector("[data-dx-carousel-prev]").click();
    expect(listener).toHaveBeenLastCalledWith(expect.objectContaining({ detail: { index: 2 } }));
    expect(slides(root)[2].hasAttribute("hidden")).toBe(false);
    root.querySelector("[data-dx-carousel-next]").click();
    expect(listener).toHaveBeenLastCalledWith(expect.objectContaining({ detail: { index: 0 } }));
    expect(slides(root)[0].hasAttribute("hidden")).toBe(false);
  });

  it("jumps to an indicator's slide and does not refire for the active one", () => {
    const root = carouselFixture();
    const listener = vi.fn();
    root.addEventListener("dx:carousel-change", listener);
    indicators(root)[2].click();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: { index: 2 } }));
    expect(indicators(root)[2].getAttribute("aria-label")).toBe("Go to slide 3");
    indicators(root)[2].click();
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("navigates with Arrow keys, Home and End", () => {
    const root = carouselFixture();
    const listener = vi.fn();
    root.addEventListener("dx:carousel-change", listener);
    keydown(root, "ArrowRight");
    expect(listener).toHaveBeenLastCalledWith(expect.objectContaining({ detail: { index: 1 } }));
    keydown(root, "End");
    expect(listener).toHaveBeenLastCalledWith(expect.objectContaining({ detail: { index: 2 } }));
    keydown(root, "Home");
    expect(listener).toHaveBeenLastCalledWith(expect.objectContaining({ detail: { index: 0 } }));
    keydown(root, "ArrowLeft");
    expect(listener).toHaveBeenLastCalledWith(expect.objectContaining({ detail: { index: 2 } }));
  });

  it("hides arrows and indicators when there is a single slide", () => {
    const root = carouselFixture({ slides: 1 });
    expect(root.querySelector("[data-dx-carousel-prev]").hidden).toBe(true);
    expect(root.querySelector("[data-dx-carousel-next]").hidden).toBe(true);
    expect(root.querySelector("[data-dx-carousel-indicators]").hidden).toBe(true);
  });

  it("hides arrows and indicators when show-arrows/show-indicators are false", () => {
    const root = carouselFixture({ showArrows: false, showIndicators: false });
    expect(root.querySelector("[data-dx-carousel-prev]").hidden).toBe(true);
    expect(root.querySelector("[data-dx-carousel-next]").hidden).toBe(true);
    expect(root.querySelector("[data-dx-carousel-indicators]").hidden).toBe(true);
  });

  it("toggles the pause button pressed state and label", () => {
    const root = carouselFixture({ auto: true, interval: 5000 });
    const pause = root.querySelector("[data-dx-carousel-pause]");
    expect(pause.getAttribute("aria-pressed")).toBe("false");
    expect(pause.getAttribute("aria-label")).toBe("Pause");
    pause.click();
    expect(pause.getAttribute("aria-pressed")).toBe("true");
    expect(pause.getAttribute("aria-label")).toBe("Resume");
    expect(pause.textContent).toBe("▶");
    pause.click();
    expect(pause.getAttribute("aria-pressed")).toBe("false");
    expect(pause.getAttribute("aria-label")).toBe("Pause");
    expect(pause.textContent).toBe("⏸");
  });

  it("does not auto-advance without data-dx-auto", () => {
    vi.useFakeTimers();
    const root = carouselFixture({ interval: 1000 });
    const listener = vi.fn();
    root.addEventListener("dx:carousel-change", listener);
    vi.advanceTimersByTime(10_000);
    expect(listener).not.toHaveBeenCalled();
  });

  it("auto-advances on the configured interval", () => {
    vi.useFakeTimers();
    const root = carouselFixture({ auto: true, interval: 1000 });
    const listener = vi.fn();
    root.addEventListener("dx:carousel-change", listener);
    vi.advanceTimersByTime(1000);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: { index: 1 } }));
    vi.advanceTimersByTime(2000);
    expect(listener).toHaveBeenLastCalledWith(expect.objectContaining({ detail: { index: 0 } }));
  });

  it("stops auto-advance while manually paused", () => {
    vi.useFakeTimers();
    const root = carouselFixture({ auto: true, interval: 1000 });
    const listener = vi.fn();
    root.addEventListener("dx:carousel-change", listener);
    root.querySelector("[data-dx-carousel-pause]").click();
    vi.advanceTimersByTime(10_000);
    expect(listener).not.toHaveBeenCalled();
    root.querySelector("[data-dx-carousel-pause]").click();
    vi.advanceTimersByTime(1000);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("pauses auto-advance while focused and resumes on blur", () => {
    vi.useFakeTimers();
    const root = carouselFixture({ auto: true, interval: 1000 });
    const listener = vi.fn();
    root.addEventListener("dx:carousel-change", listener);
    root.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    vi.advanceTimersByTime(10_000);
    expect(listener).not.toHaveBeenCalled();
    root.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
    vi.advanceTimersByTime(1000);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: { index: 1 } }));
  });

  it("keeps a focus-paused manual carousel from starting a timer", () => {
    vi.useFakeTimers();
    const root = carouselFixture({ interval: 1000 });
    root.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    const listener = vi.fn();
    root.addEventListener("dx:carousel-change", listener);
    vi.advanceTimersByTime(10_000);
    expect(listener).not.toHaveBeenCalled();
  });

  it("pauses auto-advance while hovered and resumes on mouseout", () => {
    vi.useFakeTimers();
    const root = carouselFixture({ auto: true, interval: 1000 });
    const listener = vi.fn();
    root.addEventListener("dx:carousel-change", listener);
    root.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    vi.advanceTimersByTime(10_000);
    expect(listener).not.toHaveBeenCalled();
    root.dispatchEvent(new MouseEvent("mouseout", { bubbles: true }));
    vi.advanceTimersByTime(1000);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: { index: 1 } }));
  });

  it("keeps auto-advance running when pause-on-hover is disabled", () => {
    vi.useFakeTimers();
    const root = carouselFixture({ auto: true, interval: 1000, pauseOnHover: false });
    const listener = vi.fn();
    root.addEventListener("dx:carousel-change", listener);
    root.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    vi.advanceTimersByTime(1000);
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
