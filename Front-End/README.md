# LeadIt — React Migration (Home page reference implementation)

This is the first working slice of the React migration described in the
migration plan: the full `src/` folder structure, plus a **complete,
functional migration of the Home page** (`index.html` → `Home.jsx`), wired
to your existing Flask API — no backend changes.

## Run it

```bash
npm install
npm run dev
```

Opens on http://localhost:5173. Talks to the same live API your old
frontend used (`https://thinkeasy-1-0.onrender.com/api`) — no local Flask
server required, but everything will also work against `http://localhost:5000`
if you update `API_URL` in `src/services/api.js`.

## What's done

- Full folder structure per the migration plan (`components/`, `pages/`,
  `hooks/`, `contexts/`, `services/`, `utils/`).
- `services/api.js` — single Axios-based API layer; no component calls
  `fetch()` directly.
- `contexts/AuthContext.jsx` — login/signup/session/logout, backed by the
  same `/api/login`, `/api/signup`, `/api/me`, `/api/logout` endpoints.
- `utils/activity.js`, `watchlist.js`, `compare.js`, `scoring.js` — the
  localStorage-driven personalization engine (trending score, ROI score,
  recently viewed, watchlist, compare-up-to-3) ported 1:1 from the legacy
  inline JS in `index.html`.
- **Home page** fully migrated and functional: hero + live search dropdown,
  personal dashboard, trending (with smart category filter), recently
  viewed, featured insights, high ROI grid, products grid, fastest-growing
  industries, recommended-for-you, saved/watchlist, journey steps,
  comparison table, CTA, rich footer, floating compare bar + modal, auth
  modal, and the feedback widget (bubble + submit + trending/vote tabs).
- **Business Details page** (`/business/:id`) fully migrated: sticky
  scroll-spy sidebar, hero + metrics row, overview, highlights, financials
  table, a full Chart.js analytics dashboard (growth trend line, investment
  breakdown donut, profit projection bars, revenue segments), roadmap,
  suppliers/competitors tables, SWOT, risks, related opportunities, AI
  advisor prompt panel, sources, government schemes, and related products
  — all loading from your existing `/api/business/:id` and
  `/api/products/by-business/:id` endpoints, same loading-skeleton /
  error-state behavior as the original.
- **Product Details page** (`/product/:id`) fully migrated: hero, overview,
  highlights, financials table, the same Chart.js analytics dashboard,
  suppliers/competitors tables, and roadmap — reusing the shared
  `AnalyticsCharts` and `Sections` building blocks from Business Details
  (the two legacy pages shared most of their logic; Product Details is the
  simpler subset, with no sidebar, SWOT, risks, AI advisor, sources,
  schemes, or related-products sections, matching the original).
- React Router is wired up (`/`, `/business/:id`, `/product/:id`,
  `/feedback`, `/admin/*`, etc.) — every route besides `/`, `/business/:id`
  and `/product/:id` currently shows a placeholder (`ComingSoon.jsx`) so
  navigation never 404s while the rest of the migration continues.
- Original CSS carried over as-is into `src/styles/` (design tokens +
  page styles) — this is a migration, not a redesign, so the visual
  identity, dark-mode support, and animations are unchanged. Note:
  `business-details.css` and `product-details.css` each have their own
  separate design-token set (scoped under `.bd-page` / `.pd-page` wrapper
  classes instead of `:root`) so neither collides with the Home page's
  dark-mode tokens — the legacy pages used different, non-shared token
  systems, and this preserves that.

## Phase 2 (this pass)

Built on top of Phase 1 without touching `Home.jsx`, `BusinessDetails.jsx`,
or `ProductDetails.jsx`:

- **`pages/Feedback/FeedbackCenter.jsx`** — full feedback page: debounced
  search, status filter chips (from `/api/feedback/meta`), sort (Trending /
  Newest / Recently Updated), voting, expandable cards that lazily fetch
  `/api/feedback/:id` to show the team's admin reply, loading skeletons,
  empty states, infinite scroll (via `IntersectionObserver`), and an
  inline "Share Feedback" panel reusing the same form as the floating
  widget. **Scope note:** the backend's only public feedback listing
  endpoint is `/api/feedback/trending` (trending + pinned items only) —
  there's no public "list everything" endpoint (`GET /api/feedback` is
  `@login_required`, admin-only) — so this page fetches a broad batch from
  `/trending` and does search/filter/sort client-side. That's disclosed
  to the visitor in a small note on the page rather than pretending it's
  a full unfiltered feed.
- **`pages/Login/Login.jsx`** — login/signup with `react-hook-form`
  validation, password visibility toggles, a "remember my email"
  convenience (there's no backend "remember me" session flag, so this is
  honestly scoped to prefilling the email field, not extending session
  length), forgot-password placeholder, toast notifications, loading
  state on submit, and a redirect-back-after-login flow.
