import _ from 'lodash'
import { useEffect, useCallback, useMemo } from 'react'
import { CellNotes, CellPosition, FixedNumber, Grid, SudokuConstraints } from 'src/types/sudoku'
import { computeErrors, computeFixedNumbersGrid } from 'src/utils/sudoku'
import { useSelector, useDispatch } from 'src/hooks'
import {
  changeSelectedCell, changeSelectedCellNotes, changeSelectedCellValue,
  fetchNewPuzzle, redoAction, resetPuzzle, toggleNotesActive, undoAction,
} from 'src/reducers/puzzle'
import { useWebsocket } from 'src/utils/websocket'
import { TvMessageType } from 'src/screens/TvPage/hooks'

const ARROWS = [ 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight' ]
const dirRow = [ -1, 1, 0, 0 ]
const dirCol = [ 0, 0, -1, 1 ]

export const useFixedNumbersGrid = (gridSize: number, fixedNumbers: FixedNumber[]) => (
  useMemo(() => computeFixedNumbersGrid(gridSize, fixedNumbers), [gridSize, fixedNumbers])
)

export const useGridErrors = (
  checkErrors: boolean, constraints: SudokuConstraints, grid?: Grid, notes?: CellNotes[][]
) => (
  useMemo(() => (
    computeErrors(checkErrors, constraints, grid, notes).gridErrors
  ), [checkErrors, constraints, grid, notes])
)

export const useNoteErrors = (
  checkErrors: boolean, constraints: SudokuConstraints, grid?: Grid, notes?: CellNotes[][]
) => (
  useMemo(() => (
    computeErrors(checkErrors, constraints, grid, notes).noteErrors
  ), [checkErrors, constraints, grid, notes])
)

export const useControlCallbacks = (isSolvedLoading: boolean) => {
  const dispatch = useDispatch()

  const solveTimer = useSelector(state => state.puzzle.solveTimer)
  const solved = useSelector(state => state.puzzle.solved)
  const paused = useSelector(state => state.puzzle.controls.paused)
  const selectedCell = useSelector(state => state.puzzle.controls.selectedCell)
  const notesActive = useSelector(state => state.puzzle.controls.notesActive)
  const undoActive = useSelector(state => state.puzzle.controls.actionIndex >= 0)
  const redoActive = useSelector(state => (
    state.puzzle.controls.actionIndex + 1 < state.puzzle.controls.actions.length
  ))

  const enabled = !solved && !isSolvedLoading && !paused

  const handleSelectedCellChange = useCallback((cell: CellPosition) => {
    if (selectedCell === null || cell.row !== selectedCell.row || cell.col !== selectedCell.col) {
      dispatch(changeSelectedCell(cell))
    }
  }, [dispatch, selectedCell])
  const handleSelectedCellValueChange = useCallback((value: number | null) => {
    dispatch(changeSelectedCellValue(value))
  }, [dispatch])
  const handleSelectedCellNotesChange = useCallback((value: number) => {
    dispatch(changeSelectedCellNotes(value))
  }, [dispatch])
  const handleNotesActiveToggle = useCallback(() => {
    dispatch(toggleNotesActive())
  }, [dispatch])
  const handleReset = useCallback(() => {
    dispatch(resetPuzzle())
  }, [dispatch])
  const handleUndo = useCallback(() => {
    dispatch(undoAction())
  }, [dispatch])
  const handleRedo = useCallback(() => {
    dispatch(redoAction())
  }, [dispatch])
  const handleNewPuzzle = useCallback(() => {
    if (solved ||
        solveTimer < 15 ||
        window.confirm('Are you sure you want to abort the current puzzle?')
    ) {
      dispatch(fetchNewPuzzle())
    }
  }, [dispatch, solved, solveTimer])

  return {
    enabled,
    notesActive,
    undoActive,
    redoActive,
    onSelectedCellValueChange: handleSelectedCellValueChange,
    onSelectedCellNotesChange: handleSelectedCellNotesChange,
    onSelectedCellChange: handleSelectedCellChange,
    onNotesActiveToggle: handleNotesActiveToggle,
    onNewPuzzle: handleNewPuzzle,
    onReset: handleReset,
    onUndo: handleUndo,
    onRedo: handleRedo,
  }
}

export const useKeyboardHandler = (isSolvedLoading: boolean) => {
  const constraints = useSelector(state => state.puzzle.data!.constraints)
  const selectedCell = useSelector(state => state.puzzle.controls.selectedCell)

  const { gridSize, fixedNumbers } = constraints
  const fixedNumbersGrid = useFixedNumbersGrid(gridSize, fixedNumbers)

  const {
    enabled, notesActive, undoActive, redoActive,
    onSelectedCellChange, onNotesActiveToggle, onUndo, onRedo,
    onSelectedCellValueChange, onSelectedCellNotesChange,
  } = useControlCallbacks(isSolvedLoading)

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!enabled) {
        e.preventDefault()
        return
      }

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

      if (e.key.toLowerCase() === ' ') {
        onNotesActiveToggle()
        e.preventDefault()
        return
      }

      if (selectedCell === null || !_.isNil(fixedNumbersGrid[selectedCell.row][selectedCell.col])) {
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
    enabled, gridSize, fixedNumbersGrid, selectedCell, notesActive, redoActive, undoActive,
    onSelectedCellChange, onNotesActiveToggle, onSelectedCellValueChange,
    onSelectedCellNotesChange, onUndo, onRedo
  ])
}

export const useTvPlayerWebsocket = () => {
  const publicId = useSelector(state => state.puzzle.data!.publicId!)
  const grid = useSelector(state => state.puzzle.grid)
  const notes = useSelector(state => state.puzzle.notes)
  const selectedCell = useSelector(state => state.puzzle.controls.selectedCell)
  const solved = useSelector(state => state.puzzle.solved)

  const { ready, sendMessage } = useWebsocket('TvChannel', null, { is_player: true })

  useEffect(() => {
    if (!ready) {
      return
    }
    sendMessage({
      type: TvMessageType.PuzzleUpdate,
      data: {
        puzzle_id: publicId,
        grid,
        notes,
        selected_cell: selectedCell,
        solved,
      },
    })
  }, [ready, publicId, sendMessage, grid, notes, selectedCell, solved])
}
