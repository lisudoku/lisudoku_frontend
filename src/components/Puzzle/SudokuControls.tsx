import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRotateLeft, faArrowRotateRight, faEraser, faPencil } from '@fortawesome/free-solid-svg-icons'
import Button from '../Button'
import IconButton from '../IconButton'
import { useControlCallbacks, useKeyboardHandler } from './hooks'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'src/hooks'
import SolveTimer from './SolveTimer'
import { changePaused } from 'src/reducers/puzzle'
import HintButton from './HintButton'
import SudokuDigitInput from './SudokuDigitInput'
import SolveStatsPanel from './SolveStatsPanel'

const SudokuControls = ({ isSolvedLoading, onIsSolvedLoadingChange }: SudokuControlsProps) => {
  const dispatch = useDispatch()
  const isExternal = useSelector(state => state.puzzle.data!.isExternal)
  const constraints = useSelector(state => state.puzzle.data!.constraints)
  const solved = useSelector(state => state.puzzle.solved)
  const gridSize = constraints.gridSize

  const {
    enabled: controlEnabled, notesActive, undoActive, redoActive,
    onSelectedCellValueChange, onSelectedCellNotesChange,
    onNotesActiveToggle, onNewPuzzle, onReset, onUndo, onRedo,
  } = useControlCallbacks(isSolvedLoading)

  useKeyboardHandler(isSolvedLoading)

  const handleDigitClick = useCallback((value: number) => {
    if (notesActive) {
      onSelectedCellNotesChange(value)
    } else {
      onSelectedCellValueChange(value)
    }
  }, [notesActive, onSelectedCellValueChange, onSelectedCellNotesChange])

  const handleReset = useCallback(() => {
    if (window.confirm('Are you sure you want to reset?')) {
      onReset()
    }
    setTimeout(() => dispatch(changePaused(false)), 1)
  }, [dispatch, onReset])

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
          <Button color={notesActive ? 'green' : 'blue-gray'}
                  disabled={!controlEnabled}
                  onClick={onNotesActiveToggle}
                  className="grow"
          >
            <FontAwesomeIcon icon={faPencil} />
            <div className="inline-block w-7">
              {notesActive ? ' on' : ' off'}
            </div>
          </Button>
          <IconButton color="blue-gray"
                      size="md"
                      disabled={!controlEnabled || !undoActive}
                      onClick={onUndo}
          >
            <FontAwesomeIcon icon={faArrowRotateLeft} />
          </IconButton>
          <IconButton color="blue-gray"
                      size="md"
                      disabled={!controlEnabled || !redoActive}
                      onClick={onRedo}
          >
            <FontAwesomeIcon icon={faArrowRotateRight} />
          </IconButton>
          <Button disabled={!controlEnabled}
                  onClick={handleReset}
          >
            <FontAwesomeIcon icon={faEraser} />
            {' Reset'}
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
