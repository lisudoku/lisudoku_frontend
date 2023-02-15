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
import { Typography } from '@material-tailwind/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons'

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
      <PageMeta title={`lisudoku - ${variantDisplay} ${difficultyDisplay}`}
                url={`https://lisudoku.xyz/play/${variant}/${difficulty}`}
      />
      {errorCode === 404 ? (
        <EmptyCategory variant={variant} difficulty={difficulty} />
      ) : errorCode ? (
        <div className="w-full pt-20 text-center">
          <Typography variant="h4" className="font-normal mb-3">
            Something went wrong
          </Typography>
          <FontAwesomeIcon icon={faCircleExclamation} size="4x" color="red" />
        </div>
      ) : (pageLoading || puzzleLoading || !puzzleData) ? (
        <LoadingSpinner fullPage />
      ) : (
        <Puzzle />
      )}
    </>
  )
}

export default PlayPage
