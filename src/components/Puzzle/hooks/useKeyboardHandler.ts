import { useEffect } from 'react'
import { inRange, isEmpty, last } from 'lodash-es'
import { useSelector } from 'src/hooks'
import { useControlCallbacks } from './useControlCallbacks'

const ARROWS = [ 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight' ]
const dirRow = [ -1, 1, 0, 0 ]
const dirCol = [ 0, 0, -1, 1 ]

export const useKeyboardHandler = (isSolvedLoading: boolean) => {
  const constraints = useSelector(state => state.puzzle.data?.constraints)
  const selectedCells = useSelector(state => state.puzzle.controls.selectedCells)

  const {
    enabled, inputMode, undoActive, redoActive,
    onSelectedCellChange, onUndo, onRedo, onPause, onNextInputMode,
    onSelectedCellValueChange, onSelectedCellDigitInput,
  } = useControlCallbacks(isSolvedLoading)

  const gridSize = constraints?.gridSize

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!enabled || gridSize === undefined) {
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
        onSelectedCellChange(nextCell, ctrl, false, false)
        e.preventDefault()
        return
      }

      if (e.key === ' ' || e.key === 'Tab') {
        onNextInputMode()
        e.preventDefault()
        return
      }

      if (e.key.toLowerCase() === 'p') {
        onPause();
        return
      }

      if (isEmpty(selectedCells)) {
        return
      }

      if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        if (redoActive) {
          onRedo()
        }
        e.preventDefault()
        return
      }

      if (e.key === 'z' && (e.metaKey || e.ctrlKey)) {
        if (undoActive) {
          onUndo()
        }
        e.preventDefault()
        return
      }

      if (e.key === 'Backspace') {
        onSelectedCellValueChange(null)
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

      onSelectedCellDigitInput(value)
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [
    enabled, gridSize, selectedCells, inputMode, redoActive, undoActive,
    onSelectedCellChange, onSelectedCellValueChange,
    onUndo, onRedo, onPause,
  ])
}
