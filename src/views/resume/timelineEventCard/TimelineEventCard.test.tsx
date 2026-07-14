import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { MemoryRouter, useLocation } from 'react-router-dom';

import { Recommendation, Responsibility, TimelineEvent } from '@/testing';

import { TimelineEventCard } from './TimelineEventCard';

const LocationDisplay = () => {
  const location = useLocation();
  return <span>{`location:${location.pathname}${location.search}`}</span>;
};

const event = new TimelineEvent()
  .companyName('Meridian Dynamics')
  .title('Staff Frontend Engineer')
  .location('London, UK')
  .startDate('2022-04-01')
  .responsibilities([
    new Responsibility().id('job-1-r01').text('Lead frontend architecture').mock(),
  ])
  .skills(['React', 'TypeScript'])
  .techStack(['React', 'TypeScript'])
  .mock();

const recommendationItem = new Recommendation()
  .authorInitials('P.S.')
  .authorRole({ jobTitle: 'Engineering Manager' })
  .text('Great work.')
  .postedDate('2023-06-12')
  .mock();

describe('TimelineEventCard', () => {
  test('renders company details, responsibilities, and skills', () => {
    const screen = render(<TimelineEventCard event={event} />, {
      wrapper: MemoryRouter,
    });

    expect(screen.getByText('Meridian Dynamics')).toBeVisible();
    expect(
      screen.getByText('Staff Frontend Engineer · London, UK · Apr 2022 – Present')
    ).toBeVisible();
    expect(screen.getByText('Lead frontend architecture')).toBeVisible();
    expect(screen.getByText('React')).toBeVisible();
    expect(screen.getByText('TypeScript')).toBeVisible();
  });

  test('groups skills by category, omitting categories with no matching skills', () => {
    const screen = render(
      <TimelineEventCard event={{ ...event, skills: ['React', 'Team Leadership'] }} />,
      { wrapper: MemoryRouter }
    );

    expect(screen.getByText('Engineering:')).toBeVisible();
    expect(screen.getByText('React')).toBeVisible();
    expect(screen.getByText('Leadership & Delivery:')).toBeVisible();
    expect(screen.getByText('Team Leadership')).toBeVisible();
    expect(screen.queryByText('Tooling:')).not.toBeInTheDocument();
  });

  test('places the company and its sections correctly in the heading hierarchy', () => {
    const screen = render(<TimelineEventCard event={event} />, {
      wrapper: MemoryRouter,
    });

    expect(screen.getByRole('heading', { level: 3, name: 'Meridian Dynamics' })).toBeVisible();
    expect(screen.getByRole('heading', { level: 4, name: 'Tech Stack' })).toBeVisible();
    expect(screen.getByRole('heading', { level: 4, name: 'Responsibilities' })).toBeVisible();
    expect(screen.getByRole('heading', { level: 4, name: 'Key Skills' })).toBeVisible();
  });

  test('renders tech stack items as comma-separated text', () => {
    const screen = render(
      <TimelineEventCard event={{ ...event, techStack: ['Vite', 'Jest', 'Playwright'] }} />,
      { wrapper: MemoryRouter }
    );

    expect(screen.getByRole('heading', { level: 4, name: 'Tech Stack' })).toBeVisible();
    expect(screen.getByText('Vite, Jest, Playwright')).toBeVisible();
  });

  test('renders the end month for a past role instead of "Present"', () => {
    const screen = render(<TimelineEventCard event={{ ...event, endDate: '2023-09-30' }} />, {
      wrapper: MemoryRouter,
    });

    expect(
      screen.getByText('Staff Frontend Engineer · London, UK · Apr 2022 – Sep 2023')
    ).toBeVisible();
  });

  test('renders recommendations when present', async () => {
    const screen = render(
      <TimelineEventCard event={{ ...event, recommendations: [recommendationItem] }} />,
      { wrapper: MemoryRouter }
    );

    expect(screen.getByText('Recommendations (1)')).toBeVisible();
    expect(screen.getByText('P.S. · Engineering Manager · 12 Jun 2023')).toBeVisible();
    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('omits the Recommendations section when there are none', async () => {
    const screen = render(<TimelineEventCard event={event} />, {
      wrapper: MemoryRouter,
    });

    expect(screen.queryByText('Recommendations')).not.toBeInTheDocument();
    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('navigates to the skill page when a skill tag is clicked', async () => {
    const user = userEvent.setup();
    const screen = render(
      <MemoryRouter>
        <TimelineEventCard event={event} />
        <LocationDisplay />
      </MemoryRouter>
    );

    await user.click(screen.getByText('React'));

    expect(screen.getByText('location:/skills?skill=React')).toBeVisible();
  });

  test('navigates to the skills page with all of the role skills when "View this role\'s skills on the graph" is clicked', async () => {
    const user = userEvent.setup();
    const screen = render(
      <MemoryRouter>
        <TimelineEventCard event={event} />
        <LocationDisplay />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: "View this role's skills on the graph" }));

    expect(screen.getByText('location:/skills?skill=React&skill=TypeScript')).toBeVisible();
  });

  test('omits the Key Skills section, including its button, when the role has no skills', () => {
    const screen = render(<TimelineEventCard event={{ ...event, skills: [] }} />, {
      wrapper: MemoryRouter,
    });

    expect(screen.queryByRole('heading', { level: 4, name: 'Key Skills' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: "View this role's skills on the graph" })
    ).not.toBeInTheDocument();
  });

  test('omits the Tech Stack section when there is no tech stack', () => {
    const screen = render(<TimelineEventCard event={{ ...event, techStack: [] }} />, {
      wrapper: MemoryRouter,
    });

    expect(screen.queryByRole('heading', { level: 4, name: 'Tech Stack' })).not.toBeInTheDocument();
  });

  test('shows a "Description" heading instead of "Responsibilities" for an education entry', () => {
    const screen = render(<TimelineEventCard event={{ ...event, type: 'education' }} />, {
      wrapper: MemoryRouter,
    });

    expect(screen.getByRole('heading', { level: 4, name: 'Description' })).toBeVisible();
    expect(
      screen.queryByRole('heading', { level: 4, name: 'Responsibilities' })
    ).not.toBeInTheDocument();
  });

  describe('highlight and scroll', () => {
    test('applies an outline when highlightedSkill matches one of the role skills', () => {
      const screen = render(<TimelineEventCard event={event} highlightedSkill="React" />, {
        wrapper: MemoryRouter,
      });

      expect(screen.getByText('Meridian Dynamics').closest('.MuiCard-root')).toHaveStyle({
        outlineOffset: '2px',
      });
    });

    test('does not apply an outline when highlightedSkill matches none of the role skills', () => {
      const screen = render(<TimelineEventCard event={event} highlightedSkill="Kubernetes" />, {
        wrapper: MemoryRouter,
      });

      expect(screen.getByText('Meridian Dynamics').closest('.MuiCard-root')).not.toHaveStyle({
        outlineOffset: '2px',
      });
    });

    test('scrolls into view when autoScrollToHighlight is true', () => {
      const scrollIntoViewSpy = jest.spyOn(HTMLElement.prototype, 'scrollIntoView');

      render(<TimelineEventCard event={event} highlightedSkill="React" autoScrollToHighlight />, {
        wrapper: MemoryRouter,
      });

      expect(scrollIntoViewSpy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' });

      scrollIntoViewSpy.mockRestore();
    });

    test('does not scroll when matching but autoScrollToHighlight is false', () => {
      const scrollIntoViewSpy = jest.spyOn(HTMLElement.prototype, 'scrollIntoView');

      render(<TimelineEventCard event={event} highlightedSkill="React" />, {
        wrapper: MemoryRouter,
      });

      expect(scrollIntoViewSpy).not.toHaveBeenCalled();

      scrollIntoViewSpy.mockRestore();
    });

    test('does not scroll when there is no highlighted skill', () => {
      const scrollIntoViewSpy = jest.spyOn(HTMLElement.prototype, 'scrollIntoView');

      render(<TimelineEventCard event={event} />, { wrapper: MemoryRouter });

      expect(scrollIntoViewSpy).not.toHaveBeenCalled();

      scrollIntoViewSpy.mockRestore();
    });

    test('applies an outline when highlightedRecommendationId matches one of the role recommendations', () => {
      const screen = render(
        <TimelineEventCard
          event={{ ...event, recommendations: [recommendationItem] }}
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
          highlightedRecommendationId={recommendationItem.id}
        />,
        { wrapper: MemoryRouter }
      );

      expect(scrollIntoViewSpy).not.toHaveBeenCalled();

      scrollIntoViewSpy.mockRestore();
    });
  });

  test('renders multiple responsibilities as a bullet list', () => {
    const screen = render(
      <TimelineEventCard
        event={{
          ...event,
          responsibilities: [
            new Responsibility().id('job-1-r01').text('Lead frontend architecture').mock(),
            new Responsibility().id('job-1-r02').text('Mentor engineers').mock(),
          ],
        }}
      />,
      { wrapper: MemoryRouter }
    );

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
});
