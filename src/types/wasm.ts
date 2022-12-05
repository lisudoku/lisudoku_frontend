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
  // Easy
  NakedSingle = 'NakedSingle',
  HiddenSingle = 'HiddenSingle',
  Thermo = 'Thermo',
  // Medium
  Candidates = 'Candidates',
  ThermoCandidates = 'ThermoCandidates',
  LockedCandidates = 'LockedCandidates',
  NakedPairs = 'NakedPairs',
  // Hard
  NakedTriples = 'NakedTriples',
  XWing = 'XWing',
  YWing = 'YWing',
  Swordfish = 'Swordfish',
}
