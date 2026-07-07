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
  describe('rendering', () => {
    test('renders the page heading, skill list, and defaults to the graph view', async () => {
      let screen!: ReturnType<typeof render>;

      await act(async () => {
        screen = renderWithProvider();
        await Promise.resolve();
      });

      expect(screen.getByRole('heading', { level: 1, name: 'Skills' })).toBeVisible();
      expect(screen.getByText('Team Leadership')).toBeVisible();
      expect(screen.getByRole('button', { name: 'List view' })).toBeVisible();
      expect(screen.getByRole('button', { name: 'Graph view' })).toBeVisible();
      expect(screen.getByRole('button', { name: 'Graph view' })).toHaveAttribute(
        'aria-pressed',
        'true'
      );
      expect(await axe(screen.container)).toHaveNoViolations();
    });

    test('shows the filter bar in list view as well as graph view', async () => {
      const user = userEvent.setup();
      let screen!: ReturnType<typeof render>;

      await act(async () => {
        screen = renderWithProvider();
        await Promise.resolve();
      });

      await user.click(screen.getByRole('button', { name: 'List view' }));

      expect(
        screen.getByRole('button', {
          name: 'Filter skills by category and subcategory, currently: All',
        })
      ).toBeVisible();
      expect(await axe(screen.container)).toHaveNoViolations();
    });
  });

  describe('category filter URL sync', () => {
    test('initializes the category filter from the URL query param', async () => {
      let screen!: ReturnType<typeof render>;

      await act(async () => {
        screen = renderWithProvider(
          () => Promise.resolve(EXPERIENCES),
          ['/skills?category=managerial']
        );
        await Promise.resolve();
      });

      expect(
        screen.getByRole('button', {
          name: 'Filter skills by category and subcategory, currently: Filters (1)',
        })
      ).toBeVisible();
    });

    test('reflects a category filter selection as a URL query param', async () => {
      const user = userEvent.setup();
      let screen!: ReturnType<typeof render>;

      await act(async () => {
        screen = renderWithProvider();
        await Promise.resolve();
      });

      await user.click(
        screen.getByRole('button', {
          name: 'Filter skills by category and subcategory, currently: All',
        })
      );
      expect(await axe(screen.container)).toHaveNoViolations();

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

      await user.click(
        screen.getByRole('button', {
          name: 'Filter skills by category and subcategory, currently: Filters (1)',
        })
      );
      await user.click(screen.getByRole('menuitemcheckbox', { name: 'Managerial' }));

      expect(screen.getByText('search:')).toBeVisible();
    });
  });

  describe('subcategory filter URL sync', () => {
    test('initializes the subcategory filter from the URL query param', async () => {
      let screen!: ReturnType<typeof render>;

      await act(async () => {
        screen = renderWithProvider(
          () => Promise.resolve(EXPERIENCES),
          ['/skills?subCategory=testing']
        );
        await Promise.resolve();
      });

      expect(
        screen.getByRole('button', {
          name: 'Filter skills by category and subcategory, currently: Filters (1)',
        })
      ).toBeVisible();
    });

    test('reflects a subcategory filter selection as a URL query param', async () => {
      const user = userEvent.setup();
      let screen!: ReturnType<typeof render>;

      await act(async () => {
        screen = renderWithProvider();
        await Promise.resolve();
      });

      await user.click(
        screen.getByRole('button', {
          name: 'Filter skills by category and subcategory, currently: All',
        })
      );
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

      await user.click(
        screen.getByRole('button', {
          name: 'Filter skills by category and subcategory, currently: Filters (1)',
        })
      );
      await user.click(screen.getByRole('menuitemcheckbox', { name: 'Testing' }));

      expect(screen.getByText('search:')).toBeVisible();
    });
  });

  describe('combined filters', () => {
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
      expect(
        screen.getByRole('button', {
          name: 'Filter skills by category and subcategory, currently: Filters (2)',
        })
      ).toBeVisible();
    });
  });

  describe('accessibility', () => {
    test('has no axe violations on initial render', async () => {
      let screen!: ReturnType<typeof render>;

      await act(async () => {
        screen = renderWithProvider(neverResolve);
        await Promise.resolve();
      });

      expect(await axe(screen.container)).toHaveNoViolations();
    });
  });
});
