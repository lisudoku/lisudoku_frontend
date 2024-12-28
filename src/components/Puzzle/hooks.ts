import { inRange, isEmpty, isEqual, last, pullAllWith, uniqBy } from 'lodash-es'
import { useEffect, useCallback, useMemo } from 'react'
import { CellMarks, CellPosition, FixedNumber, Grid, SudokuConstraints } from 'src/types/sudoku'
import { computeErrors, computeFixedNumbersGrid, getAreaCells, getCellPeers } from 'src/utils/sudoku'
import { useSelector, useDispatch } from 'src/hooks'
import {
  HintLevel,
  InputMode,
  changeInputMode,
  changePaused,
  changeSelectedCell,
  changeSelectedCellValue, changeSelectedCellCornerMarks, changeSelectedCellCenterMarks,
  fetchNewPuzzle, redoAction, resetPuzzle, undoAction, changeNextInputMode,
} from 'src/reducers/puzzle'
import { useWebsocket } from 'src/utils/websocket'
import { TvMessageType } from 'src/screens/TvPage/hooks'
import { CellHighlight } from './SudokuGridGraphics'
import { StepRule } from 'src/types/wasm'
import { Theme, useTheme } from '../ThemeProvider'
import { confirm } from 'src/shared/ConfirmationDialog'

