import { wasm_check_solved, wasm_logical_hint } from 'lisudoku-solver'
import { Grid, SudokuConstraints } from 'src/types/sudoku'
import { SudokuLogicalSolveResult } from 'src/types/wasm'
import { snakeCaseKeys } from './json'

export const computeWasmConstraints = (constraints: SudokuConstraints) => {
  const wasmConstraints = snakeCaseKeys(constraints)
  // Some puzzles may not have some fields because they didn't exist yet
  wasmConstraints.thermos ||= []
  wasmConstraints.arrows ||= []
  wasmConstraints.kropki_dots ||= []
  wasmConstraints.killer_cages ||= []
  wasmConstraints.extra_regions ||= []
  wasmConstraints.odd_cells ||= []
  wasmConstraints.even_cells ||= []
  wasmConstraints.kropki_negative ||= false
  wasmConstraints.primary_diagonal ||= false
  wasmConstraints.secondary_diagonal ||= false
  wasmConstraints.anti_knight ||= false
  wasmConstraints.anti_king ||= false
  wasmConstraints.top_bottom ||= false
  return wasmConstraints
}

export const checkSolved = (constraints: SudokuConstraints, grid: Grid): boolean => {
  const wasmConstraints = computeWasmConstraints(constraints)
  const wasmGrid = {
    values: grid,
  }
  return wasm_check_solved(wasmConstraints, wasmGrid)
}

export const logicalHint = (constraints: SudokuConstraints) => {
  const wasmConstraints = computeWasmConstraints(constraints)
  const solution: SudokuLogicalSolveResult = wasm_logical_hint(wasmConstraints)
  return solution
}
