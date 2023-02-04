import {
  wasm_check_solved, wasm_intuitive_solve, wasm_brute_solve, wasm_intuitive_hint,
} from 'lisudoku-solver'
import { Grid, SudokuConstraints } from 'src/types/sudoku'
import { SudokuBruteSolveResult, SudokuIntuitiveSolveResult } from 'src/types/wasm'
const jcc = require('json-case-convertor')

const computeWasmConstraints = (constraints: SudokuConstraints) => {
  const wasmConstraints = jcc.snakeCaseKeys(constraints)
  // Some puzzles may not have some fields because they didn't exist yet
  wasmConstraints.thermos ||= []
  wasmConstraints.kropki_dots ||= []
  wasmConstraints.killer_cages ||= []
  wasmConstraints.extra_regions ||= []
  wasmConstraints.kropki_negative ||= false
  wasmConstraints.primary_diagonal ||= false
  wasmConstraints.secondary_diagonal ||= false
  wasmConstraints.anti_knight ||= false
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
  const solution: SudokuBruteSolveResult = wasm_brute_solve(wasmConstraints)
  return solution
}

export const intuitiveSolve = (constraints: SudokuConstraints) => {
  const wasmConstraints = computeWasmConstraints(constraints)
  const solution: SudokuIntuitiveSolveResult = wasm_intuitive_solve(wasmConstraints)
  return solution
}

export const intuitiveHint = (constraints: SudokuConstraints) => {
  const wasmConstraints = computeWasmConstraints(constraints)
  const solution: SudokuIntuitiveSolveResult = wasm_intuitive_hint(wasmConstraints)
  return solution
}
