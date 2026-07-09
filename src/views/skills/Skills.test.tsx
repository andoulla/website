import { act, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { MemoryRouter, useSearchParams } from 'react-router-dom';

import { CareerDataContextProvider } from '@/context/careerData';
import { TimelineEvent } from '@/testing';

import { Skills } from './Skills';

const CAREER_HISTORY = [
  new TimelineEvent()
    .id('atom-learning-2021-01')
    .companyName('Acme')
    .startDate('2024-01-01')
    .endDate('2026-07-02')
    .mock(),
];

const neverResolve = () => new Promise<typeof CAREER_HISTORY>(() => undefined);

const SearchParamsDisplay = () => {
  const [searchParams] = useSearchParams();
  return <span>{`search:${searchParams.toString()}`}</span>;
};

function renderWithProvider(
  loader = () => Promise.resolve(CAREER_HISTORY),
  initialEntries = ['/skills']
) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <CareerDataContextProvider loader={loader}>
        <Skills />
        <SearchParamsDisplay />
      </CareerDataContextProvider>
    </MemoryRouter>
  );
}

describe('Skills', () => {
  describe('rendering', () => {
    test('renders the page heading and defaults to the radar view', async () => {
      let screen!: ReturnType<typeof render>;

      await act(async () => {
        screen = renderWithProvider();
        await Promise.resolve();
      });

      expect(screen.getByRole('heading', { level: 1, name: 'Skills' })).toBeVisible();
      expect(screen.getByRole('cell', { name: 'Leadership & Delivery' })).toBeVisible();
      expect(screen.getByRole('button', { name: 'List view' })).toBeVisible();
      expect(screen.getByRole('button', { name: 'Graph view' })).toBeVisible();
      expect(screen.getByRole('button', { name: 'Radar view' })).toBeVisible();
      expect(screen.getByRole('button', { name: 'Radar view' })).toHaveAttribute(
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

  describe('pattern toggle', () => {
    test('shows an unchecked patterns checkbox by default in graph view', async () => {
      const user = userEvent.setup();
      let screen!: ReturnType<typeof render>;

      await act(async () => {
        screen = renderWithProvider();
        await Promise.resolve();
      });

      await user.click(screen.getByRole('button', { name: 'Graph view' }));

      expect(screen.getByRole('checkbox', { name: 'Patterns' })).not.toBeChecked();
    });

    test('hides the patterns checkbox outside graph view', async () => {
      const user = userEvent.setup();
      let screen!: ReturnType<typeof render>;

      await act(async () => {
        screen = renderWithProvider();
        await Promise.resolve();
      });

      await user.click(screen.getByRole('button', { name: 'List view' }));

      expect(screen.queryByRole('checkbox', { name: 'Patterns' })).not.toBeInTheDocument();
    });

    test('checking the patterns checkbox updates its checked state', async () => {
      const user = userEvent.setup();
      let screen!: ReturnType<typeof render>;

      await act(async () => {
        screen = renderWithProvider();
        await Promise.resolve();
      });

      await user.click(screen.getByRole('button', { name: 'Graph view' }));
      await user.click(screen.getByRole('checkbox', { name: 'Patterns' }));

      expect(screen.getByRole('checkbox', { name: 'Patterns' })).toBeChecked();
      expect(await axe(screen.container)).toHaveNoViolations();
    });
  });

  describe('category filter URL sync', () => {
    test('initializes the category filter from the URL query param', async () => {
      let screen!: ReturnType<typeof render>;

      await act(async () => {
        screen = renderWithProvider(
          () => Promise.resolve(CAREER_HISTORY),
          ['/skills?category=leadership-delivery']
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

      await user.click(screen.getByRole('menuitemcheckbox', { name: 'Leadership & Delivery' }));

      expect(screen.getByText('search:category=leadership-delivery')).toBeVisible();
    });

    test('removes the category query param when the filter is cleared', async () => {
      const user = userEvent.setup();
      let screen!: ReturnType<typeof render>;

      await act(async () => {
        screen = renderWithProvider(
          () => Promise.resolve(CAREER_HISTORY),
          ['/skills?category=leadership-delivery']
        );
        await Promise.resolve();
      });

      await user.click(
        screen.getByRole('button', {
          name: 'Filter skills by category and subcategory, currently: Filters (1)',
        })
      );
      await user.click(screen.getByRole('menuitemcheckbox', { name: 'Leadership & Delivery' }));

      expect(screen.getByText('search:')).toBeVisible();
    });
  });

  describe('subcategory filter URL sync', () => {
    test('initializes the subcategory filter from the URL query param', async () => {
      let screen!: ReturnType<typeof render>;

      await act(async () => {
        screen = renderWithProvider(
          () => Promise.resolve(CAREER_HISTORY),
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
          () => Promise.resolve(CAREER_HISTORY),
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

  describe('search filter URL sync', () => {
    test('initializes the search term from the URL query param', async () => {
      let screen!: ReturnType<typeof render>;

      await act(async () => {
        screen = renderWithProvider(
          () => Promise.resolve(CAREER_HISTORY),
          ['/skills?search=react']
        );
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
        screen = renderWithProvider(
          () => Promise.resolve(CAREER_HISTORY),
          ['/skills?search=react']
        );
        await Promise.resolve();
      });

      await user.click(screen.getByRole('button', { name: 'Clear search' }));

      expect(screen.getByText('search:')).toBeVisible();
    });
  });

  describe('view mode URL sync', () => {
    test('honours an explicit ?view= param over the default', async () => {
      let screen!: ReturnType<typeof render>;

      await act(async () => {
        screen = renderWithProvider(
          () => Promise.resolve(CAREER_HISTORY),
          ['/skills?view=barchart']
        );
        await Promise.resolve();
      });

      expect(screen.getByRole('button', { name: 'Graph view' })).toHaveAttribute(
        'aria-pressed',
        'true'
      );
    });

    test('reflects a view toggle as a URL query param', async () => {
      const user = userEvent.setup();
      let screen!: ReturnType<typeof render>;

      await act(async () => {
        screen = renderWithProvider();
        await Promise.resolve();
      });

      await user.click(screen.getByRole('button', { name: 'List view' }));

      expect(screen.getByText('search:view=list')).toBeVisible();
    });

    test('omits the view query param when toggling to the default radar view', async () => {
      const user = userEvent.setup();
      let screen!: ReturnType<typeof render>;

      await act(async () => {
        screen = renderWithProvider(() => Promise.resolve(CAREER_HISTORY), ['/skills?view=list']);
        await Promise.resolve();
      });

      await user.click(screen.getByRole('button', { name: 'Radar view' }));

      expect(screen.getByText('search:')).toBeVisible();
    });
  });

  describe('hidden-match hint', () => {
    test('shows a hidden-match hint when a filter hides skills matching the search term', async () => {
      const user = userEvent.setup();
      let screen!: ReturnType<typeof render>;

      await act(async () => {
        screen = renderWithProvider();
        await Promise.resolve();
      });

      await user.type(screen.getByRole('textbox', { name: 'Search skills by name' }), 'react');
      await user.click(
        screen.getByRole('button', {
          name: 'Filter skills by category and subcategory, currently: All',
        })
      );
      await user.click(screen.getByRole('menuitemcheckbox', { name: 'Leadership & Delivery' }));

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
      await user.click(
        screen.getByRole('button', {
          name: 'Filter skills by category and subcategory, currently: All',
        })
      );
      await user.click(screen.getByRole('menuitemcheckbox', { name: 'Leadership & Delivery' }));

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
  });

  describe('combined filters', () => {
    test('keeps category and subcategory query params independent of each other', async () => {
      let screen!: ReturnType<typeof render>;

      await act(async () => {
        screen = renderWithProvider(
          () => Promise.resolve(CAREER_HISTORY),
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
