import { useState } from 'react'
import _ from 'lodash'
import SudokuGrid from './components/SudokuGrid'
import { Region, SudokuConstraints } from './types/constraints'
import CheckButton from './components/CheckButton'
import { CellPosition } from './types/common'

const computeRegionSizes = (gridSize: number) => {
  if (gridSize === 4) {
    return [ 2, 2 ]
  } else if (gridSize === 6) {
    return [ 2, 3 ]
  } else {
    return [ 3, 3 ]
  }
}

const ensureDefaultRegions = (gridSize: number): Region[] => {
  const [ regionHeight, regionWidth ] = computeRegionSizes(gridSize)
  const defaultRegions: Region[] = _.flatten(
    _.times(gridSize / regionHeight, regionRowIndex => (
      _.times(gridSize / regionWidth, regionColIndex => (
        _.flattenDeep(
          _.times(regionHeight, rowIndex => (
            _.times(regionWidth, colIndex => (
              {
                row: regionRowIndex * regionHeight + rowIndex,
                col: regionColIndex * regionWidth + colIndex,
              } as CellPosition
            ))
          ))
        )
      ))
    ))
  )

  return defaultRegions
}

const gridSize = 4
const fixedNumbers = [
  {
    position: {
      row: 1,
      col: 1,
    },
    value: 4,
  },
  {
    position: {
      row: 1,
      col: 3,
    },
    value: 2,
  },
  {
    position: {
      row: 2,
      col: 0,
    },
    value: 1,
  },
  {
    position: {
      row: 2,
      col: 2,
    },
    value: 3,
  },
]
const regions = ensureDefaultRegions(gridSize)
const constraints: SudokuConstraints = {
  gridSize,
  fixedNumbers,
  regions,
}

const gridIsFull = (grid: number[][] | undefined) => grid && grid.every(row => row.every(x => !!x))

const App = () => {
  const [ grid, setGrid ] = useState<number[][]>()

  return (
    <div className="App">
      <SudokuGrid gridSize={gridSize} constraints={constraints} onGridChange={setGrid} />
      {gridIsFull(grid) && (
        <CheckButton grid={grid!} constraints={constraints} />
      )}
    </div>
  );
}

export default App
