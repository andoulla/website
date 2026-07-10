import Box from '@mui/material/Box';

export interface CategoryColourDotProps {
  shape?: 'circle' | 'square';
  colour?: string;
  background?: string;
  sx?: Record<string, string | number>;
}

const RADIUS_BY_SHAPE = { circle: '50%', square: '2px' } as const;

export const CategoryColourDot = ({
  shape = 'circle',
  colour,
  background,
  sx,
}: CategoryColourDotProps) => (
  <Box
    sx={{
      width: 8,
      height: 8,
      borderRadius: RADIUS_BY_SHAPE[shape],
      ...(background !== undefined ? { background } : { bgcolor: colour }),
      flexShrink: 0,
      ...sx,
    }}
  />
);
