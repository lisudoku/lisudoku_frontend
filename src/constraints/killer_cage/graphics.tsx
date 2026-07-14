import { CellPosition, KillerCage } from 'lisudoku-solver'
import type { ConstraintDefinition } from '../types'
import { SVGProps } from 'react'
import { times } from 'lodash-es'
import { cellToString, getAdjacentPeers } from '../utils'

const DIAGONAL_ROW_DELTA = [ 1, 1, -1, -1 ]
const DIAGONAL_COL_DELTA = [ 1, -1, 1, -1 ]

interface KillerCageGraphicProps {
  killerCage: KillerCage
  gridSize: number
  cellSize: number
}

// TODO: we could use a single polyline per killer cage
const KillerCageGraphic = ({ killerCage, cellSize, gridSize }: KillerCageGraphicProps) => {
  const killerPadding = cellSize / 15
  const killerSumFontSize = cellSize * 3 / 14

  const cageCellsSet = new Set(killerCage.region.map(cellToString))

  const borders: SVGProps<SVGLineElement>[] = []
  for (const cell of killerCage.region) {
    const { row, col } = cell
    for (const peer of getAdjacentPeers(cell, gridSize, false)) {
      const { row: drow, col: dcol } = peer
      if (!cageCellsSet.has(cellToString(peer))) {
        borders.push({
          x1: col * cellSize + 1 + killerPadding + (dcol > col ? (cellSize - 2 * killerPadding) : 0),
          y1: row * cellSize + 1 + killerPadding + (drow > row ? (cellSize - 2 * killerPadding) : 0),
          x2: col * cellSize + 1 + killerPadding + (dcol < col ? 0 : (cellSize - 2 * killerPadding)),
          y2: row * cellSize + 1 + killerPadding + (drow < row ? 0 : (cellSize - 2 * killerPadding)),
        })
      }
    }
    
    for (const dir of times(4)) {
      const drow = row + DIAGONAL_ROW_DELTA[dir]
      const dcol = col + DIAGONAL_COL_DELTA[dir]

      if (
        !cageCellsSet.has(cellToString({ row: drow, col: dcol })) &&
        cageCellsSet.has(cellToString({ row: row, col: dcol })) &&
        cageCellsSet.has(cellToString({ row: drow, col: col }))
      ) {
        // vertical
        borders.push({
          x1: col * cellSize + 1 + killerPadding + (dcol > col ? (cellSize - 2 * killerPadding) : 0),
          y1: row * cellSize + 1 + (drow > row ? (cellSize - killerPadding) : 0),
          x2: col * cellSize + 1 + killerPadding + (dcol > col ? (cellSize - 2 * killerPadding) : 0),
          y2: row * cellSize + 1 + killerPadding + (drow > row ? (cellSize - killerPadding) : 0),
        })
        // horizontal
        borders.push({
          x1: col * cellSize + 1 + (dcol > col ? (cellSize - killerPadding) : 0),
          y1: row * cellSize + 1 + killerPadding + (drow > row ? (cellSize - 2 * killerPadding) : 0),
          x2: col * cellSize + 1 + killerPadding + (dcol > col ? (cellSize - killerPadding) : 0),
          y2: row * cellSize + 1 + killerPadding + (drow > row ? (cellSize - 2 * killerPadding) : 0),
        })
      }
    }
  }

  return (
    <>
      <g className="stroke-killer stroke-2" style={{ strokeDasharray: cellSize / 10 }}>
        {borders.map(({ x1, y1, x2, y2 }, index) => (
          <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} />
        ))}
      </g>
      {killerCage.sum !== null && (
        <g className="stroke-none fill-digit-fixed font-bold" style={{ fontSize: killerSumFontSize }}>
          <text
            x={killerCage.region[0].col * cellSize + 1 + 1 + killerPadding}
            y={killerCage.region[0].row * cellSize + 1 + killerPadding}
            dominantBaseline="text-before-edge"
          >
            {killerCage.sum}
          </text>
        </g>
      )}
    </>
  )
}

export const killerGraphics: ConstraintDefinition['graphics'] = ({ constraints, cellSize }) => {
  return (
    <g className="killer-cages">
      {(constraints.killerCages ?? []).map((killerCage, index) => (
        <KillerCageGraphic
          key={index}
          killerCage={killerCage}
          gridSize={constraints.gridSize}
          cellSize={cellSize}
        />
      ))}
    </g>
  )
}