- **Shared component upgrades**: `FeedbackWidget` refactored onto a new
  shared `FeedbackForm` (no more duplicated form code between the modal
  and the full page) and `StatusBadge`; Framer Motion added to the modal,
  mobile menu, and search overlay; `Footer`/`TrendingCard`/`ROICard`/
  `RecCard` wrapped in `React.memo`. New reusable primitives:
  `components/Buttons/Button.jsx`, `components/Loading/Skeleton.jsx`,
  `components/Loading/EmptyState.jsx`.
- **Routing**: all pages are now `React.lazy`-loaded with a shared
  `Suspense` fallback and a fade page transition; added a dedicated
  `NotFound.jsx` (404) and `components/Routing/ProtectedRoute.jsx` (auth
  guard, currently applied to `/admin/*` ahead of Phase 3 — it checks the
  same customer session as the rest of the app, since there's no separate
  admin-auth system yet).
- **Performance**: `useDebouncedValue` and `useInfiniteScrollSentinel`
  hooks (both reusable), route-level code splitting confirmed in the
  build output (each page ships as its own chunk).
- **Toasts**: a small first-party `ToastContext`/`useToast` (no extra
  dependency) wired up in `main.jsx`, used by `FeedbackForm` and `Login`.
- Build verified with `npm run build` — all new chunks compile cleanly,
  no console errors expected from static review (all lists are properly
  keyed, all effects have cleanups).

### Ready for Phase 3

The `pages/admin/{Dashboard,Categories,Businesses,Products,ImportWizard,
Feedback,Settings}` folders from the original scaffold are untouched and
waiting. `/admin/*` currently renders a `ProtectedRoute`-gated placeholder
— swapping that placeholder for the real admin router is the first step
of Phase 3.

## Phase 3 (this pass — Admin, in progress)

