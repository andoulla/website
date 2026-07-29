# Design Audit — Mariandi Stylianou Portfolio Site

Scope: MUI visual standards, accessibility, information hierarchy. This started as a "recruiters scanning fast" brief, but really the audience is anyone in tech who lands on the page — engineers, peers, hiring managers with five minutes or fifty. So the fixes below are about making the page clearer and easier to read for everyone, not scan-speed hacks.
Priority = Value vs Effort. 🟢 Quick win (do first) · 🟡 Worth it (medium effort) · 🔴 Bigger lift (plan for it)

---

## 1. Information Hierarchy & Structure

### 1.1 ✅ Dates/company buried in a run-on subheader

`Senior Lead Engineer · Remote · Jan 2021 – Present` is one grey sentence. If you're trying to quickly check how recent or how long a role was, you have to read the whole line every time.
**Fix:** Split into two visual tiers — role title bold/dark, then a lighter meta row. Bump the date range up visually (bold, or its own spot) so it's readable at a glance without reading company/location first.

**Status:** ✅ Done — restructured headers into two tiers (company/date bold on top, role/location lighter below).

```
┌─────────────────────────────────────────────┐
│ ● Atom Learning                 Jan 2021–Now │  ← bold company, bold dates, same row
│   Senior Lead Engineer · Remote              │  ← lighter meta line
└─────────────────────────────────────────────┘
```

### 1.2 ✅ Inconsistent, unlabelled collapse pattern

Three different disclosure triggers exist on one card — "Show/Hide details" (whole card), "Show/Hide key skills" (one section), "More/Less" (each testimonial) — all styled identically (same chevron, same purple text button). Nothing tells the user which one collapses how much content.
**Fix:** Differentiate by placement/weight (e.g., card-level toggle as a bordered button, section-level as plain text link). Leave Key Skills collapsed by default — the list is long enough that expanding it by default would push everything else down the page.

**Status:** ✅ Done — card-level toggle uses outlined variant, section-level and recommendation toggles use text variant. Key Skills now collapsed by default.

### 1.3 🟡 "Track" tabs (General / Lead / Senior Engineer) aren't explained

Switching tabs reshapes the entire resume content, but nothing hints at that — it reads like a normal, low-stakes filter tab.
**Fix:** Add a one-line caption under the tabs, something like _"Same experience, different angle — pick whichever role you're looking at."_

### 1.4 🟡 "View this role's skills on the graph" — unclear destination

A plain text link with no icon or description of what "the graph" is (external tool? in-page visualization?).
**Fix:** Add an MUI `InsightsOutlined` icon next to the text (the same icon used for "Skills" in the AppBar nav, per 2.7 — reusing it here ties the link visually to that graph/skills concept) and/or a tooltip; if it navigates away, mark it clearly (`target="_blank"`).

---

## 2. Visual & MUI Design Standards

### 2.1 🟢 Skill-category colors have no legend on this page

Skill text-links are tinted per category (green / blue / purple / orange / pink) with no key explaining what the colors mean here — reads as decorative noise rather than encoded information. The Skills page apparently already defines this category-color legend; it just isn't present or referenced on the homepage, so the encoding is invisible to anyone landing here first.
**Fix:** Keep the current text-link style (no chips — tried before and got busy) but surface the same legend used on the Skills page, placed once near the top of the Key Skills section (e.g. a small inline key: `● Leadership & Delivery  ● Engineering Practices  ●…`) so the colors carry meaning instead of just looking varied.

For the palette itself, pull from the green theme rather than inventing new hues — it already has a vetted, contrast-checked scale:

- Primary green family: `#27500A` (dark) → `#3B6D11` (main) → `#9DC46B` (light)
- Secondary neutral family: `#2B2B28` (dark) → `#6E6E68` (main) → `#B5B5AE` (light)

