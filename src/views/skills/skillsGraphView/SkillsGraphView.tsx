import { useMemo } from 'react';
import Alert from '@mui/material/Alert';

import type { SkillCategory, SkillSubCategory } from '@/data/skills.types';
import type { SkillSummary } from '@/utils/calculateSkillYears';
import { filterSkillsByCategory } from '@/utils/filterSkillsByCategory';

import { SkillsBarChart } from './skillsBarChart';

export interface SkillsGraphViewProps {
  skills: SkillSummary[];
  selectedCategories: SkillCategory[];
  selectedSubCategories: SkillSubCategory[];
}

export const SkillsGraphView = ({
  skills,
  selectedCategories,
  selectedSubCategories,
}: SkillsGraphViewProps) => {
  const filteredSkills = useMemo(
    () =>
      filterSkillsByCategory(skills, selectedCategories, selectedSubCategories).sort(
        (a, b) => b.years - a.years
      ),
    [skills, selectedCategories, selectedSubCategories]
  );

  if (skills.length === 0) {
    return <Alert severity="info">No skill data available.</Alert>;
  }

  return <SkillsBarChart skills={filteredSkills} />;
};