Important correction made along the way: the Flask backend keeps **admin
auth completely separate from customer auth** (`session["admin_id"]` vs
`session["user_id"]`, via `/api/admin/login` with a username, not
`/api/login`'s email). Phase 2's placeholder had gated `/admin/*` with the
*customer* session as a stand-in — that's now fixed with a dedicated
`AdminAuthContext` + `AdminProtectedRoute` that check the real admin
session (`/api/admin/session`), scoped so the customer-facing app never
pays for an admin session check it doesn't need.

Built this pass:
- **`contexts/AdminAuthContext.jsx`** + admin endpoints in `services/api.js`
  (`adminLogin`/`adminLogout`/`adminSession`, plus admin CRUD for
  categories and read endpoints for businesses/products/feedback stats/
  activity logs — all under the real `session["admin_id"]` guard).
- **`pages/admin/AdminLogin.jsx`** — separate sign-in page (username +
  password, not email), react-hook-form validated, its own toasts.
- **`pages/admin/AdminLayout.jsx`** — sidebar shell (Dashboard, Categories,
  Businesses, Products, Import Wizard, Feedback, Settings) shared by every
  admin subpage via `<Outlet/>`, with a logout button and active-route
  highlighting.
- **`pages/admin/Dashboard/AdminDashboard.jsx`** — live stat cards
  (category/business/product counts, feedback totals/bugs/pending from
  `/api/feedback/stats`) and a recent-activity feed from
  `/api/activity-logs`.
- **`pages/admin/Categories/AdminCategories.jsx`** — the first fully
  working admin CRUD vertical: search, add/edit modal (name, auto-slug,
  icon), hide/unhide, delete with a confirmation modal, toasts, loading
  skeletons — wired to the real `/api/category` endpoints.
- New `pages/admin/admin.css` — a fresh admin shell built on the same
  design tokens (`var(--bg)`, `var(--card)`, `var(--border)`, etc.) as the
  rest of the app, rather than porting the legacy `admin.html`'s standalone
  CSS theme verbatim, so the admin panel now matches the rest of the
  migrated app's design language instead of looking like a bolted-on
  separate product.
- Businesses, Products, Import Wizard, and Settings are wired into the
  router and sidebar as `AdminComingSoon` placeholders (so navigating
  never dead-ends) — these are next.
- **`pages/admin/Feedback/AdminFeedback.jsx`** — full moderation view over
  the real admin-only `GET /api/feedback` (search/category/status/sort,
  distinct from the public trending-only endpoint `FeedbackCenter.jsx`
  uses): checkbox multi-select with bulk delete, per-item detail modal to
  change status and attach an admin response in one save, pin/unpin,
  single delete with confirmation, loading skeletons, toasts.

- **`pages/admin/Businesses/AdminBusinesses.jsx`** + **`AdminBusinessForm.jsx`**
  — the big one. List view (search, category filter, hide/unhide, delete,
  "view on site" link) plus a full add/edit page (not a modal — there's
  too much content) with collapsible sections for Basic Info, Financials,
  Overview, Highlight Badges, Market Growth Chart, Investment Breakdown,
  Profit Projection, Roadmap, Suppliers, and Competitors — all wired to
  the real `/api/business` POST/PUT payload shape. When editing an
  existing business, a **Sources & Government Schemes** section appears
  too, since those are separate row-based sub-resources
  (`/api/business/:id/sources`, `/api/business/:id/schemes`) rather than
  part of the business JSON blob — each row saves independently against
  its own endpoint. New reusable pieces: `components/Admin/RepeatableRows.jsx`
  (generic array-of-objects row editor, reused across badges/roadmap/
  suppliers/competitors/chart rows) and `components/Admin/FormSection.jsx`
  (collapsible section wrapper).
  **Note on scope**: `BusinessDetails.jsx`'s SWOT / Risks / Related
  Opportunities sections read `biz.swot` / `biz.risks` /
  `biz.opportunities_list`, but those columns don't actually exist in the
  `businesses` table or its add/update endpoint in this backend — so
  there's nothing for this form to manage there; those sections will
  keep showing their "no data yet" empty state until the backend adds
  that support.

- **`pages/admin/Products/AdminProducts.jsx`** + **`AdminProductForm.jsx`**
  — same shape as Businesses (list with search/business-filter/hide/
  delete + a full form with the same collapsible sections), since the
  backend's product schema mirrors the business schema field-for-field.
  The one addition is a required **Parent Business** selector (products
  belong to a business; the backend derives `category_id` from that
  business server-side if not given). No Sources/Schemes section here —
  those sub-resources are business-only in this backend. Reused
  `RepeatableRows`/`FormSection` entirely as-is, no new shared components
  needed.

- **`pages/admin/ImportWizard/AdminImportWizard.jsx`** — bulk import for
  categories/businesses/products: pick entity type → download the
  official `.xlsx` template → upload a file → dry-run preview (row counts
  by valid/duplicate/invalid, first 20 rows with per-row reasons, columns
  rendered dynamically since each entity's preview response has different
  fields) → confirm import (shows the same imported/updated/skipped/failed
  summary the backend returns). Wired to the real
  `/api/import/{entity}/template|preview` and `POST /api/import/{entity}`
  endpoints — no changes to the backend's two-pass parent/child import
  logic, error handling, or response shape.
- **`pages/admin/Settings/AdminSettings.jsx`** — kept deliberately small
  and honest: there's no Settings feature anywhere in the legacy
  `admin.html`/`admin.js`, and no backend endpoint for changing the admin
  password or managing admin accounts (credentials are bootstrapped from
  `ADMIN_BOOTSTRAP_USERNAME`/`ADMIN_BOOTSTRAP_PASSWORD` env vars at
  deploy time). Rather than inventing toggles that don't do anything,
  this page shows the signed-in admin account, a log-out action, which
  API the panel is talking to, and states plainly how credentials are
  actually rotated.

**Phase 3 (Admin) is now fully migrated** — every item from the original
scaffold (Dashboard, Categories, Businesses, Products, Import Wizard,
Feedback, Settings) is a real, working page wired to the live backend,
not a placeholder.

## LeadIt v2.0 rebrand (this pass)

Full rename from ThinkEasy → **LeadIt**, plus a new visual identity:

- **Text rebrand**: every "Think Easy"/"ThinkEasy" occurrence replaced
  across 24+ files (navbar, hero, footer, login, admin, meta tags, OG
  tags, README/deployment docs, `package.json`). The two-tone logo text
  (`Think`+`Easy`) became `Lead`+`It`. The real backend URL
  (`thinkeasy-1-0.onrender.com`) was deliberately left alone — that's
  live infrastructure, not branding, and renaming a Render service is a
  separate, riskier operation than a text rebrand.
- **New color theme**: `design-system.css`'s root tokens (light + dark
  mode) replaced with the requested Business Intelligence palette —
  `#0F766E` primary / `#14B8A6` secondary / `#22C55E` accent / slate
  neutrals — plus a full sweep of every hardcoded old indigo/blue hex
  and `rgba()` value across the admin, login, feedback, and detail-page
  stylesheets from Phase 4, so nothing was left mismatched.
- **Favicon + app icons**: generated programmatically with Pillow (no
  external image tool) — a circular teal→emerald gradient, bold white
  "L", and a small single-stroke growth arrow with a clean arrowhead
  tucked into the corner. Produced at 16/32/180/192/512px plus a
  multi-resolution `favicon.ico`, wired into `index.html` (`<link
  rel="icon">`, `apple-touch-icon`, updated `theme-color`) and a new
  `public/manifest.json`.
