import { useParams } from 'react-router-dom'
import Puzzle from 'src/components/Puzzle'

const PlayPage = () => {
  const { variant } = useParams()

  return (
    <>
      {variant}
      <Puzzle />
    </>
  )
}

export default PlayPage
