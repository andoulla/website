import LinkedIn from '@mui/icons-material/LinkedIn';
import Link from '@mui/material/Link';

import type { Recommendation } from '@/types';
import { formatDate } from '@/utils/formatDate';

export interface RecommendationBylineProps {
  recommendation: Recommendation;
}

// the byline is the LinkedIn link-out; the icon is decorative
export const RecommendationByline = ({ recommendation }: RecommendationBylineProps) => (
  <Link
    variant="caption"
    color="text.secondary"
    underline="hover"
    href={recommendation.recommendationUrl}
    target="_blank"
    rel="noopener noreferrer"
    sx={{ display: 'block' }}
  >
    {recommendation.authorInitials} · {recommendation.authorRole.jobTitle}
    <LinkedIn aria-hidden="true" fontSize="inherit" sx={{ verticalAlign: 'middle', ml: 0.5 }} />
    {' · '}
    {formatDate(recommendation.postedDate)}
  </Link>
);
