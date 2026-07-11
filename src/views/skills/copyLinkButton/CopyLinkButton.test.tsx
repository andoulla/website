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

  test('shows a failed state when the clipboard write rejects', async () => {
    const user = userEvent.setup();
    const writeText = jest.fn().mockRejectedValue(new Error('denied'));

    mockClipboard(writeText);
    const screen = renderCopyLinkButton();

    await user.click(screen.getByRole('button', { name: 'Copy filtered link' }));

    expect(await screen.findByRole('button', { name: "Couldn't copy link" })).toBeVisible();
  });

  test('restarts the reset timer on a second click within the reset window', async () => {
    const user = userEvent.setup();
    const writeText = jest.fn().mockResolvedValue(undefined);
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

    mockClipboard(writeText);
    const screen = renderCopyLinkButton();

    await user.click(screen.getByRole('button', { name: 'Copy filtered link' }));
    expect(await screen.findByRole('button', { name: 'Link copied' })).toBeVisible();

    clearTimeoutSpy.mockClear();
    await user.click(screen.getByRole('button', { name: 'Link copied' }));
    await act(async () => {
      await Promise.resolve();
    });

    // Proves the reset effect re-ran instead of being skipped on a repeated 'copied' status.
    expect(clearTimeoutSpy).toHaveBeenCalled();

    clearTimeoutSpy.mockRestore();
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
