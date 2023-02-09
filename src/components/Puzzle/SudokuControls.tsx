import _ from 'lodash'
import classNames from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRotateLeft, faArrowRotateRight, faEraser, faPencil } from '@fortawesome/free-solid-svg-icons'
import Button from '../Button'
import IconButton from '../IconButton'
import { useControlCallbacks, useKeyboardHandler } from './hooks'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'src/hooks'
import SolveTimer from './SolveTimer'
import { changePaused } from 'src/reducers/puzzle'

const SudokuControls = ({ isSolvedLoading, onIsSolvedLoadingChange }: SudokuControlsProps) => {
  const dispatch = useDispatch()
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

  const buttonsPerRow = gridSize > 4 ? 3 : 2

  return (
    <div className="flex flex-col gap-2 md:gap-4">
      <div className="flex flex-wrap w-full md:w-64 mt-2 md:mt-0">
        {_.times(gridSize).map(value => (
          <div key={value}
               className={classNames('h-12 md:h-20 grow md:pb-1 px-0.5 first:pl-0 last:pr-0', {
                 'md:w-1/3': buttonsPerRow === 3,
                 'md:w-1/2': buttonsPerRow === 2,
                 'md:pl-0': value % buttonsPerRow === 0,
                 'md:pr-0': value % buttonsPerRow === buttonsPerRow - 1,
               })}
          >
            <Button fullWidth
                    className="h-full text-xl p-0"
                    disabled={!controlEnabled}
                    onClick={() => handleDigitClick(value + 1)}
            >
              {value + 1}
            </Button>
          </div>
        ))}
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
      <div className="w-full flex flex-col gap-2">
        <SolveTimer isSolvedLoading={isSolvedLoading}
                    onIsSolvedLoadingChange={onIsSolvedLoadingChange} />
        <Button color={solved ? 'green' : 'gray'} onClick={onNewPuzzle}>
          New puzzle
        </Button>
      </div>
    </div>
  )
}

type SudokuControlsProps = {
  isSolvedLoading: boolean,
  onIsSolvedLoadingChange: Function,
}

export default SudokuControls
