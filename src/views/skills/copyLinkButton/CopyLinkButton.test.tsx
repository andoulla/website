import { act, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { MemoryRouter } from 'react-router-dom';

import { CopyLinkButton } from './CopyLinkButton';

const renderCopyLinkButton = () =>
  render(
    <MemoryRouter initialEntries={[{ pathname: '/skills', search: '?category=engineering' }]}>
      <CopyLinkButton />
    </MemoryRouter>
  );

// `userEvent.setup()` installs its own clipboard stub, so it must run before this
// overrides `navigator.clipboard` — otherwise userEvent's stub wins.
const mockClipboard = (writeText: jest.Mock) => {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
  });
};

describe('CopyLinkButton', () => {
  test('renders with no axe violations', async () => {
    const screen = renderCopyLinkButton();

    expect(screen.getByRole('button', { name: 'Copy filtered link' })).toBeVisible();
    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('copies the current URL, including search params, to the clipboard on click', async () => {
    const user = userEvent.setup();
    const writeText = jest.fn().mockResolvedValue(undefined);

    mockClipboard(writeText);
    const screen = renderCopyLinkButton();

    await user.click(screen.getByRole('button', { name: 'Copy filtered link' }));

    expect(writeText).toHaveBeenCalledWith('http://localhost/skills?category=engineering');
  });

  test('swaps the icon and label to indicate the link was copied', async () => {
    const user = userEvent.setup();
    const writeText = jest.fn().mockResolvedValue(undefined);

    mockClipboard(writeText);
    const screen = renderCopyLinkButton();

    await user.click(screen.getByRole('button', { name: 'Copy filtered link' }));

    expect(await screen.findByRole('button', { name: 'Link copied' })).toBeVisible();
  });

  test('reverts to the copy label after the reset delay', async () => {
    jest.useFakeTimers({ advanceTimers: true });
    const user = userEvent.setup({ delay: null });
    const writeText = jest.fn().mockResolvedValue(undefined);

    mockClipboard(writeText);
    const screen = renderCopyLinkButton();

    await user.click(screen.getByRole('button', { name: 'Copy filtered link' }));
    expect(await screen.findByRole('button', { name: 'Link copied' })).toBeVisible();

    act(() => {
      jest.advanceTimersByTime(1500);
    });

    expect(await screen.findByRole('button', { name: 'Copy filtered link' })).toBeVisible();

    jest.useRealTimers();
  });
});
