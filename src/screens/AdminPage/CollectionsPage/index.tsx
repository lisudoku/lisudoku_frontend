import { useCallback, useEffect, useState } from 'react'
import { Typography } from '@material-tailwind/react'
import { Link } from 'react-router-dom'
import Button from 'src/components/Button'
import LoadingSpinner from 'src/components/LoadingSpinner'
import AddPuzzleCollectionForm from './AddPuzzleCollectionForm'
import { useDispatch, useSelector } from 'src/hooks'
import { deletedPuzzleCollection, responsePuzzleCollections } from 'src/reducers/collections'
import { deletePuzzleCollection, fetchAllCollections } from 'src/utils/apiService'

const CollectionsPage = () => {
  const [ loading, setLoading ] = useState(true)
  const dispatch = useDispatch()
  const puzzleCollections = useSelector(state => state.collections.collections)
  const userToken = useSelector(state => state.userData!.token)

  useEffect(() => {
    setLoading(true)
    fetchAllCollections(userToken!).then(data => {
      dispatch(responsePuzzleCollections(data.puzzle_collections))
      setLoading(false)
    })
  }, [dispatch, userToken])

  const handleDelete = useCallback((id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete puzzle collection "${name}"`)) {
      setLoading(true)
      deletePuzzleCollection(id, userToken!).then(() => {
        dispatch(deletedPuzzleCollection(id))
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
        Collections
      </Typography>

      <AddPuzzleCollectionForm />

      <table className="border border-collapse">
        <thead className="border-b">
          <tr className="divide-x">
            <th className="p-2">ID</th>
            <th className="p-2">Name</th>
            <th className="p-2">URL</th>
            <th className="p-2">Puzzle Count</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {puzzleCollections!.map(({ id, name, url, puzzles }) => (
            <tr key={id} className="h-8 divide-x">
              <td className="p-2">{id}</td>
              <td className="p-2">
                <a href={`/collections/${id}`}
                    target="_blank"
                    rel="noopener noreferrer">
                  {name}
                </a>
              </td>
              <td className="p-2">
                <a href={url}
                    target="_blank"
                    rel="noopener noreferrer">
                  {url}
                </a>
              </td>
              <td className="p-2">
                {puzzles.length}
              </td>
              <td className="p-2">
                <Button variant="text" color="red" onClick={() => handleDelete(id, name)}>
                  Delete
                </Button>
                <Link to={`/admin/collections/${id}/edit`} className="ml-5 text-sm">
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

export default CollectionsPage
