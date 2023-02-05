import { useCallback } from 'react'
import SudokuConstraintsGraphics from './SudokuGridGraphics'
import LoadingSpinner from '../LoadingSpinner'
import { Grid, SudokuConstraints } from 'src/types/sudoku'
import { CellPosition } from 'src/types/sudoku'
import { DEFAULT_CELL_SIZE } from 'src/utils/constants'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCirclePlay } from '@fortawesome/free-solid-svg-icons'

const SudokuGrid = ({
  constraints, grid, notes, selectedCell, checkErrors, loading, onCellClick, cellSize,
  paused, onUnpause,
}: SudokuGridProps) => {
  const handleUnpause = useCallback(() => { onUnpause?.() }, [onUnpause])

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
        {(loading || paused) && (
          <div className="absolute inset-0 flex items-center justify-center backdrop-blur-md">
            <LoadingSpinner loading={loading} />
            {paused && (
              <FontAwesomeIcon icon={faCirclePlay}
                                size="5x"
                                onClick={handleUnpause}
                                className="cursor-pointer" />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

SudokuGrid.defaultProps = {
  cellSize: DEFAULT_CELL_SIZE,
  paused: false,
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
  paused: boolean
  onUnpause?: Function
}

export default SudokuGrid
