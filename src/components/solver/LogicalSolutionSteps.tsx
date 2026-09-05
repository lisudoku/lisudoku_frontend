import { useEffect, useRef } from 'react'
import type { SolutionStep, SolutionType, SudokuConstraints } from 'lisudoku-solver'
import { HintLevel } from 'src/reducers/puzzle'
import { StepDescription } from './StepDescription'
import { LogicalSolutionStep } from './LogicalSolutionStep'
import type { LogicalSolverState } from 'src/reducers/builder'

interface LogicalSolutionsStepsProps {
  constraints: SudokuConstraints
  solverState: LogicalSolverState
  onStepClick: (index: number) => void
  isDirty: boolean
}

const finalStepLabel: Record<SolutionType, string> = {
  Full: 'Puzzle solved',
  Partial: 'Got stuck here',
  None: 'Reached an invalid state',
}

export const LogicalSolutionSteps = (
  { constraints, solverState, onStepClick, isDirty }: LogicalSolutionsStepsProps
) => {
  const stepRefs = useRef<Record<number, HTMLLIElement | null>>({})

  useEffect(() => {
    if (solverState.solutionStepIndex === undefined || !isDirty) {
      return
    }
    stepRefs.current[solverState.solutionStepIndex]?.scrollIntoView({
      block: 'nearest',
    })
  }, [isDirty, solverState])

  if (solverState.solution === undefined) {
    return null
  }

  return (
    <ol>
      <LogicalSolutionStep
        stepIndex={-1}
        selected={solverState.solutionStepIndex === -1}
        onClick={onStepClick}
        ref={el => stepRefs.current[-1] = el}
      >
        Initial grid
      </LogicalSolutionStep>
      {solverState.solution.steps.map((step: SolutionStep, index: number) => (
        <LogicalSolutionStep
          key={index}
          stepIndex={index}
          selected={solverState.solutionStepIndex === index}
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
        stepIndex={solverState.solution.steps.length}
        selected={solverState.solutionStepIndex === solverState.solution.steps.length}
        onClick={onStepClick}
        ref={el => {
          if (solverState.solution !== undefined) {
            stepRefs.current[solverState.solution.steps.length] = el
          }
        }}
      >
        {finalStepLabel[solverState.solution.solutionType]}
      </LogicalSolutionStep>
    </ol>
  )
}
