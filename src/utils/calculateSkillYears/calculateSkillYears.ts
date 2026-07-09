import { skills as defaultSkills } from '@/data/skills';
import type { Skill } from '@/data/skills.types';
import type { TimelineEvent } from '@/types';
import { CATEGORY_ORDER } from '@/utils/skillCategory';
import { skillColour } from '@/utils/skillColour';

import type { SkillSummary } from './calculateSkillYears.types';

const durationYears = (startDate: string, endDate: string | null, today: Date): number => {
  const start = new Date(startDate);
  const end = endDate !== null ? new Date(endDate) : today;
  return (end.getTime() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
};

export const calculateSkillYears = (
  careerHistory: TimelineEvent[],
  allSkills: Skill[] = defaultSkills,
  today: Date = new Date()
): SkillSummary[] => {
  const eventById = new Map(careerHistory.map((event) => [event.id, event]));

  const summaries: SkillSummary[] = allSkills
    .filter((skill) => skill.jobIds.length > 0)
    .map((skill) => {
      const companyYearsMap = new Map<string, number>();

      const years = skill.jobIds.reduce((total, jobId) => {
        const event = eventById.get(jobId);
        if (event === undefined) return total;
        const jobYears = durationYears(event.startDate, event.endDate, today);
        const priorYears = companyYearsMap.get(event.companyName) ?? 0;
        companyYearsMap.set(event.companyName, priorYears + jobYears);
        return total + jobYears;
      }, 0);

      const companyYears = [...companyYearsMap.entries()].map(([name, companyYearsTotal]) => ({
        name,
        years: Math.round(companyYearsTotal * 10) / 10,
      }));

      return {
        skill: skill.name,
        years: Math.round(years * 10) / 10,
        category: skill.category,
        subCategory: skill.subCategory,
        colour: skillColour(skill.name),
        synonyms: skill.synonyms,
        jobIds: skill.jobIds,
        recommendationIds: skill.recommendationIds,
        companyYears,
      };
    })
    .filter((summary) => summary.years > 0);

  return summaries.sort((a, b) => {
    const catDiff = CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
    if (catDiff !== 0) return catDiff;
    return b.years - a.years;
  });
};
