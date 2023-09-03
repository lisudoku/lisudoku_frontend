import { CellPosition, Grid } from './sudoku'

export type SudokuBruteSolveResult = {
  solution_count: number
  solution?: Grid
}

export type SudokuLogicalSolveResult = {
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
  ArrowCandidates = 'ArrowCandidates',
  ArrowAdvancedCandidates = 'ArrowAdvancedCandidates',
  KropkiAdvancedCandidates = 'KropkiAdvancedCandidates',
  Killer45 = 'Killer45',
  Kropki = 'Kropki',
  KropkiChainCandidates = 'KropkiChainCandidates',
  TopBottomCandidates = 'TopBottomCandidates',
  LockedCandidatesPairs = 'LockedCandidatesPairs',
  NakedPairs = 'NakedPairs',
  HiddenPairs = 'HiddenPairs',
  // Hard
  LockedCandidatesTriples = 'LockedCandidatesTriples',
  HiddenTriples = 'HiddenTriples',
  NakedTriples = 'NakedTriples',
  XWing = 'XWing',
  YWing = 'YWing',
  XYWing = 'XYWing',
  Swordfish = 'Swordfish',
  CommonPeerElimination = 'CommonPeerElimination',
  CommonPeerEliminationKropki = 'CommonPeerEliminationKropki',
  CommonPeerEliminationArrow = 'CommonPeerEliminationArrow',
  TurbotFish = 'TurbotFish',
  EmptyRectangles = 'EmptyRectangles',
}
