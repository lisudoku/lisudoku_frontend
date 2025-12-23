import { values } from 'lodash-es'
import { Select, Option } from '../../design_system/Select'
import { SudokuDifficulty } from 'src/types/sudoku'
import { SudokuDifficultyDisplay } from 'src/utils/constants'

const DifficultySelect = ({ value, onChange }: DifficultySelectProps) => (
  <Select value={value} onChange={onChange} label="Difficulty">
    {values(SudokuDifficulty).map(value => (
      <Option key={value} value={value}>{SudokuDifficultyDisplay[value]}</Option>
    ))}
  </Select>
)

type DifficultySelectProps = {
  value: SudokuDifficulty,
  onChange: Function,
}

export default DifficultySelect
