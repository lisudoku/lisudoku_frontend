import { CellPosition, FixedNumber } from 'lisudoku-solver';
import { isEqual, uniqWith } from 'lodash-es';
import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'src/hooks';
import { changeSelectedCell, changeSelectedCellValue, fetchNewPuzzle, showSolutions } from 'src/reducers/trainer';
import { confirm } from 'src/design_system/ConfirmationDialog';
import { Grid } from 'src/types/sudoku';
import { requestTrainerPuzzleCheck } from 'src/utils/apiService';
import { SudokuEventCallbacks, useKeyboardHandler } from 'src/utils/keyboard';

interface TrainerControlCallbacks extends SudokuEventCallbacks {
  onNextPuzzle: () => void
}

export const useTrainerControls: () => TrainerControlCallbacks = () => {
  const dispatch = useDispatch()
  const trainerPuzzleId = useSelector(state => state.trainer.data?.id)
  const selectedCell = useSelector(state => state.trainer.selectedCell)
  const finished = useSelector(state => state.trainer.finished)

  const handleSelectedCellChange = useCallback((cell: CellPosition) => {
    dispatch(changeSelectedCell(cell))
  }, [dispatch])

  const handleSelectedCellValueChange = useCallback((value: number | null) => {
    dispatch(changeSelectedCellValue(value))
    if (selectedCell && value && trainerPuzzleId !== undefined) {
      requestTrainerPuzzleCheck(trainerPuzzleId, {
        value,
        position: selectedCell,
      })
    }
  }, [dispatch, trainerPuzzleId, selectedCell])

  const handleViewSolutions = useCallback(() => {
    dispatch(showSolutions())
    if (trainerPuzzleId !== undefined) {
      requestTrainerPuzzleCheck(trainerPuzzleId)
    }
  }, [dispatch, trainerPuzzleId])

  const handleNextPuzzle = useCallback(async () => {
    if (finished || await confirm('Are you sure you want to abort the current puzzle?')) {
      dispatch(fetchNewPuzzle())
    }
  }, [dispatch, finished])

  return {
    onSelectedCellChange: handleSelectedCellChange,
    onSelectedCellValueChange: handleSelectedCellValueChange,
    onViewSolutions: handleViewSolutions,
    onNextPuzzle: handleNextPuzzle,
    // TODO: Horrible hack, should have mapping between keys and actions, please fix :(
    onNotesActiveToggle: handleNextPuzzle,
  }
}

export const useTrainerKeyboardHandler: () => void = () => {
  const callbacks = useTrainerControls()
  const constraints = useSelector(state => state.trainer.data?.constraints)
  const selectedCell = useSelector(state => state.trainer.selectedCell)
  const selectedCells = selectedCell ? [selectedCell] : []
  useKeyboardHandler({ constraints, selectedCells, callbacks })
}

export const useCellHighlights = (finished: boolean, success: boolean, solutions: FixedNumber[] | undefined, grid: Grid | undefined) => {
  const cellHighlights = useMemo(() => {
    if (!finished || solutions === undefined) {
      return []
    }
    return uniqWith(solutions, (a, b) => isEqual(a.position, b.position))
      .filter(({ position: { row, col }}) => !success || !grid![row][col])
      .map(fixedNumber => ({
        position: fixedNumber.position,
        color: success ? 'lightgreen' : 'red',
        value: fixedNumber.value,
      }))
  }, [finished, success, solutions, grid])
  return cellHighlights
}
