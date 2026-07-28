import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, useSearchParams } from 'react-router-dom';

import { SkillSummary, Track } from '@/testing';

import { useSkillsPageState } from './useSkillsPageState';

const TRACK = new Track().mock();
const SKILLS = [new SkillSummary().skill('React').subCategoryId('core-technologies').mock()];

const wrapper = (initialEntries: string[]) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
  );

  return Wrapper;
};

describe('useSkillsPageState', () => {
  test('returns empty state when no URL params are present', () => {
    const { result } = renderHook(() => useSkillsPageState(TRACK, SKILLS), {
      wrapper: wrapper(['/skills']),
    });

    expect(result.current.highlightedSkills).toEqual([]);
    expect(result.current.selectedCategories).toEqual([]);
    expect(result.current.selectedSubCategories).toEqual([]);
  });

  test('parses selectedCategories from the URL', () => {
    const { result } = renderHook(() => useSkillsPageState(TRACK, SKILLS), {
      wrapper: wrapper(['/skills?category=frontend-development']),
    });

    expect(result.current.selectedCategories).toEqual(['frontend-development']);
  });

  test('parses selectedSubCategories from the URL', () => {
    const { result } = renderHook(() => useSkillsPageState(TRACK, SKILLS), {
      wrapper: wrapper(['/skills?subCategory=core-technologies']),
    });

    expect(result.current.selectedSubCategories).toEqual(['core-technologies']);
  });

  test('setting categories writes the param to the URL and clears it when empty', () => {
    const { result } = renderHook(
      () => {
        const state = useSkillsPageState(TRACK, SKILLS);
        const [searchParams] = useSearchParams();

        return { ...state, searchParams };
      },
      { wrapper: wrapper(['/skills']) }
    );

    act(() => {
      result.current.setSelectedCategories(['frontend-development']);
    });

    expect(result.current.searchParams.get('category')).toBe('frontend-development');
    expect(result.current.selectedCategories).toEqual(['frontend-development']);

    act(() => {
      result.current.setSelectedCategories([]);
    });

    expect(result.current.searchParams.has('category')).toBe(false);
  });

  test('setting sub-categories writes the param to the URL and clears it when empty', () => {
    const { result } = renderHook(
      () => {
        const state = useSkillsPageState(TRACK, SKILLS);
        const [searchParams] = useSearchParams();

        return { ...state, searchParams };
      },
      { wrapper: wrapper(['/skills']) }
    );

    act(() => {
      result.current.setSelectedSubCategories(['core-technologies']);
    });

    expect(result.current.searchParams.get('subCategory')).toBe('core-technologies');

    act(() => {
      result.current.setSelectedSubCategories([]);
    });

    expect(result.current.searchParams.has('subCategory')).toBe(false);
  });

  test('derives subCategoriesByCategory for categories that have matching skills', () => {
    const { result } = renderHook(() => useSkillsPageState(TRACK, SKILLS), {
      wrapper: wrapper(['/skills']),
    });

    expect(result.current.subCategoriesByCategory).toEqual({
      'frontend-development': [{ id: 'core-technologies', name: 'Core Technologies' }],
    });
  });

  test('drops unknown category ids from URL on track switch', () => {
    const { result } = renderHook(() => useSkillsPageState(TRACK, SKILLS), {
      wrapper: wrapper(['/skills?category=unknown-category']),
    });

    expect(result.current.selectedCategories).toEqual([]);
  });
});
