import type { ReactNode } from 'react';

import type { Track, TrackId } from '@/types';

export interface TrackContextValue {
  track: Track;
  trackId: TrackId;
  setTrackId: (next: TrackId) => void;
}

export interface TrackContextProviderProps {
  children: ReactNode;
}
