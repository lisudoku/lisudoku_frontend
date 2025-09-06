import { CellPosition, Grid } from './sudoku'

export enum SolverType {
  Brute = 'brute',
  Logical = 'logical',
}

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
  invalid_state_reason: InvalidStateReason
}

export type InvalidStateReason = {
  state_type: InvalidStateType
  area: any
  values: number[]
}

export enum InvalidStateType {
  CellNoCandidates = 'CellNoCandidates',
  CellEmpty = 'CellEmpty',
  CellInvalidValue = 'CellInvalidValue',
  AreaValueConflict = 'AreaValueConflict',
  AreaCandidates = 'AreaCandidates',
  AreaConstraint = 'AreaConstraint',
}

export enum StepRule {
  // Easy
  NakedSingle = 'NakedSingle',
  HiddenSingle = 'HiddenSingle',
  Thermo = 'Thermo',
  PalindromeValues = 'PalindromeValues',
  // Medium
  Candidates = 'Candidates',
  ThermoCandidates = 'ThermoCandidates',
  KillerCandidates = 'KillerCandidates',
  ArrowCandidates = 'ArrowCandidates',
  RenbanCandidates = 'RenbanCandidates',
  PalindromeCandidates = 'PalindromeCandidates',
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
  AdhocNakedSet = 'AdhocNakedSet',
  NishioForcingChains = 'NishioForcingChains',
}
