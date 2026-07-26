// Textures for colour-blind/low-vision users, layered on top of category colour.
export type CategoryPatternType =
  | 'diagonal'
  | 'crosshatch'
  | 'dots'
  | 'vertical'
  | 'grid'
  | 'horizontal'
  | 'rings';

// Fixed assignment order, cycled by category position in the track file — mirrors
// CATEGORY_COLOUR_PALETTE's index-based assignment.
export const CATEGORY_PATTERN_ORDER: CategoryPatternType[] = [
  'diagonal',
  'crosshatch',
  'dots',
  'vertical',
  'grid',
  'horizontal',
  'rings',
];

interface PatternLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  strokeWidth: number;
}

export interface CategoryPatternShapeDefinition {
  width: number;
  height: number;
  patternTransform?: string;
  lines: PatternLine[];
  circle?: { cx: number; cy: number; r: number };
  ring?: { cx: number; cy: number; r: number; strokeWidth: number };
}

export const CATEGORY_PATTERN_SHAPE_DEFINITIONS: Record<
  CategoryPatternType,
  CategoryPatternShapeDefinition
> = {
  diagonal: {
    width: 8,
    height: 8,
    patternTransform: 'rotate(45)',
    lines: [{ x1: 2, y1: 0, x2: 2, y2: 8, strokeWidth: 2 }],
  },
  vertical: {
    width: 8,
    height: 8,
    lines: [{ x1: 4, y1: 0, x2: 4, y2: 8, strokeWidth: 2 }],
  },
  horizontal: {
    width: 8,
    height: 8,
    lines: [{ x1: 0, y1: 4, x2: 8, y2: 4, strokeWidth: 2 }],
  },
  crosshatch: {
    width: 8,
    height: 8,
    lines: [
      { x1: 0, y1: 0, x2: 8, y2: 8, strokeWidth: 1.5 },
      { x1: 8, y1: 0, x2: 0, y2: 8, strokeWidth: 1.5 },
    ],
  },
  dots: {
    width: 6,
    height: 6,
    lines: [],
    circle: { cx: 3, cy: 3, r: 1.5 },
  },
  rings: {
    width: 8,
    height: 8,
    lines: [],
    ring: { cx: 4, cy: 4, r: 2.25, strokeWidth: 1.5 },
  },
  grid: {
    width: 8,
    height: 8,
    lines: [
      { x1: 0, y1: 4, x2: 8, y2: 4, strokeWidth: 1.5 },
      { x1: 4, y1: 0, x2: 4, y2: 8, strokeWidth: 1.5 },
    ],
  },
};

export const CATEGORY_PATTERN_CSS_BACKGROUND: Record<
  CategoryPatternType,
  (colour: string, markColour: string) => string
> = {
  diagonal: (colour, markColour) =>
    `repeating-linear-gradient(45deg, ${markColour} 0, ${markColour} 1px, transparent 1px, transparent 4px), ${colour}`,
  vertical: (colour, markColour) =>
    `repeating-linear-gradient(90deg, ${markColour} 0, ${markColour} 1px, transparent 1px, transparent 4px), ${colour}`,
  horizontal: (colour, markColour) =>
    `repeating-linear-gradient(0deg, ${markColour} 0, ${markColour} 1px, transparent 1px, transparent 4px), ${colour}`,
  crosshatch: (colour, markColour) =>
    `repeating-linear-gradient(45deg, ${markColour} 0, ${markColour} 1px, transparent 1px, transparent 5px), ` +
    `repeating-linear-gradient(-45deg, ${markColour} 0, ${markColour} 1px, transparent 1px, transparent 5px), ${colour}`,
  dots: (colour, markColour) =>
    `radial-gradient(${markColour} 30%, transparent 30%) 0 0 / 6px 6px, ${colour}`,
  rings: (colour, markColour) =>
    `radial-gradient(circle, transparent 1.5px, ${markColour} 1.5px 2.5px, transparent 2.5px) 0 0 / 8px 8px, ${colour}`,
  grid: (colour, markColour) =>
    `repeating-linear-gradient(0deg, ${markColour} 0, ${markColour} 1px, transparent 1px, transparent 5px), ` +
    `repeating-linear-gradient(90deg, ${markColour} 0, ${markColour} 1px, transparent 1px, transparent 5px), ${colour}`,
};
