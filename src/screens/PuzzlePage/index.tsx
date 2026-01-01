import type { AxiosError } from 'axios'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { parseISO, differenceInSeconds } from 'date-fns'
import PageMeta from 'src/components/PageMeta'
import LoadingSpinner from 'src/design_system/LoadingSpinner'
import Puzzle from 'src/components/Puzzle'
import ErrorPage from 'src/components/ErrorPage'
import { useDispatch, useSelector } from 'src/hooks'
import { updateDifficulty } from 'src/reducers/userData'
import { fetchPuzzleByPublicId } from 'src/utils/apiService'
import { receivedPuzzle, requestedPuzzle } from '../../reducers/puzzle'

const PuzzlePage = () => {
  const { id } = useParams()

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [ errorCode, setErrorCode ] = useState<number | null>(null)
  const [ pageLoading, setPageLoading ] = useState(true)
  const [ puzzleLoading, setPuzzleLoading ] = useState(false)

  const userToken = useSelector(state => state.userData.token)
  const puzzleData = useSelector(state => state.puzzle.data)
  const refreshKey = useSelector(state => state.puzzle.refreshKey)
  const solved = useSelector(state => state.puzzle.solved)
  const lastUpdate = useSelector(state => state.puzzle.lastUpdate)
  const persistedId = puzzleData?.publicId
  const persistedVariant = puzzleData?.variant
  const persistedDifficulty = puzzleData?.difficulty

  useEffect(() => {
    if (puzzleLoading || errorCode) {
      return
    }
    // Note: external puzzles will have an undefined id, so no issues
    if (id !== persistedId ||
        (solved && differenceInSeconds(new Date(), parseISO(lastUpdate!)) >= 1)) {
      setPuzzleLoading(true)
      dispatch(requestedPuzzle())
      fetchPuzzleByPublicId(id!, userToken).then(data => {
        dispatch(receivedPuzzle(data))
        dispatch(updateDifficulty(data.difficulty))
      }).catch((error: AxiosError) => {
        setErrorCode(error.response?.status ?? 500)
      }).finally(() => {
        setPuzzleLoading(false)
      })
    }
    setPageLoading(false)
  }, [dispatch, userToken, id, persistedId, puzzleLoading, errorCode, solved, lastUpdate])

  const previousRefreshKey = useRef(refreshKey)
  useEffect(() => {
    if (refreshKey !== previousRefreshKey.current) {
      navigate(`/play/${persistedVariant}/${persistedDifficulty}`)
    }
    previousRefreshKey.current = refreshKey
  }, [navigate, userToken, refreshKey, persistedVariant, persistedDifficulty])

  return (
    <>
      <PageMeta title={`Puzzle ${id}`}
                url={`https://lisudoku.xyz/p/${id}`}
                description="Solve a specific puzzle" />
      {errorCode ? (
        <ErrorPage>
          {errorCode === 404 ? 'Puzzle not found' : undefined}
        </ErrorPage>
      ) : (pageLoading || puzzleLoading || !puzzleData) ? (
        <LoadingSpinner fullPage />
      ) : (
        <Puzzle />
      )}
    </>
  )
}

export default PuzzlePage
