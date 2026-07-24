import { useMemo } from 'react';
import Alert from '@mui/material/Alert';

import { deriveCareerYearRange } from '@/utils/deriveCareerYearRange';
import { deriveSkillGrowth } from '@/utils/deriveSkillGrowth';

import { useSkillsCareerContext } from '../SkillsCareerContext';
import { useSkillsViewContext } from '../SkillsViewContext';

import { SkillsGrowthChart } from './skillsGrowthChart';

export const SkillsGrowthView = () => {
  const { skills, track } = useSkillsViewContext();
  const careerHistory = useSkillsCareerContext();

  // Track-scoped, filter-agnostic: driven by the full track skill set, not filteredSkills.
  const growth = useMemo(() => deriveSkillGrowth(careerHistory, skills), [careerHistory, skills]);
  const { minYear, maxYear } = useMemo(
    () => deriveCareerYearRange(careerHistory, track),
    [careerHistory, track]
  );

  if (skills.length === 0 || growth.points.length === 0) {
    return <Alert severity="info">No skill data available.</Alert>;
  }

  return <SkillsGrowthChart growth={growth} minYear={minYear} maxYear={maxYear} />;
};
