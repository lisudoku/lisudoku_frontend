import CheckButton from './CheckButton'
import SolveButton from './SolveButton'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleDown } from '@fortawesome/free-solid-svg-icons'
import { CellPosition, Grid, SudokuConstraints } from 'src/types/sudoku'
import { useKeyboardHandler } from './hooks'

const gridIsFull = (grid: Grid | null) => (
  grid !== null && grid.every(row => row.every(cellValue => !!cellValue))
)

const SudokuControls = ({
  constraints, grid, selectedCell, notesActive, onSelectedCellValueChange, onSelectedCellNotesChange, onSelectedCellChange, onNotesActiveToggle,
}: SudokuControlsProps) => {
  const { gridSize, fixedNumbers } = constraints

  useKeyboardHandler(
    gridSize,
    fixedNumbers,
    selectedCell,
    notesActive,
    onSelectedCellChange,
    onNotesActiveToggle,
    onSelectedCellValueChange,
    onSelectedCellNotesChange
  )

  return (
    <>
      <div>
        1 2 3
      </div>
      <div>
        Undo, clear
      </div>
      {gridIsFull(grid) && (
        <CheckButton grid={grid!} constraints={constraints} />
      )}
      <SolveButton constraints={constraints} />
      <button className="border">Notes {notesActive ? 'active' : 'inactive'}</button>
      <div>
        <label><b>Difficulty:</b></label>
        Easy
        <FontAwesomeIcon icon={faAngleDown} size="lg" />
      </div>
      <div>
        Permalink
      </div>
      <div>
        New puzzle
      </div>
    </>
  )
}

type SudokuControlsProps = {
  constraints: SudokuConstraints,
  grid: Grid,
  selectedCell: CellPosition | null,
  notesActive: boolean,
  onSelectedCellValueChange: Function,
  onSelectedCellNotesChange: Function,
  onSelectedCellChange: Function,
  onNotesActiveToggle: Function,
}

export default SudokuControls
