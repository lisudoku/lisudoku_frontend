import {
  difference, differenceWith, flatten, flattenDeep, isEmpty, isEqual, map, max, min, range, sortBy, sumBy, times, uniq, uniqWith, values,
} from 'lodash-es'
import {
  CellMarks, CellPosition, ConstraintType, FixedNumber, Grid, KropkiDotType, Region, SudokuConstraints, SudokuVariant,
} from 'src/types/sudoku'
import { CONSTRAINT_TYPE_VARIANTS, GRID_SIZES } from './constants'

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

type CountMap = {
  [key: number]: number
}

const getRowCells = (row: number, gridSize: number): CellPosition[] => (
  times(gridSize, col => ({ row, col }))
)
const getColCells = (col: number, gridSize: number): CellPosition[] => (
  times(gridSize, row => ({ row, col }))
)
const getPrimaryDiagonalCells = (gridSize: number): CellPosition[] => (
  times(gridSize, index => ({ row: index, col: index }))
)
const getSecondaryDiagonalCells = (gridSize: number): CellPosition[] => (
  times(gridSize, index => ({ row: index, col: gridSize - 1 - index }))
)

const isCompletelyEmpty = (cell: CellPosition, valuesGrid: Grid, cellMarks: CellMarks[][]) => {
  const value = valuesGrid[cell.row][cell.col]
  const currentCellMarks = cellMarks[cell.row][cell.col]
  return !value && isEmpty(currentCellMarks?.cornerMarks) && isEmpty(currentCellMarks?.centerMarks)
}

enum CheckType {
  Equal,
  NotEqual,
  KropkiConsecutive,
  KropkiDouble,
  KropkiNegative,
}

const validPeersForValue = (value: number, checkType: CheckType, gridSize: number) => {
  switch (checkType) {
    case CheckType.Equal:
      return range(1, gridSize + 1).filter(x => x !== value)
    case CheckType.NotEqual:
      return [value]
    case CheckType.KropkiConsecutive: {
      const values = []
      if (value > 1) {
        values.push(value - 1)
      }
      if (value + 1 <= gridSize) {
        values.push(value + 1)
      }
      return values
    }
    case CheckType.KropkiDouble: {
      const values = []
      if (value % 2 === 0) {
        values.push(value / 2)
      }
      if (value * 2 <= gridSize) {
        values.push(value * 2)
      }
      return values
    }
    case CheckType.KropkiNegative: {
      const values = range(1, gridSize + 1).filter(x => {
        const peerValue = x
        return value * 2 !== peerValue &&
               peerValue * 2 !== value &&
               value + 1 !== peerValue &&
               peerValue + 1 !== value
      })
      return values
    }
  }
}

const getExtendedConstraintRegions = (constraints: SudokuConstraints): CellPosition[][] => {
  const { gridSize } = constraints
  const regions: CellPosition[][] = []
  for (let row = 0; row < gridSize; row++) {
    regions.push(getRowCells(row, gridSize))
  }
  for (let col = 0; col < gridSize; col++) {
    regions.push(getColCells(col, gridSize))
  }
  regions.push(...constraints.regions)
  regions.push(...constraints.extraRegions ?? [])
  regions.push(...map(constraints.killerCages, 'region'))
  if (constraints.primaryDiagonal) {
    regions.push(getPrimaryDiagonalCells(gridSize))
  }
  if (constraints.secondaryDiagonal) {
    regions.push(getSecondaryDiagonalCells(gridSize))
  }
  regions.push(...(constraints.thermos ?? []))
  regions.push(...(constraints.renbans ?? []))

  return regions
}

const addToErrorSet = (errorsSet: CellMarkSets, extraValue: number) => {
  if (errorsSet.cornerMarks === undefined) {
    errorsSet.cornerMarks = new Set()
  }
  errorsSet.cornerMarks!.add(extraValue)
  // Add the same thing to center marks... maybe we should not do it separately
  if (errorsSet.centerMarks === undefined) {
    errorsSet.centerMarks = new Set()
  }
  errorsSet.centerMarks!.add(extraValue)
}

