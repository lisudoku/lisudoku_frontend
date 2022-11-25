import { useCallback, useEffect, useState } from 'react'
import useInterval from 'react-useinterval'
import SudokuGrid from './SudokuGrid'
import SudokuControls from './SudokuControls'
import SudokuMisc from './SudokuMisc'
import { CellPosition } from 'src/types/sudoku'
import { useDispatch, useSelector } from 'src/hooks'
import {
  changeSelectedCell, changeSelectedCellNotes, changeSelectedCellValue,
  requestSolved, fetchNewPuzzle, responseSolved, toggleNotesActive, updateTimer, resetPuzzle, undoAction, redoAction,
} from 'src/reducers/puzzle'
import { gridIsFull } from 'src/utils/sudoku'
import { checkSolved } from 'src/utils/wasm'
import { requestPuzzleCheck } from 'src/utils/apiService'

// A puzzle that you are actively solving
const PuzzleComponent = () => {
  const dispatch = useDispatch()

  const [ isSolvedLoading, setIsSolvedLoading ] = useState(false)

  const id = useSelector(state => state.puzzle.data!.publicId)
  const constraints = useSelector(state => state.puzzle.data!.constraints)
  const grid = useSelector(state => state.puzzle.grid)
  const notes = useSelector(state => state.puzzle.notes)
  const solveTimer = useSelector(state => state.puzzle.solveTimer)
  const solved = useSelector(state => state.puzzle.solved)
  const selectedCell = useSelector(state => state.puzzle.controls.selectedCell)
  const notesActive = useSelector(state => state.puzzle.controls.notesActive)
  const undoActive = useSelector(state => state.puzzle.controls.actionIndex >= 0)
  const redoActive = useSelector(state => state.puzzle.controls.actionIndex + 1 < state.puzzle.controls.actions.length)

  const handleSelectedCellChange = useCallback((cell: CellPosition) => {
    if (selectedCell === null || cell.row !== selectedCell.row || cell.col !== selectedCell.col) {
      dispatch(changeSelectedCell(cell))
    }
  }, [dispatch, selectedCell])
  const handleSelectedCellValueChange = useCallback((value: number | null) => {
    dispatch(changeSelectedCellValue(value))
  }, [dispatch])
  const handleSelectedCellNotesChange = useCallback((value: number) => {
    dispatch(changeSelectedCellNotes(value))
  }, [dispatch])
  const handleNotesActiveToggle = useCallback(() => {
    dispatch(toggleNotesActive())
  }, [dispatch])

  const handleNewPuzzle = useCallback(() => {
    if (solved ||
        solveTimer < 15 ||
        window.confirm('Are you sure you want to abort the current puzzle?')
    ) {
      dispatch(fetchNewPuzzle())
    }
  }, [dispatch, solved, solveTimer])

  const handleReset = useCallback(() => {
    dispatch(resetPuzzle())
  }, [dispatch])

  const handleUndo = useCallback(() => {
    dispatch(undoAction())
  }, [dispatch])

  const handleRedo = useCallback(() => {
    dispatch(redoAction())
  }, [dispatch])

  useEffect(() => {
    if (!solved && grid && gridIsFull(grid)) {
      if (checkSolved(constraints, grid)) {
        dispatch(requestSolved())
        setIsSolvedLoading(true)
        requestPuzzleCheck(id, grid).then(result => {
          dispatch(responseSolved(result.correct))
          setIsSolvedLoading(false)
        })
      }
    }
  }, [dispatch, id, constraints, grid, solved])

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
                        undoActive={undoActive}
                        redoActive={redoActive}
                        onSelectedCellValueChange={handleSelectedCellValueChange}
                        onSelectedCellNotesChange={handleSelectedCellNotesChange}
                        onSelectedCellChange={handleSelectedCellChange}
                        onNotesActiveToggle={handleNotesActiveToggle}
                        onNewPuzzle={handleNewPuzzle}
                        onReset={handleReset}
                        onUndo={handleUndo}
                        onRedo={handleRedo}
        />
      </div>
      <div className="w-full md:w-fit md:pl-5">
        <SudokuMisc />
      </div>
    </div>
  )
}

export default PuzzleComponent
