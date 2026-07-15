import type { CellPosition, SudokuConstraints } from 'lisudoku-solver'
import type { ReactNode } from 'react'
import { CellMarks, Grid, SudokuVariant } from 'src/types/sudoku'
import { ConstraintEditorState } from './editorState'

interface ConstraintContext {
  constraints: SudokuConstraints
}

interface ConstraintWithCellContext extends ConstraintContext {
  cell: CellPosition
}

export type CellErrors = number[] | undefined

interface GraphicsContext extends ConstraintContext {
  gridSize: number
  cellSize: number
  fixedNumbersGrid: Grid
  grid?: Grid
  errorGrid: CellErrors[][]
}

interface ErrorsContext extends ConstraintContext {
  valuesGrid: Grid
  cellMarksGrid: CellMarks[][]
}

interface ConstraintWithSelectedCellContext extends ConstraintWithCellContext {
  isSelectedCell: (otherCell: CellPosition) => boolean
}

interface ConstraintEditContext extends ConstraintWithSelectedCellContext {
  editorState: ConstraintEditorState
}

interface ConstraintValidatorContext extends ConstraintContext {
  editorState: ConstraintEditorState
}

export interface CellErrorSet {
  cell: CellPosition
  errorSet: number[]
}

export interface ConstraintValidationResult {
  type:
    // There is a current constraint that is valid to be committed
    | 'success'
    // The current constraint is invalid, but don't display an error (empty state usually)
    | 'info'
    // The current constraint is present and invalid
    | 'error'
    // Invalid state, not applicable, constraint not found
    | 'unknown'
  message: string
}

export interface ConstraintPreparationResult {
  newEditorState?: ConstraintEditorState
  newConstraints?: SudokuConstraints
}

export interface ConstraintDefinition {
  // Icon used in rules list, puzzle card, variant
  icon: ReactNode | null
  // Label used in builder UI
  label: string
  // User friendly description of constraint rule
  description: ((ctx: ConstraintContext) => string) | null
  // True if constraint is just a flag
  isGlobal: boolean
  // True if constraint is truthy in passed constraints
  isActiveInConstraints: (ctx: ConstraintContext) => boolean
  // The variant that this constraint belongs to
  variant: (ctx: ConstraintContext) => SudokuVariant
  // Component that draws constraint on grid
  graphics: (ctx: GraphicsContext) => ReactNode
  // Returns list of cells that are the passed cell's peers using constraint
  cellPeers: (ctx: ConstraintWithCellContext) => CellPosition[]
  // Returns list of errors in the grid caused by constraint
  // Assumes that the constraint is active
  errors: (ctx: ErrorsContext) => CellErrorSet[]
  // Validates whether last added constraint is valid to be committed
  validateCurrentConstraint: (ctx: ConstraintValidatorContext) => ConstraintValidationResult
  // Formats and normalizes current constraint before committing it
  // Applies to constraints that are not built step by step (e.g. extra regions)
  prepareCurrentConstraint: (ctx: ConstraintValidatorContext) => ConstraintPreparationResult | null
  // Removes constraints of current type from cell
  removeConstraintsAtCell: (ctx: ConstraintWithSelectedCellContext) => void
  // Attempts to expand current constraint to specified cell
  expandCurrentConstraintAtCell: (ctx: ConstraintEditContext) => boolean
}
