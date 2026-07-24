import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { MemoryRouter } from 'react-router-dom';

import { TrackContextProvider } from '@/context/track';
import { SkillSummary } from '@/testing';
import type { SkillEdge, SkillNode } from '@/utils/deriveSkillCoOccurrence';

import { SkillsNetworkGraph } from './SkillsNetworkGraph';

const renderGraph = (
  nodes: SkillNode[],
  edges: SkillEdge[],
  skills: ReturnType<SkillSummary['mock']>[]
) =>
  render(
    <MemoryRouter>
      <TrackContextProvider>
        <SkillsNetworkGraph
          nodes={nodes}
          edges={edges}
          skills={skills}
          dimmedNodes={new Set()}
          highlightedSkills={[]}
        />
      </TrackContextProvider>
    </MemoryRouter>
  );

describe('SkillsNetworkGraph', () => {
  test('accessible table lists each skill and its co-occurring skills', async () => {
    const nodes: SkillNode[] = [
      { id: 'React', occurrences: 3 },
      { id: 'TypeScript', occurrences: 2 },
    ];
    const edges: SkillEdge[] = [{ source: 'React', target: 'TypeScript', weight: 2 }];
    const skills = [
      new SkillSummary().skill('React').years(3).categoryName('Frontend').mock(),
      new SkillSummary().skill('TypeScript').years(2).categoryName('Frontend').mock(),
    ];

    const screen = renderGraph(nodes, edges, skills);

    // Each skill appears as its own row's skill name and as a co-occurring partner in the other
    // row, so each name appears exactly twice in the table.
    expect(screen.getAllByRole('cell', { name: 'React' })).toHaveLength(2);
    expect(screen.getAllByRole('cell', { name: 'TypeScript' })).toHaveLength(2);
    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('clicking a node opens the popover with skill tooltip content', async () => {
    const user = userEvent.setup();
    const nodes: SkillNode[] = [
      { id: 'React', occurrences: 3 },
      { id: 'TypeScript', occurrences: 2 },
    ];
    const edges: SkillEdge[] = [{ source: 'React', target: 'TypeScript', weight: 1 }];
    const skills = [
      new SkillSummary().skill('React').years(3).categoryName('Frontend').mock(),
      new SkillSummary().skill('TypeScript').years(2).categoryName('Frontend').mock(),
    ];

    const screen = renderGraph(nodes, edges, skills);

    await user.click(screen.getByRole('button', { name: 'React' }));

    expect(screen.getByRole('link', { name: 'View on Resume' })).toBeVisible();
    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('pressing Enter on a focused node opens the popover', async () => {
    const user = userEvent.setup();
    const nodes: SkillNode[] = [
      { id: 'React', occurrences: 3 },
      { id: 'TypeScript', occurrences: 2 },
    ];
    const edges: SkillEdge[] = [{ source: 'React', target: 'TypeScript', weight: 1 }];
    const skills = [
      new SkillSummary().skill('React').years(3).categoryName('Frontend').mock(),
      new SkillSummary().skill('TypeScript').years(2).categoryName('Frontend').mock(),
    ];

    const screen = renderGraph(nodes, edges, skills);

    screen.getByRole('button', { name: 'TypeScript' }).focus();

    await user.keyboard('{Enter}');

    expect(screen.getByRole('link', { name: 'View on Resume' })).toBeVisible();
  });
});
