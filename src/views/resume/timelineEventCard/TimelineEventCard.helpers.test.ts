import { Skill, Track } from '@/testing';

import {
  getCardMotionSx,
  groupSkillsByCategory,
  recommendationElementId,
} from './TimelineEventCard.helpers';

describe('recommendationElementId', () => {
  test('prefixes the recommendation id', () => {
    expect(recommendationElementId('rec-1')).toBe('recommendation-rec-1');
  });

  test('URL-encodes special characters in the id', () => {
    expect(recommendationElementId('rec/1')).toBe('recommendation-rec%2F1');
  });
});

describe('getCardMotionSx', () => {
  test('fades and slides up when the card is not in view', () => {
    const sx = getCardMotionSx(false, false);

    expect(sx).toMatchObject({ opacity: 0, transform: 'translateY(32px)' });
  });

  test('is fully visible and untransformed when the card is in view', () => {
    const sx = getCardMotionSx(true, false);

    expect(sx).toMatchObject({ opacity: 1, transform: 'translateY(0)' });
  });

  test('stays fully visible with no transform when reduced motion is preferred', () => {
    const sx = getCardMotionSx(false, true);

    expect(sx).toEqual({ opacity: 1 });
  });
});

describe('groupSkillsByCategory', () => {
  const track = new Track()
    .categories([
      {
        id: 'leadership',
        name: 'Leadership',
        subCategories: [{ id: 'people', name: 'People', skillIds: ['team-leadership'] }],
      },
      {
        id: 'engineering',
        name: 'Engineering',
        subCategories: [{ id: 'core', name: 'Core', skillIds: ['react', 'typescript'] }],
      },
      {
        id: 'tooling',
        name: 'Tooling',
        subCategories: [{ id: 'tools', name: 'Tools', skillIds: ['git'] }],
      },
    ])
    .mock();
  const reactSkill = new Skill().id('react').name('React').mock();
  const typeScriptSkill = new Skill().id('typescript').name('TypeScript').mock();
  const gitSkill = new Skill().id('git').name('Git').mock();
  const leadershipSkill = new Skill().id('team-leadership').name('Team Leadership').mock();

  test('orders categories by skill count, most skills first', () => {
    const groups = groupSkillsByCategory(
      [leadershipSkill, reactSkill, typeScriptSkill, gitSkill],
      track
    );

    expect(groups).toEqual([
      {
        category: { id: 'engineering', name: 'Engineering', index: 1 },
        skills: [reactSkill, typeScriptSkill],
      },
      { category: { id: 'leadership', name: 'Leadership', index: 0 }, skills: [leadershipSkill] },
      { category: { id: 'tooling', name: 'Tooling', index: 2 }, skills: [gitSkill] },
    ]);
  });

  test('breaks ties between equally-sized categories using the track category order', () => {
    const groups = groupSkillsByCategory([gitSkill, reactSkill, leadershipSkill], track);

    expect(groups).toEqual([
      { category: { id: 'leadership', name: 'Leadership', index: 0 }, skills: [leadershipSkill] },
      { category: { id: 'engineering', name: 'Engineering', index: 1 }, skills: [reactSkill] },
      { category: { id: 'tooling', name: 'Tooling', index: 2 }, skills: [gitSkill] },
    ]);
  });

  test('skips skills the track does not include and returns an empty array for no skills', () => {
    const offTrackSkill = new Skill().id('kubernetes').name('Kubernetes').mock();

    expect(groupSkillsByCategory([offTrackSkill], track)).toEqual([]);
    expect(groupSkillsByCategory([], track)).toEqual([]);
  });
});
