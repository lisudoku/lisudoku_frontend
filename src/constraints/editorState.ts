import type { CellPosition } from 'lisudoku-solver'
import type { ConstraintType, Grid } from 'src/types/sudoku'

export interface ConstraintEditorState {
  type: ConstraintType
  targetIndex?: number
  selectedCells: CellPosition[]
  arrowConstraintType: ArrowConstraintType
  killerSum?: number | null
  regionsGrid?: Grid
}

export enum ArrowConstraintType {
  Circle = 'arrow-circle',
  Arrow = 'arrow-arrow',
}
