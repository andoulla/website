import { useId, useState } from 'react';
import FilterListIcon from '@mui/icons-material/FilterList';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import type { SkillFilterBarProps } from './SkillFilterBar.types';

const MENU_ITEM_SX = {
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
  pl: 4,
} as const;

export const SkillFilterBar = ({
  categories,
  subCategoriesByCategory,
  selectedCategories,
  selectedSubCategories,
  onCategoriesChange,
  onSubCategoriesChange,
}: SkillFilterBarProps) => {
  const menuId = useId();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = anchorEl !== null;

  const toggleCategory = (categoryId: string) => {
    const isSelected = selectedCategories.includes(categoryId);
    const nextCategories = isSelected
      ? selectedCategories.filter((selectedCategory) => selectedCategory !== categoryId)
      : [...selectedCategories, categoryId];
    onCategoriesChange(nextCategories);

    // Drop subcategories of a just-deselected category.
    const subCategoriesForToggledCategory = (subCategoriesByCategory[categoryId] ?? []).map(
      (subCategory) => subCategory.id
    );
    // filterSkillsByCategory ANDs category+subCategory, so drop subcategories not in any selected category.
    const validSubCategories =
      nextCategories.length > 0
        ? new Set(
            nextCategories.flatMap((nextCategory) =>
              (subCategoriesByCategory[nextCategory] ?? []).map((subCategory) => subCategory.id)
            )
          )
        : null;

    const nextSubCategories = selectedSubCategories.filter((subCategoryId) => {
      if (isSelected && subCategoriesForToggledCategory.includes(subCategoryId)) return false;
      if (validSubCategories !== null && !validSubCategories.has(subCategoryId)) return false;
      return true;
    });

    if (nextSubCategories.length !== selectedSubCategories.length) {
      onSubCategoriesChange(nextSubCategories);
    }
  };

  const toggleSubCategory = (subCategoryId: string) => {
    onSubCategoriesChange(
      selectedSubCategories.includes(subCategoryId)
        ? selectedSubCategories.filter(
            (selectedSubCategory) => selectedSubCategory !== subCategoryId
          )
        : [...selectedSubCategories, subCategoryId]
    );
  };

  const categoriesForSubCategories =
    selectedCategories.length > 0
      ? categories.filter((category) => selectedCategories.includes(category.id))
      : categories;
  const subCategoryGroups = categoriesForSubCategories
    .map((category) => ({
      category,
      subCategories: subCategoriesByCategory[category.id] ?? [],
    }))
    .filter((group) => group.subCategories.length > 0);

  const activeCount = selectedCategories.length + selectedSubCategories.length;
  const label = activeCount === 0 ? 'All' : `Filters (${activeCount})`;

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        color="inherit"
        startIcon={<FilterListIcon fontSize="small" />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`Filter skills by category and subcategory, currently: ${label}`}
      >
        {label}
      </Button>
      <Menu
        id={menuId}
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        slotProps={{ paper: { sx: { minWidth: 220 } } }}
      >
        <ListSubheader>Category</ListSubheader>
        {categories.map((category) => (
          <MenuItem
            key={category.id}
            role="menuitemcheckbox"
            aria-checked={selectedCategories.includes(category.id)}
            onClick={() => toggleCategory(category.id)}
            sx={MENU_ITEM_SX}
          >
            <Checkbox
              edge="start"
              tabIndex={-1}
              disableRipple
              size="small"
              checked={selectedCategories.includes(category.id)}
              sx={{ p: 0 }}
            />
            <ListItemText>{category.name}</ListItemText>
          </MenuItem>
        ))}
        {subCategoryGroups.length > 0 && <Divider />}
        {subCategoryGroups.length > 0 && <ListSubheader>Subcategory</ListSubheader>}
        {subCategoryGroups.flatMap(({ category, subCategories }) => [
          subCategoryGroups.length > 1 ? (
            <ListSubheader
              key={`${category.id}-heading`}
              disableSticky
              sx={{ pl: 3, lineHeight: 2.5, fontSize: '0.75rem' }}
            >
              {category.name}
            </ListSubheader>
          ) : null,
          ...subCategories.map((subCategory) => (
            <MenuItem
              key={subCategory.id}
              role="menuitemcheckbox"
              aria-checked={selectedSubCategories.includes(subCategory.id)}
              onClick={() => toggleSubCategory(subCategory.id)}
              sx={MENU_ITEM_SX}
            >
              <Checkbox
                edge="start"
                tabIndex={-1}
                disableRipple
                size="small"
                checked={selectedSubCategories.includes(subCategory.id)}
                sx={{ p: 0 }}
              />
              <ListItemText>{subCategory.name}</ListItemText>
            </MenuItem>
          )),
        ])}
      </Menu>
    </>
  );
};
