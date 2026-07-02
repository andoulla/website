import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import type { SkillCategory } from '../../../../../../utils/skillColour';

const CATEGORY_LABELS: Record<SkillCategory, string> = {
  engineering: 'Engineering',
  managerial: 'Managerial',
  'soft-skills': 'Soft Skills',
  other: 'Other',
};

export interface SkillFilterBarProps {
  categories: SkillCategory[];
  activeFilter: 'all' | SkillCategory;
  onChange: (value: 'all' | SkillCategory) => void;
}

export function SkillFilterBar({ categories, activeFilter, onChange }: SkillFilterBarProps) {
  return (
    <ToggleButtonGroup
      value={activeFilter}
      exclusive
      onChange={(_e, next: 'all' | SkillCategory | null) => {
        if (next !== null) onChange(next);
      }}
      size="small"
      aria-label="Filter skills by category"
      sx={{ mb: 2, flexWrap: 'wrap', gap: 0.5 }}
    >
      <ToggleButton value="all">All</ToggleButton>
      {categories.map((cat) => (
        <ToggleButton key={cat} value={cat}>
          {CATEGORY_LABELS[cat]}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