- **One shared `LogoMark.jsx`** (SVG, matches the favicon exactly) now
  used consistently in the Navbar, Login, Admin sidebar, Admin login,
  Business Details, Product Details, and the homepage footer — replacing
  six different one-off icon implementations that used to exist across
  those pages.
- Verified with `npm run build` (clean) and `npm test` (58/58 passing).
  `Home.jsx` needed zero edits for any of this — the brand only ever
  appeared in its child components (`Navbar`, `HeroSection`,
  `StaticSections`), none of which were protected.

### Not done yet from the LeadIt v2.0 brief

This was a 15-section brief; this pass covered sections 1-4 (rebrand,
theme, favicon, logo). Still open:
- **Homepage/Business Details visual redesign** beyond the color swap
  (new hero copy, additional cards/animations specifically called out
  in sections 5-6)
- **Admin panel table/pagination/filter improvements** (section 7)
- **Bulk delete** with typed "DELETE" confirmation (section 8)
- **"Delete Everything" danger zone** (section 9) — flagging again: this
  needs a real backend wipe-all-tables endpoint that doesn't exist yet.
  Building a fake UI for something this destructive isn't something to
  rush through; it needs its own deliberate pass with explicit
  confirmation once the backend side is actually ready.
- **Excel upload audit** (section 10) — needs a dedicated pass through
  the actual import endpoints and edge cases (rollback, large files),
  not just a glance
- **Full functionality/responsive/performance/bug audits** (sections
  11-14) — each of these is really its own project; happy to tackle them
  one at a time the same way Phase 3/4 got built incrementally

## LeadIt v2.0 — Business/Product Details visual redesign (this pass)

Covers section 5-6's remaining interactive-component asks, entirely via
the shared `Sections.jsx` (imported by both `BusinessDetails.jsx` and
`ProductDetails.jsx`) plus `detail-enhancements.css` — neither protected
page file needed any edits this pass:

- **Supplier cards** — replaced the data table with a responsive card
  grid (avatar initial, location, type tag, rating bar), each card
  animating in on scroll (Framer Motion `whileInView`) with a slight
  stagger.
- **Competitor comparison cards** — same treatment: threat-level tag,
  market share / company size stats, hover lift.
- **Expandable SWOT** — each quadrant now shows its first 2 points by
  default with a "+N more" toggle; expanding/collapsing animates height
  via `AnimatePresence`, rather than always dumping every item at once.
- **Interactive Risks** — added severity filter chips (All/High/Medium/
  Low, only shown when the data actually has more than one level) so a
  long risk list isn't just a wall of text; filtered items animate in/out.
- **Roadmap timeline** — each step now animates in on scroll instead of
  rendering all at once (same horizontal-timeline layout as before, just
  no longer static).
- Verified with `npm run build` (clean — including catching and fixing a
  stray CSS comment-parsing warning introduced along the way) and
  `npm test` (58/58 passing).

## LeadIt v2.0 — Bulk actions with typed confirmation (this pass)

Section 8: checkbox multi-select added to Categories, Businesses, and
Products (Feedback already had it from Phase 3) — select-all toggles
everything on the *current page* (not every filtered result across
pages, which would be surprising to act on blindly). A `BulkActionBar`
appears above the table once anything's selected, offering Hide/Unhide
(applied immediately — reversible) and Delete. Delete requires typing
the literal word **DELETE** into a `ConfirmTypedModal` before the button
even enables — no accidental-click path to a destructive bulk action.
Feedback's existing bulk-delete confirm was upgraded to the same typed
modal for consistency across all four tables. All four call the real
`/api/{categories,businesses,products,feedback}/bulk` endpoints
(`{ ids, action }` → `{ ok, errors }`), which already supported
hide/unhide/delete server-side — no backend changes needed. Verified
with `npm run build` (clean) and `npm test` (62/62 passing). No
protected files touched.



Section 7's "better pagination" ask — a reusable `hooks/usePagination.js`
(with unit tests) + `components/Admin/Pagination.jsx` control (page
numbers with ellipsis for long runs, page-size selector, first/prev/
next/last), wired into all four admin list views: Categories,
Businesses, Products, and Feedback. Search/filters in each of those were
already built in Phase 3 — this just adds a proper page control under
each table instead of dumping every matching row at once. Feedback's
existing "select all across all matching filters" bulk-select behavior
was left as-is (still correct — pagination only changed what's rendered
per screen, not what "select all" means). Verified with `npm run build`
(clean) and `npm test` (62/62 passing, 4 new tests for the pagination
hook itself). No protected files touched — this was entirely within
`src/pages/admin/`.

### Still open from the LeadIt v2.0 brief

