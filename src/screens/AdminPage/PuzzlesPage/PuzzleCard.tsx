import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'src/hooks'
import SudokuGrid from 'src/components/Puzzle/SudokuGrid'
import { deletePuzzle } from 'src/reducers/admin'
import { Puzzle } from 'src/types/sudoku'
import { apiDeletePuzzle } from 'src/utils/apiService'
import { getPuzzleRelativeUrl } from 'src/utils/misc'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faChessKnight } from '@fortawesome/free-solid-svg-icons'
import { faCircleXmark } from '@fortawesome/free-regular-svg-icons'

const PuzzleCard = ({ puzzle }: { puzzle: Puzzle }) => {
  const dispatch = useDispatch()
  const userToken = useSelector(state => state.userData.token)
  const solvedPuzzleIds = useSelector(state => state.userData.solvedPuzzles.map(puzzle => puzzle.id))

  const gridSize = puzzle.constraints.gridSize
  const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null))
  const notes = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null).map(() => []))
  // 4 => ~40; 6 => ~35; 9 => ~30
  const cellSize = 90 / Math.sqrt(gridSize)

  const id = puzzle.id!
  const handleDelete = useCallback(() => {
    if (window.confirm(`Are you sure you want to delete puzzle ${id} ?`)) {
      dispatch(deletePuzzle(id))
      apiDeletePuzzle(id, userToken!).catch(() => alert('Error'))
    }
  }, [dispatch, id, userToken])

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
      <div className="flex gap-3 w-fit text-sm text-gray-300">
        {puzzle.publicId!}
      </div>
      <div className="flex gap-3 w-fit text-sm">
        <div>
          {puzzle.constraints.antiKnight && (
            <FontAwesomeIcon icon={faChessKnight} size="sm" />
          )}
          {puzzle.constraints.kropkiNegative && (
            <FontAwesomeIcon icon={faCircleXmark} size="sm" />
          )}
        </div>
        <Link to={getPuzzleRelativeUrl(puzzle.publicId!)} target="_blank">
          Play
        </Link>
        <Link to={`/admin/puzzles/${id}/edit`}>
          Edit
        </Link>
        <button className="text-red-700" onClick={handleDelete}>
          Delete
        </button>
        <div>
          {solvedPuzzleIds.includes(puzzle.publicId!) && (
            <FontAwesomeIcon icon={faCircleCheck} size="sm" color="lightgreen" />
          )}
        </div>
      </div>
    </div>
  )
}

export default PuzzleCard
