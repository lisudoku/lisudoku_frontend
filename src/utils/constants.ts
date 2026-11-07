import type { TechniqueKind } from 'lisudoku-solver'
import { invert, mapValues, toInteger, values } from 'lodash-es'
import { ReactNode } from 'react'
import { constraintDefinitions } from 'src/constraints/definitions'
import { diagonalsConstraint } from 'src/constraints/diagonal/diagonals'
import { oddEvenIcon } from 'src/constraints/odd_even/odd_even'
import { TrainerTechnique } from 'src/types'
import { ConstraintType, SudokuDifficulty, SudokuVariant } from 'src/types/sudoku'

export const GRID_SIZES = [ 4, 6, 9 ]

export const ACTIVE_VARIANTS: SudokuVariant[] = [
  SudokuVariant.Classic,
  SudokuVariant.Arrow,
  SudokuVariant.Thermo,
  SudokuVariant.Kropki,
  SudokuVariant.Diagonal,
  SudokuVariant.AntiKnight,
  SudokuVariant.AntiKing,
  SudokuVariant.Irregular,
  SudokuVariant.ExtraRegions,
  SudokuVariant.OddEven,
  SudokuVariant.TopBottom,
  SudokuVariant.Killer,
  SudokuVariant.Renban,
  SudokuVariant.Palindrome,
  SudokuVariant.Mixed,
]

export const DEFAULT_CELL_SIZE = 56

export const SudokuVariantDisplay: Record<SudokuVariant, string> = {
  [SudokuVariant.Classic]: 'Classic',
  [SudokuVariant.Killer]: 'Killer',
  [SudokuVariant.Thermo]: 'Thermo',
  [SudokuVariant.Arrow]: 'Arrow',
  [SudokuVariant.Irregular]: 'Irregular',
  [SudokuVariant.Kropki]: 'Kropki',
  [SudokuVariant.TopBottom]: 'Top-Bottom',
  [SudokuVariant.Diagonal]: 'Diagonal',
  [SudokuVariant.AntiKnight]: 'Anti Knight',
  [SudokuVariant.AntiKing]: 'Anti King',
  [SudokuVariant.ExtraRegions]: 'Extra Regions',
  [SudokuVariant.OddEven]: 'Odd Even',
  [SudokuVariant.Renban]: 'Renban',
  [SudokuVariant.Palindrome]: 'Palindrome',
  [SudokuVariant.Mixed]: 'Mixed',
}

export const SudokuVariantIcon: Record<SudokuVariant, ReactNode> = {
  [SudokuVariant.Classic]: null,
  [SudokuVariant.Killer]: constraintDefinitions[ConstraintType.KillerCage].icon,
  [SudokuVariant.Thermo]: constraintDefinitions[ConstraintType.Thermo].icon,
  [SudokuVariant.Arrow]: constraintDefinitions[ConstraintType.Arrow].icon,
  [SudokuVariant.Irregular]: '┏┛',
  [SudokuVariant.Kropki]: constraintDefinitions[ConstraintType.KropkiConsecutive].icon,
  [SudokuVariant.TopBottom]: constraintDefinitions[ConstraintType.TopBottom].icon,
  [SudokuVariant.Diagonal]: diagonalsConstraint.icon,
  [SudokuVariant.AntiKnight]: constraintDefinitions[ConstraintType.AntiKnight].icon,
  [SudokuVariant.AntiKing]: constraintDefinitions[ConstraintType.AntiKing].icon,
  [SudokuVariant.ExtraRegions]: constraintDefinitions[ConstraintType.ExtraRegions].icon,
  [SudokuVariant.OddEven]: oddEvenIcon,
  [SudokuVariant.Renban]: constraintDefinitions[ConstraintType.Renban].icon,
  [SudokuVariant.Palindrome]: constraintDefinitions[ConstraintType.Palindrome].icon,
  [SudokuVariant.Mixed]: '❓',
}

export const SudokuVariantRank = mapValues(invert(values(SudokuVariant)), toInteger)

export const SudokuDifficultyDisplay: Record<SudokuDifficulty, string> = {
  [SudokuDifficulty.Easy4x4]: 'Easy 4x4',
  [SudokuDifficulty.Easy6x6]: 'Easy 6x6',
  [SudokuDifficulty.Hard6x6]: 'Hard 6x6',
  [SudokuDifficulty.Easy9x9]: 'Easy 9x9',
  [SudokuDifficulty.Medium9x9]: 'Medium 9x9',
  [SudokuDifficulty.Hard9x9]: 'Hard 9x9',
}

export const SudokuDifficultyRank = mapValues(invert(values(SudokuDifficulty)), toInteger)