- **Delete Everything** (section 9) — still blocked on a real backend
  endpoint + your explicit confirmation
- **Backend restructuring** (Phase 5, backend half) — up next

## LeadIt v2.0 — Phase 5, React cleanup (this pass)

A note first: this session's sandbox reset between turns (the working
directory is ephemeral scratch space, separate from the files you
actually have), so this pass started by restoring the project from the
last zip delivered in this conversation and re-verifying it was byte-
identical to before the reset — it was, confirmed via checksum on all
three protected files plus a full lint/build/test pass.

Actual cleanup findings (verified, not guessed):
- **9 completely empty directories removed** —
  `components/{Charts,Inputs,Search,MegaMenu}` and
  `pages/{About,AIAdvisor,Businesses,Products,MarketInsights}` — leftover
  from the very first Phase 1 scaffold (dated back to the initial
  migration), never used since: the real `MegaMenu` lives in
  `components/Navbar/MegaMenu.jsx`, and the `/about`, `/ai-advisor`,
  `/market-insights` routes render `ComingSoon` inline rather than a
  dedicated page file. Confirmed dead by checking every route/import in
  `App.jsx` before deleting, and confirmed build/tests were unaffected
  after.
- **Dead CSS removed**: `.nav-logo-mark .bar/.b1/.b2/.b3` in `home.css` —
  orphaned when the footer logo was swapped to the shared `LogoMark` SVG
  component a few passes back, never cleaned up at the time.
- **Verified, not found wanting**: every production dependency in
  `package.json` (axios, chart.js, framer-motion, react, react-dom,
  react-helmet-async, react-hook-form, react-router-dom) is genuinely
  used somewhere in `src/` — none are dead weight.
- `src/pages/admin/*` subfolders were checked too — all contain real,
  used files, so nothing removed there.

Verified with `npm run lint` (clean), `npm run build` (clean), and
`npm test` (69/69 passing) after every change, and confirmed zero
behavioral difference (bundle output identical in structure, only
content hashes changed since filenames include a build hash).

## LeadIt v2.0 — Product Details Market Insights (this pass)

Section 6 asked for "Market insights", "Price trends", and "Demand
trends". Before building anything, I checked the actual backend schema
(`app.py`) for price or demand fields — **there are none, anywhere**.
Businesses and products only ever track `market_size`, `growth_rate`,
`investment`/`min`/`max_investment`, and `profit_margin` — no price
history, no demand index, nothing time-series about either.

