import { wasm_check_solved, wasm_intuitive_solve, wasm_brute_solve } from 'lisudoku-solver'
import { Grid, SudokuConstraints } from 'src/types/sudoku'
const jcc = require('json-case-convertor')

const computeWasmConstraints = (constraints: SudokuConstraints) => {
  const wasmConstraints = jcc.snakeCaseKeys(constraints)
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
  console.info('Request brute solve', wasmConstraints)
  const solution = wasm_brute_solve(wasmConstraints)
  return solution
}

export const intuitiveSolve = (constraints: SudokuConstraints) => {
  const wasmConstraints = computeWasmConstraints(constraints)
  const solution = wasm_intuitive_solve(wasmConstraints)
  return solution
}
