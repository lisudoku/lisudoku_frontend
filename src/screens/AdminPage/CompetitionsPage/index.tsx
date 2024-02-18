import { orderBy } from 'lodash-es'
import { formatISO9075, parseISO } from 'date-fns'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from 'src/shared/Button'
import LoadingSpinner from 'src/shared/LoadingSpinner'
import Typography from 'src/shared/Typography'
import { useDispatch, useSelector } from 'src/hooks'
import { deletedCompetition, receiveCompetitions } from 'src/reducers/competitions'
import { deleteCompetition, fetchAllCompetitions } from 'src/utils/apiService'
import AddCompetitionForm from './AddCompetitionForm'

const CompetitionsPage = () => {
  const [ loading, setLoading ] = useState(true)
  const dispatch = useDispatch()
  const userToken = useSelector(state => state.userData!.token)
  const competitions = useSelector(state => state.competitions.competitions)

  useEffect(() => {
    setLoading(true)
    fetchAllCompetitions().then(data => {
      dispatch(receiveCompetitions(data.competitions))
      setLoading(false)
    })
  }, [dispatch, userToken])

  const handleDelete = useCallback((id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete competition "${name}"`)) {
      setLoading(true)
      deleteCompetition(id, userToken!).then(() => {
        dispatch(deletedCompetition(id))
        setLoading(false)
      })
    }
  }, [dispatch, userToken])

  if (loading) {
    return <LoadingSpinner fullPage />
  }

  return (
    <>
      <Typography variant="h3">
        Competitions
      </Typography>

      <AddCompetitionForm />

      <table className="border border-collapse">
        <thead className="border-b">
          <tr className="divide-x">
            <th className="p-2">ID</th>
            <th className="p-2">Name</th>
            <th className="p-2">URL</th>
            <th className="p-2">From Date</th>
            <th className="p-2">To Date</th>
            <th className="p-2">IB Puzzle Collection</th>
            <th className="p-2">Puzzle Collection</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {orderBy(competitions, 'fromDate', 'desc').map(({ id, name, url, fromDate, toDate, puzzleCollectionId, ibPuzzleCollectionId }) => (
            <tr key={id} className="h-8 divide-x">
              <td className="p-2">{id}</td>
              <td className="p-2">{name}</td>
              <td className="p-2">
                <a href={url}
                   target="_blank"
                   rel="noopener noreferrer">
                  {url}
                </a>
              </td>
              <td className="p-2">{formatISO9075(parseISO(fromDate))}</td>
              <td className="p-2">{formatISO9075(parseISO(toDate))}</td>
              <td className="p-2">
                <a href={`/collections/${ibPuzzleCollectionId}`}
                   target="_blank"
                   rel="noopener noreferrer">
                  {ibPuzzleCollectionId}
                </a>
              </td>
              <td className="p-2">
                <a href={`/collections/${puzzleCollectionId}`}
                   target="_blank"
                   rel="noopener noreferrer">
                  {puzzleCollectionId}
                </a>
              </td>
              <td className="p-2">
                <Button variant="text" color="red" onClick={() => handleDelete(id, name)}>
                  Delete
                </Button>
                <Link to={`/admin/competitions/${id}/edit`} className="ml-5 text-sm">
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

export default CompetitionsPage
