import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

import { CATEGORY_TO_COLOR_MAPPING, LEGEND_ITEMS } from './SkillCategoryLegend.constants';

export const SkillCategoryLegend = () => {
  const theme = useTheme();

  return (
    <Box sx={{ mb: 2 }}>
      <Stack
        direction="row"
        sx={{
          flexWrap: 'wrap',
          gap: { xs: 1.5, sm: 2, md: 3 },
          justifyContent: 'flex-start',
        }}
      >
        {LEGEND_ITEMS.map((item) => {
          const colorMapping = CATEGORY_TO_COLOR_MAPPING[item.categoryId];

          if (colorMapping === undefined) {
            return null;
          }

          const color = theme.palette[colorMapping.paletteFamily][colorMapping.shade];

          return (
            <Box key={item.categoryId} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                role="presentation"
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: color,
                  flexShrink: 0,
                }}
              />
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                {item.label}
              </Typography>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
};
