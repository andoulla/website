import { wrapText } from './wrapText';

const LABEL_MIN_WIDTH = 48;
const LABEL_MIN_HEIGHT = 28;
const CELL_PADDING_X = 6;
const TEXT_FONT_SIZE = 11;
const TEXT_LINE_HEIGHT = 14;
const YEARS_FONT_SIZE = 10;
const YEARS_LINE_HEIGHT = 13;
const YEARS_GAP = 4;

type CellRenderProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  value: number;
};

// Module-level: avoids react/prop-types false positives; named fn so Recharts reads .name.
export const makeCellRenderer = (
  colourByName: Map<string, string>,
  patternIdByName: Map<string, string> | null,
  textColour: string,
  categoryIdByName: Map<string, string>,
  highlightedCategoryId: string | null
) =>
  function CellRenderer(rawProps: unknown): React.ReactElement {
    const { x, y, width, height, name, value } = rawProps as CellRenderProps;

    if (width <= 0 || height <= 0) return <g />;

    const colour = colourByName.get(name) ?? '#9e9e9e';
    const patternId = patternIdByName?.get(name);
    const fill = patternId !== undefined ? `url(#${patternId})` : colour;
    // Legend tap-to-highlight: dim every cell outside the selected category.
    const isDimmed =
      highlightedCategoryId !== null && categoryIdByName.get(name) !== highlightedCategoryId;

    const showName = width >= LABEL_MIN_WIDTH && height >= LABEL_MIN_HEIGHT;
    const lines = showName ? wrapText(name, width - CELL_PADDING_X * 2) : [];
    const nameBlockHeight = lines.length * TEXT_LINE_HEIGHT;
    const showYears = showName && height >= nameBlockHeight + YEARS_GAP + YEARS_LINE_HEIGHT + 8;

    const label = value === 1 ? '1 yr' : `${value.toFixed(1)} yrs`;
    const totalContentHeight = nameBlockHeight + (showYears ? YEARS_GAP + YEARS_LINE_HEIGHT : 0);
    const contentStartY = y + (height - totalContentHeight) / 2 + TEXT_LINE_HEIGHT;

    return (
      <g opacity={isDimmed ? 0.25 : 1} style={{ transition: 'opacity 0.2s ease' }}>
        <rect x={x + 1} y={y + 1} width={width - 2} height={height - 2} fill={fill} rx={3} />
        {showName &&
          lines.map((line, lineIndex) => (
            <text
              key={`${name}-${lineIndex}`}
              x={x + CELL_PADDING_X}
              y={contentStartY + lineIndex * TEXT_LINE_HEIGHT}
              fontSize={TEXT_FONT_SIZE}
              fontWeight={600}
              fill={textColour}
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {line}
            </text>
          ))}
        {showYears && (
          <text
            x={x + CELL_PADDING_X}
            y={contentStartY + nameBlockHeight + YEARS_GAP}
            fontSize={YEARS_FONT_SIZE}
            fill={textColour}
            opacity={0.8}
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            {label}
          </text>
        )}
      </g>
    );
  };
