import { act, renderHook } from '@testing-library/react';

import { useCardExpand } from './useCardExpand';

describe('useCardExpand', () => {
  test('starts closed when defaultOpen is false', () => {
    const { result } = renderHook(() => useCardExpand(false));

    expect(result.current[0]).toBe(false);
  });

  test('starts open when defaultOpen is true', () => {
    const { result } = renderHook(() => useCardExpand(true));

    expect(result.current[0]).toBe(true);
  });

  test('user toggle to true overrides a false default', () => {
    const { result } = renderHook(() => useCardExpand(false));

    act(() => {
      result.current[1](true);
    });

    expect(result.current[0]).toBe(true);
  });

  test('user toggle to false overrides a true default', () => {
    const { result } = renderHook(() => useCardExpand(true));

    act(() => {
      result.current[1](false);
    });

    expect(result.current[0]).toBe(false);
  });

  test('user toggle persists when defaultOpen changes', () => {
    const { result, rerender } = renderHook(({ defaultOpen }) => useCardExpand(defaultOpen), {
      initialProps: { defaultOpen: false },
    });

    act(() => {
      result.current[1](true);
    });
    rerender({ defaultOpen: false });

    expect(result.current[0]).toBe(true);
  });
});
