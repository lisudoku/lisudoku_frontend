import { CellPosition, Grid } from './sudoku'

export type SudokuBruteSolveResult = {
  solution_count: number
  solution?: Grid
}

export type SudokuIntuitiveSolveResult = {
  solution_type: SolutionType
  solution?: Grid
  steps?: SolutionStep[]
}

export enum SolutionType {
  Full = 'Full',
  Partial = 'Partial',
  None = 'None',
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
  KillerCandidates = 'KillerCandidates',
  Killer45 = 'Killer45',
  Kropki = 'Kropki',
  KropkiChainCandidates = 'KropkiChainCandidates',
  LockedCandidatesPairs = 'LockedCandidatesPairs',
  NakedPairs = 'NakedPairs',
  HiddenPairs = 'HiddenPairs',
  CommonPeerEliminationKropki = 'CommonPeerEliminationKropki',
  // Hard
  LockedCandidatesTriples = 'LockedCandidatesTriples',
  HiddenTriples = 'HiddenTriples',
  NakedTriples = 'NakedTriples',
  XWing = 'XWing',
  YWing = 'YWing',
  XYWing = 'XYWing',
  Swordfish = 'Swordfish',
  CommonPeerElimination = 'CommonPeerElimination',
}
