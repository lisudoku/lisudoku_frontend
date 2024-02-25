import { inRange, isEmpty, last } from 'lodash-es'
import { useEffect } from 'react'
import { CellPosition, SudokuConstraints } from 'src/types/sudoku'

const ARROWS = [ 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight' ]
const dirRow = [ -1, 1, 0, 0 ]
const dirCol = [ 0, 0, -1, 1 ]

export interface SudokuEventCallbacks {
  onNotesActiveToggle?: () => void
  onPause?: () => void
  onRedo?: () => void
  onUndo?: () => void
  onSelectedCellChange?: (cell: CellPosition, ctrl: boolean, isClick: boolean, isDoubleClick: boolean) => void
  onSelectedCellValueChange?: (value: number | null) => void
  onSelectedCellNotesChange?: (value: number) => void
  onViewSolutions?: () => void
}

interface KeyboardHandlerSettings {
  disabled?: boolean
  constraints: SudokuConstraints
  selectedCells: CellPosition[]
  notesActive?: boolean
  redoActive?: boolean
  undoActive?: boolean
  callbacks: SudokuEventCallbacks
}

// Not super satisfied with this keycloak handler approach :(
export const useKeyboardHandler = (
  { disabled, constraints, selectedCells, notesActive, redoActive, undoActive, callbacks }: KeyboardHandlerSettings
) => {
  const gridSize = constraints.gridSize

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (disabled) {
        return
      }

      if (ARROWS.includes(e.key)) {
        let nextCell
        if (!isEmpty(selectedCells)) {
          const dir = ARROWS.indexOf(e.key)
          const lastCell = last(selectedCells)!
          nextCell = {
            row: (lastCell.row + dirRow[dir] + gridSize) % gridSize,
            col: (lastCell.col + dirCol[dir] + gridSize) % gridSize,
          }
        } else {
          nextCell = {
            row: 0,
            col: 0,
          }
        }
        const ctrl = e.metaKey || e.ctrlKey || e.shiftKey
        callbacks.onSelectedCellChange?.(nextCell, ctrl, false, false)
        e.preventDefault()
        return
      }

      if (e.key === ' ' || e.key === 'Tab') {
        callbacks.onNotesActiveToggle?.()
        e.preventDefault()
        return
      }

      if (e.key.toLowerCase() === 'p') {
        callbacks.onPause?.();
        return
      }

      if (isEmpty(selectedCells)) {
        return
      }

      if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        if (redoActive) {
          callbacks.onRedo?.()
        }
        e.preventDefault()
        return
      }

      if (e.key === 'z' && (e.metaKey || e.ctrlKey)) {
        if (undoActive) {
          callbacks.onUndo?.()
        }
        e.preventDefault()
        return
      }

      if (e.key === 'Backspace') {
        callbacks.onSelectedCellValueChange?.(null)
        e.preventDefault()
        return
      }

      const value = parseInt(e.key)
      if (Number.isNaN(value)) {
        return
      }

      if (!inRange(value, 1, gridSize + 1)) {
        return
      }

      if (notesActive) {
        callbacks.onSelectedCellNotesChange?.(value)
      } else {
        callbacks.onSelectedCellValueChange?.(value)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [
    disabled, gridSize, selectedCells, notesActive, redoActive, undoActive,
    callbacks,
  ])
}
