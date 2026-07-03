import { useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';

import type { WorkExperienceWithRecommendations } from '../../../../types';
import type { SkillSummary } from '../../../../utils/calculateSkillYears';
import type { SkillCategory } from '../../../../utils/skillColour';

import { SkillFilterBar } from './components/skillFilterBar';
import { SkillsBarChart } from './components/skillsBarChart';

const CATEGORY_ORDER: SkillCategory[] = ['engineering', 'managerial', 'soft-skills', 'other'];

export interface SkillsGraphViewProps {
  skills: SkillSummary[];
  experiences: WorkExperienceWithRecommendations[];
}

export const SkillsGraphView = ({ skills, experiences }: SkillsGraphViewProps) => {
  const [filterCategory, setFilterCategory] = useState<'all' | SkillCategory>('all');

  const companyNameMap = useMemo(
    () => new Map(experiences.map((e) => [e.id, e.companyName])),
    [experiences]
  );

  const categories = CATEGORY_ORDER.filter((cat) => skills.some((s) => s.category === cat));

  if (skills.length === 0) {
    return <Alert severity="info">No skill data available.</Alert>;
  }

  const filteredSkills =
    filterCategory === 'all'
      ? skills
      : [...skills.filter((s) => s.category === filterCategory)].sort((a, b) => b.years - a.years);

  return (
    <>
      <SkillFilterBar
        categories={categories}
        activeFilter={filterCategory}
        onChange={setFilterCategory}
      />
      <SkillsBarChart skills={filteredSkills} companyNameMap={companyNameMap} />
    </>
  );
};
