import _ from 'lodash'
import classNames from 'classnames'
import SudokuConstraintsGraphics from './SudokuConstraintsGraphics'
import ClipLoader from 'react-spinners/ClipLoader'
import { useErrorGrid, useFixedNumbersGrid } from './hooks'
import { Grid, SudokuConstraints } from 'src/types/sudoku'
import { CellPosition } from 'src/types/sudoku'
import { DEFAULT_CELL_SIZE } from 'src/utils/constants'

const isSelected = (rowIndex: number, cellIndex: number, selectedCell?: CellPosition | null) => (
  !_.isNil(selectedCell) && rowIndex === selectedCell.row && cellIndex === selectedCell.col
)

const SudokuGrid = ({
  constraints, grid, notes, selectedCell, checkErrors, loading, onCellClick, cellSize,
}: SudokuGridProps) => {
  const valuesFontSize = cellSize * 9 / 14
  const { fixedNumbers, gridSize } = constraints

  const fixedNumbersGrid = useFixedNumbersGrid(gridSize, fixedNumbers)
  const errorGrid = useErrorGrid(checkErrors, constraints, grid)

  return (
    <div className="cursor-default select-none">
      <div className="relative">
        <div className="w-fit relative border">
          {_.range(gridSize).map(rowIndex => (
            <div key={rowIndex}
                className="flex w-fit">
              {_.range(gridSize).map(cellIndex => (
                <div key={cellIndex}
                     className={classNames(`flex justify-center items-center border-solid border-gray-600 border`, {
                       'bg-gray-700': isSelected(rowIndex, cellIndex, selectedCell),
                     })}
                     style={{
                       width: cellSize + 'px',
                       height: cellSize + 'px',
                     }}
                     onClick={() => onCellClick?.({ row: rowIndex, col: cellIndex })}
                >
                  <div style={{ fontSize: valuesFontSize }} className={classNames('font-medium', {
                    'text-red-600': checkErrors && errorGrid[rowIndex][cellIndex],
                    'text-gray-400': !_.isNil(fixedNumbersGrid[rowIndex][cellIndex]),
                  })}>
                    {fixedNumbersGrid[rowIndex][cellIndex] || grid?.[rowIndex][cellIndex]}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
        <SudokuConstraintsGraphics constraints={constraints} notes={notes} cellSize={cellSize} />
        <div className={classNames(
          'absolute inset-0 flex items-center justify-center', {
            'backdrop-blur-sm': loading,
            'pointer-events-none': !loading,
          }
        )}>
          <ClipLoader
            color="#607D8B"
            loading={loading}
            size={50}
          />
        </div>
      </div>
    </div>
  )
}

SudokuGrid.defaultProps = {
  cellSize: DEFAULT_CELL_SIZE,
}

type SudokuGridProps = {
  constraints: SudokuConstraints
  grid?: Grid
  notes?: number[][][]
  selectedCell?: CellPosition | null
  checkErrors: boolean
  loading: boolean
  onCellClick: Function | null
  cellSize: number
}

export default SudokuGrid
