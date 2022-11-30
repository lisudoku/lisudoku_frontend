import _ from 'lodash'
import classNames from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRotateLeft, faArrowRotateRight, faEraser, faPencil } from '@fortawesome/free-solid-svg-icons'
import Button from '../Button'
import IconButton from '../IconButton'
import { useControlCallbacks, useKeyboardHandler } from './hooks'
import { useCallback } from 'react'
import { useSelector } from 'src/hooks'
import SolveTimer from './SolveTimer'

const SudokuControls = ({ isSolvedLoading, onIsSolvedLoadingChange }: SudokuControlsProps) => {
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap w-64">
        {_.times(gridSize).map(value => (
          <div key={value} className={classNames('h-20 pb-1 px-0.5', { 'w-1/3': gridSize > 4, 'w-1/2': gridSize <= 4 })}>
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
      <div className="flex gap-1 justify-center">
        <Button color={notesActive ? 'green' : 'blue-gray'}
                disabled={!controlEnabled}
                onClick={onNotesActiveToggle}
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
                onClick={() => window.confirm('Are you sure you want to reset?') && onReset()}
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
