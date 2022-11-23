import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'src/hooks'
import { fetchRandomPuzzle } from 'src/utils/apiService'
import Puzzle from 'src/components/Puzzle'
import { SudokuDifficulty, SudokuVariant } from 'src/types/sudoku'
import { receivedPuzzle, requestedPuzzle } from './reducers/puzzle'

const PlayPage = () => {
  const { variant } = useParams()
  const difficulty = useSelector(state => state.userData.difficulty)
  const dispatch = useDispatch()

  const puzzle = useSelector(state => state.puzzle.data)
  const isLoading = useSelector(state => state.puzzle.isLoading)

  useEffect(() => {
    dispatch(requestedPuzzle())
    fetchRandomPuzzle(variant! as SudokuVariant, difficulty).then(data => {
      dispatch(receivedPuzzle(data))
    })
  }, [dispatch, variant, difficulty])

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

export default PlayPage
