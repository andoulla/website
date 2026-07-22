import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { MemoryRouter, useLocation } from 'react-router-dom';

import { Recommendation, Responsibility, Skill, TimelineEvent, Track } from '@/testing';

import { TimelineEventCard } from './TimelineEventCard';

const LocationDisplay = () => {
  const location = useLocation();
  return <span>{`location:${location.pathname}${location.search}`}</span>;
};

const reactSkill = new Skill().id('react').name('React').type('tech').mock();
const typeScriptSkill = new Skill().id('typescript').name('TypeScript').type('tech').mock();

const testTrack = new Track()
  .categories([
    {
      id: 'engineering',
      name: 'Engineering',
      subCategories: [
        {
          id: 'core',
          name: 'Core',
          skillIds: ['react', 'typescript', 'vite', 'jest', 'playwright'],
        },
      ],
    },
    {
      id: 'leadership-delivery',
      name: 'Leadership & Delivery',
      subCategories: [{ id: 'people', name: 'People', skillIds: ['team-leadership'] }],
    },
  ])
  .mock();

const event = new TimelineEvent()
  .companyName('Meridian Dynamics')
  .title('Staff Frontend Engineer')
  .location('London, UK')
  .startDate('2022-04-01')
  .responsibilities([
    new Responsibility().id('job-1-r01').text('Lead frontend architecture').mock(),
  ])
  .skills([reactSkill, typeScriptSkill])
  .techStack([reactSkill, typeScriptSkill])
  .mock();

const recommendationItem = new Recommendation()
  .authorInitials('P.S.')
  .authorRole({ jobTitle: 'Engineering Manager' })
  .text('Great work.')
  .postedDate('2023-06-12')
  .mock();

