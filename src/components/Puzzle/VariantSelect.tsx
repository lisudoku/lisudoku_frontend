import _ from 'lodash'
import { Select, Option } from '../Select'
import { SudokuVariant } from 'src/types/sudoku'
import { SudokuVariantDisplay } from 'src/utils/constants'

const VariantSelect = ({ value, onChange, label }: VariantSelectProps) => (
  <Select value={value} onChange={onChange} label={label} disabled>
    {_.values(SudokuVariant).map(value => (
      <Option key={value} value={value}>{SudokuVariantDisplay[value]}</Option>
    ))}
  </Select>
)

VariantSelect.defaultProps = {
  label: 'Variant',
}

type VariantSelectProps = {
  value: SudokuVariant,
  label: string,
  onChange: Function,
}

export default VariantSelect
