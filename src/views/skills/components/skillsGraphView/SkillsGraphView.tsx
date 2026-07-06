import { useMemo } from 'react';
import Alert from '@mui/material/Alert';

import type { SkillSummary } from '@/utils/calculateSkillYears';
import type { SkillCategory } from '@/utils/skillColour';

import { SkillsBarChart } from './skillsBarChart';

export interface SkillsGraphViewProps {
  skills: SkillSummary[];
  filterCategory: 'all' | SkillCategory;
}

export const SkillsGraphView = ({ skills, filterCategory }: SkillsGraphViewProps) => {
  const filteredSkills = useMemo(
    () =>
      filterCategory === 'all'
        ? skills
        : [...skills.filter((skill) => skill.category === filterCategory)].sort(
            (a, b) => b.years - a.years
          ),
    [skills, filterCategory]
  );

  if (skills.length === 0) {
    return <Alert severity="info">No skill data available.</Alert>;
  }

  return <SkillsBarChart skills={filteredSkills} />;
};
