import { CellPosition, Grid } from './sudoku'

export type SudokuBruteSolveResult = {
  solution_count: number
  solution?: Grid
}

export type SudokuIntuitiveSolveResult = {
  full_solution: boolean
  no_solution: boolean
  solution?: Grid
  steps?: SolutionStep[]
}

export type SolutionStep = {
  rule: StepRule
  cells: CellPosition[]
  values: number[]
  areas: any[]
  affected_cells: CellPosition[]
}

export enum StepRule {
  NakedSingle = 'NakedSingle',
  HiddenSingle = 'HiddenSingle',
  Thermo = 'Thermo',
  NakedPairs = 'NakedPairs',
  PointingPairs = 'PointingPairs',
  XWing = 'XWing',
  YWing = 'YWing',
  Swordfish = 'Swordfish',
}
