import type { TimelineEvent } from '@/types';
import type { SkillSummary } from '@/utils/calculateSkillYears';

import type { SkillGrowth, SkillGrowthMarker, SkillGrowthPoint } from './deriveSkillGrowth.types';

const startYear = (event: TimelineEvent): number => new Date(event.startDate).getUTCFullYear();

const startFraction = (event: TimelineEvent): number => {
  const raw = new Date(event.startDate);
  // day ≤ 10 → snap to 1st of month so near-month-start dates align with the reference line
  const d =
    raw.getUTCDate() <= 10 ? new Date(Date.UTC(raw.getUTCFullYear(), raw.getUTCMonth(), 1)) : raw;
  const year = d.getUTCFullYear();
  const startOfYear = Date.UTC(year, 0, 1);
  const startOfNextYear = Date.UTC(year + 1, 0, 1);

  return year + (d.getTime() - startOfYear) / (startOfNextYear - startOfYear);
};

// Cumulative unique skills by the year each was first used, plus company-change markers.
export const deriveSkillGrowth = (
  careerHistory: TimelineEvent[],
  skills: SkillSummary[]
): SkillGrowth => {
  const eventById = new Map(careerHistory.map((event) => [event.id, event]));

  // Earliest fractional year each skill was used; skills with no known job are excluded.
  const countByYear = new Map<number, number>();

  skills.forEach((skill) => {
    const events = skill.jobIds
      .map((jobId) => eventById.get(jobId))
      .filter((event): event is TimelineEvent => event !== undefined);

    if (events.length === 0) return;

    const acquiredYear = Math.min(...events.map(startFraction));

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
    .map((event) => ({
      year: startYear(event),
      startDate: event.startDate,
      companyName: event.companyName,
    }))
    .sort((markerA, markerB) => markerA.year - markerB.year);

  return { points, markers };
};
