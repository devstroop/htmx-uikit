import { beforeEach, describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

describe("form field error rendering", () => {
  const submit = (form) => form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  const inputEvent = (input) => input.dispatchEvent(new Event("input", { bubbles: true }));

  it("writes messages into [data-dx-field-error] and wires aria-describedby", () => {
    const form = fixture(`
      <form data-dx-form>
        <div class="dx-field">
          <input name="email" data-dx-field data-dx-required />
          <div id="email-error" class="dx-field-error" aria-live="polite" data-dx-field-error></div>
        </div>
      </form>`);
    submit(form);
    const input = form.querySelector("[name=email]");
    const target = form.querySelector("[data-dx-field-error]");
    expect(target.textContent).toBe("Required");
    expect(target.getAttribute("aria-live")).toBe("polite");
    expect(input.getAttribute("aria-describedby")).toBe("email-error");
  });

  it("joins multiple messages with a separator", () => {
    const form = fixture(`
      <form data-dx-form>
        <div class="dx-field">
          <input name="code" data-dx-field data-dx-pattern="^[0-9]+$" data-dx-minlength="3" value="a" />
          <div class="dx-field-error" data-dx-field-error></div>
        </div>
      </form>`);
    submit(form);
    const target = form.querySelector("[data-dx-field-error]");
    expect(target.textContent).toBe("Invalid format · Minimum 3 characters");
  });

  it("clears the error element and restores the hint on a valid submit", () => {
    const form = fixture(`
      <form data-dx-form>
        <div class="dx-field">
          <input name="email" data-dx-field data-dx-required aria-describedby="email-hint" />
          <div id="email-error" class="dx-field-error" data-dx-field-error></div>
          <div id="email-hint" class="dx-field-hint">A hint</div>
        </div>
      </form>`);
    submit(form);
    const input = form.querySelector("[name=email]");
    const target = form.querySelector("[data-dx-field-error]");
    expect(target.textContent).toBe("Required");
    expect(input.getAttribute("aria-describedby")).toContain("email-error");
    input.value = "a@b.c";
    submit(form);
    expect(target.textContent).toBe("");
    expect(input.getAttribute("aria-describedby")).toBe("email-hint");
  });

  it("clears the invalid state and error text on input after an invalid submit", () => {
    const form = fixture(`
      <form data-dx-form>
        <div class="dx-field">
          <input name="email" data-dx-field data-dx-required />
          <div id="email-error" class="dx-field-error" data-dx-field-error></div>
        </div>
      </form>`);
    submit(form);
    const input = form.querySelector("[name=email]");
    const target = form.querySelector("[data-dx-field-error]");
    expect(target.textContent).toBe("Required");
    inputEvent(input);
    expect(target.textContent).toBe("");
    expect(input.hasAttribute("data-dx-invalid")).toBe(false);
    expect(input.hasAttribute("aria-invalid")).toBe(false);
    expect(input.hasAttribute("aria-describedby")).toBe(false);
  });

  it("leaves the state alone on input before any invalid submit", () => {
    const form = fixture(`
      <form data-dx-form>
        <div class="dx-field">
          <input name="email" data-dx-field data-dx-required />
          <div class="dx-field-error" data-dx-field-error>Static error</div>
        </div>
      </form>`);
    inputEvent(form.querySelector("[name=email]"));
    expect(form.querySelector("[data-dx-field-error]").textContent).toBe("Static error");
  });

  it("falls back to the nextElementSibling error element", () => {
    const form = fixture(`
      <form data-dx-form>
        <input name="email" data-dx-field data-dx-required />
        <div id="email-error" class="dx-field-error" data-dx-field-error></div>
      </form>`);
    submit(form);
    const input = form.querySelector("[name=email]");
    expect(form.querySelector("#email-error").textContent).toBe("Required");
    expect(input.getAttribute("aria-describedby")).toBe("email-error");
  });

  it("still marks a field invalid when no error element exists", () => {
    const form = fixture(`
      <form data-dx-form>
        <input name="email" data-dx-field data-dx-required />
      </form>`);
    submit(form);
    expect(form.querySelector("[name=email]").getAttribute("aria-invalid")).toBe("true");
  });
});
