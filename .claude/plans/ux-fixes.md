# UX fixes — work through one item per commit

Source: static UX review (July 2026). One commit per item, top-to-bottom (priority order);
items are independent. CLAUDE.md/code-style rules apply; user runs all verification. Tick the
Progress checkbox in this file as part of each item's commit.

## Progress

- [x] 1. Persist theme + dark mode
- [x] 2. Recommendation cards accessible
- [x] 3. 404 page
- [x] 4. Contact links wrap
- [x] 5. Favicon, meta, per-route titles
- [x] 6. Scroll reset on navigation
- [x] 7. Track selector label
- [x] 8. Bar-chart tooltip on tap
- [ ] 9. View-toggle tooltips
- [ ] 10. Texture fills label
- [ ] 11. No-match search hint
- [ ] 12. Copy-link visible label + announcement
- [ ] 13. Decorative article images
- [ ] 14. Error fallback action line

## 1. Persist theme + dark mode, respect system colour scheme

- **Problem**: `src/context/theme/ThemeContextProvider.tsx:22-28` holds `themeName`/`isDarkMode`
  in plain `useState` with prop defaults (`initialTheme = 'purple'`, `initialDarkMode = false`).
  No localStorage, no `prefers-color-scheme` — choices reset every load.
- **Approach**:
  - New `ThemeContextProvider.helpers.ts`: `readStoredThemeName(): ThemeName | undefined`,
    `readStoredDarkMode(): boolean | undefined`, `storeThemeName`, `storeDarkMode` — all
    localStorage access in try/catch (private-mode Safari throws). Keys e.g. `theme-name`,
    `dark-mode` in a co-located `ThemeContextProvider.constants.ts` (or local consts if only
    used by the helpers file).
  - Props become optional overrides: change defaults to `undefined`
    (`initialTheme?: ThemeName; initialDarkMode?: boolean` in `ThemeContextProvider.types.ts`).
    Lazy init: `useState<ThemeName>(() => initialTheme ?? readStoredThemeName() ?? 'purple')`;
    dark: `initialDarkMode ?? readStoredDarkMode() ??
window.matchMedia('(prefers-color-scheme: dark)').matches`.
  - Persist via `useEffect` on each value (skip writing when the value came from an explicit
    prop is NOT needed — writing back is harmless).
  - Tests: jsdom `matchMedia` is globally mocked with `matches: false`
    (`src/setupTests.ts:40-52`), so default resolution stays light in tests. Existing tests
    passing `initialTheme`/`initialDarkMode` keep working (props win). Add helper tests for
    storage round-trip + thrown-storage fallback.
- **Commit**: `feat: persist theme and dark mode and default to the system colour scheme`

## 2. Recommendation cards: keyboard/screen-reader accessible

- **Problem**: `src/views/resume/timelineEventCard/recommendationText/RecommendationText.tsx:25-27`
  opens LinkedIn via Card `onClick` + `window.open` — no keyboard access, no link semantics.
  Worse, the byline nests a real `<Link>` inside the clickable card (nested interactive):
  `recommendationByline/RecommendationByline.tsx:15-23`.
- **Approach** (mirror `ArticleTile`, `src/views/articles/articleTile/ArticleTile.tsx:37-42`):
  - `RecommendationText`: drop `handleCardClick`/`useCallback` import; wrap content in
    `<CardActionArea component="a" href={recommendation.recommendationUrl} target="_blank"
rel="noopener noreferrer">`. Keep the outer `Card` as holder of `id`
    (`recommendationElementId(recommendation.id)`), highlight outline sx, and hover lift.
    Remove `cursor: 'pointer'` (CardActionArea provides affordance + focus ring).
  - `RecommendationByline`: remove the nested `<Link>`; keep the LinkedIn icon as decoration
    (`aria-hidden`, no wrapper) — the whole card is now the link. Remove unused `Link` import.
  - Give the CardActionArea an accessible name, e.g. `aria-label={"Recommendation from " +
recommendation.authorInitials + " on LinkedIn"}` (whole quote as link text is noisy).
  - Tests: both components have co-located tests — update interaction assertions
    (`window.open` spy → anchor href assertions).
- **Commit**: `fix: make recommendation cards keyboard and screen-reader accessible`

## 3. Add a 404 page

- **Problem**: `src/App.tsx:68-71` has routes `/`, `/skills`, `/articles` only — no `path="*"`;
  unknown URLs render the NavBar over a blank page.
