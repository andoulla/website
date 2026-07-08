import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { DotItemDotProps, TooltipContentProps } from 'recharts';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { visuallyHidden } from '@mui/utils';

import type { SkillCategory } from '@/data/skills.types';
import type { SkillSummary } from '@/utils/calculateSkillYears';
import { formatYears } from '@/utils/formatYears';
import { CATEGORY_COLOUR_MAP, resolveSkillColourMain } from '@/utils/skillColour';
import { CategoryLegend } from '@/views/skills/categoryLegend';

import { aggregateSkillsByCategory } from './SkillsRadarChart.helpers';
import type { CategoryRadarPoint } from './SkillsRadarChart.types';

const CHART_HEIGHT = 320;

// Bridges Recharts tooltip payload → a small category summary card.
const CategoryTooltip = ({ active, payload }: TooltipContentProps) => {
  if (!active || payload === undefined || payload.length === 0) return null;
  const point = payload[0].payload as CategoryRadarPoint;
  return (
    <Paper elevation={3} sx={{ p: 1.5, maxWidth: 220 }}>
      <Typography variant="subtitle2">{point.label}</Typography>
      <Typography variant="body2" color="text.secondary">
        {`${formatYears(point.years)} across ${point.skillCount} skill${point.skillCount === 1 ? '' : 's'}`}
      </Typography>
    </Paper>
  );
};

export interface SkillsRadarChartProps {
  skills: SkillSummary[];
  categories: SkillCategory[];
  searchTerm?: string;
}

export const SkillsRadarChart = ({ skills, categories, searchTerm }: SkillsRadarChartProps) => {
  const theme = useTheme();
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  if (skills.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
        No skills match the selected filter.
      </Typography>
    );
  }

  const radarData = aggregateSkillsByCategory(categories, skills, searchTerm);
  // Floor of 1 avoids a zero-width domain when every category is 0.
  const maxYears = Math.max(...radarData.map((point) => point.years), 1);

  // Per-vertex colour substitutes for Cell/isBarMatch — one polygon can't be dimmed per axis.
  const renderDot = ({ cx, cy, payload }: DotItemDotProps) => {
    const point = payload as CategoryRadarPoint;
    const colour = resolveSkillColourMain(CATEGORY_COLOUR_MAP[point.category], theme);
    return (
      <circle
        key={point.category}
        cx={cx}
        cy={cy}
        r={5}
        fill={point.isMatch ? colour : theme.palette.action.disabled}
      />
    );
  };

  return (
    <Stack spacing={1}>
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <RadarChart data={radarData}>
          <PolarGrid stroke={theme.palette.divider} />
          <PolarAngleAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: theme.palette.text.primary }}
          />
          <PolarRadiusAxis
            domain={[0, maxYears]}
            tickFormatter={(v: number) => `${v}y`}
            tick={{ fontSize: 10, fill: theme.palette.text.secondary }}
          />
          <Tooltip content={CategoryTooltip} />
          <Radar
            dataKey="years"
            stroke={theme.palette.primary.main}
            fill={theme.palette.primary.main}
            fillOpacity={0.25}
            isAnimationActive={!prefersReducedMotion}
            animationDuration={400}
            dot={renderDot}
          />
        </RadarChart>
      </ResponsiveContainer>

      <CategoryLegend categories={categories} />

      {/* Visually hidden table — accessible text alternative for screen readers */}
      <Box component="table" sx={visuallyHidden} aria-label="Skill category totals table">
        <caption>Total years of experience by category</caption>
        <thead>
          <tr>
            <th scope="col">Category</th>
            <th scope="col">Years</th>
            <th scope="col">Skills</th>
          </tr>
        </thead>
        <tbody>
          {radarData.map((point) => (
            <tr key={point.category}>
              <td>{point.label}</td>
              <td>{point.years}</td>
              <td>{point.skillCount}</td>
            </tr>
          ))}
        </tbody>
      </Box>
    </Stack>
  );
};
