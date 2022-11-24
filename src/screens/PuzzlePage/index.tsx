import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Puzzle from 'src/components/Puzzle'
import { useDispatch, useSelector } from 'src/hooks'
import { updateDifficulty } from 'src/reducers/userData'
import { fetchPuzzleById } from 'src/utils/apiService'
import { receivedPuzzle, requestedPuzzle } from '../../reducers/puzzle'

const PuzzlePage = () => {
  const { id } = useParams()
  const dispatch = useDispatch()

  const [ error, setError ] = useState(false)
  const [ loading, setLoading ] = useState(false)

  const puzzleData = useSelector(state => state.puzzle.data)
  const previousId = puzzleData?.publicId

  useEffect(() => {
    if (id !== previousId) {
      setLoading(true)
      dispatch(requestedPuzzle())
      fetchPuzzleById(id!).then(data => {
        dispatch(receivedPuzzle(data))
        dispatch(updateDifficulty(data.difficulty))
      }).catch(() => {
        setError(true)
      }).finally(() => {
        setLoading(false)
      })
    }
  }, [dispatch, id, previousId])

  return (
    <>
      {error ? (
        'Error'
      ) : (loading || !puzzleData) ? (
        'Loading...'
      ) : (
        <Puzzle />
      )}
    </>
  )
}

export default PuzzlePage
