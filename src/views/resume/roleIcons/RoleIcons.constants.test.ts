import { careerHistory } from '@/data/careerHistory';

import { LOGO_BY_EVENT_ID, ROLE_ICONS, pickRandomRoleIcon } from './RoleIcons.constants';

describe('pickRandomRoleIcon', () => {
  test('always returns an icon from the pool', () => {
    for (let i = 0; i < 20; i++) {
      expect(ROLE_ICONS).toContain(pickRandomRoleIcon());
    }
  });
});

describe('LOGO_BY_EVENT_ID', () => {
  test('every key matches a real careerHistory event id', () => {
    const eventIds = careerHistory.map((event) => event.id);

    Object.keys(LOGO_BY_EVENT_ID).forEach((eventId) => {
      expect(eventIds).toContain(eventId);
    });
  });
});
