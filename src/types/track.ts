export type TrackId = 'lead' | 'senior-engineer' | 'general';

interface TrackSubCategory {
  id: string;
  name: string;
  skillIds: string[];
}

interface TrackCategory {
  id: string;
  name: string;
  subCategories: TrackSubCategory[];
}

export interface Track {
  id: TrackId;
  label: string;
  categories: TrackCategory[];
}
