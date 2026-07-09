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
    const groups = groupSkillsByCategory(['Team Leadership', 'React', 'TypeScript', 'Git']);

    expect(groups).toEqual([
      { category: 'engineering', skills: ['React', 'TypeScript'] },
      { category: 'tooling', skills: ['Git'] },
      { category: 'leadership-delivery', skills: ['Team Leadership'] },
    ]);
  });

  test('breaks ties between equally-sized categories using CATEGORY_ORDER', () => {
    const groups = groupSkillsByCategory(['Team Leadership', 'React', 'Git']);

    expect(groups).toEqual([
      { category: 'engineering', skills: ['React'] },
      { category: 'tooling', skills: ['Git'] },
      { category: 'leadership-delivery', skills: ['Team Leadership'] },
    ]);
  });

  test('omits categories with no matching skills', () => {
    const groups = groupSkillsByCategory(['React']);

    expect(groups).toEqual([{ category: 'engineering', skills: ['React'] }]);
  });

  test('returns an empty array for no skills', () => {
    expect(groupSkillsByCategory([])).toEqual([]);
  });

  test('falls back to the tooling category for an unrecognised skill name', () => {
    const groups = groupSkillsByCategory(['Some Made Up Skill']);

    expect(groups).toEqual([{ category: 'tooling', skills: ['Some Made Up Skill'] }]);
  });
});
