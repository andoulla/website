import { useId, useState } from 'react';
import FilterListIcon from '@mui/icons-material/FilterList';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import type { SkillCategory, SkillSubCategory } from '@/data/skills.types';
import { CATEGORY_LABELS, SUBCATEGORY_LABELS } from '@/utils/skillCategory';

export interface SkillFilterBarProps {
  categories: SkillCategory[];
  subCategoriesByCategory: Partial<Record<SkillCategory, SkillSubCategory[]>>;
  selectedCategories: SkillCategory[];
  selectedSubCategories: SkillSubCategory[];
  onCategoriesChange: (categories: SkillCategory[]) => void;
  onSubCategoriesChange: (subCategories: SkillSubCategory[]) => void;
}

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

  const toggleCategory = (category: SkillCategory) => {
    const isSelected = selectedCategories.includes(category);
    const nextCategories = isSelected
      ? selectedCategories.filter((selectedCategory) => selectedCategory !== category)
      : [...selectedCategories, category];
    onCategoriesChange(nextCategories);

    // Subcategories belonging to the category just deselected no longer make sense to keep.
    const subCategoriesForToggledCategory = subCategoriesByCategory[category] ?? [];
    // With one or more categories now selected, filterSkillsByCategory ANDs category+subCategory,
    // so a subcategory belonging to none of them would silently zero out the results.
    const validSubCategories =
      nextCategories.length > 0
        ? new Set(
            nextCategories.flatMap((nextCategory) => subCategoriesByCategory[nextCategory] ?? [])
          )
        : null;

    const nextSubCategories = selectedSubCategories.filter((subCategory) => {
      if (isSelected && subCategoriesForToggledCategory.includes(subCategory)) return false;
      if (validSubCategories !== null && !validSubCategories.has(subCategory)) return false;
      return true;
    });

    if (nextSubCategories.length !== selectedSubCategories.length) {
      onSubCategoriesChange(nextSubCategories);
    }
  };

  const toggleSubCategory = (subCategory: SkillSubCategory) => {
    onSubCategoriesChange(
      selectedSubCategories.includes(subCategory)
        ? selectedSubCategories.filter((selectedSubCategory) => selectedSubCategory !== subCategory)
        : [...selectedSubCategories, subCategory]
    );
  };

  const categoriesForSubCategories =
    selectedCategories.length > 0 ? selectedCategories : categories;
  const subCategoryGroups = categoriesForSubCategories
    .map((category) => ({
      category,
      subCategories: subCategoriesByCategory[category] ?? [],
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
            key={category}
            role="menuitemcheckbox"
            aria-checked={selectedCategories.includes(category)}
            onClick={() => toggleCategory(category)}
            sx={MENU_ITEM_SX}
          >
            <Checkbox
              edge="start"
              tabIndex={-1}
              disableRipple
              size="small"
              checked={selectedCategories.includes(category)}
              sx={{ p: 0 }}
            />
            <ListItemText>{CATEGORY_LABELS[category]}</ListItemText>
          </MenuItem>
        ))}
        {subCategoryGroups.length > 0 && <Divider />}
        {subCategoryGroups.length > 0 && <ListSubheader>Subcategory</ListSubheader>}
        {subCategoryGroups.flatMap(({ category, subCategories }) => [
          subCategoryGroups.length > 1 ? (
            <ListSubheader
              key={`${category}-heading`}
              disableSticky
              sx={{ pl: 3, lineHeight: 2.5, fontSize: '0.75rem' }}
            >
              {CATEGORY_LABELS[category]}
            </ListSubheader>
          ) : null,
          ...subCategories.map((subCategory) => (
            <MenuItem
              key={subCategory}
              role="menuitemcheckbox"
              aria-checked={selectedSubCategories.includes(subCategory)}
              onClick={() => toggleSubCategory(subCategory)}
              sx={MENU_ITEM_SX}
            >
              <Checkbox
                edge="start"
                tabIndex={-1}
                disableRipple
                size="small"
                checked={selectedSubCategories.includes(subCategory)}
                sx={{ p: 0 }}
              />
              <ListItemText>{SUBCATEGORY_LABELS[subCategory]}</ListItemText>
            </MenuItem>
          )),
        ])}
      </Menu>
    </>
  );
};
