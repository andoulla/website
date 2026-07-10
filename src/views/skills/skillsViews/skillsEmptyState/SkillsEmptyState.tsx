import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export interface SkillsEmptyStateProps {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export const SkillsEmptyState = ({ hasActiveFilters, onClearFilters }: SkillsEmptyStateProps) => (
  <Stack sx={{ py: 4, alignItems: 'center', gap: 1 }}>
    <Typography color="text.secondary">No skills match the selected filter.</Typography>
    {hasActiveFilters && (
      <Button
        size="small"
        startIcon={<FilterAltOffIcon fontSize="small" />}
        onClick={onClearFilters}
      >
        Clear filters
      </Button>
    )}
  </Stack>
);
