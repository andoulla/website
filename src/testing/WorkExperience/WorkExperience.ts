import type { Recommendation, WorkExperienceWithRecommendations } from '../../types';

import { defaultWorkExperience } from './WorkExperience.data';

export class WorkExperience {
  private data: WorkExperienceWithRecommendations;

  constructor() {
    this.data = { ...defaultWorkExperience };
  }

  id(id: string): this {
    this.data = { ...this.data, id };
    return this;
  }

  companyName(companyName: string): this {
    this.data = { ...this.data, companyName };
    return this;
  }

  location(location: string): this {
    this.data = { ...this.data, location };
    return this;
  }

  startDate(startDate: string): this {
    this.data = { ...this.data, startDate };
    return this;
  }

  endDate(endDate: string | null): this {
    this.data = { ...this.data, endDate };
    return this;
  }

  responsibilities(responsibilities: string[]): this {
    this.data = { ...this.data, responsibilities };
    return this;
  }

  logo(logo: string): this {
    this.data = { ...this.data, logo };
    return this;
  }

  experienceUrl(experienceUrl: string): this {
    this.data = { ...this.data, experienceUrl };
    return this;
  }

  recommendations(recommendations: Recommendation[]): this {
    this.data = { ...this.data, recommendations };
    return this;
  }

  techStack(techStack: string[]): this {
    this.data = { ...this.data, techStack };
    return this;
  }

  skills(skills: string[]): this {
    this.data = { ...this.data, skills };
    return this;
  }

  mock(): WorkExperienceWithRecommendations {
    return { ...this.data };
  }
}
