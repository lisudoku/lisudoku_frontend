import { useState, useEffect, useRef, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import _ from 'lodash'
import { useSelector, useDispatch } from 'src/hooks'
import { parseISO, differenceInMinutes, differenceInSeconds } from 'date-fns'
import { AxiosError } from 'axios'
import { updateDifficulty } from 'src/reducers/userData'
import { fetchRandomPuzzle } from 'src/utils/apiService'
import PageMeta from 'src/components/PageMeta'
import Puzzle from 'src/components/Puzzle'
import EmptyCategory from './EmptyCategory'
import { SudokuDifficulty, SudokuVariant } from 'src/types/sudoku'
import { clearPuzzle, receivedPuzzle, requestedPuzzle } from '../../reducers/puzzle'
import { SudokuDifficultyDisplay, SudokuVariantDisplay } from 'src/utils/constants'
import LoadingSpinner from 'src/components/LoadingSpinner'
import ErrorPage from 'src/components/ErrorPage'

const PlayPage = () => {
  const { variant: variantParam, difficulty: difficultyParam } = useParams()
  const variant = variantParam as SudokuVariant
  const difficulty = difficultyParam as SudokuDifficulty
  const variantDisplay = SudokuVariantDisplay[variant]
  const difficultyDisplay = SudokuDifficultyDisplay[difficulty]

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
  const persistedIsExternal = puzzleData?.isExternal

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
    if (persistedIsExternal ||
        (variant !== persistedVariant && persistedVariant !== undefined) ||
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
    persistedIsExternal, refreshKey,
  ])

  return (
    <>
      <PageMeta title={`Puzzles - ${variantDisplay} ${difficultyDisplay}`}
                url={`https://lisudoku.xyz/play/${variant}/${difficulty}`}
                description="Solve random puzzles from any category"
      />
      {errorCode === 404 ? (
        <EmptyCategory variant={variant} difficulty={difficulty} />
      ) : errorCode ? (
        <ErrorPage />
      ) : (pageLoading || puzzleLoading || !puzzleData) ? (
        <LoadingSpinner fullPage />
      ) : (
        <Puzzle />
      )}
    </>
  )
}

export default PlayPage
