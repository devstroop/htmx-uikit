# htmx-uikit preview

Docs site for `@devstroop/htmx-uikit` — the uikit specs server-rendered with
HTML fragments, plain CSS, and the ~4 KB behaviors bundle. Mirrors
`react-uikit/preview/` (port 5199) in structure and is styled after the
Radzen Blazor demo (sidebar nav + content + right TOC).

```sh
npm run build   # refresh dist/ first if lib/ changed
npm run dev     # → http://localhost:5198/
```

## Routing

Hash-based SPA over generated page fragments:

| Route | Target |
| --- | --- |
| `#/` | Home: hero, featured demo, full catalog |
| `#/{slug}` | Component page (matches the nav registry; one page per component) |
| `#/{slug}/{sectionId}` | Deep link, scrolls to the section |

`preview/nav.js` is the single source of truth for nav groups, route slugs,
titles, and page targets. The sidebar (`dx-panelmenu` dogfood), search
filter, "On this page" TOC, and active-state highlighting all read from it.

## Layout

| Path | Purpose |
| --- | --- |
| `index.html` | Page shell: header (palette/dark controls), sidebar, main, TOC |
| `preview.js` | Router, nav/search/TOC, widget rebinding after injection |
| `nav.js` | Generated nav registry (see below) |
| `pages/*.html` | Generated page fragments (one file per component slug; page head + demo sections) |
| `partials/*.html` | htmx targets (`hx-get="/partials/…"`) |
| `preview.css` | Preview chrome + demo content helpers — not part of the library |
| `tokens/*.css` | Theme token sheets for the switcher |
| `vendor/htmx.min.js` | htmx.org runtime (not published with this package) |

## How assets resolve

The dev server (`scripts/preview.mjs`, no dependencies) serves `preview/` as
the web root and mounts the **live library build** — there are no vendored
copies of the library:

- `/dist/*` → `../dist/*` — rebuild with `npm run build`
- `/lib/*` → `../lib/*` — e.g. `/lib/styles/tokens.css`

`preview/` is excluded from the npm package (`files`: `lib`, `dist`,
`MIGRATION.md`).

## Regenerating pages

`pages/` and `nav.js` are generated from the component groups (one-off
generator kept outside the repo during the docs migration). After changing
`nav.js` groups or `pages/*` markup, keep slugs ↔ section ids in sync:
every nav slug must resolve to a `demo-section` id on some page.

Keyboard tables: 40 component pages carry a `kbd-block` inside their demo
card — extracted from the react preview's `KEYS` bindings
(`react-uikit/preview/pages/*`: `const *_KEYS` objects plus the inline
`bindings={[…]}` tables in `navigation.tsx`) so both previews document the
same contract. React-specific phrasing is sanitized on extraction (test
annotations stripped, `on*` props mapped to `dx:*` events). Regeneration
re-extracts them; edits belong in the react preview bindings, not the
generated HTML.

## Vendored files & refresh

- `tokens/*.css` — copied from the uikit contract repo (theme dir → flat file);
  refresh from a sibling `../uikit` checkout:

  ```sh
  for t in default fluent github material material-3 shadcn; do
    cp ../uikit/themes/$t/tokens.css preview/tokens/$t.css
  done
  ```
- `vendor/htmx.min.js` — https://github.com/bigskysoftware/htmx (v1.x release)

The uikit repo keeps its own gate harness at `uikit/preview/htmx` (used by
`visual-verify.mjs`); this preview is this repository's standalone demo.
