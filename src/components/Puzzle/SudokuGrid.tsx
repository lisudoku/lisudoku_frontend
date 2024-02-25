import { useCallback } from 'react'
import SudokuConstraintsGraphics, { CellHighlight } from './SudokuGridGraphics'
import LoadingSpinner from '../../shared/LoadingSpinner'
import { CellMarks, Grid, SudokuConstraints } from 'src/types/sudoku'
import { CellPosition } from 'src/types/sudoku'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCirclePlay } from '@fortawesome/free-solid-svg-icons'
import { useCellSize } from 'src/utils/misc'

const SudokuGrid = ({
  constraints, grid, cellMarks, selectedCells, checkErrors = false, loading, onCellClick,
  cellSize: propsCellSize, highlightedCells,
  paused, onUnpause,
}: SudokuGridProps) => {
  const computedCellSize = useCellSize(constraints.gridSize)
  const cellSize = propsCellSize ?? computedCellSize

  const handleUnpause = useCallback(() => { onUnpause?.() }, [onUnpause])

  return (
    <div className="cursor-default select-none">
      <div className="relative">
        <SudokuConstraintsGraphics
          constraints={constraints}
          grid={grid}
          cellMarks={cellMarks}
          cellSize={cellSize}
          checkErrors={checkErrors}
          selectedCells={selectedCells}
          onCellClick={onCellClick}
          highlightedCells={highlightedCells}
        />
        {(loading || paused) && (
          <div className="absolute inset-0 flex items-center justify-center backdrop-blur-md">
            {loading && <LoadingSpinner />}
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
  paused: false,
}

type SudokuGridProps = {
  constraints: SudokuConstraints
  grid?: Grid
  cellMarks?: CellMarks[][]
  selectedCells?: CellPosition[]
  checkErrors?: boolean
  loading?: boolean
  onCellClick?: Function
  cellSize?: number
  paused?: boolean
  onUnpause?: Function
  highlightedCells?: CellHighlight[]
}

export default SudokuGrid
