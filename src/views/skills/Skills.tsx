import { Suspense, useCallback, useMemo, useState } from 'react';
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
import { useCareerDataContext } from '@/context/careerData';
import type { SkillCategory, SkillSubCategory } from '@/data/skills.types';
import { calculateSkillYears } from '@/utils/calculateSkillYears';
import { filterSkillsByCategory } from '@/utils/filterSkillsByCategory';
import { CATEGORY_ORDER, SUBCATEGORIES_BY_CATEGORY } from '@/utils/skillCategory';
import { skillMatchesSearch } from '@/utils/skillMatchesSearch';

import {
  CATEGORY_PARAM,
  SEARCH_PARAM,
  SKILL_PARAM,
  SUBCATEGORY_PARAM,
  VIEW_PARAM,
} from './Skills.constants';
import {
  parseCategories,
  parseSearch,
  parseSkills,
  parseSubCategories,
  parseViewMode,
} from './Skills.helpers';
import type { ViewMode } from './Skills.types';
import { CopyLinkButton } from './copyLinkButton';
import { SkillFilterBar } from './skillFilterBar';
import { SkillSearchBar } from './skillSearchBar';
import {
  SkillsGraphView,
  SkillsListView,
  SkillsRadarView,
  SkillsViewContextProvider,
} from './skillsViews';
import { useSkillSearchUrl } from './useSkillSearchUrl';

const renderSkillsView = (viewMode: ViewMode, showPatterns: boolean) => {
  if (viewMode === 'barchart') return <SkillsGraphView showPatterns={showPatterns} />;
  if (viewMode === 'radar') return <SkillsRadarView />;
  return <SkillsListView />;
};

const SkillsContent = () => {
  const careerHistory = useCareerDataContext();
  const skills = useMemo(() => calculateSkillYears(careerHistory), [careerHistory]);

  const [highlightedSkills] = useSkillSearchUrl(SKILL_PARAM, parseSkills, () => null);
  // setter unused here — skill param is only ever written by TimelineEventCard's navigate()

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
    // 'radar' is the default now, so it's the value that's omitted from the URL.
    (next) => (next === 'radar' ? null : next)
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
          <CopyLinkButton />
        </Stack>
      </Stack>
      <SkillsViewContextProvider
        skills={skills}
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
