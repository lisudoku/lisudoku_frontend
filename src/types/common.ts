export type CellPosition = {
  row: number
  col: number
}

export type Grid = number[][]

export enum SudokuVariant {
  Classic = 'Classic',
  Killer = 'Killer',
  Thermo = 'Thermo',
  Arrow = 'Arrow',
  Irregular = 'Irregular',
  Kropki = 'Kropki',
  TopBot = 'Top-Bot',
  Diagonal = 'Diagonal',
  Mixed = 'Mixed',
}
