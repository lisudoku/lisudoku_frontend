import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircle as faCircleSolid } from '@fortawesome/free-solid-svg-icons'
import type { SudokuConstraints } from 'lisudoku-solver'
import type { ConstraintDefinition } from '../types'
import { SudokuVariant } from 'src/types/sudoku'
import { oddGraphics } from './graphics'
import { oddEvenExpandCurrentConstraintAtCell, singleCellConstraintErrorChecker, singleCellRemoveConstraintsAtCell, singleCellValidateCurrentConstraint } from './utils'

const constraintsToCells = (constraints: SudokuConstraints) => constraints.oddCells

export const oddConstraint: ConstraintDefinition = {
  icon: <FontAwesomeIcon icon={faCircleSolid} size="sm" color="lightgray" title="Odd" />,
  label: 'Odd',
  description: () => 'Cells with shaded circles contain odd digits.',
  isGlobal: false,
  isActiveInConstraints: ({ constraints }) => (constraintsToCells(constraints) ?? []).length > 0,
  variant: () => SudokuVariant.OddEven,
  graphics: oddGraphics,
  cellPeers: () => [],
  errors: singleCellConstraintErrorChecker({
    getCells: constraintsToCells,
    validateCell: ({ value }) => value % 2 === 1,
  }),
  removeConstraintsAtCell: singleCellRemoveConstraintsAtCell(constraintsToCells),
  expandCurrentConstraintAtCell: oddEvenExpandCurrentConstraintAtCell(constraints => {
    constraints.oddCells ??= []
    return constraints.oddCells
  }),
  validateCurrentConstraint: singleCellValidateCurrentConstraint(constraintsToCells) ,
  prepareCurrentConstraint: () => null,
}
