import { useState } from 'react';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TooltipContentProps } from 'recharts';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { lighten, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { visuallyHidden } from '@mui/utils';

import { SkillTooltipContent } from '@/components/skillTooltipContent';
import type { SkillSummary } from '@/utils/calculateSkillYears';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '@/utils/skillCategory';
import { resolveSkillColourMain } from '@/utils/skillColour';
import { CategoryLegend } from '@/views/skills/categoryLegend';

import { isBarMatch } from './SkillsBarChart.helpers';

const BAR_HEIGHT = 36;
const BAR_SIZE = 14;
const CHART_PADDING = 64;
const MIN_HEIGHT = 200;

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

  // Categories present, in fixed display order.
  const presentCategories = CATEGORY_ORDER.filter((cat) =>
    skills.some((skill) => skill.category === cat)
  );

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
              const fill = resolveSkillColourMain(skill.colour, theme);
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

      <CategoryLegend categories={presentCategories} />

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
