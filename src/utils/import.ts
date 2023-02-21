import _ from 'lodash'
import { AxiosError } from 'axios'
import { FixedNumber, KropkiDot, KropkiDotType, Puzzle, Region, SudokuConstraints } from 'src/types/sudoku'
import { fetchPuzzleByPublicId } from './apiService'
import { decompressFromBase64, compressToBase64 } from 'lz-string'
import { ensureDefaultRegions, regionGridToRegions, regionsToRegionGrid } from './sudoku'
import { GRID_SIZES } from './constants'
import { defaultConstraints } from 'src/reducers/builder'
const jcc = require('json-case-convertor')

const FPUZZLES_UNIMPLEMENTED_CONSTRAINTS = [
  'antiking', 'disjointgroups', 'arrow', 'littlekillersum', 'minimum', 'maximum',
  'rowindexer', 'columnindexer', 'boxindexer', 'palindrome', 'renban', 'whispers', 'regionsumline',
  'xv', 'clone', 'quadruple', 'betweenline', 'sandwichsum', 'xsum', 'skyscraper', 'entropicline',
  'disabledlogic', 'truecandidatesoptions', 'cage', 'text',
]

enum SourceType {
  LisudokuUrl = 'lisudoku-url',
  LisudokuInline = 'lisudoku-inline',
  Fpuzzles = 'f-puzzles',
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
  } else {
    return null
  }
}

const isInlineData = (data: string) => (
  !_.isEmpty(decompressFromBase64(data))
)

export const importPuzzle = async (url: string): Promise<ImportResult> => {
  const source = detectSource(url)

  if (source === null) {
    return {
      error: true,
      message: "Invalid URL. Couldn't detect source.",
    }
  }

  switch (source) {
    case SourceType.LisudokuUrl: return importLisudokuPuzzle(url)
    case SourceType.LisudokuInline: return importLisudokuInline(url)
    case SourceType.Fpuzzles: return importFpuzzlesPuzzle(url)
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
      puzzle = jcc.camelCaseKeys(data)
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
  const filteredConstraints = JSON.parse(constraintsStr!)
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
  const data = JSON.parse(decodedString!)

  const ignoredConstraints = []

  const gridSize = data.size
  if (!GRID_SIZES.includes(gridSize)) {
    return {
      error: true,
      message: `[f-puzzles] Invalid grid size ${gridSize}.`,
    }
  }

  const fixedNumbers: FixedNumber[] = []
  _.times(gridSize, row => {
    _.times(gridSize, col => {
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
  _.times(gridSize, row => {
    _.times(gridSize, col => {
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
    thermos: _.flatMap((data.thermometer ?? []), ({ lines }: { lines: string[][] }) => (
      lines.map((cells: string[]) => mapCellStringArray(cells))
    )),
    primaryDiagonal: !!data['diagonal-'],
    secondaryDiagonal: !!data['diagonal+'],
    antiKnight: !!data.antiknight,
    killerCages: (data.killercage ?? []).map(({ cells, value }: { cells: string[], value: string }) => ({
      sum: value === undefined ? null : Number.parseInt(value),
      region: mapCellStringArray(cells),
    })),
    kropkiDots,
    kropkiNegative: !_.isEmpty(data.negative) && data.nonconsecutive,
    oddCells: (data.odd ?? []).map(({ cell }: { cell: string }) => cellStringToObject(cell)),
    evenCells: (data.even ?? []).map(({ cell }: { cell: string }) => cellStringToObject(cell)),
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

export const exportToLisudoku = (constraints: SudokuConstraints) => {
  const filteredConstraints = _.omitBy(
    constraints,
    key => !_.isNumber(key) && (key === false || _.isEmpty(key))
  )
  if (_.isEqual(filteredConstraints.regions, ensureDefaultRegions(constraints.gridSize))) {
    delete filteredConstraints.regions
  }
  const constraintsStr = JSON.stringify(filteredConstraints)
  const encodedData = compressToBase64(constraintsStr)
  return encodedData
}
