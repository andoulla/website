import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { MemoryRouter, useSearchParams } from 'react-router-dom';

import { TrackContextProvider } from '@/context/track';

import { TrackFilter } from './TrackFilter';

const SearchParamsDisplay = () => {
  const [searchParams] = useSearchParams();
  return <span>{`search:${searchParams.toString()}`}</span>;
};

const renderTrackFilter = (initialEntry: string) =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <TrackContextProvider>
        <TrackFilter />
        <SearchParamsDisplay />
      </TrackContextProvider>
    </MemoryRouter>
  );

describe('TrackFilter', () => {
  test('shows the active track and lists every track option', async () => {
    const user = userEvent.setup();
    const screen = renderTrackFilter('/skills?track=senior-engineer');

    expect(screen.getByRole('combobox', { name: 'Track' })).toHaveTextContent(
      'Track: Senior Engineer'
    );

    await user.click(screen.getByRole('combobox', { name: 'Track' }));

    expect(screen.getByRole('option', { name: 'Lead / Engineering Manager' })).toBeVisible();
    expect(screen.getByRole('option', { name: 'Senior Engineer' })).toBeVisible();
    expect(screen.getByRole('option', { name: 'General' })).toBeVisible();
    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('selecting a track writes it to the url', async () => {
    const user = userEvent.setup();
    const screen = renderTrackFilter('/skills?track=general');

    await user.click(screen.getByRole('combobox', { name: 'Track' }));
    await user.click(screen.getByRole('option', { name: 'Lead / Engineering Manager' }));

    expect(screen.getByText('search:track=lead')).toBeVisible();
  });
});
