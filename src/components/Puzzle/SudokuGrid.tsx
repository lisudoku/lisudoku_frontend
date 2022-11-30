import _ from 'lodash'
import classNames from 'classnames'
import SudokuConstraintsGraphics from './SudokuConstraintsGraphics'
import ClipLoader from 'react-spinners/ClipLoader'
import { useErrorGrid, useFixedNumbersGrid } from './hooks'
import { Grid, SudokuConstraints } from 'src/types/sudoku'
import { CellPosition } from 'src/types/sudoku'
import { CELL_SIZE } from 'src/utils/constants'

const isSelected = (rowIndex: number, cellIndex: number, selectedCell: CellPosition | null) => (
  selectedCell !== null && rowIndex === selectedCell.row && cellIndex === selectedCell.col
)

const SudokuGrid = ({
  constraints, grid, notes, selectedCell, checkErrors, loading, onCellClick,
}: SudokuGridProps) => {
  const { fixedNumbers, gridSize } = constraints

  const fixedNumbersGrid = useFixedNumbersGrid(gridSize, fixedNumbers)
  const errorGrid = useErrorGrid(checkErrors, constraints, fixedNumbersGrid, grid)

  return (
    <div className="cursor-default select-none">
      <div className="relative">
        <div className="w-fit relative border">
          {grid.map((row, rowIndex) => (
            <div key={rowIndex}
                className="flex w-fit">
              {row.map((cell, cellIndex) => (
                <div key={cellIndex}
                     className={classNames(`flex justify-center items-center border-solid border-gray-600 border`, {
                       'bg-gray-700': isSelected(rowIndex, cellIndex, selectedCell),
                     })}
                     style={{
                       width: CELL_SIZE + 'px',
                       height: CELL_SIZE + 'px',
                     }}
                     onClick={() => onCellClick({ row: rowIndex, col: cellIndex })}
                >
                  <div className={classNames('text-4xl font-medium', {
                    'text-red-600': checkErrors && errorGrid[rowIndex][cellIndex],
                    'text-gray-400': !_.isNil(fixedNumbersGrid[rowIndex][cellIndex]),
                  })}>
                    {fixedNumbersGrid[rowIndex][cellIndex] || cell}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
        <SudokuConstraintsGraphics constraints={constraints} notes={notes} />
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

type SudokuGridProps = {
  constraints: SudokuConstraints
  grid: Grid
  notes: number[][][]
  selectedCell: CellPosition | null
  checkErrors: boolean
  loading: boolean
  onCellClick: Function
}

export default SudokuGrid
