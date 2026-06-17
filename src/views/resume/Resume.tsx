import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Section } from '../../components/section';
import { jobs } from '../../data/jobs';
import { references } from '../../data/references';
import { joinJobsWithReferences } from '../../utils/joinJobsWithReferences';

import { WorkExperienceCard } from './components/workExperienceCard';

const experiences = joinJobsWithReferences(jobs, references);

export function Resume() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h1" component="h1" sx={{ mb: 3 }}>
        Mariandi Stylianou
      </Typography>
      <Section title="Work Experience">
        <Stack spacing={3}>
          {experiences.map((experience) => (
            <WorkExperienceCard key={experience.id} experience={experience} />
          ))}
        </Stack>
      </Section>
    </Container>
  );
}
