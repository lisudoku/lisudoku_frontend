import { useEffect, useLayoutEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'src/hooks'
import { parseISO, differenceInMinutes, differenceInSeconds } from 'date-fns'
import { AxiosError } from 'axios'
import { updateDifficulty } from 'src/reducers/userData'
import { fetchRandomPuzzle } from 'src/utils/apiService'
import Puzzle from 'src/components/Puzzle'
import EmptyCategory from './EmptyCategory'
import { SudokuDifficulty, SudokuVariant } from 'src/types/sudoku'
import { receivedPuzzle, requestedPuzzle } from '../../reducers/puzzle'
import { SudokuDifficultyDisplay, SudokuVariantDisplay } from 'src/utils/constants'

const PlayPage = () => {
  const { variant: variantParam, difficulty: difficultyParam } = useParams()
  const variant = variantParam as SudokuVariant
  const difficulty = difficultyParam as SudokuDifficulty
  useLayoutEffect(() => {
    const variantDisplay = SudokuVariantDisplay[variant]
    const difficultyDisplay = SudokuDifficultyDisplay[difficulty]
    document.title = `lisudoku - ${variantDisplay} - ${difficultyDisplay}`
  }, [variant, difficulty])

  const dispatch = useDispatch()
  const [ errorCode, setErrorCode ] = useState<number>()
  const [ pageLoading, setPageLoading ] = useState(true)
  const [ puzzleLoading, setPuzzleLoading ] = useState(false)

  const idBlacklist = useSelector(state => state.userData.solvedPuzzleIds)
  const lastUpdate = useSelector(state => state.puzzle.lastUpdate)
  const solved = useSelector(state => state.puzzle.solved)
  const puzzleData = useSelector(state => state.puzzle.data)
  const previousVariant = puzzleData?.variant
  const previousDifficulty = puzzleData?.difficulty

  useEffect(() => {
    if (puzzleLoading || errorCode) {
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
      fetchRandomPuzzle(variant, difficulty, idBlacklist).then((data) => {
        dispatch(receivedPuzzle(data))
        dispatch(updateDifficulty(data.difficulty))
      }).catch((e: AxiosError) => {
        setErrorCode(e.response!.status)
      }).finally(() => {
        setPuzzleLoading(false)
      })
    }
    setPageLoading(false)
  }, [
    dispatch, puzzleLoading, errorCode,
    variant, previousVariant, difficulty, previousDifficulty, idBlacklist, lastUpdate, solved,
  ])

  return (
    <>
      {errorCode === 404 ? (
        <EmptyCategory variant={variant} difficulty={difficulty} />
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
