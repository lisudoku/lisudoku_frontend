import { useCallback } from 'react'
import classNames from 'classnames'
import { useDispatch, useSelector } from 'src/hooks'
import { changePaused } from 'src/reducers/puzzle'
import { formatTimer } from 'src/utils/sudoku'
import Typography from 'src/design_system/Typography'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCirclePause, faCirclePlay } from '@fortawesome/free-solid-svg-icons'
import { SudokuDifficulty } from 'src/types/sudoku'

const getSolvedEmoji = (difficulty: SudokuDifficulty, solveTime: number) => {
  switch (difficulty) {
    case SudokuDifficulty.Easy4x4: return solveTime <= 30 ? '😱' : '🎉'
    case SudokuDifficulty.Easy6x6:
    case SudokuDifficulty.Hard6x6: return solveTime <= 90 ? '😱' : '🎉'
    case SudokuDifficulty.Easy9x9: return solveTime <= 10 * 60 ? '😱' : '🎉'
    case SudokuDifficulty.Medium9x9:
    case SudokuDifficulty.Hard9x9: return solveTime <= 15 * 60 ? '😱' : '🎉'
    default: return '🎉'
  }
}

export const SolveTimer = () => {
  const dispatch = useDispatch()

  const difficulty = useSelector(state => state.puzzle.data?.difficulty)
  const solveTimer = useSelector(state => state.puzzle.solveTimer)
  const solved = useSelector(state => state.puzzle.solved)
  const paused = useSelector(state => state.puzzle.controls.paused)
  // TODO: make proper fix so we don't have to coordinate default values in different places
  const showTimer = useSelector(state => state.userData.settings?.showTimer ?? true)

  const handlePauseClick = useCallback(() => {
    dispatch(changePaused(!paused))
  }, [dispatch, paused])

  if (!showTimer && !solved) {
    return null
  }

  return (
    <Typography
      variant="h6"
      className={classNames('cursor-pointer', {
        'pr-5': solved,
        'font-normal': !solved,
      })}
      onClick={handlePauseClick}
    >
      {solved && <span>Solved in </span>}
      <span>{formatTimer(solveTimer)}</span>
      {solved && (
        <span className="ml-1 absolute animate-expand">
          {getSolvedEmoji(difficulty!, solveTimer)}
        </span>
      )}
      {!solved && (
        <FontAwesomeIcon
          icon={paused ? faCirclePlay : faCirclePause}
          className={classNames('ml-2 relative top-[0.5px]', {
            'text-primary': !paused,
          })}
        />
      )}
    </Typography>
  )
}
