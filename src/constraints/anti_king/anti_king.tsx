import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChessKing } from '@fortawesome/free-solid-svg-icons'
import type { CellErrorSet, ConstraintDefinition } from '../types'
import { SudokuVariant } from 'src/types/sudoku'
import { CellValueComparatorEqual, getErrorSetsBetween, UNKNOWN_VALIDATION_RESULT } from '../utils'
import type { CellPosition } from 'lisudoku-solver'
import { times } from 'lodash-es'
import { getAllCells, isCellCompletelyEmpty } from 'src/utils/sudoku'

const KING_ROW_DELTA = [ -1, -1, -1, 0, 0, 1, 1, 1 ]
const KING_COL_DELTA = [ -1, 0, 1, -1, 1, -1, 0, 1 ]

export const antiKingConstraint: ConstraintDefinition = {
  icon: <FontAwesomeIcon icon={faChessKing} size="sm" title="Anti King" />,
  label: 'Anti King',
  description: () => 'Cells a king move away must not contain the same digit.',
  isGlobal: true,
  isActiveInConstraints: ({ constraints }) => Boolean(constraints.antiKing),
  variant: () => SudokuVariant.AntiKing,
  graphics: () => null,
  cellPeers: ({ constraints, cell }) => {
    const peers: CellPosition[] = []

    for (const dir of times(8)) {
      const peer = {
        row: cell.row + KING_ROW_DELTA[dir],
        col: cell.col + KING_COL_DELTA[dir],
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
      const peers = antiKingConstraint.cellPeers({ constraints, cell })
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
