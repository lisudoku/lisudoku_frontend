import { useEffect, useRef } from 'react'
import type { SolutionStep, SolutionType, SudokuConstraints } from 'lisudoku-solver'
import { HintLevel } from 'src/reducers/puzzle'
import { StepDescription } from './StepDescription'
import { LogicalSolutionStep } from './LogicalSolutionStep'

interface LogicalSolutionsStepsProps {
  constraints: SudokuConstraints
  steps: SolutionStep[]
  solutionType: SolutionType
  selectedStepIndex: number | null
  onStepClick: (index: number) => void
  isDirty: boolean
}

const finalStepLabel: Record<SolutionType, string> = {
  Full: 'Puzzle solved',
  Partial: 'Got stuck here',
  None: 'Reached an invalid state',
}

export const LogicalSolutionSteps = (
  { constraints, steps, solutionType, selectedStepIndex, onStepClick, isDirty }: LogicalSolutionsStepsProps
) => {
  const stepRefs = useRef<Record<number, HTMLLIElement | null>>({})

  useEffect(() => {
    if (selectedStepIndex === null || !isDirty) {
      return
    }
    stepRefs.current[selectedStepIndex]?.scrollIntoView({
      block: 'nearest',
    })
  }, [isDirty, selectedStepIndex])

  return (
    <ol>
      <LogicalSolutionStep
        stepIndex={-1}
        selected={selectedStepIndex === -1}
        onClick={onStepClick}
        ref={el => stepRefs.current[-1] = el}
      >
        Initial grid
      </LogicalSolutionStep>
      {steps.map((step: SolutionStep, index: number) => (
        <LogicalSolutionStep
          key={index}
          stepIndex={index}
          selected={selectedStepIndex === index}
          onClick={onStepClick}
          ref={el => stepRefs.current[index] = el}
        >
          <StepDescription
            step={step}
            hintLevel={HintLevel.Full}
            constraints={constraints}
          />
        </LogicalSolutionStep>
      ))}
      <LogicalSolutionStep
        stepIndex={steps.length}
        selected={selectedStepIndex === steps.length}
        onClick={onStepClick}
        ref={el => stepRefs.current[steps.length] = el}
      >
        {finalStepLabel[solutionType]}
      </LogicalSolutionStep>
    </ol>
  )
}
