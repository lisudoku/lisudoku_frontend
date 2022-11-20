import { CellPosition, Grid } from './sudoku'

export type SudokuSolveResult = {
  solution_count: number
  solution: Grid
  steps: SolutionStep[]
}

export type SolutionStep = {
  rule: string
  cells: CellPosition[]
  values: number[]
  areas: any[]
  affected_cells: CellPosition[]
}
