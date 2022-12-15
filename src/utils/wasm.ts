import _ from 'lodash'
import { wasm_check_solved, wasm_intuitive_solve, wasm_brute_solve } from 'lisudoku-solver'
import { Grid, SudokuConstraints } from 'src/types/sudoku'

const computeWasmConstraints = (constraints: SudokuConstraints) => {
  const wasmConstraints = _.mapKeys(constraints, (_value, key) => _.snakeCase(key))
  wasmConstraints.thermos ||= []
  return wasmConstraints
}

export const checkSolved = (constraints: SudokuConstraints, grid: Grid) => {
  const wasmConstraints = computeWasmConstraints(constraints)
  const wasmGrid = {
    values: grid,
  }
  return wasm_check_solved(wasmConstraints, wasmGrid)
}

export const bruteSolve = (constraints: SudokuConstraints) => {
  const wasmConstraints = computeWasmConstraints(constraints)
  const solution = wasm_brute_solve(wasmConstraints)
  return solution
}

export const intuitiveSolve = (constraints: SudokuConstraints) => {
  const wasmConstraints = computeWasmConstraints(constraints)
  const solution = wasm_intuitive_solve(wasmConstraints)
  return solution
}
