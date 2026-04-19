import React from 'react'
import { CellPosition } from 'lisudoku-solver'

interface HighlightedCellProps {
  cell: CellPosition
  cellSize: number
  className?: string
  style?: React.CSSProperties
}

export const HighlightedCell = ({ cellSize, cell, className, style }: HighlightedCellProps) => (
  <rect
    x={3 + cellSize * cell.col}
    y={3 + cellSize * cell.row}
    width={cellSize - 4}
    height={cellSize - 4}
    className={className}
    style={style}
  />
)
