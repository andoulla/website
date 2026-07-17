import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { alpha, createTheme } from '@mui/material/styles';
import { MemoryRouter } from 'react-router-dom';

import { TrackContextProvider } from '@/context/track';
import { SkillSummary, Track } from '@/testing';

import type { CategoryGroup } from '../SkillsTableView.types';

import { SkillsTable } from './SkillsTable';

const SKILLS = [
  new SkillSummary().skill('React').years(4).mock(),
  new SkillSummary().id('docker').skill('Docker').years(1).mock(),
];

const testTrack = new Track()
  .categories([
    {
      id: 'frontend-development',
      name: 'Frontend Development',
      subCategories: [
        {
          id: 'core-technologies',
          name: 'Core Technologies',
          skillIds: ['react'],
        },
        {
          id: 'tooling',
          name: 'Tooling',
          skillIds: ['docker'],
        },
      ],
    },
  ])
  .mock();

const theme = createTheme();

const buildCategoryGroups = (skills: typeof SKILLS): CategoryGroup[] => [
  {
    category: testTrack.categories[0],
    subGroups: [
      {
        subCategory: testTrack.categories[0].subCategories[0],
        skills,
      },
    ],
    skills,
  },
];

const renderSkillsTable = (props: Parameters<typeof SkillsTable>[0]) =>
  render(
    <MemoryRouter>
      <TrackContextProvider>
        <SkillsTable {...props} />
      </TrackContextProvider>
    </MemoryRouter>
  );

describe('SkillsTable', () => {
  test('renders each skill with its estimated years', async () => {
    const screen = renderSkillsTable({
      categoryGroups: buildCategoryGroups(SKILLS),
    });

    expect(screen.getByText('React')).toBeVisible();
    expect(screen.getByText('4 years')).toBeVisible();
    expect(screen.getByText('Docker')).toBeVisible();
    expect(screen.getByText('1 year')).toBeVisible();
    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('renders company/year breakdown as chips', async () => {
    const skills = [
      new SkillSummary()
        .skill('React')
        .years(4)
        .companyYears([
          { name: 'Acme Corp', years: 2 },
          { name: 'Globex', years: 2 },
        ])
        .mock(),
    ];
    const screen = renderSkillsTable({
      categoryGroups: buildCategoryGroups(skills),
    });

    expect(screen.getByText('Acme Corp · 2 years')).toBeVisible();
    expect(screen.getByText('Globex · 2 years')).toBeVisible();
    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('renders a dash for skills with no company years', () => {
    const skills = [new SkillSummary().skill('React').years(4).companyYears([]).mock()];
    const screen = renderSkillsTable({
      categoryGroups: buildCategoryGroups(skills),
    });

    expect(screen.getByText('—')).toBeVisible();
  });

  test('renders category group row', () => {
    const screen = renderSkillsTable({
      categoryGroups: buildCategoryGroups(SKILLS),
    });

    expect(screen.getByText('Frontend Development')).toBeVisible();
  });

  test('renders sub-category row when multiple sub-categories are present', () => {
    const groups: CategoryGroup[] = [
      {
        category: testTrack.categories[0],
        subGroups: [
          { subCategory: testTrack.categories[0].subCategories[0], skills: [SKILLS[0]] },
          { subCategory: testTrack.categories[0].subCategories[1], skills: [SKILLS[1]] },
        ],
        skills: SKILLS,
      },
    ];
    const screen = renderSkillsTable({ categoryGroups: groups });

    expect(screen.getByText('Core Technologies')).toBeVisible();
    expect(screen.getByText('Tooling')).toBeVisible();
  });

  test('applies a highlight background to the skill matching highlightedSkills', () => {
    const screen = renderSkillsTable({
      categoryGroups: buildCategoryGroups(SKILLS),
      highlightedSkills: ['React'],
    });

    expect(screen.getByText('React').closest('tr')).toHaveStyle({
      backgroundColor: alpha(theme.palette.primary.main, 0.12),
    });
  });

  test('applies a highlight background to every skill matching multiple highlightedSkills', () => {
    const screen = renderSkillsTable({
      categoryGroups: buildCategoryGroups(SKILLS),
      highlightedSkills: ['React', 'Docker'],
    });

    expect(screen.getByText('React').closest('tr')).toHaveStyle({
      backgroundColor: alpha(theme.palette.primary.main, 0.12),
    });
    expect(screen.getByText('Docker').closest('tr')).toHaveStyle({
      backgroundColor: alpha(theme.palette.primary.main, 0.12),
    });
  });

  test('sets the row id to the encoded skill name', () => {
    const screen = renderSkillsTable({
      categoryGroups: buildCategoryGroups(SKILLS),
    });

    const reactRow = screen.getByText('React').closest('tr');

    expect(reactRow).toHaveAttribute('id', 'skill-React');
  });

  test('opens the row actions menu on icon button click', async () => {
    const user = userEvent.setup();
    const screen = renderSkillsTable({
      categoryGroups: buildCategoryGroups(SKILLS),
    });

    const firstRowButton = screen.getAllByRole('button', { name: /links/ })[0];

    await user.click(firstRowButton);

    expect(screen.getByRole('menu')).toBeVisible();
    expect(screen.getByRole('menuitem', { name: 'View on Resume' })).toBeVisible();
  });
});
