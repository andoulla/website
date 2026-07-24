import type { ComponentType, ReactNode } from 'react';

import type { VIEW_MODES } from '@/utils/skillsUrlParams';

export type ViewMode = (typeof VIEW_MODES)[number];

export interface ViewOption {
  icon: ReactNode;
  label: string;
  caption: string;
  Component: ComponentType;
}
