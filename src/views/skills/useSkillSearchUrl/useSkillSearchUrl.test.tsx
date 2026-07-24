import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, useSearchParams } from 'react-router-dom';

import { useSkillSearchUrl } from './useSkillSearchUrl';

const wrapper = (initialEntries: string[]) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
  );

  return Wrapper;
};

const parseString = (raw: string | null): string => raw ?? '';
const serializeString = (value: string): string | null => (value !== '' ? value : null);
const parseList = (raw: string | null): string[] =>
  raw !== null && raw.length > 0 ? raw.split(',') : [];
const serializeList = (value: string[]): string | null =>
  value.length > 0 ? value.join(',') : null;

describe('useSkillSearchUrl', () => {
  test('parses the initial value from an existing URL param', () => {
    const { result } = renderHook(() => useSkillSearchUrl('term', parseString, serializeString), {
      wrapper: wrapper(['/skills?term=react']),
    });

    expect(result.current[0]).toBe('react');
  });

  test('defaults to the parser output when the param is absent', () => {
    const { result } = renderHook(() => useSkillSearchUrl('term', parseString, serializeString), {
      wrapper: wrapper(['/skills']),
    });

    expect(result.current[0]).toBe('');
  });

  test('setting a value writes it to the URL param', () => {
    const { result } = renderHook(
      () => {
        const [value, setValue] = useSkillSearchUrl('term', parseString, serializeString);
        const [searchParams] = useSearchParams();

        return { value, setValue, searchParams };
      },
      { wrapper: wrapper(['/skills']) }
    );

    act(() => {
      result.current.setValue('typescript');
    });

    expect(result.current.searchParams.get('term')).toBe('typescript');
    expect(result.current.value).toBe('typescript');
  });

  test('serialize returning null deletes the param', () => {
    const { result } = renderHook(
      () => {
        const [value, setValue] = useSkillSearchUrl('term', parseString, serializeString);
        const [searchParams] = useSearchParams();

        return { value, setValue, searchParams };
      },
      { wrapper: wrapper(['/skills?term=react']) }
    );

    act(() => {
      result.current.setValue('');
    });

    expect(result.current.searchParams.has('term')).toBe(false);
  });

  test('value keeps the same reference when an unrelated param changes', () => {
    const { result } = renderHook(
      () => {
        const [value] = useSkillSearchUrl('skill', parseList, serializeList);
        const [, setSearchParams] = useSearchParams();

        return { value, setSearchParams };
      },
      { wrapper: wrapper(['/skills?skill=react']) }
    );

    const firstValue = result.current.value;

    act(() => {
      result.current.setSearchParams((previous) => {
        const next = new URLSearchParams(previous);

        next.set('view', 'list');

        return next;
      });
    });

    expect(result.current.value).toBe(firstValue);
  });
});
