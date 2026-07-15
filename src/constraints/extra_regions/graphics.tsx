import type { ConstraintDefinition } from '../types'

export const extraRegionsGraphics: ConstraintDefinition['graphics'] = ({ constraints, cellSize }) => (
  <g className="extra-regions stroke-none fill-extraregion">
    {constraints.extraRegions?.flat().map((cell, index) => (
      <rect
        x={1 + cellSize * cell.col}
        y={1 + cellSize * cell.row}
        width={cellSize}
        height={cellSize}
        key={index}
      />
    ))}
  </g>
)
