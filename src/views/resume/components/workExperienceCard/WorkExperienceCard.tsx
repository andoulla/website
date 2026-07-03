import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import { BulletList } from '../../../../components/bulletList';
import { Section } from '../../../../components/section';
import { TagList } from '../../../../components/tagList';
import type { WorkExperienceWithRecommendations } from '../../../../types';
import { RecommendationText } from '../recommendationText';

export interface WorkExperienceCardProps {
  experience: WorkExperienceWithRecommendations;
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

const formatMonthYear = (isoDate: string): string => {
  const [year, month] = isoDate.split('-');
  return `${MONTH_NAMES[Number(month) - 1]} ${year}`;
};

const formatDuration = (startDate: string, endDate: string | null): string => {
  const end = endDate === null ? 'Present' : formatMonthYear(endDate);
  return `${formatMonthYear(startDate)} – ${end}`;
};

export const WorkExperienceCard = ({ experience }: WorkExperienceCardProps) => {
  const navigate = useNavigate();
  const duration = formatDuration(experience.startDate, experience.endDate);

  return (
    <Card elevation={0}>
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
        {experience.techStack.length > 0 && (
          <>
            <Section title="Tech Stack" titleLevel={4}>
              <Typography variant="body2" color="text.secondary">
                {experience.techStack.join(', ')}
              </Typography>
            </Section>
            <Divider sx={{ my: 2 }} />
          </>
        )}
        <Section title="Responsibilities" titleLevel={4}>
          {experience.responsibilities.length === 1 ? (
            <Typography variant="body2">{experience.responsibilities[0]}</Typography>
          ) : (
            <BulletList items={experience.responsibilities} />
          )}
        </Section>
        <Divider sx={{ my: 2 }} />
        <Section title="Key Skills" titleLevel={4}>
          <TagList
            items={experience.skills}
            onItemClick={(skill) => {
              void navigate(`/skills?skill=${encodeURIComponent(skill)}`);
            }}
          />
        </Section>
        {experience.recommendations.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Section title="Recommendations" titleLevel={4}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                  gap: 1.5,
                }}
              >
                {experience.recommendations.map((recommendation) => (
                  <RecommendationText key={recommendation.id} recommendation={recommendation} />
                ))}
              </Box>
            </Section>
          </>
        )}
      </CardContent>
    </Card>
  );
};
