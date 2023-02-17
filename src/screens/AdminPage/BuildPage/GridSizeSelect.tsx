import { useCallback } from 'react'
import { Option, Select } from 'src/components/Select'
import { useDispatch, useSelector } from 'src/hooks'
import { initPuzzle } from 'src/reducers/admin'
import { GRID_SIZES } from 'src/utils/constants'

const GridSizeSelect = () => {
  const dispatch = useDispatch()
  const gridSize = useSelector(state => state.admin.constraints!.gridSize)

  const handleChange = useCallback((gridSizeStr: string) => {
    dispatch(initPuzzle(gridSizeStr))
  }, [dispatch])

  return (
    <Select value={gridSize.toString()} onChange={handleChange} label="Grid Size">
      {GRID_SIZES.map(value => (
        <Option key={value} value={value.toString()}>{value}</Option>
      ))}
    </Select>
  )
}

export default GridSizeSelect
