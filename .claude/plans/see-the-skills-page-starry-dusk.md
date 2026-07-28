# Skills page — filter bar + view heading redesign

## Context

**Problem:** Current filter bar is a flat row of 5–6 controls that looks busy and wraps badly on mobile. The view caption uses `h6` directly under `h1 Skills` (variant="h3"), skipping visual hierarchy levels.

**Solution:**

- Slim top bar (Share + view toggles only) at the top right
- h2 view name in a heading row alongside compare controls, Search, and a collapsible Filters trigger
- All data filters (Track, Category, Year) in an expandable panel below the heading
- Caption + stat bar below that
- Labels outside controls (`Track [Lead ▼]` not `[Track: Lead ▼]`)
- SkillFilterBar button restyled to visually match TrackFilter

No new component files. Panel is composed inline in `SkillsContent`.

**Revalidated against HEAD `37978ea`** (viz-c merged). All file contents and line numbers verified.

**Models:** Agent A → `sonnet`. Agent B → `haiku`.

---

## KISS / DRY / SOLID notes

- **KISS:** Collapse + trigger stay inline in `SkillsContent`. Extracting a component adds a file with zero reuse benefit.
- **DRY (accepted):** `height: 36, borderColor: 'divider', typography: 'button', fontSize: '0.8125rem'` is repeated across `TrackFilter`, `SkillFilterBar`, and the new trigger button. The existing comment in `TrackFilter.tsx` already documents this alignment intent. No shared token.
- **Context already resolves track:** `track` (not just `trackId`) is destructured from `useTrackContext()` at line 66 and `track.label` is already used in the component — no need to call `tracks.find` again.

---

## 1 · Caption text changes — `Skills.constants.tsx`

Change `caption` values only (4 lines):

| key        | old                                                  | new                                               |
| ---------- | ---------------------------------------------------- | ------------------------------------------------- |
| `barchart` | `"How many years I've spent on each skill"`          | `"Years spent on each skill"`                     |
| `radar`    | `"Where my experience is concentrated across areas"` | `"Where experience is concentrated across areas"` |
| `table`    | unchanged                                            | unchanged                                         |
| `treemap`  | `"Where I've spent the most time, by skill area"`    | `"Time spent by skill area"`                      |
| `growth`   | `"How my skill set has grown across my career"`      | `"How skills have grown over time"`               |

---

## 2 · TrackFilter restyle — `src/views/skills/trackFilter/TrackFilter.tsx`

Remove `"Track: "` prefix from `renderTrackValue`. The label now lives outside the control in `Skills.tsx`.

Line 15 only:

```tsx
// BEFORE:
return `Track: ${track?.label ?? id}`;

// AFTER:
return track?.label ?? id;
```

No other changes to this file.

---

## 3 · SkillFilterBar button restyle — `src/views/skills/skillFilterBar/SkillFilterBar.tsx`

**3a. Swap icon import (top of file):**

```tsx
// Remove:
import FilterListIcon from '@mui/icons-material/FilterList';
// Add:
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
```

**3b. Update label logic — lines 88–89:**

```tsx
// BEFORE:
const activeCount = selectedCategories.length + selectedSubCategories.length;
const label = activeCount === 0 ? 'All' : `Filters (${activeCount})`;

// AFTER:
const activeCount = selectedCategories.length + selectedSubCategories.length;
const label = activeCount === 0 ? 'All' : `${activeCount} selected`;
```

**3c. Replace the `<Button>` element — lines 93–107:**

```tsx
// BEFORE:
<Button
  variant="outlined"
  size="small"
  color="inherit"
  sx={{ height: 36, borderColor: 'divider' }}
  startIcon={<FilterListIcon fontSize="small" />}
  onClick={(e) => setAnchorEl(e.currentTarget)}
  aria-haspopup="true"
  aria-expanded={open}
  aria-controls={open ? menuId : undefined}
  aria-label={`Filter skills by category and subcategory, currently: ${label}`}
>
  {label}
</Button>

// AFTER:
<Button
  variant="outlined"
  size="small"
  color="inherit"
  endIcon={<KeyboardArrowDownIcon fontSize="small" />}
  onClick={(e) => setAnchorEl(e.currentTarget)}
  aria-haspopup="menu"
  aria-expanded={open}
  aria-controls={open ? menuId : undefined}
  aria-label={`Filter skills by category, currently: ${label}`}
  sx={{
    height: 36,
    borderColor: 'divider',
    typography: 'button',
    fontSize: '0.8125rem',
  }}
>
  {label}
</Button>
```

---

## 4 · Skills.tsx restructure — `src/views/skills/Skills.tsx`

