import { Suspense, useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import BarChartIcon from '@mui/icons-material/BarChart';
import RadarIcon from '@mui/icons-material/Radar';
import TableChartIcon from '@mui/icons-material/TableChart';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { PageContainer } from '@/components/pageContainer';
import { useCareerDataContext } from '@/context/careerData';
import { useTrackContext } from '@/context/track';
import { calculateSkillYears } from '@/utils/calculateSkillYears';
import { derivePresentCategories } from '@/utils/derivePresentCategories';
import { filterSkillsByCategory } from '@/utils/filterSkillsByCategory';
import { matchSkill } from '@/utils/matchSkill';
import { skillMatchesSearch } from '@/utils/skillMatchesSearch';
import {
  CATEGORY_PARAM,
  SEARCH_PARAM,
  SKILL_PARAM,
  SUBCATEGORY_PARAM,
  VIEW_PARAM,
} from '@/utils/skillsUrlParams';

import {
  parseCategoryIds,
  parseSearch,
  parseSubCategoryIds,
  parseViewMode,
} from './Skills.helpers';
import type { ViewMode } from './Skills.types';
import { CopyLinkButton } from './copyLinkButton';
import { SkillFilterBar, type SkillFilterOption } from './skillFilterBar';
import { SkillSearchBar } from './skillSearchBar';
import { TrackFilter } from './trackFilter';
import {
  SkillsGraphView,
  SkillsTableView,
  SkillsRadarView,
  SkillsViewContextProvider,
} from './skillsViews';
import { useSkillSearchUrl } from './useSkillSearchUrl';

const renderSkillsView = (viewMode: ViewMode, showPatterns: boolean) => {
  if (viewMode === 'barchart') return <SkillsGraphView showPatterns={showPatterns} />;
  if (viewMode === 'radar') return <SkillsRadarView />;
  return <SkillsTableView />;
};

const SkillsContent = () => {
  const careerHistory = useCareerDataContext();
  const { track } = useTrackContext();
  const skills = useMemo(() => calculateSkillYears(careerHistory, track), [careerHistory, track]);

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

  const hiddenMatchCount = useMemo(() => {
    if (searchTerm.trim() === '') return 0;
    const totalMatches = skills.filter((skill) => skillMatchesSearch(skill, searchTerm)).length;
    const visibleMatches = filteredSkills.filter((skill) =>
      skillMatchesSearch(skill, searchTerm)
    ).length;
    return totalMatches - visibleMatches;
  }, [skills, filteredSkills, searchTerm]);

  const searchHint =
    hiddenMatchCount > 0
      ? `${hiddenMatchCount} match${hiddenMatchCount === 1 ? '' : 'es'} hidden by filters`
      : undefined;

  const [viewMode, setViewMode] = useSkillSearchUrl(
    VIEW_PARAM,
    (raw) => parseViewMode(raw) ?? 'radar',
    // 'radar' is the default, so it's omitted from the URL.
    (next) => (next === 'radar' ? null : next)
  );

  const [showPatterns, setShowPatterns] = useState(false);

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

  return (
    <>
      <Stack
        direction="row"
        sx={{
          mb: { xs: 1.5, sm: 3 },
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
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
        <Stack direction="row" sx={{ alignItems: 'center', ml: 'auto' }}>
          {viewMode === 'barchart' && (
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
              label="Patterns"
            />
          )}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_e, next: ViewMode | null) => {
              if (next !== null) setViewMode(next);
            }}
            size="small"
            aria-label="View mode"
          >
            <Tooltip title="Graph view">
              <ToggleButton value="barchart" aria-label="Graph view">
                <BarChartIcon fontSize="small" />
              </ToggleButton>
            </Tooltip>
            <Tooltip title="Radar view">
              <ToggleButton value="radar" aria-label="Radar view">
                <RadarIcon fontSize="small" />
              </ToggleButton>
            </Tooltip>
            <Tooltip title="Table view">
              <ToggleButton value="table" aria-label="Table view">
                <TableChartIcon fontSize="small" />
              </ToggleButton>
            </Tooltip>
          </ToggleButtonGroup>
          <CopyLinkButton />
        </Stack>
      </Stack>
      <SkillsViewContextProvider
        track={track}
        skills={skills}
        filteredSkills={filteredSkills}
        selectedCategories={selectedCategories}
        selectedSubCategories={selectedSubCategories}
        highlightedSkills={highlightedSkills}
        searchTerm={searchTerm}
        onClearFilters={clearFilters}
      >
        {renderSkillsView(viewMode, showPatterns)}
      </SkillsViewContextProvider>
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
