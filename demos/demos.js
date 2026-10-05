/* htmx-uikit demos shell — nav + hash router + docs chrome.
 * Page fragments live in /pages/*.html; nav registry is generated (nav.js).
 * Route format: #/slug  |  #/slug/sectionId  |  #/  (home)  |  #//sectionId (home anchor)
 */
import { NAV, COMPONENT_COUNT, routeTitle } from "./nav.js";

const content = document.getElementById("demo-content");
const tocEl = document.getElementById("page-toc");
const tocList = document.getElementById("page-toc-list");
const navEl = document.getElementById("app-nav");
const navSearch = document.getElementById("nav-search");
const navEmpty = document.getElementById("nav-empty");
const sidebarToggle = document.getElementById("sidebar-toggle");
const themeSelect = document.getElementById("theme-select");

const ROUTES = new Map();
for (const group of NAV) for (const r of group.routes) ROUTES.set(r.slug, r);

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const pageCache = new Map();
let navToken = 0;
let currentRoute = null;

/* ---------------- theme ---------------- */
function currentThemeName() {
  const link = document.querySelector("[data-theme-link]:not([disabled])");
  return link ? link.dataset.themeLink : "default";
}
function syncThemeSelects() {
  const name = currentThemeName();
  for (const id of ["theme-select", "theme-select-demo"]) {
    const sel = document.getElementById(id);
    if (sel) sel.value = name;
  }
}
function applyTheme(name) {
  document.querySelectorAll("[data-theme-link]").forEach((link) => {
    link.disabled = link.dataset.themeLink !== name;
  });
  syncThemeSelects();
  updateThemeState();
}
function updateThemeState() {
  const el = document.getElementById("theme-state");
  if (el) el.textContent = document.documentElement.dataset.theme || "light";
}
themeSelect.addEventListener("change", () => applyTheme(themeSelect.value));
document.addEventListener("change", (e) => {
  if (e.target && e.target.matches("[data-dx-theme-switch]")) updateThemeState();
  if (e.target && e.target.id === "theme-select-demo") applyTheme(e.target.value);
});

/* ---------------- sidebar nav (panelmenu dogfood) ---------------- */
function buildNav() {
  navEl.setAttribute("data-dx-panelmenu", "");
  let groupIndex = 0;
  const frag = document.createDocumentFragment();
  for (const group of NAV) {
    const item = document.createElement("div");
    item.className = "dx-panelmenu-item";
    const subId = `nav-sub-${groupIndex++}`;
    item.innerHTML = `
      <button class="dx-panelmenu-trigger" type="button" data-dx-panelmenu-trigger
              data-dx-panelmenu-item data-dx-text="${group.title}"
              data-index="${groupIndex - 1}" aria-haspopup="menu" aria-expanded="false"
              aria-controls="${subId}">
        <span class="dx-panelmenu-trigger-text">${group.title}</span>
        <span class="dx-panelmenu-caret" aria-hidden="true">▾</span>
      </button>
      <div class="dx-panelmenu-submenu" id="${subId}" role="menu" hidden></div>`;
    const submenu = item.querySelector(".dx-panelmenu-submenu");
    for (const r of group.routes) {
      const li = document.createElement("div");
      li.className = "dx-panelmenu-submenu-item";
      li.setAttribute("role", "menuitem");
      const a = document.createElement("a");
      a.href = `#/${r.slug}`;
      a.textContent = r.title;
      a.dataset.dxPanelmenuItem = "";
      a.dataset.dxValue = r.slug;
      a.dataset.dxText = r.title;
      a.dataset.slug = r.slug;
      a.dataset.haystack = `${r.title} ${r.slug}`.toLowerCase();
      li.appendChild(a);
      submenu.appendChild(li);
    }
    frag.appendChild(item);
  }
  navEl.appendChild(frag);
}
buildNav();

