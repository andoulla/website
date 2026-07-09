import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { MemoryRouter } from 'react-router-dom';

import { SkillSummary } from '@/testing';

import { SkillsViewContextProvider } from '../SkillsViewContext';
import type { SkillsViewContextValue } from '../SkillsViewContext.type';

import { SkillsListView } from './SkillsListView';

const SKILLS = [
  new SkillSummary().years(4).mock(),
  new SkillSummary()
    .skill('Team Leadership')
    .years(3)
    .category('leadership-delivery')
    .colour('secondary')
    .mock(),
  new SkillSummary()
    .skill('Mentoring')
    .years(2)
    .category('people-stakeholders')
    .colour('success')
    .recommendationIds(['rec-1'])
    .mock(),
];

const renderListView = (overrides: Partial<SkillsViewContextValue> = {}) =>
  render(
    <MemoryRouter>
      <SkillsViewContextProvider
        skills={SKILLS}
        selectedCategories={[]}
        selectedSubCategories={[]}
        searchTerm=""
        {...overrides}
      >
        <SkillsListView />
      </SkillsViewContextProvider>
    </MemoryRouter>
  );

describe('SkillsListView', () => {
  describe('render and grouping', () => {
    test('renders a list item for each skill with name and years', async () => {
      const screen = renderListView();

      expect(screen.getByText('React')).toBeVisible();
      expect(screen.getByText('est. 4 years')).toBeVisible();
      expect(screen.getByText('Team Leadership')).toBeVisible();
      expect(screen.getByText('est. 3 years')).toBeVisible();
      expect(screen.getByText('Mentoring')).toBeVisible();
      expect(screen.getByText('est. 2 years')).toBeVisible();
      expect(await axe(screen.container)).toHaveNoViolations();
    });

    test('renders "year" (singular) when a skill has exactly 1 year', () => {
      const skills = [new SkillSummary().skill('Docker').years(1).mock()];
      const screen = renderListView({ skills });

      expect(screen.getByText('est. 1 year')).toBeVisible();
    });

    test('renders category section headings', () => {
      const screen = renderListView();

      expect(screen.getByText('Engineering')).toBeVisible();
      expect(screen.getByText('Leadership & Delivery')).toBeVisible();
      expect(screen.getByText('People & Stakeholders')).toBeVisible();
    });

    test('does not render a section for a category with no skills', () => {
      const screen = renderListView();

      expect(screen.queryByText('Tooling')).not.toBeInTheDocument();
    });

    test('groups skills into sub-category headings when a category has more than one sub-category present', () => {
      const skills = [
        new SkillSummary().skill('React').subCategory('frontend-development').mock(),
        new SkillSummary().skill('CSS-in-JS').subCategory('styling').mock(),
      ];
      const screen = renderListView({ skills });

      expect(screen.getByText('Frontend Development')).toBeVisible();
      expect(screen.getByText('Styling & UI')).toBeVisible();
    });

    test('does not render a sub-category heading when a category has only one sub-category present', () => {
      const skills = [
        new SkillSummary().skill('React').subCategory('frontend-development').mock(),
        new SkillSummary().skill('TypeScript').subCategory('frontend-development').mock(),
      ];
      const screen = renderListView({ skills });

      expect(screen.queryByText('Frontend Development')).not.toBeInTheDocument();
    });
  });

  describe('filtering', () => {
    test('hides skills outside the selected categories', () => {
      const screen = renderListView({ selectedCategories: ['leadership-delivery'] });

      expect(screen.getByText('Team Leadership')).toBeVisible();
      expect(screen.queryByText('React')).not.toBeInTheDocument();
    });

    test('does not render a section for a category with no matching skills after filtering', () => {
      const screen = renderListView({ selectedCategories: ['leadership-delivery'] });

      expect(screen.queryByText('Engineering')).not.toBeInTheDocument();
      expect(screen.queryByText('People & Stakeholders')).not.toBeInTheDocument();
    });

    test('hides skills outside the selected subcategories', () => {
      const skills = [
        new SkillSummary().skill('React').subCategory('frontend-development').mock(),
        new SkillSummary().skill('Jest').subCategory('testing').mock(),
      ];
      const screen = renderListView({
        skills,
        selectedSubCategories: ['testing'],
      });

      expect(screen.getByText('Jest')).toBeVisible();
      expect(screen.queryByText('React')).not.toBeInTheDocument();
    });
  });

  describe('search', () => {
    test('hides skills that do not match the search term', async () => {
      const screen = renderListView({ searchTerm: 'rea' });

      expect(screen.getByRole('button', { name: 'React est. 4 years' })).toBeVisible();
      expect(screen.queryByText('Team Leadership')).not.toBeInTheDocument();
      expect(screen.queryByText('Mentoring')).not.toBeInTheDocument();
      expect(await axe(screen.container)).toHaveNoViolations();
    });

    test('does not render a section for a category with no matches after search', () => {
      const screen = renderListView({ searchTerm: 'rea' });

      expect(screen.queryByText('Leadership & Delivery')).not.toBeInTheDocument();
      expect(screen.queryByText('People & Stakeholders')).not.toBeInTheDocument();
    });
  });

  describe('highlight and scroll', () => {
    test('applies a highlight to the skill matching highlightedSkills', async () => {
      const screen = renderListView({ highlightedSkills: ['React'] });

      expect(screen.getByRole('button', { name: 'React est. 4 years' })).toBeVisible();
      expect(await axe(screen.container)).toHaveNoViolations();
    });

    test('applies a highlight to every skill matching multiple highlightedSkills', () => {
      const screen = renderListView({ highlightedSkills: ['React', 'Mentoring'] });

      expect(screen.getByRole('button', { name: 'React est. 4 years' })).toBeVisible();
      expect(screen.getByRole('button', { name: 'Mentoring est. 2 years' })).toBeVisible();
    });

    test('scrolls the highlighted skill into view', () => {
      const scrollIntoViewSpy = jest.spyOn(HTMLElement.prototype, 'scrollIntoView');

      renderListView({ highlightedSkills: ['React'] });

      expect(scrollIntoViewSpy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' });

      scrollIntoViewSpy.mockRestore();
    });

    test('scrolls to the first of several highlighted skills', () => {
      const scrollIntoViewSpy = jest.spyOn(HTMLElement.prototype, 'scrollIntoView');

      const screen = renderListView({ highlightedSkills: ['Team Leadership', 'React'] });

      expect(scrollIntoViewSpy).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('button', { name: 'Team Leadership est. 3 years' })).toBeVisible();

      scrollIntoViewSpy.mockRestore();
    });

    test('does not scroll when there is no highlighted skill', () => {
      const scrollIntoViewSpy = jest.spyOn(HTMLElement.prototype, 'scrollIntoView');

      renderListView();

      expect(scrollIntoViewSpy).not.toHaveBeenCalled();

      scrollIntoViewSpy.mockRestore();
    });
  });
});
