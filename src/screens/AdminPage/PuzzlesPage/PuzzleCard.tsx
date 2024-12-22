import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'src/hooks'
import SudokuGrid from 'src/components/Puzzle/SudokuGrid'
import { deletePuzzle } from 'src/reducers/admin'
import { ExtendedPuzzle } from 'src/types'
import { apiDeletePuzzle } from 'src/utils/apiService'
import { getPuzzleRelativeUrl } from 'src/utils/misc'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons'
import PuzzleCardIcons from './PuzzleCardIcons'
import { confirm } from 'src/shared/ConfirmationDialog'

const PuzzleCard = ({ puzzle }: { puzzle: ExtendedPuzzle }) => {
  const dispatch = useDispatch()
  const userToken = useSelector(state => state.userData.token)
  const solvedPuzzleIds = useSelector(state => state.userData.solvedPuzzles.map(puzzle => puzzle.id))

  const gridSize = puzzle.constraints.gridSize
  const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null))
  const cellMarks = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null).map(() => ({})))
  // 4 => ~40; 6 => ~35; 9 => ~30
  const cellSize = 90 / Math.sqrt(gridSize)

  const id = puzzle.id!
  const handleDelete = useCallback(async () => {
    if (await confirm(`Are you sure you want to delete puzzle ${id} ?`)) {
      dispatch(deletePuzzle(id))
      apiDeletePuzzle(id, userToken!).catch(() => alert('Error'))
    }
  }, [dispatch, id, userToken])

  return (
    <div className="flex flex-col items-center text-primary">
      <SudokuGrid
        constraints={puzzle.constraints}
        grid={grid}
        cellMarks={cellMarks}
        cellSize={cellSize}
      />
      <div className="flex gap-3 w-fit text-sm">
        {puzzle.publicId!}
      </div>
      <div className="flex gap-3 w-fit text-sm">
        <div>
          <PuzzleCardIcons constraints={puzzle.constraints} />
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
          {puzzle.solved && (
            <FontAwesomeIcon icon={faCircleCheck} size="sm" color="lightgreen" title="Solved by someone" />
          )}
        </div>
        <div>
          {solvedPuzzleIds.includes(puzzle.publicId!) && (
            <FontAwesomeIcon icon={faCircleCheck} size="sm" color="white" title="Solved by me" />
          )}
        </div>
      </div>
    </div>
  )
}

export default PuzzleCard
