import type { TimelineEvent } from '@/types';

import careerHistoryData from './careerHistory.json';

const VALID_TYPES: TimelineEvent['type'][] = ['work', 'education', 'other'];

careerHistoryData.forEach((event) => {
  if (!(VALID_TYPES as string[]).includes(event.type)) {
    throw new Error(`careerHistory.json: unrecognised type "${event.type}" on event "${event.id}"`);
  }
});

export const careerHistory = careerHistoryData as TimelineEvent[];
