import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import LoadingSpinner from 'src/components/LoadingSpinner'
import Puzzle from 'src/components/Puzzle'
import { useDispatch, useSelector } from 'src/hooks'
import { updateDifficulty } from 'src/reducers/userData'
import { fetchPuzzleByPublicId } from 'src/utils/apiService'
import { receivedPuzzle, requestedPuzzle } from '../../reducers/puzzle'
import { Typography } from '@material-tailwind/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons'

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
      fetchPuzzleByPublicId(id!, userToken).then(data => {
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

export default PuzzlePage
