import { useCallback, useEffect } from 'react'
import classNames from 'classnames'
import useInterval from 'react-useinterval'
import { useDispatch, useSelector } from 'src/hooks'
import { requestSolved, responseSolved, changePaused, updateTimer } from 'src/reducers/puzzle'
import { requestPuzzleCheck } from 'src/utils/apiService'
import { checkSolved } from 'src/utils/wasm'
import { formatTimer, gridIsFull } from 'src/utils/sudoku'
import { Typography } from '@material-tailwind/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCirclePause, faCirclePlay } from '@fortawesome/free-solid-svg-icons'
import _ from 'lodash'

const SolveTimer = ({ isSolvedLoading, onIsSolvedLoadingChange }: SolveTimerProps) => {
  const dispatch = useDispatch()

  const id = useSelector(state => state.puzzle.data!.publicId!)
  const constraints = useSelector(state => state.puzzle.data!.constraints)
  const grid = useSelector(state => state.puzzle.grid)
  const variant = useSelector(state => state.puzzle.data!.variant)
  const difficulty = useSelector(state => state.puzzle.data!.difficulty)
  const solveTimer = useSelector(state => state.puzzle.solveTimer)
  const solved = useSelector(state => state.puzzle.solved)
  const paused = useSelector(state => state.puzzle.controls.paused)
  const actions = useSelector(state => state.puzzle.controls.actions)

  useEffect(() => {
    if (!solved && grid && gridIsFull(grid)) {
      if (checkSolved(constraints, grid)) {
        dispatch(requestSolved())
        onIsSolvedLoadingChange(true)
        const processedActions = actions.map(action => _.omit(action, ['previousDigit', 'previousNotes']))
        requestPuzzleCheck(id, grid, processedActions).then(result => {
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
  }, [dispatch, id, variant, difficulty, constraints, grid, solved, onIsSolvedLoadingChange, actions])

  const handlePauseClick = useCallback(() => {
    dispatch(changePaused(!paused))
  }, [dispatch, paused])

  useEffect(() => {
    const handleBlur = () => {
      if (!solved && !isSolvedLoading) {
        dispatch(changePaused(true))
      }
    }
    window.onblur = handleBlur
  }, [dispatch, solved, isSolvedLoading])

  useInterval(() => {
    if (!paused && !solved && !isSolvedLoading) {
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
        {!solved && (
          <FontAwesomeIcon icon={paused ? faCirclePlay : faCirclePause}
                           onClick={handlePauseClick}
                           className={classNames('cursor-pointer ml-2 relative top-[0.5px]', {
                             'text-gray-400': !paused,
                           })} />
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
