import { FixedNumber } from 'src/types/sudoku'

export const computeFixedNumbersGrid = (gridSize: number, fixedNumbers: FixedNumber[]) => {
  const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null))
  for (const fixedNumber of fixedNumbers) {
    grid[fixedNumber.position.row][fixedNumber.position.col] = fixedNumber.value
  }
  return grid
}
