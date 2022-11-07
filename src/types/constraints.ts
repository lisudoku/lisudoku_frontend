import { CellPosition } from './common'

export type SudokuConstraints = {
  fixedNumbers?: number[][]
  regions?: Region[]
}

export type Region = CellPosition[]
