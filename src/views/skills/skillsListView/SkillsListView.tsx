import { useCallback, useEffect, useMemo, useState } from 'react';
import LinkedIn from '@mui/icons-material/LinkedIn';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Section } from '@/components/section';
import type { SkillCategory, SkillSubCategory } from '@/data/skills.types';
import type { Recommendation } from '@/types';
import type { SkillSummary } from '@/utils/calculateSkillYears';
import { filterSkillsByCategory } from '@/utils/filterSkillsByCategory';
import { formatDate } from '@/utils/formatDate';
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  SUBCATEGORIES_BY_CATEGORY,
  SUBCATEGORY_LABELS,
} from '@/utils/skillCategory';

import { skillElementId } from './SkillsListView.helpers';
import { SkillItemsList } from './skillItemsList';

export interface SkillsListViewProps {
  skills: SkillSummary[];
  recommendations: Recommendation[];
  highlightedSkill?: string;
  selectedCategories: SkillCategory[];
  selectedSubCategories: SkillSubCategory[];
}

interface PopoverState {
  anchor: HTMLElement;
  skill: SkillSummary;
}

interface SubCategoryGroup {
  subCategory: SkillSubCategory;
  skills: SkillSummary[];
}

export const SkillsListView = ({
  skills,
  recommendations,
  highlightedSkill,
  selectedCategories,
  selectedSubCategories,
}: SkillsListViewProps) => {
  const [popover, setPopover] = useState<PopoverState | null>(null);

  useEffect(() => {
    if (highlightedSkill === undefined) return;
    const el = document.getElementById(skillElementId(highlightedSkill));
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlightedSkill]);

  const filteredSkills = useMemo(
    () => filterSkillsByCategory(skills, selectedCategories, selectedSubCategories),
    [skills, selectedCategories, selectedSubCategories]
  );

  const byCategory = useMemo(
    () =>
      CATEGORY_ORDER.reduce<Record<SkillCategory, SkillSummary[]>>(
        (acc, cat) => {
          acc[cat] = filteredSkills.filter((skill) => skill.category === cat);
          return acc;
        },
        { engineering: [], managerial: [], 'soft-skills': [], other: [] }
      ),
    [filteredSkills]
  );

  const subGroupsByCategory = useMemo(
    () =>
      CATEGORY_ORDER.reduce<Record<SkillCategory, SubCategoryGroup[]>>(
        (acc, cat) => {
          acc[cat] = SUBCATEGORIES_BY_CATEGORY[cat]
            .map((subCategory) => ({
              subCategory,
              skills: byCategory[cat].filter((skill) => skill.subCategory === subCategory),
            }))
            .filter((group) => group.skills.length > 0);
          return acc;
        },
        { engineering: [], managerial: [], 'soft-skills': [], other: [] }
      ),
    [byCategory]
  );

  const linkedRecs = useMemo(
    () =>
      popover !== null
        ? recommendations.filter((recommendation) =>
            popover.skill.recommendationIds.includes(recommendation.id)
          )
        : [],
    [popover, recommendations]
  );

  const handleItemClick = useCallback((anchor: HTMLElement, skill: SkillSummary) => {
    setPopover({ anchor, skill });
  }, []);

  return (
    <>
      <Stack spacing={2}>
        {CATEGORY_ORDER.filter((cat) => byCategory[cat].length > 0).map((cat) => (
          <Section key={cat} title={CATEGORY_LABELS[cat]}>
            {subGroupsByCategory[cat].length > 1 ? (
              <Stack spacing={1.5}>
                {subGroupsByCategory[cat].map((group) => (
                  <Section
                    key={group.subCategory}
                    title={SUBCATEGORY_LABELS[group.subCategory]}
                    titleLevel={3}
                  >
                    <SkillItemsList
                      skills={group.skills}
                      highlightedSkill={highlightedSkill}
                      onItemClick={handleItemClick}
                    />
                  </Section>
                ))}
              </Stack>
            ) : (
              <SkillItemsList
                skills={byCategory[cat]}
                highlightedSkill={highlightedSkill}
                onItemClick={handleItemClick}
              />
            )}
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
                    <Link
                      href={rec.recommendationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="View full recommendation on LinkedIn"
                      sx={{ ml: 0.5 }}
                    >
                      <LinkedIn fontSize="inherit" sx={{ verticalAlign: 'middle' }} />
                    </Link>
                    {' · '}
                    {formatDate(rec.postedDate)}
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