- **Approach**:
  - New view `src/views/notFound/` (`NotFound.tsx`, `NotFound.test.tsx`, `index.ts`).
    Content: `PageContainer` + centred `Stack` (copy the ErrorBoundary fallback layout shape,
    `src/App.tsx:30-56`): icon, `Typography` "This page doesn't exist.", `Button
component={RouterLink} to="/"` "Go to home". Include `<title>` if item 5 already landed.
  - `App.tsx`: `<Route path="*" element={<NotFound />} />` as a sibling of the `/articles`
    route (outside the ErrorBoundary/data-provider group — it needs no career data).
- **Commit**: `feat: add a 404 page for unknown routes`

## 4. Contact links wrap on narrow screens

- **Problem**: `src/views/resume/contactDetails/ContactDetails.tsx:12` — `Stack direction="row"
spacing={2}` holding email + LinkedIn + GitHub + Medium; no wrap → overflow at ~375px.
- **Approach**: `<Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap',
justifyContent: 'center', mt: 0.5 }}>` (`useFlexGap` so `spacing` becomes real `gap` and
  applies between rows too).
- **Commit**: `fix: wrap contact links on narrow screens`

## 5. Favicon, meta description, per-route titles

- **Problem**: no `public/` directory, no favicon link in `index.html`, static tab title
  "Mariandi Stylianou" on all routes, no meta description.
- **Approach**:
  - Create `public/favicon.svg`: simple SVG monogram — rounded-square, solid mid-purple
    background (site's default theme is purple), white bold "MS" (font-family sans-serif via
    `<text>` or a path). Add to `index.html`:
    `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />`.
  - `index.html`: add `<meta name="description" content="Mariandi Stylianou — software
engineer. Interactive resume, skills, and articles." />`.
  - Per-route titles via React 19 native document metadata (a `<title>` rendered anywhere is
    hoisted to head — no library): in `Resume.tsx` return `<title>Mariandi Stylianou —
Resume</title>`, `Skills.tsx` → `Skills — Mariandi Stylianou`, `Articles.tsx` → `Articles
— Mariandi Stylianou`, NotFound → `Page not found — Mariandi Stylianou`.
  - Tests: jsdom + React 19 hoists titles; add/adjust assertions only if existing view tests
    snapshot the tree.
- **Commit**: `feat: add favicon, meta description, and per-route page titles`

## 6. Reset scroll on page navigation

- **Problem**: `src/App.tsx:23` uses plain `BrowserRouter` (component API — the data-router
  `<ScrollRestoration>` is unavailable). Navigating Resume → Skills keeps the scroll offset.
- **Approach**:
  - New `src/components/scrollToTop/` (`ScrollToTop.tsx`, test, `index.ts`):
    `const { pathname } = useLocation();` + `useEffect(() => { window.scrollTo(0, 0); },
[pathname]);` return `null`.
  - **Key on `pathname` only** — `?track=` tab switches and skills filter/search params update
    the search string and must NOT scroll.
  - Mount `<ScrollToTop />` just inside `<BrowserRouter>` in `App.tsx` (above `<NavBar />`).
  - Note: the `?skill=`/`?recommendation=` deep links scroll via `scrollIntoView` in
    `TimelineEventCard.tsx:97-107` after data resolves (post-Suspense), so it wins over the
    on-mount scroll-to-top; sanity-check this during user verification.
- **Commit**: `fix: reset scroll position when navigating between pages`

## 7. Label the track selector on /skills

- **Problem**: `src/views/skills/trackFilter/TrackFilter.tsx:12-18` — bare `Select` shows only
  the value ("General"); `aria-label="Track"` helps SRs but sighted users get no cue.
- **Approach**: add `renderValue` that prefixes the label:
  `renderValue={(id) => { const track = tracks.find((candidate) => candidate.id === id); return
\`Track: ${track?.label ?? id}\`; }}`— keeps the compact 36px toolbar styling (no floating
InputLabel). Keep`aria-label`.
- **Commit**: `fix: label the track selector on the skills page`

## 8. Bar-chart tooltip on tap (touch devices)

- **Problem**: `src/views/skills/skillsViews/skillsGraphView/skillsBarChart/SkillsBarChart.tsx:193-198`
  — tooltip (contains links) opens only via `onMouseEnter` on `<Bar>`; unreachable on touch.
  Screen readers have the hidden table (`:266-285`); keyboard users have the table view.
- **Approach** (scoped to touch, not full keyboard nav):
  - Add `onClick` to `<Bar>` with the same `(…, index, event)` signature: if
    `hoverIndex === index` close (set both states null), else `cancelClose()` +
    `setHoverIndex(index)` + `setAnchorPosition({ x: event.clientX, y: event.clientY })`.
  - Wrap the Popper's content `Box` in `ClickAwayListener` (`@mui/material/ClickAwayListener`)
    with `onClickAway` closing immediately (reuse a `close` callback; `scheduleClose` grace is
    for hover only). Guard: clicking another bar both fires ClickAway and onClick — onClick
    runs after and re-opens, acceptable.
