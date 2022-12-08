import { useEffect, useLayoutEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
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

  const [ error, setError ] = useState(false)
  const [ pageLoading, setPageLoading ] = useState(true)
  const [ puzzleLoading, setPuzzleLoading ] = useState(false)

  const puzzleData = useSelector(state => state.puzzle.data)
  const previousId = puzzleData?.publicId

  useEffect(() => {
    if (puzzleLoading || error) {
      return
    }
    if (id !== previousId) {
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
  }, [dispatch, id, previousId, puzzleLoading, error])

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
