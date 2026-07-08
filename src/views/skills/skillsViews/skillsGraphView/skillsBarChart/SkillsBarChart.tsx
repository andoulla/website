import { useState } from 'react';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TooltipContentProps } from 'recharts';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Theme } from '@mui/material/styles';
import { lighten, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { visuallyHidden } from '@mui/utils';

import { SkillTooltipContent } from '@/components/skillTooltipContent';
import type { SkillSummary } from '@/utils/calculateSkillYears';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '@/utils/skillCategory';
import { CATEGORY_COLOUR_MAP } from '@/utils/skillColour';
import type { SkillColour } from '@/utils/skillColour';

import { isBarMatch } from './SkillsBarChart.helpers';

const BAR_HEIGHT = 36;
const BAR_SIZE = 14;
const CHART_PADDING = 64;
const MIN_HEIGHT = 200;

// Safely resolves a SkillColour key to the palette's .main hex value.
// Mirrors the dotColour() pattern in SkillsListView.
const getPaletteMain = (colour: SkillColour, theme: Theme): string => {
  if (colour === 'default') return theme.palette.grey[400];
  const entry = theme.palette[colour as keyof typeof theme.palette];
  if (entry !== null && typeof entry === 'object' && 'main' in entry) {
    return (entry as { main: string }).main;
  }
  return theme.palette.grey[400];
};

// Bridges Recharts tooltip payload → SkillTooltipContent props.
const SkillBarTooltip = ({ active, payload }: TooltipContentProps) => {
  if (!active || payload === undefined || payload.length === 0) return null;
  const skill = payload[0].payload as SkillSummary;
  return <SkillTooltipContent skill={skill} />;
};

export interface SkillsBarChartProps {
  skills: SkillSummary[];
  searchTerm?: string;
}

export const SkillsBarChart = ({ skills, searchTerm }: SkillsBarChartProps) => {
  const theme = useTheme();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  if (skills.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
        No skills match the selected filter.
      </Typography>
    );
  }

  const chartHeight = Math.max(MIN_HEIGHT, skills.length * BAR_HEIGHT + CHART_PADDING);

  // Legend: one entry per category present, in fixed display order.
  const legendEntries = CATEGORY_ORDER.filter((cat) =>
    skills.some((skill) => skill.category === cat)
  ).map((cat) => ({
    cat,
    colour: CATEGORY_COLOUR_MAP[cat],
    label: CATEGORY_LABELS[cat],
  }));

  // Y-axis width: longer skill names need more space, capped for mobile.
  const maxLabelLength = Math.max(...skills.map((skill) => skill.skill.length));
  const yAxisWidth = Math.min(Math.max(maxLabelLength * 7, 80), 160);

  return (
    <Stack spacing={1}>
      {/* Horizontal bar chart — layout="vertical" = bars grow left-to-right in Recharts */}
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          layout="vertical"
          data={skills}
          margin={{ top: 8, right: 32, left: 0, bottom: 8 }}
        >
          <XAxis
            type="number"
            tickFormatter={(v: number) => `${v}y`}
            domain={[0, 'auto']}
            tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
            axisLine={{ stroke: theme.palette.divider }}
            tickLine={{ stroke: theme.palette.divider }}
          />
          <YAxis
            type="category"
            dataKey="skill"
            width={yAxisWidth}
            tick={{ fontSize: 12, fill: theme.palette.text.primary }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={SkillBarTooltip} cursor={{ fill: theme.palette.action.hover }} />
          <Bar
            dataKey="years"
            radius={[0, 4, 4, 0]}
            barSize={BAR_SIZE}
            isAnimationActive={!prefersReducedMotion}
            animationDuration={400}
            animationEasing="ease-out"
            onMouseEnter={(_data, index) => {
              setHoverIndex(index);
            }}
            onMouseLeave={() => {
              setHoverIndex(null);
            }}
          >
            {skills.map((skill, i) => {
              const fill = getPaletteMain(skill.colour, theme);
              const isMatch = isBarMatch(skill, searchTerm);
              const shouldLighten = i === hoverIndex && isMatch;
              return (
                <Cell
                  key={skill.skill}
                  fill={shouldLighten ? lighten(fill, 0.25) : fill}
                  style={{
                    opacity: isMatch ? 1 : 0.35,
                    transition: 'fill 0.15s ease, opacity 0.2s ease',
                  }}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend — styled like a figure caption: muted text, dots vertically centred with labels */}
      <Box
        aria-hidden="true"
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          rowGap: 1.5,
          columnGap: 3,
          pt: 1,
        }}
      >
        {legendEntries.map(({ cat, colour, label }) => (
          <Box key={cat} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: getPaletteMain(colour, theme),
                flexShrink: 0,
                opacity: 0.7,
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Visually hidden table — accessible text alternative for screen readers */}
      <Box component="table" sx={visuallyHidden} aria-label="Skills data table">
        <caption>Skills with years of experience</caption>
        <thead>
          <tr>
            <th scope="col">Skill</th>
            <th scope="col">Years</th>
            <th scope="col">Category</th>
          </tr>
        </thead>
        <tbody>
          {skills.map((skill) => (
            <tr key={skill.skill}>
              <td>{skill.skill}</td>
              <td>{skill.years}</td>
              <td>{CATEGORY_LABELS[skill.category]}</td>
            </tr>
          ))}
        </tbody>
      </Box>
    </Stack>
  );
};
