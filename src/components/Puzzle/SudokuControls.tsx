import _ from 'lodash'
import classNames from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRotateLeft, faArrowRotateRight, faEraser, faPencil } from '@fortawesome/free-solid-svg-icons'
import { Typography } from '@material-tailwind/react'
import Button from '../Button'
import IconButton from '../IconButton'
import { CellPosition, SudokuConstraints } from 'src/types/sudoku'
import { useKeyboardHandler } from './hooks'
import { formatTimer } from 'src/utils/sudoku'
import { useCallback } from 'react'

const SudokuControls = ({
  constraints, selectedCell, notesActive, solveTimer, solved, isSolvedLoading,
  undoActive, redoActive,
  onSelectedCellValueChange, onSelectedCellNotesChange, onSelectedCellChange,
  onNotesActiveToggle, onNewPuzzle, onReset, onUndo, onRedo,
}: SudokuControlsProps) => {
  const { gridSize, fixedNumbers } = constraints

  const controlEnabled = !solved && !isSolvedLoading
  useKeyboardHandler(
    controlEnabled,
    gridSize,
    fixedNumbers,
    selectedCell,
    notesActive,
    undoActive,
    redoActive,
    onSelectedCellChange,
    onNotesActiveToggle,
    onSelectedCellValueChange,
    onSelectedCellNotesChange,
    onUndo,
    onRedo
  )

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
            <Button color="blue-gray"
                    fullWidth
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
                size="sm"
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
        <Button color="blue-gray"
                size="sm"
                disabled={!controlEnabled}
                onClick={() => window.confirm('Are you sure you want to reset?') && onReset()}
        >
          <FontAwesomeIcon icon={faEraser} />
          {' Reset'}
        </Button>
      </div>
      <div className="w-full flex flex-col gap-2">
        <div className={classNames(
          'w-full rounded border border-gray-400 px-3 py-1 flex justify-center select-none', {
            'border-yellow-600': isSolvedLoading,
            'border-green-600': solved && !isSolvedLoading,
          }
        )}>
          <Typography variant="h6">
            {solved && 'Solved in '}
            {formatTimer(solveTimer)}
            {solved && ' 🎉'}
          </Typography>
        </div>
        <Button color={solved ? 'green' : 'gray'} onClick={onNewPuzzle}>
          New puzzle
        </Button>
      </div>
    </div>
  )
}

type SudokuControlsProps = {
  constraints: SudokuConstraints,
  selectedCell: CellPosition | null,
  notesActive: boolean,
  solveTimer: number,
  solved: boolean,
  isSolvedLoading: boolean,
  undoActive: boolean,
  redoActive: boolean,
  onSelectedCellValueChange: Function,
  onSelectedCellNotesChange: Function,
  onSelectedCellChange: Function,
  onNotesActiveToggle: Function,
  onNewPuzzle: Function,
  onReset: Function,
  onUndo: Function,
  onRedo: Function,
}

export default SudokuControls
