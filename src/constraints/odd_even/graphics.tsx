import { ConstraintDefinition } from '../types'

export const oddGraphics: ConstraintDefinition['graphics'] = ({
  constraints, cellSize,
}) => {
  const half = cellSize / 2
  const radius = Math.floor(half * 23 / 28)

  return (
    <g className="odd-cells fill-oddeven stroke-none">
      {constraints.oddCells?.map((cell, index) => (
        <circle
          key={index}
          cx={cell.col * cellSize + 1 + half}
          cy={cell.row * cellSize + 1 + half}
          r={radius}
        />
      ))}
    </g>
  )
}

export const evenGraphics: ConstraintDefinition['graphics'] = ({
  constraints, cellSize,
}) => {
  const padding = 7
  const sideLength = cellSize - 2 * padding

  return (
    <g className="even-cells fill-oddeven stroke-none">
      {constraints.evenCells?.map((cell, index) => (
        <rect
          key={index}
          x={1 + cellSize * cell.col + padding}
          y={1 + cellSize * cell.row + padding}
          width={sideLength}
          height={sideLength}
        />
      ))}
    </g>
  )
}
