import { useEffect } from 'react'
import { useDispatch, useSelector } from 'src/hooks'
import LoadingSpinner from '../LoadingSpinner'
import { Select, Option } from '../Select'
import { fetchAllCollections } from 'src/utils/apiService'
import { responsePuzzleCollections } from 'src/reducers/collections'

const PuzzleCollectionsSelect = ({ value, onChange, label }: PuzzleCollectionsSelectProps) => {
  const dispatch = useDispatch()
  const userToken = useSelector(state => state.userData.token!)
  const puzzleCollections = useSelector(state => state.collections.collections)

  useEffect(() => {
    if (puzzleCollections !== undefined) {
      return
    }
    fetchAllCollections(userToken).then(data => {
      dispatch(responsePuzzleCollections(data.puzzle_collections))
    })
  }, [dispatch, userToken, puzzleCollections])

  if (puzzleCollections === undefined) {
    return <LoadingSpinner size={20} />
  }

  const sortedCollections = [ ...puzzleCollections ].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <Select value={value}
            onChange={onChange}
            label={label}
            labelProps={{ className: 'transition-none' }}>
      {[ { id: '', name: 'lisudoku' }, ...sortedCollections ].map(({ id, name }) => (
        <Option key={id} value={id.toString()}>{name}</Option>
      ))}
    </Select>
  )
}

PuzzleCollectionsSelect.defaultProps = {
  label: 'Source',
}

type PuzzleCollectionsSelectProps = {
  value: string,
  onChange: Function,
  label: string
}

export default PuzzleCollectionsSelect
