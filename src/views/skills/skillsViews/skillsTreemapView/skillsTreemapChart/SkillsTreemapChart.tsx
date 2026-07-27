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

import {
  CategoryPatternDefinition,
  getCategoryPatternBackground,
  getCategoryPatternId,
} from '../../categoryPattern';
import { CategoryLegend } from '../../categoryLegend';

const CHART_HEIGHT = 600;
const LABEL_MIN_WIDTH = 48;
const LABEL_MIN_HEIGHT = 28;
const CELL_PADDING_X = 6;
const TEXT_FONT_SIZE = 11;
const TEXT_LINE_HEIGHT = 14;
const YEARS_FONT_SIZE = 10;
const YEARS_LINE_HEIGHT = 13;
const YEARS_GAP = 4;
// Approximate character width for bold 11px — used for greedy word-wrap.
const APPROX_CHAR_WIDTH = 6.5;

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
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {data.name}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mt: 0.25 }}>
        {data.subCategoryName !== undefined && (
          <Typography variant="caption" color="text.secondary">
            {data.subCategoryName}
          </Typography>
        )}
        <Typography variant="caption">{data.size.toFixed(1)} years</Typography>
      </Box>
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

// Greedy word-wrap: splits text into lines that fit within maxWidth pixels.
const wrapText = (text: string, maxWidth: number): string[] => {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current.length > 0 ? `${current} ${word}` : word;

    if (candidate.length * APPROX_CHAR_WIDTH > maxWidth && current.length > 0) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }

  if (current.length > 0) lines.push(current);

  return lines;
};

// Extracted outside component to avoid react/prop-types false positives on render fn.
const makeCellRenderer = (
  colourByName: Map<string, string>,
  patternIdByName: Map<string, string> | null,
  textColour: string
) =>
  function CellRenderer(rawProps: unknown): React.ReactElement {
    const { x, y, width, height, name, value } = rawProps as CellRenderProps;

    if (width <= 0 || height <= 0) return <g />;

    const colour = colourByName.get(name) ?? '#9e9e9e';
    const patternId = patternIdByName?.get(name);
    const fill = patternId !== undefined ? `url(#${patternId})` : colour;

    const showName = width >= LABEL_MIN_WIDTH && height >= LABEL_MIN_HEIGHT;
    const lines = showName ? wrapText(name, width - CELL_PADDING_X * 2) : [];
    const nameBlockHeight = lines.length * TEXT_LINE_HEIGHT;
    const showYears = showName && height >= nameBlockHeight + YEARS_GAP + YEARS_LINE_HEIGHT + 8;

    const label = value === 1 ? '1 yr' : `${value.toFixed(1)} yrs`;
    const totalContentHeight = nameBlockHeight + (showYears ? YEARS_GAP + YEARS_LINE_HEIGHT : 0);
    const contentStartY = y + (height - totalContentHeight) / 2 + TEXT_LINE_HEIGHT;

    return (
      <g>
        <rect x={x + 1} y={y + 1} width={width - 2} height={height - 2} fill={fill} rx={3} />
        {showName &&
          lines.map((line, lineIndex) => (
            <text
              key={`${name}-${lineIndex}`}
              x={x + CELL_PADDING_X}
              y={contentStartY + lineIndex * TEXT_LINE_HEIGHT}
              fontSize={TEXT_FONT_SIZE}
              fontWeight={600}
              fill={textColour}
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {line}
            </text>
          ))}
        {showYears && (
          <text
            x={x + CELL_PADDING_X}
            y={contentStartY + nameBlockHeight + YEARS_GAP}
            fontSize={YEARS_FONT_SIZE}
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

      <CategoryLegend
        categories={legendEntries.map(({ category }) => category)}
        shape="square"
        getBackground={
          showPatterns
            ? (colour, index) =>
                getCategoryPatternBackground(index, colour, theme.palette.getContrastText(colour))
            : undefined
        }
      />

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
