import { CellPosition } from './common'

export type SudokuConstraints = {
  gridSize: number
  fixedNumbers: FixedNumber[]
  regions: Region[]
}

export type FixedNumber = {
  position: CellPosition
  value: number
}

export type Region = CellPosition[]
