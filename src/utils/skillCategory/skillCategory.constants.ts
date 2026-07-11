import type { SkillCategory, SkillSubCategory } from '@/data/skills.types';

export const CATEGORY_LABELS: Record<SkillCategory, string> = {
  engineering: 'Engineering',
  'quality-performance': 'Quality & Performance',
  tooling: 'Tooling',
  'leadership-delivery': 'Leadership & Delivery',
  'people-stakeholders': 'People & Stakeholders',
};

export const CATEGORY_ORDER: SkillCategory[] = [
  'engineering',
  'quality-performance',
  'tooling',
  'leadership-delivery',
  'people-stakeholders',
];

export const SUBCATEGORY_LABELS: Record<SkillSubCategory, string> = {
  development: 'Development',
  testing: 'Testing',
  styling: 'Styling & UI',
  'design-system': 'Design System',
  tooling: 'Dev Tools',
  'collaboration-tools': 'Collaboration Tools',
  accessibility: 'Accessibility',
  performance: 'Performance',
  leadership: 'Leadership',
  'delivery-planning': 'Delivery & Planning',
  'stakeholder-management': 'Stakeholder Management',
  mentoring: 'Mentoring',
};
// TODO: reevaluate after tech stack additions for full job history; subcategory can be fe, be, fs
export const SUBCATEGORIES_BY_CATEGORY: Record<SkillCategory, SkillSubCategory[]> = {
  engineering: ['development', 'styling', 'design-system'],
  'quality-performance': ['testing', 'accessibility', 'performance'],
  tooling: ['tooling', 'collaboration-tools'],
  'leadership-delivery': ['leadership', 'delivery-planning'],
  'people-stakeholders': ['mentoring', 'stakeholder-management'],
};
