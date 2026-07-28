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

  test('renders a legend explaining diff markers', async () => {
    const screen = renderCompareView();

    expect(screen.getByText('This track only')).toBeVisible();
    expect(screen.getByText('In different categories')).toBeVisible();
    expect(await axe(screen.container)).toHaveNoViolations();
  });
});
