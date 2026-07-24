export type SkillNode = { id: string; occurrences: number };
export type SkillEdge = { source: string; target: string; weight: number };
export type SkillCoOccurrence = { nodes: SkillNode[]; edges: SkillEdge[] };
