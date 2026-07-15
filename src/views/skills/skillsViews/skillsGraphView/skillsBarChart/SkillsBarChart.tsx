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
import type { SkillSummary } from '@/utils/calculateSkillYears';
import { derivePresentCategories, type PresentCategory } from '@/utils/derivePresentCategories';
import { resolveSkillColourMain } from '@/utils/skillColour';
import { CategoryColourDot } from '@/views/skills/categoryColourDot';

import { CATEGORY_PATTERN_SHAPE_DEFINITIONS } from './SkillsBarChart.constants';
import {
  getCategoryPatternBackground,
  getCategoryPatternId,
  getCategoryPatternType,
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

interface CategoryPatternDefinitionProps {
  category: PresentCategory;
  colour: string;
  markColour: string;
}

// SVG <pattern> for a category's bar fill — mirrors getCategoryPatternBackground's CSS look.
// Rendered inside <defs>, which Recharts passes straight through into the chart's <svg>.
const CategoryPatternDefinition = ({
  category,
  colour,
  markColour,
}: CategoryPatternDefinitionProps) => {
  const id = getCategoryPatternId(category.id);
  const { width, height, patternTransform, lines, circle, ring } =
    CATEGORY_PATTERN_SHAPE_DEFINITIONS[getCategoryPatternType(category.index)];

  return (
    <pattern
      id={id}
      patternUnits="userSpaceOnUse"
      width={width}
      height={height}
      patternTransform={patternTransform}
    >
      <rect width={width} height={height} fill={colour} />
      {lines.map((line) => (
        <line
          key={`${line.x1}-${line.y1}-${line.x2}-${line.y2}`}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke={markColour}
          strokeWidth={line.strokeWidth}
        />
      ))}
      {circle !== undefined && (
        <circle cx={circle.cx} cy={circle.cy} r={circle.r} fill={markColour} />
      )}
      {ring !== undefined && (
        <circle
          cx={ring.cx}
          cy={ring.cy}
          r={ring.r}
          fill="none"
          stroke={markColour}
          strokeWidth={ring.strokeWidth}
        />
      )}
    </pattern>
  );
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

  const chartHeight = Math.max(MIN_HEIGHT, skills.length * BAR_HEIGHT + CHART_PADDING);

  // Legend: one entry per category present, in track order. markColour is the pattern's
  // ink colour — high-contrast against the category colour so the texture reads at swatch size.
  const legendEntries = derivePresentCategories(skills).map((category) => {
    const colour = resolveSkillColourMain(category.colour, theme);
    return {
      category,
      colour,
      markColour: theme.palette.getContrastText(colour),
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
          <Tooltip
            content={SkillBarTooltip}
            cursor={{ fill: theme.palette.action.hover }}
            // Recharts defaults the tooltip wrapper to `pointer-events: none` — override it so the
            // "View on Resume"/recommendation links inside SkillTooltipContent are clickable.
            wrapperStyle={{ pointerEvents: 'auto' }}
          />
          {showPatterns && (
            <defs>
              {legendEntries.map(({ category, colour, markColour }) => (
                <CategoryPatternDefinition
                  key={category.id}
                  category={category}
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
              const colour = resolveSkillColourMain(skill.colour, theme);
              return (
                <Cell
                  key={skill.id}
                  fill={showPatterns ? `url(#${getCategoryPatternId(skill.categoryId)})` : colour}
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
        {legendEntries.map(({ category, colour, markColour }) => (
          <Box key={category.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CategoryColourDot
              shape="square"
              colour={colour}
              background={
                showPatterns
                  ? getCategoryPatternBackground(category.index, colour, markColour)
                  : undefined
              }
            />
            <Typography variant="caption" color="text.secondary">
              {category.name}
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
            <tr key={skill.id}>
              <td>{skill.skill}</td>
              <td>{skill.years}</td>
              <td>{skill.categoryName}</td>
            </tr>
          ))}
        </tbody>
      </Box>
    </Stack>
  );
};
