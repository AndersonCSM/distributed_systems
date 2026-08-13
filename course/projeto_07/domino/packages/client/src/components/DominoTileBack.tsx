interface DominoTileBackProps {
  orientation?: 'horizontal' | 'vertical'
  size?: 'sm' | 'md' | 'lg'
}

const SIZES = {
  sm: { width: 30, height: 60 },
  md: { width: 40, height: 80 },
  lg: { width: 50, height: 100 },
}

export default function DominoTileBack({
  orientation = 'vertical',
  size = 'sm',
}: DominoTileBackProps) {
  const { width: baseW, height: baseH } = SIZES[size]

  const isHorizontal = orientation === 'horizontal'
  const svgWidth = isHorizontal ? baseH : baseW
  const svgHeight = isHorizontal ? baseW : baseH

  const rx = baseW * 0.1
  const strokeWidth = 1.5

  return (
    <div className="inline-block">
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id={`back-pattern-${size}-${orientation}`}
            patternUnits="userSpaceOnUse"
            width="8"
            height="8"
            patternTransform="rotate(45)"
          >
            <line x1="0" y1="0" x2="0" y2="8" stroke="#5c3d2e" strokeWidth="1.5" />
          </pattern>
        </defs>

        <rect
          x={strokeWidth / 2}
          y={strokeWidth / 2}
          width={svgWidth - strokeWidth}
          height={svgHeight - strokeWidth}
          rx={rx}
          ry={rx}
          fill="#3d2b1f"
          stroke="#5c3d2e"
          strokeWidth={strokeWidth}
        />

        <rect
          x={strokeWidth / 2}
          y={strokeWidth / 2}
          width={svgWidth - strokeWidth}
          height={svgHeight - strokeWidth}
          rx={rx}
          ry={rx}
          fill={`url(#back-pattern-${size}-${orientation})`}
          opacity={0.3}
        />

        <rect
          x={svgWidth * 0.2}
          y={svgHeight * 0.15}
          width={svgWidth * 0.6}
          height={svgHeight * 0.7}
          rx={rx * 0.5}
          fill="none"
          stroke="#a67c00"
          strokeWidth={0.8}
          opacity={0.4}
        />
      </svg>
    </div>
  )
}
