export type CellPosition = {
  row: number
  col: number
}

export type Grid = number[][]

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
