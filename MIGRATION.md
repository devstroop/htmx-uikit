# Migrating to v0.28.0

v0.28.0 is a **clean break**: the `dt` prefix is gone in favour of `dx`,
aligning this framework with react-uikit's naming. There is **no shim** —
apply the four mappings below and your templates are migrated.

Search-and-replace in this order (later patterns do not overlap earlier ones):

```sh
sed -i 's/data-dt-/data-dx-/g;  s/--dt-/--dx-/g;  s/dt:/dx:/g;  s/dt-/dx-/g'  your-templates
```

plus, in JavaScript: `dtFoo` → `dxFoo` (camelCase globals and `dataset`
keys), and see each section for token-level exceptions.

## 1. Tokens

Every custom property moved from `--dt-*` to `--dx-*`:

| v0.27 (before)          | v0.28 (after)            |
| ----------------------- | ------------------------ |
| `var(--dt-color-primary)` | `var(--dx-color-primary)` |
| `var(--dt-space-4)`     | `var(--dx-space-4)`      |
| `var(--dt-radius-md)`   | `var(--dx-radius-md)`    |

Two legacy token names were reconciled with the uikit token schema while
changing the prefix (18 call sites):

| v0.27 (before)               | v0.28 (after)                  |
| ---------------------------- | ------------------------------ |
| `var(--dt-color-fg, …)`      | `var(--dx-color-text, …)`      |
| `var(--dt-color-fg-muted, …)`| `var(--dx-color-text-muted, …)`|

Prefix-only (unchanged semantics, not part of the token schema — kept as
component/extension properties):

- `--dx-radius` (bare default radius, mirrors react's `--dx-radius`)
- `--dx-color-surface-raised` (elevated surface, falls back to `transparent`)
- `--dx-layout-sidebar-width` (sidebar/layout width, falls back to `240px`)

## 2. Classes

All component classes moved from `dt-*` to `dx-*`, including modifiers and
part selectors:

| v0.27 (before)                | v0.28 (after)                 |
| ----------------------------- | ----------------------------- |
| `.dt-button.dt-button--sm`    | `.dx-button.dx-button--sm`    |
| `.dt-tabs__panel`             | `.dx-tabs__panel`             |
| `class="dt-datagrid__row"`    | `class="dx-datagrid__row"`    |

Component rename — **typography → text** (directory, files, root class):

| v0.27 (before)                             | v0.28 (after)                        |
| ------------------------------------------ | ------------------------------------ |
| `lib/components/typography/typography.html` | `lib/components/text/text.html`     |
| `lib/components/typography/typography.css`  | `lib/components/text/text.css`      |
| `.dx-typography` / `.dx-typography--display-1` | `.dx-text` / `.dx-text--display-1` |

(Modifier names are otherwise unchanged: `--display-1…7`, `--body-1/2`,
`--caption`, `--overline`.)

## 3. Data attributes

Every behavioral hook moved from `data-dt-*` to `data-dx-*`, including the
camelCase `dataset` keys in JavaScript:

| v0.27 (before)                          | v0.28 (after)                         |
| --------------------------------------- | ------------------------------------- |
| `<div data-dt-dialog-open="#dlg">`      | `<div data-dx-dialog-open="#dlg">`    |
| `<div data-dt-datagrid-pager>`          | `<div data-dx-datagrid-pager>`        |
| `root.dataset.dtDatagridPagesize`       | `root.dataset.dxDatagridPagesize`     |
| `canvas.dataset.dtReady`                | `canvas.dataset.dxReady`              |

Configuration attributes follow the same rule:
`data-dt-datagrid-properties` → `data-dx-datagrid-properties`,
`data-dt-autocomplete-delay-ms` → `data-dx-autocomplete-delay-ms`, etc.

## 4. Events + globals

Custom events moved from `dt:*` to `dx:*` — this covers
`addEventListener`, `htmx:on`/`hx-on` wiring, and `detail` handling:

| v0.27 (before)                  | v0.28 (after)                    |
| ------------------------------- | -------------------------------- |
| `"dt:menu-click"`               | `"dx:menu-click"`                |
| `"dt:datagrid-change"`          | `"dx:datagrid-change"`           |
| `root.addEventListener("dt:toast-dismiss", …)` | `root.addEventListener("dx:toast-dismiss", …)` |

Browser globals were renamed:

| v0.27 (before)       | v0.28 (after)        |
| -------------------- | -------------------- |
| `window.dtToast(…)`  | `window.dxToast(…)`  |
| `window.dtUikit`     | `window.dxUikit`     |

`window.dxUikit` exposes the same init helpers as before
(`dxUikit.<component>.init(root)`), under the new prefix.

## 5. Spacing defaults

v0.28.0 codifies the spacing-ownership contract (Radzen parity) — layout
containers and forms now own their rhythm, so some previously bare markup
gains default spacing:

| What                          | v0.27 (before)      | v0.28 (after)                                  |
| ----------------------------- | ------------------- | ---------------------------------------------- |
| `.dx-stack` (no gap modifier) | no gap (items touch) | `gap: var(--dx-space-4)` (16px) by default     |
| `.dx-stack` base direction    | row (flex default)  | `flex-direction: column` (spec/react parity — use `--row` for horizontal) |
| `.dx-form` children           | no spacing           | flex column with `gap: var(--dx-space-3)` (12px) |
| `.dx-text`                    | UA margins leaked    | `margin: 0` — spacing belongs to the parent    |
| `.dx-h1`…`.dx-h6`, `.dx-text-muted` | undefined (phantom) | defined heading presets (margin: 0) + muted color |

To restore the old zero-gap behaviour on a stack, set it explicitly:
`<div class="dx-stack" style="gap: 0">`. Page-level rhythm belongs to the
`.dx-m-*`/`.dx-p-*` utilities (contract: `specs/tokens.md` → Spacing
ownership).
