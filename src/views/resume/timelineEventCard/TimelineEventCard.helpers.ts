import type { Theme } from '@mui/material/styles';

import type { SkillCategory } from '@/data/skills.types';
import type { TimelineEvent } from '@/types';
import { CATEGORY_ORDER } from '@/utils/skillCategory';
import { skillCategory } from '@/utils/skillColour';

import { CARD_FADE_DURATION_MS, CARD_FADE_TRANSLATE_Y } from './TimelineEventCard.constants';

export const recommendationElementId = (id: string): string =>
  `recommendation-${encodeURIComponent(id)}`;

export const RESPONSIBILITIES_LABEL_BY_TYPE: Record<TimelineEvent['type'], string> = {
  work: 'Responsibilities',
  education: 'Description',
  other: 'Responsibilities',
};

interface SkillCategoryGroup {
  category: SkillCategory;
  skills: string[];
}

export const groupSkillsByCategory = (skills: string[]): SkillCategoryGroup[] =>
  CATEGORY_ORDER.map((category) => ({
    category,
    skills: skills.filter((skill) => skillCategory(skill) === category),
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
