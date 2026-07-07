import { act, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { MemoryRouter, useSearchParams } from 'react-router-dom';

import { ResumeDataProvider } from '@/context/resumeData';
import { TimelineEvent } from '@/testing';

import { Skills } from './Skills';

const EXPERIENCES = [
  new TimelineEvent()
    .id('atom-learning-2021-01')
    .companyName('Acme')
    .startDate('2024-01-01')
    .endDate('2026-07-02')
    .mock(),
];

const neverResolve = () => new Promise<typeof EXPERIENCES>(() => undefined);

const ALL_LABEL = 'Filter skills by category and subcategory, currently: All';
const FILTERS_1_LABEL = 'Filter skills by category and subcategory, currently: Filters (1)';
const FILTERS_2_LABEL = 'Filter skills by category and subcategory, currently: Filters (2)';

const SearchParamsDisplay = () => {
  const [searchParams] = useSearchParams();
  return <span>{`search:${searchParams.toString()}`}</span>;
};

function renderWithProvider(
  loader = () => Promise.resolve(EXPERIENCES),
  initialEntries = ['/skills']
) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <ResumeDataProvider loader={loader}>
        <Skills />
        <SearchParamsDisplay />
      </ResumeDataProvider>
    </MemoryRouter>
  );
}

describe('Skills', () => {
  test('renders the page heading', async () => {
    let screen!: ReturnType<typeof render>;

    await act(async () => {
      screen = renderWithProvider();
      await Promise.resolve();
    });

    expect(screen.getByRole('heading', { level: 1, name: 'Skills' })).toBeVisible();
  });

  test('renders skill list items after data loads', async () => {
    let screen!: ReturnType<typeof render>;

    await act(async () => {
      screen = renderWithProvider();
      await Promise.resolve();
    });
    expect(screen.getByText('Team Leadership')).toBeVisible();
  });

  test('renders the List/Graph/Radar toggle after data loads', async () => {
    let screen!: ReturnType<typeof render>;

    await act(async () => {
      screen = renderWithProvider();
      await Promise.resolve();
    });
    expect(screen.getByRole('button', { name: 'List view' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Graph view' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Radar view' })).toBeVisible();
  });

  test('shows the radar view placeholder when selected', async () => {
    const user = userEvent.setup();
    let screen!: ReturnType<typeof render>;

    await act(async () => {
      screen = renderWithProvider();
      await Promise.resolve();
    });

    await user.click(screen.getByRole('button', { name: 'Radar view' }));

    expect(screen.getByRole('alert')).toBeVisible();
  });

  test('defaults to the graph view on load', async () => {
    let screen!: ReturnType<typeof render>;

    await act(async () => {
      screen = renderWithProvider();
      await Promise.resolve();
    });
    expect(screen.getByRole('button', { name: 'Graph view' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  test('shows the filter bar in list view as well as graph view', async () => {
    const user = userEvent.setup();
    let screen!: ReturnType<typeof render>;

    await act(async () => {
      screen = renderWithProvider();
      await Promise.resolve();
    });

    await user.click(screen.getByRole('button', { name: 'List view' }));

    expect(screen.getByRole('button', { name: ALL_LABEL })).toBeVisible();
  });

  test('initializes the category filter from the URL query param', async () => {
    let screen!: ReturnType<typeof render>;

    await act(async () => {
      screen = renderWithProvider(
        () => Promise.resolve(EXPERIENCES),
        ['/skills?category=managerial']
      );
      await Promise.resolve();
    });

    expect(screen.getByRole('button', { name: FILTERS_1_LABEL })).toBeVisible();
  });

  test('reflects a category filter selection as a URL query param', async () => {
    const user = userEvent.setup();
    let screen!: ReturnType<typeof render>;

    await act(async () => {
      screen = renderWithProvider();
      await Promise.resolve();
    });

    await user.click(screen.getByRole('button', { name: ALL_LABEL }));
    await user.click(screen.getByRole('menuitemcheckbox', { name: 'Managerial' }));

    expect(screen.getByText('search:category=managerial')).toBeVisible();
  });

  test('removes the category query param when the filter is cleared', async () => {
    const user = userEvent.setup();
    let screen!: ReturnType<typeof render>;

    await act(async () => {
      screen = renderWithProvider(
        () => Promise.resolve(EXPERIENCES),
        ['/skills?category=managerial']
      );
      await Promise.resolve();
    });

    await user.click(screen.getByRole('button', { name: FILTERS_1_LABEL }));
    await user.click(screen.getByRole('menuitemcheckbox', { name: 'Managerial' }));

    expect(screen.getByText('search:')).toBeVisible();
  });

  test('keeps category and subcategory query params independent of each other', async () => {
    let screen!: ReturnType<typeof render>;

    await act(async () => {
      screen = renderWithProvider(
        () => Promise.resolve(EXPERIENCES),
        ['/skills?category=engineering&subCategory=testing']
      );
      await Promise.resolve();
    });

    expect(screen.getByText('search:category=engineering&subCategory=testing')).toBeVisible();
    expect(screen.getByRole('button', { name: FILTERS_2_LABEL })).toBeVisible();
  });

  test('initializes the subcategory filter from the URL query param', async () => {
    let screen!: ReturnType<typeof render>;

    await act(async () => {
      screen = renderWithProvider(
        () => Promise.resolve(EXPERIENCES),
        ['/skills?subCategory=testing']
      );
      await Promise.resolve();
    });

    expect(screen.getByRole('button', { name: FILTERS_1_LABEL })).toBeVisible();
  });

  test('reflects a subcategory filter selection as a URL query param', async () => {
    const user = userEvent.setup();
    let screen!: ReturnType<typeof render>;

    await act(async () => {
      screen = renderWithProvider();
      await Promise.resolve();
    });

    await user.click(screen.getByRole('button', { name: ALL_LABEL }));
    await user.click(screen.getByRole('menuitemcheckbox', { name: 'Testing' }));

    expect(screen.getByText('search:subCategory=testing')).toBeVisible();
  });

  test('removes the subcategory query param when the filter is cleared', async () => {
    const user = userEvent.setup();
    let screen!: ReturnType<typeof render>;

    await act(async () => {
      screen = renderWithProvider(
        () => Promise.resolve(EXPERIENCES),
        ['/skills?subCategory=testing']
      );
      await Promise.resolve();
    });

    await user.click(screen.getByRole('button', { name: FILTERS_1_LABEL }));
    await user.click(screen.getByRole('menuitemcheckbox', { name: 'Testing' }));

    expect(screen.getByText('search:')).toBeVisible();
  });

  test('initializes the search term from the URL query param', async () => {
    let screen!: ReturnType<typeof render>;

    await act(async () => {
      screen = renderWithProvider(() => Promise.resolve(EXPERIENCES), ['/skills?search=react']);
      await Promise.resolve();
    });

    expect(screen.getByRole('textbox', { name: 'Search skills by name' })).toHaveValue('react');
  });

  test('reflects a typed search term as a URL query param', async () => {
    const user = userEvent.setup();
    let screen!: ReturnType<typeof render>;

    await act(async () => {
      screen = renderWithProvider();
      await Promise.resolve();
    });

    await user.type(screen.getByRole('textbox', { name: 'Search skills by name' }), 'react');

    expect(screen.getByText('search:search=react')).toBeVisible();
  });

  test('removes the search query param when the search box is cleared', async () => {
    const user = userEvent.setup();
    let screen!: ReturnType<typeof render>;

    await act(async () => {
      screen = renderWithProvider(() => Promise.resolve(EXPERIENCES), ['/skills?search=react']);
      await Promise.resolve();
    });

    await user.click(screen.getByRole('button', { name: 'Clear search' }));

    expect(screen.getByText('search:')).toBeVisible();
  });

  test('shows a hidden-match hint when a filter hides skills matching the search term', async () => {
    const user = userEvent.setup();
    let screen!: ReturnType<typeof render>;

    await act(async () => {
      screen = renderWithProvider();
      await Promise.resolve();
    });

    await user.type(screen.getByRole('textbox', { name: 'Search skills by name' }), 'react');
    await user.click(screen.getByRole('button', { name: ALL_LABEL }));
    await user.click(screen.getByRole('menuitemcheckbox', { name: 'Managerial' }));

    expect(screen.getByText('3 matches hidden by filters')).toBeVisible();
  });

  test('uses singular wording when exactly one match is hidden by filters', async () => {
    const user = userEvent.setup();
    let screen!: ReturnType<typeof render>;

    await act(async () => {
      screen = renderWithProvider();
      await Promise.resolve();
    });

    await user.type(screen.getByRole('textbox', { name: 'Search skills by name' }), 'typescript');
    await user.click(screen.getByRole('button', { name: ALL_LABEL }));
    await user.click(screen.getByRole('menuitemcheckbox', { name: 'Managerial' }));

    expect(screen.getByText('1 match hidden by filters')).toBeVisible();
  });

  test('does not show a hidden-match hint when no filters hide the search matches', async () => {
    const user = userEvent.setup();
    let screen!: ReturnType<typeof render>;

    await act(async () => {
      screen = renderWithProvider();
      await Promise.resolve();
    });

    await user.type(screen.getByRole('textbox', { name: 'Search skills by name' }), 'react');

    expect(screen.queryByText('3 matches hidden by filters')).not.toBeInTheDocument();
  });

  test('has no axe violations on initial render', async () => {
    let screen!: ReturnType<typeof render>;

    await act(async () => {
      screen = renderWithProvider(neverResolve);
      await Promise.resolve();
    });

    expect(await axe(screen.container)).toHaveNoViolations();
  });
});
