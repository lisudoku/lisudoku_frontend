import _ from 'lodash'
import { SudokuConstraints } from 'src/types/constraints'
import { wasm_check_solved } from 'lisudoku-solver'

const checkSudoku = (grid: number[][], constraints: SudokuConstraints) => {
  const wasm_constraints = _.mapKeys(constraints, (_value, key) => _.snakeCase(key))
  const wasm_grid = {
    values: grid,
  }
  console.log(wasm_check_solved(wasm_constraints, wasm_grid))
}

const CheckButton = ({ grid, constraints }: { grid: number[][], constraints: SudokuConstraints }) => {
  const handleClick = () => {
    checkSudoku(grid, constraints)
  }

  return (
    <button className="border ml-5" onClick={handleClick}>Check</button>
  )
}

export default CheckButton
