import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';

import { SkillFilterBar } from './SkillFilterBar';
import type { SkillFilterBarProps, SkillFilterOption } from './SkillFilterBar.types';

const CATEGORIES: SkillFilterOption[] = [
  { id: 'frontend-development', name: 'Frontend Development' },
  { id: 'quality', name: 'Quality & Performance' },
  { id: 'leadership', name: 'Leadership' },
];

const SUBCATEGORIES_BY_CATEGORY: Record<string, SkillFilterOption[]> = {
  'frontend-development': [
    { id: 'core-technologies', name: 'Core Technologies' },
    { id: 'styling', name: 'Styling & UI' },
  ],
  quality: [{ id: 'testing', name: 'Testing' }],
  leadership: [{ id: 'people-management', name: 'People Management' }],
};

const renderFilterBar = (props: Partial<SkillFilterBarProps> = {}) =>
  render(
    <SkillFilterBar
      categories={CATEGORIES}
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
        selectedCategories: ['frontend-development'],
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
        screen.getByRole('menuitemcheckbox', { name: 'Frontend Development', checked: false })
      ).toBeVisible();
      expect(
        screen.getByRole('menuitemcheckbox', { name: 'Quality & Performance', checked: false })
      ).toBeVisible();
      expect(
        screen.getByRole('menuitemcheckbox', { name: 'Leadership', checked: false })
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
      await user.click(screen.getByRole('menuitemcheckbox', { name: 'Frontend Development' }));
      expect(onCategoriesChange).toHaveBeenCalledWith(['frontend-development']);
    });

    test('calls onCategoriesChange removing the category when an already-selected category is clicked', async () => {
      const user = userEvent.setup();
      const onCategoriesChange = jest.fn();
      const screen = renderFilterBar({
        selectedCategories: ['frontend-development', 'leadership'],
        onCategoriesChange,
      });

      await user.click(
        screen.getByRole('button', {
          name: 'Filter skills by category and subcategory, currently: Filters (2)',
        })
      );
      await user.click(screen.getByRole('menuitemcheckbox', { name: 'Frontend Development' }));
      expect(onCategoriesChange).toHaveBeenCalledWith(['leadership']);
    });

    test('prunes selected subcategories that belong to a category being deselected', async () => {
      const user = userEvent.setup();
      const onSubCategoriesChange = jest.fn();
      const screen = renderFilterBar({
        selectedCategories: ['frontend-development'],
        selectedSubCategories: ['styling'],
        onSubCategoriesChange,
      });

      await user.click(
        screen.getByRole('button', {
          name: 'Filter skills by category and subcategory, currently: Filters (2)',
        })
      );
      await user.click(screen.getByRole('menuitemcheckbox', { name: 'Frontend Development' }));
      expect(onSubCategoriesChange).toHaveBeenCalledWith([]);
    });

    test('prunes a selected subcategory that belongs to a different category when a new category is selected', async () => {
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
      await user.click(screen.getByRole('menuitemcheckbox', { name: 'Frontend Development' }));
      expect(onSubCategoriesChange).toHaveBeenCalledWith([]);
    });

    test('keeps a selected subcategory when the category it belongs to is selected', async () => {
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
      await user.click(screen.getByRole('menuitemcheckbox', { name: 'Quality & Performance' }));
      expect(onSubCategoriesChange).not.toHaveBeenCalled();
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

      expect(screen.getByText('Core Technologies')).toBeVisible();
      expect(screen.getByText('Styling & UI')).toBeVisible();
      expect(screen.getByText('Testing')).toBeVisible();
      expect(screen.getByText('People Management')).toBeVisible();
    });

    test('scopes subcategory options to the selected categories', async () => {
      const user = userEvent.setup();
      const screen = renderFilterBar({ selectedCategories: ['frontend-development'] });

      await user.click(
        screen.getByRole('button', {
          name: 'Filter skills by category and subcategory, currently: Filters (1)',
        })
      );

      expect(screen.getByText('Core Technologies')).toBeVisible();
      expect(screen.getByText('Styling & UI')).toBeVisible();
      expect(screen.queryByText('Testing')).not.toBeInTheDocument();
      expect(screen.queryByText('People Management')).not.toBeInTheDocument();
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
