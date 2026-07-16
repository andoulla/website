import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { MemoryRouter } from 'react-router-dom';

import { TrackContextProvider } from '@/context/track';
import { SkillSummary } from '@/testing';

import { SkillsBarChart } from './SkillsBarChart';

const SKILLS = [
  new SkillSummary().years(4).mock(),
  new SkillSummary()
    .id('mentoring')
    .skill('Mentoring')
    .years(2)
    .categoryId('people-stakeholders')
    .categoryName('People & Stakeholders')
    .categoryIndex(2)
    .colour('plum')
    .companyYears([{ name: 'Globex', years: 2 }])
    .mock(),
];

// TrackContextProvider backs the track-carrying links inside the skill tooltip.
const renderBarChart = (props: Parameters<typeof SkillsBarChart>[0]) =>
  render(
    <MemoryRouter>
      <TrackContextProvider>
        <SkillsBarChart {...props} />
      </TrackContextProvider>
    </MemoryRouter>
  );

describe('SkillsBarChart', () => {
  test('renders the accessible table with a row per skill plus a header', async () => {
    const screen = renderBarChart({ skills: SKILLS });

    // thead row + 2 data rows = 3
    expect(screen.getAllByRole('row')).toHaveLength(3);
    expect(screen.getByText('React')).toBeVisible();
    expect(screen.getByText('Mentoring')).toBeVisible();
    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('renders legend entries for categories present in skills', () => {
    const screen = renderBarChart({ skills: SKILLS });

    // Each label appears twice: once in the legend and once in the accessible table
    expect(screen.getAllByText('Frontend Development')).toHaveLength(2);
    expect(screen.getAllByText('People & Stakeholders')).toHaveLength(2);
  });

  test('renders legend entries when showPatterns is false', async () => {
    const screen = renderBarChart({ skills: SKILLS, showPatterns: false });

    expect(screen.getAllByText('Frontend Development')).toHaveLength(2);
    expect(screen.getAllByText('People & Stakeholders')).toHaveLength(2);
    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('does not render a legend entry for absent categories', () => {
    const screen = renderBarChart({ skills: SKILLS });

    expect(screen.queryByText('Leadership')).not.toBeInTheDocument();
    expect(screen.queryByText('Tooling')).not.toBeInTheDocument();
  });

  describe('bar hover tooltip', () => {
    beforeEach(() => {
      // Recharts' ResponsiveContainer measures via getBoundingClientRect, always 0 in jsdom —
      // without a non-zero size it never renders the bars these tests hover.
      jest
        .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
        .mockReturnValue(new DOMRect(0, 0, 500, 300));
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test('shows the "View on Resume" link when hovering a bar', async () => {
      const user = userEvent.setup();
      const screen = renderBarChart({ skills: SKILLS });
      const [bar] = screen.container.querySelectorAll('g.recharts-bar-rectangle');

      await user.hover(bar);

      expect(await screen.findByRole('link', { name: 'View on Resume' })).toHaveAttribute(
        'href',
        '/?skill=React&track=general'
      );
    });
  });
});