function setActiveNav(slug) {
  navEl.querySelectorAll("a[aria-current]").forEach((a) => a.removeAttribute("aria-current"));
  navEl.querySelectorAll(".dx-panelmenu-trigger[aria-expanded='true']").forEach((t) => t.setAttribute("aria-expanded", "false"));
  navEl.querySelectorAll(".dx-panelmenu-submenu").forEach((s) => (s.hidden = true));
  if (!slug) return;
  const link = navEl.querySelector(`a[data-slug="${CSS.escape(slug)}"]`);
  if (!link) return;
  link.setAttribute("aria-current", "page");
  const item = link.closest(".dx-panelmenu-item");
  if (item) {
    const trigger = item.querySelector(".dx-panelmenu-trigger");
    const submenu = item.querySelector(".dx-panelmenu-submenu");
    trigger.setAttribute("aria-expanded", "true");
    submenu.hidden = false;
  }
}

function filterNav(query) {
  const q = query.trim().toLowerCase();
  let any = false;
  for (const item of navEl.querySelectorAll(".dx-panelmenu-item")) {
    let visible = 0;
    for (const li of item.querySelectorAll(".dx-panelmenu-submenu-item")) {
      const match = !q || li.firstElementChild.dataset.haystack.includes(q);
      li.hidden = !match;
      if (match) visible++;
      else if (li.firstElementChild.hasAttribute("aria-current")) li.firstElementChild.removeAttribute("aria-current");
    }
    item.hidden = visible === 0;
    if (q && visible) {
      item.querySelector(".dx-panelmenu-trigger").setAttribute("aria-expanded", "true");
      item.querySelector(".dx-panelmenu-submenu").hidden = false;
    }
    any = any || visible > 0;
  }
  navEmpty.hidden = any;
  navEmpty.textContent = q ? `No components match “${navSearch.value.trim()}”.` : "No components match.";
  // a query should never sit behind a collapsed sidebar (mobile / resize)
  if (q && mq.matches && document.body.classList.contains("app-nav-collapsed")) setNavCollapsed(false);
  if (!q) setActiveNav(currentRoute?.slug || "");
}
navSearch.addEventListener("input", () => filterNav(navSearch.value));
navSearch.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    navSearch.value = "";
    filterNav("");
  }
  if (e.key === "Enter") {
    const first = navEl.querySelector(".dx-panelmenu-submenu-item:not([hidden]) a[data-slug]");
    if (first) {
      e.preventDefault();
      location.hash = `#/${first.dataset.slug}`;
      navSearch.value = "";
      filterNav("");
    }
  }
});

/* ---------------- sidebar collapse ---------------- */
const mq = window.matchMedia("(max-width: 900px)");
function setNavCollapsed(collapsed) {
  document.body.classList.toggle("app-nav-collapsed", collapsed);
  sidebarToggle.setAttribute("aria-expanded", String(!collapsed));
}
setNavCollapsed(mq.matches);
mq.addEventListener("change", (e) => setNavCollapsed(e.matches));
sidebarToggle.addEventListener("click", () => {
  setNavCollapsed(!document.body.classList.contains("app-nav-collapsed"));
});
navEl.addEventListener("click", (e) => {
  if (mq.matches && e.target.closest("a[data-slug]")) setNavCollapsed(true);
});

/* ---------------- toc (dx-toc dogfood: behaviors provides scroll-spy + click) ---------------- */
function buildToc() {
  const sections = [...content.querySelectorAll(".demo-section[id]")];
  if (sections.length < 2) {
    tocEl.hidden = true;
    tocList.innerHTML = "";
    return;
  }
  const slug = currentRoute?.slug || "";
  tocList.innerHTML = sections
    .map((s) => {
      const h = s.querySelector("h2");
      const route = ROUTES.get(s.id);
      const label = route ? route.title : h ? h.textContent : s.id;
      const href = slug ? `#/${slug}/${s.id}` : `#//${s.id}`;
      // data-dx-selector keeps behaviors' querySelector valid; href keeps the
      // deep-link format (behaviors preventDefaults the click and scrolls itself)
      return `<li class="dx-toc-item"><a class="dx-toc-link" data-dx-toc-item data-dx-selector="#${s.id}" href="${href}">${label}</a></li>`;
    })
    .join("");
  tocEl.hidden = false;
  // items changed → force behaviors' initToc to rebuild scroll-spy
  const tocRoot = tocEl.querySelector("[data-dx-toc]");
  if (tocRoot) delete tocRoot._dxToc;
  document.dispatchEvent(new Event("htmx:afterSettle"));
}

