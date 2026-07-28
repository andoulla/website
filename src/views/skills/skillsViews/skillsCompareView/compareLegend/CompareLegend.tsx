import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export const CompareLegend = () => (
  <Stack direction="row" spacing={3} sx={{ mt: 2, pt: 1.5, borderTop: 1, borderColor: 'divider' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box
        sx={{
          width: 14,
          height: 14,
          borderLeft: '3px dashed',
          borderColor: 'text.disabled',
          flexShrink: 0,
        }}
      />
      <Typography variant="caption" color="text.secondary">
        This track only
      </Typography>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box
        sx={{
          width: 14,
          height: 14,
          borderLeft: '3px solid',
          borderColor: 'warning.main',
          flexShrink: 0,
        }}
      />
      <Typography variant="caption" color="text.secondary">
        In different categories
      </Typography>
    </Box>
  </Stack>
);
