import { ReactElement } from 'react'
import { isEmpty, sortBy } from 'lodash-es'
import classNames from 'classnames'
import { CellMarks, Grid } from 'src/types/sudoku'
import { SudokuConstraints } from 'lisudoku-solver'
import { CellErrors } from 'src/constraints/types'

const computeCenterMarksFontSize = (cellSize: number, markCount: number): number => {
  // markCount * fontWidth = cellSize - padding
  // fontWidth = fontSize * 2 / 3
  // => markCount * fontSize * 2 / 3 = cellSize - padding
  // fontSize = (cellSize - padding) / markCount * 3 / 2
  const padding = cellSize / 7
  return (cellSize - padding) / Math.max(3, markCount) * 3 / 2
}

interface CellCenterMarksGraphicsProps {
  row: number
  col: number
  centerMarks: number[]
  errors: CellErrors
  cellSize: number
}

const CellCenterMarksGraphics = ({ row, col, centerMarks, errors, cellSize }: CellCenterMarksGraphicsProps) => {
  const centerMarksFontSize = computeCenterMarksFontSize(cellSize, centerMarks.length)

  const x = col * cellSize + 1 + cellSize / 2
  const y = row * cellSize + 2 + cellSize / 2

  return (
    <text
      x={x}
      y={y}
      style={{
        fontSize: centerMarksFontSize,
      }}
      textAnchor="middle"
      dy="+0.32em"
    >
      {sortBy(centerMarks).map(value => (
        <tspan key={value} className={classNames({'fill-digit-error': errors?.includes(value) })}>
          {value}
        </tspan>
      ))}
    </text>
  )
}

interface CenterMarksGraphicsProps {
  constraints: SudokuConstraints
  cellMarks?: CellMarks[][]
  grid?: Grid
  fixedNumbersGrid: Grid
  cellSize: number
  errorGrid?: CellErrors[][]
}

export const CenterMarksGraphics = ({
  cellSize, cellMarks, grid, fixedNumbersGrid, errorGrid,
}: CenterMarksGraphicsProps) => {
  if (!cellMarks) {
    return null
  }

  const centerMarkElements: ReactElement[] = []
  cellMarks.forEach((rowCellMarks, row) => {
    rowCellMarks.forEach((colCellMarks, col) => {
      const value = fixedNumbersGrid[row][col] || grid?.[row][col]
      if (value) {
        return
      }
      if (isEmpty(colCellMarks.centerMarks)) {
        return
      }
      centerMarkElements.push(
        <CellCenterMarksGraphics
          row={row}
          col={col}
          centerMarks={colCellMarks.centerMarks!}
          errors={errorGrid?.[row][col]}
          cellSize={cellSize}
          key={col + row * rowCellMarks.length}
        />
      )
    })
  })

  return (
    <g className="center-marks fill-digit-pencil stroke-none">
      {centerMarkElements}
    </g>
  )
}
