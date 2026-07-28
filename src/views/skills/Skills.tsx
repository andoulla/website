import { Suspense, useCallback, useMemo, useState } from 'react';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
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
import { calculateSkillYears } from '@/utils/calculateSkillYears';
import { deriveAllSkills } from '@/utils/deriveAllSkills';
import { deriveCareerYearRange } from '@/utils/deriveCareerYearRange';
import { derivePresentCategories } from '@/utils/derivePresentCategories';
import { filterSkillsByCategory } from '@/utils/filterSkillsByCategory';
import { skillMatchesSearch } from '@/utils/skillMatchesSearch';
import {
  AS_OF_PARAM,
  COMPARE_TRACK_PARAM,
  SEARCH_PARAM,
  VIEW_MODES,
  VIEW_PARAM,
} from '@/utils/skillsUrlParams';

import { VIEW_OPTIONS } from './Skills.constants';
import {
  parseAsOfYear,
  parseCompareTrackId,
  parseSearch,
  parseViewMode,
  scopeRecommendationsAsOf,
} from './Skills.helpers';
import type { ViewMode } from './Skills.types';
import { CopyLinkButton } from './copyLinkButton';
import { SkillFilterBar } from './skillFilterBar';
import { SkillSearchBar } from './skillSearchBar';
import { SkillsStatBar } from './skillsStatBar';
import { TimeMachineSlider } from './timeMachineSlider';
import { TrackFilter } from './trackFilter';
import { SkillsCareerContextProvider, SkillsViewContextProvider } from './skillsViews';
import { SkillsCompareView } from './skillsViews/skillsCompareView';
import { useSkillSearchUrl } from './useSkillSearchUrl';
import { useSkillsPageState } from './useSkillsPageState';

const deriveSearchHint = (
  searchTerm: string,
  totalMatches: number,
  hiddenMatchCount: number
): string | undefined => {
  if (searchTerm.trim() === '') return undefined;

  if (totalMatches === 0 || hiddenMatchCount === 0) return undefined;

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

  const {
    highlightedSkills,
    selectedCategories,
    setSelectedCategories,
    selectedSubCategories,
    setSelectedSubCategories,
    subCategoriesByCategory,
  } = useSkillsPageState(track, skills);

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
    setSearchTerm('');
    setSelectedCategories([]);
    setSelectedSubCategories([]);
  }, [setSearchTerm, setSelectedCategories, setSelectedSubCategories]);

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
    parseCompareTrackId,
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

  const isCompareMode =
    compareTrackId !== null && compareTrack !== undefined && compareTrackId !== trackId;

  // Compare forces table view; the URL view param is preserved so it restores when compare exits.
  const effectiveViewMode: ViewMode = isCompareMode ? 'table' : viewMode;

  const [showPatterns, setShowPatterns] = useState(false);

  const ActiveView = VIEW_OPTIONS[effectiveViewMode].Component;

  const categories = useMemo(() => derivePresentCategories(skills), [skills]);

  const handleActivateCompare = useCallback(() => {
    const firstAvailable = tracks.find((t) => t.id !== trackId);

    if (firstAvailable !== undefined) {
      setCompareTrackId(firstAvailable.id);
    }
  }, [trackId, setCompareTrackId]);

  const handleDeactivateCompare = useCallback(() => {
    setCompareTrackId(null);
  }, [setCompareTrackId]);

  const renderCompareControls = () => {
    if (isCompareMode) {
      return (
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
            {'Comparing '}
            <Typography
              component="span"
              variant="body2"
              sx={{ fontWeight: 600, color: 'primary.main' }}
            >
              {track.label}
            </Typography>
            {' with'}
          </Typography>
          {tracks
            .filter((t) => t.id !== compareTrackId && t.id !== trackId)
            .map((t) => (
              <Chip
                key={t.id}
                label={t.label}
                size="small"
                variant="outlined"
                color="primary"
                onClick={() => setCompareTrackId(t.id)}
              />
            ))}
          <Button
            size="small"
            variant="contained"
            startIcon={<CompareArrowsIcon />}
            onClick={handleDeactivateCompare}
            sx={{ textTransform: 'none', whiteSpace: 'nowrap', py: '2px' }}
          >
            Comparing
          </Button>
        </Stack>
      );
    }

    if (viewMode === 'table') {
      return (
        <Button
          size="small"
          variant="outlined"
          startIcon={<CompareArrowsIcon />}
          onClick={handleActivateCompare}
          sx={{ textTransform: 'none', whiteSpace: 'nowrap', py: '2px' }}
        >
          Compare
        </Button>
      );
    }

    return null;
  };

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
        {renderCompareControls()}
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
