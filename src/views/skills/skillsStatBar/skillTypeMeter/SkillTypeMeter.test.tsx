import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

import { SkillTypeMeter } from './SkillTypeMeter';

describe('SkillTypeMeter', () => {
  test('renders the correct aria-label for a mixed split', async () => {
    const split = { techCount: 2, skillCount: 1, techPct: 66.7 };

    const screen = render(<SkillTypeMeter split={split} />);

    expect(screen.getByRole('img', { name: '66.7% technical, 33.3% non-technical' })).toBeVisible();
    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('renders nothing when total skill count is zero', () => {
    const split = { techCount: 0, skillCount: 0, techPct: 0 };

    const screen = render(<SkillTypeMeter split={split} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
