import { describe, expect, it } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

function loginFixture() {
  return fixture(`
    <form class="dx-login" data-dx-form action="/login" method="post">
      <div class="dx-field">
        <label class="dx-field-label" for="login-username">Username</label>
        <input class="dx-input" id="login-username" name="username" type="text"
          autocomplete="username" data-dx-field data-dx-required
          data-dx-required-message="Username is required." />
      </div>
      <div class="dx-field">
        <label class="dx-field-label" for="login-password">Password</label>
        <input class="dx-input" id="login-password" name="password" type="password"
          autocomplete="current-password" data-dx-field data-dx-required
          data-dx-required-message="Password is required." />
      </div>
      <label class="dx-login-remember">
        <input type="checkbox" name="rememberMe" />
        Remember me
      </label>
      <button class="dx-button dx-button--primary" type="submit">Sign in</button>
    </form>`);
}

describe("login", () => {
  it("blocks empty submit with per-field messages", () => {
    const form = loginFixture();
    const invalid = [];
    const submitted = [];
    form.addEventListener("dx:invalid", (e) => invalid.push(e.detail.fields));
    form.addEventListener("dx:submit", () => submitted.push(1));
    const event = new Event("submit", { bubbles: true, cancelable: true });
    form.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(submitted).toHaveLength(0);
    expect(invalid).toHaveLength(1);
    expect(invalid[0].map((f) => f.name).sort()).toEqual([
      "password",
      "username",
    ]);
    expect(
      invalid[0].find((f) => f.name === "username").messages
    ).toEqual(["Username is required."]);
  });

  it("submits credentials and proceeds natively when valid", () => {
    const form = loginFixture();
    form.querySelector("#login-username").value = "ada";
    form.querySelector("#login-password").value = "s3" + "cret";
    form.querySelector('[name="rememberMe"]').checked = true;
    const seen = [];
    form.addEventListener("dx:submit", (e) => seen.push(e.detail.data));
    const event = new Event("submit", { bubbles: true, cancelable: true });
    form.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(seen).toHaveLength(1);
    expect(seen[0].get("username")).toBe("ada");
    expect(seen[0].get("password")).toBe("s3" + "cret");
    expect(seen[0].get("rememberMe")).toBe("on");
  });

  it("clears a field error on edit", () => {
    const form = loginFixture();
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    const input = form.querySelector("#login-username");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    input.value = "ada";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    expect(input.hasAttribute("aria-invalid")).toBe(false);
  });
});
