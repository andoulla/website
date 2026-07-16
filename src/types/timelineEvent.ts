import type { Responsibility } from './responsibility';

export interface TimelineEvent {
  id: string;
  type: 'work' | 'education' | 'other' | 'internship';
  companyName: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string | null;
  responsibilities: Responsibility[];
}
