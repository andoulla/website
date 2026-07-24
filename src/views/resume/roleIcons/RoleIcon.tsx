import Box from '@mui/material/Box';

import type { TimelineEventWithRecommendations } from '@/types';

import { ICON_BY_TYPE, LOGO_BY_EVENT_ID } from './RoleIcons.constants';

export interface RoleIconProps {
  event: TimelineEventWithRecommendations;
}

export const RoleIcon = ({ event }: RoleIconProps) => {
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

  const Icon = ICON_BY_TYPE[event.type];

  return <Icon fontSize="small" />;
};
