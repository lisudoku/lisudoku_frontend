import type { Area, CellPosition, KropkiDot, KropkiDotType, SudokuConstraints } from 'lisudoku-solver'
import { differenceWith, isEqual, sortBy } from 'lodash-es'
import type { CellErrorSet, ConstraintContext, ConstraintDefinition } from '../types'
import { CellValueComparator, getAdjacentPeers, getErrorSetsBetween, removeConstraintFromArray } from '../utils'
import { getAllCells } from 'src/utils/sudoku'

export const kropkiErrors: (dotType: KropkiDotType, comparator: CellValueComparator) => ConstraintDefinition['errors'] = (dotType, comparator) => (
  ({ valuesGrid, constraints, cellMarksGrid }) => {
    const errorSets: CellErrorSet[] = []

    for (const kropkiDot of (constraints.kropkiDots ?? []).filter(kropkiDot => kropkiDot.dotType === dotType)) {
      const currentErrorSets = getErrorSetsBetween(
        kropkiDot.cell1, kropkiDot.cell2, comparator, valuesGrid, cellMarksGrid,
      )
      errorSets.push(...currentErrorSets)
    }

    return errorSets
  }
)

export const kropkiRemoveConstraintsAtCell: (dotType: KropkiDotType) => ConstraintDefinition['removeConstraintsAtCell'] = dotType => (
  ({ constraints, isSelectedCell }) => {
    removeConstraintFromArray(
      constraints.kropkiDots,
      isSelectedCell,
      kropkiDot => [kropkiDot.cell1, kropkiDot.cell2],
      kropkiDot => kropkiDot.dotType === dotType,
    )
  }
)

export const kropkiValidateCurrentConstraint: ConstraintDefinition['validateCurrentConstraint'] = ({ constraints, editorState }) => {
  if (editorState.selectedCells.length !== 2) {
    return {
      type: editorState.selectedCells.length === 0 ? 'info' : 'error',
      message: 'Select exactly 2 cells with Shift+Click or by dragging.',
    }
  }

  const cells = sortBy(editorState.selectedCells, [ 'row', 'col' ])
  if (Math.abs(cells[0].row - cells[1].row) + Math.abs(cells[0].col - cells[1].col) !== 1) {
    return {
      type: 'error',
      message: 'Selected cells need to be adjacent.',
    }
  }

  const foundDot = constraints.kropkiDots?.some(kropkiDot => (
    isEqual(cells[0], kropkiDot.cell1) && isEqual(cells[1], kropkiDot.cell2)
  ))
  if (foundDot) {
    return {
      type: 'error',
      message: 'The selected cells already contain a kropki dot.',
    }
  }

  return {
    type: 'success',
  }
}

export const kropkiPrepareCurrentConstraint: (dotType: KropkiDotType) => ConstraintDefinition['prepareCurrentConstraint'] = dotType => (
  ({ constraints, editorState }) => {
    const kropkiDotCells = sortBy(editorState.selectedCells, [ 'row', 'col' ])

    return {
      newEditorState: {
        ...editorState,
        selectedCells: kropkiDotCells,
      },
      newConstraints: {
        ...constraints,
        kropkiDots: [
          ...(constraints.kropkiDots ?? []),
          {
            dotType,
            cell1: kropkiDotCells[0],
            cell2: kropkiDotCells[1],
          },
        ],
      }
    }
  }
)

// TODO: find a cleaner approach instead of copying the solver logic
// Reference: https://github.com/lisudoku/lisudoku_solver/blob/b6a583d9ce253edd1be4179b9152e4c092d9e0eb/src/solver.rs#L153
export const getKropkiNegativeDots = (constraints: SudokuConstraints): KropkiDot[] => {
  const negativeDots: KropkiDot[] = []
  const gridSize = constraints.gridSize
  const gridToKropkiDots: CellPosition[][][] = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null).map(() => []))
  for (const kropkiDot of constraints.kropkiDots ?? []) {
    const { cell1, cell2 } = kropkiDot
    gridToKropkiDots[cell1.row][cell1.col].push(cell2)
    gridToKropkiDots[cell2.row][cell2.col].push(cell1)
  }
  for (const cell of getAllCells(gridSize)) {
    const peers = getAdjacentPeers(cell, gridSize)
    const dotPeers = gridToKropkiDots[cell.row][cell.col]
    const negativePeers = differenceWith(peers, dotPeers, isEqual)

    for (const peer of negativePeers) {
      negativeDots.push({
        cell1: cell,
        cell2: peer,
        dotType: 'Negative',
      })
      gridToKropkiDots[cell.row][cell.col].push(peer)
      gridToKropkiDots[peer.row][peer.col].push(cell)
    }
  }
  return negativeDots
}

export const kropkiAreaCells: (dotType: KropkiDotType) => ConstraintDefinition['areaCells'] = dotType => (
  (area: Area, ctx: ConstraintContext) => {
    if (area.type !== 'KropkiDot') {
      return []
    }

    if (ctx.constraints.kropkiDots === undefined) {
      throw Error('no kropki dots in constraints')
    }

    let kropkiDot: KropkiDot

    if (area.value < ctx.constraints.kropkiDots.length) {
      kropkiDot = ctx.constraints.kropkiDots[area.value]
    } else {
      if (dotType !== 'Negative') {
        return []
      }
      if (!ctx.constraints.kropkiNegative) {
        throw Error('Invalid kropki dot index')
      }
      const negativeDots = getKropkiNegativeDots(ctx.constraints)
      kropkiDot = negativeDots[area.value - ctx.constraints.kropkiDots.length]
    }

    if (kropkiDot.dotType !== dotType) {
      return []
    }

    return [kropkiDot.cell1, kropkiDot.cell2]
  }
)