Rather than fabricate charts from numbers that don't exist, this pass
built **Market Insights** as something genuinely computable from real
data: a new `components/DetailPage/MarketInsights.jsx` panel that
compares this product against its actual category peers (reusing the
same businesses+products cache the Navbar's search already warms) —
growth rate vs. category average, market-size percentile, and entry-cost
percentile, all computed live, all real numbers. It correctly shows an
honest "not enough data yet" state when a category has fewer than 2
comparable listings instead of dividing by zero or showing nonsense.

**Price Trends and Demand Trends are not built**, and won't be until the
backend actually tracks that data — the frontend has nothing to render.
Verified with `npm run lint` (clean), `npm run build` (clean), and
`npm test` (69/69 passing). Only `ProductDetails.jsx` was touched, via
the same small disclosed pattern as previous passes (import + one new
`<Section>` block, nothing else in the file changed).

## LeadIt v2.0 — Functionality/Responsive/Performance/Bug audit (this pass)

Sections 11-14 asked for a real audit, not a glance, so this pass added
actual tooling rather than eyeballing the code: **ESLint is now part of
the project** (`npm run lint`) with `eslint-plugin-react` +
`eslint-plugin-react-hooks`, configured to catch real bugs (unused vars,
missing/incorrect hook dependencies) rather than pure style noise
(`react/no-unescaped-entities` — apostrophes in JSX text — was turned
off since React renders those fine; flagging them isn't a bug, just
churn).

**Bugs found and fixed:**
- **A real, subtle bug in my own earlier work**: five places
  (`SourcesSchemesManager`, and the mount-effects in `AdminBusinesses`/
  `AdminCategories`/`AdminFeedback`/`AdminProducts`) had an
  `eslint-disable-next-line` comment placed *inline on the same line* as
  the code it was meant to suppress, rather than on its own line above —
  so it silently disabled nothing, and the underlying
  `react-hooks/exhaustive-deps` warning was just never actually checked.
  `SourcesSchemesManager`'s `loadAll` is now a proper `useCallback` with
  correct dependencies (the technically-correct fix); the four admin
  list pages got the disable comment moved to where it actually works,
  since their "run once on mount" / "run on filter change" intent was
  already correct, just unverified.
- Dead `refreshTick` prop on `BookmarkButton` (never read, never passed
  by any caller — safe to remove entirely).
- Unnecessary regex escape in `RepeatableRows.jsx` (harmless but flagged;
  cleaned up).
- The `screenshot` state in `FeedbackForm` was flagged as unused — it's
  intentionally captured for the local preview only (no backend
  attachment endpoint to send it to, per the earlier honest disclosure)
  but renamed and commented so it's clear that's deliberate, not an
  oversight, for the next person reading it.

**Performance finding, fixed**: `AnalyticsCharts.jsx` imported
`chart.js/auto`, which registers *every* chart type, scale, and plugin
Chart.js has, even though this app only ever renders line/doughnut/bar
charts. Switched to explicit tree-shaken imports registering only what's
used — the shared chart chunk dropped from 234.68KB to 200.42KB
(~15% smaller, ~10KB less gzipped over the wire). Chart.js's core
architecture has a real floor even minimally registered, so this is a
modest, honest improvement, not a dramatic one.

**Verified, not just assumed:**
- Zero orphaned/unimported component files (checked every `.jsx` file
  has at least one importer; `main.jsx` correctly flagged as a false
  positive since it's the entry point Vite loads directly, not
  JS-imported).
- Zero `console.log`/`console.debug`/`TODO`/`FIXME` leftovers anywhere
  in `src/`.
- Responsive coverage: most custom stylesheets have explicit `@media`
  breakpoints; the ones that don't (`login.css`, `ui-kit.css`) were
  checked individually and use fluid units (`width: 100%; max-width:
  400px`, flex-wrap) that don't need breakpoints to behave correctly on
  mobile — confirmed rather than assumed.

Verified with `npm run lint` (0 problems), `npm run build` (clean), and
`npm test` (69/69 passing) after every fix. No protected files touched
— everything here was either shared components/hooks or admin pages.

## LeadIt v2.0 — Interactive KPI cards (this pass)

Section 5's "Interactive KPI cards" for Business Details: new
`components/DetailPage/AnimatedMetric.jsx` — parses a formatted value
like `"₹5.00 Cr"` or `"25%"` into prefix/number/decimals/suffix, and
counts the numeric part up from 0 when it scrolls into view (Framer
Motion `animate()` + `useInView`, once per page load), while the
currency symbol / `%` / unit stays put. Non-numeric values (`"—"`,
`"Not Available"`) fall back to rendering unanimated rather than
breaking. The four hero metric cards on Business Details now use this
via a shared `KpiCard` component (icon, hover lift, scroll-in fade)
instead of static divs — a small, disclosed edit to
`BusinessDetails.jsx` (swapped the metrics-row block, nothing else
touched).

**Product Details deliberately did not get this treatment** — checked
first, and the original legacy `product-details.html` never had a
metrics-row/KPI-card hero at all, only a plain financials table; the
v2.0 brief's KPI-card line item was specific to Business Details
(section 5), so `ProductDetails.jsx` needed zero edits here.

Verified with `npm run build` (clean) and `npm test` (69/69 passing, 5
new tests for the value-parsing logic).

## LeadIt v2.0 — Excel upload audit (this pass)

Section 10 asked for a genuine audit, not just a glance, so here's what
I actually verified by reading the backend's import code
(`/api/import/{categories,businesses,products}/{template,preview}` and
the commit endpoints), not assumed:

**Already correct, verified against the real backend responses:**
- Validation and duplicate detection — the preview endpoint classifies
  every row as `valid`/`duplicate`/`invalid` server-side (checked against
  both the DB and repeats within the same file); the wizard already
  displayed this correctly.
- Preview before import — dry-run endpoint, no data written; confirmed
  the wizard's counts reflect the *whole file* even though only the
  first 20 rows are shown in detail (that's a backend-imposed display
  cap, not a wizard bug).
- Import report — the commit response includes **every** row's outcome
  (not capped at 20 like the preview), confirmed by reading the actual
  loop in `import_categories`/`import_businesses`/`import_products`.

**Two things worth knowing that don't work the way "audit" checklists
often assume, corrected here rather than glossed over:**
- **"Rollback" is per-row, not whole-file.** Each row commits to the
  database independently — if row 47 fails, rows 1-46 already succeeded
  and stay committed; there's no all-or-nothing transaction across the
  whole import. This is arguably the right design for bulk imports (one
  bad row shouldn't void 500 good ones), but it's not "rollback" in the
  usual sense, so the wizard now says so explicitly right above the
  Confirm Import button instead of leaving it ambiguous.
- **No large-file protection exists server-side** — no
  `MAX_CONTENT_LENGTH`, no streaming/chunked parsing; the whole file is
  read into memory via pandas. Added a client-side warning (not a hard
  block, since there's no real backend limit to enforce against) when a
  selected file exceeds 15MB.

**Genuinely new, not previously built:**
- **Upload progress bars** for both the preview and the actual import
  step, via axios `onUploadProgress` — previously the wizard just showed
  a spinner with no sense of progress on a large file.
- **Export Failed Rows** button on the completed-import card, which
  generates a CSV client-side from the full (uncapped) result rows —
  new `utils/csvExport.js`, with its own unit tests.

Verified with `npm run build` (clean) and `npm test` (64/64 passing, 2
new tests for the CSV export helper). No backend or protected files
touched.


Everything from the original migration brief is done, including an
automated test suite:

- **`npm test`** (Vitest + Testing Library, jsdom environment) — 58
  passing tests across 9 files: the full personalization engine
  (`scoring`, `activity`, `watchlist`, `compare`), all formatting/parsing
  utilities (`format`, `bizFormat` — including the chart-data parsers used
  by `AnalyticsCharts`), the `useDebouncedValue` hook (with fake timers,
  verifying it actually debounces and resets on rapid changes), and
  component smoke tests (`Button`, `StatusBadge`). Run `npm test` for a
  single pass or `npm run test:watch` while developing. Test files are
  colocated with the code they test (`*.test.js`/`*.test.jsx`) and are
  excluded from the production bundle automatically (Vite only picks up
  `main.jsx`'s import graph for `npm run build`).
- **Login.jsx** page exists for customers; there's no separate "forgot
  password" flow beyond the placeholder toast, since the backend doesn't
  expose password reset.
- Framer Motion is used throughout but hasn't had a dedicated pass for
  page-level scroll-reveal choreography beyond what's already in Home
  (Home.jsx itself is off-limits to edit, and its CSS already ports the
  legacy `.reveal` classes as always-visible rather than scroll-triggered,
  matching the original page's actual behavior).

**The full migration — Phases 1 through 3 — is complete.** Every page
from the original brief (Home, Business Details, Product Details,
Feedback Center, Login, and the entire Admin panel) is implemented,
wired to the real Flask backend with no backend changes, and verified
with both `npm run build` and `npm test`.

## Phase 4 (in progress) — Production Polish

Phase 4's brief covers 15 workstreams — several of them (a Crunchbase-
style global search rebuild, PDF export/print, a full notifications
backend, a mega menu, virtualized lists) are substantial standalone
features. Rather than spread thin across all 15 at once, this is being
tackled in slices, same as Phase 3. **Slice 1 (this pass): error
resilience, SEO foundation, and deployment readiness.**

**⚠️ One deliberate exception to "don't touch Home/BusinessDetails/
ProductDetails.jsx":** Phase 4 section 11 explicitly asks for dynamic
SEO tags on every page, including these three. Rather than skip that
requirement or silently break the earlier rule, I made small, additive,
single-purpose edits to each — importing `<SEO/>` and rendering it as the
first line of the existing return block. No other line in any of the
three files was touched. If you'd rather these stay completely untouched
even for this, say so and I'll revert the three `<SEO/>` insertions.

Built this slice:
- **`components/ErrorBoundary.jsx`** — class-based global error boundary
  wrapping the whole app in `main.jsx`; catches render errors anywhere in
  the tree and shows a friendly recover/reload screen instead of a blank
  page (with the stack trace shown only in dev mode).
- **`pages/ServerError.jsx`** (`/500`) — a proper 500 page alongside the
  existing `NotFound.jsx` (404).
- **`hooks/useOnlineStatus.js`** + **`components/OfflineBanner.jsx`** —
  app-wide banner (not a full page swap) that appears the instant the
  browser goes offline and clears the moment it's back.
- **API retry** — `services/api.js`'s axios instance now retries GET
  requests up to twice with backoff on network failure or a 502/503/504
  (handles cold starts on free-tier hosting) — never retries non-GET
  requests, since those can have side effects.
- **`components/SEO/SEO.jsx`** — one shared component for title/meta
  description/canonical/OpenGraph/Twitter Card/JSON-LD, using
  `react-helmet-async`. Wired into Home, Business Details, Product
  Details (with `Product` JSON-LD), Feedback Center, and Login (marked
  `noIndex`, since a login page has no business being in search results).
  `index.html` also got sane default meta tags as a pre-hydration
  fallback for crawlers that don't execute JS.
- **`public/robots.txt`** + **`public/sitemap.xml`** — the sitemap only
  covers the fixed routes for now; see `DEPLOYMENT.md` for why dynamic
  business/product URLs aren't in it yet (needs either a build-time
  data-fetch script or a backend-served sitemap route — the latter would
  mean touching the backend).
- **`services/analytics.js`** — a genuinely opt-in GA4 + Microsoft
  Clarity loader: nothing loads and every tracking call is a silent
  no-op unless `VITE_GA_MEASUREMENT_ID`/`VITE_CLARITY_PROJECT_ID` are set
  (see `.env.example`). Page views are tracked centrally in `App.jsx` on
  every route change; feedback submission is tracked as an example event.
- **Deployment readiness**: `.env.example`, `vercel.json` (SPA rewrite +
  security headers), `public/_redirects` (Netlify/Render), and
  `DEPLOYMENT.md` covering Vercel/Render/Railway specifically.
- Verified with `npm run build` (clean) and `npm test` (58/58 passing)
  after every change in this slice.

## Phase 4, slice 2 — Search, Details pages, Feedback, Notifications

**Crunchbase-style global search + floating sticky search bar + mega
menu** — all rebuilt into `Navbar.jsx` (not a protected file):
- Search now only ever shows Businesses and Products — categories are
  deliberately excluded, per spec.
- Recent searches (persisted to localStorage via `utils/recentSearches.js`)
  and trending searches (computed live from the same `computeScores`
  engine Home uses, via a new shared `hooks/useSearchData.js` — a
  module-level cache so Navbar/Home/Details pages don't each re-fetch
  businesses independently) are shown when the search box is empty.
- Full keyboard navigation (↑/↓/Enter), matched-text highlighting, a
  loading skeleton, and a proper no-results state.
- A floating pill-shaped search bar appears after 250px of scroll and
  opens the exact same overlay — no duplicated search logic.
- A new "Explore" mega menu: Browse (Businesses/Products/Trending),
  Your Activity (Recently Viewed + Saved, pulled from the existing
  `Activity`/`Watchlist` utils), and Tools (AI Advisor, Feedback).

**Business & Product Details additions** — again via small, disclosed,
additive edits to the two protected files (same pattern as the SEO
insertion): a `ReadingProgress` bar, a `DetailToolbar` (bookmark with a
pop animation, share via the Web Share API with a clipboard fallback,
print, and "Export PDF" — which is honestly just the browser's
Print → Save as PDF via a tuned print stylesheet, not real PDF
generation, since adding a PDF library felt like overkill for what the
browser already does well), an interactive `ROICalculator` (projects
returns from the business's real growth rate/profit margin against a
number the visitor types in), and `RelatedCarousel`s (same-category
businesses/products, horizontally scrollable). `DetailSidebar.jsx` got
a new "ROI Calculator" link to match.

**Feedback system upgrades** — `FeedbackForm.jsx`: draft autosave
(restores an unfinished submission after an accidental close), an emoji
picker, basic markdown support (`**bold**`, `*italic*`, `` `code` ``,
links — a small custom safe renderer in `utils/markdownLite.jsx`, not a
full markdown library) with a hint in the placeholder, and a screenshot
upload **with an honest caveat**: it previews locally but isn't actually
uploaded anywhere, since the feedback API has no attachment storage.
`FeedbackCard.jsx` now renders messages with markdown formatting and
shows a status timeline — built only from the real fields the public
`/feedback/:id` endpoint returns (submitted → status → team response),
since the backend records a full status-history table but doesn't
expose a GET endpoint for it.

**Notification center** — bell icon + panel in the Navbar, entirely
client-side (persisted to localStorage via a new `NotificationContext`).
This is a genuine constraint disclosure, not a shortcut: there's no
notifications table or push mechanism in the backend, so rather than
fake "new business added" server-push events, it surfaces things that
actually happened in this browser — feedback you submitted, an import
an admin just ran.

**Accessibility**: the ported design system already had a global
`:focus-visible` outline rule and this slice's new interactive elements
(bookmark/share/print buttons, emoji picker, carousel arrows, notification
bell) all got explicit `aria-label`s to match what was already in place.

Verified with `npm run build` (clean) and `npm test` (58/58 passing)
after every change in this slice.

### Still pending

- **List virtualization** (react-window/similar) for long lists — the
  Feedback Center's infinite-scroll list is the main candidate; not done
  this slice to avoid rushing a change that risks regressing scroll
  behavior without dedicated testing time.
- A deeper accessibility audit (screen-reader pass, color contrast
  check against WCAG AA specifically) beyond the aria-label/focus-visible
  baseline above.


The full Feedback Center page, Login, and the entire Admin panel
(Categories/Businesses/Products/Import Wizard/Settings) still need the same
treatment. Use `Home.jsx`, `BusinessDetails.jsx`, and `ProductDetails.jsx`
as templates: one `useXData` hook per page, presentational section/card
components broken out into their own files, shared
`Navbar`/`Footer`/`FeedbackWidget`/`AuthModal` reused as-is.

Framer Motion is installed but not yet applied — the next pass is a good
place to add page-transition and scroll-reveal animations on top of the
working functionality, per the "UI Improvements" section of the plan.
