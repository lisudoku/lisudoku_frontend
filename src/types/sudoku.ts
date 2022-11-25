export type CellPosition = {
  row: number
  col: number
}

export type Grid = (number | null)[][]

export enum SudokuVariant {
  Classic = 'classic',
  Killer = 'killer',
  Thermo = 'thermo',
  Arrow = 'arrow',
  Irregular = 'irregular',
  Kropki = 'kropki',
  TopBot = 'topbot',
  Diagonal = 'diagonal',
  Mixed = 'mixed',
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
}

export type FixedNumber = {
  position: CellPosition
  value: number
}

export type Region = CellPosition[]

export type Thermo = CellPosition[]

export type Puzzle = {
  publicId: string,
  variant: SudokuVariant,
  difficulty: SudokuDifficulty,
  constraints: SudokuConstraints,
}