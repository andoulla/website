import { TimelineEvent } from '@/testing';

import { compareByRecency } from './compareByRecency';

describe('compareByRecency', () => {
  test('returns negative when both are current and a has a later startDate', () => {
    const a = new TimelineEvent().startDate('2022-01-01').endDate(null).mock();
    const b = new TimelineEvent().startDate('2021-01-01').endDate(null).mock();

    expect(compareByRecency(a, b)).toBeLessThan(0);
  });

  test('returns negative when a has a later startDate than b (both past)', () => {
    const a = new TimelineEvent().startDate('2022-01-01').endDate('2023-01-01').mock();
    const b = new TimelineEvent().startDate('2020-01-01').endDate('2021-01-01').mock();

    expect(compareByRecency(a, b)).toBeLessThan(0);
  });

  test('returns positive when b has a later startDate than a (both past)', () => {
    const a = new TimelineEvent().startDate('2020-01-01').endDate('2021-01-01').mock();
    const b = new TimelineEvent().startDate('2022-01-01').endDate('2023-01-01').mock();

    expect(compareByRecency(a, b)).toBeGreaterThan(0);
  });

  test('returns negative when a is current and b is past', () => {
    const a = new TimelineEvent().startDate('2020-01-01').endDate(null).mock();
    const b = new TimelineEvent().startDate('2022-01-01').endDate('2023-01-01').mock();

    expect(compareByRecency(a, b)).toBeLessThan(0);
  });

  test('returns positive when b is current and a is past', () => {
    const a = new TimelineEvent().startDate('2022-01-01').endDate('2023-01-01').mock();
    const b = new TimelineEvent().startDate('2020-01-01').endDate(null).mock();

    expect(compareByRecency(a, b)).toBeGreaterThan(0);
  });
});
