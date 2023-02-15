import { useCallback, useState } from 'react'
import SudokuGrid from './SudokuGrid'
import SudokuControls from './SudokuControls'
import SudokuMisc from './SudokuMisc'
import { useDispatch, useSelector } from 'src/hooks'
import { useControlCallbacks, useTvPlayerWebsocket } from './hooks'
import { computeCellSize } from 'src/utils/misc'
import { changePaused } from 'src/reducers/puzzle'

// A puzzle that you are actively solving
const PuzzleComponent = () => {
  const dispatch = useDispatch()
  const [ isSolvedLoading, setIsSolvedLoading ] = useState(false)

  const constraints = useSelector(state => state.puzzle.data!.constraints)
  const grid = useSelector(state => state.puzzle.grid)
  const notes = useSelector(state => state.puzzle.notes)
  const selectedCells = useSelector(state => state.puzzle.controls.selectedCells)
  const paused = useSelector(state => state.puzzle.controls.paused)

  const { onSelectedCellChange } = useControlCallbacks(isSolvedLoading)

  // Calculate the available screen width and subtract parent padding
  const width = (document.documentElement.clientWidth || window.innerWidth) - 40

  const cellSize = computeCellSize(constraints.gridSize, width)

  useTvPlayerWebsocket()

  const handlePauseClick = useCallback(() => {
    dispatch(changePaused(false))
  }, [dispatch])

  return (
    <div className="w-fit flex flex-col md:flex-row mx-auto">
      <div className="w-full md:w-fit">
        <SudokuGrid constraints={constraints}
                    grid={grid!}
                    notes={notes!}
                    selectedCells={selectedCells}
                    checkErrors
                    loading={isSolvedLoading}
                    onCellClick={onSelectedCellChange}
                    cellSize={cellSize}
                    paused={paused}
                    onUnpause={handlePauseClick}
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
