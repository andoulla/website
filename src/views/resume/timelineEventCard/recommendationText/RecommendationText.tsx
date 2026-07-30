import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { alpha, lighten, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';

import type { Recommendation } from '@/types';
import { truncateAtSentenceBoundary } from '@/utils/truncateAtSentenceBoundary';

import { recommendationElementId } from '../TimelineEventCard.helpers';

import { RecommendationByline } from './recommendationByline';

export interface RecommendationTextProps {
  recommendation: Recommendation;
  isHighlighted?: boolean;
}

// Maximum character length before truncation at sentence/clause boundary
const MAX_PREVIEW_LENGTH = 300;

export const RecommendationText = ({
  recommendation,
  isHighlighted = false,
}: RecommendationTextProps) => {
  const theme = useTheme();
  // user toggle wins; a deep-link highlight unclamps by default
  const [userExpanded, setUserExpanded] = useState<boolean | null>(null);
  const isClamped = !(userExpanded ?? isHighlighted);
  const clampLines = theme.density === 'comfortable' ? 4 : 3;

  // Truncate text at sentence/clause boundary for preview
  const previewText = useMemo(
    () => truncateAtSentenceBoundary(recommendation.text, MAX_PREVIEW_LENGTH),
    [recommendation.text]
  );

  return (
    <Box
      component="blockquote"
      id={recommendationElementId(recommendation.id)}
      sx={{
        borderLeft: 3,
        borderColor: isHighlighted
          ? theme.palette.primary.main
          : lighten(theme.palette.primary.main, 0.4),
        pl: 1.5,
        py: 0.5,
        m: 0,
        // Stretch to fill grid cell height
        display: 'flex',
        flexDirection: 'column',
        ...(isHighlighted && { backgroundColor: alpha(theme.palette.primary.main, 0.08) }),
      }}
    >
      <Typography
        variant="body2"
        sx={{
          lineHeight: 1.7,
          letterSpacing: '0.3px',
          flex: 1,
          // clamp is visual only — screen readers always get the full quote
          ...(isClamped && {
            display: '-webkit-box',
            WebkitLineClamp: clampLines,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }),
        }}
      >
        {`"${isClamped ? previewText : recommendation.text}"`}
      </Typography>
      <Button
        variant="text"
        size="small"
        aria-expanded={!isClamped}
        startIcon={isClamped ? <ExpandMoreIcon /> : <ExpandLessIcon />}
        onClick={() => setUserExpanded(isClamped)}
      >
        {isClamped ? 'Show recommendation' : 'Hide recommendation'}
      </Button>
      <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mt: 0.75 }}>
        <Avatar
          sx={{
            width: 18,
            height: 18,
            fontSize: '0.5rem',
            bgcolor: lighten(theme.palette.primary.main, 0.4),
            color: theme.palette.primary.contrastText,
          }}
        >
          {recommendation.authorInitials}
        </Avatar>
        <RecommendationByline recommendation={recommendation} />
      </Stack>
    </Box>
  );
};
