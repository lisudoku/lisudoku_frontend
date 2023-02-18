import _ from 'lodash'
import { Typography } from '@material-tailwind/react'
import Alert from '../Alert'
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

  return _.orderBy(
    _.toPairs(groups),
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
  nonEmptyCells += constraints.oddCells.length / 2
  nonEmptyCells += constraints.evenCells.length / 2

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
  const maxDifficulty = _.max(steps.map(step => StepRuleDifficulty[step.rule]))
  return StepRuleDifficultyDisplay[maxDifficulty!]
}

const LogicalSolutionPanelContent = ({ solution, constraints, running, setterMode }: LogicalSolutionPanelProps) => {
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
                  {getStepDescription(step, HintLevel.Full)}
                </li>
              ))}
            </ol>
          </>
        )
      )}
    </>
  )
}

const LogicalSolutionPanel = ({ solution, constraints, running, setterMode }: LogicalSolutionPanelProps) => {
  return (
    <Alert show className="rounded py-2 max-h-96">
      <LogicalSolutionPanelContent solution={solution}
                                   constraints={constraints}
                                   running={running}
                                   setterMode={setterMode} />
    </Alert>
  )
}

type LogicalSolutionPanelProps = {
  solution: SudokuLogicalSolveResult | null
  constraints: SudokuConstraints
  running: boolean
  setterMode: boolean
}

export default LogicalSolutionPanel
