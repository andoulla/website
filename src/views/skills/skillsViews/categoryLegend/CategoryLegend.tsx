import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import type { PresentCategory } from '@/utils/derivePresentCategories';
import { resolveSkillColourMain } from '@/utils/skillColour';
import { CategoryColourDot } from '@/views/skills/categoryColourDot';

interface CategoryLegendProps {
  categories: PresentCategory[];
  shape?: 'circle' | 'square';
  // Override the dot background — e.g. a pattern url(). Receives the hex colour and track index.
  getBackground?: (colour: string, categoryIndex: number) => string;
  // Tap-to-highlight: when provided, entries become buttons that toggle a category on/off.
  // Omitted by callers (e.g. the radar view) that don't drive any highlight state — the legend
  // then stays the purely decorative, aria-hidden strip it always was.
  selectedCategoryId?: string | null;
  onSelectCategory?: (categoryId: string) => void;
}

export const CategoryLegend = ({
  categories,
  shape = 'circle',
  getBackground,
  selectedCategoryId = null,
  onSelectCategory,
}: CategoryLegendProps) => {
  const theme = useTheme();
  const isInteractive = onSelectCategory !== undefined;

  if (categories.length === 0) return null;

  return (
    <Box
      aria-hidden={isInteractive ? undefined : 'true'}
      role={isInteractive ? 'group' : undefined}
      aria-label={isInteractive ? 'Highlight a category' : undefined}
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        rowGap: 1.5,
        columnGap: 3,
        pt: 1,
        // dark mode: subtle raised strip so the legend reads as a unit against the paper bg
        ...(theme.palette.mode === 'dark' && {
          width: 'fit-content',
          mx: 'auto',
          px: 2,
          py: 1,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.common.white, 0.05),
        }),
      }}
    >
      {categories.map((category) => {
        const colour = resolveSkillColourMain(category.colour, theme);
        const isSelected = selectedCategoryId === category.id;

        const content = (
          <>
            <CategoryColourDot
              shape={shape}
              colour={colour}
              background={getBackground?.(colour, category.index)}
              sx={shape === 'circle' ? { opacity: 0.7 } : undefined}
            />
            <Typography variant="caption" color="text.secondary">
              {category.name}
            </Typography>
          </>
        );

        if (!isInteractive) {
          return (
            <Box key={category.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {content}
            </Box>
          );
        }

        return (
          <ButtonBase
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            aria-pressed={isSelected}
            aria-label={`Highlight ${category.name}`}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              borderRadius: 1,
              px: 0.5,
              opacity: selectedCategoryId !== null && !isSelected ? 0.5 : 1,
              transition: 'opacity 0.2s ease',
            }}
          >
            {content}
          </ButtonBase>
        );
      })}
    </Box>
  );
};
