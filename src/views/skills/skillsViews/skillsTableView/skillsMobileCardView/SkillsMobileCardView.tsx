import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import type { SkillSummary } from '@/utils/calculateSkillYears';
import { formatYears } from '@/utils/formatYears';
import { CategoryColourDot } from '@/views/skills/categoryColourDot';

import { skillElementId } from '../SkillsTableView.helpers';
import type { CategoryGroup } from '../SkillsTableView.types';
import { dotColour } from '../skillsTable/SkillsTable.helpers';
import { RecommendationBadge } from '../skillsTable/recommendationBadge';
import { RowActionsMenu } from '../skillsTable/rowActionsMenu';

interface SkillsMobileCardViewProps {
  categoryGroups: CategoryGroup[];
  highlightedSkills?: string[];
}

interface SkillCardProps {
  skill: SkillSummary;
  isHighlighted: boolean;
}

const SkillCard = ({ skill, isHighlighted }: SkillCardProps) => {
  const theme = useTheme();
  const [showAllCompanies, setShowAllCompanies] = useState(false);

  const primaryCompany = skill.companyYears[0];
  const additionalCount = Math.max(0, skill.companyYears.length - 1);

  return (
    <>
      <Box
        id={skillElementId(skill.skill)}
        sx={{
          p: 2,
          mb: 1.5,
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          bgcolor: isHighlighted ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
          transition: 'background-color 0.4s ease',
        }}
      >
        {/* Header: skill name + kebab menu */}
        <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
          <Stack sx={{ flexGrow: 1, pr: 1 }}>
            <Typography
              variant="body1"
              sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}
            >
              <CategoryColourDot colour={dotColour(skill, theme)} />
              {skill.skill}
              <RecommendationBadge recommendationIds={skill.recommendationIds} />
            </Typography>
          </Stack>
          <RowActionsMenu skill={skill} />
        </Stack>

        {/* Primary company pill */}
        {primaryCompany && (
          <Box
            sx={{
              display: 'inline-block',
              px: 1.5,
              py: 0.5,
              mb: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              border: `1px solid ${theme.palette.primary.light}`,
              borderRadius: '12px',
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 500 }}>
              {primaryCompany.name} · {formatYears(primaryCompany.years)}
            </Typography>
          </Box>
        )}

        {/* +N more button */}
        {additionalCount > 0 && (
          <Button
            size="small"
            variant="text"
            onClick={() => setShowAllCompanies(true)}
            sx={{ display: 'block', mt: 0.5, mb: 1, textTransform: 'none', p: 0 }}
          >
            +{additionalCount} more
          </Button>
        )}

        {/* Total years caption */}
        <Typography variant="caption" color="text.secondary">
          Total: {formatYears(skill.years)}
        </Typography>
      </Box>

      {/* Dialog showing all companies */}
      <Dialog
        open={showAllCompanies}
        onClose={() => setShowAllCompanies(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{skill.skill}</DialogTitle>
        <DialogContent>
          <Stack sx={{ gap: 1, pt: 2 }}>
            {skill.companyYears.map(({ name, years }) => (
              <Box key={name}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatYears(years)}
                </Typography>
              </Box>
            ))}
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
};

const MobileCardGroupHeader = ({ label, variant = 'category' }: { label: string; variant?: 'category' | 'subcategory' }) => {
  const theme = useTheme();
  const isSubcategory = variant === 'subcategory';

  return (
    <Typography
      variant={isSubcategory ? 'caption' : 'body2'}
      sx={{
        fontWeight: isSubcategory ? 500 : 600,
        color: 'text.primary',
        mt: isSubcategory ? 2 : 2.5,
        mb: 1,
        pl: isSubcategory ? 1 : 0,
        textTransform: isSubcategory ? 'uppercase' : 'none',
        fontSize: isSubcategory ? '0.75rem' : '0.875rem',
        letterSpacing: isSubcategory ? '0.5px' : 'normal',
      }}
    >
      {label}
    </Typography>
  );
};

export const SkillsMobileCardView = ({ categoryGroups, highlightedSkills = [] }: SkillsMobileCardViewProps) => {
  return (
    <Stack sx={{ gap: 0 }}>
      {categoryGroups.map(({ category, subGroups, skills }) => (
        <Box key={category.id}>
          <MobileCardGroupHeader label={category.name} />

          {subGroups.length > 1 ? (
            // Subcategories present — group by subcategory
            subGroups.map((subGroup) => (
              <Box key={subGroup.subCategory.id}>
                <MobileCardGroupHeader label={subGroup.subCategory.name} variant="subcategory" />
                <Stack sx={{ gap: 1 }}>
                  {subGroup.skills.map((skill) => (
                    <SkillCard
                      key={skill.skill}
                      skill={skill}
                      isHighlighted={highlightedSkills.includes(skill.skill)}
                    />
                  ))}
                </Stack>
              </Box>
            ))
          ) : (
            // No subcategories — show skills directly
            <Stack sx={{ gap: 1 }}>
              {skills.map((skill) => (
                <SkillCard
                  key={skill.skill}
                  skill={skill}
                  isHighlighted={highlightedSkills.includes(skill.skill)}
                />
              ))}
            </Stack>
          )}
        </Box>
      ))}
    </Stack>
  );
};
