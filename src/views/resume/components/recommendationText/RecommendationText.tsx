import { memo } from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { Recommendation } from '../../../../types';

export interface RecommendationTextProps {
  recommendation: Recommendation;
}

export const RecommendationText = memo(({ recommendation }: RecommendationTextProps) => {
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
        <Stack direction="row" spacing={1} sx={{ mb: 1, alignItems: 'center' }}>
          <Avatar
            sx={(theme) => ({
              width: 28,
              height: 28,
              fontSize: '0.75rem',
              bgcolor: theme.palette[color].main,
              color: theme.palette[color].contrastText,
            })}
          >
            {recommendation.authorInitials}
          </Avatar>
          <Typography variant="caption" color="text.secondary">
            {recommendation.authorInitials}, {recommendation.authorRole.jobTitle}
          </Typography>
        </Stack>
        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
          {`"${recommendation.text}"`}
        </Typography>
      </CardContent>
    </Card>
  );
});

RecommendationText.displayName = 'RecommendationText';
