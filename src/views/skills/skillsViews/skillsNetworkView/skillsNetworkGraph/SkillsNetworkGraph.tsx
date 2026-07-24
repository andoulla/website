import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { visuallyHidden } from '@mui/utils';

import { SkillTooltipContent } from '@/components/skillTooltipContent';
import type { SkillSummary } from '@/utils/calculateSkillYears';
import type { SkillEdge, SkillNode } from '@/utils/deriveSkillCoOccurrence';
import { deriveRadialLayout } from '@/utils/deriveRadialLayout';
import { derivePresentCategories } from '@/utils/derivePresentCategories';
import { resolveSkillColourMain } from '@/utils/skillColour';
import { CategoryColourDot } from '@/views/skills/categoryColourDot';

const SVG_SIZE = 600;
const NODE_RADIUS_MIN = 6;
const NODE_RADIUS_MAX = 20;
const EDGE_OPACITY_MIN = 0.1;
const EDGE_OPACITY_MAX = 0.9;
const EDGE_WIDTH_MIN = 0.5;
const EDGE_WIDTH_MAX = 3;

const toSvgCoord = (norm: number): number => ((norm + 1) / 2) * SVG_SIZE;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

interface SkillsNetworkGraphProps {
  nodes: SkillNode[];
  edges: SkillEdge[];
  skills: SkillSummary[];
  dimmedNodes: Set<string>;
  highlightedSkills: string[];
}