const checkErrorsBetween = (
  cell: CellPosition, peer: CellPosition, valuesGrid: Grid, cellMarks: CellMarks[][], checkType: CheckType,
  gridErrors: boolean[][], cellMarksErrors: CellMarkSets[][]
) => {
  const value = valuesGrid[cell.row][cell.col]
  const cellMarkSet = cellMarks[cell.row][cell.col]
  const peerValue = valuesGrid[peer.row][peer.col]
  const peerCellMarkSet = cellMarks[peer.row][peer.col]
  const gridSize = gridErrors.length

  if (value && peerValue) {
    if (!validPeersForValue(value, checkType, gridSize).includes(peerValue)) {
      gridErrors[cell.row][cell.col] = true
      gridErrors[peer.row][peer.col] = true
    }
  } else if (value) {
    const extraValues = difference(peerCellMarkSet.cornerMarks, validPeersForValue(value, checkType, gridSize))
    for (const extraValue of extraValues) {
      addToErrorSet(cellMarksErrors[peer.row][peer.col], extraValue)
    }
  } else if (peerValue) {
    const extraValues = difference(cellMarkSet.cornerMarks, validPeersForValue(peerValue, checkType, gridSize))
    for (const extraValue of extraValues) {
      addToErrorSet(cellMarksErrors[cell.row][cell.col], extraValue)
    }
  }
}

