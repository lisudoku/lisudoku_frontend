import type { ConstraintDefinition } from '../types'
import { sortBy, sumBy } from 'lodash-es'
import { SudokuVariant } from 'src/types/sudoku'
import { getErrorsSetsInRegions, regionsCellPeers, removeConstraintFromArray } from '../utils'
import { killerGraphics } from './graphics'

export const killerCageConstraint: ConstraintDefinition = {
  icon: (
    <span title="Killer">
      <svg height={13} width={13} className="inline-block">
        <rect x="0" y="0" width="100%" height="100%" fill="transparent" stroke="currentColor" strokeDasharray="2" />
      </svg>
    </span>
  ),
  label: 'Killer',
  description: () =>
    'The sum of all numbers in a cage must match the small number in the corner of the cage. ' +
    'No number appears more than once in a cage.',
  isGlobal: false,
  isActiveInConstraints: ({ constraints }) => (constraints.killerCages ?? []).length > 0,
  variant: () => SudokuVariant.Killer,
  graphics: killerGraphics,
  cellPeers: ({ constraints, cell }) => regionsCellPeers(
    (constraints.killerCages ?? []).map(killerCage => killerCage.region),
    cell,
  ),
  errors: ({ valuesGrid, constraints, cellMarksGrid }) => {
    const errorSets = getErrorsSetsInRegions(
      (constraints.killerCages ?? []).map(killerCage => killerCage.region),
      valuesGrid, cellMarksGrid,
    )

    for (const killerCage of constraints.killerCages ?? []) {
      if (!killerCage.sum) {
        continue
      }
      const sum = sumBy(killerCage.region, cell => (
        valuesGrid[cell.row][cell.col] ?? 0
      ))
      if (sum > killerCage.sum) {
        for (const cell of killerCage.region) {
          const value = valuesGrid[cell.row][cell.col]
          if (value !== null) {
            errorSets.push({
              cell,
              errorSet: [value],
            })
          }
        }
      }
    }

    return errorSets
  },
  removeConstraintsAtCell: ({ constraints, isSelectedCell }) => {
    removeConstraintFromArray(
      (constraints.killerCages ?? []),
      isSelectedCell,
      killerCage => killerCage.region,
    )
  },
  expandCurrentConstraintAtCell: () => false,
  validateCurrentConstraint: ({ constraints, editorState }) => {
    if (editorState.selectedCells.length === 0) {
      return {
        type: 'info',
        message: 'Select at least one cell. You can select multiple cells with Shift + Click.',
      }
    }

    if (editorState.selectedCells.length > constraints.gridSize) {
      return {
        type: 'error',
        message: `Killer cage is larger than ${constraints.gridSize} cells.`,
      }
    }

    return {
      type: 'success',
      message: 'Killer cage is valid',
    }
  },
  prepareCurrentConstraint: ({ constraints, editorState }) => {
    const region = sortBy(editorState.selectedCells, [ 'row', 'col' ])

    return {
      newEditorState: {
        ...editorState,
        selectedCells: region,
      },
      newConstraints: {
        ...constraints,
        killerCages: [
          ...(constraints.killerCages ?? []),
          {
            sum: editorState.killerSum ?? null,
            region,
          },
        ],
      }
    }
  },
}
