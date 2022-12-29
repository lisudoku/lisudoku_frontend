import { useLayoutEffect } from 'react'
import { Typography } from '@material-tailwind/react'
import TvPuzzleCard from './TvPuzzleCard'
import { useTvWebsocket } from './hooks'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircle } from '@fortawesome/free-solid-svg-icons'
import { pluralize } from 'src/utils/misc'

const TvPage = () => {
  const { tvPuzzles, viewerCount } = useTvWebsocket()

  useLayoutEffect(() => {
    document.title = `lisudoku TV (${tvPuzzles.length})`
  }, [tvPuzzles.length])

  return (
    <>
      <div className="flex justify-between">
        <Typography variant="h3">
          Live TV ({tvPuzzles.length})
        </Typography>
        <ViewerCount count={viewerCount} />
      </div>
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

const ViewerCount = ({ count }: { count: number }) => (
  <Typography variant="paragraph" className="font-thin">
    <FontAwesomeIcon icon={faCircle} size="2xs" color="lightgreen" />
    <span> {count} {pluralize(count, 'viewer')}</span>
  </Typography>
)

export default TvPage