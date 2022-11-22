import _ from 'lodash'
import Button from '../Button'
import { Grid, SudokuConstraints } from 'src/types/sudoku'
import { wasm_check_solved } from 'lisudoku-solver'
import { gridIsFull } from 'src/utils/sudoku'

const checkSudoku = (grid: Grid, constraints: SudokuConstraints) => {
  const wasm_constraints = _.mapKeys(constraints, (_value, key) => _.snakeCase(key))
  const wasm_grid = {
    values: grid,
  }
  console.log(wasm_check_solved(wasm_constraints, wasm_grid))
}

const CheckButton = ({ grid, constraints }: { grid: Grid, constraints: SudokuConstraints }) => {
  const handleClick = () => {
    checkSudoku(grid, constraints)
  }

  const disabled = !gridIsFull(grid)
  return (
    <Button color={disabled ? 'gray' : 'green'}
            disabled={disabled}
            onClick={handleClick}
    >
      Check
    </Button>
  )
}

export default CheckButton
