import { loadCareerHistory } from './loadCareerHistory';

describe('loadCareerHistory', () => {
  test('resolves to timeline events each with a recommendations array', async () => {
    const careerHistory = await loadCareerHistory();

    expect(careerHistory.length).toBeGreaterThan(0);
    for (const event of careerHistory) {
      expect(Array.isArray(event.recommendations)).toBe(true);
      expect(Array.isArray(event.techStack)).toBe(true);
      expect(Array.isArray(event.skills)).toBe(true);
      expect(
        event.recommendations.every((recommendation) => recommendation.jobId === event.id)
      ).toBe(true);
    }
  });
});
