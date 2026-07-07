import { render } from '@testing-library/react';

import { Recommendation, SkillSummary } from '@/testing';

import { SkillsViewContextProvider, useSkillsViewContext } from './SkillsViewContext';

const SKILLS = [new SkillSummary().skill('React').years(4).mock()];
const RECOMMENDATIONS = [new Recommendation().authorInitials('A.B.').mock()];

const SkillsViewDisplay = () => {
  const {
    skills,
    recommendations,
    selectedCategories,
    selectedSubCategories,
    highlightedSkill,
    searchTerm,
  } = useSkillsViewContext();

  return (
    <>
      <span>{`skills:${skills.map((skill) => skill.skill).join(',')}`}</span>
      <span>{`recommendations:${recommendations.length}`}</span>
      <span>{`categories:${selectedCategories.join(',') || 'none'}`}</span>
      <span>{`subCategories:${selectedSubCategories.join(',') || 'none'}`}</span>
      <span>{`highlighted:${highlightedSkill ?? 'none'}`}</span>
      <span>{`search:${searchTerm || 'none'}`}</span>
    </>
  );
};

describe('SkillsViewContext', () => {
  test('provides the given values to consumers', () => {
    const screen = render(
      <SkillsViewContextProvider
        skills={SKILLS}
        recommendations={RECOMMENDATIONS}
        selectedCategories={['engineering']}
        selectedSubCategories={['frontend-development']}
        highlightedSkill="React"
        searchTerm="rea"
      >
        <SkillsViewDisplay />
      </SkillsViewContextProvider>
    );

    expect(screen.getByText('skills:React')).toBeVisible();
    expect(screen.getByText('recommendations:1')).toBeVisible();
    expect(screen.getByText('categories:engineering')).toBeVisible();
    expect(screen.getByText('subCategories:frontend-development')).toBeVisible();
    expect(screen.getByText('highlighted:React')).toBeVisible();
    expect(screen.getByText('search:rea')).toBeVisible();
  });

  test('omits highlightedSkill when not provided, and defaults searchTerm', () => {
    const screen = render(
      <SkillsViewContextProvider
        skills={SKILLS}
        recommendations={RECOMMENDATIONS}
        selectedCategories={[]}
        selectedSubCategories={[]}
        searchTerm=""
      >
        <SkillsViewDisplay />
      </SkillsViewContextProvider>
    );

    expect(screen.getByText('categories:none')).toBeVisible();
    expect(screen.getByText('subCategories:none')).toBeVisible();
    expect(screen.getByText('highlighted:none')).toBeVisible();
    expect(screen.getByText('search:none')).toBeVisible();
  });
});
