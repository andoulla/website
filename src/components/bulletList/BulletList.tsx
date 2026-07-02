import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';

export interface BulletListProps {
  items: string[];
}

export function BulletList({ items }: BulletListProps) {
  return (
    <List dense disablePadding sx={{ listStyle: 'disc', pl: 2.5 }}>
      {items.map((item) => (
        <ListItem key={item} disableGutters sx={{ display: 'list-item', py: 0 }}>
          <Typography variant="body2">{item}</Typography>
        </ListItem>
      ))}
    </List>
  );
}
