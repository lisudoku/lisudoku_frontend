import _ from 'lodash'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRotateLeft, faEraser, faPencil } from '@fortawesome/free-solid-svg-icons'
import Button from '../Button'
import CheckButton from './CheckButton'
import { CellPosition, Grid, SudokuConstraints } from 'src/types/sudoku'
import { useKeyboardHandler } from './hooks'
import classNames from 'classnames'

const SudokuControls = ({
  constraints, grid, selectedCell, notesActive, onSelectedCellValueChange,
  onSelectedCellNotesChange, onSelectedCellChange, onNotesActiveToggle,
}: SudokuControlsProps) => {
  const { gridSize, fixedNumbers } = constraints

  useKeyboardHandler(
    gridSize,
    fixedNumbers,
    selectedCell,
    notesActive,
    onSelectedCellChange,
    onNotesActiveToggle,
    onSelectedCellValueChange,
    onSelectedCellNotesChange
  )

  const solved = false

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap w-64">
        {_.times(gridSize).map(value => (
          <div key={value} className={classNames('h-20 pb-1 px-0.5', { 'w-1/3': gridSize > 4, 'w-1/2': gridSize <= 4 })}>
            <Button color="blue-gray" fullWidth className="h-full text-xl p-0">
              {value + 1}
            </Button>
          </div>
        ))}
      </div>
      <div className="flex gap-1 justify-center">
        <Button color={notesActive ? 'green' : 'blue-gray'} size="sm">
          <FontAwesomeIcon icon={faPencil} />
          <div className="inline-block w-7">
            {notesActive ? ' on' : ' off'}
          </div>
        </Button>
        <Button color="blue-gray" size="sm">
          <FontAwesomeIcon icon={faArrowRotateLeft} />
          {' Undo'}
        </Button>
        <Button color="blue-gray" size="sm">
          <FontAwesomeIcon icon={faEraser} />
          {' Reset'}
        </Button>
      </div>
      <div className="w-full flex flex-col gap-1">
        <CheckButton grid={grid!} constraints={constraints} />
        <Button color={solved ? 'green' : 'gray'}>
          New puzzle
        </Button>
      </div>
    </div>
  )
}

type SudokuControlsProps = {
  constraints: SudokuConstraints,
  grid: Grid,
  selectedCell: CellPosition | null,
  notesActive: boolean,
  onSelectedCellValueChange: Function,
  onSelectedCellNotesChange: Function,
  onSelectedCellChange: Function,
  onNotesActiveToggle: Function,
}

export default SudokuControls
