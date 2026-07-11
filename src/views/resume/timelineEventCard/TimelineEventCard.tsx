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
import { MONTH_NAMES } from '@/utils/formatDate';
import { CATEGORY_LABELS } from '@/utils/skillCategory';
import { skillColour, skillShadeIndex } from '@/utils/skillColour';

import { RESPONSIBILITIES_LABEL_BY_TYPE } from './TimelineEventCard.constants';
import {
  getCardMotionSx,
  groupSkillsByCategory,
  recommendationElementId,
} from './TimelineEventCard.helpers';
import { RecommendationText } from './recommendationText';
import { useInView } from './useInView';

export interface TimelineEventCardProps {
  event: TimelineEventWithRecommendations;
  highlightedSkill?: string;
  highlightedRecommendationId?: string;
  autoScrollToHighlight?: boolean;
  // The first card is already visible on landing, so it should render in without waiting on the
  // IntersectionObserver's first callback — only cards below the fold need the scroll-triggered fade.
  startInView?: boolean;
}

const formatMonthYear = (isoDate: string): string => {
  const [year, month] = isoDate.split('-');
  return `${MONTH_NAMES[Number(month) - 1]} ${year}`;
};

const formatDuration = (startDate: string, endDate: string | null): string => {
  const end = endDate === null ? 'Present' : formatMonthYear(endDate);
  return `${formatMonthYear(startDate)} – ${end}`;
};

export const TimelineEventCard = ({
  event,
  highlightedSkill,
  highlightedRecommendationId,
  autoScrollToHighlight,
  startInView,
}: TimelineEventCardProps) => {
  const navigate = useNavigate();
  const duration = formatDuration(event.startDate, event.endDate);
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
    event.recommendations.some(
      (recommendation) => recommendation.id === highlightedRecommendationId
    );
  const isMatch =
    (highlightedSkill !== undefined && event.skills.includes(highlightedSkill)) ||
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
    // Repeated params, not comma-joined — a skill name could contain a comma.
    const params = new URLSearchParams();
    event.skills.forEach((skill) => params.append('skill', skill));
    void navigate(`/skills?${params.toString()}`);
  }, [navigate, event.skills]);

  const skillGroups = useMemo(() => groupSkillsByCategory(event.skills), [event.skills]);

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
        title={event.companyName}
        // Render the company name as a real h3 heading (visually sized h6) so it sits
        // correctly under the h2 "Work Experience" section in the heading hierarchy.
        slotProps={{
          title: { variant: 'h6', component: 'h3' },
          subheader: { variant: 'body2' },
        }}
        subheader={`${event.title} · ${event.location} · ${duration}`}
      />
      <CardContent>
        {event.techStack.length > 0 && (
          <>
            <Section title="Tech Stack" titleLevel={4}>
              <Typography variant="body2" color="text.secondary">
                {event.techStack.join(', ')}
              </Typography>
            </Section>
            <Divider sx={{ my: 2 }} />
          </>
        )}
        <Section title={RESPONSIBILITIES_LABEL_BY_TYPE[event.type]} titleLevel={4}>
          {event.responsibilities.length === 1 ? (
            <Typography variant="body2">{event.responsibilities[0]}</Typography>
          ) : (
            <BulletList items={event.responsibilities} />
          )}
        </Section>
        {event.skills.length > 0 && (
          <>
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
              <Button size="small" onClick={handleViewAllSkillsClick} sx={{ mt: 1.5 }}>
                {"View this role's skills on the graph"}
              </Button>
            </Section>
          </>
        )}
        {event.recommendations.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Section title={`Recommendations (${event.recommendations.length})`} titleLevel={4}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns:
                    event.recommendations.length > 1 ? { xs: '1fr', sm: 'repeat(2, 1fr)' } : '1fr',
                  gap: 1.5,
                }}
              >
                {event.recommendations.map((recommendation) => (
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
