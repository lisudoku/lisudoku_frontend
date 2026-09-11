import { useCallback, useEffect, useRef, useState } from 'react'
import { throttle } from 'lodash-es'
import { useDispatch, useSelector } from 'src/hooks'
import { Link } from 'react-router-dom'
import Button from 'src/design_system/Button'
import Input from 'src/design_system/Input'
import {
  changeAuthor,
  changeDifficulty, changeSourceCollectionId, clearBruteSolution, clearLogicalSolution,
  errorAddPuzzle, requestAddPuzzle, responseAddPuzzle,
} from 'src/reducers/builder'
import { Puzzle, SudokuDifficulty } from 'src/types/sudoku'
import DifficultySelect from 'src/components/Puzzle/DifficultySelect'
import VariantSelect from 'src/components/Puzzle/VariantSelect'
import PuzzleCollectionsSelect from 'src/components/Puzzle/PuzzleCollectionsSelect'
import { LogicalSolutionPanel } from './LogicalSolutionPanel'
import { BruteSolutionPanel } from './BruteSolutionPanel'
import { apiAddPuzzle } from 'src/utils/apiService'
import { getPuzzleRelativeUrl } from 'src/utils/misc'
import { sendHbAlert } from 'src/components/HoneybadgerProvider'
import { exportToLisudokuSolver } from 'src/utils/import'
import Typography from 'src/design_system/Typography'
import { faGear } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { SolverSettings } from './SolverSettings'
import { detectConstraints } from 'src/constraints/utils'
import { useElapsedTime, type SolverHandle } from './hooks'

// TODO: consider a more general approach if it's an issue in other places too
// Alert about running solver every 5 mins
const sendHbAlertThrottled = throttle(sendHbAlert, 300_000)

interface PuzzleActionsProps {
  bruteSolver: SolverHandle
  logicalSolver: SolverHandle
  onInputFocus: () => void
  onInputBlur: () => void
}

export const PuzzleActions = ({ bruteSolver, logicalSolver, onInputFocus, onInputBlur }: PuzzleActionsProps) => {
  const dispatch = useDispatch()
  const userToken = useSelector(state => state.userData.token)
  const setterMode = useSelector(state => state.builder.setterMode)
  const constraints = useSelector(state => state.builder.constraints)
  const bruteSolverState = useSelector(state => state.builder.bruteSolverState)
  const logicalSolverState = useSelector(state => state.builder.logicalSolverState)
  const variant = useSelector(state => state.builder.variant)
  const difficulty = useSelector(state => state.builder.difficulty)
  const puzzlePublicId = useSelector(state => state.builder.puzzlePublicId)
  const puzzleAdding = useSelector(state => state.builder.puzzleAdding)
  const sourceCollectionId = useSelector(state => state.builder.sourceCollectionId)
  const author = useSelector(state => state.builder.author)
  const manualChange = useSelector(state => state.builder.manualChange)
  const userIsAdmin = useSelector(state => state.userData.admin)

  const addPuzzleEnabled = (
    logicalSolverState.solution?.solutionType === 'Full' &&
    bruteSolverState.solution?.solutionCount === 1
  )

  const handleBruteSolverRun = useCallback(() => {
    if (!setterMode && constraints && manualChange && !userIsAdmin) {
      sendHbAlertThrottled({
        name: 'Running brute solver',
        context: {
          url: exportToLisudokuSolver(constraints),
          variant,
        },
      })
    }
    bruteSolver.run(constraints)
  }, [constraints, bruteSolver, setterMode, manualChange, userIsAdmin])

  const handleLogicalSolverRun = useCallback(() => {
    if (!setterMode && constraints && manualChange && !userIsAdmin) {
      sendHbAlertThrottled({
        name: 'Running logical solver',
        context: {
          url: exportToLisudokuSolver(constraints),
          variant,
        },
      })
    }
    logicalSolver.run(constraints)
  }, [constraints, logicalSolver, setterMode, manualChange, userIsAdmin])

  const handleBruteSolverStop = useCallback(() => {
    bruteSolver.stop()
    dispatch(clearBruteSolution())
  }, [bruteSolver])

  const handleLogicalSolverStop = useCallback(() => {
    logicalSolver.stop()
    dispatch(clearLogicalSolution())
  }, [logicalSolver])

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
      solution: bruteSolverState.solution!.solution,
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
  }, [dispatch, userToken, constraints, bruteSolverState, variant, difficulty, sourceCollectionId, author])

  useEffect(() => {
    if (
      bruteSolverState.solution?.solutionCount === 1 &&
      logicalSolverState.solution !== undefined &&
      logicalSolverState.solution.solutionType !== 'Full' &&
      !setterMode &&
      constraints &&
      !userIsAdmin
    ) {
      sendHbAlert({
        name: 'Unsolved puzzle',
        message: `Couldn't solve ${variant} puzzle`,
        context: {
          url: exportToLisudokuSolver(constraints),
          variant: detectConstraints(constraints).variant,
        },
      })
    }
  }, [bruteSolverState, logicalSolverState, variant, constraints, setterMode, userIsAdmin])

  const elapsedTime = useElapsedTime(logicalSolverState.runStartedAt)
  const timeoutAlertRef = useRef(false)
  useEffect(() => {
    timeoutAlertRef.current = false
  }, [logicalSolverState.runStartedAt])
  useEffect(() => {
    if (constraints && elapsedTime > 5_000 && !timeoutAlertRef.current) {
      timeoutAlertRef.current = true
      sendHbAlertThrottled({
        name: 'Slow logical solver run',
        context: {
          url: exportToLisudokuSolver(constraints),
        },
      })
    }
  }, [elapsedTime, constraints])

  const [showSolverSettings, setShowSolverSettings] = useState(false)

  return (
    <div className="relative flex flex-col gap-2">
      <SolverSettings
        open={showSolverSettings}
        onClose={() => setShowSolverSettings(false)}
      />
      <span className="flex items-center justify-between pr-2">
        <Typography variant="h6">
          Solution
        </Typography>
        <FontAwesomeIcon
          icon={faGear}
          className="cursor-pointer"
          onClick={() => setShowSolverSettings(true)}
        />
      </span>
      <BruteSolutionPanel
        solverState={bruteSolverState}
        onRun={handleBruteSolverRun}
        onStop={handleBruteSolverStop}
        onClear={handleBruteSolutionClear}
      />
      <LogicalSolutionPanel
        solverState={logicalSolverState}
        constraints={constraints!}
        setterMode={setterMode}
        onRun={handleLogicalSolverRun}
        onStop={handleLogicalSolverStop}
        onClear={handleLogicalSolutionClear}
      />

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

          <Button
            onClick={handleAddPuzzleClick}
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
    </div>
  )
}
