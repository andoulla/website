import { getCardMotionSx } from './TimelineEventCard.helpers';

describe('getCardMotionSx', () => {
  test('fades and slides up when the card is not in view', () => {
    const sx = getCardMotionSx(false, false);

    expect(sx).toMatchObject({ opacity: 0, transform: 'translateY(32px)' });
  });

  test('is fully visible and untransformed when the card is in view', () => {
    const sx = getCardMotionSx(true, false);

    expect(sx).toMatchObject({ opacity: 1, transform: 'translateY(0)' });
  });

  test('stays fully visible with no transform when reduced motion is preferred', () => {
    const sx = getCardMotionSx(false, true);

    expect(sx).toEqual({ opacity: 1 });
  });
});
