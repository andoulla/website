import type { ChipProps } from '@mui/material/Chip';

type SkillColor = NonNullable<ChipProps['color']>;

/** Explicit, curated skill -> color map so each known skill always renders the same color. */
const SKILL_COLOR_MAP: Record<string, SkillColor> = {
  React: 'info',
  TypeScript: 'primary',
  JavaScript: 'warning',
  'Node.js': 'success',
  GraphQL: 'secondary',
  PostgreSQL: 'primary',
  Docker: 'info',
  Accessibility: 'success',
  CSS: 'secondary',
  HTML: 'warning',
  jQuery: 'error',
};

/** Stable fallback palette for any skill not present in the curated map above. */
const FALLBACK_COLORS: SkillColor[] = [
  'primary',
  'secondary',
  'success',
  'warning',
  'info',
  'error',
];

/**
 * Map a skill to a MUI palette color. Known skills use the curated map; unknown skills
 * fall back to a stable hash so a given skill always renders the same color everywhere.
 */
export function skillColor(skill: string): SkillColor {
  const mapped = SKILL_COLOR_MAP[skill];
  if (mapped !== undefined) {
    return mapped;
  }

  // Sum the character codes for a stable, deterministic index — the same skill always
  // resolves to the same fallback color.
  const charCodeSum = [...skill].reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return FALLBACK_COLORS[charCodeSum % FALLBACK_COLORS.length];
}
