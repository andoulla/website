import type { WorkExperience } from '../../types';
import { skillCategory, skillColour } from '../skillColour';
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
  today: Date = new Date()
): SkillSummary[] {
  const totals = new Map<string, number>();

  for (const exp of experiences) {
    const years = durationYears(exp.startDate, exp.endDate, today);
    // Deduplicate within this job so a skill in both techStack and skills counts once.
    const jobSkills = new Set([...exp.techStack, ...exp.skills]);
    for (const skill of jobSkills) {
      totals.set(skill, (totals.get(skill) ?? 0) + years);
    }
  }

  const summaries: SkillSummary[] = Array.from(totals.entries()).map(([skill, years]) => ({
    skill,
    years: Math.round(years * 10) / 10,
    category: skillCategory(skill),
    colour: skillColour(skill),
  }));

  return summaries.sort((a, b) => {
    const catDiff = CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category];
    if (catDiff !== 0) return catDiff;
    return b.years - a.years;
  });
}
