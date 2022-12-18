import { useEffect, useLayoutEffect, useState } from 'react'
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
      fetchPuzzleById(id!).then(data => {
        dispatch(receivedPuzzle(data))
        dispatch(updateDifficulty(data.difficulty))
      }).catch(() => {
        setError(true)
      }).finally(() => {
        setPuzzleLoading(false)
      })
    }
    setPageLoading(false)
  }, [dispatch, id, persistedId, puzzleLoading, error])

  useEffect(() => {
    if (!pageLoading) {
      navigate(`/play/${persistedVariant}/${persistedDifficulty}`)
    }
  }, [navigate, refreshKey, persistedVariant, persistedDifficulty])

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
