import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';

import { CATEGORY_ORDER, SUBCATEGORIES_BY_CATEGORY } from '@/utils/skillCategory';

import { SkillFilterBar, type SkillFilterBarProps } from './SkillFilterBar';

const renderFilterBar = (props: Partial<SkillFilterBarProps> = {}) =>
  render(
    <SkillFilterBar
      categories={CATEGORY_ORDER}
      subCategoriesByCategory={SUBCATEGORIES_BY_CATEGORY}
      selectedCategories={[]}
      selectedSubCategories={[]}
      onCategoriesChange={jest.fn()}
      onSubCategoriesChange={jest.fn()}
      {...props}
    />
  );

describe('SkillFilterBar', () => {
  describe('trigger label', () => {
    test('renders a trigger button showing "All" when no filters are active', async () => {
      const screen = renderFilterBar();

      expect(
        screen.getByRole('button', {
          name: 'Filter skills by category and subcategory, currently: All',
        })
      ).toBeVisible();
      expect(await axe(screen.container)).toHaveNoViolations();
    });

    test('renders a trigger button showing the active filter count', () => {
      const screen = renderFilterBar({
        selectedCategories: ['engineering'],
        selectedSubCategories: ['testing'],
      });

      expect(
        screen.getByRole('button', {
          name: 'Filter skills by category and subcategory, currently: Filters (2)',
        })
      ).toBeVisible();
    });
  });

  describe('category toggling', () => {
    test('opens a menu with a checkbox item per category', async () => {
      const user = userEvent.setup();
      const screen = renderFilterBar();

      await user.click(
        screen.getByRole('button', {
          name: 'Filter skills by category and subcategory, currently: All',
        })
      );

      expect(
        screen.getByRole('menuitemcheckbox', { name: 'Engineering', checked: false })
      ).toBeVisible();
      expect(
        screen.getByRole('menuitemcheckbox', { name: 'Quality & Performance', checked: false })
      ).toBeVisible();
      expect(
        screen.getByRole('menuitemcheckbox', { name: 'Tooling', checked: false })
      ).toBeVisible();
      expect(
        screen.getByRole('menuitemcheckbox', { name: 'Leadership & Delivery', checked: false })
      ).toBeVisible();
      expect(
        screen.getByRole('menuitemcheckbox', { name: 'People & Stakeholders', checked: false })
      ).toBeVisible();
      expect(await axe(screen.container)).toHaveNoViolations();
    });

    test('calls onCategoriesChange adding the category when an unselected category is clicked', async () => {
      const user = userEvent.setup();
      const onCategoriesChange = jest.fn();
      const screen = renderFilterBar({ onCategoriesChange });

      await user.click(
        screen.getByRole('button', {
          name: 'Filter skills by category and subcategory, currently: All',
        })
      );
      await user.click(screen.getByRole('menuitemcheckbox', { name: 'Engineering' }));
      expect(onCategoriesChange).toHaveBeenCalledWith(['engineering']);
    });

    test('calls onCategoriesChange removing the category when an already-selected category is clicked', async () => {
      const user = userEvent.setup();
      const onCategoriesChange = jest.fn();
      const screen = renderFilterBar({
        selectedCategories: ['engineering', 'leadership-delivery'],
        onCategoriesChange,
      });

      await user.click(
        screen.getByRole('button', {
          name: 'Filter skills by category and subcategory, currently: Filters (2)',
        })
      );
      await user.click(screen.getByRole('menuitemcheckbox', { name: 'Engineering' }));
      expect(onCategoriesChange).toHaveBeenCalledWith(['leadership-delivery']);
    });

    test('prunes selected subcategories that belong to a category being deselected', async () => {
      const user = userEvent.setup();
      const onSubCategoriesChange = jest.fn();
      const screen = renderFilterBar({
        selectedCategories: ['engineering'],
        selectedSubCategories: ['styling'],
        onSubCategoriesChange,
      });

      await user.click(
        screen.getByRole('button', {
          name: 'Filter skills by category and subcategory, currently: Filters (2)',
        })
      );
      await user.click(screen.getByRole('menuitemcheckbox', { name: 'Engineering' }));
      expect(onSubCategoriesChange).toHaveBeenCalledWith([]);
    });
  });

  describe('subcategory toggling and grouping', () => {
    test('shows subcategories for all categories, grouped, when no category is selected', async () => {
      const user = userEvent.setup();
      const screen = renderFilterBar();

      await user.click(
        screen.getByRole('button', {
          name: 'Filter skills by category and subcategory, currently: All',
        })
      );

      expect(screen.getByText('Frontend Development')).toBeVisible();
      expect(screen.getByText('Testing')).toBeVisible();
      expect(screen.getByText('Styling & UI')).toBeVisible();
      expect(screen.getByText('Design System')).toBeVisible();
      expect(screen.getByText('Dev Tools')).toBeVisible();
      expect(screen.getByText('Collaboration Tools')).toBeVisible();
      expect(screen.getByText('Accessibility')).toBeVisible();
      expect(screen.getByText('Performance')).toBeVisible();
      expect(screen.getByText('Leadership')).toBeVisible();
      expect(screen.getByText('Delivery & Planning')).toBeVisible();
      expect(screen.getByText('Stakeholder Management')).toBeVisible();
      expect(screen.getByText('Mentoring')).toBeVisible();
    });

    test('scopes subcategory options to the selected categories', async () => {
      const user = userEvent.setup();
      const screen = renderFilterBar({ selectedCategories: ['engineering'] });

      await user.click(
        screen.getByRole('button', {
          name: 'Filter skills by category and subcategory, currently: Filters (1)',
        })
      );

      expect(screen.getByText('Frontend Development')).toBeVisible();
      expect(screen.getByText('Styling & UI')).toBeVisible();
      expect(screen.queryByText('Leadership')).not.toBeInTheDocument();
      expect(screen.queryByText('Mentoring')).not.toBeInTheDocument();
    });

    test('calls onSubCategoriesChange when a subcategory item is clicked, without touching categories', async () => {
      const user = userEvent.setup();
      const onCategoriesChange = jest.fn();
      const onSubCategoriesChange = jest.fn();
      const screen = renderFilterBar({ onCategoriesChange, onSubCategoriesChange });

      await user.click(
        screen.getByRole('button', {
          name: 'Filter skills by category and subcategory, currently: All',
        })
      );
      await user.click(screen.getByRole('menuitemcheckbox', { name: 'Testing' }));
      expect(onSubCategoriesChange).toHaveBeenCalledWith(['testing']);
      expect(onCategoriesChange).not.toHaveBeenCalled();
    });

    test('calls onSubCategoriesChange removing an already-selected subcategory when clicked again', async () => {
      const user = userEvent.setup();
      const onSubCategoriesChange = jest.fn();
      const screen = renderFilterBar({
        selectedSubCategories: ['testing'],
        onSubCategoriesChange,
      });

      await user.click(
        screen.getByRole('button', {
          name: 'Filter skills by category and subcategory, currently: Filters (1)',
        })
      );
      await user.click(screen.getByRole('menuitemcheckbox', { name: 'Testing' }));
      expect(onSubCategoriesChange).toHaveBeenCalledWith([]);
    });
  });
});
