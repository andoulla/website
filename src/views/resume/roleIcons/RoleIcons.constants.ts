import Business from '@mui/icons-material/Business';
import Code from '@mui/icons-material/Code';
import RocketLaunch from '@mui/icons-material/RocketLaunch';
import Terminal from '@mui/icons-material/Terminal';
import Work from '@mui/icons-material/Work';
import type { SvgIconComponent } from '@mui/icons-material';

export const ROLE_ICONS: SvgIconComponent[] = [Business, Code, RocketLaunch, Terminal, Work];

/** Pick a random icon from the pool, used to give each role a distinct timeline bullet. */
export const pickRandomRoleIcon = (): SvgIconComponent => {
  return ROLE_ICONS[Math.floor(Math.random() * ROLE_ICONS.length)];
};
