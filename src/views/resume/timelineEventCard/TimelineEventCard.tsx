import { memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';

import { BulletList } from '@/components/bulletList';
import { Section } from '@/components/section';
import { TagList } from '@/components/tagList';
import type { TimelineEventWithRecommendations } from '@/types';

import { getCardMotionSx } from './TimelineEventCard.helpers';
import { RecommendationText } from './recommendationText';
import { useInView } from './useInView';

export interface TimelineEventCardProps {
  experience: TimelineEventWithRecommendations;
}

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const formatMonthYear = (isoDate: string): string => {
  const [year, month] = isoDate.split('-');
  return `${MONTH_NAMES[Number(month) - 1]} ${year}`;
};

const formatDuration = (startDate: string, endDate: string | null): string => {
  const end = endDate === null ? 'Present' : formatMonthYear(endDate);
  return `${formatMonthYear(startDate)} – ${end}`;
};

export const TimelineEventCard = memo(({ experience }: TimelineEventCardProps) => {
  const navigate = useNavigate();
  const duration = formatDuration(experience.startDate, experience.endDate);
  const theme = useTheme();
  // Mobile cards run nearly the full viewport height, so the default threshold would need a
  // long scroll before triggering; a lower threshold starts the fade as soon as the card peeks in.
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { ref, isInView } = useInView<HTMLDivElement>({ threshold: isMobile ? 0.05 : 0.15 });
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const handleSkillClick = useCallback(
    (skill: string) => {
      void navigate(`/skills?skill=${encodeURIComponent(skill)}`);
    },
    [navigate]
  );

  return (
    <Card ref={ref} elevation={0} sx={getCardMotionSx(isInView, prefersReducedMotion)}>
      <CardHeader
        title={experience.companyName}
        // Render the company name as a real h3 heading (visually sized h6) so it sits
        // correctly under the h2 "Work Experience" section in the heading hierarchy.
        slotProps={{
          title: { variant: 'h6', component: 'h3' },
          subheader: { variant: 'body2' },
        }}
        subheader={`${experience.title} · ${experience.location} · ${duration}`}
      />
      <CardContent>
        {experience.techStack.length > 0 && (
          <>
            <Section title="Tech Stack" titleLevel={4}>
              <Typography variant="body2" color="text.secondary">
                {experience.techStack.join(', ')}
              </Typography>
            </Section>
            <Divider sx={{ my: 2 }} />
          </>
        )}
        <Section title="Responsibilities" titleLevel={4}>
          {experience.responsibilities.length === 1 ? (
            <Typography variant="body2">{experience.responsibilities[0]}</Typography>
          ) : (
            <BulletList items={experience.responsibilities} />
          )}
        </Section>
        <Divider sx={{ my: 2 }} />
        <Section title="Key Skills" titleLevel={4}>
          <TagList items={experience.skills} onItemClick={handleSkillClick} />
        </Section>
        {experience.recommendations.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Section title="Recommendations" titleLevel={4}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns:
                    experience.recommendations.length > 1
                      ? { xs: '1fr', sm: 'repeat(2, 1fr)' }
                      : '1fr',
                  gap: 1.5,
                }}
              >
                {experience.recommendations.map((recommendation) => (
                  <RecommendationText key={recommendation.id} recommendation={recommendation} />
                ))}
              </Box>
            </Section>
          </>
        )}
      </CardContent>
    </Card>
  );
});

TimelineEventCard.displayName = 'TimelineEventCard';
