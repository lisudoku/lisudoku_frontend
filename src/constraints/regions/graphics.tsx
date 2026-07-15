import { getAllCells, regionsToRegionGrid } from 'src/utils/sudoku'
import type { ConstraintDefinition } from '../types'
import { Fragment } from 'react'

export const regionsGraphics: ConstraintDefinition['graphics'] = ({ constraints, gridSize, cellSize }) => {
  const regionGrid = regionsToRegionGrid(constraints.gridSize, constraints.regions ?? [])

  return (
    <g className="regions stroke-cell-border-strong">
      {getAllCells(gridSize).map(({ row, col }) => (
        <Fragment key={row * gridSize + col}>
          {/* right border */}
          {col + 1 < gridSize && regionGrid[row][col] !== regionGrid[row][col + 1] && (
            <line
              x1={(col + 1) * cellSize + 1}
              y1={row * cellSize + 1}
              x2={(col + 1) * cellSize + 1}
              y2={(row + 1) * cellSize + 1}
            />
          )}
          {/* bottom border */}
          {row + 1 < gridSize && regionGrid[row][col] !== regionGrid[row + 1][col] && (
            <line
              x1={col * cellSize + 1}
              y1={(row + 1) * cellSize + 1}
              x2={(col + 1) * cellSize + 1}
              y2={(row + 1) * cellSize + 1}
            />
          )}
        </Fragment>
      ))}
    </g>
  )
}
