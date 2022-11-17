import { useParams } from 'react-router-dom'

const PlayPage = () => {
  const { variant } = useParams()

  return (
    <>{variant}</>
  )
}

export default PlayPage
