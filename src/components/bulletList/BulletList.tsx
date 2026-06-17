import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

export interface BulletListProps {
  items: string[];
}

export function BulletList({ items }: BulletListProps) {
  return (
    <List dense disablePadding>
      {items.map((item) => (
        <ListItem key={item} disableGutters>
          <ListItemText primary={item} />
        </ListItem>
      ))}
    </List>
  );
}
