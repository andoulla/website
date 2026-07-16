import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import { lighten } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useCallback } from 'react';

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
  const handleCardClick = useCallback(() => {
    window.open(recommendation.recommendationUrl, '_blank', 'noopener,noreferrer');
  }, [recommendation.recommendationUrl]);
  return (
    <Card
      id={recommendationElementId(recommendation.id)}
      variant="outlined"
      onClick={handleCardClick}
      sx={(theme) => ({
        borderColor: lighten(theme.palette[color].main, 0.4),
        borderLeftWidth: 4,
        backgroundColor:
          theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900],
        cursor: 'pointer',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
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
        <Typography
          sx={{
            fontSize: '0.4375rem',
            lineHeight: 1.8,
            letterSpacing: '0.3px',
          }}
        >
          {`"${recommendation.text}"`}
        </Typography>
      </CardContent>
    </Card>
  );
};
