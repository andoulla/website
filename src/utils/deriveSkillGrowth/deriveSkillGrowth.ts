import type { TimelineEvent } from '@/types';
import type { SkillSummary } from '@/utils/calculateSkillYears';

import type { SkillGrowth, SkillGrowthMarker, SkillGrowthPoint } from './deriveSkillGrowth.types';

const startYear = (event: TimelineEvent): number => new Date(event.startDate).getUTCFullYear();

// Cumulative unique skills by the year each was first used, plus company-change markers.
export const deriveSkillGrowth = (
  careerHistory: TimelineEvent[],
  skills: SkillSummary[]
): SkillGrowth => {
  const eventById = new Map(careerHistory.map((event) => [event.id, event]));

  // Earliest year each skill was used; skills with no known job are excluded.
  const countByYear = new Map<number, number>();

  skills.forEach((skill) => {
    const years = skill.jobIds
      .map((jobId) => eventById.get(jobId))
      .filter((event): event is TimelineEvent => event !== undefined)
      .map(startYear);

    if (years.length === 0) return;

    const acquiredYear = Math.min(...years);

    countByYear.set(acquiredYear, (countByYear.get(acquiredYear) ?? 0) + 1);
  });

  let cumulative = 0;
  const points: SkillGrowthPoint[] = [...countByYear.keys()]
    .sort((yearA, yearB) => yearA - yearB)
    .map((year) => {
      cumulative += countByYear.get(year) ?? 0;

      return { year, count: cumulative };
    });

  // Career steps (exclude education) → dashed markers, earliest first.
  const markers: SkillGrowthMarker[] = careerHistory
    .filter((event) => event.type !== 'education')
    .map((event) => ({ year: startYear(event), companyName: event.companyName }))
    .sort((markerA, markerB) => markerA.year - markerB.year);

  return { points, markers };
};
