export interface TimelineEvent {
  id: string;
  type: 'work' | 'education' | 'other';
  companyName: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string | null;
  responsibilities: string[];
}
