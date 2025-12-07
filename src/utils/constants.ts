import { Rule } from 'lisudoku-solver'
import { invert, mapValues, toInteger, values } from 'lodash-es'
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

export const SudokuVariantDisplay: { [key in SudokuVariant]: string } = {
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

export const SudokuVariantRank = mapValues(invert(values(SudokuVariant)), toInteger)

export const SudokuDifficultyDisplay: { [key in SudokuDifficulty]: string } = {
  [SudokuDifficulty.Easy4x4]: 'Easy 4x4',
  [SudokuDifficulty.Easy6x6]: 'Easy 6x6',
  [SudokuDifficulty.Hard6x6]: 'Hard 6x6',
  [SudokuDifficulty.Easy9x9]: 'Easy 9x9',
  [SudokuDifficulty.Medium9x9]: 'Medium 9x9',
  [SudokuDifficulty.Hard9x9]: 'Hard 9x9',
}

export const SudokuDifficultyRank = mapValues(invert(values(SudokuDifficulty)), toInteger)

export const StepRuleDisplay: { [key in Rule]: string } = {
  HiddenSingle: 'Hidden Single',
  NakedSingle: 'Naked Single',
  Thermo: 'Thermo Single',
  PalindromeValues: 'Palindrome Values',
  Candidates: 'Candidates',
  ThermoCandidates: 'Thermo Candidates',
  KillerCandidates: 'Killer Cage Candidates',
  ArrowCandidates: 'Arrow Candidates',
  RenbanCandidates: 'Renban Candidates',
  PalindromeCandidates: 'Palindrome Candidates',
  ArrowAdvancedCandidates: 'Arrow Advanced Candidates',
  KropkiAdvancedCandidates: 'Kropki Dot Chain Advanced Logic',
  Killer45: 'Killer Sum Rule',
  Kropki: 'Kropki Dot Pair Logic',
  KropkiChainCandidates: 'Kropki Dot Chain Logic',
  TopBottomCandidates: 'Top-Bottom Candidates',
  LockedCandidatesPairs: 'Locked Candidate Pairs',
  NakedPairs: 'Naked Pairs',
  HiddenPairs: 'Hidden Pairs',
  CommonPeerEliminationKropki: 'Common Peer Elimination (Kropki)',
  CommonPeerEliminationArrow: 'Common Peer Elimination (Arrow)',
  LockedCandidatesTriples: 'Locked Candidate Triples',
  NakedTriples: 'Naked Triples',
  HiddenTriples: 'Hidden Triples',
  XWing: 'X-Wing',
  XYWing: 'XY-Wing',
  Swordfish: 'Swordfish',
  CommonPeerElimination: 'Common Peer Elimination',
  TurbotFish: 'Turbot Fish',
  EmptyRectangles: 'Empty Rectangle',
  AdhocNakedSet: 'Adhoc Naked Set',
  NishioForcingChains: 'Nishio Forcing Chains',
  PhistomefelRing: 'Phistomefel Ring',
}

export const enum EStepRuleDifficulty {
  Easy,
  Medium,
  Hard,
}

export const StepRuleDifficultyDisplay: { [key in EStepRuleDifficulty]: string } = {
  [EStepRuleDifficulty.Easy]: 'Easy',
  [EStepRuleDifficulty.Medium]: 'Medium',
  [EStepRuleDifficulty.Hard]: 'Hard',
}

export const StepRuleDifficulty: { [key in Rule]: EStepRuleDifficulty } = {
  HiddenSingle: EStepRuleDifficulty.Easy,
  NakedSingle: EStepRuleDifficulty.Easy,
  Thermo: EStepRuleDifficulty.Easy,
  PalindromeValues: EStepRuleDifficulty.Easy,

  Candidates: EStepRuleDifficulty.Medium,
  ThermoCandidates: EStepRuleDifficulty.Medium,
  KillerCandidates: EStepRuleDifficulty.Medium,
  ArrowCandidates: EStepRuleDifficulty.Medium,
  RenbanCandidates: EStepRuleDifficulty.Medium,
  PalindromeCandidates: EStepRuleDifficulty.Medium,
  ArrowAdvancedCandidates: EStepRuleDifficulty.Medium,
  Killer45: EStepRuleDifficulty.Medium,
  Kropki: EStepRuleDifficulty.Medium,
  KropkiChainCandidates: EStepRuleDifficulty.Medium,
  KropkiAdvancedCandidates: EStepRuleDifficulty.Medium,
  TopBottomCandidates: EStepRuleDifficulty.Medium,
  LockedCandidatesPairs: EStepRuleDifficulty.Medium,
  NakedPairs: EStepRuleDifficulty.Medium,
  HiddenPairs: EStepRuleDifficulty.Medium,

  CommonPeerEliminationKropki: EStepRuleDifficulty.Hard,
  CommonPeerEliminationArrow: EStepRuleDifficulty.Hard,
  LockedCandidatesTriples: EStepRuleDifficulty.Hard,
  NakedTriples: EStepRuleDifficulty.Hard,
  HiddenTriples: EStepRuleDifficulty.Hard,
  XWing: EStepRuleDifficulty.Hard,
  XYWing: EStepRuleDifficulty.Hard,
  Swordfish: EStepRuleDifficulty.Hard,
  CommonPeerElimination: EStepRuleDifficulty.Hard,
  TurbotFish: EStepRuleDifficulty.Hard,
  EmptyRectangles: EStepRuleDifficulty.Hard,
  AdhocNakedSet: EStepRuleDifficulty.Hard,
  NishioForcingChains: EStepRuleDifficulty.Hard,
  PhistomefelRing: EStepRuleDifficulty.Hard,
}

export const TrainerTechniqueDisplay: { [key in TrainerTechnique]: string } = {
  [TrainerTechnique.HiddenSingle]: 'Hidden Single',
  [TrainerTechnique.NakedSingle]: 'Naked Single',
  [TrainerTechnique.Singles]: 'Hidden Single or Naked Single',
}

export const CONSTRAINT_TYPE_VARIANTS: { [key in ConstraintType]: SudokuVariant } = {
  [ConstraintType.FixedNumber]: SudokuVariant.Classic,
  [ConstraintType.Regions]: SudokuVariant.Irregular,
  [ConstraintType.ExtraRegions]: SudokuVariant.ExtraRegions,
  [ConstraintType.Thermo]: SudokuVariant.Thermo,
  [ConstraintType.Arrow]: SudokuVariant.Arrow,
  [ConstraintType.Renban]: SudokuVariant.Renban,
  [ConstraintType.Palindrome]: SudokuVariant.Palindrome,
  [ConstraintType.PrimaryDiagonal]: SudokuVariant.Diagonal,
  [ConstraintType.SecondaryDiagonal]: SudokuVariant.Diagonal,
  [ConstraintType.Diagonals]: SudokuVariant.Diagonal,
  [ConstraintType.AntiKnight]: SudokuVariant.AntiKnight,
  [ConstraintType.AntiKing]: SudokuVariant.AntiKing,
  [ConstraintType.KillerCage]: SudokuVariant.Killer,
  [ConstraintType.KropkiConsecutive]: SudokuVariant.Kropki,
  [ConstraintType.KropkiDouble]: SudokuVariant.Kropki,
  [ConstraintType.KropkiNegative]: SudokuVariant.Kropki,
  [ConstraintType.Odd]: SudokuVariant.OddEven,
  [ConstraintType.Even]: SudokuVariant.OddEven,
  [ConstraintType.TopBottom]: SudokuVariant.TopBottom,
}

export const GRID_STEPS: Rule[] = ['HiddenSingle', 'NakedSingle', 'Thermo', 'PalindromeValues']
