import type { ChipProps } from '@mui/material/Chip';

export type { SkillCategory } from '@/data/skills.types';

// Hex colours outside MUI's named palette — see skillColour.constants.ts for why.
export type CustomSkillColour = 'teal' | 'plum' | 'brown' | 'gold';

export type SkillColour = NonNullable<ChipProps['color']> | CustomSkillColour;
