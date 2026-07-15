// Hex colours outside MUI's named palette — see skillColour.constants.ts for why.
export type CustomSkillColour = 'teal' | 'green' | 'plum' | 'brown' | 'gold' | 'indigo' | 'berry';

// 'default' is the grey fallback for anything without a resolvable category colour.
export type SkillColour = CustomSkillColour | 'default';
