import LinkedIn from '@mui/icons-material/LinkedIn';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { lighten } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import type { Recommendation } from '@/types';
import { formatDate } from '@/utils/formatDate';

export interface RecommendationTextProps {
  recommendation: Recommendation;
}

export const RecommendationText = ({ recommendation }: RecommendationTextProps) => {
  const color = 'primary';
  return (
    <Card
      variant="outlined"
      sx={(theme) => ({
        borderColor: lighten(theme.palette[color].main, 0.4),
        borderLeftWidth: 4,
        backgroundColor: `color-mix(in srgb, ${theme.palette[color].main} 8%, ${theme.palette.background.paper})`,
      })}
    >
      <CardContent>
        <Stack direction="row" spacing={1} sx={{ mb: 1, alignItems: 'center' }}>
          <Avatar
            sx={(theme) => ({
              width: 28,
              height: 28,
              fontSize: '0.75rem',
              bgcolor: lighten(theme.palette[color].main, 0.4),
              color: theme.palette[color].contrastText,
            })}
          >
            {recommendation.authorInitials}
          </Avatar>
          <Typography variant="caption" color="text.secondary">
            {recommendation.authorInitials}, {recommendation.authorRole.jobTitle}
            <Link
              href={recommendation.recommendationUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View full recommendation on LinkedIn"
              sx={{ ml: 0.5 }}
            >
              <LinkedIn fontSize="inherit" sx={{ verticalAlign: 'middle' }} />
            </Link>
            {' · '}
            {formatDate(recommendation.postedDate)}
          </Typography>
        </Stack>
        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
          {`"${recommendation.text}"`}
        </Typography>
      </CardContent>
    </Card>
  );
};