export const TechniqueDisplay: Record<TechniqueKind, string> = {
  HiddenSingle: 'Hidden Single',
  NakedSingle: 'Naked Single',
  ThermoNakedSingle: 'Thermo Single',
  PalindromeValue: 'Palindrome Value',
  CandidateInitialization: 'Candidates',
  ThermoCandidateUpdate: 'Thermo Candidates',
  KillerCandidateUpdate: 'Killer Cage Candidates',
  ArrowCandidateUpdate: 'Arrow Candidates',
  RenbanCandidateUpdate: 'Renban Candidates',
  PalindromeCandidateUpdate: 'Palindrome Candidates',
  ArrowAdvancedCandidateUpdate: 'Arrow Advanced Candidates',
  KropkiAdvancedCandidateUpdate: 'Kropki Dot Chain Advanced Logic',
  Killer45: 'Killer Sum Rule',
  KropkiPairCandidateUpdate: 'Kropki Dot Pair Logic',
  KropkiChainCandidateUpdate: 'Kropki Dot Chain Logic',
  TopBottomCandidateUpdate: 'Top-Bottom Candidates',
  LockedCandidatePair: 'Locked Candidate Pair',
  NakedPair: 'Naked Pair',
  HiddenPair: 'Hidden Pair',
  KropkiCommonPeerElimination: 'Common Peer Elimination (Kropki)',
  ArrowCommonPeerElimination: 'Common Peer Elimination (Arrow)',
  LockedCandidateTriple: 'Locked Candidate Triple',
  NakedTriple: 'Naked Triple',
  HiddenTriple: 'Hidden Triple',
  XWing: 'X-Wing',
  XYWing: 'Y-Wing',
  CommonPeerElimination: 'Common Peer Elimination',
  TurbotFish: 'Turbot Fish',
  EmptyRectangle: 'Empty Rectangle',
  AdhocNakedSet: 'Adhoc Naked Set',
  NishioForcingChain: 'Nishio Forcing Chain',
}

export const enum ETechniqueDifficulty {
  Easy,
  Medium,
  Hard,
}

export const TechniqueDifficultyDisplay: Record<ETechniqueDifficulty, string> = {
  [ETechniqueDifficulty.Easy]: 'Easy',
  [ETechniqueDifficulty.Medium]: 'Medium',
  [ETechniqueDifficulty.Hard]: 'Hard',
}

export const TechniqueDifficulty: Record<TechniqueKind, ETechniqueDifficulty> = {
  HiddenSingle: ETechniqueDifficulty.Easy,
  NakedSingle: ETechniqueDifficulty.Easy,
  ThermoNakedSingle: ETechniqueDifficulty.Easy,
  PalindromeValue: ETechniqueDifficulty.Easy,

  CandidateInitialization: ETechniqueDifficulty.Medium,
  ThermoCandidateUpdate: ETechniqueDifficulty.Medium,
  KillerCandidateUpdate: ETechniqueDifficulty.Medium,
  ArrowCandidateUpdate: ETechniqueDifficulty.Medium,
  RenbanCandidateUpdate: ETechniqueDifficulty.Medium,
  PalindromeCandidateUpdate: ETechniqueDifficulty.Medium,
  ArrowAdvancedCandidateUpdate: ETechniqueDifficulty.Medium,
  Killer45: ETechniqueDifficulty.Medium,
  KropkiPairCandidateUpdate: ETechniqueDifficulty.Medium,
  KropkiChainCandidateUpdate: ETechniqueDifficulty.Medium,
  KropkiAdvancedCandidateUpdate: ETechniqueDifficulty.Medium,
  TopBottomCandidateUpdate: ETechniqueDifficulty.Medium,
  LockedCandidatePair: ETechniqueDifficulty.Medium,
  NakedPair: ETechniqueDifficulty.Medium,
  HiddenPair: ETechniqueDifficulty.Medium,

  KropkiCommonPeerElimination: ETechniqueDifficulty.Hard,
  ArrowCommonPeerElimination: ETechniqueDifficulty.Hard,
  LockedCandidateTriple: ETechniqueDifficulty.Hard,
  NakedTriple: ETechniqueDifficulty.Hard,
  HiddenTriple: ETechniqueDifficulty.Hard,
  XWing: ETechniqueDifficulty.Hard,
  XYWing: ETechniqueDifficulty.Hard,
  CommonPeerElimination: ETechniqueDifficulty.Hard,
  TurbotFish: ETechniqueDifficulty.Hard,
  EmptyRectangle: ETechniqueDifficulty.Hard,
  AdhocNakedSet: ETechniqueDifficulty.Hard,
  NishioForcingChain: ETechniqueDifficulty.Hard,
}

export const TrainerTechniqueDisplay: Record<TrainerTechnique, string> = {
  [TrainerTechnique.HiddenSingle]: 'Hidden Single',
  [TrainerTechnique.NakedSingle]: 'Naked Single',
  [TrainerTechnique.Singles]: 'Hidden Single or Naked Single',
}

export const GRID_STEPS: TechniqueKind[] = ['HiddenSingle', 'NakedSingle', 'ThermoNakedSingle', 'PalindromeValue']
