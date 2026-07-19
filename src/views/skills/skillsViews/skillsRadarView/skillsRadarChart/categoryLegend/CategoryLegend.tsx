import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import type { PresentCategory } from '@/utils/derivePresentCategories';
import { resolveSkillColourMain } from '@/utils/skillColour';
import { CategoryColourDot } from '@/views/skills/categoryColourDot';

interface CategoryLegendProps {
  categories: PresentCategory[];
}

export const CategoryLegend = ({ categories }: CategoryLegendProps) => {
  const theme = useTheme();

  if (categories.length === 0) return null;

  return (
    <Box
      aria-hidden="true"
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
      {categories.map((category) => (
        <Box key={category.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CategoryColourDot
            colour={resolveSkillColourMain(category.colour, theme)}
            sx={{ opacity: 0.7 }}
          />
          <Typography variant="caption" color="text.secondary">
            {category.name}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};
