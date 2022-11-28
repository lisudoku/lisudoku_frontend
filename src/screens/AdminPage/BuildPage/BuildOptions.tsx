import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from 'src/components/Button'
import { Select, Option } from 'src/components/Select'

const GRID_SIZES = [ 4, 6, 9 ]

const BuildOptions = () => {
  const [ gridSize, setGridSize ] = useState('9')

  return (
    <div>
      <Select value={gridSize} onChange={setGridSize} label="Variant">
        {GRID_SIZES.map(value => (
          <Option key={value} value={value.toString()}>{value}</Option>
        ))}
      </Select>
      <Link to={`./${gridSize}`}>
        <Button variant="text">Go build</Button>
      </Link>
    </div>
  )
}

export default BuildOptions
