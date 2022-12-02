import _ from 'lodash'
import { SudokuDifficulty, SudokuVariant } from 'src/types/sudoku'

export const DEFAULT_CELL_SIZE = 56

export const SudokuVariantDisplay = {
  [SudokuVariant.Classic]: 'Classic',
  [SudokuVariant.Killer]: 'Killer',
  [SudokuVariant.Thermo]: 'Thermo',
  [SudokuVariant.Arrow]: 'Arrow',
  [SudokuVariant.Irregular]: 'Irregular',
  [SudokuVariant.Kropki]: 'Kropki',
  [SudokuVariant.TopBot]: 'Top-Bot',
  [SudokuVariant.Diagonal]: 'Diagonal',
  [SudokuVariant.Mixed]: 'Mixed',
}

export const SudokuVariantRank = _.chain(SudokuVariant).values().invert().mapValues(_.toInteger).value()

export const SudokuDifficultyDisplay = {
  [SudokuDifficulty.Easy4x4]: 'Easy 4x4',
  [SudokuDifficulty.Easy6x6]: 'Easy 6x6',
  [SudokuDifficulty.Easy9x9]: 'Easy 9x9',
  [SudokuDifficulty.Medium9x9]: 'Medium 9x9',
  [SudokuDifficulty.Hard9x9]: 'Hard 9x9',
}

export const SudokuDifficultyRank = _.chain(SudokuDifficulty).values().invert().mapValues(_.toInteger).value()
