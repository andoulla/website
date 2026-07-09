import Business from '@mui/icons-material/Business';
import Code from '@mui/icons-material/Code';
import RocketLaunch from '@mui/icons-material/RocketLaunch';
import Terminal from '@mui/icons-material/Terminal';
import Work from '@mui/icons-material/Work';
import type { SvgIconComponent } from '@mui/icons-material';

import cityStGeorgesLogo from './logos/city_university_london_logo.jpeg';
import universityOfEastAngliaLogo from './logos/university_of_east_anglia_logo.jpeg';

export const ROLE_ICONS: SvgIconComponent[] = [Business, Code, RocketLaunch, Terminal, Work];

/** Pick a random icon from the pool, used to give each role a distinct timeline bullet. */
export const pickRandomRoleIcon = (): SvgIconComponent => {
  return ROLE_ICONS[Math.floor(Math.random() * ROLE_ICONS.length)];
};

/** Institution logos, keyed by the timeline event's id, for education entries with a known logo. */
export const LOGO_BY_EVENT_ID: Record<string, string> = {
  'city-st-georges-university-of-london-2011-09': cityStGeorgesLogo,
  'university-of-east-anglia-2007-09': universityOfEastAngliaLogo,
};
