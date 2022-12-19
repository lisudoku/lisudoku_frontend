import { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import _ from 'lodash'
import { useSelector, useDispatch } from 'src/hooks'
import { parseISO, differenceInMinutes, differenceInSeconds } from 'date-fns'
import { AxiosError } from 'axios'
import { updateDifficulty } from 'src/reducers/userData'
import { fetchRandomPuzzle } from 'src/utils/apiService'
import Puzzle from 'src/components/Puzzle'
import EmptyCategory from './EmptyCategory'
import { SudokuDifficulty, SudokuVariant } from 'src/types/sudoku'
import { clearPuzzle, receivedPuzzle, requestedPuzzle } from '../../reducers/puzzle'
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
  const [ errorCode, setErrorCode ] = useState<number | null>(null)
  const [ pageLoading, setPageLoading ] = useState(true)
  const [ puzzleLoading, setPuzzleLoading ] = useState(false)

  const userToken = useSelector(state => state.userData.token)
  const solvedPuzzles = useSelector(state => state.userData.solvedPuzzles)
  const lastUpdate = useSelector(state => state.puzzle.lastUpdate)
  const refreshKey = useSelector(state => state.puzzle.refreshKey)
  const solved = useSelector(state => state.puzzle.solved)
  const puzzleData = useSelector(state => state.puzzle.data)
  const persistedVariant = puzzleData?.variant
  const persistedDifficulty = puzzleData?.difficulty

  const idBlacklist = useMemo(() => _.map(solvedPuzzles, 'id'), [solvedPuzzles])

  const previousVariant = useRef(variant)
  const previousDifficulty = useRef(difficulty)
  useEffect(() => {
    if (variant !== previousVariant.current || difficulty !== previousDifficulty.current) {
      setErrorCode(null)
    }
    previousVariant.current = variant
    previousDifficulty.current = difficulty
  }, [variant, difficulty])

  const previousRefreshKey = useRef(refreshKey)
  useEffect(() => {
    if (puzzleLoading || errorCode) {
      return
    }
    if ((variant !== persistedVariant && persistedVariant !== undefined) ||
        (difficulty !== persistedDifficulty && persistedVariant !== undefined) ||
        lastUpdate === null ||
        refreshKey !== previousRefreshKey.current ||
        differenceInMinutes(new Date(), parseISO(lastUpdate)) >= 10 ||
        (solved && differenceInSeconds(new Date(), parseISO(lastUpdate)) >= 1)
    ) {
      previousRefreshKey.current = refreshKey

      setPuzzleLoading(true)
      dispatch(requestedPuzzle())
      fetchRandomPuzzle(variant, difficulty, idBlacklist, userToken).then((data) => {
        dispatch(receivedPuzzle(data))
        dispatch(updateDifficulty(data.difficulty))
      }).catch((e: AxiosError) => {
        dispatch(clearPuzzle())
        setErrorCode(e.response?.status ?? 500)
      }).finally(() => {
        setPuzzleLoading(false)
      })
    }
    setPageLoading(false)
  }, [
    dispatch, puzzleLoading, errorCode, userToken,
    variant, persistedVariant, difficulty, persistedDifficulty, idBlacklist, lastUpdate, solved,
    refreshKey,
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
