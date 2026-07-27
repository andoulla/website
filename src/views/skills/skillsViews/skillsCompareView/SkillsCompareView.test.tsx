import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { MemoryRouter } from 'react-router-dom';

import { TrackContextProvider } from '@/context/track';
import { SkillSummary, Track } from '@/testing';
import { getRecommendationsByIds } from '@/utils/getRecommendationsByIds';

import { SkillsViewContextProvider } from '../SkillsViewContext';

import { SkillsCompareView } from './SkillsCompareView';

jest.mock('@/utils/getRecommendationsByIds', () => ({
  getRecommendationsByIds: jest.fn(),
}));

const mockGetRecommendationsByIds = jest.mocked(getRecommendationsByIds);

const primaryTrack = new Track()
  .id('general')
  .label('General')
  .categories([
    {
      id: 'frontend',
      name: 'Frontend',
      subCategories: [{ id: 'core', name: 'Core', skillIds: ['react'] }],
    },
    {
      id: 'backend',
      name: 'Backend',
      subCategories: [{ id: 'server', name: 'Server', skillIds: ['node'] }],
    },
  ])
  .mock();

const compareTrack = new Track()
  .id('lead')
  .label('Lead')
  .categories([
    {
      id: 'frontend',
      name: 'Frontend',
      subCategories: [{ id: 'core', name: 'Core', skillIds: ['react'] }],
    },
    {
      id: 'leadership',
      name: 'Leadership',
      subCategories: [{ id: 'management', name: 'Management', skillIds: ['python'] }],
    },
  ])
  .mock();

const primarySkills = [
  new SkillSummary().id('react').skill('React').categoryId('frontend').subCategoryId('core').mock(),
  new SkillSummary()
    .id('node')
    .skill('Node.js')
    .categoryId('backend')
    .subCategoryId('server')
    .mock(),
];

const compareSkills = [
  new SkillSummary().id('react').skill('React').categoryId('frontend').subCategoryId('core').mock(),
  new SkillSummary()
    .id('python')
    .skill('Python')
    .categoryId('leadership')
    .subCategoryId('management')
    .mock(),
];

const renderCompareView = (overrides?: {
  compareSkills?: typeof compareSkills;
  compareTrack?: typeof compareTrack;
}) =>
  render(
    <MemoryRouter>
      <TrackContextProvider>
        <SkillsViewContextProvider
          track={primaryTrack}
          skills={primarySkills}
          filteredSkills={primarySkills}
          selectedCategories={[]}
          selectedSubCategories={[]}
          searchTerm=""
          onClearFilters={() => undefined}
        >
          <SkillsCompareView
            compareTrack={overrides?.compareTrack ?? compareTrack}
            compareSkills={overrides?.compareSkills ?? compareSkills}
          />
        </SkillsViewContextProvider>
      </TrackContextProvider>
    </MemoryRouter>
  );

beforeEach(() => {
  mockGetRecommendationsByIds.mockReturnValue([]);
});

describe('SkillsCompareView', () => {
  test('renders two labelled regions and a heading for each track', async () => {
    const screen = renderCompareView();

    expect(screen.getByRole('region', { name: 'General skills' })).toBeVisible();
    expect(screen.getByRole('region', { name: 'Lead skills' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'General' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Lead' })).toBeVisible();
    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('renders skills from both tracks', () => {
    const screen = renderCompareView();

    // React appears in both columns
    expect(screen.getAllByText('React')).toHaveLength(2);
    // Node.js only in primary
    expect(screen.getByText('Node.js')).toBeVisible();
    // Python only in compare
    expect(screen.getByText('Python')).toBeVisible();
  });

  test('shows "only here" label on the row for a skill unique to the primary track', () => {
    const screen = renderCompareView();

    // Node.js is only-a: its row in the primary column should carry the "only here" label
    const nodeRow = screen.getByText('Node.js').closest('tr');

    expect(nodeRow?.textContent).toContain('only here');
  });

  test('shows "only here" label on the row for a skill unique to the compare track', () => {
    const screen = renderCompareView();

    // Python is only-b: its row in the compare column should carry the "only here" label
    const pythonRow = screen.getByText('Python').closest('tr');

    expect(pythonRow?.textContent).toContain('only here');
  });

  test('shows "moved" label when a skill sits in a different category across tracks', async () => {
    // React is in 'frontend' in primary; in 'leadership' in movedCompareTrack → both-moved
    const movedCompareTrack = new Track()
      .id('lead')
      .label('Lead')
      .categories([
        {
          id: 'leadership',
          name: 'Leadership',
          subCategories: [{ id: 'management', name: 'Management', skillIds: ['react'] }],
        },
      ])
      .mock();

    const movedCompareSkills = [
      new SkillSummary()
        .id('react')
        .skill('React')
        .categoryId('leadership')
        .subCategoryId('management')
        .mock(),
    ];
    const screen = renderCompareView({
      compareTrack: movedCompareTrack,
      compareSkills: movedCompareSkills,
    });

    // React is both-moved: at least one "moved" label visible
    const movedLabels = screen.getAllByText('moved');

    expect(movedLabels.length).toBeGreaterThanOrEqual(1);
    expect(await axe(screen.container)).toHaveNoViolations();
  });
});
