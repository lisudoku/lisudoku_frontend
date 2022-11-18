import _ from 'lodash'
import { useParams } from 'react-router-dom'
import Puzzle from 'src/components/Puzzle'

const PuzzlePage = () => {
  const { id } = useParams()

  return (
    <>
      <Puzzle />
    </>
  )
}

export default PuzzlePage
