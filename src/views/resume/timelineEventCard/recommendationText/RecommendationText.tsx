import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import { lighten } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import type { Recommendation } from '@/types';

import { recommendationElementId } from '../TimelineEventCard.helpers';

import { RecommendationByline } from './recommendationByline';

export interface RecommendationTextProps {
  recommendation: Recommendation;
  isHighlighted?: boolean;
}

export const RecommendationText = ({
  recommendation,
  isHighlighted = false,
}: RecommendationTextProps) => {
  const color = 'primary';
  return (
    <Card
      id={recommendationElementId(recommendation.id)}
      variant="outlined"
      sx={(theme) => ({
        borderColor: lighten(theme.palette[color].main, 0.4),
        borderLeftWidth: 4,
        backgroundColor: `color-mix(in srgb, ${theme.palette[color].main} 8%, ${theme.palette.background.paper})`,
        ...(isHighlighted && {
          outline: `2px solid ${theme.palette[color].main}`,
          outlineOffset: 2,
        }),
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
          <RecommendationByline recommendation={recommendation} />
        </Stack>
        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
          {`"${recommendation.text}"`}
        </Typography>
      </CardContent>
    </Card>
  );
};
