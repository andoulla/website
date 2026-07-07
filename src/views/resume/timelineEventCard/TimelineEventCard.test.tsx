import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { MemoryRouter, useLocation } from 'react-router-dom';

import { Recommendation, TimelineEvent } from '@/testing';

import { TimelineEventCard } from './TimelineEventCard';

const LocationDisplay = () => {
  const location = useLocation();
  return <span>{`location:${location.pathname}${location.search}`}</span>;
};

const experience = new TimelineEvent()
  .companyName('Nimbus Analytics')
  .title('Staff Frontend Engineer')
  .location('London, UK')
  .startDate('2022-04-01')
  .responsibilities(['Lead frontend architecture'])
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
    const screen = render(<TimelineEventCard experience={experience} />, {
      wrapper: MemoryRouter,
    });

    expect(screen.getByText('Nimbus Analytics')).toBeVisible();
    expect(
      screen.getByText('Staff Frontend Engineer · London, UK · Apr 2022 – Present')
    ).toBeVisible();
    expect(screen.getByText('Lead frontend architecture')).toBeVisible();
    expect(screen.getByText('React')).toBeVisible();
    expect(screen.getByText('TypeScript')).toBeVisible();
  });

  test('places the company and its sections correctly in the heading hierarchy', () => {
    const screen = render(<TimelineEventCard experience={experience} />, {
      wrapper: MemoryRouter,
    });

    expect(screen.getByRole('heading', { level: 3, name: 'Nimbus Analytics' })).toBeVisible();
    expect(screen.getByRole('heading', { level: 4, name: 'Tech Stack' })).toBeVisible();
    expect(screen.getByRole('heading', { level: 4, name: 'Responsibilities' })).toBeVisible();
    expect(screen.getByRole('heading', { level: 4, name: 'Key Skills' })).toBeVisible();
  });

  test('renders tech stack items as comma-separated text', () => {
    const screen = render(
      <TimelineEventCard
        experience={{ ...experience, techStack: ['Vite', 'Jest', 'Playwright'] }}
      />,
      { wrapper: MemoryRouter }
    );

    expect(screen.getByRole('heading', { level: 4, name: 'Tech Stack' })).toBeVisible();
    expect(screen.getByText('Vite, Jest, Playwright')).toBeVisible();
  });

  test('renders the end month for a past role instead of "Present"', () => {
    const screen = render(
      <TimelineEventCard experience={{ ...experience, endDate: '2023-09-30' }} />,
      { wrapper: MemoryRouter }
    );

    expect(
      screen.getByText('Staff Frontend Engineer · London, UK · Apr 2022 – Sep 2023')
    ).toBeVisible();
  });

  test('renders recommendations when present', () => {
    const screen = render(
      <TimelineEventCard experience={{ ...experience, recommendations: [recommendationItem] }} />,
      { wrapper: MemoryRouter }
    );

    expect(screen.getByText('Recommendations')).toBeVisible();
    expect(screen.getByText('P.S., Engineering Manager · 12 Jun 2023')).toBeVisible();
  });

  test('omits the Recommendations section when there are none', () => {
    const screen = render(<TimelineEventCard experience={experience} />, {
      wrapper: MemoryRouter,
    });

    expect(screen.queryByText('Recommendations')).not.toBeInTheDocument();
  });

  test('has no axe violations without recommendations', async () => {
    const screen = render(<TimelineEventCard experience={experience} />, {
      wrapper: MemoryRouter,
    });

    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('has no axe violations with recommendations', async () => {
    const screen = render(
      <TimelineEventCard experience={{ ...experience, recommendations: [recommendationItem] }} />,
      { wrapper: MemoryRouter }
    );

    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('navigates to the skill page when a skill tag is clicked', async () => {
    const user = userEvent.setup();
    const screen = render(
      <MemoryRouter>
        <TimelineEventCard experience={experience} />
        <LocationDisplay />
      </MemoryRouter>
    );

    await user.click(screen.getByText('React'));

    expect(screen.getByText('location:/skills?skill=React')).toBeVisible();
  });

  test('omits the Tech Stack section when there is no tech stack', () => {
    const screen = render(<TimelineEventCard experience={{ ...experience, techStack: [] }} />, {
      wrapper: MemoryRouter,
    });

    expect(screen.queryByRole('heading', { level: 4, name: 'Tech Stack' })).not.toBeInTheDocument();
  });

  test('renders multiple responsibilities as a bullet list', () => {
    const screen = render(
      <TimelineEventCard
        experience={{
          ...experience,
          responsibilities: ['Lead frontend architecture', 'Mentor engineers'],
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
