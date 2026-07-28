import { Track } from '@/testing';

import { deriveTrackDiff } from './deriveTrackDiff';

const trackA = new Track()
  .id('general')
  .categories([
    {
      id: 'frontend',
      name: 'Frontend',
      subCategories: [{ id: 'core', name: 'Core', skillIds: ['react', 'typescript'] }],
    },
    {
      id: 'backend',
      name: 'Backend',
      subCategories: [{ id: 'server', name: 'Server', skillIds: ['node'] }],
    },
  ])
  .mock();

const trackB = new Track()
  .id('lead')
  .categories([
    {
      id: 'frontend',
      name: 'Frontend',
      subCategories: [{ id: 'core', name: 'Core', skillIds: ['react'] }],
    },
    {
      id: 'leadership',
      name: 'Leadership',
      subCategories: [{ id: 'management', name: 'Management', skillIds: ['typescript', 'python'] }],
    },
  ])
  .mock();

describe('deriveTrackDiff', () => {
  test('marks a skill present only in trackA as only-a', () => {
    const result = deriveTrackDiff(trackA, trackB);

    expect(result.get('node')).toBe('only-a');
  });

  test('marks a skill present only in trackB as only-b', () => {
    const result = deriveTrackDiff(trackA, trackB);

    expect(result.get('python')).toBe('only-b');
  });

  test('marks a skill in both tracks in the same category as both-same-category', () => {
    const result = deriveTrackDiff(trackA, trackB);

    expect(result.get('react')).toBe('both-same-category');
  });

  test('marks a skill in both tracks but in different categories as both-moved', () => {
    const result = deriveTrackDiff(trackA, trackB);

    // typescript: frontend in trackA, leadership in trackB
    expect(result.get('typescript')).toBe('both-moved');
  });

  test('returns an empty map for two empty tracks', () => {
    const emptyA = new Track().id('general').categories([]).mock();
    const emptyB = new Track().id('lead').categories([]).mock();

    const result = deriveTrackDiff(emptyA, emptyB);

    expect(result.size).toBe(0);
  });

  test('returns only-a entries when trackB has no skills', () => {
    const emptyB = new Track().id('lead').categories([]).mock();

    const result = deriveTrackDiff(trackA, emptyB);

    expect(result.get('react')).toBe('only-a');
    expect(result.get('typescript')).toBe('only-a');
    expect(result.get('node')).toBe('only-a');
    expect(result.size).toBe(3);
  });

  test('returns only-b entries when trackA has no skills', () => {
    const emptyA = new Track().id('general').categories([]).mock();

    const result = deriveTrackDiff(emptyA, trackB);

    expect(result.get('react')).toBe('only-b');
    expect(result.get('typescript')).toBe('only-b');
    expect(result.get('python')).toBe('only-b');
    expect(result.size).toBe(3);
  });
});
