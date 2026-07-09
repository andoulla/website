import { act, renderHook } from '@testing-library/react';

import { useInView } from './useInView';

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];

  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
  takeRecords = (): IntersectionObserverEntry[] => [];
  root = null;
  rootMargin = '';
  thresholds: ReadonlyArray<number> = [];

  constructor(
    public callback: IntersectionObserverCallback,
    public options?: IntersectionObserverInit
  ) {
    MockIntersectionObserver.instances.push(this);
  }
}

const originalIntersectionObserver = global.IntersectionObserver;

beforeEach(() => {
  MockIntersectionObserver.instances = [];
  global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
});

afterEach(() => {
  global.IntersectionObserver = originalIntersectionObserver;
});

describe('useInView', () => {
  test('starts out of view before the observer reports an intersection', () => {
    const { result } = renderHook(() => useInView<HTMLDivElement>());

    expect(result.current.isInView).toBe(false);
  });

  test('starts in view when initialInView is true', () => {
    const { result } = renderHook(() => useInView<HTMLDivElement>({ initialInView: true }));

    expect(result.current.isInView).toBe(true);
  });

  test('does not create an observer when the ref is detached', () => {
    const { result } = renderHook(() => useInView<HTMLDivElement>());

    act(() => {
      result.current.ref(null);
    });

    expect(MockIntersectionObserver.instances).toHaveLength(0);
  });

  test('toggles isInView to true when the element intersects', () => {
    const { result } = renderHook(() => useInView<HTMLDivElement>());
    const node = document.createElement('div');

    act(() => {
      result.current.ref(node);
    });

    const [observer] = MockIntersectionObserver.instances;

    expect(observer.observe).toHaveBeenCalledWith(node);

    act(() => {
      observer.callback([{ isIntersecting: true } as IntersectionObserverEntry], observer as never);
    });

    expect(result.current.isInView).toBe(true);
  });

  test('toggles isInView back to false when the element leaves the viewport', () => {
    const { result } = renderHook(() => useInView<HTMLDivElement>());
    const node = document.createElement('div');

    act(() => {
      result.current.ref(node);
    });

    const [observer] = MockIntersectionObserver.instances;

    act(() => {
      observer.callback([{ isIntersecting: true } as IntersectionObserverEntry], observer as never);
    });
    act(() => {
      observer.callback(
        [{ isIntersecting: false } as IntersectionObserverEntry],
        observer as never
      );
    });

    expect(result.current.isInView).toBe(false);
  });

  test('disconnects the observer when the ref cleanup runs', () => {
    const { result } = renderHook(() => useInView<HTMLDivElement>());
    const node = document.createElement('div');

    let cleanup: (() => void) | void;

    act(() => {
      cleanup = result.current.ref(node);
    });

    const [observer] = MockIntersectionObserver.instances;

    act(() => {
      cleanup?.();
    });

    expect(observer.disconnect).toHaveBeenCalledTimes(1);
  });

  test('passes threshold and rootMargin options through to the observer', () => {
    const { result } = renderHook(() =>
      useInView<HTMLDivElement>({ threshold: 0.5, rootMargin: '-10px' })
    );
    const node = document.createElement('div');

    act(() => {
      result.current.ref(node);
    });

    const [observer] = MockIntersectionObserver.instances;

    expect(observer.options).toEqual({ threshold: 0.5, rootMargin: '-10px' });
  });
});
