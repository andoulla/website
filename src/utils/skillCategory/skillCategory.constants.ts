import type { SkillCategory } from '@/types';

// Legacy fixed-taxonomy labels/order — resume card only; dies with the legacy category fields.
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
