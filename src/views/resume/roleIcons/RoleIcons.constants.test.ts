import { ROLE_ICONS, pickRandomRoleIcon } from './RoleIcons.constants';

describe('pickRandomRoleIcon', () => {
  test('always returns an icon from the pool', () => {
    for (let i = 0; i < 20; i++) {
      expect(ROLE_ICONS).toContain(pickRandomRoleIcon());
    }
  });
});
