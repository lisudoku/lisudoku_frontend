import { Fragment, ReactElement } from 'react'
import { isEmpty, sortBy, uniq } from 'lodash-es'
import classNames from 'classnames'
import { CellMarks, Grid } from 'src/types/sudoku'
import { CellMarkSets, getAllCells } from 'src/utils/sudoku'
import { SudokuConstraints } from 'lisudoku-solver'
import { useCellMarkErrors } from '../hooks/useCellMarkErrors'
import { CustomGraphicsCornerMarks } from './CustomGraphics/CustomGraphics'
import { Theme } from 'src/components/ThemeProvider'

const CORNER_POSITIONS = [ 1, 3, 7, 9, 2, 8, 4, 6, 5 ]

const computeCornerMarksFontSize = (cellSize: number) => (
  cellSize * 3 / 14
)

const CellCornerMarksGraphics = ({
  row, col, cornerMarks, cellMarksErrors, cellSize, killerActive, cellClassName, cellStyle, customGraphicsItem,
}: CellCornerMarksGraphicsProps) => {
  const marksPaddingX = (killerActive ? 3 : 0)
  const marksPaddingY = (killerActive ? 16 : 0)
  const marksFontSize = computeCornerMarksFontSize(cellSize)
  const marksFontWidth = marksFontSize * 2 / 3
  const marksWidth = cellSize - marksPaddingX * 2
  const marksHeight = cellSize - marksPaddingY * 2
  const marksColumnWidth = marksWidth / 3
  const marksColumnHeight = marksHeight / 3
  const half = cellSize / 2
  const radius = Math.floor(half / 4)

  return (
    <>
      {sortBy(cornerMarks).map((value, index) => {
        const hasError = cellMarksErrors?.cornerMarks?.has(value) ?? false
        const markRow = Math.floor((CORNER_POSITIONS[index] - 1) / 3)
        const markCol = (CORNER_POSITIONS[index] - 1) % 3
        const x = col * cellSize + 1 + markCol * marksColumnWidth + marksPaddingX + marksColumnWidth / 2 - marksFontWidth / 2
        const y = row * cellSize + markRow * marksColumnHeight + marksPaddingY + marksFontSize + marksColumnHeight / 2 - marksFontSize / 2
        const hasCustomGraphics = customGraphicsItem !== undefined && customGraphicsItem.values.includes(value)

        return (
          <Fragment key={index}>
            {customGraphicsItem !== undefined && customGraphicsItem.backgroundColor !== undefined && hasCustomGraphics && (
              <circle
                cx={x + marksFontWidth / 2}
                cy={y - marksFontSize / 2 + 2}
                r={radius}
                fill={customGraphicsItem.backgroundColor}
                stroke={customGraphicsItem.backgroundColor}
              />
            )}
            <text
              x={x}
              y={y}
              className={classNames(cellClassName, { 'fill-digit-error': hasError })}
              style={{
                fontSize: marksFontSize,
                ...cellStyle,
                ...(customGraphicsItem !== undefined && hasCustomGraphics ? { fill: customGraphicsItem.color ?? 'white' } : {}),
              }}
            >
              {value}
            </text>
          </Fragment>
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
  customGraphicsItem?: CustomGraphicsCornerMarks
}

const CornerMarksGraphics = ({
  cellSize, constraints, cellMarks, grid, fixedNumbersGrid, killerActive,
  cellMarksErrors, customGraphics, theme,
}: CornerMarksGraphicsProps) => {
  const marksFontSize = computeCornerMarksFontSize(cellSize)

  const cornerMarkElements: ReactElement[] = []
  const emptyCells = getAllCells(constraints.gridSize)
    .filter(({ row, col }) => !fixedNumbersGrid[row][col] && !grid?.[row][col])
  for (const { row, col } of emptyCells) {
    let cornerMarks = cellMarks?.[row][col].cornerMarks ?? []
    let cellCustomGraphics: CustomGraphicsCornerMarks[] = []
    for (const g of customGraphics) {
      if (g.cell.row === row && g.cell.col === col) {
        if (g.showExtraValues) {
          cornerMarks = uniq(cornerMarks.concat(g.values))
        }
        cellCustomGraphics.push(g)
      }
    }
    if (isEmpty(cornerMarks) && isEmpty(cellCustomGraphics)) {
      continue
    }

    cornerMarkElements.push(
      <CellCornerMarksGraphics
        key={col + row * constraints.gridSize}
        row={row}
        col={col}
        cornerMarks={cornerMarks!}
        cellMarksErrors={cellMarksErrors?.[row][col]}
        killerActive={killerActive}
        cellSize={cellSize}
        customGraphicsItem={cellCustomGraphics[0]}
      />
    )
  }

  return (
    <g
      className={classNames('corner-marks fill-digit-pencil stroke-none font-bold', {
        'mix-blend-color-dodge': theme === Theme.Dark,
      })}
      style={{ fontSize: marksFontSize }}
    >
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
  cellMarksErrors: CellMarkSets[][]
  customGraphics: CustomGraphicsCornerMarks[]
  theme: Theme
}

export { CornerMarksGraphics, CellCornerMarksGraphics }
