import _ from 'lodash'
import { useCallback, useEffect } from 'react'
import { useSelector, useDispatch } from 'src/hooks'
import { CellPosition } from 'src/types/sudoku'
import {
  changeSelectedCell, changeSelectedCellNotes, changeSelectedCellRegion, changeSelectedCellValue, ConstraintType, deleteConstraint, toggleNotesActive,
} from 'src/reducers/admin'

const ARROWS = [ 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight' ]
const dirRow = [ -1, 1, 0, 0 ]
const dirCol = [ 0, 0, -1, 1 ]

export const useControlCallbacks = () => {
  const dispatch = useDispatch()

  // const undoActive = useSelector(state => state.admin.actionIndex >= 0)
  // const redoActive = useSelector(state => (
  //   state.admin.actionIndex + 1 < state.admin.actions.length
  // ))

  const handleCellClick = useCallback((cell: CellPosition) => {
    dispatch(changeSelectedCell(cell))
  }, [dispatch])

  const handleSelectedCellValueChange = useCallback((value: number | null) => {
    dispatch(changeSelectedCellValue(value))
  }, [dispatch])
  const handleDelete = useCallback(() => {
    dispatch(deleteConstraint())
  }, [dispatch])
  const handleNotesActiveToggle = useCallback(() => {
    dispatch(toggleNotesActive())
  }, [dispatch])
  const handleSelectedCellNotesChange = useCallback((value: number) => {
    dispatch(changeSelectedCellNotes(value))
  }, [dispatch])
  const handleSelectedCellRegionChange = useCallback((value: number) => {
    dispatch(changeSelectedCellRegion(value))
  }, [dispatch])

  // const handleUndo = useCallback(() => {
  //   dispatch(undoAction())
  // }, [dispatch])
  // const handleRedo = useCallback(() => {
  //   dispatch(redoAction())
  // }, [dispatch])

  return {
    onSelectedCellValueChange: handleSelectedCellValueChange,
    onNotesActiveToggle: handleNotesActiveToggle,
    onSelectedCellNotesChange: handleSelectedCellNotesChange,
    onCellClick: handleCellClick,
    onDelete: handleDelete,
    onSelectedCellRegionChange: handleSelectedCellRegionChange,
    // undoActive,
    // redoActive,
    // onUndo: handleUndo,
    // onRedo: handleRedo,
  }
}

export const useKeyboardHandler = () => {
  const constraints = useSelector(state => state.admin.constraints)
  const selectedCell = useSelector(state => state.admin.selectedCell)
  const constraintType = useSelector(state => state.admin.constraintType)
  const notesActive = useSelector(state => state.admin.notesActive)

  const gridSize = constraints?.gridSize ?? 9

  const {
    onCellClick, onDelete,
    onSelectedCellValueChange, onNotesActiveToggle, onSelectedCellNotesChange,
    onSelectedCellRegionChange,
    // undoActive, redoActive, onUndo, onRedo,
  } = useControlCallbacks()

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
        onCellClick(nextCell)
        e.preventDefault()
        return
      }

      if (selectedCell === null) {
        return
      }

      if (e.key === ' ') {
        onNotesActiveToggle()
        return
      }

      // TODO: implement undo/redo for the puzzle builder
      // if (e.key === 'z' && (e.metaKey || e.ctrlKey)) {
      //   if (undoActive) {
      //     onUndo()
      //   }
      //   e.preventDefault()
      //   return
      // }
      // 
      // if (e.key === 'y' && (e.metaKey || e.ctrlKey)) {
      //   if (redoActive) {
      //     onRedo()
      //   }
      //   e.preventDefault()
      //   return
      // }

      if (e.key === 'Backspace') {
        onDelete()
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
      } else if (constraintType === ConstraintType.FixedNumber) {
        onSelectedCellValueChange(value)
      } else if (constraintType === ConstraintType.Regions) {
        onSelectedCellRegionChange(value)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [
    gridSize, selectedCell, constraintType, notesActive,
    onCellClick, onSelectedCellValueChange, onDelete,
    onNotesActiveToggle, onSelectedCellNotesChange, onSelectedCellRegionChange,
    // redoActive, undoActive, onUndo, onRedo
  ])
}
