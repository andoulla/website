import { skills as defaultSkills } from '@/data/skills';
import type { Skill, TimelineEvent } from '@/types';

import type { SkillCoOccurrence, SkillEdge, SkillNode } from './deriveSkillCoOccurrence.types';

export const deriveSkillCoOccurrence = (
  careerHistory: TimelineEvent[],
  allSkills: Skill[] = defaultSkills
): SkillCoOccurrence => {
  const nameById = new Map<string, string>(allSkills.map((skill) => [skill.id, skill.name]));

  const edgeWeights = new Map<string, number>();
  const nodeCounts = new Map<string, number>();

  for (const event of careerHistory) {
    if (event.type === 'education') continue;

    for (const responsibility of event.responsibilities) {
      const names = responsibility.skillIds
        .map((id) => nameById.get(id))
        .filter((name): name is string => name !== undefined);

      for (const name of names) {
        nodeCounts.set(name, (nodeCounts.get(name) ?? 0) + 1);
      }

      for (let i = 0; i < names.length; i++) {
        for (let j = i + 1; j < names.length; j++) {
          const nameA = names[i];
          const nameB = names[j];

          if (nameA === undefined || nameB === undefined) continue;

          const pair = [nameA, nameB].sort().join('|');

          edgeWeights.set(pair, (edgeWeights.get(pair) ?? 0) + 1);
        }
      }
    }
  }

  const nodes: SkillNode[] = [...nodeCounts.entries()].map(([id, occurrences]) => ({
    id,
    occurrences,
  }));

  const edges: SkillEdge[] = [...edgeWeights.entries()].map(([key, weight]) => {
    const parts = key.split('|');
    const source = parts[0] ?? '';
    const target = parts[1] ?? '';

    return { source, target, weight };
  });

  return { nodes, edges };
};
