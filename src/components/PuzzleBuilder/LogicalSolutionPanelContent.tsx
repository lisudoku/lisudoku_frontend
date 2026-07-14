import type { Rule, SolutionStep, SudokuConstraints, SudokuLogicalSolveResult } from 'lisudoku-solver'
import { max, orderBy, toPairs } from 'lodash-es'
import Typography from 'src/design_system/Typography'
import { useSelector } from 'src/hooks'
import { StepRuleDifficulty, StepRuleDifficultyDisplay } from 'src/utils/constants'
import { LogicalSolutionSteps } from '../solver/LogicalSolutionSteps'

interface LogicalSolutionPanelContentProps {
  solution: SudokuLogicalSolveResult | null
  constraints: SudokuConstraints
  running: boolean
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

export const LogicalSolutionPanelContent = ({ solution, constraints, running, setterMode, onStepChange, isDirty }: LogicalSolutionPanelContentProps) => {
  const logicalSolutionStepIndex = useSelector(state => state.builder.logicalSolutionStepIndex)

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
        </>
      ) : (
        <LogicalSolutionSteps
          constraints={constraints}
          steps={solution.steps}
          solutionType={solution.solutionType}
          selectedStepIndex={logicalSolutionStepIndex}
          onStepClick={onStepChange}
          isDirty={isDirty}
        />
      )}
    </>
  )
}
