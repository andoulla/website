import { SkillSummary } from '@/testing';
import type { SkillNode } from '@/utils/deriveSkillCoOccurrence';

import { deriveRadialLayout } from './deriveRadialLayout';

describe('deriveRadialLayout', () => {
  test('every input node appears in the output with x and y', () => {
    const nodes: SkillNode[] = [
      { id: 'React', occurrences: 3 },
      { id: 'TypeScript', occurrences: 2 },
      { id: 'Node.js', occurrences: 1 },
    ];
    const skills = [
      new SkillSummary().skill('React').categoryName('Frontend').mock(),
      new SkillSummary().skill('TypeScript').categoryName('Frontend').mock(),
      new SkillSummary().skill('Node.js').categoryName('Backend').mock(),
    ];

    const result = deriveRadialLayout(nodes, skills);

    expect(result).toHaveLength(3);
    result.forEach((node) => {
      expect(typeof node.x).toBe('number');
      expect(typeof node.y).toBe('number');
    });
  });

  test('with 2 categories their centre angles are evenly spaced (π apart)', () => {
    const nodes: SkillNode[] = [
      { id: 'React', occurrences: 1 },
      { id: 'Node.js', occurrences: 1 },
    ];
    const skills = [
      new SkillSummary().skill('React').categoryName('Frontend').categoryIndex(0).mock(),
      new SkillSummary().skill('Node.js').categoryName('Backend').categoryIndex(1).mock(),
    ];

    const result = deriveRadialLayout(nodes, skills);

    const reactNode = result.find((node) => node.id === 'React');
    const nodeJsNode = result.find((node) => node.id === 'Node.js');

    expect(reactNode).toBeDefined();
    expect(nodeJsNode).toBeDefined();

    if (reactNode === undefined || nodeJsNode === undefined) return;

    // Centres at 0 and π → dot product of unit vectors = cos(π) = -1
    const dot = reactNode.x * nodeJsNode.x + reactNode.y * nodeJsNode.y;

    expect(dot).toBeCloseTo(-1, 5);
  });

  test('single-node category places node on the unit circle', () => {
    const nodes: SkillNode[] = [{ id: 'React', occurrences: 1 }];
    const skills = [new SkillSummary().skill('React').categoryName('Frontend').mock()];

    const result = deriveRadialLayout(nodes, skills);

    const node = result[0];

    expect(node).toBeDefined();

    if (node === undefined) return;

    const radiusSquared = node.x * node.x + node.y * node.y;

    expect(radiusSquared).toBeCloseTo(1, 10);
  });

  test('output is deterministic — same input produces same output', () => {
    const nodes: SkillNode[] = [
      { id: 'React', occurrences: 3 },
      { id: 'TypeScript', occurrences: 2 },
    ];
    const skills = [
      new SkillSummary().skill('React').categoryName('Frontend').mock(),
      new SkillSummary().skill('TypeScript').categoryName('Frontend').mock(),
    ];

    const first = deriveRadialLayout(nodes, skills);
    const second = deriveRadialLayout(nodes, skills);

    expect(first).toEqual(second);
  });

  test('nodes not found in skills fall into the other category', () => {
    const nodes: SkillNode[] = [{ id: 'Unknown', occurrences: 1 }];
    const skills: never[] = [];

    const result = deriveRadialLayout(nodes, skills);

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('Unknown');
  });
});