const ARROWS = [ 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight' ]
const dirRow = [ -1, 1, 0, 0 ]
const dirCol = [ 0, 0, -1, 1 ]

export const useFixedNumbersGrid = (gridSize: number, fixedNumbers?: FixedNumber[]) => (
  useMemo(() => computeFixedNumbersGrid(gridSize, fixedNumbers), [gridSize, fixedNumbers])
)

export const useGridErrors = (
  checkErrors: boolean, constraints: SudokuConstraints, grid?: Grid, cellMarks?: CellMarks[][]
) => (
  useMemo(() => (
    computeErrors(checkErrors, constraints, grid, cellMarks).gridErrors
  ), [checkErrors, constraints, grid, cellMarks])
)

export const useCellMarkErrors = (
  checkErrors: boolean, constraints: SudokuConstraints, grid?: Grid, cellMarks?: CellMarks[][]
) => (
  useMemo(() => (
    computeErrors(checkErrors, constraints, grid, cellMarks).cellMarksErrors
  ), [checkErrors, constraints, grid, cellMarks])
)

export const useControlCallbacks = (isSolvedLoading: boolean) => {
  const dispatch = useDispatch()

  const solveTimer = useSelector(state => state.puzzle.solveTimer)
  const solved = useSelector(state => state.puzzle.solved)
  const paused = useSelector(state => state.puzzle.controls.paused)
  const inputMode = useSelector(state => state.puzzle.controls.inputMode)
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
  const handleSelectedCellCornerMarksChange = useCallback((value: number) => {
    dispatch(changeSelectedCellCornerMarks(value))
  }, [dispatch])
  const handleSelectedCellCenterMarksChange = useCallback((value: number) => {
    dispatch(changeSelectedCellCenterMarks(value))
  }, [dispatch])
  const handleSelectedCellDigitInput = useCallback((value: number | null) => {
    switch (inputMode) {
      case InputMode.Numbers:
        handleSelectedCellValueChange(value)
        break
      case InputMode.CornerMarks:
        if (value !== null) {
          handleSelectedCellCornerMarksChange(value)
        }
        break
      case InputMode.CenterMarks:
        if (value !== null) {
          handleSelectedCellCenterMarksChange(value)
        }
        break
    }
  }, [
    inputMode, handleSelectedCellValueChange,
    handleSelectedCellCornerMarksChange, handleSelectedCellCenterMarksChange,
  ])

  const handleNextInputMode = useCallback(() => {
    dispatch(changeNextInputMode())
  }, [dispatch])
  const handleNumbersActive = useCallback(() => {
    dispatch(changeInputMode(InputMode.Numbers))
  }, [dispatch])
  const handleCornerMarksActive = useCallback(() => {
    dispatch(changeInputMode(InputMode.CornerMarks))
  }, [dispatch])
  const handleCenterMarksActive = useCallback(() => {
    dispatch(changeInputMode(InputMode.CenterMarks))
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
  const handleNewPuzzle = useCallback(async () => {
    setTimeout(() => dispatch(changePaused(true)), 1)
    if (solved ||
        solveTimer < 15 ||
        await confirm('Are you sure you want to abort the current puzzle?')
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
    inputMode,
    undoActive,
    redoActive,
    onNextInputMode: handleNextInputMode,
    onSelectedCellValueChange: handleSelectedCellValueChange,
    onSelectedCellCornerMarksChange: handleSelectedCellCornerMarksChange,
    onSelectedCellCenterMarksChange: handleSelectedCellCenterMarksChange,
    onSelectedCellDigitInput: handleSelectedCellDigitInput,
    onSelectedCellChange: handleSelectedCellChange,
    onNumbersActive: handleNumbersActive,
    onCornerMarksActive: handleCornerMarksActive,
    onCenterMarksActive: handleCenterMarksActive,
    onNewPuzzle: handleNewPuzzle,
    onReset: handleReset,
    onUndo: handleUndo,
    onRedo: handleRedo,
    onPause: handlePause,
  }
}

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

export const useTvPlayerWebsocket = () => {
  const isExternal = useSelector(state => state.puzzle.data?.isExternal)
  const publicId = useSelector(state => state.puzzle.data?.publicId)
  const grid = useSelector(state => state.puzzle.grid)
  const cellMarks = useSelector(state => state.puzzle.cellMarks)
  const selectedCells = useSelector(state => state.puzzle.controls.selectedCells)
  const solved = useSelector(state => state.puzzle.solved)

  const { ready, sendMessage } = useWebsocket('TvChannel', null, { is_player: true }, isExternal)

  useEffect(() => {
    if (!ready || publicId === undefined) {
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
        cell_marks: cellMarks,
        selected_cells: selectedCells,
        solved,
      },
    })
  }, [ready, publicId, sendMessage, grid, cellMarks, selectedCells, solved, isExternal])
}

const OTHER_CELLS_COLOR = 'red'

export const useCellHighlights = () => {
  const constraints = useSelector(state => state.puzzle.data?.constraints)
  const selectedCells = useSelector(state => state.puzzle.controls.selectedCells)
  const hintLevel = useSelector(state => state.puzzle.controls.hintLevel)
  const hintSolution = useSelector(state => state.puzzle.controls.hintSolution)
  const userSettings = useSelector(state => state.userData.settings)
  const { theme } = useTheme()

  const areaColor = theme === Theme.Light ? 'grey' : 'lightgray'
  const cellColor = theme === Theme.Light ? 'grey' : 'lightgreen'

  const hintHighlights = useMemo(() => {
    if (constraints === undefined) {
      return []
    }
    if (hintLevel !== HintLevel.Big || hintSolution === null) {
      return []
    }

    let cellHighlights: CellHighlight[] = []

    // TODO: this highlight feature code should be more tightly coupled with the hint feature
    const step = hintSolution.steps![hintSolution.steps!.length - 1]
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
      case StepRule.HiddenSingle:
      case StepRule.Thermo:
      case StepRule.PalindromeValues: {
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
  }, [areaColor, cellColor, hintLevel, hintSolution, constraints, userSettings])

  const peersHighlights = useMemo(() => {
    if (constraints === undefined || userSettings === undefined ||
      !userSettings.showPeers || selectedCells.length !== 1
    ) {
      return []
    }

    const selectedCell = selectedCells[0]
    const peers = getCellPeers(constraints, selectedCell)
    pullAllWith(peers, [selectedCell], isEqual)

    const cellHighlights: CellHighlight[] = peers.map(peer => ({
      position: peer,
      color: cellColor,
    }))

    return cellHighlights
  }, [cellColor, constraints, userSettings, selectedCells])

  const cellHighlights = uniqBy(hintHighlights.concat(peersHighlights), 'position')

  return cellHighlights
}
