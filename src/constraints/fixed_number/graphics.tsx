import classNames from 'classnames'
import { isNil } from 'lodash-es'
import { getAllCells } from 'src/utils/sudoku'
import type { ConstraintDefinition } from '../types'

const getFontHeight = (cellSize: number) => cellSize * 3 / 7

const getFontSize = (cellSize: number) => cellSize * 9 / 14

interface CellDigitProps {
  row: number
  col: number
  value: number | null | undefined
  cellSize: number
  isFixed: boolean
  hasError: boolean
}

const CellDigit = ({ row, col, value, cellSize, isFixed, hasError }: CellDigitProps) => (
  <text
    x={col * cellSize + 1 + cellSize / 2}
    y={row * cellSize + 1 + cellSize / 2 + getFontHeight(cellSize) / 2}
    textAnchor="middle"
    className={classNames({
      'fill-digit-unfixed': !hasError && !isFixed,
      'fill-digit-fixed': !hasError && isFixed,
      'fill-digit-error': hasError,
    })}
  >
    {value}
  </text>
)

export const fixedNumberGraphics: ConstraintDefinition['graphics'] = ({
  gridSize, cellSize, fixedNumbersGrid, grid, errorGrid
}) => (
  <g
    className="digits font-medium stroke-none"
    style={{ fontSize: getFontSize(cellSize) }}
  >
    {getAllCells(gridSize).map(({ row, col }) => {
      const value = fixedNumbersGrid[row][col] || grid?.[row][col]
      if (!value) {
        return null
      }

      return (
        <CellDigit
          key={row * gridSize + col}
          row={row}
          col={col}
          value={value}
          cellSize={cellSize}
          isFixed={!isNil(fixedNumbersGrid[row][col])}
          hasError={Boolean(errorGrid[row][col]?.includes(value))}
        />
      )
    })}
  </g>
)
