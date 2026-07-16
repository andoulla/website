import type { TimelineEvent } from '@/types';

export const CARD_FADE_TRANSLATE_Y = '32px';
export const CARD_FADE_DURATION_MS = 650;

export const RESPONSIBILITIES_LABEL_BY_TYPE: Record<TimelineEvent['type'], string> = {
  work: 'Responsibilities',
  education: 'Description',
  other: 'Responsibilities',
  internship: 'Responsibilities',
};
