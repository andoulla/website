import type { ChipProps } from '@mui/material/Chip';

export type SkillCategory = 'engineering' | 'managerial' | 'soft-skills' | 'other';

type SkillColor = NonNullable<ChipProps['color']>;

const CATEGORY_COLOR_MAP: Record<SkillCategory, SkillColor> = {
  engineering: 'primary',
  managerial: 'secondary',
  'soft-skills': 'success',
  other: 'info',
};

const SKILL_CATEGORY_MAP: Record<string, SkillCategory> = {
  // Engineering — tech stack
  React: 'engineering',
  TypeScript: 'engineering',
  JavaScript: 'engineering',
  'Node.js': 'engineering',
  GraphQL: 'engineering',
  PostgreSQL: 'engineering',
  Docker: 'engineering',
  CSS: 'engineering',
  HTML: 'engineering',
  jQuery: 'engineering',
  'React Query': 'engineering',
  RTL: 'engineering',
  Jest: 'engineering',
  Playwright: 'engineering',
  Cypress: 'engineering',
  'CSS-in-JS': 'engineering',
  Stitches: 'engineering',
  'Radix UI': 'engineering',
  'Git/GitHub': 'engineering',
  Yarn: 'engineering',
  ESLint: 'engineering',
  Prettier: 'engineering',
  Sentry: 'engineering',
  Jira: 'engineering',
  Notion: 'engineering',
  Flow: 'engineering',
  Enzyme: 'engineering',
  Sass: 'engineering',
  Less: 'engineering',
  Git: 'engineering',
  GitLab: 'engineering',
  Npm: 'engineering',
  Webpack: 'engineering',
  Confluence: 'engineering',
  Kibana: 'engineering',
  // Engineering — practices
  Accessibility: 'engineering',
  'Design System': 'engineering',
  'Testing Strategy': 'engineering',
  'Performance Optimisation': 'engineering',
  'Design System Adoption': 'engineering',
  // Managerial
  'Team Leadership': 'managerial',
  'Technical Direction': 'managerial',
  'Cross-functional Delivery': 'managerial',
  'Stakeholder Management': 'managerial',
  'Roadmap Planning': 'managerial',
  'Release Management': 'managerial',
  'Project Planning': 'managerial',
  'Estimation & Planning': 'managerial',
  'Team Operations': 'managerial',
  Recruitment: 'managerial',
  'Stakeholder Communication': 'managerial',
  'Agile Delivery': 'managerial',
  // Soft skills
  Mentoring: 'soft-skills',
  'Team Onboarding': 'soft-skills',
  Onboarding: 'soft-skills',
};

export function skillCategory(skill: string): SkillCategory {
  return SKILL_CATEGORY_MAP[skill] ?? 'other';
}

export function skillColor(skill: string): SkillColor {
  return CATEGORY_COLOR_MAP[skillCategory(skill)];
}

const SHADE_COUNT = 6;

/** Stable 0–5 index used to pick a shade of the category color for a given skill. */
export function skillShadeIndex(skill: string): number {
  const charSum = [...skill].reduce((sum, c) => sum + c.charCodeAt(0), 0);
  return charSum % SHADE_COUNT;
}
