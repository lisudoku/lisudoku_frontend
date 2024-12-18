import { inRange, isEmpty, last } from 'lodash-es'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useSelector, useDispatch } from 'src/hooks'
import { CellPosition, ConstraintType, SudokuConstraints } from 'src/types/sudoku'
import {
  changeSelectedCell, changeSelectedCellConstraint, changeSelectedCellCornerMarks,
  changeSelectedCellValue, deleteConstraint,
  errorSolution, requestSolution, responseSolution, toggleCornerMarksActive,
} from 'src/reducers/builder'
import { SolverType } from 'src/types/wasm'
import SolverWorker from 'src/workers/solver.worker?worker'
import { InputMode } from 'src/reducers/puzzle'

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
  const selectedCells = useSelector(state => state.builder.selectedCells)
  const constraintType = useSelector(state => state.builder.constraintType)
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

export const useSolver = (solverType: SolverType) => {
  const onWorkerInitializedResolve = useRef<Function>()

  const [ worker, onWorkerInitialized ] = useMemo(
    () => {
      const _onWorkerInitialized = new Promise((resolve) => {
        onWorkerInitializedResolve.current = resolve
      })

      const _worker = new SolverWorker()

      // Wait for 'init' message and then mark worker as initialized
      _worker.addEventListener('message', (e) => {
        onWorkerInitializedResolve.current!()
      }, { once: true })

      return [ _worker, _onWorkerInitialized ]
    },
    []
  )

  const callSolverWorker = useCallback(async (constraints: SudokuConstraints, solverType: SolverType) => {
    // Wait for worker to initialize
    await onWorkerInitialized

    // Send constraints and wait for the solution
    return new Promise(resolve => {
      worker.onerror = (e) => {
        console.error(e)
      }
      worker.onmessage = ({ data }) => {
        resolve(data)
      }
      worker.postMessage({
        solverType,
        constraints,
      })
    })
  }, [worker, onWorkerInitialized])

  const dispatch = useDispatch()

  const runSolver = useCallback((constraints: SudokuConstraints | null) => {
    if (constraints === null) {
      return
    }
    dispatch(requestSolution(solverType))
    try {
      callSolverWorker(constraints, solverType).then(solution => {
        dispatch(responseSolution({ type: solverType, solution }))
      })
    } catch (e: any) {
      dispatch(errorSolution(solverType))
      throw e
    }
  }, [dispatch, solverType, callSolverWorker])

  return runSolver
}
