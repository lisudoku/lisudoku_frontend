import _ from 'lodash'
import { CellPosition, FixedNumber, Grid, Region } from 'src/types/sudoku'

const computeRegionSizes = (gridSize: number) => {
  if (gridSize === 4) {
    return [ 2, 2 ]
  } else if (gridSize === 6) {
    return [ 2, 3 ]
  } else {
    return [ 3, 3 ]
  }
}

export const ensureDefaultRegions = (gridSize: number): Region[] => {
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

export const computeFixedNumbersGrid = (gridSize: number, fixedNumbers: FixedNumber[]) => {
  const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null))
  for (const fixedNumber of fixedNumbers) {
    grid[fixedNumber.position.row][fixedNumber.position.col] = fixedNumber.value
  }
  return grid
}

export const gridIsFull = (grid: Grid | null) => (
  grid !== null && grid.every(row => row.every(cellValue => !!cellValue))
)

export const formatTimer = (seconds: number) => {
  let minutes = Math.floor(seconds / 60)
  seconds %= 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
