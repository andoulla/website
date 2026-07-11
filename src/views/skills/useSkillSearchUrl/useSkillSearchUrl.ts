import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { reorderFilterParams } from '../Skills.helpers';

export const useSkillSearchUrl = <T>(
  key: string,
  parse: (raw: string | null) => T,
  serialize: (value: T) => string | null
): [T, (next: T) => void] => {
  const [searchParams, setSearchParams] = useSearchParams();
  const raw = searchParams.get(key);
  const value = useMemo(() => parse(raw), [raw, parse]);

  const setValue = useCallback(
    (next: T) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          const nextRaw = serialize(next);
          if (nextRaw !== null) {
            params.set(key, nextRaw);
          } else {
            params.delete(key);
          }
          return reorderFilterParams(params);
        },
        { replace: true }
      );
    },
    [key, serialize, setSearchParams]
  );

  return [value, setValue];
};
