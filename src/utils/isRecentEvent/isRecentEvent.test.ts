import { TimelineEvent } from '@/testing';

import { isRecentEvent } from './isRecentEvent';

const now = new Date('2026-07-17');

describe('isRecentEvent', () => {
  test('an ongoing role is recent', () => {
    expect(isRecentEvent(new TimelineEvent().endDate(null).mock(), now)).toBe(true);
  });

  test('a role that ended within the last decade is recent', () => {
    expect(isRecentEvent(new TimelineEvent().endDate('2020-06-30').mock(), now)).toBe(true);
  });

  test('a role that ended exactly a decade ago is still recent', () => {
    expect(isRecentEvent(new TimelineEvent().endDate('2016-07-17').mock(), now)).toBe(true);
  });

  test('a role that ended more than a decade ago is not recent', () => {
    expect(isRecentEvent(new TimelineEvent().endDate('2016-07-16').mock(), now)).toBe(false);
  });
});
