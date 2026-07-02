import { skills as defaultSkills } from '../../data/skills';
import type { Skill } from '../../data/skills.types';
import type { WorkExperience } from '../../types';
import { skillColour } from '../skillColour';
import type { SkillCategory } from '../skillColour';

import type { SkillSummary } from './calculateSkillYears.types';

const CATEGORY_ORDER: Record<SkillCategory, number> = {
  engineering: 0,
  managerial: 1,
  'soft-skills': 2,
  other: 3,
};

function durationYears(startDate: string, endDate: string | null, today: Date): number {
  const start = new Date(startDate);
  const end = endDate !== null ? new Date(endDate) : today;
  return (end.getTime() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
}

export function calculateSkillYears(
  experiences: WorkExperience[],
  allSkills: Skill[] = defaultSkills,
  today: Date = new Date()
): SkillSummary[] {
  const experienceById = new Map(experiences.map((e) => [e.id, e]));

  const summaries: SkillSummary[] = allSkills
    .filter((skill) => skill.jobIds.length > 0)
    .map((skill) => {
      const years = skill.jobIds.reduce((total, jobId) => {
        const exp = experienceById.get(jobId);
        if (exp === undefined) return total;
        return total + durationYears(exp.startDate, exp.endDate, today);
      }, 0);

      return {
        skill: skill.name,
        years: Math.round(years * 10) / 10,
        category: skill.category,
        colour: skillColour(skill.name),
        jobIds: skill.jobIds,
        recommendationIds: skill.recommendationIds,
      };
    })
    .filter((s) => s.years > 0);

  return summaries.sort((a, b) => {
    const catDiff = CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category];
    if (catDiff !== 0) return catDiff;
    return b.years - a.years;
  });
}
