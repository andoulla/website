import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { MemoryRouter } from 'react-router-dom';

import { Recommendation, TimelineEvent } from '@/testing';

import { TimelineEventCard } from './TimelineEventCard';

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
});
