// Stable partition: matches keep their relative order and float above non-matches, which also
// keep their relative order. When nothing (or everything) matches, this is a no-op ordering.
export const sortMatchesFirst = <T>(items: T[], isMatch: (item: T) => boolean): T[] =>
  [...items].sort((a, b) => Number(!isMatch(a)) - Number(!isMatch(b)));
