describe('skills', () => {
  afterEach(() => {
    jest.resetModules();
    jest.dontMock('./skills.json');
  });

  test('throws when a skill has no id', async () => {
    jest.doMock('./skills.json', () => [
      {
        name: 'Bad Skill',
        category: 'engineering',
        subCategory: 'development',
        type: 'skill',
        synonyms: [],
        jobIds: [],
        recommendationIds: [],
      },
    ]);

    await expect(import('./skills')).rejects.toThrow(
      'skills.json: missing id on skill "Bad Skill"'
    );
  });

  test('throws when two skills share an id', async () => {
    jest.doMock('./skills.json', () => [
      {
        id: 'react',
        name: 'React',
        category: 'engineering',
        subCategory: 'development',
        type: 'tech',
        synonyms: [],
        jobIds: [],
        recommendationIds: [],
      },
      {
        id: 'react',
        name: 'React Native',
        category: 'engineering',
        subCategory: 'development',
        type: 'tech',
        synonyms: [],
        jobIds: [],
        recommendationIds: [],
      },
    ]);

    await expect(import('./skills')).rejects.toThrow('skills.json: duplicate id "react"');
  });

  test('throws when a synonym collides with another skill name', async () => {
    jest.doMock('./skills.json', () => [
      {
        id: 'typescript',
        name: 'TypeScript',
        category: 'engineering',
        subCategory: 'development',
        type: 'tech',
        synonyms: ['TS'],
        jobIds: [],
        recommendationIds: [],
      },
      {
        id: 'flow',
        name: 'Flow',
        category: 'engineering',
        subCategory: 'development',
        type: 'tech',
        synonyms: ['ts'],
        jobIds: [],
        recommendationIds: [],
      },
    ]);

    await expect(import('./skills')).rejects.toThrow(
      'skills.json: "ts" appears on both "TypeScript" and "Flow"'
    );
  });

  test('allows a name and synonym to overlap within the same skill', async () => {
    jest.doMock('./skills.json', () => [
      {
        id: 'npm',
        name: 'npm',
        category: 'tooling',
        subCategory: 'tooling',
        type: 'tech',
        synonyms: ['NPM', 'Npm'],
        jobIds: [],
        recommendationIds: [],
      },
    ]);

    const { skills } = await import('./skills');

    expect(skills).toHaveLength(1);
  });

  test('throws when a skill has an unrecognised category', async () => {
    jest.doMock('./skills.json', () => [
      {
        id: 'bad-skill',
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
        id: 'bad-skill',
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
        id: 'bad-skill',
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
