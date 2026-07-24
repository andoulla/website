import { act, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { MemoryRouter, useSearchParams } from 'react-router-dom';

import { CareerDataContextProvider } from '@/context/careerData';
import { TrackContextProvider } from '@/context/track';
import { Skill, TimelineEvent } from '@/testing';

import { Skills } from './Skills';

// Skill ids are real — track taxonomy isn't mockable.
const CAREER_HISTORY = [
  new TimelineEvent()
    .id('job-1')
    .companyName('Acme')
    .startDate('2024-01-01')
    .endDate('2026-07-02')
    .skills([
      new Skill().id('team-leadership').name('Team Leadership').jobIds(['job-1']).mock(),
      new Skill()
        .id('javascript-es6')
        .name('JavaScript (ES6+)')
        .synonyms(['JavaScript'])
        .jobIds(['job-1'])
        .mock(),
      new Skill().id('typescript').name('TypeScript').jobIds(['job-1']).mock(),
      new Skill().id('react').name('React').jobIds(['job-1']).mock(),
      new Skill().id('react-hooks').name('React Hooks').jobIds(['job-1']).mock(),
      new Skill().id('react-query').name('React Query').jobIds(['job-1']).mock(),
      new Skill().id('jest').name('Jest').jobIds(['job-1']).mock(),
    ])
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
      <TrackContextProvider>
        <CareerDataContextProvider loader={loader}>
          <Skills />
          <SearchParamsDisplay />
        </CareerDataContextProvider>
      </TrackContextProvider>
    </MemoryRouter>
  );
}

const renderAndFlush = async (
  loader?: () => Promise<typeof CAREER_HISTORY>,
  initialEntries?: string[]
) =>
  act(async () => {
    const result = renderWithProvider(loader, initialEntries);

    await Promise.resolve();

    return result;
  });

