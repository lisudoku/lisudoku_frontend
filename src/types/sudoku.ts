export type CellPosition = {
  row: number
  col: number
}

export type Grid = (number | null)[][]

export type CellNotes = number[]

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
}

export enum SudokuDifficulty {
  Easy4x4 = 'easy4x4',
  Easy6x6 = 'easy6x6',
  Hard6x6 = 'hard6x6',
  Easy9x9 = 'easy9x9',
  Medium9x9 = 'medium9x9',
  Hard9x9 = 'hard9x9',
}

export type SudokuConstraints = {
  gridSize: number
  fixedNumbers: FixedNumber[]
  regions: Region[]
  extraRegions: Region[]
  thermos?: Thermo[]
  primaryDiagonal: boolean
  secondaryDiagonal: boolean
  antiKnight: boolean
  antiKing: boolean
  killerCages: KillerCage[]
  kropkiDots: KropkiDot[]
  kropkiNegative: boolean
  oddCells: CellPosition[]
  evenCells: CellPosition[]
  topBottom: boolean
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

export type KropkiDot = {
  dotType: KropkiDotType
  cell1: CellPosition
  cell2: CellPosition
}

export enum KropkiDotType {
  Consecutive = 'Consecutive',
  Double = 'Double',
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
  isExternal?: boolean
  externalData?: string
}
