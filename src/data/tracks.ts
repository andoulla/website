import type { Track, TrackId } from '@/types';

import { skills } from './skills';
import leadTrackData from './tracks/lead.json';
import fullTrackData from './tracks/full.json';
import seniorEngineerTrackData from './tracks/senior-engineer.json';

export const TRACK_IDS: TrackId[] = ['full', 'lead', 'senior-engineer'];

export const isTrackId = (value: string): value is TrackId =>
  (TRACK_IDS as string[]).includes(value);

const knownSkillIds = new Set(skills.map((skill) => skill.id));

// Raw JSON shape before validation — id stays a plain string until isTrackId narrows it.
interface RawSubCategory {
  id: string;
  name: string;
  skillIds: string[];
}

interface RawCategory {
  id: string;
  name: string;
  subCategories: RawSubCategory[];
}

interface RawTrack {
  id: string;
  label: string;
  categories: RawCategory[];
}

const toTrack = (rawTrack: RawTrack, fileName: string): Track => {
  const { id, label, categories } = rawTrack;

  if (!isTrackId(id)) {
    throw new Error(`${fileName}: unrecognised track id "${id}"`);
  }

  const seenCategoryIds = new Set<string>();
  const seenSubCategoryIds = new Set<string>();
  const seenSkillIds = new Set<string>();

  categories.forEach((category) => {
    if (seenCategoryIds.has(category.id)) {
      throw new Error(`${fileName}: duplicate category id "${category.id}"`);
    }
    seenCategoryIds.add(category.id);

    category.subCategories.forEach((subCategory) => {
      if (seenSubCategoryIds.has(subCategory.id)) {
        throw new Error(`${fileName}: duplicate subCategory id "${subCategory.id}"`);
      }
      seenSubCategoryIds.add(subCategory.id);

      subCategory.skillIds.forEach((skillId) => {
        if (!knownSkillIds.has(skillId)) {
          throw new Error(
            `${fileName}: unknown skillId "${skillId}" in subCategory "${subCategory.id}"`
          );
        }
        if (seenSkillIds.has(skillId)) {
          throw new Error(`${fileName}: skillId "${skillId}" appears more than once`);
        }
        seenSkillIds.add(skillId);
      });
    });
  });

  return { id, label, categories };
};

const leadTrack = toTrack(leadTrackData, 'tracks/lead.json');
const seniorEngineerTrack = toTrack(seniorEngineerTrackData, 'tracks/senior-engineer.json');
const fullTrack = toTrack(fullTrackData, 'tracks/full.json');

// "Full shows everything" is a data invariant, not a rendering special case: every skill in
// skills.json must appear somewhere in the full track.
const fullTrackSkillIds = new Set(
  fullTrack.categories.flatMap((category) =>
    category.subCategories.flatMap((subCategory) => subCategory.skillIds)
  )
);

skills.forEach((skill) => {
  if (!fullTrackSkillIds.has(skill.id)) {
    throw new Error(`tracks/full.json: skill "${skill.id}" missing from the full track`);
  }
});

// Tab display order.
export const tracks: Track[] = [fullTrack, leadTrack, seniorEngineerTrack];

const seenTrackIds = new Set<string>();

tracks.forEach((track) => {
  if (seenTrackIds.has(track.id)) {
    throw new Error(`tracks: duplicate track id "${track.id}"`);
  }
  seenTrackIds.add(track.id);
});
