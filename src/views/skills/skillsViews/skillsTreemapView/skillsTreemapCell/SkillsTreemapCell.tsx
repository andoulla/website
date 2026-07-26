type SkillsTreemapCellProps = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  size?: number;
  colour?: string;
  [key: string]: unknown;
};

export const SkillsTreemapCell = ({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  name = '',
  size = 0,
  colour = 'transparent',
}: SkillsTreemapCellProps) => {
  if (width < 2 || height < 2 || name === '') return null;

  const showLabel = width > 55 && height > 30;
  const showYears = width > 55 && height > 52;
  const labelY = y + height / 2 + (showYears ? -8 : 0);

  return (
    <g>
      <rect x={x + 1} y={y + 1} width={width - 2} height={height - 2} fill={colour} rx={3} />
      {showLabel && (
        <text
          x={x + width / 2}
          y={labelY}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={Math.min(12, (width / name.length) * 1.6)}
          fill="white"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {name}
        </text>
      )}
      {showYears && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 9}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={10}
          fill="rgba(255,255,255,0.75)"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {`${size}y`}
        </text>
      )}
    </g>
  );
};
