import type { Track } from '@/types';

export const defaultTrack: Track = {
  id: 'full',
  label: 'Full',
  categories: [
    {
      id: 'frontend-development',
      name: 'Frontend Development',
      subCategories: [{ id: 'core-technologies', name: 'Core Technologies', skillIds: ['react'] }],
    },
  ],
};
