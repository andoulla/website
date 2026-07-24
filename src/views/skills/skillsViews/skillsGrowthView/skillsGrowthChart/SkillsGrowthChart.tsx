import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { visuallyHidden } from '@mui/utils';

import type { SkillGrowth } from '@/utils/deriveSkillGrowth';

const CHART_HEIGHT = 360;
const FILL_ID = 'skill-growth-fill';

interface SkillsGrowthChartProps {
  growth: SkillGrowth;
  minYear: number;
  maxYear: number;
}

export const SkillsGrowthChart = ({ growth, minYear, maxYear }: SkillsGrowthChartProps) => {
  const theme = useTheme();
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const lineColour = theme.palette.primary.main;

  // Keep a non-zero domain even if the range collapses to a single year.
  const domainMax = Math.max(maxYear, minYear + 1);
  const markers = growth.markers.filter(
    (marker) => marker.year >= minYear && marker.year <= domainMax
  );

  return (
    <Stack spacing={1}>
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <AreaChart data={growth.points} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <defs>
            <linearGradient id={FILL_ID} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColour} stopOpacity={0.35} />
              <stop offset="100%" stopColor={lineColour} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={theme.palette.divider} strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="year"
            domain={[minYear, domainMax]}
            allowDecimals={false}
            tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
            axisLine={{ stroke: theme.palette.divider }}
            tickLine={{ stroke: theme.palette.divider }}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
            axisLine={{ stroke: theme.palette.divider }}
            tickLine={{ stroke: theme.palette.divider }}
          />
          <Tooltip />
          {markers.map((marker) => (
            <ReferenceLine
              key={`${marker.year}-${marker.companyName}`}
              x={marker.year}
              stroke={theme.palette.text.disabled}
              strokeDasharray="4 4"
              label={{
                value: marker.companyName,
                position: 'insideTopRight',
                fontSize: 10,
                fill: theme.palette.text.secondary,
              }}
            />
          ))}
          <Area
            type="stepAfter"
            dataKey="count"
            name="Skills"
            stroke={lineColour}
            strokeWidth={2}
            fill={`url(#${FILL_ID})`}
            isAnimationActive={!prefersReducedMotion}
            animationDuration={400}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Accessible text alternative for screen readers. */}
      <Box component="table" sx={visuallyHidden} aria-label="Cumulative skills by year">
        <caption>Cumulative unique skills acquired by year</caption>
        <thead>
          <tr>
            <th scope="col">Year</th>
            <th scope="col">Cumulative skills</th>
          </tr>
        </thead>
        <tbody>
          {growth.points.map((point) => (
            <tr key={point.year}>
              <td>{point.year}</td>
              <td>{point.count}</td>
            </tr>
          ))}
        </tbody>
      </Box>
    </Stack>
  );
};
