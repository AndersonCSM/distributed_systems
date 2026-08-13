interface DominoTileProps {
  left: number
  right: number
  id?: string
  isSelected?: boolean
  isPlayable?: boolean
  isDisabled?: boolean
  onClick?: () => void
  orientation?: 'horizontal' | 'vertical'
  size?: 'sm' | 'md' | 'lg'
}

const SIZES = {
  sm: { width: 30, height: 60 },
  md: { width: 40, height: 80 },
  lg: { width: 50, height: 100 },
}

const DOT_POSITIONS: Record<number, [number, number][]> = {
  0: [],
  1: [[0.5, 0.5]],
  2: [[0.2, 0.2], [0.8, 0.8]],
  3: [[0.2, 0.2], [0.5, 0.5], [0.8, 0.8]],
  4: [[0.2, 0.2], [0.8, 0.2], [0.2, 0.8], [0.8, 0.8]],
  5: [[0.2, 0.2], [0.8, 0.2], [0.5, 0.5], [0.2, 0.8], [0.8, 0.8]],
  6: [[0.2, 0.2], [0.8, 0.2], [0.2, 0.5], [0.8, 0.5], [0.2, 0.8], [0.8, 0.8]],
}

function renderDots(
  value: number,
  offsetX: number,
  offsetY: number,
  cellWidth: number,
  cellHeight: number,
  dotRadius: number
) {
  const positions = DOT_POSITIONS[value] || []
  const padding = 0.15

  const innerW = cellWidth * (1 - padding * 2)
  const innerH = cellHeight * (1 - padding * 2)
  const startX = offsetX + cellWidth * padding
  const startY = offsetY + cellHeight * padding

  return positions.map(([px, py], i) => (
    <circle
      key={`${value}-${i}`}
      cx={startX + px * innerW}
      cy={startY + py * innerH}
      r={dotRadius}
      fill="#1c1410"
    />
  ))
}

export default function DominoTile({
  left,
  right,
  isSelected = false,
  isPlayable = false,
  isDisabled = false,
  onClick,
  orientation = 'vertical',
  size = 'md',
}: DominoTileProps) {
  const { width: baseW, height: baseH } = SIZES[size]

  const isHorizontal = orientation === 'horizontal'
  const svgWidth = isHorizontal ? baseH : baseW
  const svgHeight = isHorizontal ? baseW : baseH

  const halfW = svgWidth / 2
  const halfH = svgHeight / 2

  const dotRadius = baseW * 0.08
  const rx = baseW * 0.1
  const strokeWidth = 1.5

  let borderColor = '#5c3d2e'
  if (isSelected) borderColor = '#e8b84a'
  else if (isPlayable) borderColor = '#2d7a3e'

  const containerClasses = [
    'inline-block transition-all duration-200 cursor-default',
    onClick && !isDisabled ? 'cursor-pointer' : '',
    isSelected ? 'drop-shadow-[0_0_12px_rgba(232,184,74,0.5)] -translate-y-1' : '',
    isPlayable && !isSelected ? 'drop-shadow-[0_0_8px_rgba(45,122,62,0.4)]' : '',
    isDisabled ? 'opacity-40' : '',
    onClick && !isDisabled ? 'hover:-translate-y-1 hover:drop-shadow-lg' : '',
  ].filter(Boolean).join(' ')

  const firstHalf = isHorizontal
    ? { x: 0, y: 0, w: halfW, h: svgHeight }
    : { x: 0, y: 0, w: svgWidth, h: halfH }

  const secondHalf = isHorizontal
    ? { x: halfW, y: 0, w: halfW, h: svgHeight }
    : { x: 0, y: halfH, w: svgWidth, h: halfH }

  return (
    <div className={containerClasses} onClick={!isDisabled ? onClick : undefined}>
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x={strokeWidth / 2}
          y={strokeWidth / 2}
          width={svgWidth - strokeWidth}
          height={svgHeight - strokeWidth}
          rx={rx}
          ry={rx}
          fill="#faf6eb"
          stroke={borderColor}
          strokeWidth={strokeWidth}
        />

        {isHorizontal ? (
          <line
            x1={halfW}
            y1={strokeWidth + 2}
            x2={halfW}
            y2={svgHeight - strokeWidth - 2}
            stroke="#3d2b1f"
            strokeWidth={1}
            strokeLinecap="round"
          />
        ) : (
          <line
            x1={strokeWidth + 2}
            y1={halfH}
            x2={svgWidth - strokeWidth - 2}
            y2={halfH}
            stroke="#3d2b1f"
            strokeWidth={1}
            strokeLinecap="round"
          />
        )}

        {renderDots(left, firstHalf.x, firstHalf.y, firstHalf.w, firstHalf.h, dotRadius)}
        {renderDots(right, secondHalf.x, secondHalf.y, secondHalf.w, secondHalf.h, dotRadius)}
      </svg>
    </div>
  )
}
