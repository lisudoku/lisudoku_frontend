import { ReactElement } from 'react'
import { isEmpty, sortBy } from 'lodash-es'
import classNames from 'classnames'
import { CellMarks, Grid } from 'src/types/sudoku'
import { CellMarkSets } from 'src/utils/sudoku'
import { SudokuConstraints } from 'lisudoku-solver'
import { useCellMarkErrors } from '../hooks/useCellMarkErrors'

const CORNER_POSITIONS = [ 1, 3, 7, 9, 2, 8, 4, 6, 5 ]

const computeCornerMarksFontSize = (cellSize: number) => (
  cellSize * 3 / 14
)

const CellCornerMarksGraphics = ({ row, col, cornerMarks, cellMarksErrors, cellSize, killerActive, cellClassName, cellStyle }: CellCornerMarksGraphicsProps) => {
  const marksPaddingX = (killerActive ? 3 : 0)
  const marksPaddingY = (killerActive ? 16 : 0)
  const marksFontSize = computeCornerMarksFontSize(cellSize)
  const marksFontWidth = marksFontSize * 2 / 3
  const marksWidth = cellSize - marksPaddingX * 2
  const marksHeight = cellSize - marksPaddingY * 2
  const marksColumnWidth = marksWidth / 3
  const marksColumnHeight = marksHeight / 3

  return (
    <>
      {sortBy(cornerMarks).map((value, index) => {
        const hasError = cellMarksErrors?.cornerMarks?.has(value) ?? false
        const markRow = Math.floor((CORNER_POSITIONS[index] - 1) / 3)
        const markCol = (CORNER_POSITIONS[index] - 1) % 3
        const x = col * cellSize + 1 + markCol * marksColumnWidth + marksPaddingX + marksColumnWidth / 2 - marksFontWidth / 2
        const y = row * cellSize + markRow * marksColumnHeight + marksPaddingY + marksFontSize + marksColumnHeight / 2 - marksFontSize / 2

        return (
          <text
            x={x}
            y={y}
            className={classNames(cellClassName, {'fill-digit-error': hasError })}
            style={{
              fontSize: marksFontSize,
              ...cellStyle,
            }}
            key={value}
          >
            {value}
          </text>
        )
      })}
    </>
  )
}

type CellCornerMarksGraphicsProps = {
  row: number
  col: number
  cornerMarks: number[]
  cellMarksErrors?: CellMarkSets
  cellSize: number
  killerActive: boolean
  cellClassName?: string
  cellStyle?: React.CSSProperties
}

const CornerMarksGraphics = ({ cellSize, constraints, cellMarks, grid, fixedNumbersGrid, killerActive, checkErrors }: CornerMarksGraphicsProps) => {
  const cellMarksErrors: CellMarkSets[][] = useCellMarkErrors(checkErrors, constraints, grid, cellMarks)
  const marksFontSize = computeCornerMarksFontSize(cellSize)

  if (!cellMarks) {
    return null
  }

  const cornerMarkElements: ReactElement[] = []
  cellMarks.forEach((rowCellMarks, row) => {
    rowCellMarks.forEach((colCellMarks, col) => {
      const value = fixedNumbersGrid[row][col] || grid?.[row][col]
      if (value) {
        return
      }
      if (isEmpty(colCellMarks.cornerMarks)) {
        return
      }
      cornerMarkElements.push(
        <CellCornerMarksGraphics
          row={row}
          col={col}
          cornerMarks={colCellMarks.cornerMarks!}
          cellMarksErrors={checkErrors ? cellMarksErrors[row][col] : undefined}
          killerActive={killerActive}
          cellSize={cellSize}
          key={col + row * rowCellMarks.length}
        />
      )
    })
  })

  return (
    <g className="corner-marks fill-digit-pencil stroke-none font-bold" style={{ fontSize: marksFontSize }}>
      {cornerMarkElements}
    </g>
  )
}

type CornerMarksGraphicsProps = {
  constraints: SudokuConstraints
  cellMarks?: CellMarks[][]
  grid?: Grid
  fixedNumbersGrid: Grid
  cellSize: number
  killerActive: boolean
  checkErrors: boolean
}

export { CornerMarksGraphics, CellCornerMarksGraphics }
