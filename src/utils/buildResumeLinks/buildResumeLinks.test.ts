import { buildSkillResumeLinks } from './buildResumeLinks';

describe('buildSkillResumeLinks', () => {
  test('builds skillLink with encoded skill name and trackId', () => {
    const { skillLink } = buildSkillResumeLinks(
      { name: 'Team Leadership', recommendationIds: [] },
      'general'
    );

    expect(skillLink).toBe('/?skill=Team%20Leadership&track=general');
  });

  test('returns empty recommendationLinks when there are no recommendation IDs', () => {
    const { recommendationLinks } = buildSkillResumeLinks(
      { name: 'React', recommendationIds: [] },
      'general'
    );

    expect(recommendationLinks).toEqual([]);
  });

  test('labels a single recommendation as "Recommendation" (no number)', () => {
    const { recommendationLinks } = buildSkillResumeLinks(
      { name: 'React', recommendationIds: ['rec-1'] },
      'general'
    );

    expect(recommendationLinks).toEqual([
      { to: '/?recommendation=rec-1&track=general', label: 'Recommendation' },
    ]);
  });

  test('numbers multiple recommendations starting at 1', () => {
    const { recommendationLinks } = buildSkillResumeLinks(
      { name: 'React', recommendationIds: ['rec-1', 'rec-2'] },
      'general'
    );

    expect(recommendationLinks).toEqual([
      { to: '/?recommendation=rec-1&track=general', label: 'Recommendation 1' },
      { to: '/?recommendation=rec-2&track=general', label: 'Recommendation 2' },
    ]);
  });
});
