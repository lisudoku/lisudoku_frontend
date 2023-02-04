import _ from 'lodash'
import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import Button from 'src/components/Button'
import Textarea from 'src/components/Textarea'
import { useDispatch, useSelector } from 'src/hooks'
import {
  changeDifficulty, changeSourceCollectionId, errorAddPuzzle,
  errorSolution, requestAddPuzzle, requestSolution, responseAddPuzzle,
  responseBruteSolution, responseIntuitiveSolution,
} from 'src/reducers/admin'
import {
  SolutionStep, SolutionType, StepRule, SudokuBruteSolveResult,
  SudokuIntuitiveSolveResult,
} from 'src/types/wasm'
import { Puzzle, SudokuConstraints, SudokuDifficulty } from 'src/types/sudoku'
import DifficultySelect from 'src/components/Puzzle/DifficultySelect'
import VariantSelect from 'src/components/Puzzle/VariantSelect'
import PuzzleCollectionsSelect from 'src/components/Puzzle/PuzzleCollectionsSelect'
import { apiAddPuzzle } from 'src/utils/apiService'
import { getPuzzleRelativeUrl } from 'src/utils/misc'
import { SudokuDifficultyDisplay } from 'src/utils/constants'
import { bruteSolve, intuitiveSolve } from 'src/utils/wasm'

const groupStepsByType = (steps: SolutionStep[]) => {
  const groups: { [index: string]: number } = {}
  for (const step of steps) {
    groups[step.rule] ||= 0
    groups[step.rule] += 1
  }

  return _.sortBy(_.toPairs(groups), [0, 1], ['desc', 'desc'])
}

const computeBruteSolutionDescription = (solution: SudokuBruteSolveResult | null) => {
  if (solution === null) {
    return ''
  }
  if (solution.solution_count === 0) {
    return 'No solutions 🙁'
  } else if (solution.solution_count === 2) {
    return 'Multiple solutions 😢'
  } else {
    return 'One solution, perfect 🎉'
  }
}

const estimateDifficultyByConstraints = (constraints: SudokuConstraints) => {
  const gridSize = constraints.gridSize
  if (gridSize === 4) {
    return SudokuDifficulty.Easy4x4
  } else if (gridSize === 6) {
    return SudokuDifficulty.Easy6x6
  }

  let nonEmptyCells = constraints.fixedNumbers.length
  nonEmptyCells += _.sumBy(constraints.thermos, 'length') / 3
  if (constraints.primaryDiagonal) {
    nonEmptyCells += 3
  }
  if (constraints.secondaryDiagonal) {
    nonEmptyCells += 3
  }
  if (constraints.antiKnight) {
    nonEmptyCells += constraints.gridSize
  }
  nonEmptyCells += _.sumBy(constraints.killerCages, 'region.length') / 3
  nonEmptyCells += constraints.kropkiDots.length / 2
  nonEmptyCells += constraints.extraRegions.length * 2

  if (nonEmptyCells >= 30) {
    return SudokuDifficultyDisplay[SudokuDifficulty.Easy9x9]
  } else if (nonEmptyCells >= 23) {
    return SudokuDifficultyDisplay[SudokuDifficulty.Medium9x9]
  } else if (nonEmptyCells >= 18) {
    return SudokuDifficultyDisplay[SudokuDifficulty.Hard9x9]
  } else {
    return 'too hard!!!'
  }
}

const estimateDifficultyByRules = (steps: SolutionStep[]) => {
  const ruleRanks = _.keys(StepRule)
  const maxRank = _.max(steps.map(step => {
    const rank = ruleRanks.indexOf(step.rule)
    if (rank === -1) {
      console.error(`invalid rule ${step.rule}`)
    }
    return rank
  }))

  if (maxRank! <= 2) {
    return SudokuDifficultyDisplay[SudokuDifficulty.Easy9x9]
  } else if (maxRank! <= 12) {
    return SudokuDifficultyDisplay[SudokuDifficulty.Medium9x9]
  } else {
    return SudokuDifficultyDisplay[SudokuDifficulty.Hard9x9]
  }
}

const computeIntuitiveSolutionDescription = (solution: SudokuIntuitiveSolveResult | null, constraints: SudokuConstraints) => {
  let text = ''

  if (solution !== null) {
    if (solution.solution_type === SolutionType.None) {
      text += "No solutions 🙁\n"
    } else if (solution.solution_type === SolutionType.Full) {
      text += "Found solution 🎉\n"
    } else {
      text += "There might be a solution... 😢\n"
    }
    if (solution.solution_type === SolutionType.Full) {
      text += `Steps: ${solution.steps!.length}\n`
      text += groupStepsByType(solution.steps!).map(([ rule, count ]) => (
        `${rule} x ${count}`
      )).join("\n") + "\n"

      text += `Difficutly by rule rank - ${estimateDifficultyByRules(solution.steps!)}\n`
    }
  }

  const gridSize = constraints.gridSize
  const totalCellCount = gridSize * gridSize
  // TODO: build grid from fixed numbers/thermo/others to handle overlaps
  const nonEmptyCells = constraints.fixedNumbers.length + _.sumBy(constraints.thermos, 'length')
  text += `Non-empty cells: ${nonEmptyCells} / ${totalCellCount}\n`
  text += `Difficutly by given cells - ${estimateDifficultyByConstraints(constraints)}\n`

  return text.trim()
}

const PuzzleCommit = () => {
  const dispatch = useDispatch()
  const userToken = useSelector(state => state.userData.token)
  const constraints = useSelector(state => state.admin.constraints)
  const solverRunning = useSelector(state => state.admin.solverRunning)
  const bruteSolution = useSelector(state => state.admin.bruteSolution)
  const intuitiveSolution = useSelector(state => state.admin.intuitiveSolution)
  const variant = useSelector(state => state.admin.variant)
  const difficulty = useSelector(state => state.admin.difficulty)
  const puzzlePublicId = useSelector(state => state.admin.puzzlePublicId)
  const puzzleAdding = useSelector(state => state.admin.puzzleAdding)
  const sourceCollectionId = useSelector(state => state.admin.sourceCollectionId)

  const addPuzzleEnabled = (
    intuitiveSolution?.solution_type === SolutionType.Full &&
    bruteSolution?.solution_count === 1
  )

  const handleBruteSolveClick = useCallback(() => {
    dispatch(requestSolution())
    try {
      const solution = bruteSolve(constraints!)
      dispatch(responseBruteSolution(solution))
    } catch (e: any) {
      dispatch(errorSolution())
      throw e
    }
  }, [dispatch, constraints])

  const handleIntuitiveSolveClick = useCallback(() => {
    dispatch(requestSolution())
    const solution = intuitiveSolve(constraints!)
    dispatch(responseIntuitiveSolution(solution))
  }, [dispatch, constraints])

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

  return (
    <>
      <Button onClick={handleBruteSolveClick}
              disabled={solverRunning}
      >
        Brute Solve
      </Button>
      <Textarea disabled
                value={computeBruteSolutionDescription(bruteSolution)}
                className="!min-h-fit !px-3 !py-0 !pt-1 !h-8" />
      <Button onClick={handleIntuitiveSolveClick}
              disabled={solverRunning}
      >
        Intuitive Solve
      </Button>
      <Textarea disabled
                value={computeIntuitiveSolutionDescription(intuitiveSolution, constraints!)}
                className="w-64 h-40" />
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
  )
}

export default PuzzleCommit
