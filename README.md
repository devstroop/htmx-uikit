# htmx-uikit

Server-rendered delivery of the uikit specs for htmx apps. The react
framework ships components as JS; this framework ships **HTML fragments +
plain CSS + a tiny behaviors script**, so any server-side language (Go,
Python, Rails, …) can render the same contracts.

## Layout

```
lib/
  styles/tokens.css     generated from themes/default (synced by scripts/generate-css.mjs)
  uikit.css             every component's CSS, one rule block per component
  behaviors.js          tiny vanilla JS (no deps) for the interactive bits
  components/<name>/
    <name>.html         reference markup (what a server template must emit)
    <name>.css          component styles (imported by uikit.css)
  main.js               behaviors entry (imports behaviors.js)
dist/                   esbuild output: uikit.js + uikit.css
```

## Conventions

- **Class naming** — `se-<name>` for the root, `se-<name>--<modifier>` for
  variants/sizes/states, `se-<name>-<part>` for sub-elements
  (`se-button--primary`, `se-card-header`).
- **Tokens only** — components consume `var(--se-*)` exclusively; the
  parity validator (root `npm run parity:validate`) enforces that the CSS
  uses exactly the tokens each spec declares.
- **A11y is structural** — the HTML fragments carry the roles, labels,
  aria-describedby wiring, and keyboard behavior that the specs require;
  `behaviors.js` only adds what HTML cannot express.
- **No build-time CSS transforms** — plain CSS, hand-written selectors.
- **Interactivity via data attributes** — `data-se-*` hooks are the only
  JS contract; htmx attributes handle server-driven swaps in consuming
  apps.

## Interactive components

`behaviors.js` (2 KB, no deps, optional to load) drives:

- `data-se-tabs` / `data-se-tab` / `data-se-tabpanel` — ARIA tabs pattern,
  arrow/Home/End keys
- `data-se-accordion` / `data-se-accordion-trigger` — single/multiple
- `data-se-tooltip` — hover/focus with Escape, `aria-describedby` wiring
- `data-se-dialog-open` + `<dialog data-se-dialog>` — native dialog with
  focus return
- `data-se-toast` + `window.seToast()` — stacked toasts
- `data-se-dismiss` — remove an alert/toast element

## Consuming

```html
<link rel="stylesheet" href="/uikit.css" />
<link rel="stylesheet" href="/tokens.css" />
<script src="/htmx.min.js"></script>
<script src="/behaviors.js"></script>
```

Pick a theme: import any `themes/<name>/tokens.css` from the uikit repo
instead of the default `tokens.css` (see `themes/README.md`).

## Building

```bash
npm ci && npm run build   # emits dist/uikit.js + dist/uikit.css
```