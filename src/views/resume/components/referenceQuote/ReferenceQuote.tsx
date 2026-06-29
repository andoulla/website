import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { getInitials } from '../../../../utils/getInitials';
import type { Reference } from '../../../../data/references';

export interface ReferenceQuoteProps {
  reference: Reference;
}

export function ReferenceQuote({ reference }: ReferenceQuoteProps) {
  const color = 'primary';
  return (
    <Card
      variant="outlined"
      sx={(theme) => ({
        borderColor: theme.palette[color].main,
        borderLeftWidth: 4,
        backgroundColor: `color-mix(in srgb, ${theme.palette[color].main} 8%, ${theme.palette.background.paper})`,
      })}
    >
      <CardContent>
        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
          {`"${reference.quote}"`}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 1, alignItems: 'center' }}>
          <Avatar
            sx={(theme) => ({
              width: 28,
              height: 28,
              fontSize: '0.75rem',
              bgcolor: theme.palette[color].main,
              color: theme.palette[color].contrastText,
            })}
          >
            {getInitials(reference.authorName)}
          </Avatar>
          <Typography variant="caption" color="text.secondary">
            {reference.authorName}, {reference.authorRole}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
