import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThermometer4 } from '@fortawesome/free-solid-svg-icons'
import type { CellErrorSet, ConstraintDefinition } from '../types'
import { SudokuVariant } from 'src/types/sudoku'
import { thermoGraphics } from './graphics'
import { ensureTargetArray, expandsPath, regionsCellPeers, removeConstraintFromArray } from '../utils'
import type { CellPosition } from 'lisudoku-solver'

export const thermoConstraint: ConstraintDefinition = {
  icon: <FontAwesomeIcon icon={faThermometer4} size="sm" title="Thermometer" />,
  label: 'Thermometer',
  description: () => 'Each thermometer contains digits in increasing order from the bulb to the end.',
  isGlobal: false,
  isActiveInConstraints: ({ constraints }) => (constraints.thermos ?? []).length > 0,
  variant: () => SudokuVariant.Thermo,
  graphics: thermoGraphics,
  cellPeers: ({ constraints, cell }) => regionsCellPeers(constraints.thermos ?? [], cell),
  errors: ({ constraints, valuesGrid }) => {
    const errorSets: CellErrorSet[] = []
    for (const thermo of constraints.thermos ?? []) {
      let prevValue = 0
      let prevCell: CellPosition | null = null
      for (let cell of thermo) {
        const value = valuesGrid[cell.row][cell.col]
        if (value && value <= prevValue) {
          errorSets.push({
            cell,
            errorSet: [value],
          })
          errorSets.push({
            cell: prevCell!,
            errorSet: [prevValue],
          })
        }
        if (value) {
          prevValue = value!
          prevCell = cell
        }
      }
    }
    return errorSets
  },
  removeConstraintsAtCell: ({ constraints, isSelectedCell }) => {
    removeConstraintFromArray(constraints.thermos, isSelectedCell)
  },
  expandCurrentConstraintAtCell: ({ constraints, cell, editorState }) => {
    constraints.thermos ??= []
    const currentThermo = ensureTargetArray(constraints.thermos, editorState)

    if (!expandsPath(currentThermo, cell)) {
      return false
    }
    currentThermo.push(cell)
    return true
  },
  validateCurrentConstraint: ({ constraints, editorState }) => {
    if (editorState.targetIndex === undefined || constraints.thermos === undefined) {
      return {
        type: 'info',
        message: 'Click on a cell to start a thermo.',
      }
    }

    const currentThermo = constraints.thermos[editorState.targetIndex]

    if (currentThermo.length === 0) {
      return {
        type: 'info',
        message: 'Click on a cell to start a thermo.',
      }
    }

    if (currentThermo.length === 1) {
      return {
        type: 'error',
        message: 'Thermo is too short. Click on other cells to expand it.',
      }
    }

    if (currentThermo.length > constraints.gridSize) {
      return {
        type: 'error',
        message: 'Thermo is too long. Delete it with Backspace.',
      }
    }

    return {
      type: 'success',
      message: 'Current thermo is valid',
    }
  },
  prepareCurrentConstraint: () => null,
}
