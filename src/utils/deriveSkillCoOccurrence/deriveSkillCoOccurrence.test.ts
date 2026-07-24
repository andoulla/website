import { Responsibility, TimelineEvent } from '@/testing';
import type { Skill } from '@/types';

import { deriveSkillCoOccurrence } from './deriveSkillCoOccurrence';

const SKILLS: Skill[] = [
  { id: 'ts', name: 'TypeScript', type: 'tech', synonyms: [], jobIds: [], recommendationIds: [] },
  { id: 'react', name: 'React', type: 'tech', synonyms: [], jobIds: [], recommendationIds: [] },
  { id: 'node', name: 'Node.js', type: 'tech', synonyms: [], jobIds: [], recommendationIds: [] },
];

describe('deriveSkillCoOccurrence', () => {
  test('one responsibility with 3 skillIds produces 3 edges each with weight 1', () => {
    const event = new TimelineEvent()
      .type('work')
      .responsibilities([new Responsibility().skillIds(['ts', 'react', 'node']).mock()])
      .mock();

    const result = deriveSkillCoOccurrence([event], SKILLS);

    expect(result.edges).toHaveLength(3);
    result.edges.forEach((edge) => {
      expect(edge.weight).toBe(1);
    });
  });

  test('two responsibilities sharing the same pair produce edge weight 2, not 2 separate edges', () => {
    const event = new TimelineEvent()
      .type('work')
      .responsibilities([
        new Responsibility().skillIds(['ts', 'react']).mock(),
        new Responsibility().skillIds(['react', 'ts']).mock(),
      ])
      .mock();

    const result = deriveSkillCoOccurrence([event], SKILLS);

    expect(result.edges).toHaveLength(1);
    expect(result.edges[0]?.weight).toBe(2);
  });

  test('ignores responsibilities with fewer than 2 skillIds', () => {
    const event = new TimelineEvent()
      .type('work')
      .responsibilities([
        new Responsibility().skillIds(['ts']).mock(),
        new Responsibility().skillIds([]).mock(),
      ])
      .mock();

    const result = deriveSkillCoOccurrence([event], SKILLS);

    expect(result.edges).toHaveLength(0);
  });

  test('drops skillIds not found in allSkills', () => {
    const event = new TimelineEvent()
      .type('work')
      .responsibilities([new Responsibility().skillIds(['ts', 'unknown-skill']).mock()])
      .mock();

    const result = deriveSkillCoOccurrence([event], SKILLS);

    expect(result.edges).toHaveLength(0);
    expect(result.nodes).toHaveLength(1);
    expect(result.nodes[0]?.id).toBe('TypeScript');
  });

  test('skips education events entirely', () => {
    const educationEvent = new TimelineEvent()
      .type('education')
      .responsibilities([new Responsibility().skillIds(['ts', 'react']).mock()])
      .mock();
    const workEvent = new TimelineEvent()
      .type('work')
      .responsibilities([new Responsibility().skillIds(['ts', 'node']).mock()])
      .mock();

    const result = deriveSkillCoOccurrence([educationEvent, workEvent], SKILLS);

    expect(result.edges).toHaveLength(1);
    expect(result.edges[0]?.source).toBe('Node.js');
    expect(result.edges[0]?.target).toBe('TypeScript');
  });

  test('node ids are skill display names', () => {
    const event = new TimelineEvent()
      .type('work')
      .responsibilities([new Responsibility().skillIds(['ts', 'react']).mock()])
      .mock();

    const result = deriveSkillCoOccurrence([event], SKILLS);
    const nodeIds = result.nodes.map((node) => node.id);

    expect(nodeIds).toContain('TypeScript');
    expect(nodeIds).toContain('React');
  });
});
