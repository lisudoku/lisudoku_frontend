import { useEffect, useLayoutEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'src/hooks'
import { parseISO, differenceInMinutes, differenceInSeconds } from 'date-fns'
import { updateDifficulty } from 'src/reducers/userData'
import { fetchRandomPuzzle } from 'src/utils/apiService'
import Puzzle from 'src/components/Puzzle'
import { SudokuDifficulty, SudokuVariant } from 'src/types/sudoku'
import { receivedPuzzle, requestedPuzzle } from '../../reducers/puzzle'
import { AxiosError } from 'axios'
import { SudokuDifficultyDisplay, SudokuVariantDisplay } from 'src/utils/constants'

const PlayPage = () => {
  const { variant, difficulty } = useParams()
  useLayoutEffect(() => {
    const variantDisplay = SudokuVariantDisplay[variant as SudokuVariant]
    const difficultyDisplay = SudokuDifficultyDisplay[difficulty as SudokuDifficulty]
    document.title = `lisudoku - ${variantDisplay} - ${difficultyDisplay}`
  }, [variant, difficulty])

  const dispatch = useDispatch()
  const [ errorCode, setErrorCode ] = useState<number>()
  const [ pageLoading, setPageLoading ] = useState(true)
  const [ puzzleLoading, setPuzzleLoading ] = useState(false)

  const lastUpdate = useSelector(state => state.puzzle.lastUpdate)
  const solved = useSelector(state => state.puzzle.solved)
  const puzzleData = useSelector(state => state.puzzle.data)
  const previousVariant = puzzleData?.variant
  const previousDifficulty = puzzleData?.difficulty

  useEffect(() => {
    if (puzzleLoading) {
      return
    }
    if ((variant !== previousVariant && previousVariant !== undefined) ||
        (difficulty !== previousDifficulty && previousVariant !== undefined) ||
        lastUpdate === null ||
        differenceInMinutes(new Date(), parseISO(lastUpdate)) >= 10 ||
        (solved && differenceInSeconds(new Date(), parseISO(lastUpdate)) >= 1)
    ) {
      setPuzzleLoading(true)
      dispatch(requestedPuzzle())
      fetchRandomPuzzle(variant! as SudokuVariant, difficulty! as SudokuDifficulty).then((data) => {
        dispatch(receivedPuzzle(data))
        dispatch(updateDifficulty(data.difficulty))
      }).catch((e: AxiosError) => {
        setErrorCode(e.response!.status)
      }).finally(() => {
        setPuzzleLoading(false)
      })
    }
    setPageLoading(false)
  }, [dispatch, variant, previousVariant, difficulty, previousDifficulty, lastUpdate, puzzleLoading, solved])

  return (
    <>
      {errorCode === 404 ? (
        'Empty category'
      ) : errorCode ? (
        'Error'
      ) : (pageLoading || puzzleLoading || !puzzleData) ? (
        'Loading...'
      ) : (
        <Puzzle />
      )}
    </>
  )
}

export default PlayPage
