import { Link } from 'react-router-dom'
import SudokuGrid from 'src/components/Puzzle/SudokuGrid'
import { Puzzle } from 'src/types/sudoku'
import { getPuzzleRelativeUrl } from 'src/utils/misc'

const PuzzleCard = ({ puzzle }: { puzzle: Puzzle }) => {
  const gridSize = puzzle.constraints.gridSize
  const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null))
  const notes = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null).map(() => []))
  // 4 => ~40; 6 => ~35; 9 => ~30
  const cellSize = 90 / Math.sqrt(gridSize)

  return (
    <div className="flex flex-col items-center">
      <SudokuGrid constraints={puzzle.constraints}
                  grid={grid}
                  notes={notes}
                  selectedCell={null}
                  checkErrors={false}
                  loading={false}
                  onCellClick={null}
                  cellSize={cellSize} />
      <Link to={getPuzzleRelativeUrl(puzzle.publicId!)} target="_blank" className="w-fit text-sm">
        Play
      </Link>
    </div>
  )
}

export default PuzzleCard
