import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

export interface SectionProps {
  title: string;
  titleLevel?: 2 | 3 | 4;
  children: ReactNode;
}

const VARIANT_BY_LEVEL = {
  2: 'h5',
  3: 'h6',
  4: 'subtitle1',
} as const;

export function Section({ title, titleLevel = 2, children }: SectionProps) {
  return (
    <Box component="section">
      <Typography component={`h${titleLevel}`} variant={VARIANT_BY_LEVEL[titleLevel]}>
        {title}
      </Typography>
      <Box sx={{ mt: 1 }}>{children}</Box>
    </Box>
  );
}
