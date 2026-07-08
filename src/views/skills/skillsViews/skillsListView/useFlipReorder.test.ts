import { renderHook } from '@testing-library/react';

import { useFlipReorder } from './useFlipReorder';

describe('useFlipReorder', () => {
  test('does not animate the first time it measures a position', () => {
    const { result, rerender } = renderHook(() => useFlipReorder<HTMLDivElement>(false));
    const element = document.createElement('div');

    result.current.current = element;
    jest.spyOn(element, 'getBoundingClientRect').mockReturnValue({ top: 0 } as DOMRect);

    rerender();

    expect(element.style.transform).toBe('');
    expect(element.style.transition).toBe('');
  });

  test('animates the transform back to none when the element moves position', () => {
    const { result, rerender } = renderHook(() => useFlipReorder<HTMLDivElement>(false));
    const element = document.createElement('div');

    result.current.current = element;
    const rect = jest.spyOn(element, 'getBoundingClientRect');

    rect.mockReturnValue({ top: 0 } as DOMRect);
    rerender();

    rect.mockReturnValue({ top: 100 } as DOMRect);
    rerender();

    expect(element.style.transform).toBe('');
    expect(element.style.transition).toBe('transform 400ms ease');
  });

  test('does not animate when the position is unchanged', () => {
    const { result, rerender } = renderHook(() => useFlipReorder<HTMLDivElement>(false));
    const element = document.createElement('div');

    result.current.current = element;
    jest.spyOn(element, 'getBoundingClientRect').mockReturnValue({ top: 0 } as DOMRect);

    rerender();
    rerender();

    expect(element.style.transition).toBe('');
  });

  test('does not animate when the user prefers reduced motion', () => {
    const { result, rerender } = renderHook(() => useFlipReorder<HTMLDivElement>(true));
    const element = document.createElement('div');

    result.current.current = element;
    const rect = jest.spyOn(element, 'getBoundingClientRect');

    rect.mockReturnValue({ top: 0 } as DOMRect);
    rerender();
    rect.mockReturnValue({ top: 100 } as DOMRect);
    rerender();

    expect(element.style.transform).toBe('');
    expect(element.style.transition).toBe('');
  });
});
