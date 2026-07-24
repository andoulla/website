import type { Track as TrackType, TrackId } from '@/types';

import { defaultTrack } from './Track.data';

export class Track {
  private data: TrackType;

  constructor() {
    this.data = { ...defaultTrack };
  }

  id(id: TrackId): this {
    this.data = { ...this.data, id };

    return this;
  }

  label(label: string): this {
    this.data = { ...this.data, label };

    return this;
  }

  categories(categories: TrackType['categories']): this {
    this.data = { ...this.data, categories };

    return this;
  }

  mock(): TrackType {
    return { ...this.data };
  }
}
