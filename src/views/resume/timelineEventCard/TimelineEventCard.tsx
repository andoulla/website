import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import { alpha, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';

import { BulletList } from '@/components/bulletList';
import { Section } from '@/components/section';
import { TagList } from '@/components/tagList';
import type { TimelineEventWithRecommendations } from '@/types';
import { CATEGORY_LABELS } from '@/utils/skillCategory';
import { skillColour, skillShadeIndex } from '@/utils/skillColour';

import {
  getCardMotionSx,
  groupSkillsByCategory,
  recommendationElementId,
} from './TimelineEventCard.helpers';
import { RecommendationText } from './recommendationText';
import { useInView } from './useInView';

export interface TimelineEventCardProps {
  experience: TimelineEventWithRecommendations;
  highlightedSkill?: string;
  highlightedRecommendationId?: string;
  autoScrollToHighlight?: boolean;
  // The first card is already visible on landing, so it should render in without waiting on the
  // IntersectionObserver's first callback — only cards below the fold need the scroll-triggered fade.
  startInView?: boolean;
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

export const TimelineEventCard = ({
  experience,
  highlightedSkill,
  highlightedRecommendationId,
  autoScrollToHighlight,
  startInView,
}: TimelineEventCardProps) => {
  const navigate = useNavigate();
  const duration = formatDuration(experience.startDate, experience.endDate);
  const theme = useTheme();
  // Mobile cards run nearly the full viewport height, so the default threshold would need a
  // long scroll before triggering; a lower threshold starts the fade as soon as the card peeks in.
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { ref, isInView } = useInView<HTMLDivElement>({
    threshold: isMobile ? 0.05 : 0.15,
    initialInView: startInView,
  });
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const hasHighlightedRecommendation =
    highlightedRecommendationId !== undefined &&
    experience.recommendations.some(
      (recommendation) => recommendation.id === highlightedRecommendationId
    );
  const isMatch =
    (highlightedSkill !== undefined && experience.skills.includes(highlightedSkill)) ||
    hasHighlightedRecommendation;

  const cardNodeRef = useRef<HTMLDivElement | null>(null);
  const setCardNode = useCallback(
    (node: HTMLDivElement | null): (() => void) | void => {
      const cleanup = ref(node);
      cardNodeRef.current = node;
      return cleanup;
    },
    [ref]
  );

  useEffect(() => {
    if (autoScrollToHighlight !== true) return;
    if (highlightedRecommendationId !== undefined) {
      const recommendationNode = document.getElementById(
        recommendationElementId(highlightedRecommendationId)
      );
      recommendationNode?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    cardNodeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [autoScrollToHighlight, highlightedRecommendationId]);

  const handleSkillClick = useCallback(
    (skill: string) => {
      void navigate(`/skills?skill=${encodeURIComponent(skill)}`);
    },
    [navigate]
  );

  const handleViewAllSkillsClick = useCallback(() => {
    void navigate(`/skills?skill=${experience.skills.map(encodeURIComponent).join(',')}`);
  }, [navigate, experience.skills]);

  const skillGroups = useMemo(() => groupSkillsByCategory(experience.skills), [experience.skills]);

  return (
    <Card
      ref={setCardNode}
      elevation={0}
      sx={[
        getCardMotionSx(isInView, prefersReducedMotion),
        isMatch && {
          outline: (cardTheme) => `2px solid ${cardTheme.palette.primary.main}`,
          outlineOffset: 2,
        },
      ]}
    >
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {skillGroups.map((group) => (
              <Box
                key={group.category}
                sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}
              >
                <Typography
                  variant="caption"
                  component="span"
                  sx={{
                    fontWeight: 'medium',
                    flexShrink: 0,
                    color: (cardTheme) => alpha(cardTheme.palette.text.secondary, 0.7),
                  }}
                >
                  {`${CATEGORY_LABELS[group.category]}:`}
                </Typography>
                <TagList
                  items={group.skills}
                  onItemClick={handleSkillClick}
                  getColour={skillColour}
                  getShadeIndex={skillShadeIndex}
                />
              </Box>
            ))}
          </Box>
          {experience.skills.length > 0 && (
            <Button size="small" onClick={handleViewAllSkillsClick} sx={{ mt: 1.5 }}>
              {"View this role's skills on the graph"}
            </Button>
          )}
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
                  <RecommendationText
                    key={recommendation.id}
                    recommendation={recommendation}
                    isHighlighted={recommendation.id === highlightedRecommendationId}
                  />
                ))}
              </Box>
            </Section>
          </>
        )}
      </CardContent>
    </Card>
  );
};
