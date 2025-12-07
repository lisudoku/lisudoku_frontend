import { SudokuConstraints } from 'lisudoku-solver'

export type Grid = (number | null)[][]

export type CellMarks = {
  cornerMarks?: number[]
  centerMarks?: number[]
}

export enum SudokuVariant {
  Classic = 'classic',
  Thermo = 'thermo',
  Killer = 'killer',
  Arrow = 'arrow',
  Irregular = 'irregular',
  Kropki = 'kropki',
  TopBottom = 'topbot',
  Diagonal = 'diagonal',
  Mixed = 'mixed',
  AntiKnight = 'antiknight',
  AntiKing = 'antiking',
  ExtraRegions = 'extraregions',
  OddEven = 'oddeven',
  Renban = 'renban',
  Palindrome = 'palindrome',
}

export enum SudokuDifficulty {
  Easy4x4 = 'easy4x4',
  Easy6x6 = 'easy6x6',
  Hard6x6 = 'hard6x6',
  Easy9x9 = 'easy9x9',
  Medium9x9 = 'medium9x9',
  Hard9x9 = 'hard9x9',
}

type BooleanConstraints = |
  'primaryDiagonal' | 'secondaryDiagonal' | 'antiKnight' | 'antiKing' | 'kropkiNegative' | 'topBottom'
export type ConstraintKeyType = keyof Pick<SudokuConstraints, BooleanConstraints>

export enum ConstraintType {
  FixedNumber = 'fixed_number',
  Regions = 'regions',
  ExtraRegions = 'extraregions',
  Thermo = 'thermo',
  Arrow = 'arrow',
  Renban = 'renban',
  Palindrome = 'palindrome',
  PrimaryDiagonal = 'primary_diagonal',
  SecondaryDiagonal = 'secondary_diagonal',
  Diagonals = 'diagonals',
  AntiKnight = 'anti_knight',
  AntiKing = 'anti_king',
  KillerCage = 'killer_cage',
  KropkiConsecutive = 'kropki_consecutive',
  KropkiDouble = 'kropki_double',
  KropkiNegative = 'kropki_negative',
  Odd = 'odd',
  Even = 'even',
  TopBottom = 'top_bottom',
}

export type Puzzle = {
  id?: string
  variant?: SudokuVariant
  difficulty?: SudokuDifficulty
  constraints: SudokuConstraints
  publicId?: string
  solution?: Grid
  sourceCollectionId?: number
  sourceCollectionName?: string
  author?: string
  isExternal?: boolean
  externalData?: string
}
