import { useCallback, useEffect } from 'react'
import useInterval from 'react-useinterval'
import { useNavigate } from 'react-router-dom'
import SudokuGrid from './SudokuGrid'
import SudokuControls from './SudokuControls'
import SudokuMisc from './SudokuMisc'
import { CellPosition, SudokuDifficulty, SudokuVariant } from 'src/types/sudoku'
import { useDispatch, useSelector } from 'src/hooks'
import {
  changeSelectedCell, changeSelectedCellNotes, changeSelectedCellValue,
  requestSolved, responseSolved, toggleNotesActive, updateTimer,
} from 'src/screens/PlayPage/reducers/puzzle'
import { gridIsFull } from 'src/utils/sudoku'
import { checkSolved } from 'src/utils/wasm'
import { requestPuzzleCheck } from 'src/utils/apiService'
import { updateDifficulty } from 'src/reducers/userData'

// A puzzle that you are actively solving
const PuzzleComponent = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const onVariantChange = useCallback((variant: SudokuVariant) => {
    navigate(`/play/${variant}`)
  }, [navigate])
  const difficulty = useSelector(state => state.userData.difficulty)
  const onDifficultyChange = useCallback((difficulty: SudokuDifficulty) => {
    dispatch(updateDifficulty(difficulty))
  }, [dispatch])

  const id = useSelector(state => state.puzzle.data!.publicId)
  const variant = useSelector(state => state.puzzle.data!.variant)
  const constraints = useSelector(state => state.puzzle.data!.constraints)
  const grid = useSelector(state => state.puzzle.grid)
  const notes = useSelector(state => state.puzzle.notes)
  const solveTimer = useSelector(state => state.puzzle.solveTimer)
  const solved = useSelector(state => state.puzzle.solved)
  const isSolvedLoading = useSelector(state => state.puzzle.isSolvedLoading)
  const selectedCell = useSelector(state => state.puzzle.controls.selectedCell)
  const notesActive = useSelector(state => state.puzzle.controls.notesActive)

  const handleSelectedCellChange = useCallback((cell: CellPosition) => {
    if (selectedCell === null || cell.row !== selectedCell.row || cell.col !== selectedCell.col) {
      dispatch(changeSelectedCell(cell))
    }
  }, [dispatch, selectedCell])
  const handleSelectedCellValueChange = useCallback((value: number | null) => {
    dispatch(changeSelectedCellValue(value))
    dispatch(changeSelectedCellNotes(null))
  }, [dispatch])
  const handleSelectedCellNotesChange = useCallback((value: number | null) => {
    dispatch(changeSelectedCellNotes(value))
  }, [dispatch])
  const handleNotesActiveToggle = useCallback(() => {
    dispatch(toggleNotesActive())
  }, [dispatch])

  useEffect(() => {
    if (grid && gridIsFull(grid)) {
      if (checkSolved(constraints, grid)) {
        dispatch(requestSolved())
        requestPuzzleCheck(id, grid).then(result => {
          dispatch(responseSolved(result.correct))
        })
      }
    }
  }, [dispatch, id, constraints, grid])

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
        <SudokuMisc constraints={constraints}
                    variant={variant}
                    difficulty={difficulty}
                    onVariantChange={onVariantChange}
                    onDifficultyChange={onDifficultyChange}
        />
      </div>
    </div>
  )
}

export default PuzzleComponent
