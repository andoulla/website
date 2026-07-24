import type { Theme } from '@mui/material/styles';

import type { Skill, Track } from '@/types';
import { deriveSkillCategoryMap, type TrackCategoryRef } from '@/utils/deriveSkillCategoryMap';

import { CARD_FADE_DURATION_MS, CARD_FADE_TRANSLATE_Y } from './TimelineEventCard.constants';

export const recommendationElementId = (id: string): string =>
  `recommendation-${encodeURIComponent(id)}`;

interface SkillCategoryGroup {
  category: TrackCategoryRef;
  skills: Skill[];
}

// Groups skills by owning track category; skills unknown to the track are skipped.
export const groupSkillsByCategory = (skills: Skill[], track: Track): SkillCategoryGroup[] => {
  const categoryBySkillId = deriveSkillCategoryMap(track);
  const groupsByCategoryId = new Map<string, SkillCategoryGroup>();

  skills.forEach((skill) => {
    const category = categoryBySkillId.get(skill.id);

    if (category === undefined) return;

    const group = groupsByCategoryId.get(category.id);

    if (group === undefined) {
      groupsByCategoryId.set(category.id, { category, skills: [skill] });
    } else {
      group.skills.push(skill);
    }
  });

  return [...groupsByCategoryId.values()].sort(
    // Largest group first; ties keep track category order.
    (groupA, groupB) =>
      groupB.skills.length - groupA.skills.length || groupA.category.index - groupB.category.index
  );
};

export const getCardMotionSx = (isInView: boolean, prefersReducedMotion: boolean) => {
  // Reduced motion: stay fully visible with no transform/transition, so scrolling
  // never causes a position snap.
  if (prefersReducedMotion) return { opacity: 1 };

  return {
    opacity: isInView ? 1 : 0,
    transform: isInView ? 'translateY(0)' : `translateY(${CARD_FADE_TRANSLATE_Y})`,
    transition: (theme: Theme) =>
      theme.transitions.create(['opacity', 'transform'], {
        duration: CARD_FADE_DURATION_MS,
        easing: theme.transitions.easing.easeOut,
      }),
  };
};
