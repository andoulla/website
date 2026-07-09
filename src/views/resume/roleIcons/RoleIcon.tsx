import Box from '@mui/material/Box';
import School from '@mui/icons-material/School';
import type { SvgIconComponent } from '@mui/icons-material';

import type { TimelineEventWithRecommendations } from '@/types';

import { LOGO_BY_EVENT_ID } from './RoleIcons.constants';

export interface RoleIconProps {
  event: TimelineEventWithRecommendations;
  fallbackIcon: SvgIconComponent;
}

export const RoleIcon = ({ event, fallbackIcon: FallbackIcon }: RoleIconProps) => {
  const logo = LOGO_BY_EVENT_ID[event.id];
  if (logo !== undefined) {
    return (
      <Box
        component="img"
        src={logo}
        alt={`${event.companyName} logo`}
        sx={{ width: 20, height: 20, display: 'block', objectFit: 'contain' }}
      />
    );
  }

  const Icon = event.type === 'education' ? School : FallbackIcon;
  return <Icon fontSize="small" />;
};
