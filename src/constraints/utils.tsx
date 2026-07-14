import { CellPosition, Region, SudokuConstraints } from 'lisudoku-solver'
import { CellMarks, ConstraintType, Grid, SudokuVariant } from 'src/types/sudoku'
import { chain, compact, findIndex, isEqual, times, uniq, uniqWith } from 'lodash-es'
import { constraintDefinitions } from './definitions'
import { CellErrorSet, ConstraintDefinition, ConstraintValidationResult } from './types'
import { ConstraintEditorState } from './editorState'
import { diagonalsConstraint } from './diagonal/diagonals'

export const UNKNOWN_VALIDATION_RESULT: ConstraintValidationResult = ({
  type: 'unknown',
  message: 'N/A',
})

type ConstraintPresentation = Pick<ConstraintDefinition, 'icon' | 'description'>

export const detectNormalizedConstraintPresentations = (constraints: SudokuConstraints): ConstraintPresentation[] => {
  const constraintTypes = detectConstraints(constraints).constraintTypes

  const hasDiagonals = constraintTypes.includes(ConstraintType.PrimaryDiagonal) &&
    constraintTypes.includes(ConstraintType.SecondaryDiagonal)

  const constraintPresentations: ConstraintPresentation[] = constraintTypes
    .filter(
      constraintType => (
        !hasDiagonals || (
          constraintType !== ConstraintType.PrimaryDiagonal &&
          constraintType !== ConstraintType.SecondaryDiagonal
        )
      )
    )
    .map(
      constraintType => ({
        icon: constraintDefinitions[constraintType].icon,
        description: constraintDefinitions[constraintType].description,
      })
    )

  // Combine diagonals into a single rule
  if (hasDiagonals) {
    constraintPresentations.push({
      icon: diagonalsConstraint.icon,
      description: diagonalsConstraint.description,
    } satisfies ConstraintPresentation)
  }

  return constraintPresentations
}

export const detectConstraintIcons = (constraints: SudokuConstraints) => (
  detectNormalizedConstraintPresentations(constraints)
    .filter(({ icon }) => icon !== null)
    .map(
      constraintPresentation => constraintPresentation.icon
    )
)

const getVariant = (constraintTypes: ConstraintType[], constraints: SudokuConstraints): SudokuVariant => {
  const variants = uniq(
    constraintTypes
      .map(constraintType => constraintDefinitions[constraintType].variant({ constraints }))
      .filter(variant => variant !== SudokuVariant.Classic)
  )

  if (variants.length === 1) {
    return variants[0]
  } else if (variants.length > 1) {
    return SudokuVariant.Mixed
  } else {
    return SudokuVariant.Classic
  }
}

export interface ConstraintsCheckResult {
  variant: SudokuVariant
  constraintTypes: ConstraintType[]
}

// TODO: usually we either want type or just the variant; so maybe expose a function (constraints) => variant?
export const detectConstraints = (constraints: SudokuConstraints | null): ConstraintsCheckResult => {
  if (constraints === null) {
    return {
      variant: SudokuVariant.Classic,
      constraintTypes: [],
    }
  }

  const constraintTypes = Object.keys(constraintDefinitions).filter(
    constraintType => constraintDefinitions[constraintType as ConstraintType].isActiveInConstraints({ constraints })
  ) as ConstraintType[]

  const variant = getVariant(constraintTypes, constraints)

  return {
    variant,
    constraintTypes,
  }
}

export const regionsCellPeers = (regions: Region[], cell: CellPosition) => {
  const regionPeers = regions.filter(region => region.find(regionCell => isEqual(regionCell, cell)))
  return uniqWith(regionPeers.flat(), isEqual)
}

const areAdjacent8 = (cell1: CellPosition, cell2: CellPosition) => {
  return Math.abs(cell1.row - cell2.row) <= 1 &&
         Math.abs(cell1.col - cell2.col) <= 1
}

const areAdjacent4 = (cell1: CellPosition, cell2: CellPosition) => {
  return Math.abs(cell1.row - cell2.row) + Math.abs(cell1.col - cell2.col) === 1
}

const isCellInPath = (path: CellPosition[], cell: CellPosition) => (
  path.find(pathCell => isEqual(pathCell, cell))
)

export const expandsPath = (path: CellPosition[], cell: CellPosition) => {
  if (path.length === 0) {
    return true
  }

  if (isCellInPath(path, cell)) {
    return false
  }

  const lastCell = path[path.length - 1]
  return areAdjacent8(lastCell, cell)
}

const expandsArea = (area: CellPosition[], cell: CellPosition, areAdjacent: (c1: CellPosition, c2: CellPosition) => boolean) => {
  if (area.length === 0) {
    return true
  }

  if (isCellInPath(area, cell)) {
    return false
  }

  return area.some(areaCell => areAdjacent(areaCell, cell))
}

export const expandsArea4 = (area: CellPosition[], cell: CellPosition) => expandsArea(area, cell, areAdjacent4)

export const expandsArea8 = (area: CellPosition[], cell: CellPosition) => expandsArea(area, cell, areAdjacent8)

export const cellToString = (cell: CellPosition) => `R${cell.row}C${cell.col}`

