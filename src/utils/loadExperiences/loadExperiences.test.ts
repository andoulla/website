import { loadExperiences } from './loadExperiences';

describe('loadExperiences', () => {
  test('resolves to work experiences with their references joined', async () => {
    const experiences = await loadExperiences();

    const nimbus = experiences.find((experience) => experience.companyName === 'Nimbus Analytics');
    expect(nimbus).toBeDefined();
    expect(nimbus?.references.length).toBeGreaterThan(0);
    expect(nimbus?.references.every((reference) => reference.jobId === nimbus.id)).toBe(true);
  });
});
