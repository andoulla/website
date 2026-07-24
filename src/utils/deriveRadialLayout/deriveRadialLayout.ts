import type { SkillSummary } from '@/utils/calculateSkillYears';
import type { SkillNode } from '@/utils/deriveSkillCoOccurrence';

import type { PositionedNode } from './deriveRadialLayout.types';

export const deriveRadialLayout = (
  nodes: SkillNode[],
  skills: SkillSummary[]
): PositionedNode[] => {
  const skillByName = new Map<string, SkillSummary>(skills.map((skill) => [skill.skill, skill]));

  // Group nodes by category, preserving input order within each group.
  const byCategory = new Map<string, SkillNode[]>();

  for (const node of nodes) {
    const skill = skillByName.get(node.id);
    const category = skill?.categoryName ?? 'other';
    const existing = byCategory.get(category);

    if (existing === undefined) {
      byCategory.set(category, [node]);
    } else {
      existing.push(node);
    }
  }

  const categories = [...byCategory.keys()];
  const numCategories = Math.max(categories.length, 1);
  const positioned: PositionedNode[] = [];

  categories.forEach((category, categoryIndex) => {
    const categoryNodes = byCategory.get(category) ?? [];
    const centreAngle = (2 * Math.PI * categoryIndex) / numCategories;
    // Use 85% of each category's allocated arc so nodes spread without overlapping.
    const subArc = ((2 * Math.PI) / numCategories) * 0.85;

    categoryNodes.forEach((node, nodeIndex) => {
      let angle: number;

      if (categoryNodes.length === 1) {
        angle = centreAngle;
      } else {
        const step = subArc / (categoryNodes.length - 1);

        angle = centreAngle - subArc / 2 + nodeIndex * step;
      }

      positioned.push({ ...node, x: Math.cos(angle), y: Math.sin(angle) });
    });
  });

  return positioned;
};
