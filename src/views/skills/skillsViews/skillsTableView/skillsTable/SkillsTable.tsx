import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import { alpha, useTheme } from '@mui/material/styles';

import { TRACK_PARAM, useTrackContext } from '@/context/track';
import type { SkillSummary } from '@/utils/calculateSkillYears';
import { formatYears } from '@/utils/formatYears';
import { getRecommendationsByIds } from '@/utils/getRecommendationsByIds';
import { CategoryColourDot } from '@/views/skills/categoryColourDot';

import { skillElementId } from '../SkillsTableView.helpers';
import type { CategoryGroup } from '../SkillsTableView.types';

import { dotColour } from './SkillsTable.helpers';
import { RowActionsMenu } from './rowActionsMenu';

export interface SkillsTableProps {
  categoryGroups: CategoryGroup[];
  highlightedSkills?: string[];
}

interface SkillRowProps {
  skill: SkillSummary;
  isHighlighted: boolean;
}

const renderTypeLabel = (type: SkillSummary['type']): string => {
  if (type === 'tech') return 'tech';

  return 'non-technical';
};

const SkillRow = ({ skill, isHighlighted }: SkillRowProps) => {
  const theme = useTheme();
  const { trackId } = useTrackContext();
  const [recAnchorEl, setRecAnchorEl] = useState<HTMLElement | null>(null);

  const recCount = skill.recommendationIds.length;
  const recommendations = getRecommendationsByIds(skill.recommendationIds);

  return (
    <TableRow
      id={skillElementId(skill.skill)}
      hover
      sx={{
        ...(isHighlighted && {
          bgcolor: alpha(theme.palette.primary.main, 0.12),
        }),
        transition: 'background-color 0.4s ease',
      }}
    >
      <TableCell sx={{ verticalAlign: 'top' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <CategoryColourDot colour={dotColour(skill, theme)} />
          {skill.skill}
          <Chip label={renderTypeLabel(skill.type)} size="small" variant="outlined" />
          {recCount > 0 && (
            <>
              <IconButton
                size="small"
                aria-label={`${recCount} recommendation${recCount === 1 ? '' : 's'}`}
                onClick={(event) => {
                  setRecAnchorEl(event.currentTarget);
                }}
              >
                <Badge badgeContent={recCount} color="primary">
                  <FormatQuoteIcon fontSize="small" />
                </Badge>
              </IconButton>
              <Popover
                open={recAnchorEl !== null}
                anchorEl={recAnchorEl}
                onClose={() => {
                  setRecAnchorEl(null);
                }}
              >
                <Box sx={{ p: 2, maxWidth: 360 }}>
                  {recommendations.map((rec) => (
                    <Box key={rec.id} sx={{ mb: 2, '&:last-child': { mb: 0 } }}>
                      <Typography variant="subtitle2">
                        {rec.authorInitials} — {rec.authorRole.jobTitle}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5, mb: 0.5 }}>
                        {rec.text.length > 120 ? `${rec.text.slice(0, 120)}…` : rec.text}
                      </Typography>
                      <Link
                        component={RouterLink}
                        to={`/?recommendation=${encodeURIComponent(rec.id)}&${TRACK_PARAM}=${trackId}`}
                        variant="body2"
                        onClick={() => {
                          setRecAnchorEl(null);
                        }}
                      >
                        View on Resume
                      </Link>
                    </Box>
                  ))}
                </Box>
              </Popover>
            </>
          )}
        </Box>
      </TableCell>
      <TableCell sx={{ verticalAlign: 'top' }}>
        {skill.companyYears.length > 0 ? (
          <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
            {skill.companyYears.map(({ name, years }) => (
              <Chip
                key={name}
                label={`${name} · ${formatYears(years)}`}
                size="small"
                variant="outlined"
              />
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            —
          </Typography>
        )}
      </TableCell>
      <TableCell align="right" sx={{ verticalAlign: 'top', whiteSpace: 'nowrap' }}>
        {formatYears(skill.years)}
      </TableCell>
      <TableCell align="right" sx={{ verticalAlign: 'top' }}>
        <RowActionsMenu skill={skill} />
      </TableCell>
    </TableRow>
  );
};

const GroupHeaderRow = ({
  label,
  colSpan = 4,
  variant = 'category',
}: {
  label: string;
  colSpan?: number;
  variant?: 'category' | 'subcategory';
}) => {
  const theme = useTheme();
  const isSubcategory = variant === 'subcategory';

  return (
    <TableRow
      sx={{
        bgcolor: alpha(theme.palette.primary.main, isSubcategory ? 0.08 : 0.16),
      }}
    >
      <TableCell
        component="th"
        scope="rowgroup"
        colSpan={colSpan}
        sx={{
          py: isSubcategory ? 0.5 : 0.75,
          pl: isSubcategory ? 4 : 2,
          fontWeight: isSubcategory ? 500 : 600,
          fontSize: isSubcategory ? '0.8rem' : '0.9rem',
          borderBottom: isSubcategory ? '1px solid' : undefined,
          borderColor: isSubcategory ? theme.palette.divider : undefined,
        }}
      >
        {label}
      </TableCell>
    </TableRow>
  );
};

export const SkillsTable = ({ categoryGroups, highlightedSkills = [] }: SkillsTableProps) => {
  const rows = categoryGroups.flatMap(({ category, subGroups, skills }) => {
    const categoryRow = {
      type: 'category' as const,
      key: `category-${category.id}`,
      category,
    };

    const skillRows = skills.flatMap((skill) => ({
      type: 'skill' as const,
      key: `skill-${skill.skill}`,
      skill,
      isHighlighted: highlightedSkills.includes(skill.skill),
    }));

    if (subGroups.length > 1) {
      const subCategoryRows = subGroups.flatMap((subGroup) => [
        {
          type: 'subcategory' as const,
          key: `subcategory-${category.id}-${subGroup.subCategory.id}`,
          subCategory: subGroup.subCategory,
        },
        ...subGroup.skills.map((skill) => ({
          type: 'skill' as const,
          key: `skill-${skill.skill}`,
          skill,
          isHighlighted: highlightedSkills.includes(skill.skill),
        })),
      ]);

      return [categoryRow, ...subCategoryRows];
    }

    return [categoryRow, ...skillRows];
  });

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Skill</TableCell>
            <TableCell>Companies</TableCell>
            <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
              Years
            </TableCell>
            <TableCell align="right">Links</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => {
            if (row.type === 'category') {
              return <GroupHeaderRow key={row.key} label={row.category.name} />;
            }

            if (row.type === 'subcategory') {
              return (
                <GroupHeaderRow key={row.key} label={row.subCategory.name} variant="subcategory" />
              );
            }

            return <SkillRow key={row.key} skill={row.skill} isHighlighted={row.isHighlighted} />;
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
