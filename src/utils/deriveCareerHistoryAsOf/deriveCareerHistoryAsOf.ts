import { skills as defaultSkills } from '@/data/skills';
import type { Skill, TimelineEvent, Track } from '@/types';

const toIsoDate = (date: Date): string => date.toISOString().slice(0, 10);

// History as of cutoffDate: drop not-yet-started events; clamp still-running/later endDates to it.
export const deriveCareerHistoryAsOf = (
  careerHistory: TimelineEvent[],
  cutoffDate: Date
): TimelineEvent[] =>
  careerHistory.flatMap((event) => {
    if (new Date(event.startDate) > cutoffDate) return [];

    const endsAfterCutoff = event.endDate === null || new Date(event.endDate) > cutoffDate;
    return [{ ...event, endDate: endsAfterCutoff ? toIsoDate(cutoffDate) : event.endDate }];
  });

// The set of event ids that contribute at least one skill in the active track.
const trackContributingEventIds = (track: Track, allSkills: Skill[]): Set<string> => {
  const trackSkillIds = new Set(
    track.categories.flatMap((category) =>
      category.subCategories.flatMap((subCategory) => subCategory.skillIds)
    )
  );

  const eventIds = new Set<string>();
  allSkills.forEach((skill) => {
    if (!trackSkillIds.has(skill.id)) return;
    skill.jobIds.forEach((jobId) => eventIds.add(jobId));
  });
  return eventIds;
};

// Scrubber year span: earliest track-relevant job → current year. Track-scoped.
export const deriveCareerYearRange = (
  careerHistory: TimelineEvent[],
  track: Track,
  allSkills: Skill[] = defaultSkills,
  today: Date = new Date()
): { minYear: number; maxYear: number } => {
  const contributingEventIds = trackContributingEventIds(track, allSkills);
  const startYears = careerHistory
    .filter((event) => contributingEventIds.has(event.id))
    .map((event) => new Date(event.startDate).getFullYear());

  const maxYear = today.getFullYear();
  const minYear = startYears.length > 0 ? Math.min(...startYears) : maxYear;
  return { minYear, maxYear };
};
