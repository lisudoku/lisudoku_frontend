import _ from 'lodash'
import { Select, Option } from '../Select'
import { SudokuVariant } from 'src/types/sudoku'
import { SudokuVariantDisplay } from 'src/utils/constants'

const VariantSelect = ({ value, onChange }: VariantSelectProps) => (
  <Select value={value} onChange={onChange} label="Variant">
    {_.values(SudokuVariant).map(value => (
      <Option key={value} value={value}>{SudokuVariantDisplay[value]}</Option>
    ))}
  </Select>
)

type VariantSelectProps = {
  value: SudokuVariant,
  onChange: Function,
}

export default VariantSelect