### 4a. New imports — add alongside existing MUI icon imports (after line 12)

```tsx
import Collapse from '@mui/material/Collapse';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
```

`Button` (line 2), `tracks` (line 17), and `trackId` (line 66 already destructured) are already present. Do NOT add them again.

### 4b. After line 178 (`const [showPatterns, setShowPatterns] = useState(false);`) — add state and computed label

```tsx
const [filterPanelOpen, setFilterPanelOpen] = useState(false);

const filterCount =
  selectedCategories.length + selectedSubCategories.length + (cutoffYear < maxYear ? 1 : 0);
const filterButtonLabel =
  filterCount > 0
    ? `${track.label} · ${filterCount} filter${filterCount === 1 ? '' : 's'}`
    : track.label;
```

`track` is already destructured from `useTrackContext()` at line 66 — no separate `trackLabel` variable needed.

### 4c. Replace lines 255–338 (toolbar Stack + caption Stack, stop before `<SkillsStatBar>` on line 340)

The `<SkillsCareerContextProvider>` block (lines 341+) is unchanged.

Key things to preserve from the deleted block:

- `effectiveViewMode` in `ToggleButtonGroup value` prop (not `viewMode`)
- The `onChange` handler that calls `handleDeactivateCompare()` when `isCompareMode`
- The `isCompareMode` conditional in the caption text
- The `!isCompareMode &&` guard on the Texture fills checkbox
- `{renderCompareControls()}` moves from caption row → heading row

Replace with:

```tsx
{
  /* Slim top bar: share + view toggles */
}
<Stack direction="row" sx={{ justifyContent: 'flex-end', mb: 1.5, alignItems: 'center', gap: 1.5 }}>
  <CopyLinkButton />
  <ToggleButtonGroup
    value={effectiveViewMode}
    exclusive
    onChange={(_e, next: ViewMode | null) => {
      if (next === null) return;

      if (isCompareMode) handleDeactivateCompare();

      setViewMode(next);
    }}
    size="small"
    aria-label="View mode"
    sx={{
      '& .MuiToggleButton-root': { px: { xs: 0.75, sm: 1.25 } },
      '& .MuiSvgIcon-root': { fontSize: { xs: '1.1rem', sm: '1.25rem' } },
    }}
  >
    {VIEW_MODES.map((mode) => (
      <Tooltip key={mode} title={VIEW_OPTIONS[mode].label}>
        <ToggleButton value={mode} aria-label={VIEW_OPTIONS[mode].label}>
          {VIEW_OPTIONS[mode].icon}
        </ToggleButton>
      </Tooltip>
    ))}
  </ToggleButtonGroup>
</Stack>;

{
  /* Heading row: view name (h2) + compare controls + search + filter trigger */
}
<Stack direction="row" sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1.5, mb: 0.5 }}>
  <Typography variant="h5" component="h2" sx={{ fontWeight: 600, letterSpacing: '-0.02em' }}>
    {VIEW_OPTIONS[effectiveViewMode].label}
  </Typography>
  {renderCompareControls()}
  <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, ml: 'auto' }}>
    <SkillSearchBar value={searchTerm} onChange={setSearchTerm} hint={searchHint} />
    <Button
      variant="outlined"
      size="small"
      color="inherit"
      endIcon={
        <KeyboardArrowDownIcon
          sx={{
            transform: filterPanelOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s',
          }}
        />
      }
      onClick={() => setFilterPanelOpen((prev) => !prev)}
      aria-expanded={filterPanelOpen}
      aria-controls="skill-filter-panel"
      sx={{ height: 36, borderColor: 'divider', typography: 'button', fontSize: '0.8125rem' }}
    >
      {filterButtonLabel}
    </Button>
  </Stack>
</Stack>;

{
  /* Expandable filter panel — unmountOnExit prevents hidden controls from receiving keyboard focus */
}
<Collapse in={filterPanelOpen} unmountOnExit>
  <Stack
    id="skill-filter-panel"
    role="group"
    aria-label="Skill filters"
    direction="row"
    sx={{
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 2,
      py: 1.5,
      mb: 1,
      borderBottom: 1,
      borderColor: 'divider',
    }}
  >
    <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Track
      </Typography>
      <TrackFilter />
    </Stack>
    <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Category
      </Typography>
      <SkillFilterBar
        categories={categories}
        subCategoriesByCategory={subCategoriesByCategory}
        selectedCategories={selectedCategories}
        selectedSubCategories={selectedSubCategories}
        onCategoriesChange={setSelectedCategories}
        onSubCategoriesChange={setSelectedSubCategories}
      />
    </Stack>
    {minYear < maxYear && (
      <TimeMachineSlider
        year={cutoffYear}
        minYear={minYear}
        maxYear={maxYear}
        onCommit={setCutoffYear}
        sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: 220 }, minWidth: { md: 200 } }}
      />
    )}
  </Stack>
</Collapse>;

{
  /* Caption + optional Texture fills */
}
<Stack direction="row" sx={{ alignItems: 'center', mb: 0.5, minHeight: 38 }}>
  <Typography variant="body1" color="text.secondary" sx={{ flexGrow: 1 }}>
    {isCompareMode
      ? 'Skills side by side across two tracks'
      : VIEW_OPTIONS[effectiveViewMode].caption}
  </Typography>
  {!isCompareMode && (viewMode === 'barchart' || viewMode === 'treemap') && (
    // describeChild — keep "Texture fills" as the accessible name
    <Tooltip title="Distinguish categories by texture as well as colour" describeChild>
      <FormControlLabel
        control={
          <Checkbox
            checked={showPatterns}
            onChange={(_e, checked) => {
              setShowPatterns(checked);
            }}
            size="small"
          />
        }
        label="Texture fills"
      />
    </Tooltip>
  )}
</Stack>;
```

