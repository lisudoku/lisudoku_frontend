import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChessKnight } from '@fortawesome/free-solid-svg-icons'
import type { CellErrorSet, ConstraintDefinition } from '../types'
import { SudokuVariant } from 'src/types/sudoku'
import { CellValueComparatorEqual, getErrorSetsBetween, UNKNOWN_VALIDATION_RESULT } from '../utils'
import type { CellPosition } from 'lisudoku-solver'
import { times } from 'lodash-es'
import { getAllCells, isCellCompletelyEmpty } from 'src/utils/sudoku'

const KNIGHT_ROW_DELTA = [ 1, 2, -1, -2, 1, 2, -1, -2 ]
const KNIGHT_COL_DELTA = [ 2, 1, 2, 1, -2, -1, -2, -1 ]

export const antiKnightConstraint: ConstraintDefinition = {
  icon: <FontAwesomeIcon icon={faChessKnight} size="sm" title="Anti Knight" />,
  label: 'Anti Knight',
  description: () => 'Cells a knight move away must not contain the same digit.',
  isGlobal: true,
  isActiveInConstraints: ({ constraints }) => Boolean(constraints.antiKnight),
  variant: () => SudokuVariant.AntiKnight,
  graphics: () => null,
  cellPeers: ({ constraints, cell }) => {
    const peers: CellPosition[] = []

    for (const dir of times(8)) {
      const peer = {
        row: cell.row + KNIGHT_ROW_DELTA[dir],
        col: cell.col + KNIGHT_COL_DELTA[dir],
      }
      if (peer.row < 0 || peer.row >= constraints.gridSize || peer.col < 0 || peer.col >= constraints.gridSize) {
        continue
      }
      peers.push(peer)
    }

    return peers
  },
  errors: ({ constraints, valuesGrid, cellMarksGrid }) => {
    const errorSets: CellErrorSet[] = []

    for (const cell of getAllCells(constraints.gridSize)) {
      if (isCellCompletelyEmpty(cell, valuesGrid, cellMarksGrid)) {
        continue
      }
      const peers = antiKnightConstraint.cellPeers({ constraints, cell })
      for (const peer of peers) {
        if (isCellCompletelyEmpty(peer, valuesGrid, cellMarksGrid)) {
          continue
        }

        const currentErrorSets = getErrorSetsBetween(
          cell, peer, CellValueComparatorEqual,
          valuesGrid, cellMarksGrid,
        )

        errorSets.push(...currentErrorSets)
      }
    }

    return errorSets
  },
  removeConstraintsAtCell: () => {},
  expandCurrentConstraintAtCell: () => false,
  validateCurrentConstraint: () => UNKNOWN_VALIDATION_RESULT,
  prepareCurrentConstraint: () => null,
}
