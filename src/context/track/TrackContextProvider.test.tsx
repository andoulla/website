import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useNavigate, useSearchParams } from 'react-router-dom';

import type { TrackId } from '@/types';

import { TrackContextProvider, useTrackContext } from './TrackContextProvider';

const TrackProbe = () => {
  const { track, trackId, setTrackId } = useTrackContext();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  return (
    <>
      <span>{`Track id: ${trackId}`}</span>
      <span>{`Track label: ${track.label}`}</span>
      <span>{`Search: ${searchParams.toString()}`}</span>
      <button onClick={() => setTrackId('lead')}>Switch to Lead</button>
      <button
        onClick={() => {
          void navigate(-1);
        }}
      >
        Back
      </button>
    </>
  );
};

// Records setTrackId per render to assert identity stability.
const seenSetTrackIds: Array<(next: TrackId) => void> = [];

const SetTrackIdIdentityProbe = () => {
  const { setTrackId } = useTrackContext();
  const [, setSearchParams] = useSearchParams();

  seenSetTrackIds.push(setTrackId);

  return (
    <button
      onClick={() => {
        setSearchParams((params) => {
          const nextParams = new URLSearchParams(params);

          nextParams.set('view', 'list');

          return nextParams;
        });
      }}
    >
      Change view param
    </button>
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
  test('defaults to the general track and normalises the missing param', () => {
    const screen = renderWithRouter('/');

    expect(screen.getByText('Track id: general')).toBeVisible();
    expect(screen.getByText('Track label: General')).toBeVisible();
    expect(screen.getByText('Search: track=general')).toBeVisible();
  });

  test('normalises an invalid track param to general', () => {
    const screen = renderWithRouter('/?track=astronaut');

    expect(screen.getByText('Track id: general')).toBeVisible();
    expect(screen.getByText('Search: track=general')).toBeVisible();
  });

  test('keeps other query params when normalising', () => {
    const screen = renderWithRouter('/?skill=React');

    expect(screen.getByText('Search: skill=React&track=general')).toBeVisible();
  });

  test('provides the track named by a valid param', () => {
    const screen = renderWithRouter('/?track=lead');

    expect(screen.getByText('Track id: lead')).toBeVisible();
    expect(screen.getByText('Track label: Lead / Engineering Manager')).toBeVisible();
    expect(screen.getByText('Search: track=lead')).toBeVisible();
  });

  test('setTrackId switches the track and updates the url', async () => {
    const user = userEvent.setup();
    const screen = renderWithRouter('/?track=general');

    await user.click(screen.getByRole('button', { name: 'Switch to Lead' }));

    expect(screen.getByText('Track id: lead')).toBeVisible();
    expect(screen.getByText('Search: track=lead')).toBeVisible();
  });

  test('setTrackId with the already-active track does not push a history entry', async () => {
    const user = userEvent.setup();
    const screen = renderWithRouter('/?track=general');

    await user.click(screen.getByRole('button', { name: 'Switch to Lead' }));
    await user.click(screen.getByRole('button', { name: 'Switch to Lead' }));
    await user.click(screen.getByRole('button', { name: 'Back' }));

    expect(screen.getByText('Track id: general')).toBeVisible();
    expect(screen.getByText('Search: track=general')).toBeVisible();
  });

  test('setTrackId identity is stable across unrelated search param changes', async () => {
    const user = userEvent.setup();
    const screen = render(
      <MemoryRouter initialEntries={['/?track=general']}>
        <TrackContextProvider>
          <SetTrackIdIdentityProbe />
        </TrackContextProvider>
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: 'Change view param' }));

    expect(seenSetTrackIds.length).toBeGreaterThan(1);
    expect(new Set(seenSetTrackIds).size).toBe(1);
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
