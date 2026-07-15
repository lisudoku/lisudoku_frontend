import { flatten, flattenDeep, isEmpty, isEqual, times, uniqWith } from 'lodash-es'
import { CellMarks, Grid } from 'src/types/sudoku'
import { GRID_SIZES } from './constants'
import { Area, CellPosition, FixedNumber, Region, SudokuConstraints } from 'lisudoku-solver'
import { exhaustiveGuard } from './misc'
import { constraintDefinitions } from 'src/constraints/definitions'
import { CellErrors } from 'src/constraints/types'
import { getKropkiNegativeDots } from 'src/constraints/kropki/utils'
import { deduplicateErrorSets } from 'src/constraints/utils'

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

export const isCellArea = (area: Area) => {
  if (typeof area !== 'object') return false
  return 'Cell' in area
}

// TODO: this is also a duplicate between wasm and js
// TODO: either use wasm version or refactor to use lookup functions
export const getAreaCells = (area: Area, constraints: SudokuConstraints): CellPosition[] => {
  if (area === 'Grid') {
    return getAllCells(constraints.gridSize)
  } else if (area === 'PrimaryDiagonal') {
    return times(constraints.gridSize, idx => ({
      row: idx,
      col: idx,
    }))
  } else if (area === 'SecondaryDiagonal') {
    return times(constraints.gridSize, idx => ({
      row: idx,
      col: constraints.gridSize - 1 - idx,
    }))
  }

  if (typeof area !== 'object') {
    return exhaustiveGuard(area)
  }

  if ('Row' in area) {
    return times(constraints.gridSize, col => ({
      row: area.Row,
      col,
    }))
  } else if ('Column' in area) {
    return times(constraints.gridSize, row => ({
      row,
      col: area.Column,
    }))
  } else if ('Region' in area) {
    if (constraints.regions !== undefined) {
      // Assume all extra regions contain grid_size cells
      if (area.Region < constraints.regions.length) {
        return constraints.regions[area.Region]
      } else {
        return constraints.extraRegions![area.Region - constraints.regions.length]
      }
    } else {
      throw Error('no regions in constraints')
    }
  } else if ('Cell' in area) {
    return [{
      row: area.Cell[0],
      col: area.Cell[1],
    }]
  } else if ('Palindrome' in area) {
    return constraints.palindromes?.[area.Palindrome] ?? []
  } else if ('Thermo' in area) {
    return constraints.thermos?.[area.Thermo] ?? []
  } else if ('Arrow' in area) {
    if (constraints.arrows === undefined) {
      throw Error('no arrows in constraints')
    }
    const arrow = constraints.arrows[area.Arrow]
    return [...arrow.arrowCells, ...arrow.circleCells]
  } else if ('Renban' in area) {
    return constraints.renbans?.[area.Renban] ?? []
  } else if ('KropkiDot' in area) {
    if (constraints.kropkiDots === undefined) {
      throw Error('no kropki dots in constraints')
    }
    const kropkiDot = constraints.kropkiDots[area.KropkiDot]
    if (area.KropkiDot >= constraints.kropkiDots.length) {
      if (!constraints.kropkiNegative) {
        throw Error('Invalid kropki dot index')
      }
      let index = area.KropkiDot - constraints.kropkiDots.length
      const negativeDots = getKropkiNegativeDots(constraints)
      const kropkiDot = negativeDots[index]
      return [kropkiDot.cell1, kropkiDot.cell2]
    }
    return [kropkiDot.cell1, kropkiDot.cell2]
  } else if ('KillerCage' in area) {
    return constraints.killerCages?.[area.KillerCage].region ?? []
  } else if ('Adhoc' in area) {
    return area.Adhoc
  }

  return exhaustiveGuard(area)
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