Line 340 (`<SkillsStatBar filteredSkills={filteredSkills} />`) and everything after is unchanged.

---

## Edge cases

1. **`minYear === maxYear`**: `TimeMachineSlider` is guarded by `{minYear < maxYear && ...}` — same condition preserved inside panel. `filterCount` term `(cutoffYear < maxYear ? 1 : 0)` correctly evaluates to 0 when slider is absent.

2. **`aria-controls` must match `id`**: Trigger has `aria-controls="skill-filter-panel"`. Panel `Stack` must have `id="skill-filter-panel"`. The `Collapse` wrapper gets no id.

3. **Compare mode + filter button label**: In compare mode, `trackId` still reflects the primary track. The label correctly shows the primary track name. No special compare-mode handling needed for the label.

4. **`renderCompareControls()` in heading row with `flexWrap`**: Returns `null` in most view states — no layout cost. In compare mode it returns a `Stack` that wraps via the parent row's `flexWrap: 'wrap'`. The `ml: 'auto'` on the Search+Filters inner Stack pushes them right on wide screens; on mobile everything wraps anyway.

---

## 5 · Test updates

### 5a. `SkillFilterBar.test.tsx` — Agent B owns this

Two label values changed. Find-and-replace all occurrences across the file:

| old string                                                            | new string                                           |
| --------------------------------------------------------------------- | ---------------------------------------------------- |
| `'Filter skills by category and subcategory, currently: All'`         | `'Filter skills by category, currently: All'`        |
| `'Filter skills by category and subcategory, currently: Filters (1)'` | `'Filter skills by category, currently: 1 selected'` |
| `'Filter skills by category and subcategory, currently: Filters (2)'` | `'Filter skills by category, currently: 2 selected'` |

There are 11 occurrences total. All are in `getByRole('button', { name: ... })` calls — no other changes to this file.

### 5b. `TrackFilter.test.tsx` — Agent B owns this

Line 33: the combobox no longer includes "Track: " in its text content.

```tsx
// BEFORE:
expect(screen.getByRole('combobox', { name: 'Track' })).toHaveTextContent('Track: Senior Engineer');

// AFTER:
expect(screen.getByRole('combobox', { name: 'Track' })).toHaveTextContent('Senior Engineer');
```

### 5c. `Skills.test.tsx` — Agent A owns this

**Caption text changes (2 lines):**

```tsx
// Line 89 — BEFORE:
expect(screen.getByText('Where my experience is concentrated across areas')).toBeVisible();
// AFTER:
expect(screen.getByText('Where experience is concentrated across areas')).toBeVisible();

// Line 99 — BEFORE:
expect(screen.getByText('How my skill set has grown across my career')).toBeVisible();
// AFTER:
expect(screen.getByText('How skills have grown over time')).toBeVisible();
```

**SkillFilterBar interaction — open the panel first (4 places):**

SkillFilterBar now lives inside the Collapse panel. Any test that clicks the SkillFilterBar button must first click the outer Filters trigger to open the panel. The outer trigger button's accessible name is `filterButtonLabel` (e.g. `"General"` on default track with no filters, or `"Lead / Engineering Manager"`).

Pattern to apply before each `user.click(screen.getByRole('button', { name: 'Filter skills by category...' }))`:

