import _ from 'lodash'
import {
  CellNotes, CellPosition, FixedNumber, Grid, KropkiDotType, Region, SudokuConstraints,
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

export const regionGridToRegions = (gridSize: number, regionGrid: Grid): Region[] => {
  const regions: Region[] = []
  _.times(gridSize, row => {
    _.times(gridSize, col => {
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

export const gridStringToFixedNumbers: (gridString: string) => FixedNumber[] = (gridString: string) => {
  const grid = gridStringToGrid(gridString)
  return gridToFixedNumbers(grid)
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

const getRowCells = (row: number, gridSize: number) => (
  _.times(gridSize, col => ({ row, col }))
)
const getColCells = (col: number, gridSize: number) => (
  _.times(gridSize, row => ({ row, col }))
)
const getPrimaryDiagonalCells = (gridSize: number) => (
  _.times(gridSize, index => ({ row: index, col: index }))
)
const getSecondaryDiagonalCells = (gridSize: number) => (
  _.times(gridSize, index => ({ row: index, col: gridSize - 1 - index }))
)

const isCompletelyEmpty = (cell: CellPosition, valuesGrid: Grid, notes: CellNotes[][]) => {
  const value = valuesGrid[cell.row][cell.col]
  const noteSet = notes[cell.row][cell.col]
  return !value && noteSet.length === 0
}

enum CheckType {
  Equal,
  KropkiConsecutive,
  KropkiDouble,
  KropkiNegative,
}

const validPeersForValue = (value: number, checkType: CheckType, gridSize: number) => {
  switch (checkType) {
    case CheckType.Equal:
      return _.range(1, gridSize + 1).filter(x => x !== value)
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
      const values = _.range(1, gridSize + 1).filter(x => {
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

const checkErrorsBetween = (
  cell: CellPosition, peer: CellPosition, valuesGrid: Grid, notes: CellNotes[][], checkType: CheckType,
  gridErrors: boolean[][], noteErrors: Set<number>[][]
) => {
  const value = valuesGrid[cell.row][cell.col]
  const noteSet = notes[cell.row][cell.col]
  const peerValue = valuesGrid[peer.row][peer.col]
  const peerNoteSet = notes[peer.row][peer.col]
  const gridSize = gridErrors.length

  if (value && peerValue) {
    if (!validPeersForValue(value, checkType, gridSize).includes(peerValue)) {
      gridErrors[cell.row][cell.col] = true
      gridErrors[peer.row][peer.col] = true
    }
  } else if (value) {
    const extraValues = _.difference(peerNoteSet, validPeersForValue(value, checkType, gridSize))
    for (const extraValue of extraValues) {
      noteErrors[peer.row][peer.col].add(extraValue)
    }
  } else if (peerValue) {
    const extraValues = _.difference(noteSet, validPeersForValue(peerValue, checkType, gridSize))
    for (const extraValue of extraValues) {
      noteErrors[cell.row][cell.col].add(extraValue)
    }
  }
}

// TODO: deduplicate code by returning offending cells from the wasm checker
export const computeErrors = (checkErrors: boolean, constraints: SudokuConstraints, grid?: Grid, notes?: CellNotes[][]) => {
  const { gridSize, fixedNumbers } = constraints
  const gridErrors: boolean[][] = Array(gridSize).fill(null).map(() => Array(gridSize).fill(false))
  const noteErrors: Set<number>[][] = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null).map(() => new Set()))
  if (!checkErrors || !grid || !notes) {
    return { gridErrors, noteErrors }
  }

  const valuesGrid = computeFixedNumbersGrid(gridSize, fixedNumbers)
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      valuesGrid[row][col] ||= grid[row][col]
    }
  }

  const regions = []
  for (let row = 0; row < gridSize; row++) {
    regions.push(getRowCells(row, gridSize))
  }
  for (let col = 0; col < gridSize; col++) {
    regions.push(getColCells(col, gridSize))
  }
  regions.push(...constraints.regions)
  regions.push(...constraints.extraRegions ?? [])
  regions.push(..._.map(constraints.killerCages, 'region'))
  if (constraints.primaryDiagonal) {
    regions.push(getPrimaryDiagonalCells(gridSize))
  }
  if (constraints.secondaryDiagonal) {
    regions.push(getSecondaryDiagonalCells(gridSize))
  }
  regions.push(...(constraints.thermos ?? []))

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
      for (const note of notes[row][col]) {
        if (valueCounts[note] && valueCounts[note] > 0) {
          noteErrors[row][col].add(note)
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
    for (const cell of _.sortBy(arrow.circleCells, ['row', 'col'])) {
      const value = valuesGrid[cell.row][cell.col]!
      circleValue = 10 * circleValue + value
    }
    const arrowSum = _.sumBy(arrow.arrowCells, cell => valuesGrid[cell.row][cell.col] ?? 0)
    const arrowFull = arrow.arrowCells.every(cell => valuesGrid[cell.row][cell.col])
    if (arrowSum > circleValue || (arrowFull && arrowSum !== circleValue)) {
      for (const { row, col } of [...arrow.circleCells, ...arrow.arrowCells]) {
        gridErrors[row][col] = true
      }
    }
  }

  if (constraints.antiKnight) {
    const cells = getAllCells(gridSize)
    cells.forEach(cell => {
      if (isCompletelyEmpty(cell, valuesGrid, notes)) {
        return
      }
      const peers = getKnightPeers(cell, gridSize)
      peers.forEach(peer => {
        if (isCompletelyEmpty(peer, valuesGrid, notes)) {
          return
        }
        checkErrorsBetween(cell, peer, valuesGrid, notes, CheckType.Equal, gridErrors, noteErrors)
      })
    })
  }

  if (constraints.antiKing) {
    const cells = getAllCells(gridSize)
    cells.forEach(cell => {
      if (isCompletelyEmpty(cell, valuesGrid, notes)) {
        return
      }
      const peers = getKingPeers(cell, gridSize)
      peers.forEach(peer => {
        if (isCompletelyEmpty(peer, valuesGrid, notes)) {
          return
        }
        checkErrorsBetween(cell, peer, valuesGrid, notes, CheckType.Equal, gridErrors, noteErrors)
      })
    })
  }

  // Killer cages (region restriction is handled above)
  for (const killerCage of constraints.killerCages ?? []) {
    if (!killerCage.sum) {
      continue
    }
    const sum = _.sumBy(killerCage.region, cell => (
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
    checkErrorsBetween(cell, peer, valuesGrid, notes, checkType, gridErrors, noteErrors)
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
      if (isCompletelyEmpty(cell, grid, notes)) {
        return
      }
      const peers = getAdjacentPeers(cell, gridSize)
      const dotPeers = gridToKropkiDots[cell.row][cell.col]
      const negativePeers = _.differenceWith(peers, dotPeers, _.isEqual)

      negativePeers.forEach((peer: CellPosition) => {
        if (isCompletelyEmpty(peer, grid, notes)) {
          return
        }
        checkErrorsBetween(cell, peer, valuesGrid, notes, CheckType.KropkiNegative, gridErrors, noteErrors)
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

  return { gridErrors, noteErrors }
}

export const getAllCells = (gridSize: number) => {
  const cells: CellPosition[] = _.flatten(
    _.times(gridSize, rowIndex => (
      _.times(gridSize, colIndex => (
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
  _.times(8, dir => {
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
  _.times(8, dir => {
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
  _.times(4, dir => {
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
export const getAreaCells = (area: any, constraints: SudokuConstraints) => {
  if (area.Row !== undefined) {
    return _.times(constraints.gridSize, col => ({
      row: area.Row,
      col,
    }))
  } else if (area.Column !== undefined) {
    return _.times(constraints.gridSize, row => ({
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
  } else if (area === 'PrimaryDiagonal') {
    return _.times(constraints.gridSize, idx => ({
      row: idx,
      col: idx,
    }))
  } else if (area === 'SecondaryDiagonal') {
    return _.times(constraints.gridSize, idx => ({
      row: idx,
      col: constraints.gridSize - 1 - idx,
    }))
  }
  return []
}
