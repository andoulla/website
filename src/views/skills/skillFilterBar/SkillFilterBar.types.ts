// One selectable filter entry — a track category or subcategory, keyed by its stable id.
export interface SkillFilterOption {
  id: string;
  name: string;
}

export interface SkillFilterBarProps {
  categories: SkillFilterOption[];
  subCategoriesByCategory: Record<string, SkillFilterOption[]>;
  selectedCategories: string[];
  selectedSubCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  onSubCategoriesChange: (subCategories: string[]) => void;
}
