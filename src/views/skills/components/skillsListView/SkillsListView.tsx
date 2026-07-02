import { useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

import { Section } from '../../../../components/section';
import type { Recommendation } from '../../../../types';
import type { SkillSummary } from '../../../../utils/calculateSkillYears';
import type { SkillCategory } from '../../../../utils/skillColour';
import { skillShadeIndex } from '../../../../utils/skillColour';
import { computeShadeColour } from '../../../../utils/computeShadeColour';

interface SkillsListViewProps {
  skills: SkillSummary[];
  recommendations: Recommendation[];
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

export function SkillsListView({ skills, recommendations }: SkillsListViewProps) {
  const theme = useTheme();
  const [popover, setPopover] = useState<PopoverState | null>(null);

  const byCategory = CATEGORY_ORDER.reduce<Record<SkillCategory, SkillSummary[]>>(
    (acc, cat) => {
      acc[cat] = skills.filter((s) => s.category === cat);
      return acc;
    },
    { engineering: [], managerial: [], 'soft-skills': [], other: [] }
  );

  const linkedRecs =
    popover !== null ? recommendations.filter((r) => r.skills.includes(popover.skill.skill)) : [];

  function chipSx(skill: SkillSummary) {
    const { colour } = skill;
    if (colour === 'default') return {};
    const paletteEntry = theme.palette[colour as keyof typeof theme.palette];
    if (paletteEntry === null || typeof paletteEntry !== 'object' || !('main' in paletteEntry)) {
      return {};
    }
    const { bg, textColour } = computeShadeColour(
      (paletteEntry as { main: string }).main,
      skillShadeIndex(skill.skill),
      theme.palette.getContrastText
    );
    return { bgcolor: bg, color: textColour };
  }

  return (
    <>
      <Stack spacing={4}>
        {CATEGORY_ORDER.filter((cat) => byCategory[cat].length > 0).map((cat) => (
          <Section key={cat} title={CATEGORY_LABELS[cat]}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {byCategory[cat].map((s) => (
                <Chip
                  key={s.skill}
                  label={`${s.skill} · est. ${s.years} years`}
                  size="small"
                  onClick={(e) => {
                    setPopover({ anchor: e.currentTarget, skill: s });
                  }}
                  sx={{ cursor: 'pointer', ...chipSx(s) }}
                />
              ))}
            </Box>
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
                  <Typography variant="caption" color="text.secondary" display="block">
                    {rec.authorInitials} · {rec.authorRole.jobTitle}, {rec.authorRole.company}
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
}
