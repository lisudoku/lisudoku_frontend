import { useCallback } from 'react'
import { Option, Select } from 'src/design_system/Select'
import { useDispatch, useSelector } from 'src/hooks'
import { initPuzzle } from 'src/reducers/builder'
import { GRID_SIZES } from 'src/utils/constants'

const GridSizeSelect = () => {
  const dispatch = useDispatch()
  const gridSize = useSelector(state => state.builder.constraints!.gridSize)

  const handleChange = useCallback((gridSizeStr: string) => {
    dispatch(initPuzzle({ gridSize: gridSizeStr }))
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
