import { describe, expect, it } from "vitest";
import "../../lib/behaviors.js";
import { fixture } from "../helpers.js";

/**
 * Shared contract vectors (uikit#100): the react twin
 * (`renderMarkdown`) implements the same contract — keep the two
 * vector lists in sync.
 */
const VECTORS = [
  ["heading", "# Hi", "<h1>Hi</h1>"],
  ["heading level", "### Sub", "<h3>Sub</h3>"],
  ["bold stars", "**b**", "<p><strong>b</strong></p>"],
  ["bold under", "__b__", "<p><strong>b</strong></p>"],
  ["italic star", "*i*", "<p><em>i</em></p>"],
  ["italic under", "_i_", "<p><em>i</em></p>"],
  ["no intra-word italic", "foo_bar", "<p>foo_bar</p>"],
  ["strike", "~~s~~", "<p><del>s</del></p>"],
  ["code span", "`c`", "<p><code>c</code></p>"],
  ["code protects markup", "`**b**`", "<p><code>**b**</code></p>"],
  ["link", "[t](https://x.test)", '<p><a href="https://x.test">t</a></p>'],
  ["link drops javascript", "[t](javascript:alert(1))", "<p>t</p>"],
  ["link relative", "[t](/p)", '<p><a href="/p">t</a></p>'],
  ["ul", "- a\n- b", "<ul><li>a</li><li>b</li></ul>"],
  ["ol", "1. a\n2. b", "<ol><li>a</li><li>b</li></ol>"],
  ["quote", "> q", "<blockquote><p>q</p></blockquote>"],
  ["rule", "---", "<hr>"],
  ["fence", "```js\nx\n```", '<pre><code class="language-js">x</code></pre>'],
  ["paragraph", "a\nb", "<p>a\nb</p>"],
  ["escapes html", "<b>x</b>", "<p>&lt;b&gt;x&lt;/b&gt;</p>"],
];

describe("markdown renderer", () => {
  for (const [name, source, expected] of VECTORS) {
    it(name, () => {
      expect(window.dxMarkdown.render(source)).toBe(expected);
    });
  }

  it("passes raw html through with allowHtml", () => {
    expect(window.dxMarkdown.render("<b>x</b>", { allowHtml: true })).toBe(
      "<p><b>x</b></p>"
    );
  });
});

describe("markdown behavior", () => {
  it("renders host text content on init", () => {
    fixture(`<div data-dx-markdown># Hi</div>`);
    const host = document.querySelector("[data-dx-markdown]");
    window.dxUikit.markdown.init(host);
    expect(host.querySelector("h1")?.textContent).toBe("Hi");
    expect(host.hasAttribute("data-dx-markdown-rendered")).toBe(true);
  });

  it("renders a referenced source element", () => {
    fixture(
      `<script type="text/plain" id="md-src"># Hi</script><div data-dx-markdown data-dx-markdown-source="#md-src"></div>`
    );
    const host = document.querySelector("[data-dx-markdown]");
    window.dxUikit.markdown.init(host);
    expect(host.querySelector("h1")?.textContent).toBe("Hi");
  });

  it("never re-renders rendered output", () => {
    fixture(`<div data-dx-markdown># Hi</div>`);
    const host = document.querySelector("[data-dx-markdown]");
    window.dxUikit.markdown.init(host);
    window.dxUikit.markdown.init(host);
    expect(host.querySelectorAll("h1").length).toBe(1);
  });

  it("allow-html attribute passes raw html through", () => {
    fixture(
      `<script type="text/plain" id="md-html"><b>x</b></script><div data-dx-markdown data-dx-markdown-allow-html data-dx-markdown-source="#md-html"></div>`
    );
    const host = document.querySelector("[data-dx-markdown]");
    window.dxUikit.markdown.init(host);
    expect(host.querySelector("b")?.textContent).toBe("x");
  });
});
