import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useSearchParams } from 'react-router-dom';

import { TrackContextProvider, useTrackContext } from './TrackContextProvider';

const TrackProbe = () => {
  const { track, trackId, setTrackId } = useTrackContext();
  const [searchParams] = useSearchParams();

  return (
    <>
      <span>{`Track id: ${trackId}`}</span>
      <span>{`Track label: ${track.label}`}</span>
      <span>{`Search: ${searchParams.toString()}`}</span>
      <button onClick={() => setTrackId('em')}>Switch to EM</button>
    </>
  );
};

const renderWithRouter = (initialEntry: string) =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <TrackContextProvider>
        <TrackProbe />
      </TrackContextProvider>
    </MemoryRouter>
  );

describe('TrackContextProvider', () => {
  test('defaults to the full track and normalises the missing param', () => {
    const screen = renderWithRouter('/');

    expect(screen.getByText('Track id: full')).toBeVisible();
    expect(screen.getByText('Track label: Full')).toBeVisible();
    expect(screen.getByText('Search: track=full')).toBeVisible();
  });

  test('normalises an invalid track param to full', () => {
    const screen = renderWithRouter('/?track=astronaut');

    expect(screen.getByText('Track id: full')).toBeVisible();
    expect(screen.getByText('Search: track=full')).toBeVisible();
  });

  test('keeps other query params when normalising', () => {
    const screen = renderWithRouter('/?skill=React');

    expect(screen.getByText('Search: skill=React&track=full')).toBeVisible();
  });

  test('provides the track named by a valid param', () => {
    const screen = renderWithRouter('/?track=em');

    expect(screen.getByText('Track id: em')).toBeVisible();
    expect(screen.getByText('Track label: EM / Lead')).toBeVisible();
    expect(screen.getByText('Search: track=em')).toBeVisible();
  });

  test('setTrackId switches the track and updates the url', async () => {
    const user = userEvent.setup();
    const screen = renderWithRouter('/?track=full');

    await user.click(screen.getByRole('button', { name: 'Switch to EM' }));

    expect(screen.getByText('Track id: em')).toBeVisible();
    expect(screen.getByText('Search: track=em')).toBeVisible();
  });

  test('throws when used outside a TrackContextProvider', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() =>
      render(
        <MemoryRouter>
          <TrackProbe />
        </MemoryRouter>
      )
    ).toThrow('useTrackContext must be used within a TrackContextProvider');

    consoleErrorSpy.mockRestore();
  });
});
