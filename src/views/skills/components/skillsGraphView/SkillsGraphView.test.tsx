import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

import { SkillsGraphView } from './SkillsGraphView';

describe('SkillsGraphView', () => {
  test('renders the placeholder message', () => {
    const screen = render(<SkillsGraphView />);
    expect(screen.getByText('Chart coming soon')).toBeVisible();
  });

  test('has no axe violations', async () => {
    const screen = render(<SkillsGraphView />);
    expect(await axe(screen.container)).toHaveNoViolations();
  });
});
