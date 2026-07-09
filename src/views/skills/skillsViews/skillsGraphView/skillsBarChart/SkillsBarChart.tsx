import { useState } from 'react';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TooltipContentProps } from 'recharts';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { visuallyHidden } from '@mui/utils';

import { SkillTooltipContent } from '@/components/skillTooltipContent';
import type { SkillCategory } from '@/data/skills.types';
import type { SkillSummary } from '@/utils/calculateSkillYears';
import { getPaletteColourMain } from '@/utils/paletteColourMain';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '@/utils/skillCategory';
import { CATEGORY_COLOUR_MAP } from '@/utils/skillColour';

import {
  CATEGORY_PATTERN_KIND,
  getCategoryPatternBackground,
  getCategoryPatternId,
  isBarMatch,
} from './SkillsBarChart.helpers';

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

interface CategoryPatternDefProps {
  category: SkillCategory;
  colour: string;
  markColour: string;
}

// SVG <pattern> for a category's bar fill — mirrors getCategoryPatternBackground's CSS look.
// Rendered inside <defs>, which Recharts passes straight through into the chart's <svg>.
const CategoryPatternDef = ({ category, colour, markColour }: CategoryPatternDefProps) => {
  const id = getCategoryPatternId(category);
  switch (CATEGORY_PATTERN_KIND[category]) {
    case 'diagonal':
      return (
        <pattern
          id={id}
          patternUnits="userSpaceOnUse"
          width={8}
          height={8}
          patternTransform="rotate(45)"
        >
          <rect width={8} height={8} fill={colour} />
          <line x1={2} y1={0} x2={2} y2={8} stroke={markColour} strokeWidth={2} />
        </pattern>
      );
    case 'vertical':
      return (
        <pattern id={id} patternUnits="userSpaceOnUse" width={8} height={8}>
          <rect width={8} height={8} fill={colour} />
          <line x1={4} y1={0} x2={4} y2={8} stroke={markColour} strokeWidth={2} />
        </pattern>
      );
    case 'crosshatch':
      return (
        <pattern id={id} patternUnits="userSpaceOnUse" width={8} height={8}>
          <rect width={8} height={8} fill={colour} />
          <line x1={0} y1={0} x2={8} y2={8} stroke={markColour} strokeWidth={1.5} />
          <line x1={8} y1={0} x2={0} y2={8} stroke={markColour} strokeWidth={1.5} />
        </pattern>
      );
    case 'dots':
      return (
        <pattern id={id} patternUnits="userSpaceOnUse" width={6} height={6}>
          <rect width={6} height={6} fill={colour} />
          <circle cx={3} cy={3} r={1.5} fill={markColour} />
        </pattern>
      );
  }
};

interface SkillsBarChartProps {
  skills: SkillSummary[];
  searchTerm?: string;
  showPatterns?: boolean;
}

export const SkillsBarChart = ({
  skills,
  searchTerm,
  showPatterns = true,
}: SkillsBarChartProps) => {
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

  // Legend: one entry per category present, in fixed display order. markColour is the pattern's
  // ink colour — high-contrast against the category colour so the texture reads at swatch size.
  const legendEntries = CATEGORY_ORDER.filter((cat) =>
    skills.some((skill) => skill.category === cat)
  ).map((cat) => {
    const colour = getPaletteColourMain(CATEGORY_COLOUR_MAP[cat], theme);
    return {
      cat,
      colour,
      markColour: theme.palette.getContrastText(colour),
      label: CATEGORY_LABELS[cat],
    };
  });

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
          {showPatterns && (
            <defs>
              {legendEntries.map(({ cat, colour, markColour }) => (
                <CategoryPatternDef
                  key={cat}
                  category={cat}
                  colour={colour}
                  markColour={markColour}
                />
              ))}
            </defs>
          )}
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
              const isMatch = isBarMatch(skill, searchTerm);
              const isHovered = i === hoverIndex && isMatch;
              const colour = getPaletteColourMain(CATEGORY_COLOUR_MAP[skill.category], theme);
              return (
                <Cell
                  key={skill.skill}
                  fill={showPatterns ? `url(#${getCategoryPatternId(skill.category)})` : colour}
                  style={{
                    opacity: isMatch ? 1 : 0.35,
                    filter: isHovered ? 'brightness(1.25)' : 'none',
                    transition: 'filter 0.15s ease, opacity 0.2s ease',
                    cursor: 'pointer',
                  }}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend — styled like a figure caption: muted text, pattern swatches vertically centred with labels */}
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
        {legendEntries.map(({ cat, colour, markColour, label }) => (
          <Box key={cat} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '2px',
                background: showPatterns
                  ? getCategoryPatternBackground(cat, colour, markColour)
                  : colour,
                flexShrink: 0,
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
