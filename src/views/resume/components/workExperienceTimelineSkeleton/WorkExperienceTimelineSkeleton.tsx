import Timeline from '@mui/lab/Timeline';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import { timelineOppositeContentClasses } from '@mui/lab/TimelineOppositeContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

const SKELETON_ITEM_COUNT = 3;
// TODO: rename this to something beter than experience, Job, Role, position or a combination of those. Maybe WorkExperience or WorkExperienceItem.

const WorkExperienceCardSkeleton = () => {
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
};

export const WorkExperienceTimelineSkeleton = () => {
  return (
    <div role="status" aria-label="Loading work experience">
      <Timeline
        // Match the loaded timeline: full-width cards, no opposite-content column,
        // and the same top spacing below the heading.
        sx={{
          mt: 3,
          mb: 0,
          mx: 0,
          p: 0,
          [`& .${timelineItemClasses.root}:not(:has(.${timelineOppositeContentClasses.root}))::before`]:
            { flex: 0, p: 0 },
        }}
      >
        {Array.from({ length: SKELETON_ITEM_COUNT }, (_, index) => (
          <TimelineItem key={index}>
            <TimelineSeparator>
              <TimelineDot color="primary" />
              {index < SKELETON_ITEM_COUNT - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent sx={{ pr: 0 }}>
              <WorkExperienceCardSkeleton />
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </div>
  );
};
