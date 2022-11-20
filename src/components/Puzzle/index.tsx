import SudokuGrid from './SudokuGrid'
import SudokuControls from './SudokuControls'
import { CellPosition } from 'src/types/sudoku'
import { useDispatch, useSelector } from 'src/hooks'
import {
  changeSelectedCell, changeSelectedCellNotes, changeSelectedCellValue, toggleNotesActive,
} from 'src/screens/PlayPage/reducers/puzzle'

// A puzzle that you are actively solving
const PuzzleComponent = () => {
  const dispatch = useDispatch()

  const constraints = useSelector(state => state.puzzle.data!.constraints)
  const grid = useSelector(state => state.puzzle.grid)
  const notes = useSelector(state => state.puzzle.notes)
  const selectedCell = useSelector(state => state.puzzle.controls.selectedCell)
  const notesActive = useSelector(state => state.puzzle.controls.notesActive)

  const handleSelectedCellChange = (cell: CellPosition) => {
    dispatch(changeSelectedCell(cell))
  }
  const handleSelectedCellValueChange = (value: number | null) => {
    dispatch(changeSelectedCellValue(value))
    dispatch(changeSelectedCellNotes(null))
  }
  const handleSelectedCellNotesChange = (value: number | null) => {
    dispatch(changeSelectedCellNotes(value))
  }
  const handleNotesActiveToggle = () => {
    dispatch(toggleNotesActive())
  }

  return (
    <div className="flex flex-col md:flex-row">
      <div className="w-full md:w-fit">
        <SudokuGrid constraints={constraints}
                    grid={grid!}
                    notes={notes!}
                    selectedCell={selectedCell}
                    onSelectedCellChange={handleSelectedCellChange}
        />
      </div>
      <div className="w-full md:w-fit md:pl-5">
        <SudokuControls constraints={constraints}
                        grid={grid!}
                        selectedCell={selectedCell}
                        notesActive={notesActive}
                        onSelectedCellValueChange={handleSelectedCellValueChange}
                        onSelectedCellNotesChange={handleSelectedCellNotesChange}
                        onSelectedCellChange={handleSelectedCellChange}
                        onNotesActiveToggle={handleNotesActiveToggle}
        />
      </div>
    </div>
  )
}

export default PuzzleComponent
