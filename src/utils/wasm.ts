import { SolvedState, SudokuConstraints, wasm_check_solved, wasm_logical_hint } from 'lisudoku-solver'
import { Grid } from 'src/types/sudoku'

export const checkSolved = (constraints: SudokuConstraints, grid: Grid): SolvedState => {
  return wasm_check_solved(constraints, grid.map(row => row.map(cell => cell ?? 0)))
}

export const logicalHint = (constraints: SudokuConstraints) => {
  return wasm_logical_hint(constraints)
}
