import { useState } from 'react'
import useInterval from 'react-useinterval'
import classNames from 'classnames'
import PuzzleCardIcons from '../AdminPage/PuzzlesPage/PuzzleCardIcons'
import SudokuGrid from 'src/components/Puzzle/SudokuGrid'
import { SudokuDifficultyDisplay, SudokuVariantDisplay } from 'src/utils/constants'
import { getDurationShort, useCellSize } from 'src/utils/misc'
import { differenceInSeconds, parseISO } from 'date-fns'
import { TvPuzzle } from 'src/reducers/tv'

const TvPuzzleCardDescription = ({ puzzle }: { puzzle: TvPuzzle }) => {
  const [ now, setNow ] = useState<Date>(new Date())
  // Update timer every 5s
  useInterval(() => {
    setNow(new Date())
  }, 5000)

  return (
    <div className="flex flex-col items-center mt-1 w-fit text-sm">
      <div className="flex gap-x-2 text-primary">
        <div>{SudokuVariantDisplay[puzzle.variant]} - {SudokuDifficultyDisplay[puzzle.difficulty]}</div>
        <div>
          <PuzzleCardIcons constraints={puzzle.constraints} />
        </div>
      </div>
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
        <div className="text-tertiary">
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

  // 24 = card padding
  const cellSize = useCellSize(gridSize, 0.62, 24)

  return (
    <div className="flex flex-col items-center w-fit p-3 pb-1 bg-secondary rounded border border-secondary">
      <SudokuGrid
        constraints={puzzle.constraints}
        grid={puzzle.grid}
        notes={puzzle.notes}
        selectedCells={puzzle.selectedCells}
        cellSize={cellSize}
      />
      <TvPuzzleCardDescription puzzle={puzzle} />
    </div>
  )
}

export default TvPuzzleCard
