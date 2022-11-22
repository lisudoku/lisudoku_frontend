import _ from 'lodash'
import classNames from 'classnames'
import SudokuConstraintsGraphics from './SudokuConstraintsGraphics'
import ClipLoader from 'react-spinners/ClipLoader'
import { useFixedNumbersGrid } from './hooks'
import { Grid, SudokuConstraints } from 'src/types/sudoku'
import { CellPosition } from 'src/types/sudoku'
import { CELL_SIZE } from 'src/utils/constants'

const isSelected = (rowIndex: number, cellIndex: number, selectedCell: CellPosition | null) => (
  selectedCell !== null && rowIndex === selectedCell.row && cellIndex === selectedCell.col
)

const SudokuGrid = ({ constraints, grid, notes, selectedCell, loading, onSelectedCellChange }: SudokuGridProps) => {
  const { fixedNumbers, gridSize } = constraints

  const fixedNumbersGrid = useFixedNumbersGrid(gridSize, fixedNumbers)

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
                     onClick={() => onSelectedCellChange({ row: rowIndex, col: cellIndex })}
                >
                  {!_.isNil(fixedNumbersGrid[rowIndex][cellIndex]) ? (
                    <div className="text-4xl font-medium">
                      {fixedNumbersGrid[rowIndex][cellIndex]}
                    </div>
                  ) : (
                    <div className="text-gray-400 text-4xl font-medium">
                      {cell}
                    </div>
                  )}
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
  constraints: SudokuConstraints,
  grid: Grid,
  notes: number[][][],
  selectedCell: CellPosition | null,
  loading: boolean,
  onSelectedCellChange: Function,
}

export default SudokuGrid
