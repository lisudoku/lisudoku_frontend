import { useCallback } from 'react'
import { Rule, SolutionStep, SudokuConstraints, SudokuLogicalSolveResult } from 'lisudoku-solver'
import { max, orderBy, sumBy, toPairs } from 'lodash-es'
import Typography from 'src/design_system/Typography'
import SolutionPanel from './SolutionPanel'
import { StepRuleDifficulty, StepRuleDifficultyDisplay, EStepRuleDifficulty } from 'src/utils/constants'
import { LogicalSolutionSteps } from '../solver/LogicalSolutionSteps'
import { useDispatch, useSelector } from 'src/hooks'
import { changeLogicalSolutionStepIndex } from 'src/reducers/builder'

const groupStepsByType = (steps: SolutionStep[]) => {
  const groups: { [key in Rule]?: number } = {}
  for (const step of steps) {
    groups[step.rule] ||= 0
    groups[step.rule]! += 1
  }

  return orderBy(
    toPairs(groups),
    [
      group => StepRuleDifficulty[group[0] as Rule],
      1
    ],
    ['desc', 'desc']
  )
}

const estimateDifficultyByConstraints = (constraints: SudokuConstraints) => {
  const gridSize = constraints.gridSize
  if (gridSize === 4 || gridSize === 6) {
    return StepRuleDifficultyDisplay[EStepRuleDifficulty.Easy]
  }

  let nonEmptyCells = constraints.fixedNumbers?.length ?? 0
  nonEmptyCells += sumBy(constraints.thermos, 'length') / 3
  nonEmptyCells += sumBy(constraints.arrows, 'length') / 3
  nonEmptyCells += sumBy(constraints.renbans, 'length') / 3
  if (constraints.primaryDiagonal) {
    nonEmptyCells += 3
  }
  if (constraints.secondaryDiagonal) {
    nonEmptyCells += 3
  }
  if (constraints.antiKnight) {
    nonEmptyCells += constraints.gridSize
  }
  if (constraints.antiKing) {
    nonEmptyCells += constraints.gridSize * 3 / 2
  }
  nonEmptyCells += sumBy(constraints.killerCages, 'region.length') / 3
  nonEmptyCells += constraints.kropkiDots?.length ?? 0 / 2
  nonEmptyCells += constraints.extraRegions?.length ?? 0 * 2
  nonEmptyCells += constraints.oddCells?.length ?? 0 / 2
  nonEmptyCells += constraints.evenCells?.length ?? 0 / 2
  if (constraints.topBottom) {
    nonEmptyCells += constraints.gridSize
  }

  if (nonEmptyCells >= 30) {
    return StepRuleDifficultyDisplay[EStepRuleDifficulty.Easy]
  } else if (nonEmptyCells >= 23) {
    return StepRuleDifficultyDisplay[EStepRuleDifficulty.Medium]
  } else if (nonEmptyCells >= 18) {
    return StepRuleDifficultyDisplay[EStepRuleDifficulty.Hard]
  } else {
    return 'too hard!!!'
  }
}

const estimateDifficultyByRules = (steps: SolutionStep[]) => {
  const maxDifficulty = max(steps.map(step => {
    const difficulty = StepRuleDifficulty[step.rule]
    if (difficulty === undefined) {
      throw Error(`No difficulty found for rule ${step.rule}`)
    }
    return difficulty
  }))
  return StepRuleDifficultyDisplay[maxDifficulty!]
}

const LogicalSolutionPanelContent = ({ solution, constraints, running, setterMode }: LogicalSolutionPanelContentProps) => {
  const dispatch = useDispatch()
  const logicalSolutionStepIndex = useSelector(state => state.builder.logicalSolutionStepIndex)

  const handleStepClick = useCallback((stepIndex: number) => {
    dispatch(changeLogicalSolutionStepIndex(stepIndex))
  }, [dispatch])

  if (running) {
    return <Typography variant="paragraph">Running...</Typography>
  }
  if (solution === null) {
    return <>&nbsp;</>
  }

  return (
    <>
      {solution.solutionType === 'None' ? (
        <Typography variant="paragraph">
          This puzzle has no solutions 🙁
          {solution.steps.length > 0 && ' here is why'}
        </Typography>
      ) : solution.solutionType === 'Full' ? (
        <Typography variant="paragraph">Found a solution 🎉</Typography>
      ) : (
        <Typography variant="paragraph">Didn't find a full solution, but made some progress</Typography>
      )}
      {setterMode ? (
        <>
          <Typography variant="paragraph">
            Step count = {solution.steps.length}
          </Typography>
          <ul className="list-disc list-inside">
            {groupStepsByType(solution.steps).map(([ rule, count ]) => (
              <li key={rule} className="font-light">{`${rule} x ${count}`}</li>
            ))}
          </ul>
          <Typography variant="paragraph">
            Difficutly by rule rank - {estimateDifficultyByRules(solution.steps)}
          </Typography>
          <Typography variant="paragraph">
            Difficutly by given cells - {estimateDifficultyByConstraints(constraints)}
          </Typography>
        </>
      ) : (
        <LogicalSolutionSteps
          gridSize={constraints.gridSize}
          steps={solution.steps}
          solutionType={solution.solutionType}
          selectedStepIndex={logicalSolutionStepIndex ?? Infinity}
          onStepClick={handleStepClick}
        />
      )}
    </>
  )
}

type LogicalSolutionPanelContentProps = {
  solution: SudokuLogicalSolveResult | null
  constraints: SudokuConstraints
  running: boolean
  setterMode: boolean
}

const LogicalSolutionPanel = ({ solution, constraints, running, setterMode, onClear }: LogicalSolutionPanelProps) => {
  return (
    <SolutionPanel
      className="max-h-96"
      onClear={solution !== null ? onClear : undefined}
    >
      <LogicalSolutionPanelContent
        solution={solution}
        constraints={constraints}
        running={running}
        setterMode={setterMode}
      />
    </SolutionPanel>
  )
}

type LogicalSolutionPanelProps = {
  solution: SudokuLogicalSolveResult | null
  constraints: SudokuConstraints
  running: boolean
  setterMode: boolean
  onClear: () => void
}

export default LogicalSolutionPanel