```tsx
// Open the filter panel first
await user.click(screen.getByRole('button', { name: 'General' }));
// Then interact with SkillFilterBar inside
await user.click(screen.getByRole('button', { name: 'Filter skills by category, currently: All' }));
```

For tests that start on a non-default track (e.g. `?track=lead`), the trigger label is `"Lead / Engineering Manager"`.

The 4 locations in `Skills.test.tsx` that need this fix:

- Line ~107 (table view filter bar visibility test)
- Line ~137 (track=lead category grouping test)
- Line ~156 (track switching drops stale filters test)
- Line ~174 (drops category param not in active track test)

**New tests to add** (append to `Skills.test.tsx` inside `describe('rendering')` or a new `describe('filter panel')`):

```tsx
test('shows the active view name as an h2 heading', async () => {
  const screen = await renderAndFlush();

  expect(screen.getByRole('heading', { level: 2, name: 'Radar view' })).toBeVisible();
});

test('opens and closes the filter panel when the trigger is clicked', async () => {
  const user = userEvent.setup();
  const screen = await renderAndFlush();

  const trigger = screen.getByRole('button', { name: 'General' });
  expect(trigger).toHaveAttribute('aria-expanded', 'false');

  await user.click(trigger);

  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByRole('group', { name: 'Skill filters' })).toBeVisible();
  expect(await axe(screen.container)).toHaveNoViolations();

  await user.click(trigger);

  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  // unmountOnExit removes panel contents from DOM when closed
  expect(screen.queryByRole('group', { name: 'Skill filters' })).not.toBeInTheDocument();
});

test('filter button label includes track name and filter count when filters are active', async () => {
  const user = userEvent.setup();
  const screen = await renderAndFlush(
    () => Promise.resolve(CAREER_HISTORY),
    ['/skills?track=lead']
  );

  // Open the panel and apply a category filter
  await user.click(screen.getByRole('button', { name: 'Lead / Engineering Manager' }));
  await user.click(
    screen.getByRole('button', { name: 'Filter skills by category, currently: All' })
  );
  await user.click(screen.getByRole('menuitemcheckbox', { name: 'JavaScript Stack' }));

  expect(
    screen.getByRole('button', { name: 'Lead / Engineering Manager · 1 filter' })
  ).toBeVisible();
});
```

---

## Two-agent parallel split — zero file overlap

**Agent A (`sonnet`):** edits `Skills.tsx`, `Skills.constants.tsx`, `Skills.test.tsx`

1. Add 2 new imports to `Skills.tsx` — `Collapse` and `KeyboardArrowDownIcon` only (Button/tracks already exist — do NOT add again)
2. Add `filterPanelOpen` state + 3 label computed values after line 178 — see §4b
3. Replace lines 255–338 with new JSX — see §4c (line 340 onward unchanged)
4. Update 4 captions in `Skills.constants.tsx` — see §1
5. Update `Skills.test.tsx` — caption strings, panel-open prerequisite, 3 new tests — see §5c

**Agent B (`haiku`):** edits `SkillFilterBar.tsx`, `TrackFilter.tsx`, `SkillFilterBar.test.tsx`, `TrackFilter.test.tsx`

1. Swap `FilterListIcon` → `KeyboardArrowDownIcon` import in `SkillFilterBar.tsx` — see §3a
2. Update label logic lines 88–89 in `SkillFilterBar.tsx` — see §3b
3. Replace `<Button>` lines 93–107 in `SkillFilterBar.tsx` — see §3c
4. Remove `"Track: "` prefix in `TrackFilter.tsx` line 15 — see §2
5. Find-and-replace 11 label strings in `SkillFilterBar.test.tsx` — see §5a
6. Update `TrackFilter.test.tsx` line 33 — see §5b

---

## Verification

1. Run dev server; open `/skills`
2. Slim top bar: only Share + view toggles visible at top right
3. Heading row: `h2` shows active view label; changes when toggles are clicked; uses `effectiveViewMode`
4. Compare button appears in heading row when Table view is active (not in caption row)
5. In compare mode: "Comparing [track] with [chips] · [Comparing]" appears in heading row
6. Filter button label shows active track name + count (e.g. `Lead / Engineering Manager` or `Lead / Engineering Manager · 2 filters`)
7. Clicking filter button opens panel with Track, Category, Year (if applicable)
8. TrackFilter shows track label without "Track: " prefix
9. SkillFilterBar button: outlined, arrow icon, same height as TrackFilter, label "All" or "N selected"
10. Caption text updated (e.g. "Years spent on each skill" for Graph view)
11. Caption still shows "Skills side by side across two tracks" in compare mode
12. Resize to 375px — heading, compare controls, search, and filter button stack without horizontal overflow
