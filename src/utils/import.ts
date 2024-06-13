import { useLocation } from 'react-router-dom'
import { flatMap, isBoolean, isEmpty, isEqual, isNumber, omitBy, times } from 'lodash-es'
import { AxiosError } from 'axios'
import { FixedNumber, KropkiDot, KropkiDotType, Puzzle, Region, SudokuConstraints, SudokuVariant } from 'src/types/sudoku'
import { fetchPuzzleByPublicId } from './apiService'
import { decompressFromBase64, compressToBase64 } from 'lz-string'
import { detectVariant, ensureDefaultRegions, fixedNumbersToGridString, gridSizeFromString, gridStringToFixedNumbers, isGridString, regionGridToRegions, regionsToRegionGrid } from './sudoku'
import { GRID_SIZES } from './constants'
import { defaultConstraints } from 'src/reducers/builder'
import { camelCaseKeys } from './json'

const FPUZZLES_UNIMPLEMENTED_CONSTRAINTS = [
  'disjointgroups', 'littlekillersum', 'minimum', 'maximum',
  'rowindexer', 'columnindexer', 'boxindexer', 'palindrome', 'renban', 'whispers', 'regionsumline',
  'xv', 'clone', 'quadruple', 'betweenline', 'sandwichsum', 'xsum', 'skyscraper', 'entropicline',
  'disabledlogic', 'truecandidatesoptions', 'cage', 'text',
]

enum SourceType {
  LisudokuUrl = 'lisudoku-url',
  LisudokuInline = 'lisudoku-inline',
  Fpuzzles = 'f-puzzles',
  GridString = 'grid-string',
}

export type ImportResult = {
  error: boolean
  alert?: boolean
  message: string
  constraints?: SudokuConstraints
}

const LISUDOKU_REGEX = /(?:https:\/\/(?:www\.)?lisudoku\.xyz|http:\/\/localhost:\d+)\/p\/(.+)/
const FPUZZLES_REGEX = /https:\/\/(?:www\.)?f-puzzles\.com\/\?load=(.+)/

const detectSource = (url: string) => {
  if (LISUDOKU_REGEX.test(url)) {
    return SourceType.LisudokuUrl
  } else if (FPUZZLES_REGEX.test(url)) {
    return SourceType.Fpuzzles
  } else if (isInlineData(url)) {
    return SourceType.LisudokuInline
  } else if (isGridString(url)) {
    return SourceType.GridString
  } else {
    return null
  }
}

const isInlineData = (data: string) => (
  !isEmpty(decompressFromBase64(data))
)

export const importPuzzle = async (url: string): Promise<ImportResult> => {
  const source = detectSource(url)

  if (source === null) {
    return {
      error: true,
      message: "Invalid puzzle data.",
    }
  }

  switch (source) {
    case SourceType.LisudokuUrl: return importLisudokuPuzzle(url)
    case SourceType.LisudokuInline: return importLisudokuInline(url)
    case SourceType.Fpuzzles: return importFpuzzlesPuzzle(url)
    case SourceType.GridString: return importGridString(url)
  }
}

const importLisudokuPuzzle = async (url: string): Promise<ImportResult> => {
  const match = url.match(LISUDOKU_REGEX)
  if (!match) {
    return {
      error: false,
      message: "[lisudoku] Couldn't parse puzzle id.",
    }
  }
  const id = match[1]

  let puzzle: Puzzle | undefined
  let status
  await (fetchPuzzleByPublicId(id, null)
    .then((data: Puzzle) => {
      puzzle = camelCaseKeys(data)
    })
    .catch((e: AxiosError) => {
      status = e.response?.status
    }))

  if (puzzle === undefined) {
    let message
    if (status === 404) {
      message = `[lisudoku] Puzzle with id ${id} not found.`
    } else {
      message = `[lisudoku] Request for puzzle with id ${id} failed.`
    }
    return {
      error: true,
      message,
    }
  }

  return {
    error: false,
    alert: false,
    message: 'Puzzle imported successfully',
    constraints: puzzle.constraints,
  }
}

const importLisudokuInline = (encodedData: string): ImportResult => {
  const constraintsStr = decompressFromBase64(encodedData)
  if (constraintsStr === null) {
    return {
      error: true,
      message: '[lisudoku] Error while parsing inline data',
    }
  }
  const filteredConstraints = camelCaseKeys(JSON.parse(constraintsStr!))
  const constraints = {
    ...defaultConstraints(filteredConstraints.gridSize),
    ...filteredConstraints,
  }

  return {
    error: false,
    alert: false,
    message: 'Puzzle imported successfully',
    constraints,
  }
}

const importGridString = (gridString: string): ImportResult => {
  const gridSize = gridSizeFromString(gridString)
  const constraints: SudokuConstraints = {
    ...defaultConstraints(gridSize),
    fixedNumbers: gridStringToFixedNumbers(gridString),
  }
  return {
    error: false,
    alert: false,
    message: 'Grid string imported successfully',
    constraints,
  }
}