describe('Skills', () => {
  describe('rendering', () => {
    test('renders the page heading and defaults to the radar view', async () => {
      const screen = await renderAndFlush();

      expect(document.title).toBe('Skills — Mariandi Stylianou');
      expect(screen.getByRole('heading', { level: 1, name: 'Skills' })).toBeVisible();
      expect(screen.getByRole('cell', { name: 'Leadership & Delivery' })).toBeVisible();
      expect(screen.getByRole('button', { name: 'Table view' })).toBeVisible();
      expect(screen.getByRole('button', { name: 'Graph view' })).toBeVisible();
      expect(screen.getByRole('button', { name: 'Radar view' })).toBeVisible();
      expect(screen.getByRole('button', { name: 'Network view' })).toBeVisible();
      expect(screen.getByRole('button', { name: 'Growth view' })).toBeVisible();
      expect(screen.getByRole('button', { name: 'Radar view' })).toHaveAttribute(
        'aria-pressed',
        'true'
      );
      expect(screen.getByText('Where my experience is concentrated across areas')).toBeVisible();
      expect(await axe(screen.container)).toHaveNoViolations();
    });

    test('switches to a new view and shows its caption', async () => {
      const user = userEvent.setup();
      const screen = await renderAndFlush();

      await user.click(screen.getByRole('button', { name: 'Growth view' }));

      expect(screen.getByText('How my skill set has grown across my career')).toBeVisible();
    });

    test('shows the filter bar in table view as well as graph view', async () => {
      const user = userEvent.setup();
      const screen = await renderAndFlush();

      await user.click(screen.getByRole('button', { name: 'Table view' }));

      expect(
        screen.getByRole('button', {
          name: 'Filter skills by category and subcategory, currently: All',
        })
      ).toBeVisible();
      expect(await axe(screen.container)).toHaveNoViolations();
    });

    test('has no axe violations while loading', async () => {
      const screen = renderWithProvider(neverResolve);

      expect(await axe(screen.container)).toHaveNoViolations();
    });
  });

  describe('track URL sync', () => {
    test('normalises a missing track param to the default general track', async () => {
      const screen = await renderAndFlush();

      expect(screen.getByText('search:track=general')).toBeVisible();
    });

    test("groups skills by the active track's taxonomy for ?track=lead", async () => {
      const user = userEvent.setup();
      const screen = await renderAndFlush(
        () => Promise.resolve(CAREER_HISTORY),
        ['/skills?track=lead']
      );

      await user.click(
        screen.getByRole('button', {
          name: 'Filter skills by category and subcategory, currently: All',
        })
      );

      expect(screen.getByRole('menuitemcheckbox', { name: 'JavaScript Stack' })).toBeVisible();
      expect(
        screen.queryByRole('menuitemcheckbox', { name: 'Frontend Development' })
      ).not.toBeInTheDocument();
    });

    test('switching track via the track filter updates the url and drops stale filters', async () => {
      const user = userEvent.setup();
      const screen = await renderAndFlush(
        () => Promise.resolve(CAREER_HISTORY),
        ['/skills?track=general&category=frontend-development']
      );

      await user.click(screen.getByRole('combobox', { name: 'Track' }));
      await user.click(screen.getByRole('option', { name: 'Lead / Engineering Manager' }));

      // frontend-development is not a lead category, so the parsed filters self-clean.
      expect(screen.getByText('search:track=lead&category=frontend-development')).toBeVisible();
      expect(
        screen.getByRole('button', {
          name: 'Filter skills by category and subcategory, currently: All',
        })
      ).toBeVisible();
    });

    test('drops a category param that is not part of the active track', async () => {
      const screen = await renderAndFlush(
        () => Promise.resolve(CAREER_HISTORY),
        ['/skills?track=lead&category=frontend-development']
      );

      expect(
        screen.getByRole('button', {
          name: 'Filter skills by category and subcategory, currently: All',
        })
      ).toBeVisible();
    });
  });

  describe('skill deep links', () => {
    test('resolves a synonym to the canonical skill and scrolls to its row', async () => {
      const scrollIntoViewSpy = jest.spyOn(HTMLElement.prototype, 'scrollIntoView');

      // 'JavaScript' is a synonym of 'JavaScript (ES6+)' in skills.json.
      await renderAndFlush(
        () => Promise.resolve(CAREER_HISTORY),
        ['/skills?view=table&skill=JavaScript']
      );

      expect(scrollIntoViewSpy).toHaveBeenCalledTimes(1);

      scrollIntoViewSpy.mockRestore();
    });

    test('does not scroll for a skill param that resolves to nothing', async () => {
      const scrollIntoViewSpy = jest.spyOn(HTMLElement.prototype, 'scrollIntoView');

      await renderAndFlush(
        () => Promise.resolve(CAREER_HISTORY),
        ['/skills?view=table&skill=not-a-real-skill']
      );

      expect(scrollIntoViewSpy).not.toHaveBeenCalled();

      scrollIntoViewSpy.mockRestore();
    });
  });

  describe('pattern toggle', () => {
    test('shows an unchecked patterns checkbox by default in graph view', async () => {
      const user = userEvent.setup();
      const screen = await renderAndFlush();

      await user.click(screen.getByRole('button', { name: 'Graph view' }));

      expect(screen.getByRole('checkbox', { name: 'Texture fills' })).not.toBeChecked();
    });

    test('hides the patterns checkbox outside graph view', async () => {
      const user = userEvent.setup();
      const screen = await renderAndFlush();

      await user.click(screen.getByRole('button', { name: 'Table view' }));

      expect(screen.queryByRole('checkbox', { name: 'Texture fills' })).not.toBeInTheDocument();
    });

    test('checking the patterns checkbox updates its checked state', async () => {
      const user = userEvent.setup();
      const screen = await renderAndFlush();

      await user.click(screen.getByRole('button', { name: 'Graph view' }));
      await user.click(screen.getByRole('checkbox', { name: 'Texture fills' }));

      expect(screen.getByRole('checkbox', { name: 'Texture fills' })).toBeChecked();
      expect(await axe(screen.container)).toHaveNoViolations();
    });
  });

  describe('category filter URL sync', () => {
    test('initializes the category filter from the URL query param', async () => {
      const screen = await renderAndFlush(
        () => Promise.resolve(CAREER_HISTORY),
        ['/skills?category=leadership-delivery']
      );

      expect(
        screen.getByRole('button', {
          name: 'Filter skills by category and subcategory, currently: Filters (1)',
        })
      ).toBeVisible();
    });

    test('reflects a category filter selection as a URL query param, after the track', async () => {
      const user = userEvent.setup();
      const screen = await renderAndFlush();

      await user.click(
        screen.getByRole('button', {
          name: 'Filter skills by category and subcategory, currently: All',
        })
      );
      expect(await axe(screen.container)).toHaveNoViolations();

      await user.click(screen.getByRole('menuitemcheckbox', { name: 'Leadership & Delivery' }));

      expect(screen.getByText('search:track=general&category=leadership-delivery')).toBeVisible();
    });

    test('removes the category query param when the filter is cleared', async () => {
      const user = userEvent.setup();
      const screen = await renderAndFlush(
        () => Promise.resolve(CAREER_HISTORY),
        ['/skills?category=leadership-delivery']
      );

      await user.click(
        screen.getByRole('button', {
          name: 'Filter skills by category and subcategory, currently: Filters (1)',
        })
      );
      await user.click(screen.getByRole('menuitemcheckbox', { name: 'Leadership & Delivery' }));

      expect(screen.getByText('search:track=general')).toBeVisible();
    });
  });

  describe('subcategory filter URL sync', () => {
    test('initializes the subcategory filter from the URL query param', async () => {
      const screen = await renderAndFlush(
        () => Promise.resolve(CAREER_HISTORY),
        ['/skills?subCategory=testing']
      );

      expect(
        screen.getByRole('button', {
          name: 'Filter skills by category and subcategory, currently: Filters (1)',
        })
      ).toBeVisible();
    });

    test('reflects a subcategory filter selection as a URL query param', async () => {
      const user = userEvent.setup();
      const screen = await renderAndFlush();

      await user.click(
        screen.getByRole('button', {
          name: 'Filter skills by category and subcategory, currently: All',
        })
      );
      await user.click(screen.getByRole('menuitemcheckbox', { name: 'Testing' }));

      expect(screen.getByText('search:track=general&subCategory=testing')).toBeVisible();
    });

    test('removes the subcategory query param when the filter is cleared', async () => {
      const user = userEvent.setup();
      const screen = await renderAndFlush(
        () => Promise.resolve(CAREER_HISTORY),
        ['/skills?subCategory=testing']
      );

      await user.click(
        screen.getByRole('button', {
          name: 'Filter skills by category and subcategory, currently: Filters (1)',
        })
      );
      await user.click(screen.getByRole('menuitemcheckbox', { name: 'Testing' }));

      expect(screen.getByText('search:track=general')).toBeVisible();
    });
  });

  describe('search filter URL sync', () => {
    test('initializes the search term from the URL query param', async () => {
      const screen = await renderAndFlush(
        () => Promise.resolve(CAREER_HISTORY),
        ['/skills?search=react']
      );

      expect(screen.getByRole('textbox', { name: 'Search skills by name' })).toHaveValue('react');
    });

    test('reflects a typed search term as a URL query param', async () => {
      const user = userEvent.setup();
      const screen = await renderAndFlush();

      await user.type(screen.getByRole('textbox', { name: 'Search skills by name' }), 'react');

      expect(screen.getByText('search:track=general&search=react')).toBeVisible();
    });

    test('removes the search query param when the search box is cleared', async () => {
      const user = userEvent.setup();
      const screen = await renderAndFlush(
        () => Promise.resolve(CAREER_HISTORY),
        ['/skills?search=react']
      );

      await user.click(screen.getByRole('button', { name: 'Clear search' }));

      expect(screen.getByText('search:track=general')).toBeVisible();
    });
  });

  describe('view mode URL sync', () => {
    test('honours an explicit ?view= param over the default', async () => {
      const screen = await renderAndFlush(
        () => Promise.resolve(CAREER_HISTORY),
        ['/skills?view=barchart']
      );

      expect(screen.getByRole('button', { name: 'Graph view' })).toHaveAttribute(
        'aria-pressed',
        'true'
      );
    });

    test('reflects a view toggle as a URL query param', async () => {
      const user = userEvent.setup();
      const screen = await renderAndFlush();

      await user.click(screen.getByRole('button', { name: 'Table view' }));

      expect(screen.getByText('search:track=general&view=table')).toBeVisible();
    });

    test('omits the view query param when toggling to the default radar view', async () => {
      const user = userEvent.setup();
      const screen = await renderAndFlush(
        () => Promise.resolve(CAREER_HISTORY),
        ['/skills?view=table']
      );

      await user.click(screen.getByRole('button', { name: 'Radar view' }));

      expect(screen.getByText('search:track=general')).toBeVisible();
    });
  });

  describe('hidden-match hint', () => {
    test('shows a hidden-match hint when a filter hides skills matching the search term', async () => {
      const user = userEvent.setup();
      const screen = await renderAndFlush();

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
      const screen = await renderAndFlush();

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
      const screen = await renderAndFlush();

      await user.type(screen.getByRole('textbox', { name: 'Search skills by name' }), 'react');

      expect(screen.queryByText('3 matches hidden by filters')).not.toBeInTheDocument();
    });

    test('shows a no-match hint when the search matches no skill at all', async () => {
      const user = userEvent.setup();
      const screen = await renderAndFlush();

      await user.type(
        screen.getByRole('textbox', { name: 'Search skills by name' }),
        'not-a-skill'
      );

      expect(screen.getByText('No skills match your search')).toBeVisible();
    });
  });

  describe('combined filters', () => {
    test('keeps category and subcategory query params independent of each other', async () => {
      const screen = await renderAndFlush(
        () => Promise.resolve(CAREER_HISTORY),
        ['/skills?category=frontend-development&subCategory=testing']
      );

      expect(
        screen.getByText('search:category=frontend-development&subCategory=testing&track=general')
      ).toBeVisible();
      expect(
        screen.getByRole('button', {
          name: 'Filter skills by category and subcategory, currently: Filters (2)',
        })
      ).toBeVisible();
    });
  });

  describe('time slider URL sync', () => {
    test('shows the time slider and omits the asOf param at the latest year by default', async () => {
      const screen = await renderAndFlush();

      expect(screen.getByRole('slider', { name: 'Career year' })).toHaveAttribute(
        'aria-valuemin',
        '2024'
      );
      expect(screen.getByText('search:track=general')).toBeVisible();
    });

    test('initializes the time slider from the ?asOf= param and keeps it in the URL', async () => {
      const screen = await renderAndFlush(
        () => Promise.resolve(CAREER_HISTORY),
        ['/skills?asOf=2025']
      );

      expect(screen.getByRole('slider', { name: 'Career year' })).toHaveAttribute(
        'aria-valuenow',
        '2025'
      );
      expect(screen.getByText('search:asOf=2025&track=general')).toBeVisible();
    });

    test('writes the committed year to the asOf param when the time slider moves', async () => {
      const user = userEvent.setup();
      const screen = await renderAndFlush(
        () => Promise.resolve(CAREER_HISTORY),
        ['/skills?asOf=2024']
      );
      const slider = screen.getByRole('slider', { name: 'Career year' });

      // Focus via act — a raw slider.focus() updates MUI's internal state outside React's batching.
      act(() => {
        slider.focus();
      });
      await user.keyboard('{ArrowRight}');

      expect(screen.getByText('search:track=general&asOf=2025')).toBeVisible();
      expect(slider).toHaveAttribute('aria-valuenow', '2025');
    });
  });
});
