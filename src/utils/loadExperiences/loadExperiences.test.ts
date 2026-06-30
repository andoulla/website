import { loadExperiences } from './loadExperiences';

describe('loadExperiences', () => {
  test('resolves to work experiences with their recommendations joined', async () => {
    const experiences = await loadExperiences();

    const nimbus = experiences.find((experience) => experience.companyName === 'Nimbus Analytics');
    expect(nimbus).toBeDefined();
    expect(nimbus?.recommendations.length).toBeGreaterThan(0);
    expect(
      nimbus?.recommendations.every((recommendation) => recommendation.jobId === nimbus.id)
    ).toBe(true);
  });
});
