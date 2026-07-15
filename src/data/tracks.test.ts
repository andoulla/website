import { Skill, Track } from '../testing';

describe('tracks', () => {
  afterEach(() => {
    jest.resetModules();
    jest.dontMock('./skills');
    jest.dontMock('./tracks/lead.json');
    jest.dontMock('./tracks/senior-engineer.json');
    jest.dontMock('./tracks/full.json');
  });

  const mockSkills = (ids: string[]) => {
    jest.doMock('./skills', () => ({
      skills: ids.map((id) => new Skill().id(id).name(id).mock()),
    }));
  };

  const mockValidTrackFiles = () => {
    jest.doMock('./tracks/lead.json', () =>
      new Track().id('lead').label('Lead / Engineering Manager').mock()
    );
    jest.doMock('./tracks/senior-engineer.json', () =>
      new Track().id('senior-engineer').label('Senior Engineer').mock()
    );
    jest.doMock('./tracks/full.json', () => new Track().mock());
  };

  test('exposes the three tracks in tab display order', async () => {
    mockSkills(['react']);
    mockValidTrackFiles();

    const { tracks, TRACK_IDS } = await import('./tracks');

    expect(tracks.map((track) => track.id)).toEqual(['full', 'lead', 'senior-engineer']);
    expect(tracks[0]).toEqual(new Track().mock());
    expect(TRACK_IDS).toEqual(['full', 'lead', 'senior-engineer']);
  });

  test('throws when a track file has an unrecognised id', async () => {
    mockSkills(['react']);
    mockValidTrackFiles();
    jest.doMock('./tracks/lead.json', () => ({
      id: 'engineering-manager',
      label: 'Lead / Engineering Manager',
      categories: [],
    }));

    await expect(import('./tracks')).rejects.toThrow(
      'tracks/lead.json: unrecognised track id "engineering-manager"'
    );
  });

  test('throws when two track files share an id', async () => {
    mockSkills(['react']);
    mockValidTrackFiles();
    jest.doMock('./tracks/lead.json', () =>
      new Track().id('full').label('Lead / Engineering Manager').mock()
    );

    await expect(import('./tracks')).rejects.toThrow('tracks: duplicate track id "full"');
  });

  test('throws when a track repeats a category id', async () => {
    mockSkills(['react']);
    mockValidTrackFiles();
    jest.doMock('./tracks/lead.json', () => ({
      id: 'lead',
      label: 'Lead / Engineering Manager',
      categories: [
        { id: 'delivery', name: 'Delivery', subCategories: [] },
        { id: 'delivery', name: 'Delivery Again', subCategories: [] },
      ],
    }));

    await expect(import('./tracks')).rejects.toThrow(
      'tracks/lead.json: duplicate category id "delivery"'
    );
  });

  test('throws when a track repeats a subCategory id across categories', async () => {
    mockSkills(['react']);
    mockValidTrackFiles();
    jest.doMock('./tracks/lead.json', () => ({
      id: 'lead',
      label: 'Lead / Engineering Manager',
      categories: [
        {
          id: 'frontend',
          name: 'Frontend',
          subCategories: [{ id: 'testing', name: 'Testing', skillIds: [] }],
        },
        {
          id: 'backend',
          name: 'Backend',
          subCategories: [{ id: 'testing', name: 'Testing', skillIds: [] }],
        },
      ],
    }));

    await expect(import('./tracks')).rejects.toThrow(
      'tracks/lead.json: duplicate subCategory id "testing"'
    );
  });

  test('throws when a track references an unknown skillId', async () => {
    mockSkills(['react']);
    mockValidTrackFiles();
    jest.doMock('./tracks/lead.json', () => ({
      id: 'lead',
      label: 'Lead / Engineering Manager',
      categories: [
        {
          id: 'frontend',
          name: 'Frontend',
          subCategories: [{ id: 'core', name: 'Core', skillIds: ['vue'] }],
        },
      ],
    }));

    await expect(import('./tracks')).rejects.toThrow(
      'tracks/lead.json: unknown skillId "vue" in subCategory "core"'
    );
  });

  test('throws when a skillId appears twice within one track', async () => {
    mockSkills(['react']);
    mockValidTrackFiles();
    jest.doMock('./tracks/lead.json', () => ({
      id: 'lead',
      label: 'Lead / Engineering Manager',
      categories: [
        {
          id: 'frontend',
          name: 'Frontend',
          subCategories: [
            { id: 'core', name: 'Core', skillIds: ['react'] },
            { id: 'ecosystem', name: 'Ecosystem', skillIds: ['react'] },
          ],
        },
      ],
    }));

    await expect(import('./tracks')).rejects.toThrow(
      'tracks/lead.json: skillId "react" appears more than once'
    );
  });

  test('throws when the full track misses a skill', async () => {
    mockSkills(['react', 'nodejs']);
    mockValidTrackFiles();

    await expect(import('./tracks')).rejects.toThrow(
      'tracks/full.json: skill "nodejs" missing from the full track'
    );
  });
});
