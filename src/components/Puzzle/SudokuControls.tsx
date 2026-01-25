import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRotateLeft, faArrowRotateRight, faDeleteLeft, faEraser } from '@fortawesome/free-solid-svg-icons'
import Button from '../../design_system/Button'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'src/hooks'
import { SolveTimer } from './SolveTimer'
import { changePaused, InputMode } from 'src/reducers/puzzle'
import HintButton from './HintButton'
import SudokuDigitInput from './SudokuDigitInput'
import SolveStatsPanel from './SolveStatsPanel'
import VoicePanel from '../voice/VoicePanel'
import { confirm } from 'src/design_system/ConfirmationDialog'
import { useControlCallbacks } from './hooks/useControlCallbacks'
import { useKeyboardHandler } from './hooks/useKeyboardHandler'

interface SudokuControlsProps {
  isSolvedLoading: boolean
}

export const SudokuControls = ({ isSolvedLoading }: SudokuControlsProps) => {
  const dispatch = useDispatch()
  const isExternal = useSelector(state => state.puzzle.data?.isExternal)
  const constraints = useSelector(state => state.puzzle.data?.constraints)
  const solved = useSelector(state => state.puzzle.solved)
  const showSplitInputModes = useSelector(state => state.userData.settings?.showSplitInputModes ?? false)
  const gridSize = constraints?.gridSize

  const {
    enabled: controlEnabled, inputMode, undoActive, redoActive,
    onSelectedCellValueChange, onSelectedCellDigitInput,
    onNumbersActive, onCornerMarksActive, onCenterMarksActive,
    onNewPuzzle, onReset, onUndo, onRedo,
  } = useControlCallbacks(isSolvedLoading)

  useKeyboardHandler(isSolvedLoading)

  const handleReset = useCallback(async () => {
    setTimeout(() => dispatch(changePaused(true)), 1)
    if (await confirm('Are you sure you want to reset?')) {
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
    <div className="flex flex-col gap-2 md:gap-4 mt-3 md:mt-0">
      <div className="relative flex flex-col gap-2 md:gap-4">
        <SolveStatsPanel />
        <VoicePanel />
        <div className="w-full md:w-64 mb-3 md:my-0">
          <SudokuDigitInput
            gridSize={gridSize}
            disabled={!controlEnabled}
            onClick={onSelectedCellDigitInput}
          />
        </div>
        {showSplitInputModes && (
          // TODO: de-duplicate input mode buttons between the 2 setting values
          <div className="flex gap-1 justify-between md:justify-center h-10">
            <Button
              color={inputMode === InputMode.Numbers ? 'green' : 'blue-gray'}
              size="sm"
              disabled={!controlEnabled}
              onClick={onNumbersActive}
              className="grow shrink basis-0 py-0 text-xl"
              title="Digits"
            >
              <div className="size-8 mx-auto border-2 border-primary">
                <div className="text-2xl/[inherit]">7</div>
              </div>
            </Button>
            <Button
              color={inputMode === InputMode.CornerMarks ? 'green' : 'blue-gray'}
              size="sm"
              disabled={!controlEnabled}
              onClick={onCornerMarksActive}
              className="grow shrink basis-0 py-0 text-xl"
              title="Corner pencilmarks"
            >
              <div className="size-8 mx-auto border-2 border-primary">
                <div className="relative h-full text-xs">
                  <div className="absolute top-0 left-[2px]">1</div>
                  <div className="absolute top-0 right-[2px]">2</div>
                  <div className="absolute bottom-0 left-[2px]">3</div>
                </div>
              </div>
            </Button>
            <Button
              color={inputMode === InputMode.CenterMarks ? 'green' : 'blue-gray'}
              size="sm"
              disabled={!controlEnabled}
              onClick={onCenterMarksActive}
              className="grow shrink basis-0 py-0 text-xl"
              title="Center pencilmarks"
            >
              <div className="size-8 mx-auto border-2 border-primary">
                <div className="text-base/[inherit]">123</div>
              </div>
            </Button>
          </div>
        )}
        <div className="flex gap-1 justify-between md:justify-center">
          {!showSplitInputModes && (
            <Button
              color="blue-gray"
              size="sm"
              disabled={!controlEnabled}
              onClick={() => {
                ({
                  [InputMode.Numbers]: onCornerMarksActive,
                  [InputMode.CornerMarks]: onCenterMarksActive,
                  [InputMode.CenterMarks]: onNumbersActive,
                })[inputMode]()
              }}
              className="grow shrink basis-0 py-1 text-xl"
              title="Input mode"
            >
              <div className="size-8 mx-auto border-2 border-primary">
                {inputMode === InputMode.Numbers ? (
                  <div className="text-2xl/[inherit]">7</div>
                ) : inputMode === InputMode.CornerMarks ? (
                  <div className="relative h-full text-xs">
                    <div className="absolute top-0 left-[2px]">1</div>
                    <div className="absolute top-0 right-[2px]">2</div>
                    <div className="absolute bottom-0 left-[2px]">3</div>
                  </div>
                ) : (
                  <div className="text-base/[inherit]">123</div>
                )}
              </div>
            </Button>
          )}
          <Button
            color="blue-gray"
            size="sm"
            disabled={!controlEnabled}
            onClick={handleDelete}
            className="grow shrink basis-0"
            title="Delete"
          >
            <FontAwesomeIcon icon={faDeleteLeft} />
          </Button>
          <Button
            color="blue-gray"
            size="sm"
            disabled={!controlEnabled || !undoActive}
            onClick={onUndo}
            className="grow shrink basis-0"
            title="Undo"
          >
            <FontAwesomeIcon icon={faArrowRotateLeft} />
          </Button>
          <Button
            color="blue-gray"
            size="sm"
            disabled={!controlEnabled || !redoActive}
            onClick={onRedo}
            className="grow shrink basis-0"
            title="Redo"
          >
            <FontAwesomeIcon icon={faArrowRotateRight} />
          </Button>
          {/* TODO: Removed full reset for now, revisit later */}
          {/* <Button
            color="blue-gray"
            size="sm"
            disabled={!controlEnabled}
            onClick={handleReset}
            className="grow shrink basis-0 hidden md:block"
            title="Reset"
          >
            <FontAwesomeIcon icon={faEraser} />
          </Button> */}
        </div>
      </div>
      <div className="w-full flex flex-col gap-2">
        <div className="hidden md:flex w-full rounded border border-primary px-3 py-1 justify-center select-none">
          <SolveTimer />
        </div>
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
