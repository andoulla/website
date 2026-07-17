import LinkedIn from '@mui/icons-material/LinkedIn';
import Typography from '@mui/material/Typography';

import type { Recommendation } from '@/types';
import { formatDate } from '@/utils/formatDate';

export interface RecommendationBylineProps {
  recommendation: Recommendation;
}

// Decorative icon only — the whole recommendation card is the LinkedIn link.
export const RecommendationByline = ({ recommendation }: RecommendationBylineProps) => (
  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
    {recommendation.authorInitials} · {recommendation.authorRole.jobTitle}
    <LinkedIn aria-hidden="true" fontSize="inherit" sx={{ verticalAlign: 'middle', ml: 0.5 }} />
    {' · '}
    {formatDate(recommendation.postedDate)}
  </Typography>
);