describe('TimelineEventCard', () => {
  test('renders company details with the whole body behind "Show details"', () => {
    const screen = render(<TimelineEventCard event={event} track={testTrack} />, {
      wrapper: MemoryRouter,
    });

    expect(screen.getByText('Meridian Dynamics')).toBeVisible();
    expect(
      screen.getByText('Staff Frontend Engineer · London, UK · Apr 2022 – Present')
    ).toBeVisible();
    expect(screen.queryByText('Lead frontend architecture')).not.toBeInTheDocument();
    expect(screen.queryByText('React')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Show details' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });

  test('startExpanded renders the card expanded with a "Hide details" toggle', () => {
    const screen = render(<TimelineEventCard event={event} track={testTrack} startExpanded />, {
      wrapper: MemoryRouter,
    });

    expect(screen.getByRole('button', { name: 'Hide details' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    // key skills stay behind their own toggle even on the expanded first card
    expect(screen.getByRole('button', { name: 'Show key skills' })).toBeVisible();
  });

  test('"Show details" reveals the body and the key skills wait behind their own toggle', async () => {
    const user = userEvent.setup();
    const screen = render(<TimelineEventCard event={event} track={testTrack} />, {
      wrapper: MemoryRouter,
    });

    await user.click(screen.getByRole('button', { name: 'Show details' }));

    expect(screen.getByText('Lead frontend architecture')).toBeVisible();
    expect(screen.getByText('React, TypeScript')).toBeVisible();
    expect(screen.queryByText('Engineering:')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Show key skills' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );

    await user.click(screen.getByRole('button', { name: 'Show key skills' }));

    expect(screen.getByText('React')).toBeVisible();
    expect(screen.getByText('TypeScript')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Hide key skills' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );

    await user.click(screen.getByRole('button', { name: 'Hide details' }));

    expect(screen.getByRole('button', { name: 'Show details' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });

  test('groups skills by track category, skipping skills the track does not include', async () => {
    const user = userEvent.setup();
    const leadershipSkill = new Skill()
      .id('team-leadership')
      .name('Team Leadership')
      .type('skill')
      .mock();
    const offTrackSkill = new Skill().id('kubernetes').name('Kubernetes').type('skill').mock();

    const screen = render(
      <TimelineEventCard
        event={{ ...event, skills: [reactSkill, leadershipSkill, offTrackSkill] }}
        track={testTrack}
      />,
      { wrapper: MemoryRouter }
    );

    await user.click(screen.getByRole('button', { name: 'Show details' }));
    await user.click(screen.getByRole('button', { name: 'Show key skills' }));

    expect(screen.getByText('Engineering:')).toBeVisible();
    expect(screen.getByText('React')).toBeVisible();
    expect(screen.getByText('Leadership & Delivery:')).toBeVisible();
    expect(screen.getByText('Team Leadership')).toBeVisible();
    expect(screen.queryByText('Kubernetes')).not.toBeInTheDocument();
  });

  test('renders the key skills as an inline comma list of links, not chips', async () => {
    const user = userEvent.setup();
    const screen = render(<TimelineEventCard event={event} track={testTrack} />, {
      wrapper: MemoryRouter,
    });

    await user.click(screen.getByRole('button', { name: 'Show details' }));
    await user.click(screen.getByRole('button', { name: 'Show key skills' }));

    expect(screen.getByRole('button', { name: 'React' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'TypeScript' })).toBeVisible();
    // TagList would render a ul
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  test('places the company and its sections correctly in the heading hierarchy, responsibilities first', async () => {
    const user = userEvent.setup();
    const screen = render(<TimelineEventCard event={event} track={testTrack} />, {
      wrapper: MemoryRouter,
    });

    await user.click(screen.getByRole('button', { name: 'Show details' }));
    await user.click(screen.getByRole('button', { name: 'Show key skills' }));

    expect(screen.getByRole('heading', { level: 3, name: 'Meridian Dynamics' })).toBeVisible();

    const sectionHeadings = screen.getAllByRole('heading', { level: 4 });

    expect(sectionHeadings.map((heading) => heading.textContent)).toEqual([
      'Responsibilities',
      'Tech Stack',
      'Key Skills',
    ]);
  });

  test('renders tech stack items as comma-separated text', async () => {
    const user = userEvent.setup();
    const viteSkill = new Skill().id('vite').name('Vite').type('tech').mock();
    const jestSkill = new Skill().id('jest').name('Jest').type('tech').mock();
    const playwrightSkill = new Skill().id('playwright').name('Playwright').type('tech').mock();

    const screen = render(
      <TimelineEventCard
        event={{ ...event, techStack: [viteSkill, jestSkill, playwrightSkill] }}
        track={testTrack}
      />,
      { wrapper: MemoryRouter }
    );

    await user.click(screen.getByRole('button', { name: 'Show details' }));

    expect(screen.getByRole('heading', { level: 4, name: 'Tech Stack' })).toBeVisible();
    expect(screen.getByText('Vite, Jest, Playwright')).toBeVisible();
  });

  test('renders the end month for a past role instead of "Present"', () => {
    const screen = render(
      <TimelineEventCard event={{ ...event, endDate: '2023-09-30' }} track={testTrack} />,
      { wrapper: MemoryRouter }
    );

    expect(
      screen.getByText('Staff Frontend Engineer · London, UK · Apr 2022 – Sep 2023')
    ).toBeVisible();
  });

  test('renders recommendations when present', async () => {
    const user = userEvent.setup();
    const screen = render(
      <TimelineEventCard
        event={{ ...event, recommendations: [recommendationItem] }}
        track={testTrack}
      />,
      { wrapper: MemoryRouter }
    );

    await user.click(screen.getByRole('button', { name: 'Show details' }));

    expect(screen.getByText('Recommendations (1)')).toBeVisible();
    expect(screen.getByText('P.S. · Engineering Manager · 12 Jun 2023')).toBeVisible();
    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('omits the Recommendations section when there are none', async () => {
    const user = userEvent.setup();
    const screen = render(<TimelineEventCard event={event} track={testTrack} />, {
      wrapper: MemoryRouter,
    });

    await user.click(screen.getByRole('button', { name: 'Show details' }));

    expect(screen.queryByText('Recommendations')).not.toBeInTheDocument();
    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('collapses to a compact primary-info card when nothing is relevant to the track', async () => {
    const screen = render(
      <TimelineEventCard
        event={{
          ...event,
          responsibilities: [],
          skills: [],
          techStack: [],
          recommendations: [recommendationItem],
        }}
        track={testTrack}
      />,
      { wrapper: MemoryRouter }
    );

    expect(screen.getByText('Meridian Dynamics')).toBeVisible();
    expect(
      screen.getByText('Staff Frontend Engineer · London, UK · Apr 2022 – Present')
    ).toBeVisible();
    expect(screen.queryByRole('heading', { level: 4 })).not.toBeInTheDocument();
    expect(screen.queryByText('Recommendations (1)')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('navigates to the skill page in the bar chart view, carrying the track, when a skill tag is clicked', async () => {
    const user = userEvent.setup();
    const screen = render(
      <MemoryRouter>
        <TimelineEventCard event={event} track={testTrack} />
        <LocationDisplay />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: 'Show details' }));
    await user.click(screen.getByRole('button', { name: 'Show key skills' }));
    await user.click(screen.getByText('React'));

    expect(
      screen.getByText('location:/skills?skill=React&view=barchart&track=general')
    ).toBeVisible();
  });

  test('navigates to the skills page with all of the role skills, in the bar chart view, when "View this role\'s skills on the graph" is clicked', async () => {
    const user = userEvent.setup();
    const screen = render(
      <MemoryRouter>
        <TimelineEventCard event={event} track={testTrack} />
        <LocationDisplay />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: 'Show details' }));
    await user.click(screen.getByRole('button', { name: 'Show key skills' }));
    await user.click(screen.getByRole('button', { name: "View this role's skills on the graph" }));

    expect(
      screen.getByText('location:/skills?skill=React&skill=TypeScript&view=barchart&track=general')
    ).toBeVisible();
  });

  test('navigates to the skills page filtered to that category, in the bar chart view, when the category caption is clicked', async () => {
    const user = userEvent.setup();
    const screen = render(
      <MemoryRouter>
        <TimelineEventCard event={event} track={testTrack} />
        <LocationDisplay />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: 'Show details' }));
    await user.click(screen.getByRole('button', { name: 'Show key skills' }));
    await user.click(screen.getByRole('button', { name: 'Engineering:' }));

    expect(
      screen.getByText('location:/skills?category=engineering&view=barchart&track=general')
    ).toBeVisible();
  });

  test('omits the Key Skills section, including its button, when the role has no skills', async () => {
    const user = userEvent.setup();
    const screen = render(
      <TimelineEventCard event={{ ...event, skills: [] }} track={testTrack} />,
      { wrapper: MemoryRouter }
    );

    await user.click(screen.getByRole('button', { name: 'Show details' }));

    expect(screen.queryByRole('heading', { level: 4, name: 'Key Skills' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Show key skills' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: "View this role's skills on the graph" })
    ).not.toBeInTheDocument();
  });

  test('omits the Tech Stack section when there is no tech stack', async () => {
    const user = userEvent.setup();
    const screen = render(
      <TimelineEventCard event={{ ...event, techStack: [] }} track={testTrack} />,
      { wrapper: MemoryRouter }
    );

    await user.click(screen.getByRole('button', { name: 'Show details' }));

    expect(screen.queryByRole('heading', { level: 4, name: 'Tech Stack' })).not.toBeInTheDocument();
  });

  test('shows a "Description" heading instead of "Responsibilities" for an education entry', async () => {
    const user = userEvent.setup();
    const screen = render(
      <TimelineEventCard event={{ ...event, type: 'education' }} track={testTrack} />,
      { wrapper: MemoryRouter }
    );

    await user.click(screen.getByRole('button', { name: 'Show details' }));

    expect(screen.getByRole('heading', { level: 4, name: 'Description' })).toBeVisible();
    expect(
      screen.queryByRole('heading', { level: 4, name: 'Responsibilities' })
    ).not.toBeInTheDocument();
  });

  describe('highlight and scroll', () => {
    test('applies an outline when highlightedSkillId matches one of the role skills', () => {
      const screen = render(
        <TimelineEventCard event={event} track={testTrack} highlightedSkillId="react" />,
        { wrapper: MemoryRouter }
      );

      expect(screen.getByText('Meridian Dynamics').closest('.MuiCard-root')).toHaveStyle({
        outlineOffset: '2px',
      });
    });

    test('does not apply an outline when highlightedSkillId matches none of the role skills', () => {
      const screen = render(
        <TimelineEventCard event={event} track={testTrack} highlightedSkillId="kubernetes" />,
        { wrapper: MemoryRouter }
      );

      expect(screen.getByText('Meridian Dynamics').closest('.MuiCard-root')).not.toHaveStyle({
        outlineOffset: '2px',
      });
    });

    test('a highlighted skill auto-expands the collapsed details', () => {
      const screen = render(
        <TimelineEventCard event={event} track={testTrack} highlightedSkillId="react" />,
        { wrapper: MemoryRouter }
      );

      expect(screen.getByText('React')).toBeVisible();
      expect(screen.getByRole('button', { name: 'Hide details' })).toBeVisible();
      expect(screen.getByRole('button', { name: 'Hide key skills' })).toBeVisible();
    });

    test('outlines and expands when highlightedEventId matches the event, with no skill or recommendation match', () => {
      const screen = render(
        <TimelineEventCard event={event} track={testTrack} highlightedEventId="job-1" />,
        { wrapper: MemoryRouter }
      );

      expect(screen.getByText('Meridian Dynamics').closest('.MuiCard-root')).toHaveStyle({
        outlineOffset: '2px',
      });
      expect(screen.getByRole('button', { name: 'Hide details' })).toBeVisible();
    });

    test('does not apply an outline when highlightedEventId matches a different event', () => {
      const screen = render(
        <TimelineEventCard event={event} track={testTrack} highlightedEventId="job-2" />,
        { wrapper: MemoryRouter }
      );

      expect(screen.getByText('Meridian Dynamics').closest('.MuiCard-root')).not.toHaveStyle({
        outlineOffset: '2px',
      });
    });

    test('scrolls into view when autoScrollToHighlight is true', () => {
      const scrollIntoViewSpy = jest.spyOn(HTMLElement.prototype, 'scrollIntoView');

      render(
        <TimelineEventCard
          event={event}
          track={testTrack}
          highlightedSkillId="react"
          autoScrollToHighlight
        />,
        { wrapper: MemoryRouter }
      );

      expect(scrollIntoViewSpy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' });

      scrollIntoViewSpy.mockRestore();
    });

    test('does not scroll when matching but autoScrollToHighlight is false', () => {
      const scrollIntoViewSpy = jest.spyOn(HTMLElement.prototype, 'scrollIntoView');

      render(<TimelineEventCard event={event} track={testTrack} highlightedSkillId="react" />, {
        wrapper: MemoryRouter,
      });

      expect(scrollIntoViewSpy).not.toHaveBeenCalled();

      scrollIntoViewSpy.mockRestore();
    });

    test('does not scroll when there is no highlighted skill', () => {
      const scrollIntoViewSpy = jest.spyOn(HTMLElement.prototype, 'scrollIntoView');

      render(<TimelineEventCard event={event} track={testTrack} />, { wrapper: MemoryRouter });

      expect(scrollIntoViewSpy).not.toHaveBeenCalled();

      scrollIntoViewSpy.mockRestore();
    });

    test('applies an outline when highlightedRecommendationId matches one of the role recommendations', () => {
      const screen = render(
        <TimelineEventCard
          event={{ ...event, recommendations: [recommendationItem] }}
          track={testTrack}
          highlightedRecommendationId={recommendationItem.id}
        />,
        { wrapper: MemoryRouter }
      );

      expect(screen.getByText('Meridian Dynamics').closest('.MuiCard-root')).toHaveStyle({
        outlineOffset: '2px',
      });
    });

    test('scrolls to the specific recommendation, not the whole card, when autoScrollToHighlight is true', () => {
      const scrollIntoViewSpy = jest.spyOn(HTMLElement.prototype, 'scrollIntoView');

      render(
        <TimelineEventCard
          event={{ ...event, recommendations: [recommendationItem] }}
          track={testTrack}
          highlightedRecommendationId={recommendationItem.id}
          autoScrollToHighlight
        />,
        { wrapper: MemoryRouter }
      );

      const recommendationNode = document.getElementById(`recommendation-${recommendationItem.id}`);

      expect(scrollIntoViewSpy).toHaveBeenCalledTimes(1);
      expect(scrollIntoViewSpy.mock.instances[0]).toBe(recommendationNode);

      scrollIntoViewSpy.mockRestore();
    });

    test('does not scroll to a recommendation when autoScrollToHighlight is false', () => {
      const scrollIntoViewSpy = jest.spyOn(HTMLElement.prototype, 'scrollIntoView');

      render(
        <TimelineEventCard
          event={{ ...event, recommendations: [recommendationItem] }}
          track={testTrack}
          highlightedRecommendationId={recommendationItem.id}
        />,
        { wrapper: MemoryRouter }
      );

      expect(scrollIntoViewSpy).not.toHaveBeenCalled();

      scrollIntoViewSpy.mockRestore();
    });
  });

  test('renders multiple responsibilities as a bullet list behind the expander', async () => {
    const user = userEvent.setup();
    const screen = render(
      <TimelineEventCard
        event={{
          ...event,
          responsibilities: [
            new Responsibility().id('job-1-r01').text('Lead frontend architecture').mock(),
            new Responsibility().id('job-1-r02').text('Mentor engineers').mock(),
          ],
        }}
        track={testTrack}
      />,
      { wrapper: MemoryRouter }
    );

    expect(screen.queryByText('Lead frontend architecture')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Show details' }));

    const responsibilitiesHeading = screen.getByRole('heading', {
      level: 4,
      name: 'Responsibilities',
    });
    // Section always wraps its heading in a <section>, so this is never null.
    const responsibilitiesSection = responsibilitiesHeading.closest('section')!;

    const items = within(responsibilitiesSection).getAllByRole('listitem');

    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('Lead frontend architecture');
    expect(items[1]).toHaveTextContent('Mentor engineers');
  });

  describe('scroll-fade animation', () => {
    // Global mock auto-fires isIntersecting: true; silent one reproduces "not yet reported".
    class SilentIntersectionObserver {
      observe = jest.fn();
      unobserve = jest.fn();
      disconnect = jest.fn();
      takeRecords = (): IntersectionObserverEntry[] => [];
      root = null;
      rootMargin = '';
      thresholds: ReadonlyArray<number> = [];
    }

    const originalIntersectionObserver = global.IntersectionObserver;

    beforeEach(() => {
      global.IntersectionObserver =
        SilentIntersectionObserver as unknown as typeof IntersectionObserver;
    });

    afterEach(() => {
      global.IntersectionObserver = originalIntersectionObserver;
    });

    test('the top card renders fully visible even before any IntersectionObserver callback fires', () => {
      const screen = render(<TimelineEventCard event={event} track={testTrack} startInView />, {
        wrapper: MemoryRouter,
      });

      expect(screen.getByText('Meridian Dynamics').closest('.MuiCard-root')).toHaveStyle({
        opacity: 1,
      });
    });

    test('a card below the fold stays hidden until the observer reports it as intersecting', () => {
      const screen = render(<TimelineEventCard event={event} track={testTrack} />, {
        wrapper: MemoryRouter,
      });

      expect(screen.getByText('Meridian Dynamics').closest('.MuiCard-root')).toHaveStyle({
        opacity: 0,
      });
    });
  });
});