export const computeErrors = (checkErrors: boolean, constraints: SudokuConstraints, grid?: Grid, cellMarks?: CellMarks[][]) => {
  const { gridSize, fixedNumbers } = constraints
  const gridErrors: boolean[][] = Array(gridSize).fill(null).map(() => Array(gridSize).fill(false))
  const cellMarksErrors: CellMarkSets[][] = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null).map(() => ({})))
  if (!checkErrors || !grid || !cellMarks) {
    return { gridErrors, cellMarksErrors }
  }

  const valuesGrid = computeFixedNumbersGrid(gridSize, fixedNumbers)
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      valuesGrid[row][col] ||= grid[row][col]
    }
  }

  const regions = getExtendedConstraintRegions(constraints)
  for (const region of regions) {
    const valueCounts: CountMap = {}
    for (const { row, col } of region) {
      const value = valuesGrid[row][col]
      if (!value) {
        continue
      }
      valueCounts[value] = (valueCounts[value] || 0) + 1
    }
    for (const { row, col } of region) {
      const value = valuesGrid[row][col]
      if (!value) {
        continue
      }
      if (valueCounts[value] > 1) {
        gridErrors[row][col] = true
      }
    }
    for (const { row, col } of region) {
      const value = valuesGrid[row][col]!
      if (value) {
        continue
      }
      for (const mark of flatten(values(cellMarks[row][col]))) {
        if (valueCounts[mark] && valueCounts[mark] > 0) {
          addToErrorSet(cellMarksErrors[row][col], mark)
        }
      }
    }
  }

  // Thermos
  for (const thermo of constraints.thermos ?? []) {
    let prevValue = 0
    let prevCell: CellPosition | null = null
    for (let cell of thermo) {
      const value = valuesGrid[cell.row][cell.col]
      if (value && value <= prevValue) {
        gridErrors[cell.row][cell.col] = true
        gridErrors[prevCell!.row][prevCell!.col] = true
      }
      if (value) {
        prevValue = value!
        prevCell = cell
      }
    }
  }

  // Arrows
  for (const arrow of constraints.arrows ?? []) {
    if (arrow.circleCells.some(cell => !valuesGrid[cell.row][cell.col])) {
      continue
    }
    let circleValue = 0
    for (const cell of sortBy(arrow.circleCells, ['row', 'col'])) {
      const value = valuesGrid[cell.row][cell.col]!
      circleValue = 10 * circleValue + value
    }
    const arrowSum = sumBy(arrow.arrowCells, cell => valuesGrid[cell.row][cell.col] ?? 0)
    const arrowFull = arrow.arrowCells.every(cell => valuesGrid[cell.row][cell.col])
    if (arrowSum > circleValue || (arrowFull && arrowSum !== circleValue)) {
      for (const { row, col } of [...arrow.circleCells, ...arrow.arrowCells]) {
        gridErrors[row][col] = true
      }
    }
  }

  // Renbans
  for (const renban of constraints.renbans ?? []) {
    if (renban.some(cell => !valuesGrid[cell.row][cell.col])) {
      continue
    }

    const values = renban.map(cell => valuesGrid[cell.row][cell.col])
    const maxValue = max(values)!
    const minValue = min(values)!

    if (maxValue - minValue + 1 !== renban.length) {
      for (const cell of renban) {
        gridErrors[cell.row][cell.col] = true
      }
    }
  }

  // Palindromes
  for (const palindrome of constraints.palindromes ?? []) {
    let left = 0
    let right = palindrome.length - 1
    while (left < right) {
      checkErrorsBetween(
        palindrome[left], palindrome[right], valuesGrid, cellMarks, CheckType.NotEqual, gridErrors, cellMarksErrors
      )
      left += 1
      right -= 1
    }
  }

  if (constraints.antiKnight) {
    const cells = getAllCells(gridSize)
    cells.forEach(cell => {
      if (isCompletelyEmpty(cell, valuesGrid, cellMarks)) {
        return
      }
      const peers = getKnightPeers(cell, gridSize)
      peers.forEach(peer => {
        if (isCompletelyEmpty(peer, valuesGrid, cellMarks)) {
          return
        }
        checkErrorsBetween(cell, peer, valuesGrid, cellMarks, CheckType.Equal, gridErrors, cellMarksErrors)
      })
    })
  }

  if (constraints.antiKing) {
    const cells = getAllCells(gridSize)
    cells.forEach(cell => {
      if (isCompletelyEmpty(cell, valuesGrid, cellMarks)) {
        return
      }
      const peers = getKingPeers(cell, gridSize)
      peers.forEach(peer => {
        if (isCompletelyEmpty(peer, valuesGrid, cellMarks)) {
          return
        }
        checkErrorsBetween(cell, peer, valuesGrid, cellMarks, CheckType.Equal, gridErrors, cellMarksErrors)
      })
    })
  }

  // Killer cages (region restriction is handled above)
  for (const killerCage of constraints.killerCages ?? []) {
    if (!killerCage.sum) {
      continue
    }
    const sum = sumBy(killerCage.region, cell => (
      valuesGrid[cell.row][cell.col]!
    ))
    if (sum > killerCage.sum) {
      for (const cell of killerCage.region) {
        gridErrors[cell.row][cell.col] = true
      }
    }
  }

  // Kropki
  for (const kropkiDot of constraints.kropkiDots ?? []) {
    const { cell1: cell, cell2: peer } = kropkiDot
    const checkType = kropkiDot.dotType === KropkiDotType.Consecutive ? CheckType.KropkiConsecutive : CheckType.KropkiDouble
    checkErrorsBetween(cell, peer, valuesGrid, cellMarks, checkType, gridErrors, cellMarksErrors)
  }

  if (constraints.kropkiNegative) {
    const gridToKropkiDots: CellPosition[][][] = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null).map(() => []))
    for (const kropkiDot of constraints.kropkiDots ?? []) {
      const { cell1, cell2 } = kropkiDot
      gridToKropkiDots[cell1.row][cell1.col].push(cell2)
      gridToKropkiDots[cell2.row][cell2.col].push(cell1)
    }
    const cells = getAllCells(gridSize)
    cells.forEach(cell => {
      if (isCompletelyEmpty(cell, grid, cellMarks)) {
        return
      }
      const peers = getAdjacentPeers(cell, gridSize)
      const dotPeers = gridToKropkiDots[cell.row][cell.col]
      const negativePeers = differenceWith(peers, dotPeers, isEqual)

      negativePeers.forEach((peer: CellPosition) => {
        if (isCompletelyEmpty(peer, grid, cellMarks)) {
          return
        }
        checkErrorsBetween(cell, peer, valuesGrid, cellMarks, CheckType.KropkiNegative, gridErrors, cellMarksErrors)
      })
    })
  }

  // Odd Even
  for (const cell of constraints.oddCells ?? []) {
    const value = valuesGrid[cell.row][cell.col]
    if (value && value % 2 !== 1) {
      gridErrors[cell.row][cell.col] = true
    }
  }
  for (const cell of constraints.evenCells ?? []) {
    const value = valuesGrid[cell.row][cell.col]
    if (value && value % 2 !== 0) {
      gridErrors[cell.row][cell.col] = true
    }
  }

  return { gridErrors, cellMarksErrors }
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

