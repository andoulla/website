import { Suspense, useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import BarChartIcon from '@mui/icons-material/BarChart';
import RadarIcon from '@mui/icons-material/Radar';
import ViewListIcon from '@mui/icons-material/ViewList';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';

import { PageContainer } from '@/components/pageContainer';
import { useResumeData } from '@/context/resumeData';
import type { SkillCategory, SkillSubCategory } from '@/data/skills.types';
import { calculateSkillYears } from '@/utils/calculateSkillYears';
import { filterSkillsByCategory } from '@/utils/filterSkillsByCategory';
import { CATEGORY_ORDER, SUBCATEGORIES_BY_CATEGORY } from '@/utils/skillCategory';
import { skillMatchesSearch } from '@/utils/skillMatchesSearch';

import { CATEGORY_PARAM, SEARCH_PARAM, SUBCATEGORY_PARAM, VIEW_PARAM } from './Skills.constants';
import {
  parseCategories,
  parseSearch,
  parseSubCategories,
  parseViewMode,
  reorderFilterParams,
} from './Skills.helpers';
import type { ViewMode } from './Skills.types';
import { SkillFilterBar } from './skillFilterBar';
import { SkillSearchBar } from './skillSearchBar';
import {
  SkillsGraphView,
  SkillsListView,
  SkillsRadarView,
  SkillsViewContextProvider,
} from './skillsViews';

const renderSkillsView = (viewMode: ViewMode, showPatterns: boolean) => {
  if (viewMode === 'barchart') return <SkillsGraphView showPatterns={showPatterns} />;
  if (viewMode === 'radar') return <SkillsRadarView />;
  return <SkillsListView />;
};

const SkillsContent = () => {
  const experiences = useResumeData();
  const skills = useMemo(() => calculateSkillYears(experiences), [experiences]);
  const recommendations = useMemo(
    () => experiences.flatMap((experience) => experience.recommendations),
    [experiences]
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const highlightedSkill = searchParams.get('skill') ?? undefined;
  const selectedCategories = useMemo(
    () => parseCategories(searchParams.get(CATEGORY_PARAM)),
    [searchParams]
  );
  const selectedSubCategories = useMemo(
    () => parseSubCategories(searchParams.get(SUBCATEGORY_PARAM)),
    [searchParams]
  );

  const setSelectedCategories = useCallback(
    (next: SkillCategory[]) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          if (next.length > 0) {
            params.set(CATEGORY_PARAM, next.join(','));
          } else {
            params.delete(CATEGORY_PARAM);
          }
          return reorderFilterParams(params);
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const setSelectedSubCategories = useCallback(
    (next: SkillSubCategory[]) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          if (next.length > 0) {
            params.set(SUBCATEGORY_PARAM, next.join(','));
          } else {
            params.delete(SUBCATEGORY_PARAM);
          }
          return reorderFilterParams(params);
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  // Held in local state rather than read straight from `searchParams`: the URL update round-trips
  // through router navigation, and a controlled input driven by that async state drops keystrokes
  // typed faster than the round-trip (React resets the DOM value back to the stale render).
  const [searchTerm, setSearchTermState] = useState(() =>
    parseSearch(searchParams.get(SEARCH_PARAM))
  );

  const setSearchTerm = useCallback(
    (next: string) => {
      setSearchTermState(next);
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          if (next !== '') {
            params.set(SEARCH_PARAM, next);
          } else {
            params.delete(SEARCH_PARAM);
          }
          return reorderFilterParams(params);
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const filteredSkills = useMemo(
    () => filterSkillsByCategory(skills, selectedCategories, selectedSubCategories),
    [skills, selectedCategories, selectedSubCategories]
  );

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

  const [viewMode, setViewModeState] = useState<ViewMode>(
    () => parseViewMode(searchParams.get(VIEW_PARAM)) ?? 'radar'
  );

  const setViewMode = useCallback(
    (next: ViewMode) => {
      setViewModeState(next);
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          // 'radar' is the default now, so it's the value that's omitted from the URL.
          if (next === 'radar') {
            params.delete(VIEW_PARAM);
          } else {
            params.set(VIEW_PARAM, next);
          }
          return reorderFilterParams(params);
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const [showPatterns, setShowPatterns] = useState(false);

  const categories = useMemo(
    () => CATEGORY_ORDER.filter((cat) => skills.some((skill) => skill.category === cat)),
    [skills]
  );

  const subCategoriesByCategory = useMemo(
    () =>
      categories.reduce<Partial<Record<SkillCategory, SkillSubCategory[]>>>((acc, cat) => {
        const subCategories = SUBCATEGORIES_BY_CATEGORY[cat].filter((sub) =>
          skills.some((skill) => skill.category === cat && skill.subCategory === sub)
        );
        if (subCategories.length > 0) acc[cat] = subCategories;
        return acc;
      }, {}),
    [categories, skills]
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
            <ToggleButton value="barchart" aria-label="Graph view">
              <BarChartIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="radar" aria-label="Radar view">
              <RadarIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="list" aria-label="List view">
              <ViewListIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Stack>
      <SkillsViewContextProvider
        skills={skills}
        recommendations={recommendations}
        selectedCategories={selectedCategories}
        selectedSubCategories={selectedSubCategories}
        highlightedSkill={highlightedSkill}
        searchTerm={searchTerm}
      >
        {renderSkillsView(viewMode, showPatterns)}
      </SkillsViewContextProvider>
    </>
  );
};

export const Skills = () => {
  return (
    <PageContainer>
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
