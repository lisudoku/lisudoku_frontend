import _ from 'lodash'
import { Select, Option } from '../Select'
import { SudokuDifficulty } from 'src/types/sudoku'
import { SudokuDifficultyDisplay } from 'src/utils/constants'

const DifficultySelect = () => {
  return (
    <Select value="easy_9x9" label="Difficulty">
      {_.values(SudokuDifficulty).map(value => (
        <Option key={value} value={value}>{SudokuDifficultyDisplay[value]}</Option>
      ))}
    </Select>
  )
}

export default DifficultySelect
