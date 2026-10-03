import { beforeEach, describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

describe("form", () => {
  it("dispatches dx:submit with FormData on a valid submit without blocking", () => {
    const form = fixture(`
      <form data-dx-form>
        <input name="email" data-dx-field value="a@b.c" />
        <button type="submit">Go</button>
      </form>`);
    const seen = [];
    form.addEventListener("dx:submit", (e) => seen.push([e.detail.form, e.detail.data]));
    const event = new Event("submit", { bubbles: true, cancelable: true });
    form.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(seen).toHaveLength(1);
    expect(seen[0][0]).toBe(form);
    expect(seen[0][1].get("email")).toBe("a@b.c");
  });

  it("blocks the submit and dispatches dx:invalid when a field fails a rule", () => {
    const form = fixture(`
      <form data-dx-form>
        <input name="email" data-dx-field data-dx-required />
        <input name="name" data-dx-field />
        <button type="submit">Go</button>
      </form>`);
    const invalid = [];
    const submitted = [];
    form.addEventListener("dx:invalid", (e) => invalid.push(e.detail.fields));
    form.addEventListener("dx:submit", () => submitted.push(1));
    const event = new Event("submit", { bubbles: true, cancelable: true });
    form.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(invalid).toHaveLength(1);
    expect(invalid[0].map((f) => f.name)).toEqual(["email"]);
    expect(invalid[0][0].messages).toEqual(["Required"]);
    expect(submitted).toHaveLength(0);
  });

  it("marks the failing field invalid with aria-invalid and data-dx-invalid", () => {
    const form = fixture(`
      <form data-dx-form>
        <input name="email" data-dx-field data-dx-required />
      </form>`);
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    const input = form.querySelector("[name=email]");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.hasAttribute("data-dx-invalid")).toBe(true);
  });

  it("skips disabled fields when checking validity", () => {
    const form = fixture(`
      <form data-dx-form>
        <input name="x" data-dx-field data-dx-required disabled />
      </form>`);
    const event = new Event("submit", { bubbles: true, cancelable: true });
    form.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it("ignores submits outside [data-dx-form]", () => {
    const form = fixture(`<form><input name="x" data-dx-field aria-invalid="true" /></form>`);
    const event = new Event("submit", { bubbles: true, cancelable: true });
    form.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });
});
