import { beforeEach, describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

describe("toast", () => {
  it("creates a viewport with aria-live when missing", () => {
    window.dxToast({ title: "Hi" });
    const container = document.querySelector("[data-dx-toast]");
    expect(container).not.toBeNull();
    expect(container.getAttribute("aria-live")).toBe("polite");
  });

  it("renders title, description and tone class", () => {
    window.dxToast({ title: "Saved", description: "Done", tone: "success" });
    const item = document.querySelector("[data-dx-toast] > div");
    expect(item.className).toBe("dx-toast dx-toast--success");
    expect(item.querySelector(".dx-toast-title").textContent).toBe("Saved");
    expect(item.querySelector(".dx-toast-description").textContent).toBe("Done");
    expect(item.querySelector(".dx-toast-content")).not.toBeNull();
    expect(item.getAttribute("role")).toBe("status");
  });

  it("uses role alert for danger toasts", () => {
    window.dxToast({ title: "Boom", tone: "danger" });
    expect(document.querySelector("[data-dx-toast] > div").getAttribute("role")).toBe("alert");
  });

  it("auto-dismisses after durationMs with an exit animation", () => {
    vi.useFakeTimers();
    window.dxToast({ title: "Temp", durationMs: 500 });
    expect(document.querySelectorAll("[data-dx-toast] > div")).toHaveLength(1);
    vi.advanceTimersByTime(500);
    const item = document.querySelector("[data-dx-toast] > div");
    expect(item.classList.contains("dx-toast--leaving")).toBe(true);
    vi.advanceTimersByTime(200);
    expect(document.querySelectorAll("[data-dx-toast] > div")).toHaveLength(0);
  });

  it("keeps a durationMs 0 toast until dismissed", () => {
    vi.useFakeTimers();
    window.dxToast({ title: "Sticky", durationMs: 0 });
    vi.advanceTimersByTime(60_000);
    expect(document.querySelector("[data-dx-toast] > div")).not.toBeNull();
  });

  it("renders action and cancel buttons that fire callbacks and dismiss", () => {
    vi.useFakeTimers();
    const onAction = vi.fn();
    const onCancel = vi.fn();
    window.dxToast({
      title: "Removed",
      durationMs: 0,
      action: { label: "Undo", onClick: onAction },
      cancel: { label: "Skip", onClick: onCancel },
    });
    const item = document.querySelector("[data-dx-toast] > div");
    const undo = item.querySelector(".dx-toast-action");
    undo.click();
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(item.classList.contains("dx-toast--leaving")).toBe(true);
    vi.advanceTimersByTime(200);
    expect(document.querySelectorAll("[data-dx-toast] > div")).toHaveLength(0);
  });

  it("omits the dismiss button when dismissible is false", () => {
    window.dxToast({ title: "Quiet", durationMs: 0, dismissible: false });
    const item = document.querySelector("[data-dx-toast] > div");
    expect(item.querySelector(".dx-toast-dismiss")).toBeNull();
  });

  it("updates an existing toast when the id is reused", () => {
    window.dxToast({ id: "job-1", title: "Uploading…", durationMs: 0 });
    window.dxToast({ id: "job-1", title: "Uploaded", tone: "success", durationMs: 0 });
    const items = document.querySelectorAll("[data-dx-toast] > div");
    expect(items).toHaveLength(1);
    expect(items[0].querySelector(".dx-toast-title").textContent).toBe("Uploaded");
  });

  it("renders the progress bar with the matching duration", () => {
    window.dxToast({ title: "Progress", durationMs: 2500, showProgress: true });
    const bar = document.querySelector("[data-dx-toast] > div .dx-toast-progress");
    expect(bar).not.toBeNull();
    expect(bar.style.animationDuration).toBe("2500ms");
  });

  it("dismisses on body click with closeOnClick", () => {
    vi.useFakeTimers();
    window.dxToast({ title: "Clickable", durationMs: 0, closeOnClick: true });
    const item = document.querySelector("[data-dx-toast] > div");
    expect(item.classList.contains("dx-toast--clickable")).toBe(true);
    item.click();
    expect(item.classList.contains("dx-toast--leaving")).toBe(true);
    vi.advanceTimersByTime(200);
    expect(document.querySelectorAll("[data-dx-toast] > div")).toHaveLength(0);
  });

  it("fires onAutoClose on expiry and onDismiss on manual dismiss", () => {
    vi.useFakeTimers();
    const onAutoClose = vi.fn();
    const onDismiss = vi.fn();
    window.dxToast({ title: "A", durationMs: 100, onAutoClose });
    window.dxToast({ title: "B", durationMs: 0, onDismiss });
    const items = document.querySelectorAll("[data-dx-toast] > div");
    items[1].querySelector(".dx-toast-dismiss").click();
    expect(onDismiss).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(100);
    expect(onAutoClose).toHaveBeenCalledTimes(1);
  });
});