const KNIGHT_ROW_DELTA = [ 1, 2, -1, -2, 1, 2, -1, -2 ]
const KNIGHT_COL_DELTA = [ 2, 1, 2, 1, -2, -1, -2, -1 ]
const getKnightPeers = (cell: CellPosition, gridSize: number) => {
  const peers: CellPosition[] = []
  times(8, dir => {
    const peer = {
      row: cell.row + KNIGHT_ROW_DELTA[dir],
      col: cell.col + KNIGHT_COL_DELTA[dir],
    }
    if (peer.row < 0 || peer.row >= gridSize || peer.col < 0 || peer.col >= gridSize) {
      return
    }
    peers.push(peer)
  })
  return peers
}

const KING_ROW_DELTA = [ -1, -1, -1, 0, 0, 1, 1, 1 ]
const KING_COL_DELTA = [ -1, 0, 1, -1, 1, -1, 0, 1 ]
const getKingPeers = (cell: CellPosition, gridSize: number) => {
  const peers: CellPosition[] = []
  times(8, dir => {
    const peer = {
      row: cell.row + KING_ROW_DELTA[dir],
      col: cell.col + KING_COL_DELTA[dir],
    }
    if (peer.row < 0 || peer.row >= gridSize || peer.col < 0 || peer.col >= gridSize) {
      return
    }
    peers.push(peer)
  })
  return peers
}

const ADJACENT_ROW_DELTA = [ 0, 0, 1, -1 ]
const ADJACENT_COL_DELTA = [ 1, -1, 0, 0 ]
const getAdjacentPeers = (cell: CellPosition, gridSize: number) => {
  const peers: CellPosition[] = []
  times(4, dir => {
    const peer = {
      row: cell.row + ADJACENT_ROW_DELTA[dir],
      col: cell.col + ADJACENT_COL_DELTA[dir],
    }
    if (peer.row < 0 || peer.row >= gridSize || peer.col < 0 || peer.col >= gridSize) {
      return
    }
    peers.push(peer)
  })
  return peers
}

