import { type MouseEvent, type TouchEvent, useCallback } from 'react'
import { inRange } from 'lodash-es'
import { CellPosition } from 'lisudoku-solver'

const DRAG_CELL_RATIO = 1.0 / 7.0

function isTouchEvent(e: any): e is TouchEvent {
  return 'changedTouches' in e
}

export const useGridCellUiEventHandler = (
  cellSize: number,
  gridSize: number,
  onCellClick?: (cell: CellPosition, ctrl: boolean, isClick: boolean, doubleClick: boolean) => void
) => (
  useCallback((e: MouseEvent | TouchEvent) => {
    let x: number
    let y: number
    if (isTouchEvent(e)) {
      // Make sure we have at least 1 touch point to check
      if (e.changedTouches.length === 0) {
        return
      }
      const touch = e.changedTouches[0]
      x = touch.clientX - e.currentTarget.getBoundingClientRect().left
      y = touch.clientY - e.currentTarget.getBoundingClientRect().top
    } else {
      // We only care about single left clicks
      if (e.buttons !== 1) {
        return
      }
      x = e.clientX - e.currentTarget.getBoundingClientRect().left
      y = e.clientY - e.currentTarget.getBoundingClientRect().top
    }
    const row = Math.floor((y - 1) / cellSize)
    const col = Math.floor((x - 1) / cellSize)
    if (!inRange(row, 0, gridSize) || !inRange(col, 0, gridSize)) {
      return
    }
    const isDrag = (e.type === 'mousemove' || e.type === 'touchmove')
    if (isDrag) {
      const rowRem = (y - 1) / cellSize - row
      const colRem = (x - 1) / cellSize - col
      if (rowRem < DRAG_CELL_RATIO || rowRem > 1.0 - DRAG_CELL_RATIO) {
        return
      }
      if (colRem < DRAG_CELL_RATIO || colRem > 1.0 - DRAG_CELL_RATIO) {
        return
      }
    }
    const ctrl = e.metaKey || e.ctrlKey || e.shiftKey || isDrag
    const doubleClick = e.detail === 2
    const isClick = e.detail === 1 || e.type === 'touchstart'
    onCellClick?.({ row, col }, ctrl, isClick, doubleClick)
  }, [cellSize, onCellClick])
)
