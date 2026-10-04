import { describe, expect, it } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

function chatFixture() {
  return fixture(`
    <form class="dx-chat" data-dx-chat>
      <div class="dx-chat-messages" data-dx-chat-list aria-live="polite"></div>
      <div class="dx-chat-input-row">
        <input class="dx-input" data-dx-chat-input type="text" aria-label="Message" />
        <button class="dx-button dx-button--primary" type="submit">Send</button>
      </div>
    </form>`);
}

function list() {
  return document.querySelector("[data-dx-chat-list]");
}

describe("chat", () => {
  it("submit appends the user message and dispatches dx:chat-send", () => {
    const form = chatFixture();
    const seen = [];
    form.addEventListener("dx:chat-send", (e) => seen.push(e.detail));
    form.querySelector("[data-dx-chat-input]").value = "  hello  ";
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    expect(seen).toEqual([{ text: "hello" }]);
    expect(list().textContent).toContain("hello");
    expect(
      list().querySelector(".dx-chat-message--user")?.textContent
    ).toBe("hello");
    expect(form.querySelector("[data-dx-chat-input]").value).toBe("");
  });

  it("ignores empty submits", () => {
    const form = chatFixture();
    const seen = [];
    form.addEventListener("dx:chat-send", (e) => seen.push(e.detail));
    form.querySelector("[data-dx-chat-input]").value = "   ";
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    expect(seen).toHaveLength(0);
    expect(list().querySelectorAll(".dx-chat-message").length).toBe(0);
  });

  it("appendMessage adds role-styled replies", () => {
    const form = chatFixture();
    window.dxChat.appendMessage(form, { role: "assistant", text: "Hi there" });
    const item = list().querySelector(".dx-chat-message--assistant");
    expect(item?.textContent).toBe("Hi there");
    window.dxChat.appendMessage("[data-dx-chat]", {
      role: "system",
      text: "Joined",
    });
    expect(
      list().querySelector(".dx-chat-message--system")?.textContent
    ).toBe("Joined");
  });

  it("appendMessage is a no-op without a list", () => {
    fixture(`<form data-dx-chat></form>`);
    const form = document.querySelector("[data-dx-chat]");
    expect(window.dxChat.appendMessage(form, { text: "x" })).toBeNull();
    expect(window.dxChat.appendMessage("#missing", { text: "x" })).toBeNull();
  });

  it("announces arrivals through aria-live", () => {
    const form = chatFixture();
    expect(list().getAttribute("aria-live")).toBe("polite");
    window.dxChat.appendMessage(form, { role: "assistant", text: "Hi" });
    expect(list().textContent).toContain("Hi");
  });
});
