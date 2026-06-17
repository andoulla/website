import type { WorkExperience } from '../../data/jobs';
import type { Reference } from '../../data/references';

import { joinJobsWithReferences } from './joinJobsWithReferences';

function makeJob(overrides: Partial<WorkExperience> = {}): WorkExperience {
  return {
    id: 'job-1',
    companyName: 'Acme Corp',
    location: 'Remote',
    startDate: '2020-01-01',
    endDate: null,
    responsibilities: [],
    skills: [],
    ...overrides,
  };
}

function makeReference(overrides: Partial<Reference> = {}): Reference {
  return {
    id: 'ref-1',
    jobId: 'job-1',
    authorName: 'Jane Doe',
    authorRole: 'Manager',
    quote: 'Great work.',
    ...overrides,
  };
}

describe('joinJobsWithReferences', () => {
  it('attaches matching references to their job, in original order', () => {
    const jobs = [makeJob({ id: 'job-1' })];
    const references = [
      makeReference({ id: 'ref-1', jobId: 'job-1' }),
      makeReference({ id: 'ref-2', jobId: 'job-1' }),
    ];

    const result = joinJobsWithReferences(jobs, references);

    expect(result).toHaveLength(1);
    expect(result[0].references.map((reference) => reference.id)).toEqual(['ref-1', 'ref-2']);
  });

  it('returns an empty references array when no reference matches', () => {
    const jobs = [makeJob({ id: 'job-3' })];
    const references = [makeReference({ jobId: 'job-1' })];

    const result = joinJobsWithReferences(jobs, references);

    expect(result[0].references).toEqual([]);
  });

  it('does not leak references from one job onto another', () => {
    const jobs = [makeJob({ id: 'job-1' }), makeJob({ id: 'job-2' })];
    const references = [makeReference({ id: 'ref-1', jobId: 'job-1' })];

    const result = joinJobsWithReferences(jobs, references);

    expect(result[0].references.map((reference) => reference.id)).toEqual(['ref-1']);
    expect(result[1].references).toEqual([]);
  });

  it('returns an empty array when there are no jobs', () => {
    expect(joinJobsWithReferences([], [makeReference()])).toEqual([]);
  });

  it('preserves all original job fields', () => {
    const job = makeJob({ companyName: 'Acme Corp', skills: ['React'] });

    const [result] = joinJobsWithReferences([job], []);

    expect(result).toMatchObject({ companyName: 'Acme Corp', skills: ['React'] });
  });
});
