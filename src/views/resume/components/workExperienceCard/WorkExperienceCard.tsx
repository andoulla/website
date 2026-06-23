import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';

import { BulletList } from '../../../../components/bulletList';
import { Section } from '../../../../components/section';
import { TagList } from '../../../../components/tagList';
import { ReferenceQuote } from '../referenceQuote';
import type { WorkExperienceWithReferences } from '../../../../utils/joinJobsWithReferences';

export interface WorkExperienceCardProps {
  experience: WorkExperienceWithReferences;
}

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function formatMonthYear(isoDate: string): string {
  const [year, month] = isoDate.split('-');
  return `${MONTH_NAMES[Number(month) - 1]} ${year}`;
}

function formatDuration(startDate: string, endDate: string | null): string {
  const end = endDate === null ? 'Present' : formatMonthYear(endDate);
  return `${formatMonthYear(startDate)} – ${end}`;
}

export function WorkExperienceCard({ experience }: WorkExperienceCardProps) {
  const duration = formatDuration(experience.startDate, experience.endDate);

  return (
    <Card>
      <CardHeader
        title={experience.companyName}
        // Render the company name as a real h3 heading (visually sized h6) so it sits
        // correctly under the h2 "Work Experience" section in the heading hierarchy.
        slotProps={{
          title: { variant: 'h6', component: 'h3' },
          subheader: { variant: 'body2' },
        }}
        subheader={`${experience.location} · ${duration}`}
      />
      <CardContent>
        <Section title="Responsibilities" titleLevel={4}>
          <BulletList items={experience.responsibilities} />
        </Section>
        <Divider sx={{ my: 2 }} />
        <Section title="Key Skills" titleLevel={4}>
          <TagList items={experience.skills} />
        </Section>
        {experience.references.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Section title="References" titleLevel={4}>
              <Stack spacing={1.5}>
                {experience.references.map((reference) => (
                  <ReferenceQuote key={reference.id} reference={reference} />
                ))}
              </Stack>
            </Section>
          </>
        )}
      </CardContent>
    </Card>
  );
}
