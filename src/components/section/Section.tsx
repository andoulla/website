import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import type { SxProps, Theme } from '@mui/material/styles';

interface SectionProps {
  title: string;
  titleLevel?: 2 | 3 | 4;
  titleSx?: SxProps<Theme>;
  children: ReactNode;
}

const VARIANT_BY_LEVEL = {
  2: 'h5',
  3: 'h6',
  4: 'subtitle1',
} as const;

export const Section = ({ title, titleLevel = 2, titleSx, children }: SectionProps) => {
  return (
    <Box component="section">
      <Typography
        component={`h${titleLevel}`}
        variant={VARIANT_BY_LEVEL[titleLevel]}
        sx={{ fontWeight: 'medium', ...titleSx }}
      >
        {title}
      </Typography>
      <Box sx={{ mt: 1.5 }}>{children}</Box>
    </Box>
  );
};
