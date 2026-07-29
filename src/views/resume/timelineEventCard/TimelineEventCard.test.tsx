import { createTheme } from '@mui/material/styles';
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

    expect(screen.getByText('Meridian Dynamics · Apr 2022 – Present')).toBeVisible();
    expect(screen.getByText('Staff Frontend Engineer · London, UK')).toBeVisible();
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

    // Tech Stack shows React and TypeScript as clickable links
    const techStackHeading = screen.getByRole('heading', {
      level: 4,
      name: 'Tech Stack',
    });
    const techStackSection = techStackHeading.closest('section')!;
    expect(within(techStackSection).getByRole('button', { name: 'React' })).toBeVisible();
    expect(within(techStackSection).getByRole('button', { name: 'TypeScript' })).toBeVisible();

    expect(screen.queryByText('Engineering:')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Show key skills' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );

    await user.click(screen.getByRole('button', { name: 'Show key skills' }));

    // Key Skills section also has React and TypeScript
    const keySkillsHeading = screen.getByRole('heading', {
      level: 4,
      name: 'Key Skills',
    });
    const keySkillsSection = keySkillsHeading.closest('section')!;
    expect(within(keySkillsSection).getByRole('button', { name: 'React' })).toBeVisible();
    expect(within(keySkillsSection).getByRole('button', { name: 'TypeScript' })).toBeVisible();
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

    const screen = render(
      <TimelineEventCard
        event={{
          ...event,
          skills: [
            reactSkill,
            leadershipSkill,
            new Skill().id('kubernetes').name('Kubernetes').type('skill').mock(),
          ],
        }}
        track={testTrack}
      />,
      { wrapper: MemoryRouter }
    );

    await user.click(screen.getByRole('button', { name: 'Show details' }));
    await user.click(screen.getByRole('button', { name: 'Show key skills' }));

    const keySkillsHeading = screen.getByRole('heading', {
      level: 4,
      name: 'Key Skills',
    });
    const keySkillsSection = keySkillsHeading.closest('section')!;

    expect(within(keySkillsSection).getByText('Engineering:')).toBeVisible();
    expect(within(keySkillsSection).getByText('React')).toBeVisible();
    expect(within(keySkillsSection).getByText('Leadership & Delivery:')).toBeVisible();
    expect(within(keySkillsSection).getByText('Team Leadership')).toBeVisible();
    expect(screen.queryByText('Kubernetes')).not.toBeInTheDocument();
  });

  test('renders the key skills as an inline comma list of links, not chips', async () => {
    const user = userEvent.setup();
    const screen = render(<TimelineEventCard event={event} track={testTrack} />, {
      wrapper: MemoryRouter,
    });

    await user.click(screen.getByRole('button', { name: 'Show details' }));
    await user.click(screen.getByRole('button', { name: 'Show key skills' }));

    const keySkillsHeading = screen.getByRole('heading', {
      level: 4,
      name: 'Key Skills',
    });
    const keySkillsSection = keySkillsHeading.closest('section')!;

    expect(within(keySkillsSection).getByRole('button', { name: 'React' })).toBeVisible();
    expect(within(keySkillsSection).getByRole('button', { name: 'TypeScript' })).toBeVisible();
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

    expect(
      screen.getByRole('heading', { level: 3, name: 'Meridian Dynamics · Apr 2022 – Present' })
    ).toBeVisible();

    const sectionHeadings = screen.getAllByRole('heading', { level: 4 });

    expect(sectionHeadings.map((heading) => heading.textContent)).toEqual([
      'Responsibilities',
      'Tech Stack',
      'Key Skills',
    ]);
  });

  test('renders tech stack items as clickable links grouped by category', async () => {
    const user = userEvent.setup();

    const screen = render(
      <TimelineEventCard
        event={{
          ...event,
          techStack: [
            new Skill().id('vite').name('Vite').type('tech').mock(),
            new Skill().id('jest').name('Jest').type('tech').mock(),
            new Skill().id('playwright').name('Playwright').type('tech').mock(),
          ],
        }}
        track={testTrack}
      />,
      { wrapper: MemoryRouter }
    );

    await user.click(screen.getByRole('button', { name: 'Show details' }));

    const techStackHeading = screen.getByRole('heading', {
      level: 4,
      name: 'Tech Stack',
    });
    const techStackSection = techStackHeading.closest('section')!;

    expect(techStackHeading).toBeVisible();
    expect(within(techStackSection).getByRole('button', { name: 'Vite' })).toBeVisible();
    expect(within(techStackSection).getByRole('button', { name: 'Jest' })).toBeVisible();
    expect(within(techStackSection).getByRole('button', { name: 'Playwright' })).toBeVisible();
  });

  test('renders the end month for a past role instead of "Present"', () => {
    const screen = render(
      <TimelineEventCard event={{ ...event, endDate: '2023-09-30' }} track={testTrack} />,
      { wrapper: MemoryRouter }
    );

    expect(screen.getByText('Meridian Dynamics · Apr 2022 – Sep 2023')).toBeVisible();
    expect(screen.getByText('Staff Frontend Engineer · London, UK')).toBeVisible();
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
    // Byline link should be visible after expansion
    expect(screen.getByRole('link')).toBeVisible();
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

    expect(screen.getByText('Meridian Dynamics · Apr 2022 – Present')).toBeVisible();
    expect(screen.getByText('Staff Frontend Engineer · London, UK')).toBeVisible();
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

    const viewGraphButton = screen.getByRole('button', {
      name: "View this role's skills on the graph",
    });

    expect(within(viewGraphButton).getByTestId('InsightsOutlinedIcon')).toBeVisible();

    await user.click(viewGraphButton);

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

  test('Tech Stack skills are clickable and grouped by category', async () => {
    const user = userEvent.setup();
    const screen = render(<TimelineEventCard event={event} track={testTrack} />, {
      wrapper: MemoryRouter,
    });

    await user.click(screen.getByRole('button', { name: 'Show details' }));

    const techStackHeading = screen.getByRole('heading', {
      level: 4,
      name: 'Tech Stack',
    });
    const techStackSection = techStackHeading.closest('section')!;

    // Category label should be visible
    expect(within(techStackSection).getByRole('button', { name: 'Engineering:' })).toBeVisible();
    // Skills should be clickable buttons
    expect(within(techStackSection).getByRole('button', { name: 'React' })).toBeVisible();
    expect(within(techStackSection).getByRole('button', { name: 'TypeScript' })).toBeVisible();
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

      expect(
        screen
          .getByRole('heading', { level: 3, name: /Meridian Dynamics/ })
          .closest('.MuiCard-root')
      ).toHaveStyle({
        outlineOffset: '2px',
      });
    });

    test('does not apply an outline when highlightedSkillId matches none of the role skills', () => {
      const screen = render(
        <TimelineEventCard event={event} track={testTrack} highlightedSkillId="kubernetes" />,
        { wrapper: MemoryRouter }
      );

      expect(
        screen
          .getByRole('heading', { level: 3, name: /Meridian Dynamics/ })
          .closest('.MuiCard-root')
      ).not.toHaveStyle({
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

      expect(
        screen
          .getByRole('heading', { level: 3, name: /Meridian Dynamics/ })
          .closest('.MuiCard-root')
      ).toHaveStyle({
        outlineOffset: '2px',
      });
      expect(screen.getByRole('button', { name: 'Hide details' })).toBeVisible();
    });

    test('does not apply an outline when highlightedEventId matches a different event', () => {
      const screen = render(
        <TimelineEventCard event={event} track={testTrack} highlightedEventId="job-2" />,
        { wrapper: MemoryRouter }
      );

      expect(
        screen
          .getByRole('heading', { level: 3, name: /Meridian Dynamics/ })
          .closest('.MuiCard-root')
      ).not.toHaveStyle({
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

      expect(
        screen
          .getByRole('heading', { level: 3, name: /Meridian Dynamics/ })
          .closest('.MuiCard-root')
      ).toHaveStyle({
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

  describe('Key Skills visual hierarchy', () => {
    test('category labels and skill links are both rendered and clickable with distinct hierarchy', async () => {
      const user = userEvent.setup();
      const leadershipSkill = new Skill()
        .id('team-leadership')
        .name('Team Leadership')
        .type('skill')
        .mock();

      const screen = render(
        <MemoryRouter>
          <TimelineEventCard
            event={{
              ...event,
              skills: [reactSkill, typeScriptSkill, leadershipSkill],
            }}
            track={testTrack}
          />
          <LocationDisplay />
        </MemoryRouter>
      );

      await user.click(screen.getByRole('button', { name: 'Show details' }));
      await user.click(screen.getByRole('button', { name: 'Show key skills' }));

      // Category labels are visible and clickable
      const engineeringLabel = screen.getByRole('button', { name: 'Engineering:' });
      const leadershipLabel = screen.getByRole('button', { name: 'Leadership & Delivery:' });

      expect(engineeringLabel).toBeVisible();
      expect(leadershipLabel).toBeVisible();

      // Skill links are visible and clickable
      expect(screen.getByRole('button', { name: 'React' })).toBeVisible();
      expect(screen.getByRole('button', { name: 'TypeScript' })).toBeVisible();
      expect(screen.getByRole('button', { name: 'Team Leadership' })).toBeVisible();

      // Verify category label is clickable and navigates
      await user.click(engineeringLabel);

      expect(
        screen.getByText('location:/skills?category=engineering&view=barchart&track=general')
      ).toBeVisible();
    });
  });

  describe('Key Skills collapsed taster', () => {
    test('always shows the "Key Skills" heading, with a skill/category count taster while collapsed, replaced by the full skill list on expand', async () => {
      const user = userEvent.setup();
      const leadershipSkill = new Skill()
        .id('team-leadership')
        .name('Team Leadership')
        .type('skill')
        .mock();

      const screen = render(
        <TimelineEventCard
          event={{ ...event, skills: [reactSkill, leadershipSkill] }}
          track={testTrack}
        />,
        { wrapper: MemoryRouter }
      );

      await user.click(screen.getByRole('button', { name: 'Show details' }));

      expect(screen.getByRole('heading', { level: 4, name: 'Key Skills' })).toBeVisible();
      expect(screen.getByText('2+ skills across 2 categories')).toBeVisible();
      expect(screen.queryByText('React')).not.toBeInTheDocument();
      expect(screen.queryByText('Team Leadership')).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Show key skills' }));

      expect(screen.getByRole('heading', { level: 4, name: 'Key Skills' })).toBeVisible();
      expect(screen.queryByText('2+ skills across 2 categories')).not.toBeInTheDocument();
      expect(screen.getByText('React')).toBeVisible();
      expect(screen.getByText('Team Leadership')).toBeVisible();
    });
  });

  describe('key skills mobile layout', () => {
    const originalMatchMedia = window.matchMedia;
    // useMediaQuery strips the leading "@media " prefix before calling matchMedia(query).
    const mobileSkillsQuery = createTheme()
      .breakpoints.down('md')
      .replace(/^@media ?/, '');

    const mockViewport = (isMobile: boolean) => {
      window.matchMedia = jest.fn().mockImplementation((query: string) => ({
        matches: query === mobileSkillsQuery ? isMobile : false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));
    };

    afterEach(() => {
      window.matchMedia = originalMatchMedia;
    });

    test('below md, stacks each key skill on its own tappable line with no comma separators, and each link comfortably clears a 44px tap target', async () => {
      mockViewport(true);

      const user = userEvent.setup();
      const screen = render(<TimelineEventCard event={event} track={testTrack} />, {
        wrapper: MemoryRouter,
      });

      await user.click(screen.getByRole('button', { name: 'Show details' }));
      await user.click(screen.getByRole('button', { name: 'Show key skills' }));

      // Scope to Key Skills section to avoid ambiguity with Tech Stack
      const keySkillsSection = screen
        .getByRole('heading', { level: 4, name: 'Key Skills' })
        .closest('section')!;

      const reactSkillLink = within(keySkillsSection).getByRole('button', { name: 'React' });
      const typeScriptSkillLink = within(keySkillsSection).getByRole('button', {
        name: 'TypeScript',
      });

      expect(reactSkillLink).toBeVisible();
      expect(typeScriptSkillLink).toBeVisible();
      expect(keySkillsSection.textContent).not.toContain(',');
      expect(reactSkillLink).toHaveStyle({ minHeight: '44px' });
      expect(typeScriptSkillLink).toHaveStyle({ minHeight: '44px' });
      expect(await axe(screen.container)).toHaveNoViolations();
    });

    test('at md and up, keeps the existing inline comma-separated key skills layout', async () => {
      mockViewport(false);

      const user = userEvent.setup();
      const screen = render(<TimelineEventCard event={event} track={testTrack} />, {
        wrapper: MemoryRouter,
      });

      await user.click(screen.getByRole('button', { name: 'Show details' }));
      await user.click(screen.getByRole('button', { name: 'Show key skills' }));

      const keySkillsSection = screen
        .getByRole('heading', { level: 4, name: 'Key Skills' })
        .closest('section')!;

      expect(keySkillsSection.textContent).toContain('React, TypeScript');
    });
  });

  describe('collapse trigger styling', () => {
    test('card-level "Show details" button uses outlined variant', () => {
      const screen = render(<TimelineEventCard event={event} track={testTrack} />, {
        wrapper: MemoryRouter,
      });

      const showDetailsButton = screen.getByRole('button', { name: 'Show details' });

      expect(showDetailsButton).toHaveClass('MuiButton-outlined');
    });

    test('section-level "Show key skills" button uses text variant', async () => {
      const user = userEvent.setup();
      const screen = render(<TimelineEventCard event={event} track={testTrack} />, {
        wrapper: MemoryRouter,
      });

      await user.click(screen.getByRole('button', { name: 'Show details' }));

      const showSkillsButton = screen.getByRole('button', { name: 'Show key skills' });

      expect(showSkillsButton).toHaveClass('MuiButton-text');
    });

    test('key skills section starts collapsed by default', async () => {
      const user = userEvent.setup();
      const screen = render(<TimelineEventCard event={event} track={testTrack} />, {
        wrapper: MemoryRouter,
      });

      await user.click(screen.getByRole('button', { name: 'Show details' }));

      expect(screen.queryByText('Engineering:')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Show key skills' })).toHaveAttribute(
        'aria-expanded',
        'false'
      );
    });

    test('key skills section expands when there is a highlighted skill', () => {
      const screen = render(
        <TimelineEventCard event={event} track={testTrack} highlightedSkillId="react" />,
        { wrapper: MemoryRouter }
      );

      expect(screen.getByText('Engineering:')).toBeVisible();
      expect(screen.getByRole('button', { name: 'Hide key skills' })).toHaveAttribute(
        'aria-expanded',
        'true'
      );
    });
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

      expect(
        screen.getByText('Meridian Dynamics · Apr 2022 – Present').closest('.MuiCard-root')
      ).toHaveStyle({
        opacity: 1,
      });
    });

    test('a card below the fold stays hidden until the observer reports it as intersecting', () => {
      const screen = render(<TimelineEventCard event={event} track={testTrack} />, {
        wrapper: MemoryRouter,
      });

      expect(
        screen.getByText('Meridian Dynamics · Apr 2022 – Present').closest('.MuiCard-root')
      ).toHaveStyle({
        opacity: 0,
      });
    });
  });

  describe('layout and spacing', () => {
    test('renders multiple recommendations and allows expanding/collapsing each', async () => {
      const user = userEvent.setup();
      const recommendation1 = new Recommendation()
        .id('rec-1')
        .authorInitials('P.S.')
        .authorRole({ jobTitle: 'Engineering Manager' })
        .text('Great work.')
        .postedDate('2023-06-12')
        .mock();
      const recommendation2 = new Recommendation()
        .id('rec-2')
        .authorInitials('A.B.')
        .authorRole({ jobTitle: 'Senior Manager' })
        .text('Excellent collaboration.')
        .postedDate('2023-12-15')
        .mock();

      const multiRecommendationEvent = {
        ...event,
        recommendations: [recommendation1, recommendation2],
      };

      const screen = render(
        <TimelineEventCard event={multiRecommendationEvent} track={testTrack} />,
        { wrapper: MemoryRouter }
      );

      await user.click(screen.getByRole('button', { name: 'Show details' }));

      expect(
        screen.getByRole('heading', {
          level: 4,
          name: 'Recommendations (2)',
        })
      ).toBeVisible();

      // Both recommendations are visible with their content
      expect(screen.getByText('"Great work."')).toBeVisible();
      expect(screen.getByText('"Excellent collaboration."')).toBeVisible();
      expect(screen.getByText('Engineering Manager')).toBeVisible();
      expect(screen.getByText('Senior Manager')).toBeVisible();

      // Can collapse and expand individual recommendations
      const showRecommendationButtons = screen.getAllByRole('button', {
        name: 'Show recommendation',
      });

      expect(showRecommendationButtons.length).toBeGreaterThanOrEqual(2);
    });

    test('renders all main content sections visible when expanded', async () => {
      const user = userEvent.setup();
      const screen = render(<TimelineEventCard event={event} track={testTrack} />, {
        wrapper: MemoryRouter,
      });

      await user.click(screen.getByRole('button', { name: 'Show details' }));
      await user.click(screen.getByRole('button', { name: 'Show key skills' }));

      // All major sections should be visible (they are wrapped in max-width containers)
      expect(screen.getByRole('heading', { level: 4, name: 'Responsibilities' })).toBeVisible();
      expect(screen.getByRole('heading', { level: 4, name: 'Tech Stack' })).toBeVisible();
      expect(screen.getByRole('heading', { level: 4, name: 'Key Skills' })).toBeVisible();
      expect(await axe(screen.container)).toHaveNoViolations();
    });

    test('renders recommendations section with proper structure', async () => {
      const user = userEvent.setup();
      const secondRecommendation = new Recommendation()
        .id('rec-2')
        .authorInitials('A.B.')
        .authorRole({ jobTitle: 'Senior Manager' })
        .text('Excellent collaboration.')
        .postedDate('2023-12-15')
        .mock();

      const multiRecommendationEvent = {
        ...event,
        recommendations: [recommendationItem, secondRecommendation],
      };

      const screen = render(
        <TimelineEventCard event={multiRecommendationEvent} track={testTrack} />,
        { wrapper: MemoryRouter }
      );

      await user.click(screen.getByRole('button', { name: 'Show details' }));

      // Verify recommendations section exists and is visible
      const recommendationsHeading = screen.getByRole('heading', {
        level: 4,
        name: 'Recommendations (2)',
      });

      expect(recommendationsHeading).toBeVisible();
      expect(await axe(screen.container)).toHaveNoViolations();
    });

    test('reduces divider usage: no divider between responsibilities and tech stack', async () => {
      const user = userEvent.setup();
      const eventWithTechStack = {
        ...event,
        responsibilities: [
          new Responsibility().id('job-1-r01').text('Lead frontend architecture').mock(),
        ],
      };

      const screen = render(<TimelineEventCard event={eventWithTechStack} track={testTrack} />, {
        wrapper: MemoryRouter,
      });

      await user.click(screen.getByRole('button', { name: 'Show details' }));

      // Get all dividers in the CardContent
      const allDividers = screen.container.querySelectorAll('.MuiDivider-root');

      // There should be no dividers before the recommendations section in this card
      // (this event has no recommendations, so no dividers at all)
      expect(allDividers.length).toBe(0);
    });

    test('keeps divider only before recommendations section', async () => {
      const user = userEvent.setup();
      const eventWithRecommendations = {
        ...event,
        recommendations: [
          new Recommendation()
            .id('rec-1')
            .authorInitials('P.S.')
            .authorRole({ jobTitle: 'Engineering Manager' })
            .text('Great work.')
            .postedDate('2023-06-12')
            .mock(),
        ],
      };

      const screen = render(
        <TimelineEventCard event={eventWithRecommendations} track={testTrack} />,
        { wrapper: MemoryRouter }
      );

      await user.click(screen.getByRole('button', { name: 'Show details' }));

      // There should be exactly one divider (before Recommendations)
      const allDividers = screen.container.querySelectorAll('.MuiDivider-root');

      expect(allDividers.length).toBe(1);

      // The divider should be before the Recommendations section
      const recommendationsHeading = screen.getByRole('heading', {
        level: 4,
        name: 'Recommendations (1)',
      });

      expect(recommendationsHeading).toBeVisible();
    });
  });
});
