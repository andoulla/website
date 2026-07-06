import { useMemo } from 'react';
import Alert from '@mui/material/Alert';

import type { SkillCategory, SkillSubCategory } from '@/data/skills.types';
import type { SkillSummary } from '@/utils/calculateSkillYears';

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
  const filteredSkills = useMemo(() => {
    if (selectedCategories.length === 0 && selectedSubCategories.length === 0) return skills;

    return skills
      .filter(
        (skill) =>
          (selectedCategories.length === 0 || selectedCategories.includes(skill.category)) &&
          (selectedSubCategories.length === 0 || selectedSubCategories.includes(skill.subCategory))
      )
      .sort((a, b) => b.years - a.years);
  }, [skills, selectedCategories, selectedSubCategories]);

  if (skills.length === 0) {
    return <Alert severity="info">No skill data available.</Alert>;
  }

  return <SkillsBarChart skills={filteredSkills} />;
};
