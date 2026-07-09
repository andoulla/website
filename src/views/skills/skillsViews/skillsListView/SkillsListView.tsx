import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { RecommendationByline } from '@/components/recommendationByline';
import { Section } from '@/components/section';
import type { SkillCategory, SkillSubCategory } from '@/data/skills.types';
import type { SkillSummary } from '@/utils/calculateSkillYears';
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  SUBCATEGORIES_BY_CATEGORY,
  SUBCATEGORY_LABELS,
} from '@/utils/skillCategory';
import { skillMatchesSearch } from '@/utils/skillMatchesSearch';

import { useSkillsViewContext } from '../SkillsViewContext';

import { skillElementId } from './SkillsListView.helpers';
import { SkillItemsList } from './skillItemsList';

interface PopoverState {
  anchor: HTMLElement;
  skill: SkillSummary;
}

interface SubCategoryGroup {
  subCategory: SkillSubCategory;
  skills: SkillSummary[];
}

export const SkillsListView = () => {
  const { filteredSkills, recommendations, highlightedSkills, searchTerm } = useSkillsViewContext();
  const [popover, setPopover] = useState<PopoverState | null>(null);

  useEffect(() => {
    if (highlightedSkills.length === 0) return;
    const el = document.getElementById(skillElementId(highlightedSkills[0]));
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlightedSkills]);

  // A non-empty search term hides everything but the matches, rather than just accenting them.
  const searchedSkills = useMemo(
    () =>
      searchTerm === undefined || searchTerm.trim() === ''
        ? filteredSkills
        : filteredSkills.filter((skill) => skillMatchesSearch(skill, searchTerm)),
    [filteredSkills, searchTerm]
  );

  const byCategory = useMemo(
    () =>
      CATEGORY_ORDER.reduce<Record<SkillCategory, SkillSummary[]>>(
        (acc, cat) => {
          acc[cat] = searchedSkills.filter((skill) => skill.category === cat);
          return acc;
        },
        {
          engineering: [],
          'quality-performance': [],
          tooling: [],
          'leadership-delivery': [],
          'people-stakeholders': [],
        }
      ),
    [searchedSkills]
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
        {
          engineering: [],
          'quality-performance': [],
          tooling: [],
          'leadership-delivery': [],
          'people-stakeholders': [],
        }
      ),
    [byCategory]
  );

  const nonEmptyCategories = useMemo(
    () => CATEGORY_ORDER.filter((cat) => byCategory[cat].length > 0),
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
        {nonEmptyCategories.map((cat) => (
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
                      highlightedSkills={highlightedSkills}
                      onItemClick={handleItemClick}
                    />
                  </Section>
                ))}
              </Stack>
            ) : (
              <SkillItemsList
                skills={byCategory[cat]}
                highlightedSkills={highlightedSkills}
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
          <Button
            component={RouterLink}
            to={`/?skill=${encodeURIComponent(popover?.skill.skill ?? '')}`}
            size="small"
            sx={{ mb: 1 }}
          >
            View on Resume
          </Button>
          {linkedRecs.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No recommendations yet.
            </Typography>
          ) : (
            <Stack spacing={1.5} divider={<Divider />}>
              {linkedRecs.map((rec) => (
                <Box key={rec.id}>
                  <RecommendationByline recommendation={rec} />
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
