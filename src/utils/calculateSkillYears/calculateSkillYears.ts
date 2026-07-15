import { skills as defaultSkills } from '@/data/skills';
import type { Skill, TimelineEvent, Track } from '@/types';
import { categoryColourFromIndex } from '@/utils/skillColour';

import type { SkillCompanyYears, SkillSummary } from './calculateSkillYears.types';

const durationYears = (startDate: string, endDate: string | null, today: Date): number => {
  const start = new Date(startDate);
  const end = endDate !== null ? new Date(endDate) : today;
  return (end.getTime() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
};

interface SkillYears {
  years: number;
  companyYears: SkillCompanyYears[];
}

const calculateYearsForSkill = (
  skill: Skill,
  eventById: Map<string, TimelineEvent>,
  today: Date
): SkillYears => {
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

  return { years: Math.round(years * 10) / 10, companyYears };
};

// Summaries come out in track order: categories as authored in the track file, skills within a
// category by years descending.
export const calculateSkillYears = (
  careerHistory: TimelineEvent[],
  track: Track,
  allSkills: Skill[] = defaultSkills,
  // A fresh Date() per call — callers must memoize, or every render re-triggers a new instant.
  today: Date = new Date()
): SkillSummary[] => {
  const eventById = new Map(careerHistory.map((event) => [event.id, event]));
  const skillById = new Map(allSkills.map((skill) => [skill.id, skill]));

  return track.categories.flatMap((category, categoryIndex) => {
    const categorySummaries = category.subCategories.flatMap((subCategory) =>
      subCategory.skillIds.flatMap((skillId) => {
        const skill = skillById.get(skillId);
        if (skill === undefined) return [];

        const { years, companyYears } = calculateYearsForSkill(skill, eventById, today);
        if (years <= 0) return [];

        return [
          {
            id: skill.id,
            skill: skill.name,
            years,
            categoryId: category.id,
            categoryName: category.name,
            categoryIndex,
            subCategoryId: subCategory.id,
            subCategoryName: subCategory.name,
            colour: categoryColourFromIndex(categoryIndex),
            synonyms: skill.synonyms,
            jobIds: skill.jobIds,
            recommendationIds: skill.recommendationIds,
            companyYears,
          },
        ];
      })
    );

    return categorySummaries.sort((a, b) => b.years - a.years);
  });
};
