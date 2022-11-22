import { SudokuDifficulty, SudokuVariant } from 'src/types/sudoku'

export const CELL_SIZE = 56

export const NOTES_FONT_SIZE = 12
export const NOTES_FONT_WIDTH = NOTES_FONT_SIZE * 2 / 3
export const NOTES_PADDING = 4
export const NOTES_SIZE = CELL_SIZE - NOTES_PADDING * 2
export const NOTES_COLUMN_SIZE = NOTES_SIZE / 3

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

export const SudokuDifficultyDisplay = {
  [SudokuDifficulty.Easy4x4]: 'Easy 4x4',
  [SudokuDifficulty.Easy6x6]: 'Easy 6x6',
  [SudokuDifficulty.Easy9x9]: 'Easy 9x9',
  [SudokuDifficulty.Medium9x9]: 'Medium 9x9',
  [SudokuDifficulty.Hard9x9]: 'Hard 9x9',
}
