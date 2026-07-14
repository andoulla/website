import { Skill, Track } from '../testing';

describe('tracks', () => {
  afterEach(() => {
    jest.resetModules();
    jest.dontMock('./skills');
    jest.dontMock('./tracks/em.json');
    jest.dontMock('./tracks/senior-swe.json');
    jest.dontMock('./tracks/full.json');
  });

  const mockSkills = (ids: string[]) => {
    jest.doMock('./skills', () => ({
      skills: ids.map((id) => new Skill().id(id).name(id).mock()),
    }));
  };

  const mockValidTrackFiles = () => {
    jest.doMock('./tracks/em.json', () => new Track().id('em').label('EM / Lead').mock());
    jest.doMock('./tracks/senior-swe.json', () =>
      new Track().id('senior-swe').label('Senior SWE').mock()
    );
    jest.doMock('./tracks/full.json', () => new Track().mock());
  };

  test('exposes the three tracks in tab display order', async () => {
    mockSkills(['react']);
    mockValidTrackFiles();

    const { tracks, TRACK_IDS, isTrackId } = await import('./tracks');

    expect(tracks.map((track) => track.id)).toEqual(['em', 'senior-swe', 'full']);
    expect(tracks[2]).toEqual(new Track().mock());
    expect(TRACK_IDS).toEqual(['em', 'senior-swe', 'full']);
    expect(isTrackId('em')).toBe(true);
    expect(isTrackId('engineering-manager')).toBe(false);
  });

  test('throws when a track file has an unrecognised id', async () => {
    mockSkills(['react']);
    mockValidTrackFiles();
    jest.doMock('./tracks/em.json', () => ({
      id: 'engineering-manager',
      label: 'EM / Lead',
      categories: [],
    }));

    await expect(import('./tracks')).rejects.toThrow(
      'tracks/em.json: unrecognised track id "engineering-manager"'
    );
  });

  test('throws when two track files share an id', async () => {
    mockSkills(['react']);
    mockValidTrackFiles();
    jest.doMock('./tracks/em.json', () => new Track().id('full').label('EM / Lead').mock());

    await expect(import('./tracks')).rejects.toThrow('tracks: duplicate track id "full"');
  });

  test('throws when a track has more categories than colour palette slots', async () => {
    mockSkills(['react']);
    mockValidTrackFiles();
    jest.doMock('./tracks/em.json', () => ({
      id: 'em',
      label: 'EM / Lead',
      categories: Array.from({ length: 8 }, (_, index) => ({
        id: `category-${index}`,
        name: `Category ${index}`,
        subCategories: [],
      })),
    }));

    await expect(import('./tracks')).rejects.toThrow(
      'tracks/em.json: 8 categories exceed the 7-colour palette'
    );
  });

  test('throws when a track repeats a category id', async () => {
    mockSkills(['react']);
    mockValidTrackFiles();
    jest.doMock('./tracks/em.json', () => ({
      id: 'em',
      label: 'EM / Lead',
      categories: [
        { id: 'delivery', name: 'Delivery', subCategories: [] },
        { id: 'delivery', name: 'Delivery Again', subCategories: [] },
      ],
    }));

    await expect(import('./tracks')).rejects.toThrow(
      'tracks/em.json: duplicate category id "delivery"'
    );
  });

  test('throws when a track repeats a subCategory id across categories', async () => {
    mockSkills(['react']);
    mockValidTrackFiles();
    jest.doMock('./tracks/em.json', () => ({
      id: 'em',
      label: 'EM / Lead',
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
      'tracks/em.json: duplicate subCategory id "testing"'
    );
  });

  test('throws when a track references an unknown skillId', async () => {
    mockSkills(['react']);
    mockValidTrackFiles();
    jest.doMock('./tracks/em.json', () => ({
      id: 'em',
      label: 'EM / Lead',
      categories: [
        {
          id: 'frontend',
          name: 'Frontend',
          subCategories: [{ id: 'core', name: 'Core', skillIds: ['vue'] }],
        },
      ],
    }));

    await expect(import('./tracks')).rejects.toThrow(
      'tracks/em.json: unknown skillId "vue" in subCategory "core"'
    );
  });

  test('throws when a skillId appears twice within one track', async () => {
    mockSkills(['react']);
    mockValidTrackFiles();
    jest.doMock('./tracks/em.json', () => ({
      id: 'em',
      label: 'EM / Lead',
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
      'tracks/em.json: skillId "react" appears more than once'
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
