import type { TimelineEvent } from '@/types';

import careerHistoryData from './careerHistory.json';
import { skills } from './skills';

const VALID_TYPES: TimelineEvent['type'][] = ['work', 'education', 'other', 'internship'];

const skillIds = new Set(skills.map((skill) => skill.id));
const seenResponsibilityIds = new Set<string>();

careerHistoryData.forEach((event) => {
  if (!(VALID_TYPES as string[]).includes(event.type)) {
    throw new Error(`careerHistory.json: unrecognised type "${event.type}" on event "${event.id}"`);
  }

  event.responsibilities.forEach((responsibility) => {
    if (seenResponsibilityIds.has(responsibility.id)) {
      throw new Error(`careerHistory.json: duplicate responsibility id "${responsibility.id}"`);
    }
    seenResponsibilityIds.add(responsibility.id);

    responsibility.skillIds.forEach((skillId) => {
      if (!skillIds.has(skillId)) {
        throw new Error(
          `careerHistory.json: unknown skillId "${skillId}" on responsibility "${responsibility.id}"`
        );
      }
    });
  });
});

export const careerHistory = careerHistoryData as TimelineEvent[];
