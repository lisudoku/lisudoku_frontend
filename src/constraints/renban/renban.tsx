import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLinesLeaning } from '@fortawesome/free-solid-svg-icons'
import type { ConstraintDefinition } from '../types'
import { SudokuVariant } from 'src/types/sudoku'
import { renbanGraphics } from './graphics'
import { ensureTargetArray, expandsArea8, getErrorsSetsInRegions, regionsCellPeers, removeConstraintFromArray } from '../utils'
import { find, max, min } from 'lodash-es'

export const renbanConstraint: ConstraintDefinition = {
  icon: <FontAwesomeIcon icon={faLinesLeaning} size="sm" title="Renban" />,
  label: 'Renban',
  description: () => 'Each gray line must contain a set of distinct, consecutive digits in any order.',
  isGlobal: false,
  isActiveInConstraints: ({ constraints }) => (constraints.renbans ?? []).length > 0,
  variant: () => SudokuVariant.Renban,
  graphics: renbanGraphics,
  cellPeers: ({ constraints, cell }) => regionsCellPeers(constraints.renbans ?? [], cell),
  errors: ({ constraints, valuesGrid, cellMarksGrid }) => {
    const errorSets = getErrorsSetsInRegions(constraints.renbans ?? [], valuesGrid, cellMarksGrid)

    for (const renban of constraints.renbans ?? []) {
      if (renban.some(cell => !valuesGrid[cell.row][cell.col])) {
        continue
      }

      const values = renban.map(cell => valuesGrid[cell.row][cell.col])
      const maxValue = max(values)!
      const minValue = min(values)!

      if (maxValue - minValue + 1 !== renban.length) {
        for (const cell of renban) {
          const value = valuesGrid[cell.row][cell.col]
          if (!value) {
            continue
          }
          errorSets.push({
            cell,
            errorSet: [value],
          })
        }
      }
    }

    return errorSets
  },
  removeConstraintsAtCell: ({ constraints, isSelectedCell }) => {
    removeConstraintFromArray(constraints.renbans, isSelectedCell)
  },
  expandCurrentConstraintAtCell: ({ constraints, cell, editorState }) => {
    constraints.renbans ??= []
    const currentRenban = ensureTargetArray(constraints.renbans, editorState)

    if (
      currentRenban.length === 0 ||
      !find(currentRenban, cell) &&
      expandsArea8(currentRenban, cell)
    ) {
      currentRenban.push(cell)
      return true
    }

    return false
  },
  validateCurrentConstraint: ({ constraints, editorState }) => {
    if (editorState.targetIndex === undefined || constraints.renbans === undefined) {
      return {
        type: 'info',
        message: 'Click on a cell to start a renban line.',
      }
    }

    const currentRenban = constraints.renbans[editorState.targetIndex]

    if (currentRenban.length === 0) {
      return {
        type: 'info',
        message: 'Click on a cell to start a renban line.',
      }
    }

    if (currentRenban.length === 1) {
      return {
        type: 'error',
        message: 'Renban line is too short. Click on other cells to expand it.',
      }
    }

    if (currentRenban.length > constraints.gridSize) {
      return {
        type: 'error',
        message: 'Renban line is too long. Delete it with Backspace.',
      }
    }

    return {
      type: 'success',
      message: 'Current renban is valid',
    }
  },
  prepareCurrentConstraint: () => null,
}
