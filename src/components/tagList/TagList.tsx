import type { ChipProps } from '@mui/material/Chip';
import Box from '@mui/material/Box';
import { memo } from 'react';

import { Tag } from './tag';

export interface TagListProps {
  items: string[];
  onItemClick?: (item: string) => void;
  getColour?: (item: string) => ChipProps['color'];
  getShadeIndex?: (item: string) => number;
  variant?: ChipProps['variant'];
}

export const TagList = memo(
  ({ items, onItemClick, getColour, getShadeIndex, variant }: TagListProps) => {
    return (
      <Box component="ul" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, p: 0, m: 0 }}>
        {items.map((item) => (
          <Box key={item} component="li" sx={{ listStyle: 'none' }}>
            <Tag
              colour={getColour?.(item)}
              shadeIndex={getShadeIndex?.(item)}
              variant={variant}
              onClick={
                onItemClick !== undefined
                  ? () => {
                      onItemClick(item);
                    }
                  : undefined
              }
            >
              {item}
            </Tag>
          </Box>
        ))}
      </Box>
    );
  }
);

TagList.displayName = 'TagList';
