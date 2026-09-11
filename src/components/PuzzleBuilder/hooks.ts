// TODO: move to ./hooks
import type { CellPosition, SudokuConstraints } from 'lisudoku-solver'
import { inRange, isEmpty, last } from 'lodash-es'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'src/hooks'
import { ConstraintType } from 'src/types/sudoku'
import {
  changeSelectedCell, changeSelectedCellConstraint, changeSelectedCellCornerMarks,
  changeSelectedCellValue, deleteConstraint,
  requestSolution, responseSolution, toggleCornerMarksActive,
} from 'src/reducers/builder'
import { SolverType } from 'src/types/wasm'
import { InputMode } from 'src/reducers/puzzle'
import { encodeSudoku, SudokuDataFormat } from 'sudoku-formats'
import { SolverWorkerClient } from 'src/workers/SolverWorkerClient'
import type { WorkerSolutionResponse } from 'src/workers/types'
import useInterval from 'react-useinterval'
import { differenceInMilliseconds, parseISO } from 'date-fns/esm'

const ARROWS = [ 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight' ]
const dirRow = [ -1, 1, 0, 0 ]
const dirCol = [ 0, 0, -1, 1 ]

// Not super satisfied with this keycloak handler approach :(
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
  const handleCornerMarksActiveToggle = useCallback(() => {
    dispatch(toggleCornerMarksActive())
  }, [dispatch])
  const handleSelectedCellCornerMarksChange = useCallback((value: number) => {
    dispatch(changeSelectedCellCornerMarks(value))
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
    onNotesActiveToggle: handleCornerMarksActiveToggle,
    onSelectedCellNotesChange: handleSelectedCellCornerMarksChange,
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
  const constraints = useSelector(state => state.builder.constraints)
  const selectedCells = useSelector(state => state.builder.constraintEditorState.selectedCells)
  const constraintType = useSelector(state => state.builder.constraintEditorState.type)
  const inputMode = useSelector(state => state.builder.inputMode)

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
        onCellClick(nextCell, ctrl, false)
        e.preventDefault()
        return
      }

      if (e.key === ' ') {
        onNotesActiveToggle()
        e.preventDefault()
        return
      }

      if (isEmpty(selectedCells)) {
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

      if (inputMode === InputMode.CornerMarks) {
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
    gridSize, selectedCells, constraintType, inputMode, digitsActive,
    onCellClick, onSelectedCellValueChange, onDelete,
    onNotesActiveToggle, onSelectedCellNotesChange,
    onSelectedCellConstraintChange,
    // redoActive, undoActive, onUndo, onRedo
  ])
}

export interface SolverHandle {
  run: (constraints: SudokuConstraints | null) => void
  stop: () => void
}

export const useSolver = (solverType: SolverType): SolverHandle => {
  const clientRef = useRef<SolverWorkerClient | null>(null)
  if (clientRef.current === null || clientRef.current.terminated()) {
    clientRef.current = new SolverWorkerClient(solverType)
  }

  useEffect(
    () => () => {
      clientRef.current?.terminate()
    },
    [],
  )

  const runStartedAt = useSelector(state => {
    const solverState = solverType === SolverType.Brute
      ? state.builder.bruteSolverState
      : state.builder.logicalSolverState
    return solverState.runStartedAt
  })
  useEffect(() => {
    if (
      runStartedAt === undefined &&
      clientRef.current !== null &&
      !clientRef.current.terminated() &&
      clientRef.current.pending()
    ) {
      // Forcefully stop current run because something external (changing constraints)
      // cleared the current run
      clientRef.current.restart()
    }
  }, [runStartedAt])

  const dispatch = useDispatch()

  const run = useCallback((constraints: SudokuConstraints | null) => {
    if (constraints === null) {
      return
    }

    dispatch(requestSolution(solverType))

    const handleError = (error: unknown) => {
      const aborted = error !== null && typeof error === 'object' && 'name' in error && error?.name === 'AbortError'
      if (aborted) {
        return
      }
      dispatch(responseSolution({
        solverType,
        error: 'Error while running solver',
      } satisfies WorkerSolutionResponse))
      throw new Error(
        `Error in ${solverType} solver with constraints ${encodeSudoku({ constraints, format: SudokuDataFormat.Lisudoku }).url}`,
        { cause: error },
      )
    }

    try {
      clientRef.current
        ?.run(constraints)
        .then(response => {
          dispatch(responseSolution(response))
        })
        .catch(error => {
          handleError(error)
        })
    } catch (error) {
      handleError(error)
    }
  }, [dispatch, solverType])

  const stop = useCallback(() => {
    clientRef.current?.restart()
  }, [])

  return useMemo(() => ({ run, stop }), [run, stop])
}

export const useElapsedTime = (startedAt?: string) => {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (startedAt === undefined) {
      setElapsed(0)
    }
  }, [startedAt])

  useInterval(() => {
    if (startedAt !== undefined) {
      setElapsed(differenceInMilliseconds(new Date(), parseISO(startedAt)))
    }
  }, startedAt !== undefined ? 100 : null)

  return elapsed
}

const formatElapsedTime = (ms: number) => (
  (ms / 1000).toFixed(1) + 's'
)

export const useFormattedElapsedTime = (startedAt?: string) => {
  const elapsedTime = useElapsedTime(startedAt)
  if (elapsedTime < 1_500) {
    return ''
  }
  return formatElapsedTime(elapsedTime)
}
