import { useMemo } from 'react';

import { deriveCareerYearRange } from '@/utils/deriveCareerYearRange';
import { deriveSkillGrowth } from '@/utils/deriveSkillGrowth';
import { SkillsNoData } from '@/views/skills/skillsNoData';

import { useSkillsCareerContext } from '../SkillsCareerContext';
import { useSkillsViewContext } from '../SkillsViewContext';

import { SkillsGrowthChart } from './skillsGrowthChart';

export const SkillsGrowthView = () => {
  const { skills, track } = useSkillsViewContext();
  const careerHistory = useSkillsCareerContext();

  // Track-scoped, filter-agnostic: driven by the full track skill set, not filteredSkills.
  const growth = useMemo(() => deriveSkillGrowth(careerHistory, skills), [careerHistory, skills]);
  const { maxYear } = useMemo(
    () => deriveCareerYearRange(careerHistory, track),
    [careerHistory, track]
  );
  const domainMinYear = useMemo(
    () =>
      Math.min(
        ...careerHistory
          .filter((event) => event.type === 'work')
          .map((event) => new Date(event.startDate).getUTCFullYear())
      ),
    [careerHistory]
  );

  if (skills.length === 0 || growth.points.length === 0) {
    return <SkillsNoData />;
  }

  return <SkillsGrowthChart growth={growth} maxYear={maxYear} domainMinYear={domainMinYear} />;
};
