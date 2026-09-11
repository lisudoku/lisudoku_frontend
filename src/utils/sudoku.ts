import { flatten, flattenDeep, isEmpty, isEqual, times, uniqWith } from 'lodash-es'
import { CellMarks, Grid } from 'src/types/sudoku'
import { GRID_SIZES } from './constants'
import { Area, CellPosition, FixedNumber, Region, SudokuConstraints } from 'lisudoku-solver'
import { constraintDefinitions } from 'src/constraints/definitions'
import { CellErrors } from 'src/constraints/types'
import { deduplicateErrorSets, getAreaConstraintType } from 'src/constraints/utils'

export type CellMarkSets = {
  cornerMarks?: Set<number>
  centerMarks?: Set<number>
}

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
  const defaultRegions: Region[] = flatten(
    times(gridSize / regionHeight, regionRowIndex => (
      times(gridSize / regionWidth, regionColIndex => (
        flattenDeep(
          times(regionHeight, rowIndex => (
            times(regionWidth, colIndex => (
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

export const defaultConstraints = (gridSize: number): Required<SudokuConstraints> => ({
  gridSize,
  fixedNumbers: [],
  regions: ensureDefaultRegions(gridSize),
  extraRegions: [],
  thermos: [],
  arrows: [],
  killerCages: [],
  kropkiDots: [],
  kropkiNegative: false,
  primaryDiagonal: false,
  secondaryDiagonal: false,
  antiKnight: false,
  antiKing: false,
  oddCells: [],
  evenCells: [],
  topBottom: false,
  renbans: [],
  palindromes: [],
})

export const regionGridToRegions = (gridSize: number, regionGrid: Grid): Region[] => {
  const regions: Region[] = []
  times(gridSize, row => {
    times(gridSize, col => {
      const regionIndex = regionGrid[row][col]! - 1
      regions[regionIndex] ||= []
      const cell: CellPosition = { row, col }
      regions[regionIndex].push(cell)
    })
  })
  return regions
}

export const regionsToRegionGrid = (gridSize: number, regions: Region[]) => {
  const regionGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null))
  regions.forEach((region, index) => {
    for (const { row, col } of region) {
      regionGrid[row][col] = index + 1
    }
  })
  return regionGrid
}

export const computeFixedNumbersGrid = (gridSize: number, fixedNumbers?: FixedNumber[]) => {
  const grid: Grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null))
  for (const fixedNumber of fixedNumbers ?? []) {
    grid[fixedNumber.position.row][fixedNumber.position.col] = fixedNumber.value
  }
  return grid
}

export const gridToFixedNumbers: (grid: Grid) => FixedNumber[] = (grid: Grid) => {
  const fixedNumbers: FixedNumber[] = []
  grid.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell !== null) {
        fixedNumbers.push({
          position: {
            row: rowIndex,
            col: colIndex,
          },
          value: cell,
        })
      }
    })
  })
  return fixedNumbers
}

export const gridSizeFromString: (gridString: string) => number = (gridString: string) => (
  Math.sqrt(gridString.length)
)

export const createGridOfSize: (gridSize: number) => Grid = (gridSize: number) => (
  Array(gridSize).fill(null).map(() => Array(gridSize).fill(null))
)

export const gridStringToGrid: (gridString: string) => Grid = (gridString: string) => {
  const gridSize = gridSizeFromString(gridString)
  const grid = createGridOfSize(gridSize)
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const index = row * gridSize + col
      if (gridString[index] !== '0') {
        grid[row][col] = parseInt(gridString[index])
      }
    }
  }
  return grid
}

export const gridToGridString: (grid: Grid) => string = (grid: Grid) => {
  let gridString = '';
  grid.forEach(row => {
    row.forEach(cell => {
      const value = cell !== null ? cell : 0;
      gridString += value;
    })
  })
  return gridString;
}

export const fixedNumbersToGridString: (gridSize: number, fixedNumbers?: FixedNumber[]) => string = (gridSize: number, fixedNumbers?: FixedNumber[]) => {
  const grid = computeFixedNumbersGrid(gridSize, fixedNumbers)
  return gridToGridString(grid)
}

export const gridStringToFixedNumbers: (gridString: string) => FixedNumber[] = (gridString: string) => {
  const grid = gridStringToGrid(gridString)
  return gridToFixedNumbers(grid)
}

