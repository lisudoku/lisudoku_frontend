import { inRange } from 'lodash-es'
import { MouseEvent, useCallback } from 'react'
import { CellPosition } from 'src/types/sudoku'

export const useOnGridClick = (
  cellSize: number,
  gridSize: number,
  onCellClick?: (cell: CellPosition, ctrl: boolean, isClick: boolean, doubleClick: boolean) => void
) => (
  useCallback((e: MouseEvent) => {
    const x = e.clientX - e.currentTarget.getBoundingClientRect().left
    const y = e.clientY - e.currentTarget.getBoundingClientRect().top
    const row = Math.floor((y - 1) / cellSize)
    const col = Math.floor((x - 1) / cellSize)
    if (!inRange(row, 0, gridSize) || !inRange(col, 0, gridSize)) {
      return
    }
    const ctrl = e.metaKey || e.ctrlKey || e.shiftKey
    const doubleClick = e.detail === 2
    onCellClick?.({ row, col }, ctrl, true, doubleClick)
  }, [cellSize, onCellClick])
)

const DRAG_CELL_RATIO = 1.0 / 7.0

// Select cells as you drag your mouse over them
export const useOnMouseMove = (
  cellSize: number,
  gridSize: number,
  onCellClick?: (cell: CellPosition, ctrl: boolean, isClick: boolean, doubleClick: boolean) => void
) => (
  useCallback((e: MouseEvent) => {
    // We only care  single left clicks
    if (e.buttons !== 1) {
      return
    }
    const x = e.clientX - e.currentTarget.getBoundingClientRect().left
    const y = e.clientY - e.currentTarget.getBoundingClientRect().top
    const row = Math.floor((y - 1) / cellSize)
    const col = Math.floor((x - 1) / cellSize)
    if (!inRange(row, 0, gridSize) || !inRange(col, 0, gridSize)) {
      return
    }
    const rowRem = (y - 1) / cellSize - row
    const colRem = (x - 1) / cellSize - col
    if (rowRem < DRAG_CELL_RATIO || rowRem > 1.0 - DRAG_CELL_RATIO) {
      return
    }
    if (colRem < DRAG_CELL_RATIO || colRem > 1.0 - DRAG_CELL_RATIO) {
      return
    }
    onCellClick?.({ row, col }, true, false, false)
  }, [cellSize, onCellClick])
)
