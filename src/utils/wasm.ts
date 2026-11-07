import {
  GridCheckResult,
  SudokuConstraints,
  checkSolved as wasmCheckSolved,
  logicalSolve as wasmLogicalSolve,
  availableTechniques,
} from 'lisudoku-solver'
import { Grid } from 'src/types/sudoku'
export { bruteSolve, logicalHint } from 'lisudoku-solver'

export const checkSolved = (constraints: SudokuConstraints, grid: Grid): GridCheckResult => {
  return wasmCheckSolved(constraints, grid.map(row => row.map(cell => cell ?? 0)))
}

export const logicalSolve = (constraints: SudokuConstraints) => {
  return wasmLogicalSolve(constraints, availableTechniques())
}
