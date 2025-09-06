import { invert, mapValues, toInteger, values } from 'lodash-es'
import { TrainerTechnique } from 'src/types'
import { ConstraintType, SudokuDifficulty, SudokuVariant } from 'src/types/sudoku'
import { StepRule } from 'src/types/wasm'

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

export const StepRuleDisplay: { [key in StepRule]: string } = {
  [StepRule.HiddenSingle]: 'Hidden Single',
  [StepRule.NakedSingle]: 'Naked Single',
  [StepRule.Thermo]: 'Thermo Single',
  [StepRule.PalindromeValues]: 'Palindrome Values',
  [StepRule.Candidates]: 'Candidates',
  [StepRule.ThermoCandidates]: 'Thermo Candidates',
  [StepRule.KillerCandidates]: 'Killer Cage Candidates',
  [StepRule.ArrowCandidates]: 'Arrow Candidates',
  [StepRule.RenbanCandidates]: 'Renban Candidates',
  [StepRule.PalindromeCandidates]: 'Palindrome Candidates',
  [StepRule.ArrowAdvancedCandidates]: 'Arrow Advanced Candidates',
  [StepRule.KropkiAdvancedCandidates]: 'Kropki Dot Chain Advanced Logic',
  [StepRule.Killer45]: 'Killer Sum Rule',
  [StepRule.Kropki]: 'Kropki Dot Pair Logic',
  [StepRule.KropkiChainCandidates]: 'Kropki Dot Chain Logic',
  [StepRule.TopBottomCandidates]: 'Top-Bottom Candidates',
  [StepRule.LockedCandidatesPairs]: 'Locked Candidate Pairs',
  [StepRule.NakedPairs]: 'Naked Pairs',
  [StepRule.HiddenPairs]: 'Hidden Pairs',
  [StepRule.CommonPeerEliminationKropki]: 'Common Peer Elimination (Kropki)',
  [StepRule.CommonPeerEliminationArrow]: 'Common Peer Elimination (Arrow)',
  [StepRule.LockedCandidatesTriples]: 'Locked Candidate Triples',
  [StepRule.NakedTriples]: 'Naked Triples',
  [StepRule.HiddenTriples]: 'Hidden Triples',
  [StepRule.XWing]: 'X-Wing',
  [StepRule.YWing]: 'Y-Wing',
  [StepRule.XYWing]: 'XY-Wing',
  [StepRule.Swordfish]: 'Swordfish',
  [StepRule.CommonPeerElimination]: 'Common Peer Elimination',
  [StepRule.TurbotFish]: 'Turbot Fish',
  [StepRule.EmptyRectangles]: 'Empty Rectangle',
  [StepRule.AdhocNakedSet]: 'Adhoc Naked Set',
  [StepRule.NishioForcingChains]: 'Nishio Forcing Chains',
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

export const StepRuleDifficulty: { [key in StepRule]: EStepRuleDifficulty } = {
  [StepRule.HiddenSingle]: EStepRuleDifficulty.Easy,
  [StepRule.NakedSingle]: EStepRuleDifficulty.Easy,
  [StepRule.Thermo]: EStepRuleDifficulty.Easy,
  [StepRule.PalindromeValues]: EStepRuleDifficulty.Easy,

  [StepRule.Candidates]: EStepRuleDifficulty.Medium,
  [StepRule.ThermoCandidates]: EStepRuleDifficulty.Medium,
  [StepRule.KillerCandidates]: EStepRuleDifficulty.Medium,
  [StepRule.ArrowCandidates]: EStepRuleDifficulty.Medium,
  [StepRule.RenbanCandidates]: EStepRuleDifficulty.Medium,
  [StepRule.PalindromeCandidates]: EStepRuleDifficulty.Medium,
  [StepRule.ArrowAdvancedCandidates]: EStepRuleDifficulty.Medium,
  [StepRule.Killer45]: EStepRuleDifficulty.Medium,
  [StepRule.Kropki]: EStepRuleDifficulty.Medium,
  [StepRule.KropkiChainCandidates]: EStepRuleDifficulty.Medium,
  [StepRule.KropkiAdvancedCandidates]: EStepRuleDifficulty.Medium,
  [StepRule.TopBottomCandidates]: EStepRuleDifficulty.Medium,
  [StepRule.LockedCandidatesPairs]: EStepRuleDifficulty.Medium,
  [StepRule.NakedPairs]: EStepRuleDifficulty.Medium,
  [StepRule.HiddenPairs]: EStepRuleDifficulty.Medium,

  [StepRule.CommonPeerEliminationKropki]: EStepRuleDifficulty.Hard,
  [StepRule.CommonPeerEliminationArrow]: EStepRuleDifficulty.Hard,
  [StepRule.LockedCandidatesTriples]: EStepRuleDifficulty.Hard,
  [StepRule.NakedTriples]: EStepRuleDifficulty.Hard,
  [StepRule.HiddenTriples]: EStepRuleDifficulty.Hard,
  [StepRule.XWing]: EStepRuleDifficulty.Hard,
  [StepRule.YWing]: EStepRuleDifficulty.Hard,
  [StepRule.XYWing]: EStepRuleDifficulty.Hard,
  [StepRule.Swordfish]: EStepRuleDifficulty.Hard,
  [StepRule.CommonPeerElimination]: EStepRuleDifficulty.Hard,
  [StepRule.TurbotFish]: EStepRuleDifficulty.Hard,
  [StepRule.EmptyRectangles]: EStepRuleDifficulty.Hard,
  [StepRule.AdhocNakedSet]: EStepRuleDifficulty.Hard,
  [StepRule.NishioForcingChains]: EStepRuleDifficulty.Hard,
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

export const GRID_STEPS = [StepRule.HiddenSingle, StepRule.NakedSingle, StepRule.Thermo, StepRule.PalindromeValues]