Map categories to steps along these two families (e.g. dark green / main green / light green / dark neutral / main neutral / light neutral) instead of unrelated rainbow hues — stays on-brand and keeps the palette small. Since the theme supports dark mode too (with its own flipped light-toned-accent scale), define the legend colors as theme-aware tokens, not fixed hex values, so category colors keep their ≥4.5:1 contrast in both modes rather than just checking light mode and hoping dark mode holds up.

### 2.2 🟡 Line length unconstrained inside cards

Body copy (bullets, tech stack, testimonials) stretches edge-to-edge inside the `Container maxWidth="lg"`, well past ~75–90 characters per line on a wide desktop viewport — long lines are just tiring to read, full stop.
**Fix:** Cap text-bearing columns at `max-width: 720–800px` inside the card content, independent of the outer container width.

### 2.3 🟡 Compact-mode switch floats outside the content grid

The "Compact" switch sits at the top-right of the viewport, not aligned to the `Container`'s padding/margins used everywhere else — breaks the implicit grid.
**Fix:** Move it inside the same `Container`, right-aligned to match card edges, or place it in the AppBar.

### 2.4 🟡 Divider overuse inside cards

Every card stacks 3–4 full-width `<hr>` dividers (Responsibilities / Tech Stack / Key Skills / Recommendations). Repeated across ~7 timeline entries, this becomes a busy striping pattern.
**Fix:** Replace some dividers with whitespace (`Stack spacing`) and reserve `Divider` for the one or two breaks that matter most (e.g., before Recommendations).

### 2.5 🟢 Empty left slot in the AppBar

The nav's leftmost `Box` is empty (no logo/wordmark/initials), pushing "Home / Skills / Articles" links off-center and leaving a dead zone.
**Fix:** Add a small monogram or name mark, or center the nav links properly if no mark is wanted.

### 2.6 🟡 Timeline icon style is inconsistent (icon vs. photo logo)

Job/internship entries use a flat MUI SvgIcon in a solid circle; education entries swap in a rasterized company/university logo image of a different visual weight (drop shadow-less JPEG thumbnails) — breaks the otherwise consistent dot system.
**Fix:** Mask all education logos into the same flat circular treatment (consistent crop/size, circular clip) as the icon dots, so every timeline marker reads as one system.

### 2.7 🟢 Nav links have no icons

"Home", "Skills", "Articles" in the AppBar are plain text with nothing to help quick recognition or add visual interest to an otherwise bare nav bar.
**Fix:** Add a small leading MUI icon per link: `HomeOutlined` for Home, `InsightsOutlined` for Skills (a graph/trend glyph fits the "skills graph" concept used elsewhere on the page — reuse this exact icon in 1.4 for consistency), `ArticleOutlined` for Articles.

---

## 3. Accessibility

### 3.1 🟢 Skill "tags" are `<button>` elements styled as underlined links

Every skill (`Engineering Leadership`, `React`, etc.) is a `MuiLink-button` — a button dressed as a hyperlink. Screen reader users will hear "button" for content that visually promises link behavior (and vice versa for the actual `<a>` tags elsewhere on the page), which is a semantic mismatch under WCAG 4.1.2 (Name, Role, Value expectations).
**Fix:** If they're filterable/clickable actions, keep them as buttons but style them clearly as chips/pills, not as text links, so appearance matches behavior.

### 3.2 🟡 Grey meta text likely fails contrast at small size

Subheaders/dates and caption-level skill text use a light grey (`text.secondary`) at `body2`/`caption` sizes — common MUI default, but worth verifying against WCAG AA (4.5:1 for normal text, 3:1 for large) since this is exactly the text people rely on for dates/titles. Bonus: the green theme's own `contrastThreshold: 4.5` and per-mode `text.secondary` tokens are a good reference for what "passing" looks like — worth checking this theme's secondary grey against the same bar.
**Fix:** Audit actual hex values against background; if below 4.5:1, deepen `text.secondary` in the theme.

### 3.3 🟡 Confirm focus states on custom-styled buttons

