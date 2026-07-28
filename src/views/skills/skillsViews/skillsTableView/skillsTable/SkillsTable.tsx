import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import type { SkillSummary } from '@/utils/calculateSkillYears';
import type { TrackDiffStatus } from '@/utils/deriveTrackDiff';
import { formatYears } from '@/utils/formatYears';
import { CategoryColourDot } from '@/views/skills/categoryColourDot';

import { skillElementId } from '../SkillsTableView.helpers';
import type { CategoryGroup } from '../SkillsTableView.types';

import { dotColour } from './SkillsTable.helpers';
import { RecommendationBadge } from './recommendationBadge';
import { RowActionsMenu } from './rowActionsMenu';

export interface SkillsTableProps {
  categoryGroups: CategoryGroup[];
  highlightedSkills?: string[];
  diffStatusMap?: Map<string, TrackDiffStatus>;
  diffSide?: 'a' | 'b';
  hideTypeColumn?: boolean;
}

interface SkillRowProps {
  skill: SkillSummary;
  isHighlighted: boolean;
  diffStatus?: TrackDiffStatus;
  diffSide?: 'a' | 'b';
  hideTypeColumn?: boolean;
}

const SkillRow = ({
  skill,
  isHighlighted,
  diffStatus,
  diffSide,
  hideTypeColumn,
}: SkillRowProps) => {
  const theme = useTheme();

  const isMoved = diffStatus === 'both-moved';
  const isUniqueHere =
    (diffStatus === 'only-a' && diffSide === 'a') || (diffStatus === 'only-b' && diffSide === 'b');

  return (
    <TableRow
      id={skillElementId(skill.skill)}
      hover
      sx={{
        ...(isHighlighted && {
          bgcolor: alpha(theme.palette.primary.main, 0.12),
        }),
        ...(isMoved && {
          borderLeft: `3px solid ${theme.palette.warning.main}`,
        }),
        ...(isUniqueHere && {
          borderLeft: `3px dashed ${theme.palette.text.disabled}`,
        }),
        transition: 'background-color 0.4s ease',
      }}
    >
      <TableCell sx={{ verticalAlign: 'top' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <CategoryColourDot colour={dotColour(skill, theme)} />
          {skill.skill}
          <RecommendationBadge recommendationIds={skill.recommendationIds} />
        </Box>
      </TableCell>
      {hideTypeColumn !== true && (
        <TableCell sx={{ verticalAlign: 'top' }}>
          <Typography variant="body2" color="text.secondary">
            {skill.type === 'tech' ? 'tech' : 'soft'}
          </Typography>
        </TableCell>
      )}
      <TableCell sx={{ verticalAlign: 'top' }}>
        {skill.companyYears.length > 0 ? (
          <Typography variant="body2" color="text.secondary">
            {skill.companyYears
              .map(({ name, years }) => `${name} · ${formatYears(years)}`)
              .join(' | ')}
          </Typography>
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
  colSpan = 5,
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

export const SkillsTable = ({
  categoryGroups,
  highlightedSkills = [],
  diffStatusMap,
  diffSide,
  hideTypeColumn,
}: SkillsTableProps) => {
  const colSpan = hideTypeColumn === true ? 4 : 5;

  const rows = categoryGroups.flatMap(({ category, subGroups, skills }) => {
    const categoryRow = {
      type: 'category' as const,
      key: `category-${category.id}`,
      category,
    };

    const buildSkillRow = (skill: SkillSummary) => ({
      type: 'skill' as const,
      key: `skill-${skill.skill}`,
      skill,
      isHighlighted: highlightedSkills.includes(skill.skill),
      diffStatus: diffStatusMap?.get(skill.id),
    });

    if (subGroups.length > 1) {
      const subCategoryRows = subGroups.flatMap((subGroup) => [
        {
          type: 'subcategory' as const,
          key: `subcategory-${category.id}-${subGroup.subCategory.id}`,
          subCategory: subGroup.subCategory,
        },
        ...subGroup.skills.map(buildSkillRow),
      ]);

      return [categoryRow, ...subCategoryRows];
    }

    return [categoryRow, ...skills.map(buildSkillRow)];
  });

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Skill</TableCell>
            {hideTypeColumn !== true && <TableCell>Type</TableCell>}
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
              return <GroupHeaderRow key={row.key} label={row.category.name} colSpan={colSpan} />;
            }

            if (row.type === 'subcategory') {
              return (
                <GroupHeaderRow
                  key={row.key}
                  label={row.subCategory.name}
                  variant="subcategory"
                  colSpan={colSpan}
                />
              );
            }

            return (
              <SkillRow
                key={row.key}
                skill={row.skill}
                isHighlighted={row.isHighlighted}
                diffStatus={row.diffStatus}
                diffSide={diffSide}
                hideTypeColumn={hideTypeColumn}
              />
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
