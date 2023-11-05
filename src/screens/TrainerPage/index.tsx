import { useEffect, useRef, useState } from 'react'
import ErrorPage from 'src/components/ErrorPage'
import LoadingSpinner from 'src/components/LoadingSpinner'
import PageMeta from 'src/components/PageMeta'
import { useDispatch, useSelector } from 'src/hooks'
import { receivedTrainerPuzzle, requestedTrainerPuzzle } from 'src/reducers/trainer'
import { SudokuVariant } from 'src/types/sudoku'
import { fetchRandomTrainerPuzzle } from 'src/utils/apiService'
import TrainerPuzzle from '../../components/TrainerPuzzle'
import { scrollToTop } from 'src/utils/misc'

const VARIANT = SudokuVariant.Classic
const ID_BLACKLIST: number[] = []

const TrainerPage = () => {
  const dispatch = useDispatch()

  const isOnline = useSelector(state => state.misc.isOnline)
  const [ pageLoading, setPageLoading ] = useState(true)
  const [ error, setError ] = useState(false)
  const [ puzzleLoading, setPuzzleLoading ] = useState(false)
  
  const userToken = useSelector(state => state.userData.token)
  const technique = useSelector(state => state.trainer.technique)
  const puzzleData = useSelector(state => state.trainer.data)
  const refreshKey = useSelector(state => state.trainer.refreshKey)

  const previousRefreshKey = useRef(refreshKey)
  const requestedPuzzle = useRef(false)

  useEffect(() => {
    if (puzzleLoading || error) {
      return
    }
    if (!requestedPuzzle.current || refreshKey !== previousRefreshKey.current) {
      requestedPuzzle.current = true
      previousRefreshKey.current = refreshKey

      setPuzzleLoading(true)
      dispatch(requestedTrainerPuzzle())

      fetchRandomTrainerPuzzle(VARIANT, technique, ID_BLACKLIST, userToken).then(data => {
        dispatch(receivedTrainerPuzzle(data))
      }).catch(() => {
        setError(true)
      }).finally(() => {
        setPuzzleLoading(false)
        scrollToTop()
      })
    }
    setPageLoading(false)
  }, [dispatch, userToken, puzzleLoading, error, refreshKey, puzzleData, technique])

  return (
    <div>
      <PageMeta title="Lisudoku Trainer"
                url="https://lisudoku.xyz/trainer"
                description="Improve your sudoku solving technique with lisudoku trainer" />
      {!isOnline ? (
        <ErrorPage text="Trainer is not available while offline" />
      ) : error ? (
        <ErrorPage />
      ) : (pageLoading || puzzleLoading || !puzzleData) ? (
        <LoadingSpinner fullPage />
      ) : (
        <TrainerPuzzle />
      )}
    </div>
  )
}

export default TrainerPage
