import type { ReactNode } from 'react';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export interface SkillsEmptyStateProps {
  onClearFilters: () => void;
  children?: ReactNode;
}

const MessageCard = ({ onClearFilters }: { onClearFilters: () => void }) => (
  <Stack
    sx={{
      bgcolor: 'background.paper',
      px: 3,
      py: 2,
      borderRadius: 2,
      boxShadow: 2,
      alignItems: 'center',
      gap: 1,
      textAlign: 'center',
      maxWidth: 320,
    }}
  >
    <Typography variant="body1" color="text.secondary" fontWeight={500}>
      No skills match the selected filter.
    </Typography>
    <Typography variant="body2" color="text.disabled">
      Try a different search term or remove the active filters.
    </Typography>
    <Button size="small" startIcon={<FilterAltOffIcon fontSize="small" />} onClick={onClearFilters}>
      Reset
    </Button>
  </Stack>
);

export const SkillsEmptyState = ({ onClearFilters, children }: SkillsEmptyStateProps) => {
  if (children === undefined) {
    return (
      <Stack sx={{ py: 4, alignItems: 'center' }}>
        <MessageCard onClearFilters={onClearFilters} />
      </Stack>
    );
  }

  return (
    <Stack sx={{ position: 'relative' }}>
      {children}
      <Stack
        sx={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}
      >
        <MessageCard onClearFilters={onClearFilters} />
      </Stack>
    </Stack>
  );
};
