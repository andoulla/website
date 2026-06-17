import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

import type { Reference } from '../../../../data/references';

export interface ReferenceQuoteProps {
  reference: Reference;
}

export function ReferenceQuote({ reference }: ReferenceQuoteProps) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
          “{reference.quote}”
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {reference.authorName}, {reference.authorRole}
        </Typography>
      </CardContent>
    </Card>
  );
}
