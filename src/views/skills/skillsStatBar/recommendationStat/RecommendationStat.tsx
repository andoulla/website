import Chip from '@mui/material/Chip';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';

interface Props {
  count: number;
}

export const RecommendationStat = ({ count }: Props) => {
  if (count === 0) return null;

  const label =
    count === 1
      ? '1 skill backed by a recommendation'
      : `${count} skills backed by recommendations`;

  return <Chip icon={<FormatQuoteIcon />} label={label} size="small" variant="outlined" />;
};