- **Commit**: `fix: open the skills bar chart tooltip on tap`

## 9. Tooltips on the view-mode toggles

- **Problem**: `src/views/skills/Skills.tsx:206-214` — icon-only `ToggleButton`s (bar/radar/
  table) have `aria-label`s but no hover tooltip for sighted users.
- **Approach**: wrap each `ToggleButton` in `<Tooltip title="Graph view">` etc. (ToggleButton
  forwards refs, works as Tooltip child; keep them direct children of `ToggleButtonGroup` —
  MUI accepts Tooltip-wrapped toggles since the group matches on `value`; verify the selected
  styling still applies, otherwise pass `value` through explicitly).
- **Commit**: `fix: add tooltips to the skills view toggles`

## 10. Clarify the Patterns checkbox

- **Problem**: `src/views/skills/Skills.tsx:183-196` — checkbox labelled "Patterns" toggles
  colour-blind-friendly texture fills, but nothing says so.
- **Approach**: change `label` to `"Texture fills"` and wrap the `FormControlLabel` in
  `<Tooltip title="Distinguish categories by texture as well as colour">`. Keep default off
  (visual default unchanged) — flipping the default is a separate product call.
- **Commit**: `fix: clarify the texture fills toggle on the skills graph`

## 11. Feedback when a skills search matches nothing

- **Problem**: `src/views/skills/Skills.tsx:122-134` — `searchHint` only covers matches hidden
  by filters; a search with zero matches anywhere just fades all bars (graph) with no message.
- **Approach**: extend the `hiddenMatchCount` memo to also return `totalMatches` (it already
  computes it); rename to something like `searchMatchCounts`. Then:
  `const searchHint = totalMatches === 0 && searchTerm.trim() !== '' ? 'No skills match your
search' : hiddenMatchCount > 0 ? …existing… : undefined` — expressed with if/returns in a
  small helper, not a nested ternary (house rule). The hint renders in the search bar's
  `helperText` which is already `aria-live="polite"` (`skillSearchBar/SkillSearchBar.tsx:38`).
- **Commit**: `fix: show a hint when a skills search has no matches`

## 12. Announce copy-link result

- **Problem**: `src/views/skills/copyLinkButton/CopyLinkButton.tsx:44-50` — copied/failed only
  swaps icon + tooltip/aria-label; SRs get no announcement, and sighted users only get the
  icon swap.
- **Approach**:
  - Replace the icon-only `IconButton` with a small `Button` showing a **visible label**:
    `startIcon` = current status icon, label = `LABEL_BY_STATUS[state.status]` ("Copy filtered
    link" / "Link copied" / "Couldn't copy link"). Match the 36px-height/divider-border toolbar
    styling used by `SkillFilterBar.tsx:95` (`variant="outlined" color="inherit" sx={{ height:
36, borderColor: 'divider' }}`). Tooltip becomes redundant — drop it.
  - Add an `aria-live="polite"` region so the status change is announced: `<Box
component="span" sx={visuallyHidden} aria-live="polite">{state.status === 'idle' ? '' :
LABEL_BY_STATUS[state.status]}</Box>` (`visuallyHidden` from `@mui/utils`, same pattern as
    `SkillsBarChart.tsx:267`); wrap button+span in a fragment.
- **Commit**: `fix: show and announce the copy link result`

## 13. Decorative article images

- **Problem**: `src/views/articles/articleTile/ArticleTile.tsx:48` — `alt={article.title}`
  duplicates the adjacent visible title for SRs.
- **Approach**: `alt=""` on the `CardMedia`.
- **Commit**: `fix: mark article tile images as decorative`

## 14. Error fallback: keep the joke, add the action

- **Problem**: `src/App.tsx:47` — "Whoops — my career history just rage-quit. Try again?" is
  on-brand (keep it) but doesn't tell the user what to do next.
- **Approach**: keep the joke line, add an actionable second line beneath it (own
  `Typography variant="body2" color="text.secondary"`): `"Hit refresh to relaunch it — that
usually does the trick."` Keep the Refresh button as is.
- **Commit**: `fix: add a clear action to the error fallback message`

## Verification (user-run, per item)

After each item: `yarn test`, `yarn lint`, typecheck, then eyeball the affected surface in the
dev server (specifics per item above — e.g. item 4 at ~375px width; item 6 by scrolling then
switching pages _and_ checking `?track=` tab clicks don't jump; item 1 across reloads and in a
dark-system-theme browser profile).