export const isGridString = (gridString: string) => {
  const gridSize = gridSizeFromString(gridString)
  if (Math.trunc(gridSize) !== gridSize) {
    return false
  }
  if (!GRID_SIZES.includes(gridSize)) {
    return false
  }
  if (![...gridString].every(value => '0' <= value && value <= String(gridSize))) {
    return false
  }
  return true
}

export const gridIsFull = (grid: Grid | null) => (
  grid !== null && grid.every(row => row.every(cellValue => !!cellValue))
)

export const formatTimer = (seconds: number) => {
  let minutes = Math.floor(seconds / 60)
  seconds %= 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export const isCellCompletelyEmpty = (cell: CellPosition, valuesGrid: Grid, cellMarks: CellMarks[][]) => {
  const value = valuesGrid[cell.row][cell.col]
  const currentCellMarks = cellMarks[cell.row][cell.col]
  return !value && isEmpty(currentCellMarks?.cornerMarks) && isEmpty(currentCellMarks?.centerMarks)
}

export const computeErrors = (checkErrors: boolean, constraints: SudokuConstraints, grid?: Grid, cellMarksGrid?: CellMarks[][]) => {
  const { gridSize, fixedNumbers } = constraints
  const errorsGrid: CellErrors[][] = Array(gridSize).fill(null).map(() => Array(gridSize))
  if (!checkErrors || !grid || !cellMarksGrid) {
    return errorsGrid
  }

  const valuesGrid = computeFixedNumbersGrid(gridSize, fixedNumbers)
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      valuesGrid[row][col] ||= grid[row][col]
    }
  }

  const errorResults = Object
    .values(constraintDefinitions)
    .filter(constraintDefinition => constraintDefinition.isActiveInConstraints({ constraints }))
    .flatMap(constraintDefinitions => (
      constraintDefinitions.errors({
        constraints,
        valuesGrid,
        cellMarksGrid,
      })
    ))

  const uniqueErrorSets = deduplicateErrorSets(errorResults)
  for (const { cell: { row, col }, errorSet } of uniqueErrorSets) {
    errorsGrid[row][col] ||= []
    errorsGrid[row][col]!.push(...errorSet)
  }

  return errorsGrid
}

export const getAllCells = (gridSize: number) => {
  const cells: CellPosition[] = flatten(
    times(gridSize, rowIndex => (
      times(gridSize, colIndex => (
        {
          row: rowIndex,
          col: colIndex,
        }
      ))
    ))
  )
  return cells
}

export const getAreaCells = (area: Area, constraints: SudokuConstraints): CellPosition[] => {
  switch (area.type) {
  // Edge cases
  case 'Grid': return getAllCells(constraints.gridSize)
  case 'Adhoc': return area.value
  case 'Cell': return [{ row: area.value[0], col: area.value[1] }]
  // Constraint-specific areas
  default: {
    const constraintType = getAreaConstraintType(area, constraints)
    if (constraintType === null) {
      throw new Error('invalid constraint type handling')
    }
    const constraint = constraintDefinitions[constraintType]
    return constraint.areaCells(area, { constraints })
  }}
}

export const cellDisplay = (cell: CellPosition) => (
  `R${cell.row + 1}C${cell.col + 1}`
)

// Returns how to refer to given area in hints and solver steps.
export const areaDisplay = (area: Area, constraints: SudokuConstraints): string => {
  switch (area.type) {
  // Edge cases
  case 'Grid': return 'the grid'
  case 'Adhoc': return `adhoc set of cells ${area.value.map((cell: CellPosition) => cellDisplay(cell)).join(', ')}`
  case 'Cell': return `cell ${cellDisplay({ row: area.value[0], col: area.value[1] })}`
  // Constraint-specific areas
  default: {
    const constraintType = getAreaConstraintType(area, constraints)
    if (constraintType === null) {
      throw new Error('invalid constraint type handling')
    }
    const constraint = constraintDefinitions[constraintType]
    return constraint.areaDisplay(area, { constraints })
  }}
}

export const getCellPeers = (constraints: SudokuConstraints, cell: CellPosition): CellPosition[] => (
  uniqWith(
    Object.values(constraintDefinitions)
      .filter(constraintDefinition => constraintDefinition.isActiveInConstraints({ constraints }))
      .flatMap(
        constraintDefinitions => constraintDefinitions.cellPeers({ cell, constraints })
      ),
    isEqual,
  )
)
