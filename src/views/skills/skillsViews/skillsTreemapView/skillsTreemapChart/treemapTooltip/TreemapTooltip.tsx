import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

type TreemapTooltipProps = {
  active?: boolean;
  payload?: Array<{ payload?: { name: string; size: number; subCategoryName?: string } }>;
};

export const TreemapTooltip = ({ active, payload }: TreemapTooltipProps) => {
  if (active !== true || payload === undefined || payload.length === 0) return null;

  const data = payload[0]?.payload;

  if (data === undefined) return null;

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        px: 1.5,
        py: 1,
        boxShadow: 2,
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {data.name}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mt: 0.25 }}>
        {data.subCategoryName !== undefined && (
          <Typography variant="caption" color="text.secondary">
            {data.subCategoryName}
          </Typography>
        )}
        <Typography variant="caption">{data.size.toFixed(1)} years</Typography>
      </Box>
    </Box>
  );
};