MUI's default focus ring can get visually lost against flat `elevation0` cards and text-styled buttons. Given how many interactive elements are link-styled text (collapses, skill tags, "More"), keyboard users need a clearly visible focus indicator throughout.
**Fix:** Verify (and if needed, strengthen) `:focus-visible` outline contrast against the light background across all button/link variants.

### 3.4 🟡 Ask-about-experience search has no visible label

The `Autocomplete` input relies on placeholder text ("Ask about my experience…") plus an `aria-label` — good that the label exists, but placeholder-only visible text disappears once a user starts typing, and its purpose (AI search? filter?) isn't otherwise explained.
**Fix:** Add a small persistent caption near the field, or a visible (not just aria) label.

---

## 4. Recommendations Section

### 4.1 🟡 Truncation cuts mid-sentence and cards end up uneven heights

The 2-column quote grid truncates at a fixed character count regardless of where a sentence ends (e.g. "...helping people reach their full po..."), and because quotes vary in length, some cards end up much taller than their neighbor — the grid looks unbalanced.
**Fix:** Truncate on a sentence or clause boundary instead of a raw character count, and let the grid use equal-height rows (`Grid` with `alignItems: stretch` / matching card min-height) so the "More" toggle doesn't leave lopsided gaps.

### 4.2 🟡 Quote and attribution have similar visual weight

The quote (body2) and the reviewer's attribution line (caption, same purple links) sit close in size and color — nothing pulls your eye to the source, which matters for a testimonial's credibility. Names are already abbreviated to initials (A.V., L.S...) for privacy, so making the _name_ heavier won't help much — the credibility signal here is really the **job title** (e.g. "Staff Software Engineer") and the verified-LinkedIn badge next to it.
**Fix:** Give the attribution row more visual presence overall (slightly larger avatar, a bit more space between it and the quote above), but put the emphasis on the job title rather than the initials — that's the part that actually tells a reader who's vouching and why it carries weight.

### 4.3 🟢 Two-column recommendation grid doesn't stack on mobile

On the mobile screenshots the "Recommendations (4)" quotes are still laid out two-per-row — at phone width that squeezes each quote into a very narrow column, making the already-long testimonials harder to read than on desktop.
**Fix:** Stack the grid to a single column below the `sm` breakpoint so each quote gets the full content width.

---

## 5. Key Skills Section

### 5.1 🟡 Category label reads as just another skill

Both the category label ("Leadership & Delivery:") and the individual skills after it are clickable, and both are styled as the same purple text-button — so there's no visual cue that one is a group heading and the rest are its members. The eye has nothing to anchor on when scanning categories.
**Fix:** Keep both interactive, but give the category label a distinct (bolder/larger, or differently-colored) treatment from the skills it groups — the click affordance stays on both, only the visual hierarchy changes.

### 5.2 🟡 Collapsed state shows nothing at all

When "Key Skills" is collapsed (its default), there's zero preview of what's inside — just a button. Given skills are genuinely useful content, a fully blank collapsed state undersells them.
**Fix:** Show a short taster even when collapsed — e.g. just the category labels, or the top 4–5 skill words — so people get a sense of what expanding will reveal instead of a leap of faith.

### 5.3 🟡 Skill links are too tight for touch on mobile

Individual skills are inline text separated by commas, with no padding — fine as mouse targets, but each word is a tap target well under the 44px touch guideline, and on mobile adjacent skills sit close enough together (e.g. "Clean Code, Refactoring, Coding Standards...") that mis-taps are likely.
**Fix:** Add a bit of padding/line-height around each skill link on touch devices so tap targets clear a comfortable minimum, even without changing the visual comma-separated style.

### 5.4 🟡 Running comma-list is dense to read on a narrow column

On mobile, each category's skills wrap as one dense paragraph of comma-separated links — at phone width that means many short line-wraps with little visual separation between items, harder to scan than the same list on a wide desktop line.
**Fix:** Stay with plain text-links (no chips), but improve the wrap itself: put every skill on its own line on mobile instead of running them together with commas (drop the comma separators there, one skill per line, still grouped under its category label). That alone gives each item breathing room and a clear scan path without changing the visual language or introducing pill/chip shapes.

