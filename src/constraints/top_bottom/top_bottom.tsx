import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBolt } from '@fortawesome/free-solid-svg-icons'
import type { ConstraintDefinition } from '../types'
import { SudokuVariant } from 'src/types/sudoku'
import { UNKNOWN_VALIDATION_RESULT } from '../utils'

export const topBottomConstraint: ConstraintDefinition = {
  icon: <FontAwesomeIcon icon={faBolt} size="sm" color="lightgray" title="Top-Bottom" />,
  label: 'Top-Bottom',
  description: ({ constraints }) => (
    `There are two sequences of numbers: from digit 1 in top row to digit ${constraints.gridSize} ` +
    `in bottom row and from digit 1 in bottom row to digit ${constraints.gridSize} in top row. ` +
    'A sequence has to have consecutive numbers touching by side or corner.'
  ),
  isGlobal: true,
  isActiveInConstraints: ({ constraints }) => Boolean(constraints.topBottom),
  variant: () => SudokuVariant.TopBottom,
  graphics: () => null,
  cellPeers: () => [],
  errors: () => [],
  removeConstraintsAtCell: () => {},
  expandCurrentConstraintAtCell: () => false,
  validateCurrentConstraint: () => UNKNOWN_VALIDATION_RESULT,
  prepareCurrentConstraint: () => null,
}
