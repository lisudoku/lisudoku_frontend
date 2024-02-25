import { useCallback, useState } from 'react'
import SudokuGrid from './SudokuGrid'
import SudokuControls from './SudokuControls'
import SudokuMisc from './SudokuMisc'
import { useDispatch, useSelector } from 'src/hooks'
import { useCellHighlights, useControlCallbacks, useTvPlayerWebsocket } from './hooks'
import { changePaused } from 'src/reducers/puzzle'

// A puzzle that you are actively solving
const PuzzleComponent = () => {
  const dispatch = useDispatch()
  const [ isSolvedLoading, setIsSolvedLoading ] = useState(false)

  const constraints = useSelector(state => state.puzzle.data!.constraints)
  const grid = useSelector(state => state.puzzle.grid)
  const cellMarks = useSelector(state => state.puzzle.cellMarks)
  const selectedCells = useSelector(state => state.puzzle.controls.selectedCells)
  const paused = useSelector(state => state.puzzle.controls.paused)
  const checkErrors = useSelector(state => state.userData.settings?.checkErrors ?? true)

  const { onSelectedCellChange } = useControlCallbacks(isSolvedLoading)

  useTvPlayerWebsocket()

  const cellHighlights = useCellHighlights()

  const handlePauseClick = useCallback(() => {
    dispatch(changePaused(false))
  }, [dispatch])

  return (
    <div className="w-fit flex flex-col md:flex-row mx-auto">
      <div className="order-3 md:order-1 w-full md:w-fit md:pr-5">
        <SudokuMisc />
      </div>
      <div className="order-1 md:order-2 w-full md:w-fit">
        <SudokuGrid
          constraints={constraints}
          grid={grid!}
          cellMarks={cellMarks!}
          selectedCells={selectedCells}
          checkErrors={checkErrors}
          loading={isSolvedLoading}
          onCellClick={onSelectedCellChange}
          paused={paused}
          onUnpause={handlePauseClick}
          highlightedCells={cellHighlights}
        />
      </div>
      <div className="order-2 md:order-3 w-full md:w-fit md:pl-5">
        <SudokuControls isSolvedLoading={isSolvedLoading}
                        onIsSolvedLoadingChange={setIsSolvedLoading} />
      </div>
    </div>
  )
}

export default PuzzleComponent
