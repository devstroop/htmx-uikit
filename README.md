# htmx-uikit

Server-rendered delivery of the uikit specs for htmx apps. The react
framework ships components as JS; this framework ships **HTML fragments +
plain CSS + a tiny behaviors script**, so any server-side language (Go,
Python, Rails, …) can render the same contracts.

> **Upgrading from ≤ 0.27?** v0.28.0 renames the `dt` prefix to `dx`
> (tokens, classes, data attributes, events, globals) and renames the
> typography component to `text` — see [MIGRATION.md](MIGRATION.md).

## Layout

```
lib/
  styles/tokens.css     generated from themes/default (synced by scripts/generate-css.mjs)
  styles/tokens.aliases.css
                        hand-maintained flat-name aliases (--dx-text-*-color,
                        --dx-shadow-0..10, …) the utilities consume — bundled
                        into dist/uikit.css, never generated
  uikit.css             every component's CSS, one rule block per component
  behaviors.js          tiny vanilla JS (no deps) for the interactive bits
  components/<name>/
    <name>.html         reference markup (what a server template must emit)
    <name>.css          component styles (imported by uikit.css)
  main.js               behaviors entry (imports behaviors.js)
dist/                   esbuild output: uikit.js + uikit.css
```

## Conventions

- **Class naming** — `dx-<name>` for the root, `dx-<name>--<modifier>` for
  variants/sizes/states, `dx-<name>-<part>` for sub-elements
  (`dx-button--primary`, `dx-card-header`).
- **Tokens only** — components consume `var(--dx-*)` exclusively; the
  parity validator (root `npm run parity:validate`) enforces that the CSS
  uses exactly the tokens each spec declares.
- **A11y is structural** — the HTML fragments carry the roles, labels,
  aria-describedby wiring, and keyboard behavior that the specs require;
  `behaviors.js` only adds what HTML cannot express.
- **No build-time CSS transforms** — plain CSS, hand-written selectors.
- **Interactivity via data attributes** — `data-dx-*` hooks are the only
  JS contract; htmx attributes handle server-driven swaps in consuming
  apps.

## Interactive components

`behaviors.js` (2 KB, no deps, optional to load) drives:

- `data-dx-tabs` / `data-dx-tab` / `data-dx-tabpanel` — ARIA tabs pattern,
  arrow/Home/End keys
- `data-dx-accordion` / `data-dx-accordion-trigger` — single/multiple
- `data-dx-tooltip` — hover/focus with Escape, `aria-describedby` wiring
- `data-dx-dialog-open` + `<dialog data-dx-dialog>` — native dialog with
  focus return
- `data-dx-toast` + `window.dxToast()` — stacked toasts
- `data-dx-dismiss` — remove an alert/toast element

## Consuming

```html
<link rel="stylesheet" href="/uikit.css" />
<link rel="stylesheet" href="/tokens.css" />
<script src="/htmx.min.js"></script>
<script src="/behaviors.js"></script>
```

Pick a theme: import any `themes/<name>/tokens.css` from the uikit repo
instead of the default `tokens.css` (see `themes/README.md`). `uikit.css`
already carries the flat-name alias layer the utility classes resolve
against, so the utilities stay live with any paired theme.

## Building

```bash
npm ci && npm run build   # emits dist/uikit.js + dist/uikit.css
```