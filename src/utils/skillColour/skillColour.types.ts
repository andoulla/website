import type { ChipProps } from '@mui/material/Chip';

export type { SkillCategory } from '@/data/skills.types';

// Fixed hex colours outside MUI's named palette — used for categories where none of the built-in
// keys (which are either theme-customized or too close to red/orange/blue/grey) fit.
export type CustomSkillColour = 'teal' | 'plum' | 'brown' | 'gold';

export type SkillColour = NonNullable<ChipProps['color']> | CustomSkillColour;
