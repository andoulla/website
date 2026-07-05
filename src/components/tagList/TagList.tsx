import { memo } from 'react';
import Box from '@mui/material/Box';

import { skillColour, skillShadeIndex } from '@/utils/skillColour';
import { Tag } from '@/components/tag';

export interface TagListProps {
  items: string[];
  onItemClick?: (item: string) => void;
}

export const TagList = memo(({ items, onItemClick }: TagListProps) => {
  return (
    <Box component="ul" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, p: 0, m: 0 }}>
      {items.map((item) => (
        <Box key={item} component="li" sx={{ listStyle: 'none' }}>
          <Tag
            colour={skillColour(item)}
            shadeIndex={skillShadeIndex(item)}
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
});

TagList.displayName = 'TagList';
