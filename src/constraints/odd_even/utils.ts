import { compact } from 'lodash-es'
import { CellErrorSet, ConstraintDefinition } from '../types'
import { CellPosition, SudokuConstraints } from 'lisudoku-solver'
import { removeConstraintFromArray } from '../utils'

type ConstraintsToOptionalCellsMapper = (constraints: SudokuConstraints) => CellPosition[] | undefined
type ConstraintsToCellsMapper = (constraints: SudokuConstraints) => CellPosition[]

export const singleCellConstraintErrorChecker: (ctx: {
  getCells: ConstraintsToOptionalCellsMapper,
  validateCell: (ctx: { value: number }) => boolean,
}) => ConstraintDefinition['errors'] = ({ getCells, validateCell }) => (
  ({ constraints, valuesGrid, cellMarksGrid }) => {
    const errorSets: CellErrorSet[] = []

    for (const cell of getCells(constraints) ?? []) {
      const cellValues = compact([
        valuesGrid[cell.row][cell.col],
        ...Object.values(cellMarksGrid[cell.row][cell.col]).flat(),
      ])
      const errorSet = cellValues.filter(value => !validateCell({ value }))
      if (errorSet.length > 0) {
        errorSets.push({
          cell,
          errorSet,
        })
      }
    }

    return errorSets
  }
)

export const singleCellRemoveConstraintsAtCell: (constraintsToCells: ConstraintsToOptionalCellsMapper) => ConstraintDefinition['removeConstraintsAtCell'] =
  constraintsToCells => (
    ({ constraints, isSelectedCell }) => {
      removeConstraintFromArray(
        constraintsToCells(constraints),
        isSelectedCell,
        cell => [cell],
      )
    }
  )

export const oddEvenExpandCurrentConstraintAtCell: (constraintsToCells: ConstraintsToCellsMapper) => ConstraintDefinition['expandCurrentConstraintAtCell'] =
  constraintsToCells => (
    ({ constraints, editorState, cell, isSelectedCell }) => {
      if (editorState.targetIndex !== undefined) {
        return false
      }

      const isCellFree = (
        !constraints.oddCells?.some(isSelectedCell) &&
        !constraints.evenCells?.some(isSelectedCell)
      )
      if (isCellFree) {
        const cells = constraintsToCells(constraints)
        cells.push(cell)
        editorState.targetIndex = cells.length - 1
        return true
      }

      return false
    }
  )

export const singleCellValidateCurrentConstraint: (constraintsToCells: ConstraintsToOptionalCellsMapper) => ConstraintDefinition['validateCurrentConstraint'] =
  constraintsToCells => (
    ({ constraints, editorState }) => {
      if (editorState.targetIndex === undefined || constraintsToCells(constraints) === undefined) {
        return {
          type: 'info',
          message: 'Click on a cell to place the constraint',
        }
      }

      return {
        type: 'success',
        message: 'Cells are validated when adding to draft constraints',
      }
    }
  )
