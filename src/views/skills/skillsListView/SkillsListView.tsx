import { useCallback, useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { Section } from '@/components/section';
import { SkillTooltipContent } from '@/components/skillTooltipContent';
import type { Recommendation } from '@/types';
import type { SkillSummary } from '@/utils/calculateSkillYears';
import type { SkillCategory } from '@/utils/skillColour';
import { skillShadeIndex } from '@/utils/skillColour';
import { computeShadeColour } from '@/utils/computeShadeColour';

interface SkillsListViewProps {
  skills: SkillSummary[];
  recommendations: Recommendation[];
  highlightedSkill?: string;
}

const CATEGORY_LABELS: Record<SkillCategory, string> = {
  engineering: 'Engineering',
  managerial: 'Managerial',
  'soft-skills': 'Soft Skills',
  other: 'Other',
};

const CATEGORY_ORDER: SkillCategory[] = ['engineering', 'managerial', 'soft-skills', 'other'];

interface PopoverState {
  anchor: HTMLElement;
  skill: SkillSummary;
}

const skillElementId = (name: string) => `skill-${encodeURIComponent(name)}`;

export const SkillsListView = ({
  skills,
  recommendations,
  highlightedSkill,
}: SkillsListViewProps) => {
  const theme = useTheme();
  const [popover, setPopover] = useState<PopoverState | null>(null);

  useEffect(() => {
    if (highlightedSkill === undefined) return;
    const el = document.getElementById(skillElementId(highlightedSkill));
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlightedSkill]);

  const byCategory = useMemo(
    () =>
      CATEGORY_ORDER.reduce<Record<SkillCategory, SkillSummary[]>>(
        (acc, cat) => {
          acc[cat] = skills.filter((s) => s.category === cat);
          return acc;
        },
        { engineering: [], managerial: [], 'soft-skills': [], other: [] }
      ),
    [skills]
  );

  const linkedRecs = useMemo(
    () =>
      popover !== null
        ? recommendations.filter((r) => popover.skill.recommendationIds.includes(r.id))
        : [],
    [popover, recommendations]
  );

  const dotColour = useCallback(
    (skill: SkillSummary): string => {
      const { colour } = skill;
      if (colour === 'default') return theme.palette.grey[400];
      const paletteEntry = theme.palette[colour as keyof typeof theme.palette];
      if (paletteEntry === null || typeof paletteEntry !== 'object' || !('main' in paletteEntry)) {
        return theme.palette.grey[400];
      }
      const { bg } = computeShadeColour(
        (paletteEntry as { main: string }).main,
        skillShadeIndex(skill.skill),
        theme.palette.getContrastText
      );
      return bg;
    },
    [theme]
  );

  return (
    <>
      <Stack spacing={2}>
        {CATEGORY_ORDER.filter((cat) => byCategory[cat].length > 0).map((cat) => (
          <Section key={cat} title={CATEGORY_LABELS[cat]}>
            <List disablePadding dense>
              {byCategory[cat].map((s) => {
                const isHighlighted = s.skill === highlightedSkill;
                return (
                  <ListItem key={s.skill} disablePadding>
                    <Tooltip
                      title={<SkillTooltipContent skill={s} />}
                      slotProps={{
                        tooltip: { sx: { bgcolor: 'transparent', p: 0, maxWidth: 'none' } },
                      }}
                    >
                      <ListItemButton
                        id={skillElementId(s.skill)}
                        onClick={(e) => {
                          setPopover({ anchor: e.currentTarget, skill: s });
                        }}
                        sx={{
                          borderRadius: 1,
                          transition: 'background-color 0.4s ease',
                          ...(isHighlighted && {
                            bgcolor: alpha(theme.palette.primary.main, 0.12),
                          }),
                        }}
                      >
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: dotColour(s),
                            flexShrink: 0,
                            mr: 1.5,
                          }}
                        />
                        <ListItemText primary={s.skill} />
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          {`est. ${s.years} year${s.years === 1 ? '' : 's'}`}
                        </Typography>
                      </ListItemButton>
                    </Tooltip>
                  </ListItem>
                );
              })}
            </List>
          </Section>
        ))}
      </Stack>

      <Popover
        open={popover !== null}
        anchorEl={popover?.anchor ?? null}
        onClose={() => {
          setPopover(null);
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, maxWidth: 360 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {popover?.skill.skill}
          </Typography>
          {linkedRecs.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No recommendations yet.
            </Typography>
          ) : (
            <Stack spacing={1.5} divider={<Divider />}>
              {linkedRecs.map((rec) => (
                <Box key={rec.id}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {rec.authorInitials} · {rec.authorRole.jobTitle}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {rec.text}
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      </Popover>
    </>
  );
};
