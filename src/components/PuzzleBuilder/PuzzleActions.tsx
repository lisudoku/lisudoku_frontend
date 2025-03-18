import { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'src/hooks'
import { Link } from 'react-router-dom'
import Button from 'src/shared/Button'
import Input from 'src/shared/Input'
import {
  changeAuthor,
  changeDifficulty, changeSourceCollectionId, clearBruteSolution, clearLogicalSolution,
  errorAddPuzzle, requestAddPuzzle, responseAddPuzzle,
} from 'src/reducers/builder'
import { SolutionType } from 'src/types/wasm'
import { Puzzle, SudokuDifficulty } from 'src/types/sudoku'
import DifficultySelect from 'src/components/Puzzle/DifficultySelect'
import VariantSelect from 'src/components/Puzzle/VariantSelect'
import PuzzleCollectionsSelect from 'src/components/Puzzle/PuzzleCollectionsSelect'
import LogicalSolutionPanel from './LogicalSolutionPanel'
import BruteSolutionPanel from './BruteSolutionPanel'
import { apiAddPuzzle } from 'src/utils/apiService'
import { getPuzzleRelativeUrl } from 'src/utils/misc'
import { honeybadger } from 'src/components/HoneybadgerProvider'
import { exportToLisudokuSolver } from 'src/utils/import'

const PuzzleActions = ({ runBruteSolver, runLogicalSolver, onInputFocus, onInputBlur }: PuzzleActionsProps) => {
  const dispatch = useDispatch()
  const userToken = useSelector(state => state.userData.token)
  const setterMode = useSelector(state => state.builder.setterMode)
  const constraints = useSelector(state => state.builder.constraints)
  const bruteSolverRunning = useSelector(state => state.builder.bruteSolverRunning)
  const bruteSolution = useSelector(state => state.builder.bruteSolution)
  const logicalSolverRunning = useSelector(state => state.builder.logicalSolverRunning)
  const logicalSolution = useSelector(state => state.builder.logicalSolution)
  const variant = useSelector(state => state.builder.variant)
  const difficulty = useSelector(state => state.builder.difficulty)
  const puzzlePublicId = useSelector(state => state.builder.puzzlePublicId)
  const puzzleAdding = useSelector(state => state.builder.puzzleAdding)
  const sourceCollectionId = useSelector(state => state.builder.sourceCollectionId)
  const author = useSelector(state => state.builder.author)
  const manualChange = useSelector(state => state.builder.manualChange)
  const userIsAdmin = useSelector(state => state.userData.admin)

  const addPuzzleEnabled = (
    logicalSolution?.solution_type === SolutionType.Full &&
    bruteSolution?.solution_count === 1
  )

  const handleBruteSolveClick = useCallback(() => {
    if (!setterMode && constraints && manualChange && !userIsAdmin) {
      honeybadger.notify({
        name: 'Running brute solver',
        context: {
          url: exportToLisudokuSolver(constraints),
          variant,
          constraints,
        },
      })
    }
    runBruteSolver(constraints)
  }, [constraints, runBruteSolver, setterMode, manualChange, userIsAdmin])

  const handleLogicalSolveClick = useCallback(() => {
    if (!setterMode && constraints && manualChange && !userIsAdmin) {
      honeybadger.notify({
        name: 'Running logical solver',
        context: {
          url: exportToLisudokuSolver(constraints),
          variant,
          constraints,
        },
      })
    }
    runLogicalSolver(constraints)
  }, [constraints, runLogicalSolver, setterMode, manualChange, userIsAdmin])

  const handleBruteSolutionClear = useCallback(() => {
    dispatch(clearBruteSolution())
  }, [dispatch])

  const handleLogicalSolutionClear = useCallback(() => {
    dispatch(clearLogicalSolution())
  }, [dispatch])

  const handleDifficultyChange = useCallback((difficulty: SudokuDifficulty) => {
    dispatch(changeDifficulty(difficulty))
  }, [dispatch])

  const handleSourceCollectionChange = useCallback((id: string) => {
    dispatch(changeSourceCollectionId(id))
  }, [dispatch])

  const handleAuthorChange = useCallback((value: string) => {
    dispatch(changeAuthor(value))
  }, [dispatch])

  const handleAddPuzzleClick = useCallback(() => {
    dispatch(requestAddPuzzle())
    const puzzle: Puzzle = {
      constraints: constraints!,
      variant,
      difficulty,
      solution: bruteSolution!.solution,
    }
    if (sourceCollectionId !== '') {
      puzzle.sourceCollectionId = parseInt(sourceCollectionId)
    }
    if (author !== '') {
      puzzle.author = author
    }
    apiAddPuzzle(puzzle, userToken!).then(data => {
      dispatch(responseAddPuzzle(data.public_id))
    }).catch((e) => {
      console.error(e)
      dispatch(errorAddPuzzle())
    })
  }, [dispatch, userToken, constraints, bruteSolution, variant, difficulty, sourceCollectionId, author])

  useEffect(() => {
    if (bruteSolution?.solution_count === 1 &&
        logicalSolution &&
        logicalSolution.solution_type !== SolutionType.Full &&
        !setterMode &&
        constraints) {
      honeybadger.notify({
        name: 'Unsolved puzzle',
        message: `Couldn't solve ${variant} puzzle`,
        context: {
          url: exportToLisudokuSolver(constraints),
          constraints,
        },
      })
    }
  }, [bruteSolution, logicalSolution, variant, constraints, setterMode])

  return (
    <>
      <Button onClick={handleBruteSolveClick}
              disabled={bruteSolverRunning  || bruteSolution !== null}
      >
        Brute Force Solve
      </Button>
      <BruteSolutionPanel running={bruteSolverRunning}
                          solution={bruteSolution}
                          onClear={handleBruteSolutionClear} />
      <Button onClick={handleLogicalSolveClick}
              disabled={logicalSolverRunning || logicalSolution !== null}
      >
        Logical Solve
      </Button>
      <LogicalSolutionPanel solution={logicalSolution}
                            constraints={constraints!}
                            running={logicalSolverRunning}
                            setterMode={setterMode}
                            onClear={handleLogicalSolutionClear} />

      {setterMode && (
        <>
          <DifficultySelect value={difficulty} onChange={handleDifficultyChange} />
          <VariantSelect
            value={variant}
            label="Variant (autodetected)"
            onChange={() => {}} // just to get rid of the warning
            disabled
          />
          <PuzzleCollectionsSelect
            value={sourceCollectionId}
            onChange={handleSourceCollectionChange}
          />
          <Input
            label="Author"
            value={author}
            onChange={handleAuthorChange}
            onFocus={onInputFocus}
            onBlur={onInputBlur}
          />

          <Button onClick={handleAddPuzzleClick}
                  disabled={!addPuzzleEnabled || puzzleAdding}
          >
            Add puzzle
          </Button>
          {puzzlePublicId && (
            <Link to={getPuzzleRelativeUrl(puzzlePublicId)} target="_blank">
              <Button variant="text" fullWidth>Puzzle URL</Button>
            </Link>
          )}
        </>
      )}
    </>
  )
}

type PuzzleActionsProps = {
  runBruteSolver: Function
  runLogicalSolver: Function
  onInputFocus: Function
  onInputBlur: Function
}

export default PuzzleActions
