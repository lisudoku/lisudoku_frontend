import { useCallback, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Radio from 'src/components/Radio'
import SudokuGrid from 'src/components/Puzzle/SudokuGrid'
import { useDispatch, useSelector } from 'src/hooks'
import { changeSelectedCell, initPuzzle } from 'src/reducers/admin'
import { CellPosition, SudokuDifficulty, SudokuVariant } from 'src/types/sudoku'
import Button from 'src/components/Button'
import Textarea from 'src/components/Textarea'
import Checkbox from 'src/components/Checkbox'
import VariantSelect from 'src/components/Puzzle/VariantSelect'
import DifficultySelect from 'src/components/Puzzle/DifficultySelect'


const PuzzleBuilder = () => {
  const { gridSize } = useParams()
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(initPuzzle(gridSize))
  }, [dispatch, gridSize])

  const constraints = useSelector(state => state.admin.puzzle?.constraints)
  const grid = useSelector(state => state.admin.puzzle?.grid)
  const notes = useSelector(state => state.admin.puzzle?.notes)
  const selectedCell = useSelector(state => state.admin.puzzle?.selectedCell ?? null)

  const handleSelectedCellChange = useCallback((cell: CellPosition) => {
    if (selectedCell === null || cell.row !== selectedCell.row || cell.col !== selectedCell.col) {
      dispatch(changeSelectedCell(cell))
    }
  }, [dispatch, selectedCell])

  if (!constraints) {
    return null
  }

  return (
    <div className="flex gap-10">
      <SudokuGrid constraints={constraints!}
                  grid={grid!}
                  notes={notes!}
                  selectedCell={selectedCell!}
                  loading={false}
                  onSelectedCellChange={handleSelectedCellChange}
      />
      <div className="flex flex-col gap-2">
        <div className="flex flex-col">
          <Radio name="build-item" id="fixed-number" label="Given Digit" color="cyan" defaultChecked />
          <Radio name="build-item" id="thermometer" label="Thermometer" color="cyan" />
          <Radio name="build-item" id="regions" label="Regions" color="cyan" disabled labelProps={{ className: 'line-through' }} />
          <Button color="blue-gray"
                  size="sm"
                  onClick={() => {}}
          >
            Add
          </Button>
        </div>
        <div className="flex flex-col">
          <Checkbox id="primary-diagonal" label="Primary Diagonal" disabled labelProps={{ className: 'line-through' }} />
          <Checkbox id="secondary-diagonal" label="Secondary Diagonal" disabled labelProps={{ className: 'line-through' }} />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Button color="blue-gray"
                size="sm"
                onClick={() => {}}
        >
          Solve
        </Button>
        <Textarea disabled value="Solution count: " />
        <DifficultySelect value={SudokuDifficulty.Easy9x9} onChange={() => {}} />
        <VariantSelect value={SudokuVariant.Classic} onChange={() => {}} label="Variant (autodetected)" />
        <Button color="blue-gray"
                size="sm"
                onClick={() => {}}
                disabled
        >
          Add puzzle
        </Button>
      </div>
    </div>
  )
}

export default PuzzleBuilder
