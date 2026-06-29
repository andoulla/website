import SearchOff from '@mui/icons-material/SearchOff';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export function Skills() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" sx={{ mb: 3 }}>
        Skills
      </Typography>
      <Stack spacing={2} sx={{ py: 6, color: 'text.secondary', alignItems: 'center' }}>
        <SearchOff fontSize="large" />
        <Typography variant="body1">No skills added yet.</Typography>
      </Stack>
    </Container>
  );
}
