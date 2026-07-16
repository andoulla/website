// Hex colours outside MUI's named palette — see skillColour.constants.ts for why.
export type CustomSkillColour = 'teal' | 'green' | 'plum' | 'brown' | 'gold' | 'indigo' | 'berry';

// 'default' and 'secondary' are real MUI Chip palette keys — passed straight through, no hex
// resolution needed.
export type SkillColour = CustomSkillColour | 'default' | 'secondary';
