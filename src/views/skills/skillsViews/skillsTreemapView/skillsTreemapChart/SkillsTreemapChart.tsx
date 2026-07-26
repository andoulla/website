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

const CHART_HEIGHT = 420;
const LABEL_MIN_WIDTH = 48;
const LABEL_MIN_HEIGHT = 28;
const YEARS_MIN_HEIGHT = 48;

type CellRenderProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  value: number;
};

// Extracted outside component to avoid react/prop-types false positives on render fn.
const makeCellRenderer = (colourByName: Map<string, string>, textColour: string) =>
  function CellRenderer(rawProps: unknown): React.ReactElement | null {
    const { x, y, width, height, name, value } = rawProps as CellRenderProps;

    if (width <= 0 || height <= 0) return null;

    const fill = colourByName.get(name) ?? '#9e9e9e';
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
}

export const SkillsTreemapChart = ({ skills }: SkillsTreemapChartProps) => {
  const theme = useTheme();

  const colourByName = useMemo(
    () =>
      new Map(skills.map((skill) => [skill.skill, resolveSkillColourMain(skill.colour, theme)])),
    [skills, theme]
  );

  const treeData = useMemo(
    () => skills.map((skill) => ({ name: skill.skill, size: skill.years })),
    [skills]
  );

  const legendCategories = useMemo(() => derivePresentCategories(skills), [skills]);

  const renderCell = useMemo(
    () => makeCellRenderer(colourByName, theme.palette.common.white),
    [colourByName, theme.palette.common.white]
  );

  return (
    <Stack spacing={2}>
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <Treemap
          data={treeData}
          dataKey="size"
          stroke="none"
          content={renderCell}
          isAnimationActive={false}
        >
          <Tooltip formatter={(val: number) => [`${val.toFixed(1)} years`]} />
        </Treemap>
      </ResponsiveContainer>

      <Box
        aria-hidden="true"
        sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2 }}
      >
        {legendCategories.map((category) => (
          <Box key={category.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <CategoryColourDot colour={resolveSkillColourMain(category.colour, theme)} />
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
