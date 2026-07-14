import type { Responsibility as ResponsibilityType } from '@/types';

import { defaultResponsibility } from './Responsibility.data';

export class Responsibility {
  private data: ResponsibilityType;

  constructor() {
    this.data = { ...defaultResponsibility };
  }

  id(id: string): this {
    this.data = { ...this.data, id };
    return this;
  }

  text(text: string): this {
    this.data = { ...this.data, text };
    return this;
  }

  skillIds(skillIds: string[]): this {
    this.data = { ...this.data, skillIds };
    return this;
  }

  mock(): ResponsibilityType {
    return { ...this.data };
  }
}
