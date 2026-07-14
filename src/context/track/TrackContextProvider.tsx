import { createContext, use, useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { isTrackId, tracks } from '@/data/tracks';
import type { TrackId } from '@/types';

import { DEFAULT_TRACK_ID, TRACK_PARAM } from './TrackContextProvider.constants';
import type { TrackContextProviderProps, TrackContextValue } from './TrackContextProvider.type';

const TrackContext = createContext<TrackContextValue | null>(null);

export const useTrackContext = (): TrackContextValue => {
  const ctx = use(TrackContext);
  if (ctx === null) {
    throw new Error('useTrackContext must be used within a TrackContextProvider');
  }
  return ctx;
};

export const TrackContextProvider = ({ children }: TrackContextProviderProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const rawTrackId = searchParams.get(TRACK_PARAM);
  const hasValidTrackParam = rawTrackId !== null && isTrackId(rawTrackId);
  const trackId = hasValidTrackParam ? rawTrackId : DEFAULT_TRACK_ID;

  // ?track= is always present — one canonical URL shape. Normalise a missing or invalid param
  // to the default without adding a history entry.
  useEffect(() => {
    if (!hasValidTrackParam) {
      setSearchParams(
        (params) => {
          const nextParams = new URLSearchParams(params);
          nextParams.set(TRACK_PARAM, DEFAULT_TRACK_ID);
          return nextParams;
        },
        { replace: true }
      );
    }
  }, [hasValidTrackParam, setSearchParams]);

  const setTrackId = useCallback(
    (next: TrackId) => {
      if (next === trackId) {
        return;
      }
      setSearchParams((params) => {
        const nextParams = new URLSearchParams(params);
        nextParams.set(TRACK_PARAM, next);
        return nextParams;
      });
    },
    [setSearchParams, trackId]
  );

  const track = useMemo(() => {
    const activeTrack = tracks.find((candidate) => candidate.id === trackId);
    if (activeTrack === undefined) {
      throw new Error(`No track data for id "${trackId}"`);
    }
    return activeTrack;
  }, [trackId]);

  const contextValue = useMemo(
    () => ({ track, trackId, setTrackId }),
    [track, trackId, setTrackId]
  );

  return <TrackContext value={contextValue}>{children}</TrackContext>;
};
