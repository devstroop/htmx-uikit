import { afterEach, vi } from "vitest";

export function fixture(html) {
  document.body.innerHTML = html;
  return document.body.firstElementChild;
}

afterEach(() => {
  document.body.innerHTML = "";
  vi.useRealTimers();
});
