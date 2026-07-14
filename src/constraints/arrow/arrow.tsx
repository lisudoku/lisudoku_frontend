import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUpLong } from '@fortawesome/free-solid-svg-icons'
import type { CellErrorSet, ConstraintDefinition } from '../types'
import { SudokuVariant } from 'src/types/sudoku'
import { arrowGraphics } from './graphics'
import { ensureTargetItem, expandsArea4, expandsArea8, expandsPath } from '../utils'
import type { Arrow } from 'lisudoku-solver'
import { find, findIndex, sortBy, sumBy } from 'lodash-es'
import { ArrowConstraintType } from '../editorState'

export const arrowConstraint: ConstraintDefinition = {
  icon: <FontAwesomeIcon icon={faUpLong} size="sm" title="Arrow" />,
  label: 'Arrow',
  description: ({ constraints }) =>
    'The number placed in the arrow circle or oval must be the sum of digits placed ' +
    'in the cells that the arrow passes through. Digits may repeat on arrows.' +
    (constraints.arrows?.some(arrow => arrow.circleCells.length > 1)
      ? ' Each oval should be read as a two digit number left to right or top to bottom.'
      : ''
    ),
  isGlobal: false,
  isActiveInConstraints: ({ constraints }) => (constraints.arrows ?? []).length > 0,
  variant: () => SudokuVariant.Arrow,
  graphics: arrowGraphics,
  cellPeers: () => [],
  errors: ({ constraints, valuesGrid }) => {
    const errorSets: CellErrorSet[] = []

    for (const arrow of constraints.arrows ?? []) {
      if (arrow.circleCells.some(cell => !valuesGrid[cell.row][cell.col])) {
        continue
      }
      let circleValue = 0
      for (const cell of sortBy(arrow.circleCells, ['row', 'col'])) {
        const value = valuesGrid[cell.row][cell.col]!
        circleValue = 10 * circleValue + value
      }
      const arrowSum = sumBy(arrow.arrowCells, cell => valuesGrid[cell.row][cell.col] ?? 0)
      const arrowFull = arrow.arrowCells.every(cell => valuesGrid[cell.row][cell.col])
      if (arrowSum > circleValue || (arrowFull && arrowSum !== circleValue)) {
        for (const cell of [...arrow.circleCells, ...arrow.arrowCells]) {
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
    const arrowIndex = findIndex(constraints.arrows, arrow => (
      arrow.circleCells.some(isSelectedCell) || arrow.arrowCells.some(isSelectedCell)
    ))
    if (arrowIndex !== -1) {
      constraints.arrows?.splice(arrowIndex, 1)
    }
  },
  expandCurrentConstraintAtCell: ({ constraints, cell, editorState }) => {
    constraints.arrows ??= []
    const currentArrow = ensureTargetItem(
      constraints.arrows,
      editorState,
      () => ({
        circleCells: [],
        arrowCells: [],
      }),
    )

    if (editorState.arrowConstraintType === ArrowConstraintType.Circle) {
      if (!expandsArea4(currentArrow.circleCells, cell) && !find(currentArrow.arrowCells, cell)) {
        return false
      }
      currentArrow.circleCells.push(cell)
      return true
    }

    if (
      currentArrow.circleCells.length > 0 &&
      !find(currentArrow.circleCells, cell) &&
      (
        currentArrow.arrowCells.length > 0 && expandsPath(currentArrow.arrowCells, cell) ||
        currentArrow.arrowCells.length === 0 && expandsArea8(currentArrow.circleCells, cell)
      )
    ) {
      currentArrow.arrowCells.push(cell)
      return true
    }
    return false
  },
  validateCurrentConstraint: ({ constraints, editorState }) => {
    if (editorState.targetIndex === undefined || constraints.arrows === undefined) {
      return {
        type: 'unknown',
        message: 'No arrow found',
      }
    }

    const currentArrow = constraints.arrows[editorState.targetIndex]

    if (currentArrow.circleCells.length === 0) {
      return {
        type: 'info',
        message: 'Arrow has no circle part. Click on any cell to create it.'
      }
    }

    if (currentArrow.arrowCells.length === 0) {
      return {
        type: 'error',
        message: 'Arrow has no arrow part. Click on any cell next to the circle to start it.',
      }
    }

    return {
      type: 'success',
      message: 'Current arrow is valid',
    }
  },
  prepareCurrentConstraint: () => null,
}
