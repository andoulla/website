import type { Skill } from './skills.types';
import skillsData from './skills.json';

export const skills = skillsData as unknown as Skill[];
