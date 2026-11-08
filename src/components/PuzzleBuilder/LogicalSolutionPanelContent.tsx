import type { SolutionStep, SudokuConstraints, TechniqueKind } from 'lisudoku-solver'
import { max, orderBy, toPairs } from 'lodash-es'
import Typography from 'src/design_system/Typography'
import { TechniqueDifficulty, TechniqueDifficultyDisplay } from 'src/utils/constants'
import { LogicalSolutionSteps } from '../solver/LogicalSolutionSteps'
import type { LogicalSolverState } from 'src/reducers/builder'
import { SolutionPanelSpinner } from './SolutionPanelSpinner'

interface LogicalSolutionPanelContentProps {
  solverState: LogicalSolverState
  constraints: SudokuConstraints
  setterMode: boolean
  onStepChange: (index: number) => void
  isDirty: boolean
}

const groupStepsByTechniqueKind = (steps: SolutionStep[]) => {
  const groups: Partial<Record<TechniqueKind, number>> = {}
  for (const step of steps) {
    groups[step.techniqueKind] ||= 0
    groups[step.techniqueKind]! += 1
  }

  return orderBy(
    toPairs(groups),
    [
      group => TechniqueDifficulty[group[0] as TechniqueKind],
      1
    ],
    ['desc', 'desc']
  )
}

const estimateDifficultyBySteps = (steps: SolutionStep[]) => {
  const maxDifficulty = max(steps.map(step => {
    const difficulty = TechniqueDifficulty[step.techniqueKind]
    if (difficulty === undefined) {
      throw Error(`No difficulty found for technique ${step.techniqueKind}`)
    }
    return difficulty
  }))
  return TechniqueDifficultyDisplay[maxDifficulty!]
}

export const LogicalSolutionPanelContent = ({ solverState, constraints, setterMode, onStepChange, isDirty }: LogicalSolutionPanelContentProps) => (
  <>
    {solverState.status === 'running' ? (
      <SolutionPanelSpinner runStartedAt={solverState.runStartedAt} />
    ) : solverState.status === 'error' ? (
      <Typography variant="paragraph">{solverState.error}</Typography>
    ) : solverState.solution !== undefined && (
      <>
        {solverState.solution.solutionType === 'None' ? (
        <Typography variant="paragraph">
          This puzzle has no solutions 🙁
          {solverState.solution.steps.length > 0 && ' here is why'}
        </Typography>
      ) : solverState.solution.solutionType === 'Full' ? (
        <Typography variant="paragraph">Solved the puzzle 🎉</Typography>
      ) : (
        <Typography variant="paragraph">Didn't find a full solution, but made some progress</Typography>
      )}
      {setterMode ? (
        <>
          <Typography variant="paragraph">
            Step count = {solverState.solution.steps.length}
          </Typography>
          <ul className="list-disc list-inside">
            {groupStepsByTechniqueKind(solverState.solution.steps).map(([ techniqueKind, count ]) => (
              <li key={techniqueKind} className="font-light">{`${techniqueKind} x ${count}`}</li>
            ))}
          </ul>
          <Typography variant="paragraph">
            Difficutly by technique rank - {estimateDifficultyBySteps(solverState.solution.steps)}
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
    )}
  </>
)
