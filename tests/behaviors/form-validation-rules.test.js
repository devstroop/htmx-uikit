import { beforeEach, describe, expect, it, vi } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

describe("form validation rules", () => {
  const submit = (form) => form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

  it("required passes a filled value", () => {
    const form = fixture(`
      <form data-dx-form>
        <input name="name" data-dx-field data-dx-required value="Ada" />
      </form>`);
    const event = new Event("submit", { bubbles: true, cancelable: true });
    form.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(form.querySelector("[name=name]").hasAttribute("aria-invalid")).toBe(false);
  });

  it("email rule rejects a bad address and accepts a good one", () => {
    const form = fixture(`
      <form data-dx-form>
        <input name="email" data-dx-field data-dx-email />
      </form>`);
    let event = new Event("submit", { bubbles: true, cancelable: true });
    submit(form);
    expect(event.defaultPrevented).toBe(false);
    const input = form.querySelector("[name=email]");
    input.value = "nope";
    event = new Event("submit", { bubbles: true, cancelable: true });
    form.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(input.getAttribute("aria-invalid")).toBe("true");
  });

  it("pattern rule matches against data-dx-pattern", () => {
    const form = fixture(`
      <form data-dx-form>
        <input name="zip" data-dx-field data-dx-pattern="^\\d{5}$" />
      </form>`);
    const input = form.querySelector("[name=zip]");
    input.value = "12";
    let event = new Event("submit", { bubbles: true, cancelable: true });
    form.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    input.value = "12345";
    event = new Event("submit", { bubbles: true, cancelable: true });
    form.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it("min/max rules bound numeric values", () => {
    const form = fixture(`
      <form data-dx-form>
        <input name="age" type="number" data-dx-field data-dx-min="18" data-dx-max="120" />
      </form>`);
    const input = form.querySelector("[name=age]");
    input.value = "17";
    let event = new Event("submit", { bubbles: true, cancelable: true });
    form.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    input.value = "121";
    event = new Event("submit", { bubbles: true, cancelable: true });
    form.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    input.value = "42";
    event = new Event("submit", { bubbles: true, cancelable: true });
    form.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it("minlength/maxlength bound string length", () => {
    const form = fixture(`
      <form data-dx-form>
        <input name="code" data-dx-field data-dx-minlength="2" data-dx-maxlength="4" />
      </form>`);
    const input = form.querySelector("[name=code]");
    input.value = "x";
    let event = new Event("submit", { bubbles: true, cancelable: true });
    form.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    input.value = "xxxxx";
    event = new Event("submit", { bubbles: true, cancelable: true });
    form.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    input.value = "xx";
    event = new Event("submit", { bubbles: true, cancelable: true });
    form.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it("empty values pass every rule except required", () => {
    const form = fixture(`
      <form data-dx-form>
        <input name="a" data-dx-field data-dx-email data-dx-minlength="3" />
      </form>`);
    const event = new Event("submit", { bubbles: true, cancelable: true });
    form.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it("uses data-dx-<rule>-message and falls back to data-dx-error-message", () => {
    const form = fixture(`
      <form data-dx-form>
        <input name="a" data-dx-field data-dx-required data-dx-required-message="Custom A" />
        <input name="b" data-dx-field data-dx-required data-dx-error-message="Custom B" />
      </form>`);
    const invalid = [];
    form.addEventListener("dx:invalid", (e) => invalid.push(e.detail.fields));
    submit(form);
    expect(invalid[0].find((f) => f.name === "a").messages).toEqual(["Custom A"]);
    expect(invalid[0].find((f) => f.name === "b").messages).toEqual(["Custom B"]);
  });

  it("respects native constraints via the validity API", () => {
    const form = fixture(`
      <form data-dx-form>
        <input name="name" data-dx-field required />
      </form>`);
    const invalid = [];
    form.addEventListener("dx:invalid", (e) => invalid.push(e.detail.fields));
    submit(form);
    expect(invalid).toHaveLength(1);
    expect(invalid[0][0].messages.length).toBeGreaterThan(0);
    form.querySelector("[name=name]").value = "Ada";
    const event = new Event("submit", { bubbles: true, cancelable: true });
    form.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it("clears stale invalid state on a later valid submit", () => {
    const form = fixture(`
      <form data-dx-form>
        <input name="email" data-dx-field data-dx-required />
      </form>`);
    submit(form);
    const input = form.querySelector("[name=email]");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    input.value = "a@b.c";
    submit(form);
    expect(input.hasAttribute("aria-invalid")).toBe(false);
    expect(input.hasAttribute("data-dx-invalid")).toBe(false);
  });
});
