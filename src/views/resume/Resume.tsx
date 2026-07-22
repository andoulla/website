import Timeline from '@mui/lab/Timeline';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import { timelineOppositeContentClasses } from '@mui/lab/TimelineOppositeContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { PageContainer } from '@/components/pageContainer';
import { Section } from '@/components/section';
import { useCareerDataContext } from '@/context/careerData';
import { useTrackContext } from '@/context/track';
import { tracks } from '@/data/tracks';
import type { TrackId } from '@/types';
import { deriveOverlapCaption } from '@/utils/deriveOverlapCaption';
import { filterEventsByTrack } from '@/utils/filterEventsByTrack';
import { matchSkill } from '@/utils/matchSkill';

import { ContactDetails } from './contactDetails';
import { FOCUS_PARAM, RECOMMENDATION_PARAM, SKILL_PARAM } from './Resume.constants';
import { findMostRecentSkillMatchIndex } from './Resume.helpers';
import { TimelineEventCard } from './timelineEventCard';
import { TimelineEventSkeleton } from './timelineEventSkeleton';
import { LABEL_BY_TYPE, RoleIcon } from './roleIcons';

const CareerTimeline = () => {
  const careerHistory = useCareerDataContext();
  const { track } = useTrackContext();
  const [searchParams] = useSearchParams();
  const rawHighlightedSkill = searchParams.get(SKILL_PARAM) ?? undefined;
  const highlightedRecommendationId = searchParams.get(RECOMMENDATION_PARAM) ?? undefined;
  const focusEventId = searchParams.get(FOCUS_PARAM) ?? undefined;

  // Synonyms resolve to the canonical skill id; unresolved terms no-op.
  const highlightedSkillId = useMemo(
    () =>
      rawHighlightedSkill === undefined ? undefined : matchSkill(rawHighlightedSkill)?.skill.id,
    [rawHighlightedSkill]
  );

  const visibleHistory = useMemo(
    () => filterEventsByTrack(careerHistory, track),
    [careerHistory, track]
  );

  // Overlap caption for internships.
  const overlapCaptionByEventId = useMemo(
    () =>
      Object.fromEntries(
        visibleHistory.map((event) => [event.id, deriveOverlapCaption(event, visibleHistory)])
      ),
    [visibleHistory]
  );

  // A recommendation id pins to exactly one job, so it takes priority over the skill match.
  const matchIndex = useMemo(() => {
    if (highlightedRecommendationId !== undefined) {
      return visibleHistory.findIndex((event) =>
        event.recommendations.some(
          (recommendation) => recommendation.id === highlightedRecommendationId
        )
      );
    }
    // Explicit focus wins over most-recent; a bare ?skill= still falls through below.
    if (focusEventId !== undefined) {
      return visibleHistory.findIndex((event) => event.id === focusEventId);
    }
    if (highlightedSkillId !== undefined) {
      // A skill can span multiple jobs — scroll to the most recent, not just the first match.
      return findMostRecentSkillMatchIndex(visibleHistory, highlightedSkillId);
    }
    return -1;
  }, [visibleHistory, highlightedSkillId, highlightedRecommendationId, focusEventId]);

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
      {visibleHistory.map((event, index) => (
        <TimelineItem key={event.id}>
          <TimelineSeparator>
            <Tooltip title={LABEL_BY_TYPE[event.type]}>
              {/* role="img" — the tooltip stamps its title as aria-label, prohibited on a bare span */}
              <TimelineDot
                role="img"
                color="primary"
                variant={event.type === 'internship' ? 'outlined' : 'filled'}
              >
                <RoleIcon event={event} />
              </TimelineDot>
            </Tooltip>
            {index < visibleHistory.length - 1 && <TimelineConnector />}
          </TimelineSeparator>
          <TimelineContent sx={{ pr: 0 }}>
            <TimelineEventCard
              event={event}
              track={track}
              highlightedSkillId={highlightedSkillId}
              highlightedRecommendationId={highlightedRecommendationId}
              highlightedEventId={focusEventId}
              autoScrollToHighlight={index === matchIndex}
              startInView={index === 0}
              overlapCaption={overlapCaptionByEventId[event.id]}
              startExpanded={index === 0}
            />
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
};

export const Resume = () => {
  const { trackId, setTrackId } = useTrackContext();

  return (
    <PageContainer>
      <title>Mariandi Stylianou — Resume</title>
      <Box sx={{ mb: 5, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" sx={{ mb: 0, pb: 0.5 }}>
          Mariandi Stylianou
        </Typography>
        <ContactDetails />
      </Box>
      <Tabs
        value={trackId}
        onChange={(_event, next: TrackId) => {
          setTrackId(next);
        }}
        aria-label="Resume track"
        variant="scrollable"
        allowScrollButtonsMobile
        // Full-width divider under the tab bar separates it from the panel content.
        sx={{
          mb: 3,
          borderBottom: 1,
          borderColor: 'divider',
          '& .MuiTabs-flexContainer': { justifyContent: { sm: 'center' } },
        }}
      >
        {tracks.map((track) => (
          <Tab
            key={track.id}
            value={track.id}
            label={track.label}
            id={`track-tab-${track.id}`}
            aria-controls={`track-panel-${track.id}`}
          />
        ))}
      </Tabs>
      <Box role="tabpanel" id={`track-panel-${trackId}`} aria-labelledby={`track-tab-${trackId}`}>
        <Section title="Work Experience">
          <Suspense fallback={<TimelineEventSkeleton />}>
            <CareerTimeline />
          </Suspense>
        </Section>
      </Box>
    </PageContainer>
  );
};
