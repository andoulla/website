import { render } from '@testing-library/react';

import { SkillSummary } from '@/testing';

import { SkillsViewContextProvider, useSkillsViewContext } from './SkillsViewContext';

const SKILLS = [new SkillSummary().skill('React').years(4).mock()];

const SkillsViewDisplay = () => {
  const {
    skills,
    filteredSkills,
    selectedCategories,
    selectedSubCategories,
    highlightedSkills,
    searchTerm,
  } = useSkillsViewContext();

  return (
    <>
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
        skills={SKILLS}
        filteredSkills={SKILLS}
        selectedCategories={['engineering']}
        selectedSubCategories={['development']}
        highlightedSkills={['React']}
        searchTerm="rea"
        onClearFilters={jest.fn()}
      >
        <SkillsViewDisplay />
      </SkillsViewContextProvider>
    );

    expect(screen.getByText('skills:React')).toBeVisible();
    expect(screen.getByText('filteredSkills:React')).toBeVisible();
    expect(screen.getByText('categories:engineering')).toBeVisible();
    expect(screen.getByText('subCategories:development')).toBeVisible();
    expect(screen.getByText('highlighted:React')).toBeVisible();
    expect(screen.getByText('search:rea')).toBeVisible();
  });

  test('defaults to an empty list when not provided, and defaults searchTerm', () => {
    const screen = render(
      <SkillsViewContextProvider
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
