export type CellPosition = {
  row: number
  col: number
}

export type Grid = (number | null)[][]

export enum SudokuVariant {
  Classic = 'classic',
  Thermo = 'thermo',
  Killer = 'killer',
  Arrow = 'arrow',
  Irregular = 'irregular',
  Kropki = 'kropki',
  TopBot = 'topbot',
  Diagonal = 'diagonal',
  Mixed = 'mixed',
  AntiKnight = 'antiknight',
}

export enum SudokuDifficulty {
  Easy4x4 = 'easy4x4',
  Easy6x6 = 'easy6x6',
  Easy9x9 = 'easy9x9',
  Medium9x9 = 'medium9x9',
  Hard9x9 = 'hard9x9',
}

export type SudokuConstraints = {
  gridSize: number
  fixedNumbers: FixedNumber[]
  regions: Region[]
  thermos?: Thermo[]
  primaryDiagonal: boolean
  secondaryDiagonal: boolean
  antiKnight: boolean
  killerCages: KillerCage[]
}

export type FixedNumber = {
  position: CellPosition
  value: number
}

export type Region = CellPosition[]

export type Thermo = CellPosition[]

export type KillerCage = {
  sum: number | null
  region: Region
}

export type Puzzle = {
  variant: SudokuVariant
  difficulty: SudokuDifficulty
  constraints: SudokuConstraints
  publicId?: string
  solution?: Grid
}
