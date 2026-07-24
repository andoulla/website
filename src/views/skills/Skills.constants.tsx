import BarChartIcon from '@mui/icons-material/BarChart';
import HubIcon from '@mui/icons-material/Hub';
import RadarIcon from '@mui/icons-material/Radar';
import TableChartIcon from '@mui/icons-material/TableChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

import type { ViewMode, ViewOption } from './Skills.types';
import {
  SkillsGraphView,
  SkillsGrowthView,
  SkillsNetworkView,
  SkillsRadarView,
  SkillsTableView,
} from './skillsViews';

// One entry per view: icon, tooltip/aria label, caption, and the component to render.
// Adding a view = one entry here (typed Record forces all four fields).
export const VIEW_OPTIONS: Record<ViewMode, ViewOption> = {
  barchart: {
    icon: <BarChartIcon fontSize="small" />,
    label: 'Graph view',
    caption: "How many years I've spent on each skill",
    Component: SkillsGraphView,
  },
  radar: {
    icon: <RadarIcon fontSize="small" />,
    label: 'Radar view',
    caption: 'Where my experience is concentrated across areas',
    Component: SkillsRadarView,
  },
  table: {
    icon: <TableChartIcon fontSize="small" />,
    label: 'Table view',
    caption: 'Every skill grouped by area, with the companies behind it',
    Component: SkillsTableView,
  },
  network: {
    icon: <HubIcon fontSize="small" />,
    label: 'Network view',
    caption: "Which skills I've used together, and how often",
    Component: SkillsNetworkView,
  },
  growth: {
    icon: <TrendingUpIcon fontSize="small" />,
    label: 'Growth view',
    caption: 'How my skill set has grown across my career',
    Component: SkillsGrowthView,
  },
};
