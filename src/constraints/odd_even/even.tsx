import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSquare } from '@fortawesome/free-solid-svg-icons'
import type { SudokuConstraints } from 'lisudoku-solver'
import type { ConstraintDefinition } from '../types'
import { SudokuVariant } from 'src/types/sudoku'
import { evenGraphics } from './graphics'
import { oddEvenExpandCurrentConstraintAtCell, singleCellConstraintErrorChecker, singleCellRemoveConstraintsAtCell, singleCellValidateCurrentConstraint } from './utils'

const constraintsToCells = (constraints: SudokuConstraints) => constraints.evenCells

export const evenConstraint: ConstraintDefinition = {
  icon: <FontAwesomeIcon icon={faSquare} size="sm" color="lightgray" title="Even" />,
  label: 'Even',
  description: () => 'Cells with shaded squares contain even digits.',
  isGlobal: false,
  isActiveInConstraints: ({ constraints }) => (constraintsToCells(constraints) ?? []).length > 0,
  variant: () => SudokuVariant.OddEven,
  graphics: evenGraphics,
  cellPeers: () => [],
  errors: singleCellConstraintErrorChecker({
    getCells: constraintsToCells,
    validateCell: ({ value }) => value % 2 === 0,
  }),
  removeConstraintsAtCell: singleCellRemoveConstraintsAtCell(constraintsToCells),
  expandCurrentConstraintAtCell: oddEvenExpandCurrentConstraintAtCell(constraints => {
    constraints.evenCells ??= []
    return constraints.evenCells
  }),
  validateCurrentConstraint: singleCellValidateCurrentConstraint(constraintsToCells) ,
  prepareCurrentConstraint: () => null,
}
