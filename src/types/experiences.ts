import type { Recommendation } from './recommendation';
import type { WorkExperience } from './workExperience';

export interface WorkExperienceWithRecommendations extends WorkExperience {
  recommendations: Recommendation[];
}