export const SkillsNetworkGraph = ({
  nodes,
  edges,
  skills,
  dimmedNodes,
  highlightedSkills,
}: SkillsNetworkGraphProps) => {
  const theme = useTheme();
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [popoverAnchorEl, setPopoverAnchorEl] = useState<Element | null>(null);
  const [popoverNodeId, setPopoverNodeId] = useState<string | null>(null);

  const skillByName = useMemo(
    () => new Map<string, SkillSummary>(skills.map((skill) => [skill.skill, skill])),
    [skills]
  );

  const positionedNodes = deriveRadialLayout(nodes, skills);
  const positionById = useMemo(
    () => new Map(positionedNodes.map((node) => [node.id, node])),
    [positionedNodes]
  );

  // Per-node co-occurring skills list, used for the accessible table.
  const coOccurringByNode = useMemo(() => {
    const map = new Map<string, string[]>();

    edges.forEach((edge) => {
      const sourceList = map.get(edge.source) ?? [];

      sourceList.push(edge.target);
      map.set(edge.source, sourceList);

      const targetList = map.get(edge.target) ?? [];

      targetList.push(edge.source);
      map.set(edge.target, targetList);
    });

    return map;
  }, [edges]);

  const maxWeight = useMemo(() => Math.max(...edges.map((edge) => edge.weight), 1), [edges]);

  const maxYears = useMemo(() => Math.max(...skills.map((skill) => skill.years), 1), [skills]);

  // Categories present in the network nodes (not all track skills).
  const nodeNames = useMemo(() => new Set(nodes.map((node) => node.id)), [nodes]);
  const networkSkills = useMemo(
    () => skills.filter((skill) => nodeNames.has(skill.skill)),
    [skills, nodeNames]
  );
  const legendCategories = useMemo(() => derivePresentCategories(networkSkills), [networkSkills]);

  const handleNodeClick = (nodeId: string, event: React.MouseEvent<SVGCircleElement>) => {
    setPopoverAnchorEl(event.currentTarget);
    setPopoverNodeId(nodeId);
  };

  const handleNodeKeyDown = (nodeId: string, event: React.KeyboardEvent<SVGCircleElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setPopoverAnchorEl(event.currentTarget);
      setPopoverNodeId(nodeId);
    }
  };

  const handlePopoverClose = () => {
    setPopoverAnchorEl(null);
    setPopoverNodeId(null);
  };

  const popoverSkill = popoverNodeId !== null ? skillByName.get(popoverNodeId) : undefined;

  const edgeColour = theme.palette.text.disabled;

  return (
    <Stack spacing={2}>
      <Box sx={{ width: '100%', position: 'relative' }}>
        <svg viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`} width="100%">
          {/* Edges drawn first so nodes appear on top */}
          {edges.map((edge) => {
            const source = positionById.get(edge.source);
            const target = positionById.get(edge.target);

            if (source === undefined || target === undefined) return null;

            const normalisedWeight = edge.weight / maxWeight;
            const opacity = clamp(
              normalisedWeight * EDGE_OPACITY_MAX,
              EDGE_OPACITY_MIN,
              EDGE_OPACITY_MAX
            );
            const strokeWidth = clamp(
              normalisedWeight * EDGE_WIDTH_MAX,
              EDGE_WIDTH_MIN,
              EDGE_WIDTH_MAX
            );

            return (
              <line
                key={`${edge.source}|${edge.target}`}
                x1={toSvgCoord(source.x)}
                y1={toSvgCoord(source.y)}
                x2={toSvgCoord(target.x)}
                y2={toSvgCoord(target.y)}
                stroke={edgeColour}
                strokeOpacity={opacity}
                strokeWidth={strokeWidth}
              />
            );
          })}

          {/* Nodes */}
          {positionedNodes.map((node) => {
            const skillSummary = skillByName.get(node.id);
            const years = skillSummary?.years ?? 1;
            const colour =
              skillSummary !== undefined
                ? resolveSkillColourMain(skillSummary.colour, theme)
                : theme.palette.grey[400];

            const radius = clamp(
              NODE_RADIUS_MIN + (years / maxYears) * (NODE_RADIUS_MAX - NODE_RADIUS_MIN),
              NODE_RADIUS_MIN,
              NODE_RADIUS_MAX
            );

            const isDimmed = dimmedNodes.has(node.id);
            const isHighlighted = highlightedSkills.includes(node.id);
            const isHovered = hoveredNodeId === node.id;
            const cx = toSvgCoord(node.x);
            const cy = toSvgCoord(node.y);

            return (
              <g key={node.id}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={radius}
                  fill={colour}
                  stroke={isHighlighted ? theme.palette.primary.main : 'none'}
                  strokeWidth={isHighlighted ? 2 : 0}
                  opacity={isDimmed ? 0.2 : 1}
                  style={{ cursor: 'pointer' }}
                  role="button"
                  tabIndex={0}
                  aria-label={node.id}
                  onClick={(event) => handleNodeClick(node.id, event)}
                  onKeyDown={(event) => handleNodeKeyDown(node.id, event)}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                />
                {isHovered && (
                  <text
                    x={cx}
                    y={cy - radius - 4}
                    textAnchor="middle"
                    fontSize={11}
                    fill={theme.palette.text.primary}
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {node.id}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </Box>

      {/* Popover anchored to clicked node circle */}
      <Popover
        open={popoverNodeId !== null}
        anchorEl={popoverAnchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
        transformOrigin={{ vertical: 'center', horizontal: 'left' }}
        transitionDuration={prefersReducedMotion ? 0 : 'auto'}
      >
        {popoverSkill !== undefined && <SkillTooltipContent skill={popoverSkill} />}
      </Popover>

      {/* Legend */}
      <Box
        aria-hidden="true"
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          rowGap: 1.5,
          columnGap: 3,
        }}
      >
        {legendCategories.map((category) => (
          <Box key={category.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CategoryColourDot colour={resolveSkillColourMain(category.colour, theme)} />
            <Typography variant="caption" color="text.secondary">
              {category.name}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Accessible text alternative for screen readers */}
      <Box component="table" sx={visuallyHidden} aria-label="Skills co-occurrence data table">
        <caption>Skills and their co-occurring skill relationships</caption>
        <thead>
          <tr>
            <th scope="col">Skill</th>
            <th scope="col">Co-occurring skills</th>
            <th scope="col">Occurrences</th>
          </tr>
        </thead>
        <tbody>
          {nodes.map((node) => (
            <tr key={node.id}>
              <td>{node.id}</td>
              <td>{(coOccurringByNode.get(node.id) ?? []).join(', ')}</td>
              <td>{node.occurrences}</td>
            </tr>
          ))}
        </tbody>
      </Box>
    </Stack>
  );
};
