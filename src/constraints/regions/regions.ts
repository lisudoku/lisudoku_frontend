import type { CellPosition, Region, SudokuConstraints } from 'lisudoku-solver'
import type { ConstraintDefinition } from '../types'
import { regionsGraphics } from './graphics'
import { isEqual, times } from 'lodash-es'
import { ensureDefaultRegions, regionGridToRegions } from 'src/utils/sudoku'
import { SudokuVariant } from 'src/types/sudoku'
import { getErrorsSetsInRegions, regionsCellPeers, UNKNOWN_VALIDATION_RESULT } from '../utils'

const getRowCells = (row: number, gridSize: number): CellPosition[] => (
  times(gridSize, col => ({ row, col }))
)
const getColCells = (col: number, gridSize: number): CellPosition[] => (
  times(gridSize, row => ({ row, col }))
)

const getRegions = (constraints: SudokuConstraints): Region[] => [
  ...times(constraints.gridSize).map(row => getRowCells(row, constraints.gridSize)),
  ...times(constraints.gridSize).map(col => getColCells(col, constraints.gridSize)),
  ...(constraints.regions ?? []),
]

export const regionsConstraint: ConstraintDefinition = {
  icon: null,
  label: 'Regions',
  description: ({ constraints: { gridSize }}) =>
    `Place a digit from 1 to ${gridSize} in each of the empty cells so ` +
    'that each digit appears exactly once in each row, column and outlined region.',
  isGlobal: false,
  isActiveInConstraints: () => true,
  variant: ({ constraints }) => (
    isEqual(constraints.regions, ensureDefaultRegions(constraints.gridSize))
      ? SudokuVariant.Classic
      : SudokuVariant.Irregular
  ),
  graphics: regionsGraphics,
  cellPeers: ({ constraints, cell }) => {
    const regions = getRegions(constraints)
    return regionsCellPeers(regions, cell)
  },
  errors: ({ valuesGrid, constraints, cellMarksGrid }) => {
    const regions = getRegions(constraints)
    const errorSets = getErrorsSetsInRegions(regions, valuesGrid, cellMarksGrid)
    return errorSets
  },
  removeConstraintsAtCell: () => {},
  expandCurrentConstraintAtCell: () => false,
  validateCurrentConstraint: () => UNKNOWN_VALIDATION_RESULT,
  prepareCurrentConstraint: ({ constraints, editorState }) => {
    if (!editorState.regionsGrid) {
      return null
    }

    return {
      newConstraints: {
        ...constraints,
        regions: regionGridToRegions(constraints.gridSize, editorState.regionsGrid)
      }
    }
  },
}
