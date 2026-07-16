import type { SvgIconComponent } from '@mui/icons-material';
import CorporateFare from '@mui/icons-material/CorporateFare';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import School from '@mui/icons-material/School';
import Work from '@mui/icons-material/Work';

import type { TimelineEvent } from '@/types';

import cityStGeorgesLogo from './logos/city_university_london_logo.jpeg';
import universityOfEastAngliaLogo from './logos/university_of_east_anglia_logo.jpeg';

/** Type-specific icons for each event type. */
export const ICON_BY_TYPE: Record<TimelineEvent['type'], SvgIconComponent> = {
  work: Work,
  education: School,
  internship: CorporateFare,
  other: InfoOutlined,
};

/** Institution logos, keyed by the timeline event's id, for education entries with a known logo. */
export const LOGO_BY_EVENT_ID: Record<string, string> = {
  'city-st-georges-university-of-london-2011-09': cityStGeorgesLogo,
  'university-of-east-anglia-2007-09': universityOfEastAngliaLogo,
};
