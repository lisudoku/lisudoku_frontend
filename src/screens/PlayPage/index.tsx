import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'src/hooks'
import { parseISO, differenceInMinutes, differenceInSeconds } from 'date-fns'
import { updateDifficulty } from 'src/reducers/userData'
import { fetchRandomPuzzle } from 'src/utils/apiService'
import Puzzle from 'src/components/Puzzle'
import { SudokuDifficulty, SudokuVariant } from 'src/types/sudoku'
import { receivedPuzzle, requestedPuzzle } from '../../reducers/puzzle'
import { AxiosError } from 'axios'

const PlayPage = () => {
  const { variant, difficulty } = useParams()
  const dispatch = useDispatch()
  const [ errorCode, setErrorCode ] = useState<number>()
  const [ loading, setLoading ] = useState(false)

  const lastUpdate = useSelector(state => state.puzzle.lastUpdate)
  const solved = useSelector(state => state.puzzle.solved)
  const puzzleData = useSelector(state => state.puzzle.data)
  const previousVariant = puzzleData?.variant
  const previousDifficulty = puzzleData?.difficulty

  useEffect(() => {
    if (variant !== previousVariant ||
        difficulty !== previousDifficulty ||
        lastUpdate === null ||
        differenceInMinutes(new Date(), parseISO(lastUpdate)) >= 10 ||
        (solved && differenceInSeconds(new Date(), parseISO(lastUpdate)) >= 1)
    ) {
      dispatch(requestedPuzzle())
      setLoading(true)
      fetchRandomPuzzle(variant! as SudokuVariant, difficulty! as SudokuDifficulty).then((data) => {
        dispatch(receivedPuzzle(data))
        dispatch(updateDifficulty(data.difficulty))
      }).catch((e: AxiosError) => {
        setErrorCode(e.response!.status)
      }).finally(() => {
        setLoading(false)
      })
    }
  }, [dispatch, variant, previousVariant, difficulty, previousDifficulty, lastUpdate, solved])

  return (
    <>
      {errorCode === 404 ? (
        'Empty category'
      ) : errorCode ? (
        'Error'
      ) : (loading || !puzzleData) ? (
        'Loading...'
      ) : (
        <Puzzle />
      )}
    </>
  )
}

export default PlayPage
