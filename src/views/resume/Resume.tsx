import BusinessIcon from '@mui/icons-material/Business';
import CodeIcon from '@mui/icons-material/Code';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import TerminalIcon from '@mui/icons-material/Terminal';
import WorkIcon from '@mui/icons-material/Work';
import Timeline from '@mui/lab/Timeline';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { Suspense, use, useMemo } from 'react';

import { Section } from '../../components/section';
import { ResumeDataContext } from '../../context/resumeData';

import { WorkExperienceCard } from './components/workExperienceCard';
import { WorkExperienceTimelineSkeleton } from './components/workExperienceTimelineSkeleton';

const ROLE_ICONS = [BusinessIcon, CodeIcon, RocketLaunchIcon, TerminalIcon, WorkIcon];

function pickRandomRoleIcon() {
  return ROLE_ICONS[Math.floor(Math.random() * ROLE_ICONS.length)];
}

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
        // Remove the Timeline's own margin/padding and the empty opposite-content
        // column so the cards span the full width under the heading.
        m: 0,
        p: 0,
        [`& .${timelineItemClasses.root}:before`]: { flex: 0, p: 0 },
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
