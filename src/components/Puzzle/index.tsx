import { useEffect } from 'react'
import useInterval from 'react-useinterval'
import SudokuGrid from './SudokuGrid'
import SudokuControls from './SudokuControls'
import SudokuMisc from './SudokuMisc'
import { CellPosition } from 'src/types/sudoku'
import { useDispatch, useSelector } from 'src/hooks'
import {
  changeSelectedCell, changeSelectedCellNotes, changeSelectedCellValue,
  requestSolved, responseSolved, toggleNotesActive, updateTimer,
} from 'src/screens/PlayPage/reducers/puzzle'
import { gridIsFull } from 'src/utils/sudoku'
import { checkSolved } from 'src/utils/wasm'
import { requestPuzzleCheck } from 'src/utils/apiService'

// A puzzle that you are actively solving
const PuzzleComponent = () => {
  const dispatch = useDispatch()

  const id = useSelector(state => state.puzzle.data!.publicId)
  const constraints = useSelector(state => state.puzzle.data!.constraints)
  const grid = useSelector(state => state.puzzle.grid)
  const notes = useSelector(state => state.puzzle.notes)
  const solveTimer = useSelector(state => state.puzzle.solveTimer)
  const solved = useSelector(state => state.puzzle.solved)
  const isSolvedLoading = useSelector(state => state.puzzle.isSolvedLoading)
  const selectedCell = useSelector(state => state.puzzle.controls.selectedCell)
  const notesActive = useSelector(state => state.puzzle.controls.notesActive)

  const handleSelectedCellChange = (cell: CellPosition) => {
    if (selectedCell === null || cell.row !== selectedCell.row || cell.col !== selectedCell.col) {
      dispatch(changeSelectedCell(cell))
    }
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

  useEffect(() => {
    if (grid && gridIsFull(grid)) {
      if (checkSolved(constraints, grid)) {
        dispatch(requestSolved())
        requestPuzzleCheck(id, grid).then(result => {
          dispatch(responseSolved(result.correct))
        })
      }
    }
  }, [dispatch, constraints, grid])

  useInterval(() => {
    if (!solved && !isSolvedLoading) {
      dispatch(updateTimer())
    }
  }, 1000)

  return (
    <div className="flex flex-col md:flex-row mx-auto">
      <div className="w-full md:w-fit">
        <SudokuGrid constraints={constraints}
                    grid={grid!}
                    notes={notes!}
                    selectedCell={selectedCell}
                    loading={isSolvedLoading}
                    onSelectedCellChange={handleSelectedCellChange}
        />
      </div>
      <div className="w-full md:w-fit md:pl-5">
        <SudokuControls constraints={constraints}
                        selectedCell={selectedCell}
                        notesActive={notesActive}
                        solveTimer={solveTimer}
                        solved={solved}
                        isSolvedLoading={isSolvedLoading}
                        onSelectedCellValueChange={handleSelectedCellValueChange}
                        onSelectedCellNotesChange={handleSelectedCellNotesChange}
                        onSelectedCellChange={handleSelectedCellChange}
                        onNotesActiveToggle={handleNotesActiveToggle}
        />
      </div>
      <div className="w-full md:w-fit md:pl-5">
        <SudokuMisc constraints={constraints} />
      </div>
    </div>
  )
}

export default PuzzleComponent