const importFpuzzlesPuzzle = (url: string): ImportResult => {
  const match = url.match(FPUZZLES_REGEX)
  if (!match) {
    return {
      error: false,
      message: "[f-puzzles] Couldn't parse puzzle id.",
    }
  }
  const encodedString = match[1]
  const decodedString = decompressFromBase64(encodedString)

  let data: any
  try {
    data = JSON.parse(decodedString!)
  } catch (e) {
    return {
      error: true,
      message: `[f-puzzles] Invalid data.`,
    }
  }

  const ignoredConstraints = []

  const gridSize = data.size
  if (!GRID_SIZES.includes(gridSize)) {
    return {
      error: true,
      message: `[f-puzzles] Invalid grid size ${gridSize}.`,
    }
  }

  const fixedNumbers: FixedNumber[] = []
  times(gridSize, row => {
    times(gridSize, col => {
      const cell = data.grid[row][col]
      if (cell.value) {
        const fixedNumber: FixedNumber = {
          position: {
            row,
            col,
          },
          value: cell.value,
        }
        fixedNumbers.push(fixedNumber)
      }
    })
  })

  const defaultRegions = ensureDefaultRegions(gridSize)
  const regionGrid = regionsToRegionGrid(gridSize, defaultRegions)
  times(gridSize, row => {
    times(gridSize, col => {
      regionGrid[row][col] -= 1
      const regionIndex = data.grid[row][col].region
      if (regionIndex !== undefined) {
        regionGrid[row][col] = regionIndex
      }
    })
  })
  const regions: Region[] = regionGridToRegions(gridSize, regionGrid)

  const kropkiDots: KropkiDot[] = []
  for (const { cells, value } of data.difference ?? []) {
    if (value !== undefined) {
      ignoredConstraints.push('difference')
      continue
    }
    const dot: KropkiDot = {
      dotType: KropkiDotType.Consecutive,
      cell1: cellStringToObject(cells[0]),
      cell2: cellStringToObject(cells[1]),
    }
    kropkiDots.push(dot)
  }
  for (const { cells, value } of data.ratio ?? []) {
    if (value !== undefined) {
      ignoredConstraints.push('ratio')
      continue
    }
    const dot: KropkiDot = {
      dotType: KropkiDotType.Double,
      cell1: cellStringToObject(cells[0]),
      cell2: cellStringToObject(cells[1]),
    }
    kropkiDots.push(dot)
  }

  ignoredConstraints.push(
    ...FPUZZLES_UNIMPLEMENTED_CONSTRAINTS.filter(field => data[field] !== undefined)
  )

  const constraints: SudokuConstraints = {
    gridSize: gridSize,
    fixedNumbers,
    regions,
    extraRegions: (data.extraregion ?? []).map(({ cells }: { cells: string[] }) => (
      mapCellStringArray(cells)
    )),
    thermos: flatMap((data.thermometer ?? []), ({ lines }: { lines: string[][] }) => (
      lines.map((cells: string[]) => mapCellStringArray(cells))
    )),
    arrows: (data.arrow ?? []).map(({ cells, lines }: { cells: string[], lines: string[][] }) => ({
      circleCells: cells.map(cellStringToObject),
      // TODO: multiple lines not implemented
      arrowCells: lines[0].slice(1).map(cellStringToObject),
    })),
    primaryDiagonal: !!data['diagonal-'],
    secondaryDiagonal: !!data['diagonal+'],
    antiKnight: !!data.antiknight,
    antiKing: !!data.antiking,
    killerCages: (data.killercage ?? []).map(({ cells, value }: { cells: string[], value: string }) => ({
      sum: value === undefined ? null : Number.parseInt(value),
      region: mapCellStringArray(cells),
    })),
    kropkiDots,
    kropkiNegative: !isEmpty(data.negative) && data.nonconsecutive,
    oddCells: (data.odd ?? []).map(({ cell }: { cell: string }) => cellStringToObject(cell)),
    evenCells: (data.even ?? []).map(({ cell }: { cell: string }) => cellStringToObject(cell)),
    topBottom: false,
    // TODO: find f-puzzle with renban
    // renbans: data.renban
  }

  let message = 'Puzzle imported'
  let alert = false
  if (ignoredConstraints.length > 0) {
    message += ', but ignored some constraints: ' + ignoredConstraints.join(', ')
    alert = true
  } else {
    message += ' successfully'
  }

  return {
    error: false,
    alert,
    message,
    constraints,
  }
}

const cellStringToObject = (cell: string) => ({
  row: Number.parseInt(cell[1]) - 1,
  col: Number.parseInt(cell[3]) - 1,
})

const mapCellStringArray = (cells: string[]) => (
  cells.map((cell: string) => cellStringToObject(cell))
)

const encodeConstraints = (constraints: SudokuConstraints) => {
  const variant = detectVariant(constraints)
  if (variant === SudokuVariant.Classic) {
    return fixedNumbersToGridString(constraints.gridSize, constraints.fixedNumbers)
  }
  const filteredConstraints = omitBy(
    constraints,
    value => !isNumber(value) &&
             (value === false || (!isBoolean(value) && isEmpty(value)))
  )
  if (isEqual(filteredConstraints.regions, ensureDefaultRegions(constraints.gridSize))) {
    delete filteredConstraints.regions
  }
  const constraintsStr = JSON.stringify(filteredConstraints)
  const encodedData = compressToBase64(constraintsStr)
  return encodedData
}

export const exportToLisudokuSolver = (constraints: SudokuConstraints) => {
  const encodedConstraints = encodeConstraints(constraints!)
  const params = new URLSearchParams({ import: encodedConstraints }).toString()
  return `${window.location.origin}/solver?${params}`
}

export const exportToLisudokuPuzzle = (constraints: SudokuConstraints) => {
  const encodedConstraints = encodeConstraints(constraints!)
  const params = new URLSearchParams({ import: encodedConstraints }).toString()
  return `${window.location.origin}/e?${params}`
}

export const useImportParam = (paramName: string = 'import') => {
  const { search } = useLocation()
  const importParam = new URLSearchParams(search).get(paramName)
  // Dirty hack for f-puzzles
  const importData = importParam?.replaceAll(' ', '+')

  return importData
}
