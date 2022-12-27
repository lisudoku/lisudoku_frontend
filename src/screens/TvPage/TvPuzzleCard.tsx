import SudokuGrid from 'src/components/Puzzle/SudokuGrid'
import { SudokuDifficultyDisplay, SudokuVariantDisplay } from 'src/utils/constants'
import { computeCellSize, getDurationShort } from 'src/utils/misc'
import useInterval from 'react-useinterval'
import { useState } from 'react'
import classNames from 'classnames'
import { differenceInSeconds, parseISO } from 'date-fns'
import { useWindowWidth } from '@react-hook/window-size'
import { TvPuzzle } from 'src/reducers/tv'

const TvPuzzleCardDescription = ({ puzzle }: { puzzle: TvPuzzle }) => {
  const [ now, setNow ] = useState<Date>(new Date())
  // Update timer every 5s
  useInterval(() => {
    setNow(new Date())
  }, 5000)

  return (
    <div className="flex flex-col items-center mt-1 w-fit text-sm">
      <div>{SudokuVariantDisplay[puzzle.variant]} - {SudokuDifficultyDisplay[puzzle.difficulty]}</div>
      {puzzle.solved ? (
        <div>
          Solved!
          <span className={classNames('ml-1 absolute', {
            'animate-expand': differenceInSeconds(now, parseISO(puzzle.updatedAt)) < 10,
          })}>
            🎉
          </span>
        </div>
      ) : (
        <div className="text-gray-500">
          Updated {getDurationShort(puzzle.updatedAt)} ago
        </div>
      )}
      {/* <Link to={getPuzzleRelativeUrl(puzzle.puzzleId)} target="_blank">
        Play
      </Link> */}
    </div>
  )
}

const TvPuzzleCard = ({ puzzle }: { puzzle: TvPuzzle }) => {
  const gridSize = puzzle.constraints.gridSize

  // Calculate the available screen width and subtract parent paddings
  const width = useWindowWidth()
  const availableWidth = width - 40 - 24

  const cellSize = computeCellSize(gridSize, availableWidth, 0.6)

  return (
    <div className="flex flex-col items-center w-fit p-3 pb-1 bg-gray-900 rounded border border-gray-800">
      <SudokuGrid constraints={puzzle.constraints}
                  grid={puzzle.grid}
                  notes={puzzle.notes}
                  selectedCell={puzzle.selectedCell}
                  checkErrors={false}
                  loading={false}
                  onCellClick={null}
                  cellSize={cellSize} />
      <TvPuzzleCardDescription puzzle={puzzle} />
    </div>
  )
}

export default TvPuzzleCard
