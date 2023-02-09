import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { format, isFuture, isPast, parseISO } from 'date-fns'
import { useDispatch, useSelector } from 'src/hooks'
import { receiveActiveCompetitions } from 'src/reducers/userData'
import { Competition } from 'src/types'
import { fetchActiveCompetitions } from 'src/utils/apiService'

const ContestsAlert = () => {
  const dispatch = useDispatch()
  const competitions = useSelector(state => state.userData.activeCompetitions ?? [])

  useEffect(() => {
    fetchActiveCompetitions().then(data => {
      dispatch(receiveActiveCompetitions(data.competitions))
    })
  }, [dispatch])

  return (
    <div className="divide-y divide-dashed divide-gray-600">
      {competitions.map((competition: Competition) => (
        <ContestAlert key={competition.id} competition={competition} />
      ))}
    </div>
  )
}

const ContestAlert = ({ competition }: { competition: Competition }) => {
  const {
    name, url, fromDate: fromDateStr, toDate: toDateStr, puzzleCollectionId, ibPuzzleCollectionId,
  } = competition

  const fromDate = parseISO(fromDateStr)
  const toDate = parseISO(toDateStr)

  const fromDay = format(fromDate, 'EEEE')
  const toDay = format(toDate, 'EEEE')

  const notStarted = isFuture(fromDate)
  const inProgress = isPast(fromDate) && isFuture(toDate)
  const finished = isPast(toDate)

  return (
    <div className="w-full bg-cyan-900 rounded-none py-1 px-4 lg:px-8">
      The <b>{name}</b> contest {' '}

      {finished ? (
        <>
          ended on {toDay}. 
          {puzzleCollectionId && (
            <>{' '} Solve the puzzles {' '}
              <Link to={`/collections/${puzzleCollectionId}`}
                    className="underline">
                here
              </Link>
              .
            </>
          )}
        </>
      ) : (
        <>
          {notStarted && (
            <>
              starts on {fromDay}
            </>
          )}
          {inProgress && (
            <>
              started
            </>
          )}

          {' '} and it is open until {toDay}! Participate {' '}
          <a href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline">
            here
          </a>
          .
          {ibPuzzleCollectionId && (
            <>{' '} Solve Instruction Booklet puzzles {' '}
              <Link to={`/collections/${ibPuzzleCollectionId}`}
                    className="underline">
                here
              </Link>
              .
            </>
          )}
        </>
      )}
    </div>
  )
}

export default ContestsAlert
