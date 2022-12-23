import { Typography } from '@material-tailwind/react'
import TvPuzzleCard from './TvPuzzleCard'
import { useTvWebsocket } from './hooks'

const TvPage = () => {
  const { tvPuzzles } = useTvWebsocket()

  return (
    <>
      <Typography variant="h3">
        Live TV ({tvPuzzles.length})
      </Typography>
      <div className="flex flex-wrap gap-4">
        {tvPuzzles.map(tvPuzzle => (
          <div key={tvPuzzle.id}>
            <TvPuzzleCard puzzle={tvPuzzle} />
          </div>
        ))}
      </div>
    </>
  )
}

export default TvPage
