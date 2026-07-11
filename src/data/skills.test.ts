describe('skills', () => {
  afterEach(() => {
    jest.resetModules();
    jest.dontMock('./skills.json');
  });

  test('throws when a skill has an unrecognised category', async () => {
    jest.doMock('./skills.json', () => [
      {
        name: 'Bad Skill',
        category: 'design',
        subCategory: 'development',
        type: 'skill',
        synonyms: [],
        jobIds: [],
        recommendationIds: [],
      },
    ]);

    await expect(import('./skills')).rejects.toThrow(
      'skills.json: unrecognised category "design" on skill "Bad Skill"'
    );
  });

  test('throws when a skill has an unrecognised subCategory', async () => {
    jest.doMock('./skills.json', () => [
      {
        name: 'Bad Skill',
        category: 'engineering',
        subCategory: 'design',
        type: 'skill',
        synonyms: [],
        jobIds: [],
        recommendationIds: [],
      },
    ]);

    await expect(import('./skills')).rejects.toThrow(
      'skills.json: unrecognised subCategory "design" on skill "Bad Skill"'
    );
  });

  test('throws when a skill has an unrecognised type', async () => {
    jest.doMock('./skills.json', () => [
      {
        name: 'Bad Skill',
        category: 'engineering',
        subCategory: 'development',
        type: 'expertise',
        synonyms: [],
        jobIds: [],
        recommendationIds: [],
      },
    ]);

    await expect(import('./skills')).rejects.toThrow(
      'skills.json: unrecognised type "expertise" on skill "Bad Skill"'
    );
  });
});
