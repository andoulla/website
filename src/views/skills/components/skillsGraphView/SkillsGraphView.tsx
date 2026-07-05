import { useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';

import type { TimelineEventWithRecommendations } from '@/types';
import type { SkillSummary } from '@/utils/calculateSkillYears';
import type { SkillCategory } from '@/utils/skillColour';

import { SkillFilterBar } from './skillFilterBar';
import { SkillsBarChart } from './skillsBarChart';

const CATEGORY_ORDER: SkillCategory[] = ['engineering', 'managerial', 'soft-skills', 'other'];

export interface SkillsGraphViewProps {
  skills: SkillSummary[];
  experiences: TimelineEventWithRecommendations[];
}

export const SkillsGraphView = ({ skills, experiences }: SkillsGraphViewProps) => {
  const [filterCategory, setFilterCategory] = useState<'all' | SkillCategory>('all');

  const companyNameMap = useMemo(
    () => new Map(experiences.map((e) => [e.id, e.companyName])),
    [experiences]
  );

  const categories = useMemo(
    () => CATEGORY_ORDER.filter((cat) => skills.some((s) => s.category === cat)),
    [skills]
  );

  const filteredSkills = useMemo(
    () =>
      filterCategory === 'all'
        ? skills
        : [...skills.filter((s) => s.category === filterCategory)].sort(
            (a, b) => b.years - a.years
          ),
    [skills, filterCategory]
  );

  if (skills.length === 0) {
    return <Alert severity="info">No skill data available.</Alert>;
  }

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
