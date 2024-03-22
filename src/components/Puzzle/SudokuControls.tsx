import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRotateLeft, faArrowRotateRight, faDeleteLeft, faEraser, faPencil } from '@fortawesome/free-solid-svg-icons'
import Button from '../../shared/Button'
import { useControlCallbacks, useKeyboardHandler } from './hooks'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'src/hooks'
import SolveTimer from './SolveTimer'
import { InputMode, changePaused } from 'src/reducers/puzzle'
import HintButton from './HintButton'
import SudokuDigitInput from './SudokuDigitInput'
import SolveStatsPanel from './SolveStatsPanel'

const SudokuControls = ({ isSolvedLoading, onIsSolvedLoadingChange }: SudokuControlsProps) => {
  const dispatch = useDispatch()
  const isExternal = useSelector(state => state.puzzle.data?.isExternal)
  const constraints = useSelector(state => state.puzzle.data?.constraints)
  const solved = useSelector(state => state.puzzle.solved)
  const gridSize = constraints?.gridSize

  const {
    enabled: controlEnabled, inputMode, undoActive, redoActive,
    onSelectedCellValueChange, onSelectedCellCornerMarksChange, onSelectedCellCenterMarksChange,
    onNumbersActive, onCornerMarksActive, onCenterMarksActive,
    onNewPuzzle, onReset, onUndo, onRedo,
  } = useControlCallbacks(isSolvedLoading)

  useKeyboardHandler(isSolvedLoading)

  const handleDigitClick = useCallback((value: number) => {
    switch (inputMode) {
      case InputMode.Numbers:
        onSelectedCellValueChange(value)
        break
      case InputMode.CornerMarks:
        onSelectedCellCornerMarksChange(value)
        break
      case InputMode.CenterMarks:
        onSelectedCellCenterMarksChange(value)
        break
    }
  }, [inputMode, onSelectedCellValueChange, onSelectedCellCornerMarksChange])

  const handleReset = useCallback(() => {
    if (window.confirm('Are you sure you want to reset?')) {
      onReset()
    }
    setTimeout(() => dispatch(changePaused(false)), 1)
  }, [dispatch, onReset])

  const handleDelete = useCallback(() => {
    onSelectedCellValueChange(null)
  }, [onSelectedCellValueChange])

  if (gridSize === undefined) {
    return null
  }

  return (
    <div className="flex flex-col gap-2 md:gap-4">
      <div className="relative flex flex-col gap-2 md:gap-4">
        <SolveStatsPanel />
        <div className="w-full md:w-64 mt-2 md:mt-0">
          <SudokuDigitInput
            gridSize={gridSize}
            disabled={!controlEnabled}
            onClick={handleDigitClick}
          />
        </div>
        <div className="flex gap-1 justify-between md:justify-center">
          <Button color={inputMode === InputMode.Numbers ? 'green' : 'blue-gray'}
                  disabled={!controlEnabled}
                  onClick={onNumbersActive}
                  className="grow shrink basis-0 py-0 text-xl"
          >
            #
          </Button>
          <Button color={inputMode === InputMode.CornerMarks ? 'green' : 'blue-gray'}
                  disabled={!controlEnabled}
                  onClick={onCornerMarksActive}
                  className="grow shrink basis-0 py-1"
          >
            <div className="relative h-full">
              <div className="absolute top-0 left-1/3 md:left-1/4">1</div>
              <div className="absolute top-0 right-1/3 md:right-1/4">2</div>
              <div className="absolute bottom-0 left-1/3 md:left-1/4">3</div>
            </div>
          </Button>
          <Button color={inputMode === InputMode.CenterMarks ? 'green' : 'blue-gray'}
                  disabled={!controlEnabled}
                  onClick={onCenterMarksActive}
                  className="grow shrink basis-0 text-lg"
          >
            123
          </Button>
        </div>
        <div className="flex gap-1 justify-between md:justify-center">
          <Button color="blue-gray"
                  size="md"
                  disabled={!controlEnabled}
                  onClick={handleDelete}
                  className="grow shrink basis-0"
                  title="Delete"
          >
            <FontAwesomeIcon icon={faDeleteLeft} />
          </Button>
          <Button color="blue-gray"
                  size="md"
                  disabled={!controlEnabled || !undoActive}
                  onClick={onUndo}
                  className="grow shrink basis-0"
                  title="Undo"
          >
            <FontAwesomeIcon icon={faArrowRotateLeft} />
          </Button>
          <Button color="blue-gray"
                  size="md"
                  disabled={!controlEnabled || !redoActive}
                  onClick={onRedo}
                  className="grow shrink basis-0"
                  title="Redo"
          >
            <FontAwesomeIcon icon={faArrowRotateRight} />
          </Button>
          <Button color="blue-gray"
                  size="md"
                  disabled={!controlEnabled}
                  onClick={handleReset}
                  className="grow shrink basis-0"
                  title="Reset"
          >
            <FontAwesomeIcon icon={faEraser} />
          </Button>
        </div>
      </div>
      <div className="w-full flex flex-col gap-2">
        <SolveTimer isSolvedLoading={isSolvedLoading}
                    onIsSolvedLoadingChange={onIsSolvedLoadingChange} />
        {!isExternal && (
          <>
            <HintButton />
            <Button
              color={solved ? 'green' : 'gray'}
              variant={solved ? 'filled' : 'text'}
              onClick={onNewPuzzle}
            >
              New puzzle
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

type SudokuControlsProps = {
  isSolvedLoading: boolean
  onIsSolvedLoadingChange: Function
}

export default SudokuControls
