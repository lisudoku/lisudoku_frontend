import type { SolutionStep, SudokuConstraints } from 'lisudoku-solver'
import { inRange } from 'lodash-es'
import { useMemo } from 'react'
import { CustomGraphicsAreaHighlight, CustomGraphicsItem } from 'src/components/Puzzle/SudokuGridGraphics/CustomGraphics/CustomGraphics'
import { cellToCustomGraphicsItem } from 'src/components/Puzzle/SudokuGridGraphics/CustomGraphics/utils'
import type { LogicalSolverState } from 'src/reducers/builder'
import { EStepRuleDifficulty, StepRuleDifficulty } from 'src/utils/constants'
import { isGridStep } from 'src/utils/solver'
import { useStepCustomGraphics } from 'src/utils/stepsLogic/hooks'
import { getAllCells, getAreaCells } from 'src/utils/sudoku'

const StepRuleDifficultyColor: { [key in EStepRuleDifficulty]: string } = {
  [EStepRuleDifficulty.Easy]: 'green',
  [EStepRuleDifficulty.Medium]: 'yellow',
  [EStepRuleDifficulty.Hard]: 'red',
}

export const useSolutionCustomGraphics = ({
  logicalSolverState,
  constraints,
  showSolutionDifficultyHeatmap,
}: {
  logicalSolverState: LogicalSolverState,
  constraints: SudokuConstraints | null,
  showSolutionDifficultyHeatmap: boolean,
}): CustomGraphicsItem[] => {
  let step: SolutionStep | undefined
  if (
    logicalSolverState.solutionStepIndex !== undefined &&
    logicalSolverState.solution !== undefined &&
    inRange(logicalSolverState.solutionStepIndex, 0, logicalSolverState.solution.steps.length)
  ) {
    step = logicalSolverState.solution.steps[logicalSolverState.solutionStepIndex]
  }
  const stepHighlights = useStepCustomGraphics({
    step,
    constraints: constraints ?? undefined,
  })

  // Example: 063000890007000100400000007100804005000070200700903008300000001006102300081000560
  let invalidStateHighlights: CustomGraphicsAreaHighlight[] = []
  if (
    logicalSolverState.solution !== undefined &&
    logicalSolverState.solution.solutionType === 'None' &&
    logicalSolverState.solution.invalidStateReason !== undefined &&
    constraints !== null &&
    logicalSolverState.solutionStepIndex === logicalSolverState.solution.steps.length
  ) {
    invalidStateHighlights = getAreaCells(
      logicalSolverState.solution.invalidStateReason.area,
      constraints,
    ).map(areaCell => cellToCustomGraphicsItem(areaCell, 'red'))
  }

  // Example: 002100000006103004500201200000001600
  let cellDifficultyGraphics: CustomGraphicsAreaHighlight[] = []
  if (
    showSolutionDifficultyHeatmap &&
    logicalSolverState.solution !== undefined &&
    logicalSolverState.solution.solutionType !== 'None' &&
    constraints !== null &&
    logicalSolverState.solutionStepIndex === logicalSolverState.solution.steps.length
  ) {
    const cellDifficulties: (EStepRuleDifficulty | -1)[][] = Array(constraints.gridSize).fill(null).map(() => Array(constraints.gridSize).fill(-1))
    for (const step of logicalSolverState.solution.steps) {
      const difficulty = StepRuleDifficulty[step.rule]
      const relevantCells = isGridStep(step) ? [step.cells[0]] : step.affectedCells
      for (const cell of relevantCells) {
        cellDifficulties[cell.row][cell.col] = Math.max(cellDifficulties[cell.row][cell.col], difficulty)
      }
    }

    // TODO: use iterator helpers to remove most for loops https://caniuse.com/mdn-javascript_builtins_iterator_filter
    for (const cell of getAllCells(constraints.gridSize)) {
      const difficulty = cellDifficulties[cell.row][cell.col]
      if (difficulty === -1) {
        continue
      }
      const color = StepRuleDifficultyColor[difficulty]
      cellDifficultyGraphics.push(cellToCustomGraphicsItem(cell, color))
    }
  }

  return useMemo(
    () => [...stepHighlights, ...invalidStateHighlights, ...cellDifficultyGraphics],
    [stepHighlights, invalidStateHighlights, cellDifficultyGraphics]
  )
}
