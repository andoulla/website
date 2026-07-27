import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { MemoryRouter } from 'react-router-dom';

import { TrackContextProvider } from '@/context/track';
import { SkillSummary } from '@/testing';

import { RowActionsMenu } from './RowActionsMenu';

const SKILL = new SkillSummary().skill('React').recommendationIds([]).mock();

const renderMenu = (props: Parameters<typeof RowActionsMenu>[0]) =>
  render(
    <MemoryRouter>
      <TrackContextProvider>
        <RowActionsMenu {...props} />
      </TrackContextProvider>
    </MemoryRouter>
  );

describe('RowActionsMenu', () => {
  test('opens the menu on button click and shows View on Resume', async () => {
    const user = userEvent.setup();
    const screen = renderMenu({ skill: SKILL });

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'React links' }));

    expect(screen.getByRole('menu')).toBeVisible();
    expect(screen.getByRole('menuitem', { name: 'View on Resume' })).toBeVisible();
    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('closes the menu when the View on Resume item is clicked', async () => {
    const user = userEvent.setup();
    const screen = renderMenu({ skill: SKILL });

    await user.click(screen.getByRole('button', { name: 'React links' }));
    await user.click(screen.getByRole('menuitem', { name: 'View on Resume' }));

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  test('closes the menu on Escape', async () => {
    const user = userEvent.setup();
    const screen = renderMenu({ skill: SKILL });

    await user.click(screen.getByRole('button', { name: 'React links' }));
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  test('renders the View on Resume menu item with the correct href', async () => {
    const user = userEvent.setup();
    const screen = renderMenu({ skill: SKILL });

    await user.click(screen.getByRole('button', { name: 'React links' }));

    const link = screen.getByRole('menuitem', { name: 'View on Resume' });

    expect(link).toHaveAttribute('href', '/?skill=React&track=general');
  });
});
