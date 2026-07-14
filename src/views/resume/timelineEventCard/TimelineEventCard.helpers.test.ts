import { Skill } from '@/testing';

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
  test('orders categories by skill count, most skills first', () => {
    const reactSkill = new Skill().id('react').name('React').category('engineering').mock();
    const typeScriptSkill = new Skill()
      .id('typescript')
      .name('TypeScript')
      .category('engineering')
      .mock();
    const gitSkill = new Skill().id('git').name('Git').category('tooling').mock();
    const leadershipSkill = new Skill()
      .id('team-leadership')
      .name('Team Leadership')
      .category('leadership-delivery')
      .mock();

    const groups = groupSkillsByCategory([leadershipSkill, reactSkill, typeScriptSkill, gitSkill]);

    expect(groups).toEqual([
      { category: 'engineering', skills: [reactSkill, typeScriptSkill] },
      { category: 'tooling', skills: [gitSkill] },
      { category: 'leadership-delivery', skills: [leadershipSkill] },
    ]);
  });

  test('breaks ties between equally-sized categories using CATEGORY_ORDER', () => {
    const reactSkill = new Skill().id('react').name('React').category('engineering').mock();
    const gitSkill = new Skill().id('git').name('Git').category('tooling').mock();
    const leadershipSkill = new Skill()
      .id('team-leadership')
      .name('Team Leadership')
      .category('leadership-delivery')
      .mock();

    const groups = groupSkillsByCategory([leadershipSkill, reactSkill, gitSkill]);

    expect(groups).toEqual([
      { category: 'engineering', skills: [reactSkill] },
      { category: 'tooling', skills: [gitSkill] },
      { category: 'leadership-delivery', skills: [leadershipSkill] },
    ]);
  });

  test('omits categories with no matching skills', () => {
    const reactSkill = new Skill().id('react').name('React').category('engineering').mock();

    const groups = groupSkillsByCategory([reactSkill]);

    expect(groups).toEqual([{ category: 'engineering', skills: [reactSkill] }]);
  });

  test('returns an empty array for no skills', () => {
    expect(groupSkillsByCategory([])).toEqual([]);
  });

  test('falls back to the tooling category for an unrecognised skill name', () => {
    const unknownSkill = new Skill()
      .id('unknown-skill')
      .name('Some Made Up Skill')
      .category('tooling')
      .mock();

    const groups = groupSkillsByCategory([unknownSkill]);

    expect(groups).toEqual([{ category: 'tooling', skills: [unknownSkill] }]);
  });
});
