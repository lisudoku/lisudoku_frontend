import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { format, isFuture, isPast, parseISO, subHours } from 'date-fns'
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
  // Subtract 6 hours to avoid going over midnight in some time zones
  const toDay = format(subHours(toDate, 6), 'EEEE')

  const notStarted = isFuture(fromDate)
  const inProgress = isPast(fromDate) && isFuture(toDate)
  const finished = isPast(toDate)

  const externalLink = (
    <a href={url}
       target="_blank"
       rel="noopener noreferrer"
       className="underline">
      here
    </a>
  )

  return (
    <div className="w-full bg-softhighlight text-primary rounded-none py-1 px-4 lg:px-8">
      The <b>{name}</b> contest {' '}

      {finished ? (
        <>
          ended on {toDay}. Contest link {externalLink}.
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

          {' '} and it is open until {toDay}! Participate {externalLink}.
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
