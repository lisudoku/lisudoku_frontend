import _ from 'lodash'
import { useSelector } from 'src/hooks'
import SudokuGrid from '../Puzzle/SudokuGrid'
import TrainerControls from './TrainerControls'
import TrainerMisc from './TrainerMisc'
import { useTrainerControls, useTrainerKeyboardHandler } from './hooks'
import { CellHighlight } from '../Puzzle/SudokuGridGraphics'

const TrainerPuzzleComponent = () => {
  const constraints = useSelector(state => state.trainer.data!.constraints)
  const grid = useSelector(state => state.trainer.grid)
  const selectedCell = useSelector(state => state.trainer.selectedCell)
  const selectedCells = selectedCell ? [selectedCell] : undefined
  const finished = useSelector(state => state.trainer.finished)
  const success = useSelector(state => state.trainer.success)
  const solutions = useSelector(state => state.trainer.data!.solutions)
  const showSolutions = finished && !success

  let cellHighlights: CellHighlight[] | undefined
  if (showSolutions) {
    cellHighlights = _
      .uniqWith(solutions, (a, b) => _.isEqual(a.position, b.position))
      .map(fixedNumber => ({
        position: fixedNumber.position,
        color: 'lightgreen',
        value: fixedNumber.value,
      }))
  }

  const { onSelectedCellChange } = useTrainerControls()
  useTrainerKeyboardHandler()

  return (
    <div className="w-fit flex flex-col md:flex-row mx-auto">
      <div className="order-3 md:order-1 w-full md:w-fit md:pr-5">
        <TrainerMisc />
      </div>
      <div className="order-1 md:order-2 w-full md:w-fit">
        <SudokuGrid
          constraints={constraints}
          grid={grid}
          selectedCells={selectedCells}
          onCellClick={onSelectedCellChange}
          highlightedCells={cellHighlights}
        />
      </div>
      <div className="order-2 md:order-3 w-full md:w-fit md:pl-5">
        <TrainerControls />
      </div>
    </div>
  )
}

export default TrainerPuzzleComponent
