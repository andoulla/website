import type { Theme } from '@mui/material/styles';

import type { Skill, SkillCategory } from '@/types';
import { CATEGORY_ORDER } from '@/utils/skillCategory';

import { CARD_FADE_DURATION_MS, CARD_FADE_TRANSLATE_Y } from './TimelineEventCard.constants';

export const recommendationElementId = (id: string): string =>
  `recommendation-${encodeURIComponent(id)}`;

interface SkillCategoryGroup {
  category: SkillCategory;
  skills: Skill[];
}

export const groupSkillsByCategory = (skills: Skill[]): SkillCategoryGroup[] =>
  CATEGORY_ORDER.map((category) => ({
    category,
    skills: skills.filter((skill) => skill.category === category),
  }))
    .filter((group) => group.skills.length > 0)
    // Stable sort: ties keep CATEGORY_ORDER as the tiebreaker.
    .sort((groupA, groupB) => groupB.skills.length - groupA.skills.length);

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
