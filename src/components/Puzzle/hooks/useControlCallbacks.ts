import { useCallback } from 'react'
import type { CellPosition } from 'lisudoku-solver'
import { useDispatch, useSelector } from 'src/hooks'
import {
  InputMode,
  changeInputMode,
  changePaused,
  changeSelectedCell,
  changeSelectedCellValue, changeSelectedCellCornerMarks, changeSelectedCellCenterMarks,
  fetchNewPuzzle, redoAction, resetPuzzle, undoAction, changeNextInputMode,
} from 'src/reducers/puzzle'

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
