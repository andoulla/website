import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import { Tag } from '../tag';

export interface TagListProps {
  items: string[];
}

export function TagList({ items }: TagListProps) {
  return (
    <Stack direction="row" flexWrap="wrap" useFlexGap gap={1} component="ul" sx={{ p: 0, m: 0 }}>
      {items.map((item) => (
        <Box key={item} component="li" sx={{ listStyle: 'none' }}>
          <Tag>{item}</Tag>
        </Box>
      ))}
    </Stack>
  );
}
