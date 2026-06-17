import Chip from '@mui/material/Chip';
import type { ChipProps } from '@mui/material/Chip';
import type { ReactNode } from 'react';

export interface TagProps {
  children: ReactNode;
  color?: ChipProps['color'];
}

export function Tag({ children, color }: TagProps) {
  return <Chip label={children} color={color} size="small" />;
}
