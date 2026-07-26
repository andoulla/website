import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { visuallyHidden } from '@mui/utils';
import { ResponsiveContainer, Tooltip, Treemap } from 'recharts';

import type { SkillSummary } from '@/utils/calculateSkillYears';
import { derivePresentCategories } from '@/utils/derivePresentCategories';
import { resolveSkillColourMain } from '@/utils/skillColour';
import { CategoryColourDot } from '@/views/skills/categoryColourDot';

import {
  CategoryPatternDefinition,
  getCategoryPatternBackground,
  getCategoryPatternId,
} from '../../categoryPattern';

const CHART_HEIGHT = 420;
const LABEL_MIN_WIDTH = 48;
const LABEL_MIN_HEIGHT = 28;
const YEARS_MIN_HEIGHT = 48;

type TreemapTooltipProps = {
  active?: boolean;
  payload?: Array<{ payload?: { name: string; size: number; subCategoryName?: string } }>;
};

const TreemapTooltip = ({ active, payload }: TreemapTooltipProps) => {
  if (active !== true || payload === undefined || payload.length === 0) return null;

  const data = payload[0]?.payload;

  if (data === undefined) return null;

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        px: 1.5,
        py: 1,
        boxShadow: 2,
      }}
    >
      <Typography variant="body2" fontWeight={600}>
        {data.name}
      </Typography>
      {data.subCategoryName !== undefined && (
        <Typography variant="caption" display="block" color="text.secondary">
          {data.subCategoryName}
        </Typography>
      )}
      <Typography variant="caption" display="block">
        {data.size.toFixed(1)} years
      </Typography>
    </Box>
  );
};

type CellRenderProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  value: number;
};

// Extracted outside component to avoid react/prop-types false positives on render fn.
const makeCellRenderer = (
  colourByName: Map<string, string>,
  patternIdByName: Map<string, string> | null,
  textColour: string
) =>
  function CellRenderer(rawProps: unknown): React.ReactElement | null {
    const { x, y, width, height, name, value } = rawProps as CellRenderProps;

    if (width <= 0 || height <= 0) return null;

    const colour = colourByName.get(name) ?? '#9e9e9e';
    const patternId = patternIdByName?.get(name);
    const fill = patternId !== undefined ? `url(#${patternId})` : colour;
    const showName = width >= LABEL_MIN_WIDTH && height >= LABEL_MIN_HEIGHT;
    const showYears = height >= YEARS_MIN_HEIGHT;
    const label = value === 1 ? '1 yr' : `${value.toFixed(1)} yrs`;

    return (
      <g>
        <rect x={x + 1} y={y + 1} width={width - 2} height={height - 2} fill={fill} rx={3} />
        {showName && (
          <text
            x={x + 6}
            y={y + (showYears ? height / 2 - 6 : height / 2)}
            fontSize={11}
            fontWeight={600}
            fill={textColour}
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            {name}
          </text>
        )}
        {showName && showYears && (
          <text
            x={x + 6}
            y={y + height / 2 + 10}
            fontSize={10}
            fill={textColour}
            opacity={0.8}
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            {label}
          </text>
        )}
      </g>
    );
  };

interface SkillsTreemapChartProps {
  skills: SkillSummary[];
  showPatterns?: boolean;
}

export const SkillsTreemapChart = ({ skills, showPatterns = false }: SkillsTreemapChartProps) => {
  const theme = useTheme();

  const colourByName = useMemo(
    () =>
      new Map(skills.map((skill) => [skill.skill, resolveSkillColourMain(skill.colour, theme)])),
    [skills, theme]
  );

  const treeData = useMemo(
    () =>
      skills.map((skill) => ({
        name: skill.skill,
        size: skill.years,
        subCategoryName: skill.subCategoryName,
      })),
    [skills]
  );

  const legendEntries = useMemo(
    () =>
      derivePresentCategories(skills).map((category) => {
        const colour = resolveSkillColourMain(category.colour, theme);

        return { category, colour, markColour: theme.palette.getContrastText(colour) };
      }),
    [skills, theme]
  );

  const patternIdByName = useMemo(
    () =>
      showPatterns
        ? new Map(skills.map((skill) => [skill.skill, getCategoryPatternId(skill.categoryId)]))
        : null,
    [skills, showPatterns]
  );

  const renderCell = useMemo(
    () => makeCellRenderer(colourByName, patternIdByName, theme.palette.common.white),
    [colourByName, patternIdByName, theme.palette.common.white]
  );

  return (
    <Stack spacing={2}>
      {/* Hidden SVG carries <defs> so url(#id) pattern refs resolve across the chart SVG. */}
      {showPatterns && (
        <svg width={0} height={0} style={{ position: 'absolute' }}>
          <defs>
            {legendEntries.map(({ category, colour, markColour }) => (
              <CategoryPatternDefinition
                key={category.id}
                category={category}
                colour={colour}
                markColour={markColour}
                markOpacity={0.35}
              />
            ))}
          </defs>
        </svg>
      )}
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <Treemap
          data={treeData}
          dataKey="size"
          stroke="none"
          content={renderCell}
          isAnimationActive={false}
        >
          <Tooltip content={<TreemapTooltip />} />
        </Treemap>
      </ResponsiveContainer>

      <Box
        aria-hidden="true"
        sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2 }}
      >
        {legendEntries.map(({ category, colour, markColour }) => (
          <Box key={category.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
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

      <Box component="table" sx={visuallyHidden} aria-label="Skills by years of experience">
        <caption>Skills and years of experience</caption>
        <thead>
          <tr>
            <th scope="col">Skill</th>
            <th scope="col">Years</th>
          </tr>
        </thead>
        <tbody>
          {skills.map((skill) => (
            <tr key={skill.skill}>
              <td>{skill.skill}</td>
              <td>{skill.years.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </Box>
    </Stack>
  );
};
