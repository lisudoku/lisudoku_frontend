import { useEffect } from 'react'
import classNames from 'classnames'
import useInterval from 'react-useinterval'
import { useDispatch, useSelector } from 'src/hooks'
import { requestSolved, responseSolved, updateTimer } from 'src/reducers/puzzle'
import { requestPuzzleCheck } from 'src/utils/apiService'
import { checkSolved } from 'src/utils/wasm'
import { formatTimer, gridIsFull } from 'src/utils/sudoku'
import { Typography } from '@material-tailwind/react'

const SolveTimer = ({ isSolvedLoading, onIsSolvedLoadingChange }: SolveTimerProps) => {
  const dispatch = useDispatch()

  const id = useSelector(state => state.puzzle.data!.publicId!)
  const constraints = useSelector(state => state.puzzle.data!.constraints)
  const grid = useSelector(state => state.puzzle.grid)
  const variant = useSelector(state => state.puzzle.data!.variant)
  const difficulty = useSelector(state => state.puzzle.data!.difficulty)
  const solveTimer = useSelector(state => state.puzzle.solveTimer)
  const solved = useSelector(state => state.puzzle.solved)

  useEffect(() => {
    if (!solved && grid && gridIsFull(grid)) {
      if (checkSolved(constraints, grid)) {
        dispatch(requestSolved())
        onIsSolvedLoadingChange(true)
        requestPuzzleCheck(id, grid).then(result => {
          dispatch(responseSolved({
            id,
            variant,
            difficulty,
            solved: result.correct,
          }))
          onIsSolvedLoadingChange(false)
        })
      }
    }
  }, [dispatch, id, variant, difficulty, constraints, grid, solved, onIsSolvedLoadingChange])

  useInterval(() => {
    if (!solved && !isSolvedLoading) {
      dispatch(updateTimer())
    }
  }, 1000)

  return (
    <div className={classNames(
      'w-full rounded border border-gray-400 px-3 py-1 flex justify-center select-none', {
        'border-yellow-600': isSolvedLoading,
        'border-green-600': solved && !isSolvedLoading,
      }
    )}>
      <Typography variant="h6">
        {solved && 'Solved in '}
        {formatTimer(solveTimer)}
        {solved && (
          <span className="ml-1 absolute animate-expand">
            🎉
          </span>
        )}
      </Typography>
    </div>
  )
}

type SolveTimerProps = {
  isSolvedLoading: boolean,
  onIsSolvedLoadingChange: Function,
}

export default SolveTimer
