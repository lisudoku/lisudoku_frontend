import _ from 'lodash'
import classNames from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRotateLeft, faEraser, faPencil } from '@fortawesome/free-solid-svg-icons'
import { Typography } from '@material-tailwind/react'
import Button from '../Button'
import { CellPosition, SudokuConstraints } from 'src/types/sudoku'
import { useKeyboardHandler } from './hooks'
import { formatTimer } from 'src/utils/sudoku'

const SudokuControls = ({
  constraints, selectedCell, notesActive, solveTimer, solved, isSolvedLoading,
  onSelectedCellValueChange, onSelectedCellNotesChange, onSelectedCellChange, onNotesActiveToggle,
}: SudokuControlsProps) => {
  const { gridSize, fixedNumbers } = constraints

  const controlEnabled = !solved && !isSolvedLoading
  useKeyboardHandler(
    controlEnabled,
    gridSize,
    fixedNumbers,
    selectedCell,
    notesActive,
    onSelectedCellChange,
    onNotesActiveToggle,
    onSelectedCellValueChange,
    onSelectedCellNotesChange
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap w-64">
        {_.times(gridSize).map(value => (
          <div key={value} className={classNames('h-20 pb-1 px-0.5', { 'w-1/3': gridSize > 4, 'w-1/2': gridSize <= 4 })}>
            <Button color="blue-gray" fullWidth className="h-full text-xl p-0" disabled={!controlEnabled}>
              {value + 1}
            </Button>
          </div>
        ))}
      </div>
      <div className="flex gap-1 justify-center">
        <Button color={notesActive ? 'green' : 'blue-gray'} size="sm" disabled={!controlEnabled}>
          <FontAwesomeIcon icon={faPencil} />
          <div className="inline-block w-7">
            {notesActive ? ' on' : ' off'}
          </div>
        </Button>
        <Button color="blue-gray" size="sm" disabled={!controlEnabled}>
          <FontAwesomeIcon icon={faArrowRotateLeft} />
          {' Undo'}
        </Button>
        <Button color="blue-gray" size="sm" disabled={!controlEnabled}>
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
        <Button color={solved ? 'green' : 'gray'}>
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
  onSelectedCellValueChange: Function,
  onSelectedCellNotesChange: Function,
  onSelectedCellChange: Function,
  onNotesActiveToggle: Function,
}

export default SudokuControls
