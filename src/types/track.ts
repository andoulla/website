export type TrackId = 'lead' | 'senior-engineer' | 'general';

export interface TrackSubCategory {
  id: string;
  name: string;
  skillIds: string[];
}

export interface TrackCategory {
  id: string;
  name: string;
  subCategories: TrackSubCategory[];
}

export interface Track {
  id: TrackId;
  label: string;
  categories: TrackCategory[];
}
