import _ from 'lodash'
import { useCallback, useEffect } from 'react'
import { useSelector, useDispatch } from 'src/hooks'
import { CellPosition } from 'src/types/sudoku'
import {
  changeSelectedCell, changeSelectedCellConstraint, changeSelectedCellNotes,
  changeSelectedCellValue, ConstraintType, deleteConstraint, toggleNotesActive,
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

  const handleCellClick = useCallback((cell: CellPosition, ctrl: boolean, isClick: boolean) => {
    dispatch(changeSelectedCell({ cell, ctrl, isClick }))
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
  const handleSelectedCellConstraintChange = useCallback((value: number) => {
    dispatch(changeSelectedCellConstraint(value))
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
    onSelectedCellConstraintChange: handleSelectedCellConstraintChange,
    // undoActive,
    // redoActive,
    // onUndo: handleUndo,
    // onRedo: handleRedo,
  }
}

export const useKeyboardHandler = (digitsActive = true) => {
  const constraints = useSelector(state => state.admin.constraints)
  const selectedCells = useSelector(state => state.admin.selectedCells)
  const constraintType = useSelector(state => state.admin.constraintType)
  const notesActive = useSelector(state => state.admin.notesActive)

  const gridSize = constraints?.gridSize ?? 9

  const {
    onCellClick, onDelete,
    onSelectedCellValueChange, onNotesActiveToggle, onSelectedCellNotesChange,
    onSelectedCellConstraintChange,
    // undoActive, redoActive, onUndo, onRedo,
  } = useControlCallbacks()

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!digitsActive) {
        return
      }

      if (ARROWS.includes(e.key)) {
        let nextCell
        if (!_.isEmpty(selectedCells)) {
          const dir = ARROWS.indexOf(e.key)
          const lastCell = _.last(selectedCells)!
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
        onCellClick(nextCell, ctrl, false)
        e.preventDefault()
        return
      }

      if (_.isEmpty(selectedCells)) {
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
      } else {
        onSelectedCellConstraintChange(value)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [
    gridSize, selectedCells, constraintType, notesActive, digitsActive,
    onCellClick, onSelectedCellValueChange, onDelete,
    onNotesActiveToggle, onSelectedCellNotesChange,
    onSelectedCellConstraintChange,
    // redoActive, undoActive, onUndo, onRedo
  ])
}
