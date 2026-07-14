import type { ConstraintDefinition } from '../types'
import { SudokuVariant } from 'src/types/sudoku'
import { kropkiConsecutiveGraphics } from './graphics'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircle } from '@fortawesome/free-regular-svg-icons'
import { faCircle as faCircleSolid } from '@fortawesome/free-solid-svg-icons'
import { CellValueComparator } from '../utils'
import { kropkiErrors, kropkiPrepareCurrentConstraint, kropkiRemoveConstraintsAtCell, kropkiValidateCurrentConstraint } from './utils'

export const kropkiConsecutiveComparator: CellValueComparator = (a: number, b: number) => Math.abs(a - b) !== 1

export const kropkiConsecutiveConstraint: ConstraintDefinition = {
  icon: (
    <span className="fa-layers" title="Kropki Consecutive">
      <FontAwesomeIcon icon={faCircleSolid} color="white" size="sm" />
      <FontAwesomeIcon icon={faCircle} color="black" size="sm" />
    </span>
  ),
  label: 'Kropki Consecutive',
  description: () =>
    'Adjacent cells containing digits whose difference is 1 are marked with a white circle.',
  isGlobal: false,
  isActiveInConstraints: ({ constraints }) =>
    constraints.kropkiDots?.some(kropkiDot => kropkiDot.dotType === 'Consecutive') ?? false,
  variant: () => SudokuVariant.Kropki,
  graphics: kropkiConsecutiveGraphics,
  cellPeers: () => [],
  errors: kropkiErrors('Consecutive', kropkiConsecutiveComparator),
  removeConstraintsAtCell: kropkiRemoveConstraintsAtCell('Consecutive'),
  expandCurrentConstraintAtCell: () => false,
  validateCurrentConstraint: kropkiValidateCurrentConstraint,
  prepareCurrentConstraint: kropkiPrepareCurrentConstraint('Consecutive'),
}
