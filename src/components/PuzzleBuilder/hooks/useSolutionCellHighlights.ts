import { CellPosition, SolutionStep, SudokuConstraints, SudokuLogicalSolveResult } from 'lisudoku-solver'
import { inRange } from 'lodash-es'
import { useMemo } from 'react'
import { CellHighlight } from 'src/components/Puzzle/SudokuGridGraphics'
import { EStepRuleDifficulty, StepRuleDifficulty } from 'src/utils/constants'
import { isGridStep } from 'src/utils/solver'
import { getAllCells, getAreaCells } from 'src/utils/sudoku'
import { useStepCellHighlights } from 'src/utils/techniqueHighlights'

const StepRuleDifficultyColor: { [key in EStepRuleDifficulty]: string } = {
  [EStepRuleDifficulty.Easy]: 'green',
  [EStepRuleDifficulty.Medium]: 'yellow',
  [EStepRuleDifficulty.Hard]: 'red',
}

export const useSolutionCellHighlights = ({
  logicalSolution,
  constraints,
  showSolutionDifficultyHeatmap,
  logicalSolutionStepIndex,
}: {
  logicalSolution: SudokuLogicalSolveResult | null,
  constraints: SudokuConstraints | null,
  showSolutionDifficultyHeatmap: boolean,
  logicalSolutionStepIndex: number | null,
}): CellHighlight[] => {
  let step: SolutionStep | undefined
  if (
    logicalSolutionStepIndex !== null &&
    logicalSolution !== null &&
    inRange(logicalSolutionStepIndex, 0, logicalSolution.steps.length)
  ) {
    step = logicalSolution.steps[logicalSolutionStepIndex]
  }
  const stepHighlights = useStepCellHighlights({
    step,
    constraints: constraints ?? undefined,
  })

  let invalidStateHighlights: CellHighlight[] = []
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
    ).map((areaCell: CellPosition) => ({
      position: areaCell,
      color: 'red',
    }))
  }

  let cellDifficultyHighlights: CellHighlight[] | undefined = []
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

    for (const cell of getAllCells(constraints.gridSize)) {
      const difficulty = cellDifficulties[cell.row][cell.col]
      if (difficulty === -1) {
        continue
      }
      const color = StepRuleDifficultyColor[difficulty]
      cellDifficultyHighlights.push({
        position: cell,
        color,
      })
    }
  }

  return useMemo(
    () => [...stepHighlights, ...invalidStateHighlights, ...cellDifficultyHighlights],
    [stepHighlights, invalidStateHighlights, cellDifficultyHighlights]
  )
}
