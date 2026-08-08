import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
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

import { makeCellRenderer } from './cellRenderer';
import { TreemapTooltip } from './treemapTooltip';

const CHART_HEIGHT = 600;

interface SkillsTreemapChartProps {
  skills: SkillSummary[];
  showPatterns?: boolean;
}

export const SkillsTreemapChart = ({ skills, showPatterns = false }: SkillsTreemapChartProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [focusedSkillName, setFocusedSkillName] = useState<string | null>(null);
  // Legend tap-to-highlight: which category's cells stay at full opacity (null = all of them).
  const [highlightedCategoryId, setHighlightedCategoryId] = useState<string | null>(null);

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

  const categoryIdByName = useMemo(
    () => new Map(skills.map((skill) => [skill.skill, skill.categoryId])),
    [skills]
  );

  const renderCell = useMemo(
    () =>
      makeCellRenderer(
        colourByName,
        patternIdByName,
        theme.palette.common.white,
        categoryIdByName,
        highlightedCategoryId
      ),
    [
      colourByName,
      patternIdByName,
      theme.palette.common.white,
      categoryIdByName,
      highlightedCategoryId,
    ]
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
        selectedCategoryId={highlightedCategoryId}
        onSelectCategory={(categoryId) =>
          setHighlightedCategoryId((current) => (current === categoryId ? null : categoryId))
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
