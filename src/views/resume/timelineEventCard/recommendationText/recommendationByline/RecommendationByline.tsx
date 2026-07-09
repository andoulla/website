import LinkedIn from '@mui/icons-material/LinkedIn';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

import type { Recommendation } from '@/types';
import { formatDate } from '@/utils/formatDate';

export interface RecommendationBylineProps {
  recommendation: Recommendation;
}

export const RecommendationByline = ({ recommendation }: RecommendationBylineProps) => (
  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
    {recommendation.authorInitials} · {recommendation.authorRole.jobTitle}
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
);
