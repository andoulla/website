export const CATEGORY_TO_COLOR_MAPPING: Record<
  string,
  { paletteFamily: 'primary' | 'secondary'; shade: 'dark' | 'main' | 'light' }
> = {
  'leadership-delivery': { paletteFamily: 'primary', shade: 'dark' },
  'engineering-practices-quality': { paletteFamily: 'primary', shade: 'main' },
  'frontend-development': { paletteFamily: 'primary', shade: 'light' },
  'architecture-design': { paletteFamily: 'secondary', shade: 'dark' },
  'backend-development': { paletteFamily: 'secondary', shade: 'main' },
  'tools-development-workflow': { paletteFamily: 'secondary', shade: 'light' },
};

export const LEGEND_ITEMS: Array<{
  categoryId: string;
  label: string;
}> = [
  { categoryId: 'leadership-delivery', label: 'Leadership & Delivery' },
  { categoryId: 'engineering-practices-quality', label: 'Engineering Practices & Quality' },
  { categoryId: 'frontend-development', label: 'Frontend Development' },
  { categoryId: 'architecture-design', label: 'Architecture & Design' },
  { categoryId: 'backend-development', label: 'Backend Development' },
  { categoryId: 'tools-development-workflow', label: 'Tools & Development Workflow' },
];
