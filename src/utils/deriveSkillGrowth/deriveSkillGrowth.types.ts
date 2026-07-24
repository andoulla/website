export interface SkillGrowthPoint {
  year: number;
  count: number;
}

export interface SkillGrowthMarker {
  year: number;
  companyName: string;
}

export interface SkillGrowth {
  points: SkillGrowthPoint[];
  markers: SkillGrowthMarker[];
}
