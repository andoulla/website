import type { TooltipContentProps } from 'recharts';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import { formatYears } from '@/utils/formatYears';

import type { CategoryRadarPoint } from '../SkillsRadarChart.types';

// Bridges Recharts tooltip payload → a small category summary card.
export const CategoryTooltip = ({ active, payload }: TooltipContentProps) => {
  if (!active || payload === undefined || payload.length === 0) return null;
  const point = payload[0].payload as CategoryRadarPoint;
  return (
    <Paper elevation={3} sx={{ p: 1.5, maxWidth: 220 }}>
      <Typography variant="subtitle2">{point.label}</Typography>
      <Typography variant="body2" color="text.secondary">
        {`${formatYears(point.avgYears)} avg across ${point.skillCount} skill${point.skillCount === 1 ? '' : 's'}`}
      </Typography>
    </Paper>
  );
};
