import type { SkillCategory, SkillSubCategory } from '@/data/skills.types';

export const CATEGORY_LABELS: Record<SkillCategory, string> = {
  engineering: 'Engineering',
  managerial: 'Managerial',
  'soft-skills': 'Soft Skills',
  other: 'Other',
};

export const CATEGORY_ORDER: SkillCategory[] = [
  'engineering',
  'managerial',
  'soft-skills',
  'other',
];

export const SUBCATEGORY_LABELS: Record<SkillSubCategory, string> = {
  'frontend-development': 'Frontend Development',
  testing: 'Testing',
  styling: 'Styling & UI',
  'design-system': 'Design System',
  tooling: 'Tooling',
  'collaboration-tools': 'Collaboration Tools',
  accessibility: 'Accessibility',
  performance: 'Performance',
  leadership: 'Leadership',
  'delivery-planning': 'Delivery & Planning',
  'stakeholder-management': 'Stakeholder Management',
  mentoring: 'Mentoring',
};

export const SUBCATEGORIES_BY_CATEGORY: Record<SkillCategory, SkillSubCategory[]> = {
  engineering: [
    'frontend-development',
    'testing',
    'styling',
    'design-system',
    'tooling',
    'collaboration-tools',
    'accessibility',
    'performance',
  ],
  managerial: ['leadership', 'delivery-planning', 'stakeholder-management'],
  'soft-skills': ['mentoring'],
  other: [],
};
