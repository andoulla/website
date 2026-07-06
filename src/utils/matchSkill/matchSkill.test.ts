import { Skill } from '@/testing';

import { matchSkill } from './matchSkill';

const REACT = new Skill().name('React').synonyms(['ReactJS', 'React.js']).jobIds(['job-1']).mock();
const RTL = new Skill()
  .name('React Testing Library')
  .subCategory('testing')
  .synonyms(['RTL'])
  .jobIds(['job-1'])
  .mock();
const JAVASCRIPT = new Skill()
  .name('JavaScript')
  .synonyms(['JS', 'ECMAScript'])
  .jobIds(['job-1'])
  .mock();
const ACCESSIBILITY = new Skill()
  .name('Accessibility')
  .subCategory('accessibility')
  .synonyms(['a11y', 'A11Y'])
  .jobIds(['job-1'])
  .mock();
const GIT = new Skill()
  .name('Git/GitHub')
  .subCategory('tooling')
  .synonyms(['Git', 'GitHub'])
  .jobIds(['job-1'])
  .mock();

const ALL_SKILLS = [REACT, RTL, JAVASCRIPT, ACCESSIBILITY, GIT];

describe('matchSkill', () => {
  test('matches an exact canonical name', () => {
    expect(matchSkill('React', ALL_SKILLS)).toEqual({
      skill: REACT,
      matchedOn: 'name',
      matchedTerm: 'React',
    });
  });

  test('matches a name case-insensitively', () => {
    expect(matchSkill('javascript', ALL_SKILLS)?.skill).toEqual(JAVASCRIPT);
  });

  test('trims leading/trailing whitespace', () => {
    expect(matchSkill('  React  ', ALL_SKILLS)?.skill).toEqual(REACT);
  });

  test('matches a synonym', () => {
    expect(matchSkill('RTL', ALL_SKILLS)).toEqual({
      skill: RTL,
      matchedOn: 'synonym',
      matchedTerm: 'RTL',
    });
  });

  test('matches punctuation/case variants of the same term identically', () => {
    expect(matchSkill('React.js', ALL_SKILLS)?.skill).toEqual(REACT);
    expect(matchSkill('ReactJS', ALL_SKILLS)?.skill).toEqual(REACT);
    expect(matchSkill('React JS', ALL_SKILLS)?.skill).toEqual(REACT);
  });

  test('matches an acronym synonym without matching an unrelated substring', () => {
    expect(matchSkill('JS', ALL_SKILLS)?.skill).toEqual(JAVASCRIPT);
    expect(matchSkill('Java', ALL_SKILLS)).toBeNull();
  });

  test('matches each half of a compound name independently', () => {
    expect(matchSkill('Git', ALL_SKILLS)?.skill).toEqual(GIT);
    expect(matchSkill('GitHub', ALL_SKILLS)?.skill).toEqual(GIT);
  });

  test('is case-insensitive for mixed-case acronyms', () => {
    expect(matchSkill('a11y', ALL_SKILLS)?.skill).toEqual(ACCESSIBILITY);
    expect(matchSkill('A11Y', ALL_SKILLS)?.skill).toEqual(ACCESSIBILITY);
  });

  test('returns null for an unknown term', () => {
    expect(matchSkill('Rust', ALL_SKILLS)).toBeNull();
  });

  test('returns null for an empty or whitespace-only term', () => {
    expect(matchSkill('', ALL_SKILLS)).toBeNull();
    expect(matchSkill('   ', ALL_SKILLS)).toBeNull();
  });

  test('prefers a canonical name match over a colliding synonym on another skill', () => {
    const decoy = new Skill().name('Decoy').synonyms(['React']).jobIds(['job-1']).mock();

    expect(matchSkill('React', [decoy, REACT])?.skill).toEqual(REACT);
  });

  test('defaults to the real skills dataset when no skills list is provided', () => {
    expect(matchSkill('React')?.skill.name).toBe('React');
  });
});
