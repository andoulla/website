import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { DotItemDotProps } from 'recharts';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { visuallyHidden } from '@mui/utils';

import type { SkillCategory } from '@/data/skills.types';
import type { SkillSummary } from '@/utils/calculateSkillYears';
import { CATEGORY_COLOUR_MAP, resolveSkillColourMain } from '@/utils/skillColour';
import { CategoryLegend } from '@/views/skills/categoryLegend';

import { aggregateSkillsByCategory } from './SkillsRadarChart.helpers';
import type { CategoryRadarPoint } from './SkillsRadarChart.types';
import { CategoryTooltip } from './categoryTooltip';

const CHART_HEIGHT = 440;

interface SkillsRadarChartProps {
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
  const maxYears = Math.max(...radarData.map((point) => point.avgYears), 1);
  // primary.main is tuned for contrast on a light background; against a dark paper background
  // (e.g. purple theme's dark plum) it reads as too low-contrast, so use the lighter shade instead.
  const radarColour =
    theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main;

  // A <Radar> is a single polygon, so unlike SkillsBarChart's per-bar Cell/isBarMatch dimming,
  // a non-matching category can't be dimmed by fading the whole shape — colour each vertex dot
  // individually instead, so a non-matching axis still stands out.
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
        <RadarChart data={radarData} outerRadius="90%">
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
            dataKey="avgYears"
            stroke={radarColour}
            fill={radarColour}
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
        <caption>Average years of experience per skill, by category</caption>
        <thead>
          <tr>
            <th scope="col">Category</th>
            <th scope="col">Avg Years</th>
            <th scope="col">Skills</th>
          </tr>
        </thead>
        <tbody>
          {radarData.map((point) => (
            <tr key={point.category}>
              <td>{point.label}</td>
              <td>{point.avgYears}</td>
              <td>{point.skillCount}</td>
            </tr>
          ))}
        </tbody>
      </Box>
    </Stack>
  );
};
