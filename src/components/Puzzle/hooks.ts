import _ from 'lodash'
import { useEffect, useCallback, useMemo } from 'react'
import { CellNotes, CellPosition, FixedNumber, Grid, SudokuConstraints } from 'src/types/sudoku'
import { computeErrors, computeFixedNumbersGrid, getAreaCells } from 'src/utils/sudoku'
import { useSelector, useDispatch } from 'src/hooks'
import {
  HintLevel,
  changePaused,
  changeSelectedCell, changeSelectedCellNotes, changeSelectedCellValue,
  fetchNewPuzzle, redoAction, resetPuzzle, toggleNotesActive, undoAction,
} from 'src/reducers/puzzle'
import { useWebsocket } from 'src/utils/websocket'
import { TvMessageType } from 'src/screens/TvPage/hooks'
import { CellHighlight } from './SudokuGridGraphics'
import { StepRule, SudokuLogicalSolveResult } from 'src/types/wasm'
import { Theme, useTheme } from '../ThemeProvider'

const ARROWS = [ 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight' ]
const dirRow = [ -1, 1, 0, 0 ]
const dirCol = [ 0, 0, -1, 1 ]

export const useFixedNumbersGrid = (gridSize: number, fixedNumbers?: FixedNumber[]) => (
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
  const notesActive = useSelector(state => state.puzzle.controls.notesActive)
  const undoActive = useSelector(state => state.puzzle.controls.actionIndex >= 0)
  const redoActive = useSelector(state => (
    state.puzzle.controls.actionIndex + 1 < state.puzzle.controls.actions.length
  ))

  const enabled = !solved && !isSolvedLoading && !paused

  const handleSelectedCellChange = useCallback((cell: CellPosition, ctrl: boolean, isClick: boolean, doubleClick: boolean) => {
    dispatch(changeSelectedCell({ cell, ctrl, isClick, doubleClick }))
  }, [dispatch])
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
    setTimeout(() => dispatch(changePaused(false)), 1)
  }, [dispatch, solved, solveTimer])
  const handlePause = useCallback(() => {
    dispatch(changePaused(true))
  }, [dispatch]);

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
    onPause: handlePause,
  }
}

export const useKeyboardHandler = (isSolvedLoading: boolean) => {
  const constraints = useSelector(state => state.puzzle.data!.constraints)
  const selectedCells = useSelector(state => state.puzzle.controls.selectedCells)

  const { gridSize } = constraints

  const {
    enabled, notesActive, undoActive, redoActive,
    onSelectedCellChange, onNotesActiveToggle, onUndo, onRedo,
    onSelectedCellValueChange, onSelectedCellNotesChange, onPause,
  } = useControlCallbacks(isSolvedLoading)

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!enabled) {
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
        onSelectedCellChange(nextCell, ctrl, false, false)
        e.preventDefault()
        return
      }

      if (e.key === ' ' || e.key === 'Tab') {
        onNotesActiveToggle()
        e.preventDefault()
        return
      }

      if (e.key.toLowerCase() === 'p') {
        onPause();
        return
      }

      if (_.isEmpty(selectedCells)) {
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
    enabled, gridSize, selectedCells, notesActive, redoActive, undoActive,
    onSelectedCellChange, onNotesActiveToggle, onSelectedCellValueChange,
    onSelectedCellNotesChange, onUndo, onRedo, onPause,
  ])
}

export const useTvPlayerWebsocket = () => {
  const isExternal = useSelector(state => state.puzzle.data!.isExternal)
  const publicId = useSelector(state => state.puzzle.data!.publicId)
  const grid = useSelector(state => state.puzzle.grid)
  const notes = useSelector(state => state.puzzle.notes)
  const selectedCells = useSelector(state => state.puzzle.controls.selectedCells)
  const solved = useSelector(state => state.puzzle.solved)

  const { ready, sendMessage } = useWebsocket('TvChannel', null, { is_player: true }, isExternal)

  useEffect(() => {
    if (!ready) {
      return
    }
    if (isExternal) {
      // Don't show external puzzles on TV
      return
    }
    sendMessage({
      type: TvMessageType.PuzzleUpdate,
      data: {
        puzzle_id: publicId,
        grid,
        notes,
        selected_cells: selectedCells,
        solved,
      },
    })
  }, [ready, publicId, sendMessage, grid, notes, selectedCells, solved, isExternal])
}

const OTHER_CELLS_COLOR = 'red'

export const useCellHighlights = (hintLevel: HintLevel | null, hintSolution: SudokuLogicalSolveResult | null, constraints: SudokuConstraints) => {
  const theme = useTheme()
  const cellHighlights = useMemo(() => {
    const areaColor = theme === Theme.Light ? 'grey' : 'lightgray'
    const cellColor = theme === Theme.Light ? 'grey' : 'lightgreen'

    if (hintLevel !== HintLevel.Big || hintSolution === null) {
      return []
    }

    let cellHighlights: CellHighlight[] = []
    const step = hintSolution.steps!.at(-1)
    if (!step) {
      return []
    }

    const cell = step.cells[0]
    const area = step.areas[0]
    const otherCells = step.cells.slice(1)

    switch (step?.rule) {
      case StepRule.NakedSingle: {
        cellHighlights.push({
          position: cell,
          color: cellColor,
        })
        break
      }
      case StepRule.HiddenSingle: {
        cellHighlights = getAreaCells(area, constraints).map((areaCell: CellPosition) => ({
          position: areaCell,
          color: areaColor,
        }))
        otherCells.forEach(otherCell => {
          cellHighlights.push({
            position: otherCell,
            color: OTHER_CELLS_COLOR,
          })
        })
        cellHighlights.push({
          position: cell,
          color: cellColor,
        })
        break
      }
    }

    return cellHighlights
  }, [hintLevel, hintSolution, constraints, theme])

  return cellHighlights
}
