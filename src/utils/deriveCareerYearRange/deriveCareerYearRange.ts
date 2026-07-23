import { skills as defaultSkills } from '@/data/skills';
import type { Skill, TimelineEvent, Track } from '@/types';
import { trackSkillIds } from '@/utils/trackSkillIds';

// The set of event ids that contribute at least one skill in the active track.
const trackContributingEventIds = (track: Track, allSkills: Skill[]): Set<string> => {
  const skillIds = trackSkillIds(track);

  const eventIds = new Set<string>();
  allSkills.forEach((skill) => {
    if (!skillIds.has(skill.id)) return;
    skill.jobIds.forEach((jobId) => eventIds.add(jobId));
  });
  return eventIds;
};

// Year span the slider can move through: earliest track-relevant job → current year. Track-scoped.
export const deriveCareerYearRange = (
  careerHistory: TimelineEvent[],
  track: Track,
  allSkills: Skill[] = defaultSkills,
  today: Date = new Date()
): { minYear: number; maxYear: number } => {
  const contributingEventIds = trackContributingEventIds(track, allSkills);

  // UTC-safe year extraction — startDate is date-only.
  const startYears = careerHistory
    .filter((event) => contributingEventIds.has(event.id))
    .map((event) => new Date(event.startDate).getUTCFullYear());

  // Upper bound is the present — the slider's top position means "up to today".
  const maxYear = today.getFullYear();
  const minYear = startYears.length > 0 ? Math.min(...startYears, maxYear) : maxYear;

  return { minYear, maxYear };
};