---

## Suggested sequencing

1. **This week (🟢):** split date/company hierarchy; surface the skills legend with green-theme colors; fix skill-tag button/link semantics; fill AppBar logo slot; mask education logos to match the icon dots; add nav link icons.
2. **Next pass (🟡):** cap line-length; rebalance dividers/whitespace; add track-tab explainer caption; verify contrast + focus states; add visible label for the experience search; fix recommendation truncation/card heights and attribution weight; give skill category labels their own style and a collapsed-state taster; mobile-specific skills list and touch-target fixes; stack recommendations grid on mobile.
3. **When you have more time (🔴):** none currently — the remaining items above cover the full backlog.

---

## Claude Code Prompts

Copy-paste one at a time into Claude Code. Model suggestion reflects how much judgment/context-holding the change needs — simple, localized CSS/copy edits go to a cheaper/faster model; anything touching accessibility semantics, cross-component consistency, or multi-mode theming goes to a stronger model.

### 1.1 — Split date/company hierarchy — **Model: Sonnet**

```
In the work-experience timeline cards, the card header currently renders the role title, location and date range as one run-on subheader line (e.g. "Senior Lead Engineer · Remote · Jan 2021 – Present"). Restructure it into two visual tiers: company name and date range on a bold top row, role title + location on a lighter line below. Keep using existing MUI Typography/CardHeader components and theme tokens — no new colors. Apply consistently across all timeline entries (jobs, internships, education).
```

### 1.2 — Differentiate the three collapse triggers — **Model: Sonnet**

```
This resume page has three different "show/hide" disclosure triggers reusing the identical MuiButton text-link + chevron style: the whole-card "Show/Hide details" toggle, the "Show/Hide key skills" section toggle, and each recommendation's "More/Less" toggle. Give each level a distinct visual treatment so users can tell what scope each one controls — e.g. make the card-level toggle a bordered/outlined button, keep section-level as a plain text link, and keep testimonial "More/Less" as the smallest/lightest variant. Don't change the underlying collapse behavior, just the button styling per level. Leave the Key Skills section collapsed by default.
```

### 1.3 — Add explainer caption under track tabs — **Model: Haiku**

```
Under the "General / Lead / Engineering Manager / Senior Engineer" tabs at the top of the resume page, add a small one-line caption explaining that switching tabs changes the displayed content per role, e.g. "Same experience, different angle — pick whichever role you're looking at." Use the existing MUI Typography caption/body2 style already used for secondary text elsewhere on the page.
```

### 1.4 — Clarify "View this role's skills on the graph" link — **Model: Haiku**

```
Find the "View this role's skills on the graph" button/link in the Key Skills section. Add MUI's InsightsOutlined icon next to the text — use the same icon you're adding for "Skills" in the AppBar nav (see the nav-icons task) so the two visually reference the same concept. If it navigates to an external page, ensure it opens appropriately and is marked as external.
```

### 2.1 — Skill-category legend using the green theme palette — **Model: Opus**

```
The homepage's Key Skills section color-codes each category (Leadership & Delivery, Engineering Practices & Quality, Frontend Development, Architecture & Design, Backend Development, Tools & Development Workflow) but has no legend explaining the colors — the Skills page apparently already has this legend defined somewhere in the codebase; find it and reuse the same mapping/labels here instead of duplicating logic.

Re-derive the actual color values from the green theme (see theme file with createGreenTheme) instead of the current arbitrary hues — map categories to steps along the theme's primary green family (#27500A / #3B6D11 / #9DC46B) and secondary neutral family (#2B2B28 / #6E6E68 / #B5B5AE). Read colors from theme tokens (theme.palette.primary/secondary), not hardcoded hex, so both light and dark mode automatically stay correct — the theme already flips to light-toned accents with dark ink in dark mode. Verify every category color hits at least 4.5:1 contrast against the card background in both modes (the theme sets contrastThreshold: 4.5 for this reason). Add a small legend (colored dot + category label) near the top of the Key Skills section on the homepage.
```

