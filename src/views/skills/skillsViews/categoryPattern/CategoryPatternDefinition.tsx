import type { PresentCategory } from '@/utils/derivePresentCategories';

import {
  CATEGORY_PATTERN_SHAPE_DEFINITIONS,
  type CategoryPatternShapeDefinition,
} from './categoryPattern.constants';
import { getCategoryPatternId, getCategoryPatternType } from './categoryPattern.helpers';

interface CategoryPatternDefinitionProps {
  category: PresentCategory;
  colour: string;
  markColour: string;
  markOpacity?: number;
}

// SVG <pattern> for a category's fill — mirrors getCategoryPatternBackground's CSS look.
// Rendered inside <defs>, which SVG passes straight through into the chart SVG.
export const CategoryPatternDefinition = ({
  category,
  colour,
  markColour,
  markOpacity = 1,
}: CategoryPatternDefinitionProps) => {
  const id = getCategoryPatternId(category.id);
  const shapeDefinition: CategoryPatternShapeDefinition =
    CATEGORY_PATTERN_SHAPE_DEFINITIONS[getCategoryPatternType(category.index)];
  const { width, height, patternTransform, lines, circle, ring } = shapeDefinition;

  return (
    <pattern
      id={id}
      patternUnits="userSpaceOnUse"
      width={width}
      height={height}
      patternTransform={patternTransform}
    >
      <rect width={width} height={height} fill={colour} />
      {lines.map((line) => (
        <line
          key={`${line.x1}-${line.y1}-${line.x2}-${line.y2}`}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke={markColour}
          strokeWidth={line.strokeWidth}
          strokeOpacity={markOpacity}
        />
      ))}
      {circle !== undefined && (
        <circle
          cx={circle.cx}
          cy={circle.cy}
          r={circle.r}
          fill={markColour}
          fillOpacity={markOpacity}
        />
      )}
      {ring !== undefined && (
        <circle
          cx={ring.cx}
          cy={ring.cy}
          r={ring.r}
          fill="none"
          stroke={markColour}
          strokeWidth={ring.strokeWidth}
          strokeOpacity={markOpacity}
        />
      )}
    </pattern>
  );
};
