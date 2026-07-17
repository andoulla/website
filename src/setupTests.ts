import { TextDecoder, TextEncoder } from 'node:util';

import '@testing-library/jest-dom';
import 'jest-axe/extend-expect';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// jsdom does not implement fetch, and Jest's sandboxed context can't reach Node's own
// global fetch either — stub it so jest.spyOn(global, 'fetch') has something to attach to.
// Tests that touch network code always mock this; nothing depends on a real implementation.
global.fetch = (): Promise<Response> => {
  throw new Error('global.fetch is not implemented in tests — mock it with jest.spyOn.');
};

// Persisted preferences (e.g. theme) must not leak between tests.
beforeEach(() => {
  window.localStorage.clear();
});

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

global.IntersectionObserver = class IntersectionObserver {
  constructor(private readonly callback: IntersectionObserverCallback) {}

  // Fires synchronously with isIntersecting: true so components render visible by default.
  observe = (target: Element) => {
    this.callback([{ isIntersecting: true, target } as IntersectionObserverEntry], this as never);
  };

  unobserve = () => {};
  disconnect = () => {};
  takeRecords = (): IntersectionObserverEntry[] => [];
  root = null;
  rootMargin = '';
  thresholds: ReadonlyArray<number> = [];
} as unknown as typeof IntersectionObserver;

// jsdom does not implement matchMedia; default to "no preference" so
// prefers-reduced-motion checks don't throw and animations render normally in tests.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// jsdom does not implement scrollIntoView
window.HTMLElement.prototype.scrollIntoView = jest.fn();
