import _ from 'lodash'
import { wasm_check_solved } from 'lisudoku-solver'
import { Grid, SudokuConstraints } from 'src/types/sudoku'

export const checkSolved = (constraints: SudokuConstraints, grid: Grid) => {
  const wasm_constraints = _.mapKeys(constraints, (_value, key) => _.snakeCase(key))
  wasm_constraints.thermos ||= []
  const wasm_grid = {
    values: grid,
  }
  return wasm_check_solved(wasm_constraints, wasm_grid)
}
