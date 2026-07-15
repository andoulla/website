import type { Track } from '@/types';

export const defaultTrack: Track = {
  id: 'general',
  label: 'Full',
  categories: [
    {
      id: 'frontend-development',
      name: 'Frontend Development',
      subCategories: [{ id: 'core-technologies', name: 'Core Technologies', skillIds: ['react'] }],
    },
    {
      id: 'backend-development',
      name: 'Backend Development',
      subCategories: [{ id: 'server-side', name: 'Server-Side', skillIds: [] }],
    },
  ],
};
