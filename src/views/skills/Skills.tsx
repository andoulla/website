import { Suspense, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import BarChartIcon from '@mui/icons-material/BarChart';
import ViewListIcon from '@mui/icons-material/ViewList';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';

import { useResumeData } from '../../context/resumeData';
import { calculateSkillYears } from '../../utils/calculateSkillYears';

import { SkillsGraphView } from './components/skillsGraphView';
import { SkillsListView } from './components/skillsListView';

type ViewMode = 'list' | 'graph';

function SkillsContent() {
  const experiences = useResumeData();
  const skills = calculateSkillYears(experiences);
  const recommendations = experiences.flatMap((e) => e.recommendations);

  const [searchParams] = useSearchParams();
  const highlightedSkill = searchParams.get('skill') ?? undefined;

  const [viewMode, setViewMode] = useState<ViewMode>('list');

  return (
    <>
      <Stack direction="row" sx={{ mb: 3, justifyContent: 'flex-end' }}>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_e, next: ViewMode | null) => {
            if (next !== null) setViewMode(next);
          }}
          size="small"
          aria-label="View mode"
        >
          <ToggleButton value="list" aria-label="List view">
            <ViewListIcon fontSize="small" sx={{ mr: 0.5 }} />
            List
          </ToggleButton>
          <ToggleButton value="graph" aria-label="Graph view">
            <BarChartIcon fontSize="small" sx={{ mr: 0.5 }} />
            Graph
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>
      {viewMode === 'list' ? (
        <SkillsListView
          skills={skills}
          recommendations={recommendations}
          highlightedSkill={highlightedSkill}
        />
      ) : (
        <SkillsGraphView />
      )}
    </>
  );
}

export function Skills() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" sx={{ mb: 3 }}>
        Skills
      </Typography>
      <Suspense
        fallback={
          <Stack sx={{ py: 8, alignItems: 'center' }}>
            <CircularProgress aria-label="Loading skills" />
          </Stack>
        }
      >
        <SkillsContent />
      </Suspense>
    </Container>
  );
}
