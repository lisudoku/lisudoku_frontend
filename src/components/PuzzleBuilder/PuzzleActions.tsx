import { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'src/hooks'
import { Link } from 'react-router-dom'
import Button from 'src/components/Button'
import {
  changeDifficulty, changeSourceCollectionId, clearBruteSolution, clearLogicalSolution, errorAddPuzzle,
  errorSolution, requestAddPuzzle, requestSolution, responseAddPuzzle,
  responseSolution,
  SolverType,
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
import { useSolver } from './hooks'

const PuzzleActions = () => {
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

  const addPuzzleEnabled = (
    logicalSolution?.solution_type === SolutionType.Full &&
    bruteSolution?.solution_count === 1
  )

  const bruteSolve = useSolver(SolverType.Brute)
  const logicalSolve = useSolver(SolverType.Logical)

  const handleBruteSolveClick = useCallback(() => {
    dispatch(requestSolution(SolverType.Brute))
    try {
      bruteSolve(constraints!).then(solution => {
        dispatch(responseSolution({ type: SolverType.Brute, solution }))
      })
    } catch (e: any) {
      dispatch(errorSolution(SolverType.Brute))
      throw e
    }
  }, [dispatch, constraints, bruteSolve])
  const handleBruteSolutionClear = useCallback(() => {
    dispatch(clearBruteSolution())
  }, [dispatch])

  const handleLogicalSolveClick = useCallback(() => {
    dispatch(requestSolution(SolverType.Logical))
    logicalSolve(constraints!).then(solution => {
      dispatch(responseSolution({ type: SolverType.Logical, solution }))
    })
  }, [dispatch, constraints, logicalSolve])
  const handleLogicalSolutionClear = useCallback(() => {
    dispatch(clearLogicalSolution())
  }, [dispatch])

  const handleDifficultyChange = useCallback((difficulty: SudokuDifficulty) => {
    dispatch(changeDifficulty(difficulty))
  }, [dispatch])

  const handleSourceCollectionChange = useCallback((id: string) => {
    dispatch(changeSourceCollectionId(id))
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
    apiAddPuzzle(puzzle, userToken!).then(data => {
      dispatch(responseAddPuzzle(data.public_id))
    }).catch((e) => {
      console.error(e)
      dispatch(errorAddPuzzle())
    })
  }, [dispatch, userToken, constraints, bruteSolution, variant, difficulty, sourceCollectionId])

  useEffect(() => {
    if (bruteSolution?.solution_count === 1 &&
        logicalSolution &&
        logicalSolution.solution_type !== SolutionType.Full &&
        !setterMode) {
      honeybadger.notify({
        name: 'Unsolved puzzle',
        message: `Couldn't solve ${variant} puzzle`,
        context: constraints!,
      })
    }
  }, [bruteSolution, logicalSolution, variant, constraints, setterMode])

  return (
    <>
      <Button onClick={handleBruteSolveClick}
              disabled={bruteSolverRunning}
      >
        Brute Force Solve
      </Button>
      <BruteSolutionPanel running={bruteSolverRunning}
                          solution={bruteSolution}
                          onClear={handleBruteSolutionClear} />
      <Button onClick={handleLogicalSolveClick}
              disabled={logicalSolverRunning}
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
          <VariantSelect value={variant} label="Variant (autodetected)" disabled />
          <PuzzleCollectionsSelect
            value={sourceCollectionId}
            onChange={handleSourceCollectionChange}
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

export default PuzzleActions
