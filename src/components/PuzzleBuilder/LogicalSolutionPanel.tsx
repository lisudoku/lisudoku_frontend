import { max, orderBy, sumBy, toPairs } from 'lodash-es'
import Typography from 'src/shared/Typography'
import SolutionPanel from './SolutionPanel'
import { HintLevel } from 'src/reducers/puzzle'
import { SudokuConstraints } from 'src/types/sudoku'
import { SolutionStep, SolutionType, StepRule, SudokuLogicalSolveResult } from 'src/types/wasm'
import { StepRuleDifficulty, StepRuleDifficultyDisplay, EStepRuleDifficulty } from 'src/utils/constants'
import { getStepDescription } from 'src/utils/solver'

const groupStepsByType = (steps: SolutionStep[]) => {
  const groups: { [key in StepRule]?: number } = {}
  for (const step of steps) {
    groups[step.rule] ||= 0
    groups[step.rule]! += 1
  }

  return orderBy(
    toPairs(groups),
    [
      group => StepRuleDifficulty[group[0] as StepRule],
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
  if (running) {
    return <Typography variant="paragraph">Running...</Typography>
  }
  if (solution === null) {
    return <>&nbsp;</>
  }

  return (
    <>
      {solution.solution_type === SolutionType.None ? (
        <Typography variant="paragraph">There are no solutions 🙁</Typography>
      ) : solution.solution_type === SolutionType.Full ? (
        <Typography variant="paragraph">Found a solution 🎉</Typography>
      ) : (
        <Typography variant="paragraph">Didn't find a full solution 😢</Typography>
      )}
      {solution.solution_type !== SolutionType.None && (
        setterMode ? (
          <>
            <Typography variant="paragraph">
              Step count = {solution.steps!.length}
            </Typography>
            <ul className="list-disc list-inside">
              {groupStepsByType(solution.steps!).map(([ rule, count ]) => (
                <li key={rule} className="font-light">{`${rule} x ${count}`}</li>
              ))}
            </ul>
            <Typography variant="paragraph">
              Difficutly by rule rank - {estimateDifficultyByRules(solution.steps!)}
            </Typography>
            <Typography variant="paragraph">
              Difficutly by given cells - {estimateDifficultyByConstraints(constraints)}
            </Typography>
          </>
        ) : (
          <>
            <ol className="list-decimal list-inside">
              {solution.steps!.map((step: SolutionStep, index: number) => (
                <li key={index}>
                  {getStepDescription(step, HintLevel.Full, constraints.gridSize)}
                </li>
              ))}
            </ol>
          </>
        )
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
    <SolutionPanel className="max-h-96" onClear={solution !== null ? onClear : undefined}>
      <LogicalSolutionPanelContent solution={solution}
                                   constraints={constraints}
                                   running={running}
                                   setterMode={setterMode} />
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
