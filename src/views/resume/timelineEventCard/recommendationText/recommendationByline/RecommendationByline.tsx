import LinkedIn from '@mui/icons-material/LinkedIn';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { Recommendation } from '@/types';
import { formatDate } from '@/utils/formatDate';

export interface RecommendationBylineProps {
  recommendation: Recommendation;
}

// the byline is the LinkedIn link-out; the icon is decorative
export const RecommendationByline = ({ recommendation }: RecommendationBylineProps) => (
  <Link
    color="text.secondary"
    underline="hover"
    href={recommendation.recommendationUrl}
    target="_blank"
    rel="noopener noreferrer"
    sx={{ display: 'flex' }}
  >
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', width: '100%' }}>
      <Typography variant="caption" sx={{ color: 'inherit' }}>
        {recommendation.authorInitials}
      </Typography>
      <Typography variant="caption" sx={{ color: 'inherit' }}>
        ·
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
        <Typography variant="body2" component="span" sx={{ fontWeight: 600, color: 'inherit' }}>
          {recommendation.authorRole.jobTitle}
        </Typography>
        <LinkedIn aria-hidden="true" fontSize="small" sx={{ fontSize: '1rem' }} />
      </Box>
      <Typography variant="caption" sx={{ color: 'inherit' }}>
        ·
      </Typography>
      <Typography variant="caption" sx={{ color: 'inherit' }}>
        {formatDate(recommendation.postedDate)}
      </Typography>
    </Stack>
  </Link>
);
