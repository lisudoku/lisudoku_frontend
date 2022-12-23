import { useState } from 'react'
import SudokuGrid from './SudokuGrid'
import SudokuControls from './SudokuControls'
import SudokuMisc from './SudokuMisc'
import { useSelector } from 'src/hooks'
import { useControlCallbacks, useTvPlayerWebsocket } from './hooks'
import { computeCellSize } from 'src/utils/misc'

// A puzzle that you are actively solving
const PuzzleComponent = () => {
  const [ isSolvedLoading, setIsSolvedLoading ] = useState(false)

  const constraints = useSelector(state => state.puzzle.data!.constraints)
  const grid = useSelector(state => state.puzzle.grid)
  const notes = useSelector(state => state.puzzle.notes)
  const selectedCell = useSelector(state => state.puzzle.controls.selectedCell)

  const { onSelectedCellChange } = useControlCallbacks(isSolvedLoading)

  // Calculate the available screen width and subtract parent padding
  const width = (document.documentElement.clientWidth || window.innerWidth) - 40

  const cellSize = computeCellSize(constraints.gridSize, width)

  useTvPlayerWebsocket()

  return (
    <div className="w-fit flex flex-col md:flex-row mx-auto">
      <div className="w-full md:w-fit">
        <SudokuGrid constraints={constraints}
                    grid={grid!}
                    notes={notes!}
                    selectedCell={selectedCell}
                    checkErrors
                    loading={isSolvedLoading}
                    onCellClick={onSelectedCellChange}
                    cellSize={cellSize}
        />
      </div>
      <div className="w-full md:w-fit md:pl-5">
        <SudokuControls isSolvedLoading={isSolvedLoading}
                        onIsSolvedLoadingChange={setIsSolvedLoading} />
      </div>
      <div className="w-full md:w-fit md:pl-5">
        <SudokuMisc />
      </div>
    </div>
  )
}

export default PuzzleComponent
