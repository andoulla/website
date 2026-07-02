import BarChartIcon from '@mui/icons-material/BarChart';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export function SkillsGraphView() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        py: 8,
        color: 'text.secondary',
      }}
    >
      <BarChartIcon sx={{ fontSize: 56 }} />
      <Typography variant="body1">Chart coming soon</Typography>
    </Box>
  );
}
