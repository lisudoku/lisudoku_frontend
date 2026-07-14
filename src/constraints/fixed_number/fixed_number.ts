import { remove } from 'lodash-es'
import type { ConstraintDefinition } from '../types'
import { fixedNumberGraphics } from './graphics'
import { SudokuVariant } from 'src/types/sudoku'
import { UNKNOWN_VALIDATION_RESULT } from '../utils'

export const fixedNumberConstraint: ConstraintDefinition = {
  icon: null,
  label: 'Given digit',
  description: null,
  isGlobal: false,
  isActiveInConstraints: ({ constraints }) => (constraints.fixedNumbers ?? []).length > 0,
  variant: () => SudokuVariant.Classic,
  graphics: fixedNumberGraphics,
  cellPeers: () => [],
  errors: () => [],
  removeConstraintsAtCell: ({ constraints, isSelectedCell }) => {
    remove(constraints.fixedNumbers ?? [], ({ position }) => isSelectedCell(position))
  },
  expandCurrentConstraintAtCell: () => false,
  validateCurrentConstraint: () => UNKNOWN_VALIDATION_RESULT,
  prepareCurrentConstraint: () => null,
}
