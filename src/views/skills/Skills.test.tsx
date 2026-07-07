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

  test('renders the List/Graph toggle after data loads', async () => {
    let screen!: ReturnType<typeof render>;

    await act(async () => {
      screen = renderWithProvider();
      await Promise.resolve();
    });
    expect(screen.getByRole('button', { name: 'List view' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Graph view' })).toBeVisible();
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

  test('has no axe violations on initial render', async () => {
    let screen!: ReturnType<typeof render>;

    await act(async () => {
      screen = renderWithProvider(neverResolve);
      await Promise.resolve();
    });

    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('has no axe violations in the loaded graph view', async () => {
    let screen!: ReturnType<typeof render>;

    await act(async () => {
      screen = renderWithProvider();
      await Promise.resolve();
    });

    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('has no axe violations in the loaded list view', async () => {
    const user = userEvent.setup();
    let screen!: ReturnType<typeof render>;

    await act(async () => {
      screen = renderWithProvider();
      await Promise.resolve();
    });

    await user.click(screen.getByRole('button', { name: 'List view' }));

    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('has no axe violations with the filter menu open', async () => {
    const user = userEvent.setup();
    let screen!: ReturnType<typeof render>;

    await act(async () => {
      screen = renderWithProvider();
      await Promise.resolve();
    });

    await user.click(screen.getByRole('button', { name: ALL_LABEL }));

    expect(await axe(screen.container)).toHaveNoViolations();
  });
});
