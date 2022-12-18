import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Puzzle from 'src/components/Puzzle'
import { useDispatch, useSelector } from 'src/hooks'
import { updateDifficulty } from 'src/reducers/userData'
import { fetchPuzzleById } from 'src/utils/apiService'
import { receivedPuzzle, requestedPuzzle } from '../../reducers/puzzle'

const PuzzlePage = () => {
  const { id } = useParams()
  useLayoutEffect(() => {
    document.title = `lisudoku - Puzzle ${id}`
  }, [id])

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [ error, setError ] = useState(false)
  const [ pageLoading, setPageLoading ] = useState(true)
  const [ puzzleLoading, setPuzzleLoading ] = useState(false)

  const userToken = useSelector(state => state.userData.token)
  const puzzleData = useSelector(state => state.puzzle.data)
  const refreshKey = useSelector(state => state.puzzle.refreshKey)
  const persistedId = puzzleData?.publicId
  const persistedVariant = puzzleData?.variant
  const persistedDifficulty = puzzleData?.difficulty

  useEffect(() => {
    if (puzzleLoading || error) {
      return
    }
    if (id !== persistedId) {
      setPuzzleLoading(true)
      dispatch(requestedPuzzle())
      fetchPuzzleById(id!, userToken).then(data => {
        dispatch(receivedPuzzle(data))
        dispatch(updateDifficulty(data.difficulty))
      }).catch(() => {
        setError(true)
      }).finally(() => {
        setPuzzleLoading(false)
      })
    }
    setPageLoading(false)
  }, [dispatch, userToken, id, persistedId, puzzleLoading, error])

  const previousRefreshKey = useRef(refreshKey)
  useEffect(() => {
    if (refreshKey !== previousRefreshKey.current) {
      navigate(`/play/${persistedVariant}/${persistedDifficulty}`)
    }
    previousRefreshKey.current = refreshKey
  }, [navigate, userToken, refreshKey, persistedVariant, persistedDifficulty])

  return (
    <>
      {error ? (
        'Error'
      ) : (pageLoading || puzzleLoading || !puzzleData) ? (
        'Loading...'
      ) : (
        <Puzzle />
      )}
    </>
  )
}

export default PuzzlePage
