import useInterval from 'react-useinterval'
import { useDispatch, useSelector } from 'src/hooks'
import { updateTimer } from 'src/reducers/puzzle'

export const useTimerTick = (isSolvedLoading: boolean) => {
  const dispatch = useDispatch()
  const paused = useSelector(state => state.puzzle.controls.paused)
  const solved = useSelector(state => state.puzzle.solved)

  useInterval(() => {
    if (!paused && !solved && !isSolvedLoading) {
      dispatch(updateTimer())
    }
  }, 1000)
}
