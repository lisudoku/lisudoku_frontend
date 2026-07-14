import type { CellErrorSet, ConstraintDefinition } from '../types'
import { SudokuVariant } from 'src/types/sudoku'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons'
import { CellValueComparator, getErrorSetsBetween, UNKNOWN_VALIDATION_RESULT } from '../utils'
import { isCellCompletelyEmpty } from 'src/utils/sudoku'
import { kropkiConsecutiveComparator } from './kropki_consecutive'
import { kropkiDoubleComparator } from './kropki_double'
import { getKropkiNegativeDots } from './utils'

const kropkiNegativeComparator: CellValueComparator = (a: number, b: number) => (
  !kropkiConsecutiveComparator(a, b) || !kropkiDoubleComparator(a, b)
)

export const kropkiNegativeConstraint: ConstraintDefinition = {
  icon: <FontAwesomeIcon icon={faCircleXmark} size="sm" title="Kropki Negative" />,
  label: 'Kropki Negative',
  description: () =>
    'Adjacent cells with no marking must not contain digits either whose difference is 1 or whose ratio is 2.',
  isGlobal: true,
  isActiveInConstraints: ({ constraints }) => Boolean(constraints.kropkiNegative),
  variant: () => SudokuVariant.Kropki,
  graphics: () => null,
  cellPeers: () => [],
  errors: ({ valuesGrid, constraints, cellMarksGrid }) => {
    if (!constraints.kropkiNegative) {
      return []
    }

    const errorSets: CellErrorSet[] = []

    const kropkiNegativeDots = getKropkiNegativeDots(constraints)    

    for (const dot of kropkiNegativeDots) {
      const { cell1, cell2 } = dot
      if (isCellCompletelyEmpty(cell1, valuesGrid, cellMarksGrid) ||
          isCellCompletelyEmpty(cell2, valuesGrid, cellMarksGrid)
      ) {
        continue
      }

      const currentErrorSets = getErrorSetsBetween(
        cell1, cell2, kropkiNegativeComparator, valuesGrid, cellMarksGrid,
      )
      errorSets.push(...currentErrorSets)
    }

    return errorSets
  },
  removeConstraintsAtCell: () => {},
  expandCurrentConstraintAtCell: () => false,
  validateCurrentConstraint: () => UNKNOWN_VALIDATION_RESULT,
  prepareCurrentConstraint: () => null,
}
