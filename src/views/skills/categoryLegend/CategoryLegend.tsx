import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

import type { SkillCategory } from '@/data/skills.types';
import { CATEGORY_LABELS } from '@/utils/skillCategory';
import { CATEGORY_COLOUR_MAP, resolveSkillColourMain } from '@/utils/skillColour';

export interface CategoryLegendProps {
  categories: SkillCategory[];
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
      }}
    >
      {categories.map((category) => (
        <Box key={category} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: resolveSkillColourMain(CATEGORY_COLOUR_MAP[category], theme),
              flexShrink: 0,
              opacity: 0.7,
            }}
          />
          <Typography variant="caption" color="text.secondary">
            {CATEGORY_LABELS[category]}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};
