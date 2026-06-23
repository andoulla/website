import Timeline from '@mui/lab/Timeline';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

const SKELETON_ITEM_COUNT = 3;

function WorkExperienceCardSkeleton() {
  return (
    <Card>
      <CardHeader title={<Skeleton width="40%" />} subheader={<Skeleton width="60%" />} />
      <CardContent>
        <Stack spacing={1}>
          <Skeleton />
          <Skeleton />
          <Skeleton width="80%" />
        </Stack>
      </CardContent>
    </Card>
  );
}

export function WorkExperienceTimelineSkeleton() {
  return (
    <Timeline
      role="status"
      aria-label="Loading work experience"
      // Drop the empty opposite-content column so the cards align left (matches the
      // loaded timeline layout).
      sx={{ [`& .${timelineItemClasses.root}:before`]: { flex: 0, p: 0 } }}
    >
      {Array.from({ length: SKELETON_ITEM_COUNT }, (_, index) => (
        <TimelineItem key={index}>
          <TimelineSeparator>
            <TimelineDot color="primary" />
            {index < SKELETON_ITEM_COUNT - 1 && <TimelineConnector />}
          </TimelineSeparator>
          <TimelineContent>
            <WorkExperienceCardSkeleton />
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
}
