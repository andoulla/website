import Timeline from '@mui/lab/Timeline';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import { timelineOppositeContentClasses } from '@mui/lab/TimelineOppositeContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { PageContainer } from '@/components/pageContainer';
import { Section } from '@/components/section';
import { useCareerHistory } from '@/context/resumeData';

import { ContactDetails } from './contactDetails';
import { TimelineEventCard } from './timelineEventCard';
import { TimelineEventSkeleton } from './timelineEventSkeleton';
import { pickRandomRoleIcon, RoleIcon } from './roleIcons';

const CareerTimeline = () => {
  const careerHistory = useCareerHistory();
  const [searchParams] = useSearchParams();
  const highlightedSkill = searchParams.get('skill') ?? undefined;
  const highlightedRecommendationId = searchParams.get('recommendation') ?? undefined;

  // Pick a random icon per role once so it stays stable across re-renders.
  const roleIcons = useMemo(() => careerHistory.map(() => pickRandomRoleIcon()), [careerHistory]);

  // A recommendation id pins to exactly one job, so it takes priority over the skill match.
  const firstMatchIndex = useMemo(() => {
    if (highlightedRecommendationId !== undefined) {
      return careerHistory.findIndex((event) =>
        event.recommendations.some(
          (recommendation) => recommendation.id === highlightedRecommendationId
        )
      );
    }
    if (highlightedSkill !== undefined) {
      return careerHistory.findIndex((event) => event.skills.includes(highlightedSkill));
    }
    return -1;
  }, [careerHistory, highlightedSkill, highlightedRecommendationId]);

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
      {careerHistory.map((event, index) => {
        const FallbackIcon = roleIcons[index];
        return (
          <TimelineItem key={event.id}>
            <TimelineSeparator>
              <TimelineDot color="primary">
                <RoleIcon event={event} fallbackIcon={FallbackIcon} />
              </TimelineDot>
              {index < careerHistory.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent sx={{ pr: 0 }}>
              <TimelineEventCard
                event={event}
                highlightedSkill={highlightedSkill}
                highlightedRecommendationId={highlightedRecommendationId}
                autoScrollToHighlight={index === firstMatchIndex}
                startInView={index === 0}
              />
            </TimelineContent>
          </TimelineItem>
        );
      })}
    </Timeline>
  );
};

export const Resume = () => {
  return (
    <PageContainer>
      <Box sx={{ mb: 5, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" sx={{ mb: 0, pb: 0.5 }}>
          Mariandi Stylianou
        </Typography>
        <ContactDetails />
      </Box>
      <Section title="Work Experience">
        <Suspense fallback={<TimelineEventSkeleton />}>
          <CareerTimeline />
        </Suspense>
      </Section>
    </PageContainer>
  );
};
