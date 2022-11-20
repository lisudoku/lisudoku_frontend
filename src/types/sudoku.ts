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
  Easy4x4 = 'easy_4x4',
  Easy6x6 = 'easy_6x6',
  Easy9x9 = 'easy_9x9',
  Medium9x9 = 'medium_9x9',
  Hard9x9 = 'hard_9x9',
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
