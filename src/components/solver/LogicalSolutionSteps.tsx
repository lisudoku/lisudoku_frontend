import type { SolutionStep, SolutionType, SudokuConstraints } from 'lisudoku-solver'
import { HintLevel } from 'src/reducers/puzzle'
import { StepDescription } from './StepDescription'
import { LogicalSolutionStep } from './LogicalSolutionStep'

interface LogicalSolutionsStepsProps {
  constraints: SudokuConstraints
  steps: SolutionStep[]
  solutionType: SolutionType
  selectedStepIndex: number
  onStepClick: (index: number) => void
}

const finalStepLabel: Record<SolutionType, string> = {
  Full: 'Puzzle solved',
  Partial: 'Got stuck here',
  None: 'Reached an invalid state',
}

export const LogicalSolutionSteps = (
  { constraints, steps, solutionType, selectedStepIndex, onStepClick }: LogicalSolutionsStepsProps
) => (
  <ol>
    <LogicalSolutionStep
      stepIndex={-1}
      selected={selectedStepIndex === -1}
      onClick={onStepClick}
    >
      Initial grid
    </LogicalSolutionStep>
    {steps.map((step: SolutionStep, index: number) => (
      <LogicalSolutionStep
        key={index}
        stepIndex={index}
        selected={selectedStepIndex === index}
        onClick={onStepClick}
      >
        <StepDescription step={step} hintLevel={HintLevel.Full} constraints={constraints} />
      </LogicalSolutionStep>
    ))}
    <LogicalSolutionStep
      stepIndex={steps.length}
      selected={selectedStepIndex === steps.length}
      onClick={onStepClick}
    >
      {finalStepLabel[solutionType]}
    </LogicalSolutionStep>
  </ol>
)
