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

type MarkerLabelProps = {
  value: string;
  fill: string;
  viewBox?: { x: number; y: number; width: number; height: number };
};

const MarkerLabel = ({ viewBox, value, fill }: MarkerLabelProps) => {
  if (viewBox === undefined) return null;

  const px = viewBox.x + 3;
  const py = viewBox.y + 4;

  return (
    <text
      x={px}
      y={py}
      textAnchor="start"
      fontSize={11.5}
      fill={fill}
      transform={`rotate(90, ${px}, ${py})`}
      style={{ pointerEvents: 'none', userSelect: 'none' }}
    >
      {value}
    </text>
  );
};

interface SkillsGrowthChartProps {
  growth: SkillGrowth;
  minYear: number;
  maxYear: number;
}

export const SkillsGrowthChart = ({ growth, minYear, maxYear }: SkillsGrowthChartProps) => {
  const theme = useTheme();
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const lineColour = theme.palette.primary.main;

  // include non-track markers (e.g. NCR, GnosisNet) even if their skills aren't in the active track
  const allYears = [
    minYear,
    ...growth.points.map((p) => Math.floor(p.year)),
    ...growth.markers.map((m) => m.year),
  ];
  const dataMinYear = Math.min(...allYears);
  const domainMax = Math.max(maxYear, dataMinYear + 1);
  const markers = growth.markers.filter((marker) => marker.year <= domainMax);

  // sentinel: extends plateau to today (stepAfter stops at last data point otherwise)
  const lastPoint = growth.points[growth.points.length - 1];
  const chartPoints =
    lastPoint !== undefined && lastPoint.year < domainMax
      ? [...growth.points, { year: domainMax, count: lastPoint.count }]
      : growth.points;

  const yearTicks = Array.from({ length: domainMax - dataMinYear + 1 }, (_, i) => dataMinYear + i);

  // fractional year; min +0.1 so tooltip snaps post-step
  const markerX = (startDate: string, year: number): number => {
    const d = new Date(startDate);
    const startOfYear = Date.UTC(year, 0, 1);
    const startOfNextYear = Date.UTC(year + 1, 0, 1);
    const fraction = (d.getTime() - startOfYear) / (startOfNextYear - startOfYear);

    return Math.max(year + fraction, year + 0.1);
  };

  return (
    <Stack spacing={1}>
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <AreaChart data={chartPoints} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
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
            domain={[dataMinYear, domainMax]}
            ticks={yearTicks}
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
          <Tooltip labelFormatter={(label) => Math.floor(Number(label))} />
          {markers.map((marker) => (
            <ReferenceLine
              key={`${marker.year}-${marker.companyName}`}
              x={markerX(marker.startDate, marker.year)}
              stroke={theme.palette.text.disabled}
              strokeDasharray="4 4"
              label={<MarkerLabel value={marker.companyName} fill={theme.palette.text.secondary} />}
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
              <td>{Math.floor(point.year)}</td>
              <td>{point.count}</td>
            </tr>
          ))}
        </tbody>
      </Box>
    </Stack>
  );
};