/* ---------------- page fetch + inject ---------------- */
async function loadPage(page) {
  if (!pageCache.has(page)) {
    const res = await fetch(`pages/${page}.html`);
    if (!res.ok) throw new Error(`page ${page}: ${res.status}`);
    pageCache.set(page, await res.text());
  }
  return pageCache.get(page);
}

function afterInject() {
  if (window.htmx) window.htmx.process(content);
  document.dispatchEvent(new Event("htmx:afterSettle"));
  bindWidgets();
}

function renderNotFound(slug) {
  currentRoute = { slug, page: null };
  content.innerHTML = `
    <div class="page-head">
      <h1>Not found</h1>
      <p class="page-sub">No component <code>${escapeHtml(slug)}</code> in this demos.</p>
    </div>
    <section class="demo-section" id="missing">
      <div class="demo-card">
        <a class="dx-button dx-button--primary" href="#/">Back to overview</a>
      </div>
    </section>`;
  buildToc();
  setActiveNav("");
  document.title = "Not found · htmx-uikit demos";
}

async function render() {
  const raw = location.hash.replace(/^#\/?/, "");
  const parts = raw.split("/");
  const slug = parts[0] || "";
  const anchor = parts[1];
  const token = ++navToken;

  const route = slug === "" ? { slug: "", page: "index" } : ROUTES.get(slug);
  if (!route) {
    renderNotFound(slug || "?");
    return;
  }

  let html;
  try {
    html = await loadPage(route.page);
  } catch (err) {
    console.error(err);
    renderNotFound(slug || "?");
    return;
  }
  if (token !== navToken) return;

  const pageChanged = !currentRoute || currentRoute.page !== route.page;
  currentRoute = route;
  if (pageChanged) {
    content.innerHTML = html;
    afterInject();
  }
  buildToc();
  setActiveNav(slug);
  syncThemeSelects();
  updateThemeState();

  const title = routeTitle(slug);
  document.title = slug ? `${title} · htmx-uikit demos` : "htmx-uikit demos";
  document.getElementById("component-count").textContent = `${COMPONENT_COUNT} components`;
  const heroCount = document.getElementById("hero-count");
  if (heroCount) heroCount.textContent = `${COMPONENT_COUNT} components`;

  const targetId = anchor || null;
  const el = targetId ? document.getElementById(targetId) : null;
  if (el) el.scrollIntoView({ block: "start" });
  else window.scrollTo(0, 0);
  content.focus({ preventScroll: true });
}

/* ---------------- per-page widgets ---------------- */
function bindWidgets() {
  const toggle = document.getElementById("demos-shell-toggle");
  const shellSidebar = document.getElementById("demos-shell-sidebar");
  if (toggle && shellSidebar && !toggle.dataset.bound) {
    toggle.dataset.bound = "1";
    toggle.addEventListener("click", () => {
      const collapsed = shellSidebar.classList.contains("dx-sidebar--collapsed");
      toggle.textContent = collapsed ? "Expand sidebar" : "Collapse sidebar";
    });
  }
  const drawers = [
    { toggle: "demos-drawer-left-toggle", sidebar: "demos-drawer-left-sidebar", open: "Open left", close: "Close left" },
    { toggle: "demos-drawer-right-toggle", sidebar: "demos-drawer-right-sidebar", open: "Open right", close: "Close right" },
  ];
  drawers.forEach(({ toggle: t, sidebar: s, open, close }) => {
    const btn = document.getElementById(t);
    const pane = document.getElementById(s);
    if (!btn || !pane || btn.dataset.bound) return;
    btn.dataset.bound = "1";
    const sync = () => setTimeout(() => {
      btn.textContent = pane.classList.contains("dx-sidebar--collapsed") ? open : close;
    });
    btn.addEventListener("click", sync);
    const mask = document.querySelector(`[data-dx-sidebar-mask="#${s}"]`);
    if (mask) mask.addEventListener("click", sync);
  });
  const toastButtons = {
    "demos-toast-btn": () => window.dxToast({ title: "Saved", description: "Changes are synced.", tone: "success" }),
    "demos-toast-action-btn": () =>
      window.dxToast({
        title: "Item removed",
        tone: "info",
        action: { label: "Undo", onClick: () => console.log("undo") },
        cancel: { label: "Dismiss" },
        showProgress: true,
        durationMs: 6000,
      }),
    "demos-toast-persist-btn": () =>
      window.dxToast({ title: "Click me to dismiss", description: "Persistent, closeOnClick.", tone: "warning", durationMs: 0, closeOnClick: true }),
    "demos-toast-topleft-btn": () => window.dxToast({ title: "Top-left corner", position: "top-left", durationMs: 3000 }),
    "home-toast-btn": () => window.dxToast({ title: "Saved", description: "Changes are synced.", tone: "success" }),
  };
  for (const [id, fn] of Object.entries(toastButtons)) {
    const el = document.getElementById(id);
    if (el && !el.dataset.bound) {
      el.dataset.bound = "1";
      el.addEventListener("click", fn);
    }
  }
}

/* ---------------- event log (radzen EventConsole parity) ---------------- */
const LOG_EVENTS = [
  "dx:change", "dx:invalid", "dx:toc-click", "dx:menu-click", "dx:panelmenu-click",
  "dx:profilemenu-click", "dx:fabmenu-click", "dx:breadcrumb-click", "dx:steps-change",
  "dx:tree-select", "dx:grid-select", "dx:grid-sort", "dx:grid-filter", "dx:grid-page",
  "dx:page-change", "dx:carousel-change", "dx:splitter-resize", "dx:splitter-collapse",
  "dx:picklist-move", "dx:chart-point-click", "dx:scheduler-event-click", "dx:dropzone-drop",
  "dx:datalist-page", "dx:upload-complete",
];
const logEl = document.getElementById("event-log");
const logList = document.getElementById("event-log-list");
const logToggle = document.getElementById("event-log-toggle");
const logCount = document.getElementById("event-log-count");
const logLines = [];
let logUnseen = 0;

function logDetail(detail) {
  if (detail == null || typeof detail !== "object") return detail == null ? "" : String(detail);
  try {
    const s = JSON.stringify(detail);
    return s.length > 90 ? `${s.slice(0, 87)}...` : s;
  } catch {
    return "";
  }
}
function logPaint() {
  logList.replaceChildren(
    ...logLines.map((l) => {
      const li = document.createElement("li");
      li.textContent = l;
      return li;
    }),
  );
  logList.scrollTop = logList.scrollHeight;
}
function logSyncBadge() {
  logCount.textContent = String(logUnseen);
  logCount.hidden = logUnseen === 0;
}
for (const type of LOG_EVENTS) {
  document.addEventListener(type, (e) => {
    const t = new Date().toTimeString().slice(0, 8);
    const line = `${t} ${type}${logDetail(e.detail) ? ` ${logDetail(e.detail)}` : ""}`;
    logLines.push(line);
    if (logLines.length > 200) logLines.shift();
    if (logEl.hidden) {
      logUnseen++;
      logSyncBadge();
    } else {
      logPaint();
    }
  });
}
function setLogOpen(open) {
  logEl.hidden = !open;
  logToggle.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("log-open", open);
  if (open) {
    logUnseen = 0;
    logSyncBadge();
    logPaint();
  }
}
logToggle.addEventListener("click", () => setLogOpen(logEl.hidden));
document.getElementById("event-log-close").addEventListener("click", () => setLogOpen(false));
document.getElementById("event-log-clear").addEventListener("click", () => {
  logLines.length = 0;
  logUnseen = 0;
  logSyncBadge();
  logPaint();
});

/* ---------------- boot ---------------- */
window.addEventListener("hashchange", render);
if (location.hash === "") location.replace("#/");
render();
