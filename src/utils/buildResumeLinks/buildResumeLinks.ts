const TRACK_PARAM = 'track';

export type ResumeSkillLink = { to: string; label: string };

export const buildSkillResumeLinks = (
  skill: { name: string; recommendationIds: string[] },
  trackId: string
): { skillTo: string; recommendationLinks: ResumeSkillLink[] } => ({
  skillTo: `/?skill=${encodeURIComponent(skill.name)}&${TRACK_PARAM}=${trackId}`,
  recommendationLinks: skill.recommendationIds.map((id, index) => ({
    to: `/?recommendation=${encodeURIComponent(id)}&${TRACK_PARAM}=${trackId}`,
    label: skill.recommendationIds.length === 1 ? 'Recommendation' : `Recommendation ${index + 1}`,
  })),
});
