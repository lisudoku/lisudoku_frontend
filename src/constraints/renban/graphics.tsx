import type { Renban } from 'lisudoku-solver'
import { ConstraintDefinition } from '../types'

interface RenbanGraphicProps {
  renban: Renban
  cellSize: number
}

const RenbanGraphic = ({ renban, cellSize }: RenbanGraphicProps) => {
  const half = cellSize / 2
  const strokeWidth = cellSize / 8

  const points = renban.map((cell) => {
    let x: number = cell.col * cellSize + half + 1
    let y: number = cell.row * cellSize + half + 1
    return `${x},${y}`
  }).join(' ')

  return (
    <polyline
      points={points}
      style={{
        strokeWidth,
        strokeLinecap: 'round',
      }}
    />
  )
}

export const renbanGraphics: ConstraintDefinition['graphics'] = ({
  constraints, cellSize,
}) => (
  // Note: Reusing thermo stroke color
  <g className="renbans fill-none stroke-thermo opacity-60">
    {(constraints.renbans ?? []).map((renban, index) => (
      <RenbanGraphic
        key={index}
        renban={renban}
        cellSize={cellSize}
      />
    ))}
  </g>
)
