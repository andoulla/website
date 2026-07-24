import { useMemo } from 'react';

import { deriveSkillCoOccurrence } from '@/utils/deriveSkillCoOccurrence';
import { SkillsEmptyState } from '@/views/skills/skillsEmptyState';
import { SkillsNoData } from '@/views/skills/skillsNoData';

import { useSkillsCareerContext } from '../SkillsCareerContext';
import { useSkillsViewContext } from '../SkillsViewContext';

import { SkillsNetworkGraph } from './skillsNetworkGraph';

export const SkillsNetworkView = () => {
  const {
    skills,
    filteredSkills,
    searchTerm,
    selectedCategories,
    selectedSubCategories,
    highlightedSkills,
    onClearFilters,
  } = useSkillsViewContext();
  const careerHistory = useSkillsCareerContext();

  const coOccurrence = useMemo(() => deriveSkillCoOccurrence(careerHistory), [careerHistory]);

  // Names present in the active track.
  const activeSkillNames = useMemo(() => new Set(skills.map((skill) => skill.skill)), [skills]);

  // If categories are selected, further restrict to only those category's skills.
  const categoryRestrictedNames = useMemo(() => {
    if (selectedCategories.length === 0) return activeSkillNames;

    return new Set(
      skills
        .filter((skill) => selectedCategories.includes(skill.categoryId))
        .map((skill) => skill.skill)
    );
  }, [skills, selectedCategories, activeSkillNames]);

  const filteredNodes = useMemo(
    () => coOccurrence.nodes.filter((node) => categoryRestrictedNames.has(node.id)),
    [coOccurrence, categoryRestrictedNames]
  );

  const filteredNodeNames = useMemo(
    () => new Set(filteredNodes.map((node) => node.id)),
    [filteredNodes]
  );

  const filteredEdges = useMemo(
    () =>
      coOccurrence.edges.filter(
        (edge) => filteredNodeNames.has(edge.source) && filteredNodeNames.has(edge.target)
      ),
    [coOccurrence, filteredNodeNames]
  );

  // Nodes that don't match the search term are dimmed (not removed).
  const dimmedNodes = useMemo(() => {
    if (searchTerm === '') return new Set<string>();

    const searchMatchNames = new Set(filteredSkills.map((skill) => skill.skill));

    return new Set(
      filteredNodes.filter((node) => !searchMatchNames.has(node.id)).map((node) => node.id)
    );
  }, [searchTerm, filteredSkills, filteredNodes]);

  if (skills.length === 0) return <SkillsNoData />;

  if (filteredNodes.length === 0) {
    return (
      <SkillsEmptyState
        hasActiveFilters={selectedCategories.length > 0 || selectedSubCategories.length > 0}
        onClearFilters={onClearFilters}
      />
    );
  }

  return (
    <SkillsNetworkGraph
      nodes={filteredNodes}
      edges={filteredEdges}
      skills={skills}
      dimmedNodes={dimmedNodes}
      highlightedSkills={highlightedSkills}
    />
  );
};
