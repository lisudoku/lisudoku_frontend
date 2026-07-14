import type { ConstraintDefinition } from '../types'
import { SudokuVariant } from 'src/types/sudoku'
import { kropkiDoubleGraphics } from './graphics'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircle } from '@fortawesome/free-regular-svg-icons'
import { faCircle as faCircleSolid } from '@fortawesome/free-solid-svg-icons'
import { CellValueComparator } from '../utils'
import { kropkiErrors, kropkiPrepareCurrentConstraint, kropkiRemoveConstraintsAtCell, kropkiValidateCurrentConstraint } from './utils'

export const kropkiDoubleComparator: CellValueComparator = (a: number, b: number) => Math.min(a, b) * 2 !== Math.max(a, b)

export const kropkiDoubleConstraint: ConstraintDefinition = {
  icon: (
    <span className="fa-layers" title="Kropki Double">
      <FontAwesomeIcon icon={faCircleSolid} color="black" size="sm" />
      <FontAwesomeIcon icon={faCircle} color="white" size="sm" />
    </span>
  ),
  label: 'Kropki Double',
  description: () =>
    'Adjacent cells containing digits whose ratio is 2 are marked with a black circle.',
  isGlobal: false,
  isActiveInConstraints: ({ constraints }) =>
    constraints.kropkiDots?.some(kropkiDot => kropkiDot.dotType === 'Double') ?? false,
  variant: () => SudokuVariant.Kropki,
  graphics: kropkiDoubleGraphics,
  cellPeers: () => [],
  errors: kropkiErrors('Double', kropkiDoubleComparator),
  removeConstraintsAtCell: kropkiRemoveConstraintsAtCell('Double'),
  expandCurrentConstraintAtCell: () => false,
  validateCurrentConstraint: kropkiValidateCurrentConstraint,
  prepareCurrentConstraint: kropkiPrepareCurrentConstraint('Double'),
}
