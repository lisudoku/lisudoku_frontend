import _ from 'lodash'
import { useEffect, useMemo } from 'react'
import { CellPosition, FixedNumber } from 'src/types/sudoku'
import { computeFixedNumbersGrid } from 'src/utils/sudoku'

const ARROWS = [ 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight' ]
const dirRow = [ -1, 1, 0, 0 ]
const dirCol = [ 0, 0, -1, 1 ]

export const useFixedNumbersGrid = (gridSize: number, fixedNumbers: FixedNumber[]) => (
  useMemo(() => computeFixedNumbersGrid(gridSize, fixedNumbers), [gridSize, fixedNumbers])
)

export const useKeyboardHandler = (
  enabled: boolean, gridSize: number, fixedNumbers: FixedNumber[],
  selectedCell: CellPosition | null, notesActive: boolean,
  onSelectedCellChange: Function, onNotesActiveToggle: Function,
  onSelectedCellValueChange: Function, onSelectedCellNotesChange: Function
) => {
  const fixedNumbersGrid = useFixedNumbersGrid(gridSize, fixedNumbers)

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (ARROWS.includes(e.key)) {
        let nextCell
        if (selectedCell !== null) {
          const dir = ARROWS.indexOf(e.key)
          nextCell = {
            row: (selectedCell.row + dirRow[dir] + gridSize) % gridSize,
            col: (selectedCell.col + dirCol[dir] + gridSize) % gridSize,
          }
        } else {
          nextCell = {
            row: 0,
            col: 0,
          }
        }
        onSelectedCellChange(nextCell)
        e.preventDefault()
        return
      }

      if (e.key.toLowerCase() === 'n') {
        onNotesActiveToggle()
        return
      }

      if (!enabled || selectedCell === null || !_.isNil(fixedNumbersGrid[selectedCell.row][selectedCell.col])) {
        return
      }

      if (e.key === 'Backspace') {
        onSelectedCellValueChange(null)
        onSelectedCellNotesChange(null)
        return
      }

      const value = parseInt(e.key)
      if (Number.isNaN(value)) {
        return
      }

      if (!_.inRange(value, 1, gridSize + 1)) {
        return
      }

      if (notesActive) {
        onSelectedCellNotesChange(value)
      } else {
        onSelectedCellValueChange(value)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [
    enabled, gridSize, fixedNumbersGrid, selectedCell, notesActive,onSelectedCellChange,
    onNotesActiveToggle, onSelectedCellValueChange, onSelectedCellNotesChange,
  ])
}
