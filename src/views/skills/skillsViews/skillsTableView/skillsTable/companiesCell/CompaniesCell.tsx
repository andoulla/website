import { useState } from 'react';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';

import type { SkillCompanyYears } from '@/utils/calculateSkillYears';
import { formatYears } from '@/utils/formatYears';

import { VISIBLE_COMPANY_COUNT } from './CompaniesCell.constants';

interface CompaniesCellProps {
  skillName: string;
  companyYears: SkillCompanyYears[];
}

const formatCompanyYears = (companyYears: SkillCompanyYears[]): string =>
  companyYears.map(({ name, years }) => `${name} · ${formatYears(years)}`).join(' | ');

export const CompaniesCell = ({ skillName, companyYears }: CompaniesCellProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  if (companyYears.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        —
      </Typography>
    );
  }

  const hiddenCount = companyYears.length - VISIBLE_COMPANY_COUNT;

  if (hiddenCount <= 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        {formatCompanyYears(companyYears)}
      </Typography>
    );
  }

  const isOpen = anchorEl !== null;
  // encodeURIComponent keeps this a valid HTML id even for multi-word skill names.
  const popoverId = isOpen ? `companies-popover-${encodeURIComponent(skillName)}` : undefined;

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" component="span">
        {formatCompanyYears(companyYears.slice(0, VISIBLE_COMPANY_COUNT))}{' '}
      </Typography>
      <Link
        component="button"
        type="button"
        variant="body2"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-controls={popoverId}
        onClick={(event) => {
          setAnchorEl(event.currentTarget);
        }}
      >
        +{hiddenCount} more
      </Link>
      <Popover
        id={popoverId}
        open={isOpen}
        anchorEl={anchorEl}
        onClose={() => {
          setAnchorEl(null);
        }}
      >
        <Box sx={{ p: 2, maxWidth: 320 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {skillName} — all companies
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
            {companyYears.map(({ name, years }) => (
              <Box component="li" key={name}>
                <Typography variant="body2">
                  {name} · {formatYears(years)}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Popover>
    </Box>
  );
};
