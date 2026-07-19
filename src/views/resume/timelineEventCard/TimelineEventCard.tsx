import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import { alpha, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';

import { BulletList } from '@/components/bulletList';
import { Section } from '@/components/section';
import { TRACK_PARAM } from '@/context/track';
import type { TimelineEventWithRecommendations, Track } from '@/types';
import { MONTH_NAMES } from '@/utils/formatDate';
import { categoryColourFromIndex, resolveSkillColourMain } from '@/utils/skillColour';
import { CATEGORY_PARAM, SKILL_PARAM, VIEW_PARAM } from '@/utils/skillsUrlParams';

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
  track: Track;
  // Canonical skill id — the resume view resolves raw ?skill= terms through matchSkill.
  highlightedSkillId?: string;
  highlightedRecommendationId?: string;
  autoScrollToHighlight?: boolean;
  // The first card is already visible on landing, so it should render in without waiting on the
  // IntersectionObserver's first callback — only cards below the fold need the scroll-triggered fade.
  startInView?: boolean;
  // For internships: auto-derived caption naming concurrent events (e.g. "Alongside X").
  overlapCaption?: string;
  // the first card starts expanded on load
  startExpanded?: boolean;
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
  track,
  highlightedSkillId,
  highlightedRecommendationId,
  autoScrollToHighlight,
  startInView,
  overlapCaption,
  startExpanded = false,
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
    disabled: startInView,
  });
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const hasHighlightedRecommendation =
    highlightedRecommendationId !== undefined &&
    event.recommendations.some(
      (recommendation) => recommendation.id === highlightedRecommendationId
    );
  const hasHighlightedSkill =
    highlightedSkillId !== undefined &&
    event.skills.some((skill) => skill.id === highlightedSkillId);
  const isMatch = hasHighlightedSkill || hasHighlightedRecommendation;

  // user toggle wins; otherwise deep-link matches and the first card render expanded
  const [userExpanded, setUserExpanded] = useState<boolean | null>(null);
  const isExpanded = userExpanded ?? (isMatch || startExpanded);

  // key skills sit behind a second expander; a skill deep link opens it
  const [userSkillsExpanded, setUserSkillsExpanded] = useState<boolean | null>(null);
  const areSkillsExpanded = userSkillsExpanded ?? hasHighlightedSkill;

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
    (skillName: string) => {
      void navigate(
        `/skills?${SKILL_PARAM}=${encodeURIComponent(skillName)}&${VIEW_PARAM}=barchart&${TRACK_PARAM}=${track.id}`
      );
    },
    [navigate, track.id]
  );

  const handleCategoryClick = useCallback(
    (categoryId: string) => {
      void navigate(
        `/skills?${CATEGORY_PARAM}=${encodeURIComponent(categoryId)}&${VIEW_PARAM}=barchart&${TRACK_PARAM}=${track.id}`
      );
    },
    [navigate, track.id]
  );

  const handleViewAllSkillsClick = useCallback(() => {
    // Repeated params, not comma-joined — a skill name could contain a comma.
    const params = new URLSearchParams();
    event.skills.forEach((skill) => params.append(SKILL_PARAM, skill.name));
    params.set(VIEW_PARAM, 'barchart');
    params.set(TRACK_PARAM, String(track.id));
    void navigate(`/skills?${params.toString()}`);
  }, [navigate, event.skills, track.id]);

  const skillGroups = useMemo(
    () => groupSkillsByCategory(event.skills, track),
    [event.skills, track]
  );

  const hasResponsibilities = event.responsibilities.length > 0;
  const hasTechStack = event.techStack.length > 0;
  const hasSkills = event.skills.length > 0;
  const hasRecommendations = event.recommendations.length > 0;
  // Nothing relevant to the active track — collapse to primary info only.
  const isBare = !hasResponsibilities && !hasTechStack && !hasSkills;
  // exception: a lone responsibility stays visible when collapsed
  const showsSingleResponsibility = event.responsibilities.length === 1;
  const hasCollapsibleContent = showsSingleResponsibility
    ? hasTechStack || hasSkills || hasRecommendations
    : true;

  const cardHeader = (
    <CardHeader
      title={event.companyName}
      // Real h3 (visually h6) — keeps the hierarchy under the h2 "Work Experience".
      slotProps={{
        title: { variant: 'h6', component: 'h3' },
        subheader: { variant: 'body2' },
      }}
      subheader={`${event.title} · ${event.location} · ${duration}${
        overlapCaption !== undefined ? ` · ${overlapCaption}` : ''
      }`}
    />
  );

  if (isBare) {
    return (
      <Card
        ref={setCardNode}
        elevation={0}
        sx={[getCardMotionSx(isInView, prefersReducedMotion), { py: 0.5 }]}
      >
        {cardHeader}
      </Card>
    );
  }

  const responsibilitiesSection = hasResponsibilities && (
    <Section title={RESPONSIBILITIES_LABEL_BY_TYPE[event.type]} titleLevel={4}>
      {event.responsibilities.length === 1 ? (
        <Typography
          variant="body2"
          sx={{
            lineHeight: 1.7,
            letterSpacing: '0.3px',
          }}
        >
          {event.responsibilities[0].text}
        </Typography>
      ) : (
        <BulletList items={event.responsibilities.map((responsibility) => responsibility.text)} />
      )}
    </Section>
  );

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
      {cardHeader}
      <CardContent>
        {showsSingleResponsibility && responsibilitiesSection}
        <Collapse in={isExpanded} unmountOnExit>
          {!showsSingleResponsibility && responsibilitiesSection}
          {hasTechStack && (
            <>
              {hasResponsibilities && <Divider sx={{ my: 2 }} />}
              <Section title="Tech Stack" titleLevel={4}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    lineHeight: 1.7,
                    letterSpacing: '0.3px',
                  }}
                >
                  {event.techStack.map((skill) => skill.name).join(', ')}
                </Typography>
              </Section>
            </>
          )}
          {hasSkills && (
            <>
              {(hasResponsibilities || hasTechStack) && <Divider sx={{ my: 2 }} />}
              <Button
                size="small"
                aria-expanded={areSkillsExpanded}
                startIcon={areSkillsExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                onClick={() => setUserSkillsExpanded(!areSkillsExpanded)}
              >
                {areSkillsExpanded ? 'Hide key skills' : 'Show key skills'}
              </Button>
              <Collapse in={areSkillsExpanded} unmountOnExit>
                <Section title="Key Skills" titleLevel={4}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {skillGroups.map((group) => {
                      const captionColour = resolveSkillColourMain(
                        categoryColourFromIndex(group.category.index),
                        theme
                      );
                      return (
                        <Box
                          key={group.category.id}
                          sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}
                        >
                          <Link
                            component="button"
                            type="button"
                            variant="caption"
                            underline="hover"
                            onClick={() => handleCategoryClick(group.category.id)}
                            sx={{
                              fontWeight: 'medium',
                              flexShrink: 0,
                              color: (cardTheme) => alpha(cardTheme.palette.text.secondary, 0.7),
                            }}
                          >
                            {`${group.category.name}:`}
                          </Link>
                          <Typography variant="caption" sx={{ lineHeight: 1.7 }}>
                            {group.skills.map((skill, index) => (
                              <Fragment key={skill.id}>
                                {index > 0 && ', '}
                                <Link
                                  component="button"
                                  type="button"
                                  variant="caption"
                                  underline="hover"
                                  onClick={() => handleSkillClick(skill.name)}
                                  sx={{ color: captionColour }}
                                >
                                  {skill.name}
                                </Link>
                              </Fragment>
                            ))}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                  <Button size="small" onClick={handleViewAllSkillsClick} sx={{ mt: 1.5 }}>
                    {"View this role's skills on the graph"}
                  </Button>
                </Section>
              </Collapse>
            </>
          )}
          {hasRecommendations && (
            <>
              <Divider sx={{ my: 2 }} />
              <Section title={`Recommendations (${event.recommendations.length})`} titleLevel={4}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns:
                      event.recommendations.length > 1
                        ? { xs: '1fr', sm: 'repeat(2, 1fr)' }
                        : '1fr',
                    gap: 1,
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
        </Collapse>
        {hasCollapsibleContent && (
          <Button
            size="small"
            aria-expanded={isExpanded}
            startIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={() => setUserExpanded(!isExpanded)}
            sx={{ mt: 1 }}
          >
            {isExpanded ? 'Hide details' : 'Show details'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
