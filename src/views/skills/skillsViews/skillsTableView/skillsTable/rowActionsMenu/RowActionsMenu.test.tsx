import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { MemoryRouter } from 'react-router-dom';

import { TrackContextProvider } from '@/context/track';
import { SkillSummary } from '@/testing';

import { RowActionsMenu } from './RowActionsMenu';

const SKILL_NO_RECS = new SkillSummary().skill('React').recommendationIds([]).mock();

const SKILL_ONE_REC = new SkillSummary().skill('TypeScript').recommendationIds(['rec-1']).mock();

const SKILL_TWO_RECS = new SkillSummary()
  .skill('Jest')
  .recommendationIds(['rec-1', 'rec-2'])
  .mock();

const renderMenu = (props: Parameters<typeof RowActionsMenu>[0]) =>
  render(
    <MemoryRouter>
      <TrackContextProvider>
        <RowActionsMenu {...props} />
      </TrackContextProvider>
    </MemoryRouter>
  );

describe('RowActionsMenu', () => {
  test('opens the menu on button click', async () => {
    const user = userEvent.setup();
    const screen = renderMenu({ skill: SKILL_NO_RECS });

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'React links' }));

    expect(screen.getByRole('menu')).toBeVisible();
    expect(screen.getByRole('menuitem', { name: 'View on Resume' })).toBeVisible();
    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('closes the menu on menu item click', async () => {
    const user = userEvent.setup();
    const screen = renderMenu({ skill: SKILL_ONE_REC });

    await user.click(screen.getByRole('button', { name: 'TypeScript links' }));
    await user.click(screen.getByRole('menuitem', { name: 'View on Resume' }));

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  test('closes the menu on Escape', async () => {
    const user = userEvent.setup();
    const screen = renderMenu({ skill: SKILL_NO_RECS });

    await user.click(screen.getByRole('button', { name: 'React links' }));
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  test('closes the menu on recommendation item click', async () => {
    const user = userEvent.setup();
    const screen = renderMenu({ skill: SKILL_ONE_REC });

    await user.click(screen.getByRole('button', { name: 'TypeScript links' }));
    await user.click(screen.getByRole('menuitem', { name: 'Recommendation' }));

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  test('renders "View on Resume" menu item with correct href', async () => {
    const user = userEvent.setup();
    const screen = renderMenu({ skill: SKILL_NO_RECS });

    await user.click(screen.getByRole('button', { name: 'React links' }));

    const link = screen.getByRole('menuitem', { name: 'View on Resume' });

    expect(link).toHaveAttribute('href', '/?skill=React&track=general');
  });

  test('renders singular "Recommendation" label when skill has exactly one recommendation', async () => {
    const user = userEvent.setup();
    const screen = renderMenu({ skill: SKILL_ONE_REC });

    await user.click(screen.getByRole('button', { name: 'TypeScript links' }));

    expect(screen.getByRole('menuitem', { name: 'Recommendation' })).toBeVisible();
  });

  test('renders plural "Recommendation N" labels when skill has multiple recommendations', async () => {
    const user = userEvent.setup();
    const screen = renderMenu({ skill: SKILL_TWO_RECS });

    await user.click(screen.getByRole('button', { name: 'Jest links' }));

    expect(screen.getByRole('menuitem', { name: 'Recommendation 1' })).toBeVisible();
    expect(screen.getByRole('menuitem', { name: 'Recommendation 2' })).toBeVisible();
  });

  test('renders recommendation menu items with correct href', async () => {
    const user = userEvent.setup();
    const screen = renderMenu({ skill: SKILL_ONE_REC });

    await user.click(screen.getByRole('button', { name: 'TypeScript links' }));

    const link = screen.getByRole('menuitem', { name: 'Recommendation' });

    expect(link).toHaveAttribute('href', '/?recommendation=rec-1&track=general');
  });
});
