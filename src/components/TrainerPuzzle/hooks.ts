import { useCallback } from 'react';
import { useDispatch, useSelector } from 'src/hooks';
import { changeSelectedCell, changeSelectedCellValue, showSolutions } from 'src/reducers/trainer';
import { CellPosition } from 'src/types/sudoku';
import { requestTrainerPuzzleCheck } from 'src/utils/apiService';
import { SudokuEventCallbacks, useKeyboardHandler } from 'src/utils/keyboard';

export const useTrainerControls: () => SudokuEventCallbacks = () => {
  const dispatch = useDispatch()
  const trainerPuzzleId = useSelector(state => state.trainer.data!.id)
  const selectedCell = useSelector(state => state.trainer.selectedCell)

  const handleSelectedCellChange = useCallback((cell: CellPosition) => {
    dispatch(changeSelectedCell(cell))
  }, [dispatch])

  const handleSelectedCellValueChange = useCallback((value: number | null) => {
    dispatch(changeSelectedCellValue(value))
    if (selectedCell && value) {
      requestTrainerPuzzleCheck(trainerPuzzleId, {
        value,
        position: selectedCell,
      })
    }
  }, [dispatch, trainerPuzzleId, selectedCell])

  const handleViewSolutions = useCallback(() => {
    dispatch(showSolutions())
    requestTrainerPuzzleCheck(trainerPuzzleId)
  }, [dispatch, trainerPuzzleId])

  return {
    onSelectedCellChange: handleSelectedCellChange,
    onSelectedCellValueChange: handleSelectedCellValueChange,
    onViewSolutions: handleViewSolutions,
  }
}

export const useTrainerKeyboardHandler: () => void = () => {
  const callbacks = useTrainerControls()
  const constraints = useSelector(state => state.trainer.data!.constraints)
  const selectedCell = useSelector(state => state.trainer.selectedCell)
  const selectedCells = selectedCell ? [selectedCell] : []
  useKeyboardHandler({ constraints, selectedCells, callbacks })
}
