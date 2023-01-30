import { useEffect } from 'react'
import { useDispatch, useSelector } from 'src/hooks'
import _ from 'lodash'
import LoadingSpinner from '../LoadingSpinner'
import { Select, Option } from '../Select'
import { fetchAllCollections } from 'src/utils/apiService'
import { responsePuzzleCollections } from 'src/reducers/collections'

const PuzzleCollectionsSelect = ({ value, onChange }: PuzzleCollectionsSelectProps) => {
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

  return (
    <Select value={value}
            onChange={onChange}
            label="Source">
      {[ { id: '', name: 'lisudoku' }, ...puzzleCollections ].map(({ id, name }) => (
        <Option key={id} value={id.toString()}>{name}</Option>
      ))}
    </Select>
  )
}

type PuzzleCollectionsSelectProps = {
  value: string,
  onChange: Function,
}

export default PuzzleCollectionsSelect
