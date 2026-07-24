import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import type { SkillSummary } from '@/utils/calculateSkillYears';
import { formatYears } from '@/utils/formatYears';
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

const SkillRow = ({ skill, isHighlighted }: SkillRowProps) => {
  const theme = useTheme();

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <CategoryColourDot colour={dotColour(skill, theme)} />
          {skill.skill}
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
