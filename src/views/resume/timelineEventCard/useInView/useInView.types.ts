export interface UseInViewOptions {
  threshold?: number;
  rootMargin?: string;
}

export interface UseInViewResult<T extends Element> {
  ref: (node: T | null) => (() => void) | void;
  isInView: boolean;
}
