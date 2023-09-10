import PageMeta from 'src/components/PageMeta'
import { Typography } from '@material-tailwind/react'
import ErrorPage from 'src/components/ErrorPage'
import LoadingSpinner from 'src/components/LoadingSpinner'
import TvPuzzleCard from './TvPuzzleCard'
import { useTvViewerWebsocket } from './hooks'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircle } from '@fortawesome/free-solid-svg-icons'
import { pluralize } from 'src/utils/misc'

const TvPage = () => {
  const { tvPuzzles, viewerCount, loading, error, errorMessage } = useTvViewerWebsocket()

  return (
    <>
      <PageMeta title="TV"
                url="https://lisudoku.xyz/tv"
                description="Watch people solve puzzles in real time" />
      {error ? (
        <ErrorPage text={errorMessage} />
      ) : loading ? (
        <LoadingSpinner fullPage />
      ) : (
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
      )}
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