### 2.2 — Cap line length inside cards — **Model: Haiku**

```
Inside the timeline cards on the resume homepage (Responsibilities bullets, Tech Stack paragraph, testimonial quotes), text currently stretches to the full card width, which can exceed ~90 characters per line on wide desktop viewports. Add a max-width of roughly 720–800px to the text-bearing content within each card (not the outer Container), keeping it centered or left-aligned to match the existing card padding.
```

### 2.3 — Align the Compact-mode switch to the content grid — **Model: Haiku**

```
The "Compact" mode switch at the top of the resume homepage currently sits outside the main Container's padding, misaligned with the card edges below it. Move it inside the same Container used for the rest of the page content, right-aligned so its edge matches the cards' right edge.
```

### 2.4 — Reduce divider overuse inside cards — **Model: Sonnet**

```
Each timeline card on the resume homepage stacks 3–4 full-width MUI Divider components between its sections (Responsibilities / Tech Stack / Key Skills / Recommendations). Replace most of these with spacing (MUI Stack spacing / sx margin) instead, keeping an actual Divider only before the Recommendations section where a stronger visual break is warranted. Apply consistently across all timeline cards.
```

### 2.5 — Fill the empty AppBar logo slot — **Model: Sonnet**

```
The site's AppBar has an empty Box on the far left (before the Home/Skills/Articles nav links), leaving a dead zone and pushing the nav off-center. Add a small monogram/wordmark placeholder there (e.g. initials "MS" in the AppBar's text color), sized and positioned to align with the nav links' vertical center. If a real logo asset gets added later this should be easy to swap in.
```

### 2.6 — Mask education logos to match icon dots — **Model: Sonnet**

```
On the resume timeline, job/internship entries use a flat MUI SvgIcon inside a solid colored circle for the timeline dot, but education entries instead show a rasterized university/company logo image with inconsistent crop and no circular mask. Update the education timeline dots to crop/mask the logo image into the same circular shape and size as the icon dots (object-fit: cover with border-radius: 50%, matching the dot's fixed dimensions), so all timeline markers read as one consistent system.
```

### 2.7 — Add icons to AppBar nav links — **Model: Haiku**

```
Add a small leading MUI icon to each AppBar nav link: HomeOutlined for "Home", InsightsOutlined for "Skills" (a graph/trend icon, since this same icon will also be used for the "view skills on the graph" link elsewhere on the page — keep them visually consistent), and ArticleOutlined for "Articles". Size icons to align with the existing text baseline and current nav typography weight/color.
```

### 3.1 — Fix skill-tag button/link semantic mismatch — **Model: Opus**

```
Every skill in the Key Skills section (e.g. "Engineering Leadership", "React") is implemented as a <button> styled with MUI's Link-underlineHover-button classes — visually identical to a hyperlink but semantically a button, which is a WCAG 4.1.2 role mismatch that will confuse screen reader users. Audit all skill tags and category labels on this page: if they trigger an action (filter, navigate, expand), keep them as <button> elements but restyle them clearly as buttons/pills rather than underlined text links, so appearance matches actual behavior. Do this without introducing chip/pill shapes if the team has already ruled those out for the desktop skill list — check for a documented style decision first, and if one exists, propose a button style that stays close to the existing typography-driven look (e.g. a subtle background or border on hover/focus) rather than a chip.
```

### 3.2 — Audit text contrast against theme tokens — **Model: Sonnet**

```
Audit the contrast ratio of all text.secondary and caption-level text (job subheaders, dates, skill category labels) against their backgrounds across both light and dark mode, using the green theme (createGreenTheme) as the source of truth. The theme sets palette.contrastThreshold to 4.5 and defines mode-specific text.secondary values — confirm those values actually produce ≥4.5:1 contrast against every background color they're used on (card surfaces, page background) in both modes, and report/fix any combination that fails.
```

