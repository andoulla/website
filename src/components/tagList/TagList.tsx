import Box from '@mui/material/Box';

import { Tag } from '../tag';

export interface TagListProps {
  items: string[];
}

export function TagList({ items }: TagListProps) {
  return (
    <Box component="ul" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, p: 0, m: 0 }}>
      {items.map((item) => (
        <Box key={item} component="li" sx={{ listStyle: 'none' }}>
          <Tag>{item}</Tag>
        </Box>
      ))}
    </Box>
  );
}
