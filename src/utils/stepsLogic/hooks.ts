import { useMemo } from 'react'
import type { SolutionStep, SudokuConstraints } from 'lisudoku-solver'
import { CustomGraphicsItem } from 'src/components/Puzzle/SudokuGridGraphics/CustomGraphics/CustomGraphics'
import { computeStepHighlights } from './stepsLogic'

export const useStepCustomGraphics = (
  { step, constraints, disabled }: { step?: SolutionStep, constraints?: SudokuConstraints, disabled?: boolean }
): CustomGraphicsItem[] =>
  useMemo(() => {
    if (step === undefined || constraints === undefined || disabled) {
      return []
    }

    return computeStepHighlights(step, constraints)
  }, [step, constraints, disabled])
