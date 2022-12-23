import _ from 'lodash'
import {
  CellPosition, FixedNumber, Grid, Region, SudokuConstraints,
} from 'src/types/sudoku'

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

type CountMap = {
  [key: number]: number
}

export const computeErrorGrid = (checkErrors: boolean, constraints: SudokuConstraints, grid?: Grid) => {
  const { gridSize, fixedNumbers } = constraints
  const errorGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(false))
  if (!checkErrors || !grid) {
    return errorGrid
  }

  const valuesGrid = computeFixedNumbersGrid(gridSize, fixedNumbers)
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      valuesGrid[row][col] ||= grid[row][col]
    }
  }

  for (let row = 0; row < gridSize; row++) {
    const valueCounts: CountMap = {}
    for (let col = 0; col < gridSize; col++) {
      const value = valuesGrid[row][col]
      valueCounts[value!] = (valueCounts[value!] || 0) + 1
    }
    for (let col = 0; col < gridSize; col++) {
      const value = valuesGrid[row][col]
      if (valueCounts[value!] > 1) {
        errorGrid[row][col] = true
      }
    }
  }

  for (let col = 0; col < gridSize; col++) {
    const valueCounts: CountMap = {}
    for (let row = 0; row < gridSize; row++) {
      const value = valuesGrid[row][col]
      valueCounts[value!] ||= 0
      valueCounts[value!] += 1
    }
    for (let row = 0; row < gridSize; row++) {
      const value = valuesGrid[row][col]
      if (valueCounts[value!] > 1) {
        errorGrid[row][col] = true
      }
    }
  }

  for (const region of constraints.regions) {
    const valueCounts: CountMap = {}
    for (let { row, col } of region) {
      const value = valuesGrid[row][col]
      valueCounts[value!] ||= 0
      valueCounts[value!] += 1
    }
    for (let { row, col } of region) {
      const value = valuesGrid[row][col]
      if (valueCounts[value!] > 1) {
        errorGrid[row][col] = true
      }
    }
  }

  for (const thermo of constraints.thermos ?? []) {
    let prevValue = 0
    let prevCell: CellPosition | null = null
    for (let cell of thermo) {
      const value = valuesGrid[cell.row][cell.col]
      if (value && value <= prevValue) {
        errorGrid[cell.row][cell.col] = true
        errorGrid[prevCell!.row][prevCell!.col] = true
      }
      if (value) {
        prevValue = value!
        prevCell = cell
      }
    }
  }

  return errorGrid
}