export const deduplicateErrorSets = (errorSets: CellErrorSet[]): CellErrorSet[] => (
  chain(errorSets)
    .groupBy(errorSet => cellToString(errorSet.cell))
    .toPairs()
    .map(([_, errorSetsGroup]) => ({
      cell: errorSetsGroup[0].cell,
      errorSet: uniq(errorSetsGroup.flatMap(errorSet => errorSet.errorSet)),
    } as CellErrorSet))
    .value()
)

export const getErrorsSetsInRegions = (regions: Region[], valuesGrid: Grid, cellMarksGrid: CellMarks[][]) => {
  const errorSets: CellErrorSet[] = []

  for (const region of regions) {
    const valueCounts: Record<number, number> = {}
    for (const { row, col } of region) {
      const value = valuesGrid[row][col]
      if (!value) {
        continue
      }
      valueCounts[value] = (valueCounts[value] || 0) + 1
    }
    for (const { row, col } of region) {
      const value = valuesGrid[row][col]
      const errorSet = []
      if (value) {
        if (valueCounts[value] > 1) {
          errorSet.push(value)
        }
      } else {
        const marks = Object.values(cellMarksGrid[row][col]).flat()
        const markErrors = marks.filter(mark => valueCounts[mark] > 0)
        errorSet.push(...markErrors)
      }
      if (errorSet.length > 0) {
        errorSets.push({
          cell: { row, col },
          errorSet,
        })
      }
    }
  }

  return deduplicateErrorSets(errorSets)
}

export type CellValueComparator = (a: number, b: number) => boolean

export const CellValueComparatorEqual: CellValueComparator = (a: number, b: number) => a === b
export const CellValueComparatorNotEqual: CellValueComparator = (a: number, b: number) => a !== b

export const getErrorSetsBetween = (
  cell: CellPosition, peer: CellPosition, valueComparator: CellValueComparator,
  valuesGrid: Grid, cellMarksGrid: CellMarks[][], 
): CellErrorSet[] => {
  const errorSets: CellErrorSet[] = []

  const cellValue = valuesGrid[cell.row][cell.col]
  const peerValue = valuesGrid[peer.row][peer.col]

  if (cellValue) {
    const peerValues = compact([
      peerValue,
      ...Object.values(cellMarksGrid[peer.row][peer.col]).flat(),
    ])
    const errorSet = peerValues.filter(peerValue => valueComparator(cellValue, peerValue))
    if (errorSet.length > 0) {
      errorSets.push({
        cell: peer,
        errorSet,
      })
    }
  }

  if (peerValue) {
    const cellValues = compact([
      cellValue,
      ...Object.values(cellMarksGrid[cell.row][cell.col]).flat(),
    ])
    const errorSet = cellValues.filter(cellValue => valueComparator(peerValue, cellValue))
    if (errorSet.length > 0) {
      errorSets.push({
        cell,
        errorSet,
      })
    }
  }

  return errorSets
}

export function removeConstraintFromArray<T>(
  constraintArray: T[] | undefined,
  isSelectedCell: (otherCell: CellPosition) => boolean,
  constraintToRegion: (constraint: T) => Region,
  constraintFilter?: (constraint: T) => boolean,
): void

export function removeConstraintFromArray(
  constraintArray: Region[] | undefined,
  isSelectedCell: (otherCell: CellPosition) => boolean,
): void

export function removeConstraintFromArray<T>(
  constraintArray: T[] | undefined,
  isSelectedCell: (otherCell: CellPosition) => boolean,
  constraintToRegion: (constraint: T) => Region = (constraint: T) => constraint as Region,
  constraintFilter?: (constraint: T) => boolean,
) {
  const index = findIndex(constraintArray, constraint => (
    (constraintFilter?.(constraint) ?? true) && constraintToRegion(constraint).some(isSelectedCell)
  ))
  if (index !== -1) {
    constraintArray?.splice(index, 1)
  }
}

export function ensureTargetItem<T>(
  constraint: T[],
  editorState: ConstraintEditorState,
  create: () => T,
) {
  if (editorState.targetIndex === undefined || constraint === undefined) {
    constraint.push(create())
    editorState.targetIndex = constraint.length - 1
  }

  return constraint[editorState.targetIndex]
}

export function ensureTargetArray<T>(
  constraint: T[][],
  editorState: ConstraintEditorState,
  create = () => [] as T[],
) {
  return ensureTargetItem(constraint, editorState, create)
}

const ADJACENT_ROW_DELTA = [ 0, 0, 1, -1 ]
const ADJACENT_COL_DELTA = [ 1, -1, 0, 0 ]
export const getAdjacentPeers = (cell: CellPosition, gridSize: number, checkBounds = true) => {
  const peers: CellPosition[] = []
  times(4, dir => {
    const peer = {
      row: cell.row + ADJACENT_ROW_DELTA[dir],
      col: cell.col + ADJACENT_COL_DELTA[dir],
    }
    if (checkBounds && (peer.row < 0 || peer.row >= gridSize || peer.col < 0 || peer.col >= gridSize)) {
      return
    }
    peers.push(peer)
  })
  return peers
}