// TODO: this is also a duplicate between wasm and js
export const getAreaCells = (area: any, constraints: SudokuConstraints): CellPosition[] => {
  if (area.Row !== undefined) {
    return times(constraints.gridSize, col => ({
      row: area.Row,
      col,
    }))
  } else if (area.Column !== undefined) {
    return times(constraints.gridSize, row => ({
      row,
      col: area.Column,
    }))
  } else if (area.Region !== undefined) {
    // Assume all extra regions contain grid_size cells
    if (area.Region < constraints.regions.length) {
      return constraints.regions[area.Region]
    } else {
      return constraints.extraRegions![area.Region - constraints.regions.length]
    }
  } else if (area.Palindrome !== undefined) {
    return constraints.palindromes?.[area.Palindrome] ?? []
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
  return []
}

export const getCellPeers = (constraints: SudokuConstraints, cell: CellPosition): CellPosition[] => {
  const regions = getExtendedConstraintRegions(constraints)

  const cellRegions = regions.filter(region => region.find(regionCell => isEqual(regionCell, cell)))
  if (constraints.antiKnight) {
    cellRegions.push(getKnightPeers(cell, constraints.gridSize))
  }
  if (constraints.antiKing) {
    cellRegions.push(getKingPeers(cell, constraints.gridSize))
  }

  const palindromePeers = []
  for (const palindrome of constraints.palindromes ?? []) {
    const index = palindrome.findIndex(pCell => isEqual(pCell, cell))
    if (2 * index + 1 !== palindrome.length) {
      palindromePeers.push(palindrome[palindrome.length - 1 - index])
    }
  }
  cellRegions.push(palindromePeers)

  return uniqWith(flatten(cellRegions), isEqual)
}

const getVariant = (constraintTypes: ConstraintType[]): SudokuVariant => {
  const variants = uniq(
    constraintTypes.map(constraintType => CONSTRAINT_TYPE_VARIANTS[constraintType])
  )

  if (variants.length > 1) {
    return SudokuVariant.Mixed
  } else if (variants.length === 1) {
    return variants[0]
  } else {
    return SudokuVariant.Classic
  }
}

export interface ConstraintsCheckResult {
  variant: SudokuVariant
  constraintTypes: ConstraintType[]
}

export const detectConstraints = (constraints: SudokuConstraints | null): ConstraintsCheckResult => {
  if (constraints === null) {
    return {
      variant: SudokuVariant.Classic,
      constraintTypes: [],
    }
  }

  const constraintTypes: ConstraintType[] = []
  if (!isEqual(constraints.regions, ensureDefaultRegions(constraints.gridSize))) {
    constraintTypes.push(ConstraintType.Regions)
  }
  if (!isEmpty(constraints.extraRegions)) {
    constraintTypes.push(ConstraintType.ExtraRegions)
  }
  if (!isEmpty(constraints.thermos)) {
    constraintTypes.push(ConstraintType.Thermo)
  }
  if (!isEmpty(constraints.arrows)) {
    constraintTypes.push(ConstraintType.Arrow)
  }
  if (!isEmpty(constraints.renbans)) {
    constraintTypes.push(ConstraintType.Renban)
  }
  if (!isEmpty(constraints.palindromes)) {
    constraintTypes.push(ConstraintType.Palindrome)
  }
  if (constraints.primaryDiagonal) {
    constraintTypes.push(ConstraintType.PrimaryDiagonal)
  }
  if (constraints.secondaryDiagonal) {
    constraintTypes.push(ConstraintType.SecondaryDiagonal)
  }
  if (constraints.antiKnight) {
    constraintTypes.push(ConstraintType.AntiKnight)
  }
  if (constraints.antiKing) {
    constraintTypes.push(ConstraintType.AntiKing)
  }
  if (!isEmpty(constraints.killerCages)) {
    constraintTypes.push(ConstraintType.KillerCage)
  }
  if (constraints.kropkiDots?.some(({ dotType }) => dotType === KropkiDotType.Consecutive)) {
    constraintTypes.push(ConstraintType.KropkiConsecutive)
  }
  if (constraints.kropkiDots?.some(({ dotType }) => dotType === KropkiDotType.Double)) {
    constraintTypes.push(ConstraintType.KropkiDouble)
  }
  if (constraints.kropkiNegative) {
    constraintTypes.push(ConstraintType.KropkiNegative)
  }
  if (!isEmpty(constraints.oddCells)) {
    constraintTypes.push(ConstraintType.Odd)
  }
  if (!isEmpty(constraints.evenCells)) {
    constraintTypes.push(ConstraintType.Even)
  }
  if (constraints.topBottom) {
    constraintTypes.push(ConstraintType.TopBottom)
  }

  const variant = getVariant(constraintTypes)

  return {
    variant,
    constraintTypes,
  }
}
