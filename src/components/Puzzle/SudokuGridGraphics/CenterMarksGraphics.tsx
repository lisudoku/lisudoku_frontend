import { ReactElement } from 'react'
import { isEmpty, sortBy } from 'lodash-es'
import classNames from 'classnames'
import { CellMarks, Grid } from 'src/types/sudoku'
import { CellMarkSets } from 'src/utils/sudoku'
import { SudokuConstraints } from 'lisudoku-solver'
import { useCellMarkErrors } from '../hooks/useCellMarkErrors'

const computeCenterMarksFontSize = (cellSize: number, markCount: number): number => {
  // markCount * fontWidth = cellSize - padding
  // fontWidth = fontSize * 2 / 3
  // => markCount * fontSize * 2 / 3 = cellSize - padding
  // fontSize = (cellSize - padding) / markCount * 3 / 2
  const padding = cellSize / 7
  return (cellSize - padding) / Math.max(3, markCount) * 3 / 2
}

const CellCenterMarksGraphics = ({ row, col, centerMarks, cellMarksErrors, cellSize }: CellCenterMarksGraphicsProps) => {
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
        <tspan key={value} className={classNames({'fill-digit-error': cellMarksErrors?.centerMarks?.has(value) })}>
          {value}
        </tspan>
      ))}
    </text>
  )
}

type CellCenterMarksGraphicsProps = {
  row: number
  col: number
  centerMarks: number[]
  cellMarksErrors?: CellMarkSets
  cellSize: number
}

const CenterMarksGraphics = ({ cellSize, constraints, cellMarks, grid, fixedNumbersGrid, checkErrors }: centerMarksGraphicsProps) => {
  const cellMarksErrors: CellMarkSets[][] = useCellMarkErrors(checkErrors, constraints, grid, cellMarks)

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
          cellMarksErrors={checkErrors ? cellMarksErrors[row][col] : undefined}
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

type centerMarksGraphicsProps = {
  constraints: SudokuConstraints
  cellMarks?: CellMarks[][]
  grid?: Grid
  fixedNumbersGrid: Grid
  cellSize: number
  checkErrors: boolean
}

export default CenterMarksGraphics
