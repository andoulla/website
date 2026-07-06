import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';

import { CATEGORY_ORDER, SUBCATEGORIES_BY_CATEGORY } from '@/utils/skillCategory';

import { SkillFilterBar } from './SkillFilterBar';

const ALL_LABEL = 'Filter skills by category and subcategory, currently: All';
const FILTERS_1_LABEL = 'Filter skills by category and subcategory, currently: Filters (1)';
const FILTERS_2_LABEL = 'Filter skills by category and subcategory, currently: Filters (2)';

describe('SkillFilterBar', () => {
  test('renders a trigger button showing "All" when no filters are active', () => {
    const screen = render(
      <SkillFilterBar
        categories={CATEGORY_ORDER}
        subCategoriesByCategory={SUBCATEGORIES_BY_CATEGORY}
        selectedCategories={[]}
        selectedSubCategories={[]}
        onCategoriesChange={jest.fn()}
        onSubCategoriesChange={jest.fn()}
      />
    );

    expect(screen.getByRole('button', { name: ALL_LABEL })).toBeVisible();
  });

  test('renders a trigger button showing the active filter count', () => {
    const screen = render(
      <SkillFilterBar
        categories={CATEGORY_ORDER}
        subCategoriesByCategory={SUBCATEGORIES_BY_CATEGORY}
        selectedCategories={['engineering']}
        selectedSubCategories={['testing']}
        onCategoriesChange={jest.fn()}
        onSubCategoriesChange={jest.fn()}
      />
    );

    expect(screen.getByRole('button', { name: FILTERS_2_LABEL })).toBeVisible();
  });

  test('opens a menu with a checkbox item per category', async () => {
    const user = userEvent.setup();
    const screen = render(
      <SkillFilterBar
        categories={CATEGORY_ORDER}
        subCategoriesByCategory={SUBCATEGORIES_BY_CATEGORY}
        selectedCategories={[]}
        selectedSubCategories={[]}
        onCategoriesChange={jest.fn()}
        onSubCategoriesChange={jest.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: ALL_LABEL }));

    expect(
      screen.getByRole('menuitemcheckbox', { name: 'Engineering', checked: false })
    ).toBeVisible();
    expect(
      screen.getByRole('menuitemcheckbox', { name: 'Managerial', checked: false })
    ).toBeVisible();
    expect(
      screen.getByRole('menuitemcheckbox', { name: 'Soft Skills', checked: false })
    ).toBeVisible();
    expect(screen.getByRole('menuitemcheckbox', { name: 'Other', checked: false })).toBeVisible();
  });

  test('calls onCategoriesChange adding the category when an unselected category is clicked', async () => {
    const user = userEvent.setup();
    const onCategoriesChange = jest.fn();
    const screen = render(
      <SkillFilterBar
        categories={CATEGORY_ORDER}
        subCategoriesByCategory={SUBCATEGORIES_BY_CATEGORY}
        selectedCategories={[]}
        selectedSubCategories={[]}
        onCategoriesChange={onCategoriesChange}
        onSubCategoriesChange={jest.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: ALL_LABEL }));
    await user.click(screen.getByRole('menuitemcheckbox', { name: 'Engineering' }));
    expect(onCategoriesChange).toHaveBeenCalledWith(['engineering']);
  });

  test('calls onCategoriesChange removing the category when an already-selected category is clicked', async () => {
    const user = userEvent.setup();
    const onCategoriesChange = jest.fn();
    const screen = render(
      <SkillFilterBar
        categories={CATEGORY_ORDER}
        subCategoriesByCategory={SUBCATEGORIES_BY_CATEGORY}
        selectedCategories={['engineering', 'managerial']}
        selectedSubCategories={[]}
        onCategoriesChange={onCategoriesChange}
        onSubCategoriesChange={jest.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: FILTERS_2_LABEL }));
    await user.click(screen.getByRole('menuitemcheckbox', { name: 'Engineering' }));
    expect(onCategoriesChange).toHaveBeenCalledWith(['managerial']);
  });

  test('prunes selected subcategories that belong to a category being deselected', async () => {
    const user = userEvent.setup();
    const onSubCategoriesChange = jest.fn();
    const screen = render(
      <SkillFilterBar
        categories={CATEGORY_ORDER}
        subCategoriesByCategory={SUBCATEGORIES_BY_CATEGORY}
        selectedCategories={['engineering']}
        selectedSubCategories={['testing']}
        onCategoriesChange={jest.fn()}
        onSubCategoriesChange={onSubCategoriesChange}
      />
    );

    await user.click(screen.getByRole('button', { name: FILTERS_2_LABEL }));
    await user.click(screen.getByRole('menuitemcheckbox', { name: 'Engineering' }));
    expect(onSubCategoriesChange).toHaveBeenCalledWith([]);
  });

  test('shows subcategories for all categories, grouped, when no category is selected', async () => {
    const user = userEvent.setup();
    const screen = render(
      <SkillFilterBar
        categories={CATEGORY_ORDER}
        subCategoriesByCategory={SUBCATEGORIES_BY_CATEGORY}
        selectedCategories={[]}
        selectedSubCategories={[]}
        onCategoriesChange={jest.fn()}
        onSubCategoriesChange={jest.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: ALL_LABEL }));

    expect(screen.getByText('Frontend Development')).toBeVisible();
    expect(screen.getByText('Testing')).toBeVisible();
    expect(screen.getByText('Styling & UI')).toBeVisible();
    expect(screen.getByText('Design System')).toBeVisible();
    expect(screen.getByText('Tooling')).toBeVisible();
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
    const screen = render(
      <SkillFilterBar
        categories={CATEGORY_ORDER}
        subCategoriesByCategory={SUBCATEGORIES_BY_CATEGORY}
        selectedCategories={['engineering']}
        selectedSubCategories={[]}
        onCategoriesChange={jest.fn()}
        onSubCategoriesChange={jest.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: FILTERS_1_LABEL }));

    expect(screen.getByText('Frontend Development')).toBeVisible();
    expect(screen.getByText('Testing')).toBeVisible();
    expect(screen.queryByText('Leadership')).not.toBeInTheDocument();
    expect(screen.queryByText('Mentoring')).not.toBeInTheDocument();
  });

  test('calls onSubCategoriesChange when a subcategory item is clicked, without touching categories', async () => {
    const user = userEvent.setup();
    const onCategoriesChange = jest.fn();
    const onSubCategoriesChange = jest.fn();
    const screen = render(
      <SkillFilterBar
        categories={CATEGORY_ORDER}
        subCategoriesByCategory={SUBCATEGORIES_BY_CATEGORY}
        selectedCategories={[]}
        selectedSubCategories={[]}
        onCategoriesChange={onCategoriesChange}
        onSubCategoriesChange={onSubCategoriesChange}
      />
    );

    await user.click(screen.getByRole('button', { name: ALL_LABEL }));
    await user.click(screen.getByRole('menuitemcheckbox', { name: 'Testing' }));
    expect(onSubCategoriesChange).toHaveBeenCalledWith(['testing']);
    expect(onCategoriesChange).not.toHaveBeenCalled();
  });

  test('calls onSubCategoriesChange removing an already-selected subcategory when clicked again', async () => {
    const user = userEvent.setup();
    const onSubCategoriesChange = jest.fn();
    const screen = render(
      <SkillFilterBar
        categories={CATEGORY_ORDER}
        subCategoriesByCategory={SUBCATEGORIES_BY_CATEGORY}
        selectedCategories={[]}
        selectedSubCategories={['testing']}
        onCategoriesChange={jest.fn()}
        onSubCategoriesChange={onSubCategoriesChange}
      />
    );

    await user.click(screen.getByRole('button', { name: FILTERS_1_LABEL }));
    await user.click(screen.getByRole('menuitemcheckbox', { name: 'Testing' }));
    expect(onSubCategoriesChange).toHaveBeenCalledWith([]);
  });

  test('has no axe violations when closed', async () => {
    const screen = render(
      <SkillFilterBar
        categories={CATEGORY_ORDER}
        subCategoriesByCategory={SUBCATEGORIES_BY_CATEGORY}
        selectedCategories={[]}
        selectedSubCategories={[]}
        onCategoriesChange={jest.fn()}
        onSubCategoriesChange={jest.fn()}
      />
    );

    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('has no axe violations when open', async () => {
    const user = userEvent.setup();
    const screen = render(
      <SkillFilterBar
        categories={CATEGORY_ORDER}
        subCategoriesByCategory={SUBCATEGORIES_BY_CATEGORY}
        selectedCategories={[]}
        selectedSubCategories={[]}
        onCategoriesChange={jest.fn()}
        onSubCategoriesChange={jest.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: ALL_LABEL }));

    expect(await axe(screen.container)).toHaveNoViolations();
  });
});
