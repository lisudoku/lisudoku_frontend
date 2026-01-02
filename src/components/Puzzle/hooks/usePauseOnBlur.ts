import { useEffect } from 'react'
import { useDispatch, useSelector } from 'src/hooks'
import { changePaused } from 'src/reducers/puzzle'

export const usePauseOnBlur = (isSolvedLoading: boolean) => {
  const dispatch = useDispatch()
  const solved = useSelector(state => state.puzzle.solved)

  useEffect(() => {
    const handleBlur = () => {
      if (!solved && !isSolvedLoading) {
        dispatch(changePaused(true))
      }
    }
    window.onblur = handleBlur
  }, [dispatch, solved, isSolvedLoading])
}
