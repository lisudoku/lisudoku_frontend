import _ from 'lodash'
import classNames from 'classnames'
import SudokuConstraintsGraphics from './SudokuConstraintsGraphics'
import ClipLoader from 'react-spinners/ClipLoader'
import { Grid, SudokuConstraints } from 'src/types/sudoku'
import { CellPosition } from 'src/types/sudoku'
import { DEFAULT_CELL_SIZE } from 'src/utils/constants'

const SudokuGrid = ({
  constraints, grid, notes, selectedCell, checkErrors, loading, onCellClick, cellSize,
}: SudokuGridProps) => {
  return (
    <div className="cursor-default select-none">
      <div className="relative">
        <SudokuConstraintsGraphics
          constraints={constraints}
          grid={grid}
          notes={notes}
          cellSize={cellSize}
          checkErrors={checkErrors}
          selectedCell={selectedCell}
          onCellClick={onCellClick}
        />
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
