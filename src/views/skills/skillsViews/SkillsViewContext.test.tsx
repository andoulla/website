import { render } from '@testing-library/react';

import { SkillSummary, Track } from '@/testing';

import { SkillsViewContextProvider, useSkillsViewContext } from './SkillsViewContext';

const SKILLS = [new SkillSummary().skill('React').years(4).mock()];

const SkillsViewDisplay = () => {
  const {
    track,
    skills,
    filteredSkills,
    selectedCategories,
    selectedSubCategories,
    highlightedSkills,
    searchTerm,
  } = useSkillsViewContext();

  return (
    <>
      <span>{`track:${track.id}`}</span>
      <span>{`skills:${skills.map((skill) => skill.skill).join(',')}`}</span>
      <span>{`filteredSkills:${filteredSkills.map((skill) => skill.skill).join(',') || 'none'}`}</span>
      <span>{`categories:${selectedCategories.join(',') || 'none'}`}</span>
      <span>{`subCategories:${selectedSubCategories.join(',') || 'none'}`}</span>
      <span>{`highlighted:${highlightedSkills.join(',') || 'none'}`}</span>
      <span>{`search:${searchTerm || 'none'}`}</span>
    </>
  );
};

describe('SkillsViewContext', () => {
  test('provides the given values to consumers', () => {
    const screen = render(
      <SkillsViewContextProvider
        track={new Track().mock()}
        skills={SKILLS}
        filteredSkills={SKILLS}
        selectedCategories={['frontend-development']}
        selectedSubCategories={['core-technologies']}
        highlightedSkills={['React']}
        searchTerm="rea"
        onClearFilters={jest.fn()}
      >
        <SkillsViewDisplay />
      </SkillsViewContextProvider>
    );

    expect(screen.getByText('track:full')).toBeVisible();
    expect(screen.getByText('skills:React')).toBeVisible();
    expect(screen.getByText('filteredSkills:React')).toBeVisible();
    expect(screen.getByText('categories:frontend-development')).toBeVisible();
    expect(screen.getByText('subCategories:core-technologies')).toBeVisible();
    expect(screen.getByText('highlighted:React')).toBeVisible();
    expect(screen.getByText('search:rea')).toBeVisible();
  });

  test('defaults to an empty list when not provided, and defaults searchTerm', () => {
    const screen = render(
      <SkillsViewContextProvider
        track={new Track().mock()}
        skills={SKILLS}
        filteredSkills={[]}
        selectedCategories={[]}
        selectedSubCategories={[]}
        searchTerm=""
        onClearFilters={jest.fn()}
      >
        <SkillsViewDisplay />
      </SkillsViewContextProvider>
    );

    expect(screen.getByText('filteredSkills:none')).toBeVisible();
    expect(screen.getByText('categories:none')).toBeVisible();
    expect(screen.getByText('subCategories:none')).toBeVisible();
    expect(screen.getByText('highlighted:none')).toBeVisible();
    expect(screen.getByText('search:none')).toBeVisible();
  });
});
