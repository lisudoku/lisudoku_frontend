import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Puzzle from 'src/components/Puzzle'
import { useDispatch, useSelector } from 'src/hooks'
import { fetchPuzzleById } from 'src/utils/apiService'
import { receivedPuzzle, requestedPuzzle } from '../PlayPage/reducers/puzzle'

const PuzzlePage = () => {
  const { id } = useParams()
  const dispatch = useDispatch()

  const puzzle = useSelector(state => state.puzzle.data)
  const isLoading = useSelector(state => state.puzzle.isLoading)

  useEffect(() => {
    dispatch(requestedPuzzle())
    fetchPuzzleById(id!).then(data => {
      dispatch(receivedPuzzle(data))
    })
  }, [dispatch, id])

  return (
    <>
      {isLoading || !puzzle ? (
        'Loading...'
      ) : (
        <Puzzle />
      )}
    </>
  )
}

export default PuzzlePage
