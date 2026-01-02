import { useMemo } from 'react'
import type { FixedNumber } from 'lisudoku-solver'
import { computeFixedNumbersGrid } from 'src/utils/sudoku'

export const useFixedNumbersGrid = (gridSize: number, fixedNumbers?: FixedNumber[]) => (
  useMemo(() => computeFixedNumbersGrid(gridSize, fixedNumbers), [gridSize, fixedNumbers])
)