### 3.3 — Verify and strengthen focus-visible states — **Model: Sonnet**

```
Audit keyboard focus indicators across every interactive text-styled element on the resume homepage (section collapse toggles, skill tags, "More/Less" testimonial toggles, track tabs, nav links). Confirm each has a clearly visible :focus-visible outline with sufficient contrast against the light background (and dark background in dark mode), using MUI's theme-level focus styling rather than one-off overrides. Fix any element where the default MUI focus ring is hard to see against a flat, elevation-0 card.
```

### 3.4 — Add a visible label to the experience search — **Model: Haiku**

```
The "Ask about my experience…" Autocomplete input on the resume homepage relies only on placeholder text and an aria-label, with no persistent visible label — once a user types, the field's purpose disappears from view. Add a small persistent caption or label above/beside the field (e.g. "Ask about my experience — AI search") so its purpose stays visible while typing.
```

### 4.1 — Fix testimonial truncation and card-height balance — **Model: Sonnet**

```
The Recommendations section truncates each quote at a fixed character count regardless of sentence boundaries, and because quote lengths vary, the two-column card grid ends up with uneven row heights. Change the truncation logic to cut at the nearest sentence or clause boundary instead of a raw character count, and update the grid layout so cards in the same row stretch to equal height (e.g. CSS Grid/Flexbox with align-items: stretch, or matching min-height), so the "More" toggle doesn't leave lopsided gaps between columns.
```

### 4.2 — Rebalance testimonial attribution emphasis — **Model: Sonnet**

```
In the Recommendations section, each testimonial's attribution line shows initials (e.g. "A.V."), job title, and date at the same small caption weight as the reviewer's name — since names are already abbreviated to initials for privacy, emphasizing the name doesn't add credibility. Restyle the attribution row so the job title carries more visual weight (e.g. slightly larger/bolder text) and the verified-LinkedIn badge icon next to it is clearly visible, while giving the whole attribution row a bit more vertical separation from the quote text above it.
```

### 4.3 — Stack the recommendation grid on mobile — **Model: Haiku**

```
The Recommendations section renders testimonials in a two-column grid at all viewport widths, including mobile, which squeezes each quote into a very narrow column on phones. Add a responsive breakpoint (MUI Grid/Box with sx breakpoints) so the grid stacks to a single column below the `sm` breakpoint, giving each quote the full content width on mobile.
```

### 5.1 — Give category labels distinct visual weight — **Model: Haiku**

```
In the Key Skills section, category labels (e.g. "Leadership & Delivery:") are styled identically to the individual skill links that follow them, making it hard to visually distinguish group headings from group members. Both remain clickable — keep that — but give the category label a bolder/larger or differently-colored treatment than the skills under it, so the grouping is visually obvious before reading the words.
```

### 5.2 — Add a taster preview to the collapsed Key Skills state — **Model: Sonnet**

```
When the Key Skills section is collapsed (its default state), nothing about its content is visible except the "Show key skills" toggle button. Add a brief taster shown even while collapsed — either the category labels alone, or the top 4–5 most prominent skill words — so users get a sense of what's inside before deciding to expand it.
```

### 5.3 + 5.4 — Improve mobile readability of the skill list — **Model: Sonnet**

```
On mobile viewports, the Key Skills section renders each category's skills as one dense, comma-separated inline paragraph, which both hurts readability (many short line-wraps with no visual separation) and creates touch targets under the 44px accessibility guideline (adjacent short skill words sit very close together). Do not switch to a chip/pill component — the team has ruled that out. Instead, on mobile breakpoints only: render each skill on its own line (drop the comma separators there) under its category label, and add enough padding/line-height around each skill link so its tap target comfortably clears 44px. Leave the desktop text-link/comma layout unchanged above the `sm` breakpoint.
```
