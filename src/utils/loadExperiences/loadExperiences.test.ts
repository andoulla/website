import { loadExperiences } from './loadExperiences';

describe('loadExperiences', () => {
  test('resolves to work experiences each with a recommendations array', async () => {
    const experiences = await loadExperiences();

    expect(experiences.length).toBeGreaterThan(0);
    for (const experience of experiences) {
      expect(Array.isArray(experience.recommendations)).toBe(true);
      expect(
        experience.recommendations.every((recommendation) => recommendation.jobId === experience.id)
      ).toBe(true);
    }
  });
});
