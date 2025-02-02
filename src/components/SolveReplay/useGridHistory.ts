import { useMemo } from 'react'
import { cloneDeep } from 'lodash-es'
import { UserSolutionStep } from 'src/types'
import { SudokuGridProps } from '../Puzzle/SudokuGrid'
import { performAction } from 'src/reducers/puzzle'

export interface HistoryStep extends Required<Pick<SudokuGridProps, 'grid' | 'cellMarks' | 'selectedCells'>> {
  time: number
  timeDiff: number
  isWarn: boolean
  isBad: boolean
}

export const useGridHistory = (gridSize: number, steps: UserSolutionStep[]) => (
  useMemo(() => {
    const history: HistoryStep[] = [{
      grid: Array(gridSize).fill(null).map(() => Array(gridSize).fill(null)),
      cellMarks: Array(gridSize).fill(null).map(() => Array(gridSize).fill(null).map(() => ({}))),
      selectedCells: [],
      time: 0,
      timeDiff: 0,
      isWarn: false,
      isBad: false,
    }]
    for (const step of steps) {
      const prevStep = history[history.length - 1]

      history.push(cloneDeep(prevStep))

      const nextStep = history[history.length - 1]
      performAction(nextStep, step)
      nextStep.selectedCells = step.cells
      nextStep.time = step.time
      nextStep.timeDiff = step.time - prevStep.time
      nextStep.isWarn = history.length > 2 && nextStep.timeDiff >= 30
      nextStep.isBad = history.length > 2 && nextStep.timeDiff >= 60
    }
    return history
  }, [gridSize, steps])
)
