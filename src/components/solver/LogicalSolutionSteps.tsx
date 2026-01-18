import { SolutionStep, SolutionType } from 'lisudoku-solver'
import { HintLevel } from 'src/reducers/puzzle'
import { StepDescription } from './StepDescription'
import { LogicalSolutionStep } from './LogicalSolutionStep'

interface LogicalSolutionsStepsProps {
  gridSize: number
  steps: SolutionStep[]
  solutionType: SolutionType
  selectedStepIndex: number
  onStepClick: (index: number) => void
}

const finalStepLabel: Record<SolutionType, string> = {
  Full: 'Puzzle finished',
  Partial: 'Got stuck here',
  None: 'Reached an invalid state',
}

export const LogicalSolutionSteps = (
  { gridSize, steps, solutionType, selectedStepIndex, onStepClick }: LogicalSolutionsStepsProps
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
        <StepDescription step={step} hintLevel={HintLevel.Full} gridSize={gridSize} />
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
