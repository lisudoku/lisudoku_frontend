import _ from 'lodash'
import {
  CellPosition, FixedNumber, Grid, KropkiDotType, Region, SudokuConstraints,
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

// TODO: refactor this to remove duplicate code
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

  // Rows
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

  // Columns
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

  // Regions
  const allRegions = [
    ...constraints.regions,
    ...constraints.killerCages.map(cage => cage.region),
  ]
  for (const region of allRegions) {
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

  // Thermos
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

  if (constraints.primaryDiagonal) {
    const valueCounts: CountMap = {}
    for (let index = 0; index < gridSize; index++) {
      const value = valuesGrid[index][index]
      valueCounts[value!] ||= 0
      valueCounts[value!] += 1
    }
    for (let index = 0; index < gridSize; index++) {
      const value = valuesGrid[index][index]
      if (valueCounts[value!] > 1) {
        errorGrid[index][index] = true
      }
    }
  }

  if (constraints.secondaryDiagonal) {
    const valueCounts: CountMap = {}
    for (let index = 0; index < gridSize; index++) {
      const value = valuesGrid[index][gridSize - 1 - index]
      valueCounts[value!] ||= 0
      valueCounts[value!] += 1
    }
    for (let index = 0; index < gridSize; index++) {
      const value = valuesGrid[index][gridSize - 1 - index]
      if (valueCounts[value!] > 1) {
        errorGrid[index][gridSize - 1 - index] = true
      }
    }
  }

  if (constraints.antiKnight) {
    const cells = getAllCells(gridSize)
    cells.forEach(cell => {
      const value = valuesGrid[cell.row][cell.col]
      if (!value) {
        return
      }
      const peers = getKnightPeers(cell, gridSize)
      peers.forEach(peer => {
        const peerValue = valuesGrid[peer.row][peer.col]
        if (value !== peerValue) {
          return
        }
        errorGrid[cell.row][cell.col] = true
        errorGrid[peer.row][peer.col] = true
      })
    })
  }

  // Killer cages (region restriction is handled above)
  for (const killerCage of constraints.killerCages) {
    if (!killerCage.sum) {
      continue
    }
    const sum = _.sumBy(killerCage.region, cell => (
      valuesGrid[cell.row][cell.col]
    ))
    if (sum > killerCage.sum) {
      for (const cell of killerCage.region) {
        errorGrid[cell.row][cell.col] = true
      }
    }
  }

  // Kropki
  for (const kropkiDot of constraints.kropkiDots) {
    let { row: row1, col: col1 } = kropkiDot.cell1
    let { row: row2, col: col2 } = kropkiDot.cell2
    let value1 = valuesGrid[row1][col1]
    let value2 = valuesGrid[row2][col2]
    if (!value1 || !value2) {
      continue
    }
    if (value1 > value2) {
      [ value1, value2 ] = [ value2, value1 ]
    }
    if ((kropkiDot.dotType === KropkiDotType.Consecutive && value1 + 1 !== value2) ||
        (kropkiDot.dotType === KropkiDotType.Double && value1 * 2 !== value2)) {
      errorGrid[row1][col1] = true
      errorGrid[row2][col2] = true
    }
  }
  if (constraints.kropkiNegative) {
    const gridToKropkiDots: CellPosition[][][] = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null).map(() => []))
    for (const kropkiDot of constraints.kropkiDots) {
      const { cell1, cell2 } = kropkiDot
      gridToKropkiDots[cell1.row][cell1.col].push(cell2)
      gridToKropkiDots[cell2.row][cell2.col].push(cell1)
    }
    const cells = getAllCells(gridSize)
    cells.forEach(cell => {
      const value = valuesGrid[cell.row][cell.col]
      if (!value) {
        return
      }
      const peers = getAdjacentPeers(cell, gridSize)
      const dotPeers = gridToKropkiDots[cell.row][cell.col]
      const negativePeers = _.differenceWith(peers, dotPeers, _.isEqual)

      negativePeers.forEach((peer: CellPosition) => {
        const peerValue = valuesGrid[peer.row][peer.col]
        if (!peerValue) {
          return
        }
        if (value + 1 === peerValue ||
            peerValue + 1 === value ||
            value * 2 === peerValue ||
            peerValue * 2 === value) {
          errorGrid[cell.row][cell.col] = true
          errorGrid[peer.row][peer.col] = true
        }
      })
    })
  }

  return errorGrid
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
