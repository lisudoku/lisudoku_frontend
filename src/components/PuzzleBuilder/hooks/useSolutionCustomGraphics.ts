import { CellPosition, SolutionStep, SudokuConstraints, SudokuLogicalSolveResult } from 'lisudoku-solver'
import { inRange } from 'lodash-es'
import { useMemo } from 'react'
import { CustomGraphicsAreaHighlight, CustomGraphicsItem } from 'src/components/Puzzle/SudokuGridGraphics/CustomGraphics/CustomGraphics'
import { cellToCustomGraphicsItem } from 'src/components/Puzzle/SudokuGridGraphics/CustomGraphics/utils'
// import { CellHighlight } from 'src/components/Puzzle/SudokuGridGraphics'
import { EStepRuleDifficulty, StepRuleDifficulty } from 'src/utils/constants'
import { isGridStep } from 'src/utils/solver'
import { getAllCells, getAreaCells } from 'src/utils/sudoku'
import { useStepCustomGraphics } from 'src/utils/techniqueHighlights'

const StepRuleDifficultyColor: { [key in EStepRuleDifficulty]: string } = {
  [EStepRuleDifficulty.Easy]: 'green',
  [EStepRuleDifficulty.Medium]: 'yellow',
  [EStepRuleDifficulty.Hard]: 'red',
}

export const useSolutionCustomGraphics = ({
  logicalSolution,
  constraints,
  showSolutionDifficultyHeatmap,
  logicalSolutionStepIndex,
}: {
  logicalSolution: SudokuLogicalSolveResult | null,
  constraints: SudokuConstraints | null,
  showSolutionDifficultyHeatmap: boolean,
  logicalSolutionStepIndex: number | null,
}): CustomGraphicsItem[] => {
  let step: SolutionStep | undefined
  if (
    logicalSolutionStepIndex !== null &&
    logicalSolution !== null &&
    inRange(logicalSolutionStepIndex, 0, logicalSolution.steps.length)
  ) {
    step = logicalSolution.steps[logicalSolutionStepIndex]
  }
  const stepHighlights = useStepCustomGraphics({
    step,
    constraints: constraints ?? undefined,
  })

  // Example: 063000890007000100400000007100804005000070200700903008300000001006102300081000560
  let invalidStateHighlights: CustomGraphicsAreaHighlight[] = []
  if (
    logicalSolution !== null &&
    logicalSolution.solutionType === 'None' &&
    logicalSolution.invalidStateReason &&
    constraints !== null &&
    logicalSolutionStepIndex === logicalSolution.steps.length
  ) {
    invalidStateHighlights = getAreaCells(
      logicalSolution.invalidStateReason.area,
      constraints,
    ).map(areaCell => cellToCustomGraphicsItem(areaCell, 'red'))
  }

  // Example: 002100000006103004500201200000001600
  let cellDifficultyGraphics: CustomGraphicsAreaHighlight[] = []
  if (
    showSolutionDifficultyHeatmap &&
    logicalSolution !== null &&
    logicalSolution.solutionType !== 'None' &&
    constraints !== null &&
    logicalSolutionStepIndex === logicalSolution.steps.length
  ) {
    const cellDifficulties: (EStepRuleDifficulty | -1)[][] = Array(constraints.gridSize).fill(null).map(() => Array(constraints.gridSize).fill(-1))
    for (const step of logicalSolution.steps) {
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
