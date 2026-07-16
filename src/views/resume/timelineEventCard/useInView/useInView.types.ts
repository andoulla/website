export interface UseInViewOptions {
  threshold?: number;
  rootMargin?: string;
  initialInView?: boolean;
  // Skips the observer entirely and pins isInView to true — for elements that should never fade.
  disabled?: boolean;
}

export interface UseInViewResult<T extends Element> {
  ref: (node: T | null) => (() => void) | void;
  isInView: boolean;
}
