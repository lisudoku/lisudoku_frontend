import _ from 'lodash'
import { SudokuDifficulty, SudokuVariant } from 'src/types/sudoku'
import { StepRule } from 'src/types/wasm'

export const ACTIVE_VARIANTS: SudokuVariant[] = [
  SudokuVariant.Classic,
  SudokuVariant.Killer,
  SudokuVariant.Thermo,
  SudokuVariant.Kropki,
  SudokuVariant.Diagonal,
  SudokuVariant.AntiKnight,
  SudokuVariant.Irregular,
  SudokuVariant.ExtraRegions,
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
  [SudokuVariant.TopBot]: 'Top-Bot',
  [SudokuVariant.Diagonal]: 'Diagonal',
  [SudokuVariant.AntiKnight]: 'Anti Knight',
  [SudokuVariant.ExtraRegions]: 'Extra Regions',
  [SudokuVariant.Mixed]: 'Mixed',
}

export const SudokuVariantRank = _.chain(SudokuVariant).values().invert().mapValues(_.toInteger).value()

export const SudokuDifficultyDisplay: { [key in SudokuDifficulty]: string } = {
  [SudokuDifficulty.Easy4x4]: 'Easy 4x4',
  [SudokuDifficulty.Easy6x6]: 'Easy 6x6',
  [SudokuDifficulty.Hard6x6]: 'Hard 6x6',
  [SudokuDifficulty.Easy9x9]: 'Easy 9x9',
  [SudokuDifficulty.Medium9x9]: 'Medium 9x9',
  [SudokuDifficulty.Hard9x9]: 'Hard 9x9',
}

export const SudokuDifficultyRank = _.chain(SudokuDifficulty).values().invert().mapValues(_.toInteger).value()

export const StepRuleDisplay: { [key in StepRule]: string } = {
  [StepRule.HiddenSingle]: 'Hidden single',
  [StepRule.NakedSingle]: 'Naked single',
  [StepRule.Thermo]: 'Thermo single',
  [StepRule.Candidates]: 'Candidates',
  [StepRule.ThermoCandidates]: 'Thermo candidates',
  [StepRule.KillerCandidates]: 'Killer cage candidates',
  [StepRule.Killer45]: 'Killer sums rule',
  [StepRule.Kropki]: 'Kropki dot pair logic',
  [StepRule.KropkiChainCandidates]: 'Kropki dot chain logic',
  [StepRule.LockedCandidatesPairs]: 'Locked candidate pairs',
  [StepRule.NakedPairs]: 'Naked pairs',
  [StepRule.HiddenPairs]: 'Hidden pairs',
  [StepRule.CommonPeerEliminationKropki]: 'Common peer elimination (kropki)',
  [StepRule.LockedCandidatesTriples]: 'Locked candidate triples',
  [StepRule.NakedTriples]: 'Naked triples',
  [StepRule.HiddenTriples]: 'Hidden triples',
  [StepRule.XWing]: 'X-Wing',
  [StepRule.YWing]: 'Y-Wing',
  [StepRule.XYWing]: 'XY-Wing',
  [StepRule.Swordfish]: 'Swordfish',
  [StepRule.CommonPeerElimination]: 'Common peer elimination',
}
