import Timeline from '@mui/lab/Timeline';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import { timelineOppositeContentClasses } from '@mui/lab/TimelineOppositeContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { Suspense, use, useMemo } from 'react';

import { Section } from '../../components/section';
import { ResumeDataContext } from '../../context/resumeData';

import { WorkExperienceCard } from './components/workExperienceCard';
import { WorkExperienceTimelineSkeleton } from './components/workExperienceTimelineSkeleton';
import { pickRandomRoleIcon } from './roleIcons';

function ExperienceList() {
  // First use() reads the context value (the promise); the guard turns a missing
  // provider into a clear error; the second use() unwraps the promise, suspending
  // this component until the data resolves so <Suspense> can show the fallback.
  const experiencesPromise = use(ResumeDataContext);
  if (experiencesPromise === null) {
    throw new Error('ResumeDataContext was used without a ResumeDataProvider');
  }
  const experiences = use(experiencesPromise);

  // Pick a random icon per role once so it stays stable across re-renders.
  const roleIcons = useMemo(() => experiences.map(() => pickRandomRoleIcon()), [experiences]);

  return (
    <Timeline
      sx={{
        // Full-width cards (no horizontal margin/padding, no opposite-content column),
        // with extra top spacing between the "Work Experience" heading and the timeline.
        mt: 3,
        mb: 0,
        mx: 0,
        p: 0,
        // MUI lab v9 adds a flex:1 `::before` spacer to every item that has no opposite
        // content, which pushes the cards to half width. Mirror that exact selector so we
        // win on specificity, and collapse the spacer to make the cards full width.
        [`& .${timelineItemClasses.root}:not(:has(.${timelineOppositeContentClasses.root}))::before`]:
          { flex: 0, p: 0 },
      }}
    >
      {experiences.map((experience, index) => {
        const RoleIcon = roleIcons[index];
        return (
          <TimelineItem key={experience.id}>
            <TimelineSeparator>
              <TimelineDot color="primary">
                <RoleIcon fontSize="small" />
              </TimelineDot>
              {index < experiences.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent sx={{ pr: 0 }}>
              <WorkExperienceCard experience={experience} />
            </TimelineContent>
          </TimelineItem>
        );
      })}
    </Timeline>
  );
}

export function Resume() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" sx={{ mb: 3 }}>
        Mariandi Stylianou
      </Typography>
      <Section title="Work Experience">
        <Suspense fallback={<WorkExperienceTimelineSkeleton />}>
          <ExperienceList />
        </Suspense>
      </Section>
    </Container>
  );
}
