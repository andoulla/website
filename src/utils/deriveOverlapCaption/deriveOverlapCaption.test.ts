import type { TimelineEventWithRecommendations } from '@/types';

import { deriveOverlapCaption } from './deriveOverlapCaption';

describe('deriveOverlapCaption', () => {
  const baseEvent: TimelineEventWithRecommendations = {
    id: 'test-job',
    type: 'work',
    companyName: 'Test Company',
    title: 'Engineer',
    location: 'Remote',
    startDate: '2023-01-01',
    endDate: '2024-12-31',
    responsibilities: [],
    recommendations: [],
    techStack: [],
    skills: [],
  };

  const internship: TimelineEventWithRecommendations = {
    id: 'test-internship',
    type: 'internship',
    companyName: 'Intern Corp',
    title: 'Intern',
    location: 'Remote',
    startDate: '2023-06-01',
    endDate: '2023-08-01',
    responsibilities: [],
    recommendations: [],
    techStack: [],
    skills: [],
  };

  it('returns undefined for non-internship events', () => {
    const caption = deriveOverlapCaption(baseEvent, [baseEvent]);

    expect(caption).toBeUndefined();
  });

  it('returns undefined when no overlap exists', () => {
    const noOverlapEvent: TimelineEventWithRecommendations = {
      ...baseEvent,
      id: 'no-overlap-internship',
      type: 'internship',
      startDate: '2025-01-01',
      endDate: '2025-02-01',
    };
    const caption = deriveOverlapCaption(noOverlapEvent, [baseEvent]);

    expect(caption).toBeUndefined();
  });

  it('returns caption with overlapping company name', () => {
    const caption = deriveOverlapCaption(internship, [baseEvent, internship]);

    expect(caption).toBe('Alongside Test Company');
  });

  it('ignores other internships when computing overlap', () => {
    const otherInternship: TimelineEventWithRecommendations = {
      ...internship,
      id: 'other-internship',
      companyName: 'Other Intern',
    };
    const caption = deriveOverlapCaption(internship, [baseEvent, internship, otherInternship]);

    expect(caption).toBe('Alongside Test Company');
  });

  it('joins multiple overlapping non-internship events', () => {
    const otherJob: TimelineEventWithRecommendations = {
      ...baseEvent,
      id: 'other-job',
      companyName: 'Other Company',
      startDate: '2023-05-01',
      endDate: '2023-09-01',
    };
    const caption = deriveOverlapCaption(internship, [baseEvent, otherJob, internship]);

    expect(caption).toBe('Alongside Test Company, Other Company');
  });

  it('handles ongoing events (endDate === null)', () => {
    const ongoingJob: TimelineEventWithRecommendations = {
      ...baseEvent,
      id: 'ongoing-job',
      endDate: null,
    };
    const caption = deriveOverlapCaption(internship, [ongoingJob, internship]);

    expect(caption).toBe('Alongside Test Company');
  });
});
