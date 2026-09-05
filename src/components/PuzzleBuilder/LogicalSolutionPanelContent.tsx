import type { Rule, SolutionStep, SudokuConstraints } from 'lisudoku-solver'
import { max, orderBy, toPairs } from 'lodash-es'
import Typography from 'src/design_system/Typography'
import { StepRuleDifficulty, StepRuleDifficultyDisplay } from 'src/utils/constants'
import { LogicalSolutionSteps } from '../solver/LogicalSolutionSteps'
import type { LogicalSolverState } from 'src/reducers/builder'

interface LogicalSolutionPanelContentProps {
  solverState: LogicalSolverState
  constraints: SudokuConstraints
  setterMode: boolean
  onStepChange: (index: number) => void
  isDirty: boolean
}

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

export const LogicalSolutionPanelContent = ({ solverState, constraints, setterMode, onStepChange, isDirty }: LogicalSolutionPanelContentProps) => {
  if (solverState.status === 'running') {
    return <Typography variant="paragraph">Running...</Typography>
  }
  if (solverState.status === 'error') {
    return <Typography variant="paragraph">{solverState.error}</Typography>
  }
  if (solverState.solution === undefined) {
    return <>&nbsp;</>
  }

  return (
    <>
      {solverState.solution.solutionType === 'None' ? (
        <Typography variant="paragraph">
          This puzzle has no solutions 🙁
          {solverState.solution.steps.length > 0 && ' here is why'}
        </Typography>
      ) : solverState.solution.solutionType === 'Full' ? (
        <Typography variant="paragraph">Found a solution 🎉</Typography>
      ) : (
        <Typography variant="paragraph">Didn't find a full solution, but made some progress</Typography>
      )}
      {setterMode ? (
        <>
          <Typography variant="paragraph">
            Step count = {solverState.solution.steps.length}
          </Typography>
          <ul className="list-disc list-inside">
            {groupStepsByType(solverState.solution.steps).map(([ rule, count ]) => (
              <li key={rule} className="font-light">{`${rule} x ${count}`}</li>
            ))}
          </ul>
          <Typography variant="paragraph">
            Difficutly by rule rank - {estimateDifficultyByRules(solverState.solution.steps)}
          </Typography>
        </>
      ) : (
        <LogicalSolutionSteps
          constraints={constraints}
          solverState={solverState}
          onStepClick={onStepChange}
          isDirty={isDirty}
        />
      )}
    </>
  )
}
