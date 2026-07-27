import { Suspense, useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

import { PageContainer } from '@/components/pageContainer';
import { useCareerDataContext } from '@/context/careerData';
import { useTrackContext } from '@/context/track';
import { tracks } from '@/data/tracks';
import type { TrackId } from '@/types';
import { calculateSkillYears } from '@/utils/calculateSkillYears';
import { deriveAllSkills } from '@/utils/deriveAllSkills';
import { deriveCareerYearRange } from '@/utils/deriveCareerYearRange';
import { derivePresentCategories } from '@/utils/derivePresentCategories';
import { filterSkillsByCategory } from '@/utils/filterSkillsByCategory';
import { matchSkill } from '@/utils/matchSkill';
import { skillMatchesSearch } from '@/utils/skillMatchesSearch';
import {
  AS_OF_PARAM,
  CATEGORY_PARAM,
  COMPARE_TRACK_PARAM,
  SEARCH_PARAM,
  SKILL_PARAM,
  SUBCATEGORY_PARAM,
  VIEW_MODES,
  VIEW_PARAM,
} from '@/utils/skillsUrlParams';

import { VIEW_OPTIONS } from './Skills.constants';
import {
  parseAsOfYear,
  parseCategoryIds,
  parseCompareTrackId,
  parseSearch,
  parseSubCategoryIds,
  parseViewMode,
  scopeRecommendationsAsOf,
} from './Skills.helpers';
import type { ViewMode } from './Skills.types';
import { CopyLinkButton } from './copyLinkButton';
import { SkillFilterBar, type SkillFilterOption } from './skillFilterBar';
import { SkillSearchBar } from './skillSearchBar';
import { SkillsStatBar } from './skillsStatBar';
import { TimeMachineSlider } from './timeMachineSlider';
import { TrackFilter } from './trackFilter';
import { SkillsCareerContextProvider, SkillsViewContextProvider } from './skillsViews';
import { SkillsCompareView } from './skillsViews/skillsCompareView';
import { useSkillSearchUrl } from './useSkillSearchUrl';

const deriveSearchHint = (
  searchTerm: string,
  totalMatches: number,
  hiddenMatchCount: number
): string | undefined => {
  if (searchTerm.trim() === '') return undefined;

  if (totalMatches === 0) return 'No skills match your search';

  if (hiddenMatchCount === 0) return undefined;

  return `${hiddenMatchCount} match${hiddenMatchCount === 1 ? '' : 'es'} hidden by filters`;
};

const SkillsContent = () => {
  const careerHistory = useCareerDataContext();
  const { track, trackId } = useTrackContext();

  const allSkills = useMemo(() => deriveAllSkills(careerHistory), [careerHistory]);

  const { minYear, maxYear } = useMemo(
    () => deriveCareerYearRange(careerHistory, track, allSkills),
    [careerHistory, track, allSkills]
  );
  const [cutoffYear, setCutoffYear] = useSkillSearchUrl(
    AS_OF_PARAM,
    useCallback((raw) => parseAsOfYear(raw, minYear, maxYear), [minYear, maxYear]),
    // maxYear is "latest" — omit it from the URL.
    (next) => (next === maxYear ? null : String(next))
  );
  // Latest → now; past year → its Dec 31.
  const asOfDate = useMemo(
    () => (cutoffYear === maxYear ? new Date() : new Date(`${cutoffYear}-12-31`)),
    [cutoffYear, maxYear]
  );
  const skills = useMemo(
    () =>
      scopeRecommendationsAsOf(
        calculateSkillYears(careerHistory, track, allSkills, asOfDate),
        careerHistory,
        asOfDate
      ),
    [careerHistory, track, allSkills, asOfDate]
  );

  const [searchParams] = useSearchParams();
  const highlightedSkillsKey = JSON.stringify(searchParams.getAll(SKILL_PARAM));
  // Params resolve through matchSkill: synonyms map to canonical names.
  const highlightedSkills = useMemo(
    () =>
      searchParams
        .getAll(SKILL_PARAM)
        .map((term) => matchSkill(term)?.skill.name)
        .filter((name): name is string => name !== undefined),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on content, not the ref
    [highlightedSkillsKey]
  );

  // Parsers are track-bound; useSkillSearchUrl memoizes on parser identity, so they must be
  // stable per track or the parsed state goes stale.
  const parseCategories = useCallback(
    (raw: string | null) => parseCategoryIds(raw, track),
    [track]
  );
  const parseSubCategories = useCallback(
    (raw: string | null) => parseSubCategoryIds(raw, track),
    [track]
  );

  const [selectedCategories, setSelectedCategories] = useSkillSearchUrl(
    CATEGORY_PARAM,
    parseCategories,
    (next) => (next.length > 0 ? next.join(',') : null)
  );

  const [selectedSubCategories, setSelectedSubCategories] = useSkillSearchUrl(
    SUBCATEGORY_PARAM,
    parseSubCategories,
    (next) => (next.length > 0 ? next.join(',') : null)
  );

  // Local state drives live typing (URL round-trip is too slow); URL is a write-only mirror.
  const [initialSearchTerm, setSearchTermUrl] = useSkillSearchUrl(
    SEARCH_PARAM,
    parseSearch,
    (next) => (next !== '' ? next : null)
  );
  const [searchTerm, setSearchTermState] = useState(initialSearchTerm);

  const setSearchTerm = useCallback(
    (next: string) => {
      setSearchTermState(next);
      setSearchTermUrl(next);
    },
    [setSearchTermUrl]
  );

  const filteredSkills = useMemo(
    () => filterSkillsByCategory(skills, selectedCategories, selectedSubCategories),
    [skills, selectedCategories, selectedSubCategories]
  );

  const clearFilters = useCallback(() => {
    setSelectedCategories([]);
    setSelectedSubCategories([]);
  }, [setSelectedCategories, setSelectedSubCategories]);

  const { totalMatches, hiddenMatchCount } = useMemo(() => {
    if (searchTerm.trim() === '') return { totalMatches: 0, hiddenMatchCount: 0 };

    const total = skills.filter((skill) => skillMatchesSearch(skill, searchTerm)).length;
    const visibleMatches = filteredSkills.filter((skill) =>
      skillMatchesSearch(skill, searchTerm)
    ).length;

    return { totalMatches: total, hiddenMatchCount: total - visibleMatches };
  }, [skills, filteredSkills, searchTerm]);

  const searchHint = deriveSearchHint(searchTerm, totalMatches, hiddenMatchCount);

  const [viewMode, setViewMode] = useSkillSearchUrl(
    VIEW_PARAM,
    (raw) => parseViewMode(raw) ?? 'radar',
    // 'radar' is the default, so it's omitted from the URL.
    (next) => (next === 'radar' ? null : next)
  );

  const [compareTrackId, setCompareTrackId] = useSkillSearchUrl(
    COMPARE_TRACK_PARAM,
    useCallback((raw) => parseCompareTrackId(raw, trackId), [trackId]),
    (next) => next ?? null
  );

  const compareTrack = useMemo(
    () => (compareTrackId !== null ? tracks.find((t) => t.id === compareTrackId) : undefined),
    [compareTrackId]
  );

  const compareSkills = useMemo(() => {
    if (compareTrack === undefined) return undefined;

    return scopeRecommendationsAsOf(
      calculateSkillYears(careerHistory, compareTrack, allSkills, asOfDate),
      careerHistory,
      asOfDate
    );
  }, [compareTrack, careerHistory, allSkills, asOfDate]);

  const isCompareMode = compareTrackId !== null && compareTrack !== undefined;

  // Compare forces table view; the URL view param is preserved so it restores when compare exits.
  const effectiveViewMode: ViewMode = isCompareMode ? 'table' : viewMode;

  const [showPatterns, setShowPatterns] = useState(false);

  const ActiveView = VIEW_OPTIONS[effectiveViewMode].Component;

  const categories = useMemo(() => derivePresentCategories(skills), [skills]);

  // Active track's subcategories, narrowed to those with at least one present summary.
  const subCategoriesByCategory = useMemo(
    () =>
      track.categories.reduce<Record<string, SkillFilterOption[]>>((acc, category) => {
        const presentSubCategories = category.subCategories
          .filter((subCategory) => skills.some((skill) => skill.subCategoryId === subCategory.id))
          .map(({ id, name }) => ({ id, name }));

        if (presentSubCategories.length > 0) acc[category.id] = presentSubCategories;

        return acc;
      }, {}),
    [track, skills]
  );

  const availableCompareTracks = tracks.filter((t) => t.id !== trackId);

  const handleActivateCompare = useCallback(() => {
    const firstAvailable = availableCompareTracks[0];

    if (firstAvailable !== undefined) {
      setCompareTrackId(firstAvailable.id);
    }
  }, [availableCompareTracks, setCompareTrackId]);

  const handleDeactivateCompare = useCallback(() => {
    setCompareTrackId(null);
  }, [setCompareTrackId]);

  return (
    <>
      <Stack
        direction="row"
        sx={{
          mb: { xs: 2.5, sm: 4 },
          pb: { xs: 1.5, sm: 2 },
          borderBottom: 1,
          borderColor: 'divider',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: { xs: 1.5, sm: 2 },
        }}
      >
        <SkillSearchBar value={searchTerm} onChange={setSearchTerm} hint={searchHint} />
        <TrackFilter />
        {isCompareMode ? (
          <>
            <Select<TrackId>
              size="small"
              value={compareTrackId}
              onChange={(event) => {
                setCompareTrackId(event.target.value);
              }}
              inputProps={{ 'aria-label': 'Compare with track' }}
              sx={{
                height: 36,
                color: 'inherit',
                '& .MuiSelect-select': {
                  py: '6px',
                  typography: 'button',
                  fontSize: '0.8125rem',
                },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
              }}
            >
              {availableCompareTracks.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.label}
                </MenuItem>
              ))}
            </Select>
            <Button
              size="small"
              variant="contained"
              startIcon={<CompareArrowsIcon />}
              onClick={handleDeactivateCompare}
              sx={{ height: 36, textTransform: 'none', whiteSpace: 'nowrap' }}
            >
              Comparing
            </Button>
          </>
        ) : (
          <Button
            size="small"
            variant="outlined"
            startIcon={<CompareArrowsIcon />}
            onClick={handleActivateCompare}
            sx={{ height: 36, textTransform: 'none', whiteSpace: 'nowrap' }}
          >
            Compare
          </Button>
        )}
        <SkillFilterBar
          categories={categories}
          subCategoriesByCategory={subCategoriesByCategory}
          selectedCategories={selectedCategories}
          selectedSubCategories={selectedSubCategories}
          onCategoriesChange={setSelectedCategories}
          onSubCategoriesChange={setSelectedSubCategories}
        />
        {minYear < maxYear && (
          <TimeMachineSlider
            year={cutoffYear}
            minYear={minYear}
            maxYear={maxYear}
            onCommit={setCutoffYear}
            sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: 220 }, minWidth: { md: 200 } }}
          />
        )}
        <Stack direction="row" sx={{ alignItems: 'center', ml: 'auto', gap: 1.5 }}>
          <CopyLinkButton />
          <Tooltip title={isCompareMode ? 'View toggle is disabled in compare mode' : ''}>
            <span>
              <ToggleButtonGroup
                value={effectiveViewMode}
                exclusive
                onChange={(_e, next: ViewMode | null) => {
                  if (next !== null && !isCompareMode) setViewMode(next);
                }}
                size="small"
                aria-label="View mode"
                disabled={isCompareMode}
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
            </span>
          </Tooltip>
        </Stack>
      </Stack>
      <Stack direction="row" sx={{ alignItems: 'center', mb: 0.5, minHeight: 38 }}>
        <Typography variant="h6" component="p" color="text.secondary" sx={{ flexGrow: 1 }}>
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
      </Stack>
      <SkillsStatBar filteredSkills={filteredSkills} />
      <SkillsCareerContextProvider careerHistory={careerHistory}>
        <SkillsViewContextProvider
          track={track}
          skills={skills}
          filteredSkills={filteredSkills}
          selectedCategories={selectedCategories}
          selectedSubCategories={selectedSubCategories}
          highlightedSkills={highlightedSkills}
          searchTerm={searchTerm}
          showPatterns={showPatterns}
          onClearFilters={clearFilters}
        >
          {isCompareMode && compareSkills !== undefined ? (
            <SkillsCompareView compareTrack={compareTrack} compareSkills={compareSkills} />
          ) : (
            <ActiveView />
          )}
        </SkillsViewContextProvider>
      </SkillsCareerContextProvider>
    </>
  );
};

export const Skills = () => {
  return (
    <PageContainer>
      <title>Skills — Mariandi Stylianou</title>
      <Typography variant="h3" component="h1" sx={{ mb: { xs: 1.5, sm: 3 } }}>
        Skills
      </Typography>
      <Suspense
        fallback={
          <Stack sx={{ py: 8, alignItems: 'center' }}>
            <CircularProgress aria-label="Loading skills" />
          </Stack>
        }
      >
        <SkillsContent />
      </Suspense>
    </PageContainer>
  );
};
