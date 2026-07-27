import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
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

  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
      <FormatQuoteIcon fontSize="small" color="action" />
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Stack>
  );
};
