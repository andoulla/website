import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Popover from '@mui/material/Popover';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';

import { TRACK_PARAM, useTrackContext } from '@/context/track';
import { getRecommendationsByIds } from '@/utils/getRecommendationsByIds';

interface Props {
  recommendationIds: string[];
}

export const RecommendationBadge = ({ recommendationIds }: Props) => {
  const { trackId } = useTrackContext();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const count = recommendationIds.length;
  const recommendations = getRecommendationsByIds(recommendationIds);

  if (count === 0) return null;

  const label = `${count} recommendation${count === 1 ? '' : 's'}`;

  return (
    <>
      {/* Padding widens the tap target to ≥44×44 without resizing the icon glyph. */}
      <Tooltip title={label}>
        <IconButton
          size="small"
          aria-label={label}
          onClick={(event) => {
            setAnchorEl(event.currentTarget);
          }}
          sx={{ p: 1.5 }}
        >
          <Badge badgeContent={count} color="primary">
            <FormatQuoteIcon fontSize="small" />
          </Badge>
        </IconButton>
      </Tooltip>
      <Popover
        open={anchorEl !== null}
        anchorEl={anchorEl}
        onClose={() => {
          setAnchorEl(null);
        }}
      >
        <Box sx={{ p: 2, maxWidth: 360 }}>
          {recommendations.map((rec) => (
            <Box key={rec.id} sx={{ mb: 2, '&:last-child': { mb: 0 } }}>
              <Typography variant="subtitle2">
                {rec.authorInitials} — {rec.authorRole.jobTitle}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, mb: 0.5 }}>
                {rec.text.length > 120 ? `${rec.text.slice(0, 120)}…` : rec.text}
              </Typography>
              <Link
                component={RouterLink}
                to={`/?recommendation=${encodeURIComponent(rec.id)}&${TRACK_PARAM}=${trackId}`}
                variant="body2"
                onClick={() => {
                  setAnchorEl(null);
                }}
              >
                View on Resume
              </Link>
            </Box>
          ))}
        </Box>
      </Popover>
    </>
  );
};
