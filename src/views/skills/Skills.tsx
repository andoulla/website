import { Suspense, useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import BarChartIcon from '@mui/icons-material/BarChart';
import ViewListIcon from '@mui/icons-material/ViewList';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';

import { useResumeData } from '@/context/resumeData';
import type { SkillCategory, SkillSubCategory } from '@/data/skills.types';
import { calculateSkillYears } from '@/utils/calculateSkillYears';
import { CATEGORY_ORDER, SUBCATEGORIES_BY_CATEGORY } from '@/utils/skillCategory';

import { SkillFilterBar } from './skillFilterBar';
import { SkillsGraphView } from './skillsGraphView';
import { SkillsListView } from './skillsListView';

type ViewMode = 'list' | 'graph';

const SUBCATEGORY_PARAM = 'subCategory';

const parseSubCategories = (raw: string | null): SkillSubCategory[] =>
  raw !== null && raw.length > 0 ? (raw.split(',') as SkillSubCategory[]) : [];

const SkillsContent = () => {
  const experiences = useResumeData();
  const skills = useMemo(() => calculateSkillYears(experiences), [experiences]);
  const recommendations = useMemo(
    () => experiences.flatMap((e) => e.recommendations),
    [experiences]
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const highlightedSkill = searchParams.get('skill') ?? undefined;
  const selectedSubCategories = useMemo(
    () => parseSubCategories(searchParams.get(SUBCATEGORY_PARAM)),
    [searchParams]
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
          return params;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const [viewMode, setViewMode] = useState<ViewMode>('graph');
  const [selectedCategories, setSelectedCategories] = useState<SkillCategory[]>([]);

  const categories = useMemo(
    () => CATEGORY_ORDER.filter((cat) => skills.some((s) => s.category === cat)),
    [skills]
  );

  const subCategoriesByCategory = useMemo(
    () =>
      categories.reduce<Partial<Record<SkillCategory, SkillSubCategory[]>>>((acc, cat) => {
        const subCategories = SUBCATEGORIES_BY_CATEGORY[cat].filter((sub) =>
          skills.some((s) => s.category === cat && s.subCategory === sub)
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
        {viewMode === 'graph' && (
          <SkillFilterBar
            categories={categories}
            subCategoriesByCategory={subCategoriesByCategory}
            selectedCategories={selectedCategories}
            selectedSubCategories={selectedSubCategories}
            onCategoriesChange={setSelectedCategories}
            onSubCategoriesChange={setSelectedSubCategories}
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
          sx={{ ml: 'auto' }}
        >
          <ToggleButton value="list" aria-label="List view">
            <ViewListIcon fontSize="small" sx={{ mr: 0.5 }} />
            List
          </ToggleButton>
          <ToggleButton value="graph" aria-label="Graph view">
            <BarChartIcon fontSize="small" sx={{ mr: 0.5 }} />
            Graph
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>
      {viewMode === 'list' ? (
        <SkillsListView
          skills={skills}
          recommendations={recommendations}
          highlightedSkill={highlightedSkill}
        />
      ) : (
        <SkillsGraphView
          skills={skills}
          selectedCategories={selectedCategories}
          selectedSubCategories={selectedSubCategories}
        />
      )}
    </>
  );
};

export const Skills = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
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
    </Container>
  );
};
